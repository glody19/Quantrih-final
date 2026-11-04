import "server-only";
import { count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLog, holdings, invitations, leads, memberships, onboardingSteps, relationships, users } from "@/lib/db/schema";

export async function getLeads() {
  return getDb().select().from(leads).orderBy(desc(leads.createdAt)).limit(200);
}

export async function getRelationshipsOverview() {
  const db = getDb();
  const rels = await db.select().from(relationships).orderBy(desc(relationships.createdAt));
  if (!rels.length) return [];
  const ids = rels.map((r) => r.id);
  const [steps, totals] = await Promise.all([
    db.select({ rel: onboardingSteps.relationshipId, status: onboardingSteps.status }).from(onboardingSteps).where(inArray(onboardingSteps.relationshipId, ids)),
    db.select({ rel: holdings.relationshipId, value: holdings.value }).from(holdings).where(inArray(holdings.relationshipId, ids)),
  ]);
  return rels.map((r) => {
    const s = steps.filter((x) => x.rel === r.id);
    const net = totals.filter((t) => t.rel === r.id).reduce((a, t) => a + Number(t.value), 0);
    return { ...r, done: s.filter((x) => x.status === "termine").length, toReview: s.filter((x) => x.status === "en_revue").length, total: s.length, net };
  });
}

export async function getRelationshipDetail(id: string) {
  const db = getDb();
  const [rel] = await db.select().from(relationships).where(eq(relationships.id, id)).limit(1);
  if (!rel) return null;
  const members = await db
    .select({ id: users.id, name: users.name, email: users.email, role: memberships.role, activated: users.passwordHash, mfa: users.totpEnabledAt, lastLoginAt: users.lastLoginAt })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.relationshipId, id));
  return { rel, members: members.map((m) => ({ ...m, activated: !!m.activated, mfa: !!m.mfa })) };
}

export async function getCounts() {
  const db = getDb();
  const [[l], [o], [a], [p]] = await Promise.all([
    db.select({ n: count() }).from(leads).where(eq(leads.status, "nouveau")),
    db.select({ n: count() }).from(relationships).where(eq(relationships.status, "onboarding")),
    db.select({ n: count() }).from(relationships).where(eq(relationships.status, "actif")),
    db.select({ n: count() }).from(onboardingSteps).where(eq(onboardingSteps.status, "en_revue")),
  ]);
  return { newLeads: l?.n ?? 0, onboarding: o?.n ?? 0, active: a?.n ?? 0, toReview: p?.n ?? 0 };
}

export async function getAudit(limit = 100) {
  return getDb()
    .select({ at: auditLog.createdAt, action: auditLog.action, actor: users.name, rel: relationships.name, details: auditLog.details, ip: auditLog.ip })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorId, users.id))
    .leftJoin(relationships, eq(auditLog.relationshipId, relationships.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

export async function pendingInvitation(userId: string) {
  const [row] = await getDb().select({ exp: invitations.expiresAt, used: invitations.usedAt }).from(invitations).where(eq(invitations.userId, userId)).orderBy(desc(invitations.createdAt)).limit(1);
  return row ?? null;
}
