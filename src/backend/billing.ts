import express, { type Express, type Request, type Response } from "express";
import type Stripe from "stripe";

/**
 * Stripe subscriptions for Quantrih (Premium and Pro, monthly or yearly).
 *
 * Flow:
 *  1. The browser sends its Firebase ID token to /api/billing/checkout with a plan and an interval.
 *  2. The server checks the token, finds or creates the Stripe customer and opens a Checkout session.
 *  3. Stripe calls /api/stripe/webhook. The server writes users/{uid}/profiles/subscription with the
 *     Admin SDK. The Firestore rules forbid the browser from writing that document.
 *  4. Members manage, cancel or resume from the account page (/api/billing/portal, /cancel, /resume).
 *
 * Environment:
 *  STRIPE_SECRET_KEY            sk_live_... or sk_test_...
 *  STRIPE_WEBHOOK_SECRET        whsec_... of the endpoint https://<domain>/api/stripe/webhook
 *  FIREBASE_SERVICE_ACCOUNT     JSON of a Firebase service account (one line, or base64)
 *  APP_URL                      https://quantrih.com (used for return links)
 *  STRIPE_PRICE_PREMIUM_MONTHLY, STRIPE_PRICE_PREMIUM_YEARLY,
 *  STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY   optional: price ids. When missing, the prices
 *                               are found by lookup key, and created on first use if they do not exist.
 */

type PaidPlan = "premium" | "pro";
type Interval = "month" | "year";

const PRICES: Record<PaidPlan, { name: string; description: string; month: number; year: number }> = {
  premium: { name: "Quantrih Premium", description: "7 portefeuilles par backtest, historique complet, 100 analyses enregistrées, 10 rapports PDF par mois.", month: 1500, year: 15000 },
  pro: { name: "Quantrih Pro", description: "15 portefeuilles par backtest, analyses et rapports illimités, marque blanche, états financiers.", month: 4000, year: 40000 },
};

const lookupKey = (plan: PaidPlan, interval: Interval) => `quantrih_${plan}_${interval === "month" ? "monthly" : "yearly"}`;
const envPrice = (plan: PaidPlan, interval: Interval) =>
  process.env[`STRIPE_PRICE_${plan.toUpperCase()}_${interval === "month" ? "MONTHLY" : "YEARLY"}`];

/* ── Lazy clients ─────────────────────────────────────────────────────── */

let stripeClient: Stripe | null = null;
async function getStripe(): Promise<Stripe> {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(503, "billing_not_configured");
  const StripeCtor = (await import("stripe")).default as any;
  stripeClient = new StripeCtor(key, { appInfo: { name: "Quantrih" } }) as Stripe;
  return stripeClient;
}

// Same values as firebase-applet-config.json (kept here so the serverless bundle needs no JSON import).
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0771843165";
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "ai-studio-quantrih-91f81149-24e4-47a1-b17d-c9afaf4efa40";

let adminCache: { auth: any; db: any } | null = null;
async function getAdmin() {
  if (adminCache) return adminCache;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new HttpError(503, "billing_not_configured");
  let creds: any;
  try {
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    creds = JSON.parse(text);
  } catch {
    throw new HttpError(503, "invalid_service_account");
  }
  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");
  const app = getApps().find((a) => a.name === "quantrih-billing") ||
    initializeApp({ credential: cert(creds), projectId: creds.project_id || FIREBASE_PROJECT_ID }, "quantrih-billing");
  adminCache = { auth: getAuth(app), db: getFirestore(app, FIRESTORE_DATABASE_ID) };
  return adminCache;
}

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const appUrl = (req: Request) => {
  const fromEnv = process.env.APP_URL;
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
};

async function requireUser(req: Request) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "sign_in_required");
  const { auth } = await getAdmin();
  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid as string, email: (decoded.email as string) || undefined };
  } catch {
    throw new HttpError(401, "sign_in_required");
  }
}

const subRef = async (uid: string) => (await getAdmin()).db.doc(`users/${uid}/profiles/subscription`);

/* ── Prices ───────────────────────────────────────────────────────────── */

const priceCache = new Map<string, string>();

async function resolvePrice(stripe: Stripe, plan: PaidPlan, interval: Interval): Promise<string> {
  const fixed = envPrice(plan, interval);
  if (fixed) return fixed;
  const key = lookupKey(plan, interval);
  const hit = priceCache.get(key);
  if (hit) return hit;
  const found = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  if (found.data[0]) { priceCache.set(key, found.data[0].id); return found.data[0].id; }

  // First use: create the product (once per plan) and the price.
  const products = await stripe.products.search({ query: `metadata['quantrih_plan']:'${plan}'` }).catch(() => ({ data: [] as Stripe.Product[] }));
  const product = products.data[0] || await stripe.products.create({
    name: PRICES[plan].name,
    description: PRICES[plan].description,
    metadata: { quantrih_plan: plan },
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: PRICES[plan][interval],
    recurring: { interval },
    lookup_key: key,
    transfer_lookup_key: true,
    metadata: { quantrih_plan: plan },
  });
  priceCache.set(key, price.id);
  return price.id;
}

/** Plan for a Stripe price: metadata first, then the lookup key, then the configured ids. */
function planOfPrice(price: Stripe.Price | null | undefined): PaidPlan | null {
  if (!price) return null;
  const m = price.metadata?.quantrih_plan;
  if (m === "premium" || m === "pro") return m;
  const lk = price.lookup_key || "";
  if (lk.startsWith("quantrih_pro")) return "pro";
  if (lk.startsWith("quantrih_premium")) return "premium";
  for (const plan of ["premium", "pro"] as PaidPlan[]) {
    for (const iv of ["month", "year"] as Interval[]) if (envPrice(plan, iv) === price.id) return plan;
  }
  return null;
}

/* ── Customer portal configuration (created once if the account has none) ── */

let portalConfigId: string | null = null;
async function portalConfiguration(stripe: Stripe): Promise<string | undefined> {
  if (process.env.STRIPE_PORTAL_CONFIGURATION) return process.env.STRIPE_PORTAL_CONFIGURATION;
  if (portalConfigId) return portalConfigId;
  const list = await stripe.billingPortal.configurations.list({ active: true, limit: 10 });
  const own = list.data.find((c) => c.metadata?.quantrih === "1") || list.data.find((c) => c.is_default);
  if (own) { portalConfigId = own.id; return own.id; }
  const created = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Quantrih : gérer votre abonnement" },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address", "tax_id", "name"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end", cancellation_reason: { enabled: true, options: ["too_expensive", "missing_features", "unused", "other"] } },
    },
    metadata: { quantrih: "1" },
  });
  portalConfigId = created.id;
  return created.id;
}

/* ── Sync a Stripe subscription to Firestore ──────────────────────────── */

async function writeSubscription(sub: Stripe.Subscription) {
  const uid = sub.metadata?.uid;
  if (!uid) { console.warn("[billing] subscription without uid metadata", sub.id); return; }
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const plan = planOfPrice(price);
  // Access is kept while Stripe still collects (past_due) and until the end of a cancelled period.
  const live = ["active", "trialing", "past_due"].includes(sub.status);
  const ref = await subRef(uid);
  const { FieldValue } = await import("firebase-admin/firestore");
  await ref.set({
    plan: live && plan ? plan : "free",
    paidPlan: plan,
    status: sub.status,
    interval: price?.recurring?.interval || null,
    currentPeriodEnd: item?.current_period_end ? item.current_period_end * 1000 : null,
    cancelAtPeriodEnd: !!sub.cancel_at_period_end || !!sub.cancel_at,
    cancelAt: sub.cancel_at ? sub.cancel_at * 1000 : null,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    subscriptionId: sub.id,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

/** The member's live subscription, checked against Stripe (never trusts the browser). */
async function currentSubscription(stripe: Stripe, uid: string): Promise<Stripe.Subscription | null> {
  const snap = await (await subRef(uid)).get();
  const data = snap.exists ? snap.data() : null;
  if (data?.subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(data.subscriptionId);
      if (sub.metadata?.uid === uid) return sub;
    } catch { /* fall through */ }
  }
  if (data?.customerId) {
    const subs = await stripe.subscriptions.list({ customer: data.customerId, status: "all", limit: 5 });
    return subs.data.find((s) => ["active", "trialing", "past_due"].includes(s.status)) || null;
  }
  return null;
}

async function findOrCreateCustomer(stripe: Stripe, uid: string, email?: string): Promise<string> {
  const ref = await subRef(uid);
  const snap = await ref.get();
  const known = snap.exists ? snap.data()?.customerId : null;
  if (known) return known;
  const found = await stripe.customers.search({ query: `metadata['uid']:'${uid}'` }).catch(() => ({ data: [] as Stripe.Customer[] }));
  const customer = found.data[0] || await stripe.customers.create({ email, metadata: { uid } });
  await ref.set({ customerId: customer.id }, { merge: true });
  return customer.id;
}

/* ── Routes ───────────────────────────────────────────────────────────── */

const send = (res: Response, e: any) => {
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
  console.error("[billing]", e);
  return res.status(500).json({ error: "billing_error", message: e?.message });
};

/** Must be called BEFORE app.use(express.json()) so the webhook keeps the raw body. */
export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !process.env.STRIPE_SECRET_KEY) return res.status(503).send("billing_not_configured");
    let event: Stripe.Event;
    try {
      const stripe = await getStripe();
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? ""));
      event = stripe.webhooks.constructEvent(body, req.headers["stripe-signature"] as string, secret);
    } catch (err: any) {
      console.error("[billing] webhook signature failed:", err?.message);
      return res.status(400).send(`Webhook Error: ${err?.message}`);
    }

    try {
      const stripe = await getStripe();
      switch (event.type) {
        case "checkout.session.completed": {
          const s = event.data.object as Stripe.Checkout.Session;
          if (s.mode === "subscription" && s.subscription) {
            const sub = await stripe.subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id);
            await writeSubscription(sub);
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "customer.subscription.paused":
        case "customer.subscription.resumed": {
          // Re-read so out-of-order events always end on Stripe's latest state.
          const sub = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
          await writeSubscription(sub);
          break;
        }
        case "invoice.payment_failed":
        case "invoice.paid": {
          const inv = event.data.object as any;
          const subId = inv.parent?.subscription_details?.subscription || inv.subscription;
          if (subId) await writeSubscription(await stripe.subscriptions.retrieve(typeof subId === "string" ? subId : subId.id));
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (e: any) {
      console.error("[billing] webhook handling failed:", e);
      // 500 makes Stripe retry later.
      res.status(500).send("webhook_failed");
    }
  });
}

export function registerBillingRoutes(app: Express) {
  /** Whether payment is open on this deployment (keys present). */
  app.get("/api/billing/status", (_req, res) => {
    res.json({ enabled: !!(process.env.STRIPE_SECRET_KEY && process.env.FIREBASE_SERVICE_ACCOUNT) });
  });

  app.post("/api/billing/checkout", async (req, res) => {
    try {
      const plan = req.body?.plan as PaidPlan;
      const interval: Interval = req.body?.interval === "year" ? "year" : "month";
      if (plan !== "premium" && plan !== "pro") throw new HttpError(400, "invalid_plan");
      const lang = req.body?.lang === "en" ? "en" : "fr";
      const { uid, email } = await requireUser(req);
      const stripe = await getStripe();

      // Already subscribed: changing plan goes through the portal, never a second subscription.
      const existing = await currentSubscription(stripe, uid);
      if (existing) {
        const session = await stripe.billingPortal.sessions.create({
          customer: typeof existing.customer === "string" ? existing.customer : existing.customer.id,
          configuration: await portalConfiguration(stripe),
          return_url: `${appUrl(req)}/profile#plan`,
        });
        return res.json({ url: session.url, portal: true });
      }

      const customer = await findOrCreateCustomer(stripe, uid, email);
      const price = await resolvePrice(stripe, plan, interval);
      const base = appUrl(req);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer,
        client_reference_id: uid,
        line_items: [{ price, quantity: 1 }],
        subscription_data: { metadata: { uid, plan } },
        metadata: { uid, plan },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        customer_update: { address: "auto", name: "auto" },
        tax_id_collection: { enabled: true },
        locale: lang,
        success_url: `${base}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/pricing?checkout=cancelled`,
      });
      res.json({ url: session.url });
    } catch (e) { send(res, e); }
  });

  /** After Checkout: sync right away instead of waiting for the webhook. */
  app.post("/api/billing/sync", async (req, res) => {
    try {
      const { uid } = await requireUser(req);
      const stripe = await getStripe();
      const sessionId = req.body?.sessionId;
      if (typeof sessionId === "string" && sessionId.startsWith("cs_")) {
        const s = await stripe.checkout.sessions.retrieve(sessionId);
        if (s.client_reference_id === uid && s.subscription) {
          await writeSubscription(await stripe.subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id));
          return res.json({ ok: true });
        }
      }
      const sub = await currentSubscription(stripe, uid);
      if (sub) await writeSubscription(sub);
      res.json({ ok: true });
    } catch (e) { send(res, e); }
  });

  app.post("/api/billing/portal", async (req, res) => {
    try {
      const { uid, email } = await requireUser(req);
      const stripe = await getStripe();
      const customer = await findOrCreateCustomer(stripe, uid, email);
      const session = await stripe.billingPortal.sessions.create({
        customer,
        configuration: await portalConfiguration(stripe),
        return_url: `${appUrl(req)}/profile#plan`,
      });
      res.json({ url: session.url });
    } catch (e) { send(res, e); }
  });

  /** Cancel at the end of the paid period (the member confirms in the app first). */
  app.post("/api/billing/cancel", async (req, res) => {
    try {
      const { uid } = await requireUser(req);
      const stripe = await getStripe();
      const sub = await currentSubscription(stripe, uid);
      if (!sub) throw new HttpError(404, "no_subscription");
      const updated = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
      await writeSubscription(updated);
      res.json({ ok: true });
    } catch (e) { send(res, e); }
  });

  app.post("/api/billing/resume", async (req, res) => {
    try {
      const { uid } = await requireUser(req);
      const stripe = await getStripe();
      const sub = await currentSubscription(stripe, uid);
      if (!sub) throw new HttpError(404, "no_subscription");
      const updated = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false });
      await writeSubscription(updated);
      res.json({ ok: true });
    } catch (e) { send(res, e); }
  });
}
