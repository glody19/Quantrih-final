import "server-only";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, lockActive } from "@/auth";
import { getDb } from "@/lib/db";
import { memberships, relationships, users, type Role } from "@/lib/db/schema";

export type CurrentUser = { id: string; name: string; email: string; role: Role; mfa: boolean };

/**
 * Utilisateur connecté, relu en base à chaque requête : un compte désactivé, bloqué
 * ou dont les sessions ont été révoquées perd l'accès immédiatement.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [u] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!u || !u.active || lockActive(u.lockedAt) || u.sessionVersion !== (session.user.sv ?? 0)) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role, mfa: !!u.totpEnabledAt };
});

export const isStaff = (role: Role) => role !== "client";
export const homeFor = (role: Role) => (isStaff(role) ? "/bureau" : "/espace");
export const MFA_SETUP = "/securite/double-authentification";

/** Connecté, sans exiger la double authentification (page d'activation uniquement). */
export async function requireSignedIn() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/** Connecté ET double authentification active : obligatoire pour tout l'espace client et le bureau. */
export async function requireUser() {
  const user = await requireSignedIn();
  if (!user.mfa) redirect(MFA_SETUP);
  return user;
}

export async function requireClient() {
  const user = await requireUser();
  if (isStaff(user.role)) redirect("/bureau");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaff(user.role)) redirect("/espace");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect(homeFor(user.role));
  return user;
}

/** Relation(s) auxquelles le client a accès. Toute lecture de données client part d'ici. */
export async function getClientRelationships(userId: string) {
  return getDb()
    .select({ id: relationships.id, name: relationships.name, kind: relationships.kind, status: relationships.status, role: memberships.role })
    .from(memberships)
    .innerJoin(relationships, eq(memberships.relationshipId, relationships.id))
    .where(eq(memberships.userId, userId));
}

/** Vérifie côté serveur que l'utilisateur appartient bien à la relation demandée. */
export async function assertMember(userId: string, relationshipId: string) {
  const [row] = await getDb()
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.relationshipId, relationshipId)))
    .limit(1);
  if (!row) throw new Error("Accès refusé à cette relation.");
  return row.role;
}
