"use server";

import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { AuthError, CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { z } from "zod";
import { LOCK_MINUTES, MAX_ATTEMPTS, signIn, signOut } from "@/auth";
import { audit } from "@/lib/audit";
import { dbConfigured, getDb } from "@/lib/db";
import { invitations, users } from "@/lib/db/schema";
import { passwordProblem } from "@/lib/password";
import { homeFor, requireSignedIn } from "@/lib/session";
import { hashToken } from "@/lib/tokens";
import { decryptText, encryptText, newRecoveryCodes, newTotpSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { CONTACT } from "@/lib/content";

export type FormState = { ok?: boolean; error?: string; email?: string; challenge?: string };

const MESSAGES: Record<string, string> = {
  identifiants: `E-mail ou mot de passe incorrect. Par sécurité, le compte est bloqué ${LOCK_MINUTES} minutes après ${MAX_ATTEMPTS} tentatives échouées.`,
  bloque_client: `Après ${MAX_ATTEMPTS} tentatives échouées, votre compte est bloqué pendant ${LOCK_MINUTES} minutes. Réessayez ensuite, ou écrivez-nous à ${CONTACT.email}.`,
  bloque_equipe: `Après ${MAX_ATTEMPTS} tentatives échouées, votre compte est bloqué pendant ${LOCK_MINUTES} minutes.`,
  trop_tentatives: `Trop de tentatives de connexion depuis votre réseau. Réessayez dans ${LOCK_MINUTES} minutes.`,
  code: "Code incorrect. Saisissez le code à 6 chiffres affiché dans votre application, ou un code de secours.",
  code_expire: "La vérification a expiré. Saisissez à nouveau votre e-mail et votre mot de passe.",
  desactive_client: `L'accès à votre espace est désactivé. Écrivez-nous à ${CONTACT.email}.`,
  desactive_equipe: "Votre accès a été désactivé. Contactez l'administrateur.",
};

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  if (!dbConfigured()) return { error: "L'espace client ouvre prochainement. Votre coordinateur vous enverra votre lien d'accès personnel.", email };
  const challenge = String(formData.get("challenge") ?? "");
  try {
    const fields = challenge ? { challenge, code: String(formData.get("code") ?? "") } : { email, password: formData.get("password") };
    // /aiguillage renvoie ensuite chaque rôle vers son espace (ou vers l'activation de la double authentification).
    await signIn("credentials", { ...fields, redirectTo: "/aiguillage" });
    return { ok: true };
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      if (err.code.startsWith("code_requis:")) return { challenge: err.code.slice("code_requis:".length), email };
      if (err.code === "code") return { error: MESSAGES.code, email, challenge };
      return { error: MESSAGES[err.code] ?? MESSAGES.identifiants, email };
    }
    if (err instanceof AuthError) return { error: MESSAGES.identifiants, email };
    throw err; // la redirection de NextAuth passe par une exception
  }
}

export async function logout() {
  await signOut({ redirectTo: "/connexion?deconnecte=1" });
}

/* ---------- Invitation : création du mot de passe ---------- */

const invitationSchema = z
  .object({ token: z.string().min(20).max(200), password: z.string(), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Les deux mots de passe ne correspondent pas." });

/** Invitation valide (non utilisée, non expirée) : renvoie l'utilisateur concerné. */
export async function findInvitation(token: string) {
  if (!dbConfigured()) return null;
  const [row] = await getDb()
    .select({ id: invitations.id, userId: users.id, email: users.email, name: users.name })
    .from(invitations)
    .innerJoin(users, eq(invitations.userId, users.id))
    .where(and(eq(invitations.tokenHash, hashToken(token)), isNull(invitations.usedAt), gt(invitations.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function acceptInvitation(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = invitationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const inv = await findInvitation(parsed.data.token);
  if (!inv) return { error: "Ce lien d'invitation n'est plus valide. Demandez-en un nouveau à votre coordinateur." };
  const problem = passwordProblem(parsed.data.password, inv.email);
  if (problem) return { error: problem };

  const db = getDb();
  const hash = await bcrypt.hash(parsed.data.password, 12);
  // L'invitation n'est utilisable qu'une fois : on la marque avant tout le reste.
  const used = await db
    .update(invitations)
    .set({ usedAt: new Date() })
    .where(and(eq(invitations.id, inv.id), isNull(invitations.usedAt)))
    .returning({ id: invitations.id });
  if (!used.length) return { error: "Ce lien d'invitation a déjà été utilisé." };
  await db.update(users).set({ passwordHash: hash, failedAttempts: 0, lockedAt: null }).where(eq(users.id, inv.userId));
  await audit(inv.userId, "invitation.acceptee", { target: inv.userId });

  try {
    await signIn("credentials", { email: inv.email, password: parsed.data.password, redirectTo: "/securite/double-authentification" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/connexion");
    throw err;
  }
  return { ok: true };
}

/* ---------- Double authentification obligatoire ---------- */

export async function beginTotp(): Promise<{ error?: string; secret?: string; qr?: string }> {
  const user = await requireSignedIn();
  if (user.mfa) return { error: "La double authentification est déjà active." };
  const secret = newTotpSecret();
  await getDb().update(users).set({ totpSecret: encryptText(secret), totpEnabledAt: null, recoveryCodes: null }).where(eq(users.id, user.id));
  const qr = await QRCode.toDataURL(otpauthUri(secret, user.email), { margin: 1, width: 220, color: { dark: "#0F1E2E", light: "#FFFFFF" } });
  return { secret, qr };
}

export async function confirmTotp(code: string): Promise<{ error?: string; codes?: string[] }> {
  const user = await requireSignedIn();
  const db = getDb();
  const [row] = await db.select({ secret: users.totpSecret, on: users.totpEnabledAt }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row?.secret) return { error: "Recommencez l'activation." };
  if (row.on) return { error: "La double authentification est déjà active." };
  if (!verifyTotp(decryptText(row.secret), code)) return { error: "Code incorrect. Vérifiez l'heure de votre téléphone et réessayez." };
  const { codes, hashes } = newRecoveryCodes();
  await db.update(users).set({ totpEnabledAt: new Date(), recoveryCodes: hashes }).where(eq(users.id, user.id));
  await audit(user.id, "mfa.activee", { target: user.id });
  return { codes };
}

export async function continueAfterMfa() {
  const user = await requireSignedIn();
  redirect(homeFor(user.role));
}
