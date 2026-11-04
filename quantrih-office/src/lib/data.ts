import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { holdings, loginEvents, onboardingSteps } from "@/lib/db/schema";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import type { HoldingRow } from "@/lib/portfolio";

/* Ces fonctions supposent que l'appartenance à la relation a déjà été vérifiée par l'appelant. */

export async function getHoldings(relationshipId: string): Promise<HoldingRow[]> {
  const rows = await getDb().select().from(holdings).where(eq(holdings.relationshipId, relationshipId)).orderBy(asc(holdings.category), desc(holdings.value));
  return rows.map((r) => ({ id: r.id, label: r.label, category: r.category, institution: r.institution, owner: r.owner, value: Number(r.value), valuedAt: r.valuedAt, source: r.source }));
}

export async function getSteps(relationshipId: string) {
  const rows = await getDb().select().from(onboardingSteps).where(eq(onboardingSteps.relationshipId, relationshipId));
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return ONBOARDING_STEPS.map((s) => ({ ...s, status: byKey.get(s.key)?.status ?? "a_faire", updatedAt: byKey.get(s.key)?.updatedAt ?? null }));
}

export async function getRecentLogins(userId: string, limit = 8) {
  return getDb()
    .select({ at: loginEvents.createdAt, success: loginEvents.success, ip: loginEvents.ip, ua: loginEvents.userAgent, reason: loginEvents.reason })
    .from(loginEvents)
    .where(eq(loginEvents.userId, userId))
    .orderBy(desc(loginEvents.createdAt))
    .limit(limit);
}

export function deviceLabel(ua: string | null) {
  if (!ua) return "Appareil inconnu";
  const os = /iPhone|iPad/.test(ua) ? "iPhone ou iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "autre système";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Navigateur";
  return `${browser} sur ${os}`;
}
