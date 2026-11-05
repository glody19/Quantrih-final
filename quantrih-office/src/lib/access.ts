import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { getCurrentUser, isStaff, type CurrentUser } from "@/lib/session";

/** Utilisateur pour une route API : connecté ET double authentification active, sinon null. */
export async function getApiUser() {
  const user = await getCurrentUser();
  return user?.mfa ? user : null;
}

/** L'équipe Quantrih accède à toutes les relations ; un client uniquement à celles dont il est membre. */
export async function canAccessRelationship(user: CurrentUser, relationshipId: string) {
  if (isStaff(user.role)) return true;
  const [row] = await getDb()
    .select({ r: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.relationshipId, relationshipId)))
    .limit(1);
  return !!row;
}
