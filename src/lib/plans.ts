import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

/**
 * Subscription plans and their limits.
 *
 * The plan is written server side by the Stripe webhook (src/backend/billing.ts, Admin SDK) to
 * users/{uid}/profiles/subscription. The Firestore rules forbid the browser from writing it.
 * Limits are applied in the browser.
 */
export type PlanId = "free" | "premium" | "pro";

export interface PlanLimits {
  /** Portfolios compared in one backtest. */
  maxPortfolios: number;
  /** Longest backtest period in years (Infinity = full history). */
  maxYears: number;
  /** PDF reports per calendar month (Infinity = unlimited). */
  pdfPerMonth: number;
  /** Logo, company and advisor name on the PDF. */
  branding: boolean;
  /** PDF without any Quantrih mention, with the firm's colour. */
  whiteLabel: boolean;
  /** Saved analyses kept in the account. */
  maxSaved: number;
  /** Portfolios shown side by side in the comparison workspace. */
  compareMax: number;
  /** CSV export of saved results and comparisons. */
  csv: boolean;
  /** Notes and tags on saved analyses. */
  notes: boolean;
  /** Fundamental analysis: none, core (statements and key ratios) or full (history, valuation, peers). */
  fundamentals: "none" | "core" | "full";
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxPortfolios: 3, maxYears: 20, pdfPerMonth: 1, branding: false, whiteLabel: false, maxSaved: 5, compareMax: 2, csv: false, notes: false, fundamentals: "none" },
  premium: { maxPortfolios: 7, maxYears: Infinity, pdfPerMonth: 10, branding: true, whiteLabel: false, maxSaved: 100, compareMax: 4, csv: true, notes: true, fundamentals: "core" },
  pro: { maxPortfolios: 15, maxYears: Infinity, pdfPerMonth: Infinity, branding: true, whiteLabel: true, maxSaved: Infinity, compareMax: 8, csv: true, notes: true, fundamentals: "full" },
};

/** Distinct line colours, enough for the largest plan (15 portfolios). */
export const PORTFOLIO_COLORS = [
  "#2c6cad", "#eab308", "#ef4444", "#10b981", "#8b5cf6", "#f97316", "#0f172a", "#ec4899",
  "#14b8a6", "#a16207", "#64748b", "#84cc16", "#9f1239", "#06b6d4", "#1a467a",
];

export const PLAN_PRICES: Record<PlanId, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 15, yearly: 150 },
  pro: { monthly: 40, yearly: 400 },
};

export const PLAN_NAMES: Record<PlanId, string> = { free: "Freemium", premium: "Premium", pro: "Pro" };

const PREVIEW_KEY = "quantrih_plan_preview";

export function readPlanPreview(): PlanId | null {
  try {
    const v = localStorage.getItem(PREVIEW_KEY);
    return v === "free" || v === "premium" || v === "pro" ? v : null;
  } catch {
    return null;
  }
}

/** Admins can look at the site as each plan sees it. */
export function setPlanPreview(p: PlanId | null) {
  try {
    if (p) localStorage.setItem(PREVIEW_KEY, p);
    else localStorage.removeItem(PREVIEW_KEY);
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("quantrih-plan"));
}

/** What the Stripe webhook stores in users/{uid}/profiles/subscription. */
export interface SubscriptionInfo {
  plan: PlanId;
  status: string | null;
  interval: "month" | "year" | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
}

const EMPTY_SUB: SubscriptionInfo = { plan: "free", status: null, interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, hasCustomer: false };

function parseSub(data: any): SubscriptionInfo {
  if (!data) return EMPTY_SUB;
  const p = data.plan;
  return {
    plan: p === "premium" || p === "pro" ? p : "free",
    status: typeof data.status === "string" ? data.status : null,
    interval: data.interval === "month" || data.interval === "year" ? data.interval : null,
    currentPeriodEnd: typeof data.currentPeriodEnd === "number" ? data.currentPeriodEnd : null,
    cancelAtPeriodEnd: !!data.cancelAtPeriodEnd,
    hasCustomer: !!data.customerId,
  };
}

let cache: { uid: string; sub: SubscriptionInfo } | null = null;

/** Current plan of the signed-in member (free for visitors). Updates live when Stripe confirms a payment. */
export function usePlan() {
  const { user, isAdmin } = useAuth();
  const [sub, setSub] = useState<SubscriptionInfo>(() => (user && cache?.uid === user.uid ? cache.sub : EMPTY_SUB));
  const [preview, setPreview] = useState<PlanId | null>(() => readPlanPreview());
  const [loading, setLoading] = useState(!!user && cache?.uid !== user?.uid);

  useEffect(() => {
    const on = () => setPreview(readPlanPreview());
    window.addEventListener("quantrih-plan", on);
    return () => window.removeEventListener("quantrih-plan", on);
  }, []);

  useEffect(() => {
    if (!user) { setSub(EMPTY_SUB); setLoading(false); return; }
    if (cache?.uid === user.uid) { setSub(cache.sub); setLoading(false); }
    const unsub = onSnapshot(
      doc(db, `users/${user.uid}/profiles/subscription`),
      (d) => {
        const next = parseSub(d.exists() ? d.data() : null);
        cache = { uid: user.uid, sub: next };
        setSub(next);
        setLoading(false);
      },
      () => { setSub(EMPTY_SUB); setLoading(false); },
    );
    return () => unsub();
  }, [user]);

  // Admins see everything as Pro unless they preview another plan.
  const plan: PlanId = isAdmin ? (preview || "pro") : sub.plan;
  return { plan, limits: PLAN_LIMITS[plan], loading, isAdmin, signedIn: !!user, subscription: sub };
}

/* ── Monthly PDF counter ─────────────────────────────────────────────── */

const monthKey = () => new Date().toISOString().slice(0, 7);

export async function readPdfUsage(uid: string | undefined): Promise<number> {
  const key = monthKey();
  let local = 0;
  try {
    const v = JSON.parse(localStorage.getItem(`quantrih_pdf_${uid || "guest"}`) || "null");
    if (v && v.month === key) local = v.count || 0;
  } catch { /* storage unavailable */ }
  if (!uid) return local;
  try {
    const d = await getDoc(doc(db, `users/${uid}/profiles/usage`));
    const data: any = d.exists() ? d.data() : null;
    const remote = data && data.month === key ? data.pdf || 0 : 0;
    return Math.max(local, remote);
  } catch {
    return local;
  }
}

export async function addPdfUsage(uid: string | undefined): Promise<number> {
  const n = (await readPdfUsage(uid)) + 1;
  const key = monthKey();
  try { localStorage.setItem(`quantrih_pdf_${uid || "guest"}`, JSON.stringify({ month: key, count: n })); } catch { /* storage unavailable */ }
  if (uid) {
    try { await setDoc(doc(db, `users/${uid}/profiles/usage`), { month: key, pdf: n }, { merge: true }); } catch { /* offline */ }
  }
  return n;
}

/**
 * Shortens a start date so the period fits the plan. Returns the start date to use and
 * whether it was changed. Dates are YYYY-MM-DD strings.
 */
export function clampStartDate(start: string, end: string, maxYears: number): { start: string; clamped: boolean } {
  if (!Number.isFinite(maxYears)) return { start, clamped: false };
  const e = new Date(end);
  const limit = new Date(e.getFullYear() - maxYears, e.getMonth(), 1);
  const s = new Date(start);
  if (s >= limit) return { start, clamped: false };
  const iso = `${limit.getFullYear()}-${String(limit.getMonth() + 1).padStart(2, "0")}-01`;
  return { start: iso, clamped: true };
}
