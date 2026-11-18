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
export * from "./planLimits";
import type { PlanId } from "./planLimits";
import { PLAN_LIMITS } from "./planLimits";

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
