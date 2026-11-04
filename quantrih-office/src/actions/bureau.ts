"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { assetCategoryEnum, holdings, invitations, leadStatusEnum, leads, memberships, onboardingSteps, relationships, stepStatusEnum, users } from "@/lib/db/schema";
import { sendMail } from "@/lib/mail";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { requireStaff } from "@/lib/session";
import { INVITATION_HOURS, newToken } from "@/lib/tokens";

export type BureauState = { ok?: boolean; error?: string; inviteUrl?: string; message?: string };

const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function issueInvitation(userId: string, createdBy: string, email: string, name: string) {
  const db = getDb();
  // Un seul lien valable à la fois : les anciens sont désactivés.
  await db.update(invitations).set({ usedAt: new Date() }).where(and(eq(invitations.userId, userId), isNull(invitations.usedAt)));
  const { token, hash } = newToken();
  await db.insert(invitations).values({ userId, tokenHash: hash, createdBy, expiresAt: new Date(Date.now() + INVITATION_HOURS * 3_600_000) });
  const inviteUrl = `${appUrl()}/invitation/${token}`;
  const mail = await sendMail(
    email,
    "Votre espace Quantrih Office",
    `Bonjour ${name},\n\nVotre espace client Quantrih Office est prêt. Pour choisir votre mot de passe et activer la double authentification, ouvrez ce lien (valable ${INVITATION_HOURS} heures) :\n\n${inviteUrl}\n\nÀ très bientôt,\nQuantrih Office`,
  );
  return { inviteUrl, sent: mail.sent };
}

const createSchema = z.object({
  relationshipName: z.string().trim().min(2, "Nommez la relation (ex. : Famille Dupont).").max(120),
  kind: z.enum(["personne", "foyer", "famille"]),
  name: z.string().trim().min(2, "Indiquez le nom du titulaire.").max(120),
  email: z.email("Adresse e-mail invalide."),
  leadId: z.uuid().optional().or(z.literal("")),
});

/** Crée une relation client, son titulaire, les étapes d'onboarding et un lien d'invitation. */
export async function createClient(_prev: BureauState, formData: FormData): Promise<BureauState> {
  const staff = await requireStaff();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const email = d.email.toLowerCase();
  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "Un compte existe déjà avec cette adresse e-mail." };

  const leadId = d.leadId || null;
  const rel = await db.transaction(async (tx) => {
    const [r] = await tx.insert(relationships).values({ name: d.relationshipName, kind: d.kind, advisorId: staff.id, leadId }).returning();
    const [u] = await tx.insert(users).values({ email, name: d.name, role: "client" }).returning();
    await tx.insert(memberships).values({ userId: u!.id, relationshipId: r!.id, role: "titulaire" });
    await tx.insert(onboardingSteps).values(ONBOARDING_STEPS.map((s) => ({ relationshipId: r!.id, key: s.key })));
    if (leadId) await tx.update(leads).set({ status: "converti" }).where(eq(leads.id, leadId));
    return { relationship: r!, user: u! };
  });
  const inv = await issueInvitation(rel.user.id, staff.id, email, d.name);
  await audit(staff.id, "relation.creee", { relationshipId: rel.relationship.id, target: rel.user.id });
  revalidatePath("/bureau");
  return {
    ok: true,
    inviteUrl: inv.inviteUrl,
    message: inv.sent ? "Relation créée, invitation envoyée par e-mail." : "Relation créée. L'envoi d'e-mail n'est pas configuré : transmettez ce lien au client.",
  };
}

export async function resendInvitation(_prev: BureauState, formData: FormData): Promise<BureauState> {
  const staff = await requireStaff();
  const userId = z.uuid().safeParse(formData.get("userId"));
  if (!userId.success) return { error: "Utilisateur inconnu." };
  const [u] = await getDb().select().from(users).where(eq(users.id, userId.data)).limit(1);
  if (!u || u.role !== "client") return { error: "Utilisateur inconnu." };
  if (u.passwordHash) return { error: "Ce client a déjà activé son compte." };
  const inv = await issueInvitation(u.id, staff.id, u.email, u.name);
  await audit(staff.id, "invitation.renvoyee", { target: u.id });
  return { ok: true, inviteUrl: inv.inviteUrl, message: inv.sent ? "Nouvelle invitation envoyée." : "Nouveau lien créé : transmettez-le au client." };
}

export async function setLeadStatus(formData: FormData) {
  const staff = await requireStaff();
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(leadStatusEnum.enumValues).parse(formData.get("status"));
  await getDb().update(leads).set({ status }).where(eq(leads.id, id));
  await audit(staff.id, "prospect.statut", { target: id, details: { status } });
  revalidatePath("/bureau/prospects");
}

export async function setStepStatus(formData: FormData) {
  const staff = await requireStaff();
  const relationshipId = z.uuid().parse(formData.get("relationshipId"));
  const key = z.string().max(40).parse(formData.get("key"));
  const status = z.enum(stepStatusEnum.enumValues).parse(formData.get("status"));
  const db = getDb();
  await db.update(onboardingSteps).set({ status, updatedAt: new Date() }).where(and(eq(onboardingSteps.relationshipId, relationshipId), eq(onboardingSteps.key, key)));
  if (key === "activation" && status === "termine") await db.update(relationships).set({ status: "actif" }).where(eq(relationships.id, relationshipId));
  await audit(staff.id, "onboarding.etape", { relationshipId, details: { key, status } });
  revalidatePath(`/bureau/clients/${relationshipId}`);
}

const holdingSchema = z.object({
  relationshipId: z.uuid(),
  label: z.string().trim().min(2, "Libellé requis.").max(160),
  category: z.enum(assetCategoryEnum.enumValues),
  institution: z.string().trim().max(120).optional(),
  owner: z.string().trim().max(120).optional(),
  value: z
    .string()
    .transform((v) => Number(v.replace(/\s/g, "").replace(",", ".")))
    .refine((n) => Number.isFinite(n) && Math.abs(n) < 1e13, "Montant invalide."),
  valuedAt: z.iso.date("Date invalide."),
  source: z.enum(["releve", "agregation", "declaratif", "expertise"]),
});

export async function addHolding(_prev: BureauState, formData: FormData): Promise<BureauState> {
  const staff = await requireStaff();
  const parsed = holdingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  await getDb()
    .insert(holdings)
    .values({ ...d, value: d.value.toFixed(2), institution: d.institution || null, owner: d.owner || null });
  await audit(staff.id, "patrimoine.ajout", { relationshipId: d.relationshipId, details: { label: d.label, category: d.category } });
  revalidatePath(`/bureau/clients/${d.relationshipId}`);
  return { ok: true, message: "Élément ajouté." };
}

export async function deleteHolding(formData: FormData) {
  const staff = await requireStaff();
  const id = z.uuid().parse(formData.get("id"));
  const [row] = await getDb().delete(holdings).where(eq(holdings.id, id)).returning({ rel: holdings.relationshipId, label: holdings.label });
  if (row) {
    await audit(staff.id, "patrimoine.suppression", { relationshipId: row.rel, details: { label: row.label } });
    revalidatePath(`/bureau/clients/${row.rel}`);
  }
}
