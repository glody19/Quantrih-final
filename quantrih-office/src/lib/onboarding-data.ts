import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { consents, documents, engagements, entities, onboardingSteps, persons } from "@/lib/db/schema";

/* L'appelant a déjà vérifié l'appartenance à la relation (ou le rôle équipe). */

export async function getPersons(relationshipId: string) {
  return getDb().select().from(persons).where(eq(persons.relationshipId, relationshipId)).orderBy(persons.createdAt);
}
export async function getEntities(relationshipId: string) {
  return getDb().select().from(entities).where(eq(entities.relationshipId, relationshipId)).orderBy(entities.createdAt);
}
export async function getDocuments(relationshipId: string) {
  return getDb().select().from(documents).where(eq(documents.relationshipId, relationshipId)).orderBy(desc(documents.createdAt));
}
export async function getConsents(relationshipId: string, activeOnly = false) {
  return getDb()
    .select()
    .from(consents)
    .where(activeOnly ? and(eq(consents.relationshipId, relationshipId), isNull(consents.revokedAt)) : eq(consents.relationshipId, relationshipId))
    .orderBy(desc(consents.grantedAt));
}
export async function getEngagement(relationshipId: string) {
  const [row] = await getDb().select().from(engagements).where(eq(engagements.relationshipId, relationshipId)).limit(1);
  return row ?? null;
}
export async function getStepData(relationshipId: string, key: string) {
  const [row] = await getDb().select({ data: onboardingSteps.data, status: onboardingSteps.status }).from(onboardingSteps).where(and(eq(onboardingSteps.relationshipId, relationshipId), eq(onboardingSteps.key, key))).limit(1);
  return { data: (row?.data ?? {}) as Record<string, unknown>, status: row?.status ?? "a_faire" };
}
