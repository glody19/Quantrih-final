import { auth } from "../firebase";

/** Browser side of the Stripe subscriptions (see src/backend/billing.ts). */

export type BillingInterval = "month" | "year";

async function call(path: string, body: Record<string, unknown> = {}): Promise<any> {
  const user = auth.currentUser;
  if (!user) throw new Error("sign_in_required");
  const token = await user.getIdToken();
  const r = await fetch(`/api/billing/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `http_${r.status}`);
  return data;
}

/** Opens Stripe Checkout (or the portal when the member already has a subscription). */
export async function startCheckout(plan: "premium" | "pro", interval: BillingInterval, lang: "fr" | "en") {
  const { url } = await call("checkout", { plan, interval, lang });
  window.location.assign(url);
}

export async function openBillingPortal() {
  const { url } = await call("portal");
  window.location.assign(url);
}

export const cancelSubscription = () => call("cancel");
export const resumeSubscription = () => call("resume");
export const syncSubscription = (sessionId?: string | null) => call("sync", { sessionId: sessionId || undefined });

export function billingErrorMessage(code: string, lang: "fr" | "en"): string {
  const fr: Record<string, string> = {
    sign_in_required: "Connectez-vous pour souscrire.",
    billing_not_configured: "Le paiement en ligne n'est pas encore activé. Écrivez-nous à contact@quantrih.com.",
    no_subscription: "Aucun abonnement actif n'a été trouvé.",
  };
  const en: Record<string, string> = {
    sign_in_required: "Sign in to subscribe.",
    billing_not_configured: "Online payment is not enabled yet. Write to contact@quantrih.com.",
    no_subscription: "No active subscription was found.",
  };
  const m = lang === "fr" ? fr : en;
  return m[code] || (lang === "fr" ? "Le paiement n'a pas pu démarrer. Réessayez dans un instant." : "Payment could not start. Please try again in a moment.");
}
