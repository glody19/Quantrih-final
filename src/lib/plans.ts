import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

/**
 * Subscription plans and their limits.
 *
 * There is no payment system yet: limits are applied in the browser only. Once Stripe is wired,
 * the plan must be written server side (webhook + Admin SDK) to users/{uid}/profiles/subscription
 * and the Firestore rules must forbid the client from writing that document.
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
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxPortfolios: 3, maxYears: 20, pdfPerMonth: 1, branding: false, whiteLabel: false, maxSaved: 5, compareMax: 2, csv: false, notes: false },
  premium: { maxPortfolios: 6, maxYears: Infinity, pdfPerMonth: 10, branding: true, whiteLabel: false, maxSaved: 100, compareMax: 4, csv: true, notes: true },
  pro: { maxPortfolios: 10, maxYears: Infinity, pdfPerMonth: Infinity, branding: true, whiteLabel: true, maxSaved: Infinity, compareMax: 8, csv: true, notes: true },
};

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

let cache: { uid: string; plan: PlanId } | null = null;

/** Current plan of the signed-in member (free for visitors). */
export function usePlan() {
  const { user, isAdmin } = useAuth();
  const [stored, setStored] = useState<PlanId>(() => (user && cache?.uid === user.uid ? cache.plan : "free"));
  const [preview, setPreview] = useState<PlanId | null>(() => readPlanPreview());
  const [loading, setLoading] = useState(!!user && cache?.uid !== user?.uid);

  useEffect(() => {
    const on = () => setPreview(readPlanPreview());
    window.addEventListener("quantrih-plan", on);
    return () => window.removeEventListener("quantrih-plan", on);
  }, []);

  useEffect(() => {
    if (!user) { setStored("free"); setLoading(false); return; }
    if (cache?.uid === user.uid) { setStored(cache.plan); setLoading(false); return; }
    let live = true;
    getDoc(doc(db, `users/${user.uid}/profiles/subscription`))
      .then((d) => {
        const p = d.exists() ? (d.data() as any).plan : null;
        const plan: PlanId = p === "premium" || p === "pro" ? p : "free";
        cache = { uid: user.uid, plan };
        if (live) setStored(plan);
      })
      .catch(() => { if (live) setStored("free"); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [user]);

  // Admins see everything as Pro unless they preview another plan.
  const plan: PlanId = isAdmin ? (preview || "pro") : stored;
  return { plan, limits: PLAN_LIMITS[plan], loading, isAdmin, signedIn: !!user };
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
