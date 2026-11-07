"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import {
  COUNTRIES,
  ENTITY_ROLES,
  LEGAL_FORMS,
  MARITAL_REGIMES,
  OBJECTIVES,
  PARTNER_CATEGORIES,
  PERSON_LINKS,
  SHARE_SCOPES,
  WEALTH_ORIGINS,
  WITHDRAWAL_DAYS,
  formatBce,
  isValidBce,
} from "@/lib/belgium";
import { getDb } from "@/lib/db";
import { assetCategoryEnum, consents, documents, engagements, entities, holdings, onboardingSteps, persons, relationships } from "@/lib/db/schema";
import { computeFees, DEFAULT_FEE_GRID } from "@/lib/fees";
import { assertMember, requireClient } from "@/lib/session";
import { deleteStored } from "@/lib/storage";
import { ENGAGEMENT_VERSION } from "@/lib/engagement";

export type ActionState = { ok?: boolean; error?: string; message?: string };

const keys = <T extends readonly { key: string }[]>(list: T) => list.map((x) => x.key) as [string, ...string[]];
const countryCodes = COUNTRIES.map(([c]) => c) as unknown as [string, ...string[]];
const bool = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const optText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);

/** Client connecté, membre de la relation transmise par le formulaire. */
async function clientContext(formData: FormData) {
  const user = await requireClient();
  const relationshipId = z.uuid().parse(formData.get("relationshipId"));
  await assertMember(user.id, relationshipId);
  return { user, relationshipId };
}

/** Passe l'étape à « en cours » si elle n'était pas commencée. */
async function touchStep(relationshipId: string, key: string, data?: Record<string, unknown>) {
  const db = getDb();
  const [step] = await db.select().from(onboardingSteps).where(and(eq(onboardingSteps.relationshipId, relationshipId), eq(onboardingSteps.key, key))).limit(1);
  if (!step) return;
  await db
    .update(onboardingSteps)
    .set({ status: step.status === "a_faire" ? "en_cours" : step.status, updatedAt: new Date(), ...(data ? { data: { ...(step.data ?? {}), ...data } } : {}) })
    .where(eq(onboardingSteps.id, step.id));
}

function done(path: string, message: string): ActionState {
  revalidatePath(path);
  revalidatePath("/espace/onboarding");
  return { ok: true, message };
}

const fail = (e: z.ZodError): ActionState => ({ error: e.issues[0]?.message ?? "Formulaire incomplet." });

/* ---------- Profil : personnes ---------- */

const personSchema = z.object({
  firstName: z.string().trim().min(1, "Indiquez le prénom.").max(80),
  lastName: z.string().trim().min(1, "Indiquez le nom.").max(80),
  link: z.enum(keys(PERSON_LINKS)),
  birthDate: z.iso.date("Date de naissance invalide.").optional().or(z.literal("")),
  nationality: z.enum(countryCodes),
  taxResidence: z.enum(countryCodes),
  maritalRegime: z.enum(keys(MARITAL_REGIMES)),
  pep: bool,
  usPerson: bool,
});

export async function addPerson(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = personSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const birthDate = d.birthDate || null;
  const [row] = await getDb()
    .insert(persons)
    .values({ relationshipId, firstName: d.firstName, lastName: d.lastName, link: d.link, birthDate, nationality: d.nationality, taxResidence: d.taxResidence, maritalRegime: d.maritalRegime, pep: d.pep, usPerson: d.usPerson })
    .returning({ id: persons.id });
  await touchStep(relationshipId, "profil");
  await audit(user.id, "personne.ajout", { relationshipId, target: row!.id });
  return done("/espace/onboarding/profil", `${d.firstName} ${d.lastName} a été ajouté(e).`);
}

export async function deletePerson(formData: FormData) {
  const { user, relationshipId } = await clientContext(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb().delete(persons).where(and(eq(persons.id, id), eq(persons.relationshipId, relationshipId)));
  await audit(user.id, "personne.suppression", { relationshipId, target: id });
  revalidatePath("/espace/onboarding/profil");
}

/* ---------- Profil : sociétés ---------- */

const entitySchema = z.object({
  name: z.string().trim().min(2, "Indiquez la dénomination.").max(160),
  legalForm: z.enum(keys(LEGAL_FORMS)),
  country: z.enum(countryCodes),
  bceNumber: z.string().trim().max(20).optional(),
  role: z.enum(keys(ENTITY_ROLES)),
  ownership: optText(300),
});

export async function addEntity(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = entitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  let bce: string | null = null;
  if (d.country === "BE" && d.legalForm !== "etrangere") {
    if (!d.bceNumber) return { error: "Indiquez le numéro d'entreprise (BCE) de la société belge." };
    if (!isValidBce(d.bceNumber)) return { error: "Numéro d'entreprise invalide (format 0123.456.789)." };
    bce = formatBce(d.bceNumber);
  }
  const [row] = await getDb()
    .insert(entities)
    .values({ relationshipId, name: d.name, legalForm: d.legalForm, country: d.country, bceNumber: bce, role: d.role, ownership: d.ownership })
    .returning({ id: entities.id });
  await touchStep(relationshipId, "profil");
  await audit(user.id, "societe.ajout", { relationshipId, target: row!.id });
  return done("/espace/onboarding/profil", `${d.name} a été ajoutée.`);
}

export async function deleteEntity(formData: FormData) {
  const { user, relationshipId } = await clientContext(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb().delete(entities).where(and(eq(entities.id, id), eq(entities.relationshipId, relationshipId)));
  await audit(user.id, "societe.suppression", { relationshipId, target: id });
  revalidatePath("/espace/onboarding/profil");
}

/* ---------- Profil : objectifs ---------- */

const objectivesSchema = z.object({
  objectives: z.array(z.enum(keys(OBJECTIVES))).min(1, "Choisissez au moins un objectif."),
  horizon: z.enum(["moins_5", "5_10", "10_20", "plus_20", "generations"], "Choisissez un horizon."),
  priorities: optText(2000),
  constraints: optText(2000),
});

export async function saveObjectives(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = objectivesSchema.safeParse({ ...Object.fromEntries(formData), objectives: formData.getAll("objectives") });
  if (!parsed.success) return fail(parsed.error);
  await touchStep(relationshipId, "profil", { objectifs: parsed.data });
  await audit(user.id, "profil.objectifs", { relationshipId });
  return done("/espace/onboarding/profil", "Objectifs enregistrés.");
}

/* ---------- Identité et conformité (loi anti-blanchiment du 18 septembre 2017) ---------- */

const complianceSchema = z.object({
  identityMethod: z.enum(["itsme", "eid"], "Choisissez une méthode de vérification."),
  origins: z.array(z.enum(keys(WEALTH_ORIGINS))).min(1, "Indiquez au moins une origine du patrimoine."),
  originDetails: z.string().trim().min(20, "Décrivez en quelques phrases l'origine principale du patrimoine.").max(3000),
  foreignTies: optText(1000),
  declaration: z.literal("on", "Vous devez certifier l'exactitude des informations."),
});

export async function saveCompliance(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = complianceSchema.safeParse({ ...Object.fromEntries(formData), origins: formData.getAll("origins") });
  if (!parsed.success) return fail(parsed.error);
  const { declaration: _d, ...data } = parsed.data;
  void _d;
  await touchStep(relationshipId, "identite", { conformite: { ...data, certifieLe: new Date().toISOString() } });
  await audit(user.id, "conformite.declaration", { relationshipId });
  return done("/espace/onboarding/identite", "Déclaration enregistrée.");
}

/* ---------- Inventaire du patrimoine (déclaratif) ---------- */

const holdingSchema = z.object({
  label: z.string().trim().min(2, "Décrivez l'élément.").max(160),
  category: z.enum(assetCategoryEnum.enumValues),
  institution: optText(120),
  owner: optText(120),
  value: z
    .string()
    .transform((v) => Number(v.replace(/[\s.]/g, "").replace(",", ".")))
    .refine((n) => Number.isFinite(n) && n > 0 && n < 1e12, "Indiquez un montant positif en euros (une dette se saisit dans la catégorie « Crédits et dettes »)."),
});

export async function addClientHolding(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = holdingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const value = d.category === "dettes" ? -d.value : d.value;
  await getDb()
    .insert(holdings)
    .values({ relationshipId, label: d.label, category: d.category, institution: d.institution, owner: d.owner, value: value.toFixed(2), valuedAt: new Date().toISOString().slice(0, 10), source: "declaratif" });
  await touchStep(relationshipId, "patrimoine");
  await audit(user.id, "patrimoine.declaration", { relationshipId, details: { category: d.category } });
  revalidatePath("/espace/onboarding/patrimoine");
  revalidatePath("/espace");
  return { ok: true, message: "Élément ajouté." };
}

/** Le client ne peut retirer que ses propres déclarations, jamais une ligne issue d'un relevé ou d'une expertise. */
export async function deleteClientHolding(formData: FormData) {
  const { user, relationshipId } = await clientContext(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb().delete(holdings).where(and(eq(holdings.id, id), eq(holdings.relationshipId, relationshipId), eq(holdings.source, "declaratif")));
  await audit(user.id, "patrimoine.retrait", { relationshipId, target: id });
  revalidatePath("/espace/onboarding/patrimoine");
  revalidatePath("/espace");
}

/* ---------- Documents ---------- */

export async function deleteClientDocument(formData: FormData) {
  const { user, relationshipId } = await clientContext(formData);
  const id = z.uuid().parse(formData.get("id"));
  const db = getDb();
  const [rel] = await db.select({ status: relationships.status }).from(relationships).where(eq(relationships.id, relationshipId)).limit(1);
  if (rel?.status !== "onboarding") return; // après l'ouverture du dossier, seul le coordinateur peut retirer une pièce
  const [doc] = await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.relationshipId, relationshipId), eq(documents.uploadedBy, user.id)))
    .returning({ key: documents.storageKey });
  if (doc) {
    await deleteStored(doc.key);
    await audit(user.id, "document.retire", { relationshipId, target: id });
  }
  revalidatePath("/espace/onboarding/documents");
  revalidatePath("/espace/documents");
}

/* ---------- Autorisations de partage (RGPD) ---------- */

const consentSchema = z.object({
  partnerCategory: z.enum(keys(PARTNER_CATEGORIES)),
  partnerName: z.string().trim().min(2, "Indiquez le nom du professionnel ou de l'établissement.").max(160),
  scopes: z.array(z.enum(keys(SHARE_SCOPES))).min(1, "Choisissez au moins un type d'information."),
});

export async function grantConsent(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = consentSchema.safeParse({ ...Object.fromEntries(formData), scopes: formData.getAll("scopes") });
  if (!parsed.success) return fail(parsed.error);
  const [row] = await getDb().insert(consents).values({ relationshipId, ...parsed.data, grantedBy: user.id }).returning({ id: consents.id });
  await touchStep(relationshipId, "autorisations");
  await audit(user.id, "consentement.donne", { relationshipId, target: row!.id, details: { partner: parsed.data.partnerName, scopes: parsed.data.scopes } });
  return done("/espace/onboarding/autorisations", `Autorisation enregistrée pour ${parsed.data.partnerName}.`);
}

export async function revokeConsent(formData: FormData) {
  const { user, relationshipId } = await clientContext(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb()
    .update(consents)
    .set({ revokedAt: new Date() })
    .where(and(eq(consents.id, id), eq(consents.relationshipId, relationshipId), isNull(consents.revokedAt)));
  await audit(user.id, "consentement.revoque", { relationshipId, target: id });
  revalidatePath("/espace/onboarding/autorisations");
}

/* ---------- Lettre de mission ---------- */

const engagementSchema = z.object({
  acceptedName: z.string().trim().min(3, "Saisissez vos nom et prénom pour signer.").max(160),
  isConsumer: z.enum(["oui", "non"], "Indiquez à quel titre vous signez."),
  waiveStart: bool,
  read: z.literal("on", "Vous devez confirmer avoir lu la lettre de mission."),
});

export async function acceptEngagement(_p: ActionState, formData: FormData): Promise<ActionState> {
  const { user, relationshipId } = await clientContext(formData);
  const parsed = engagementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
  if (norm(parsed.data.acceptedName) !== norm(user.name)) return { error: `Saisissez votre nom exactement tel qu'il figure sur votre compte : ${user.name}.` };

  const db = getDb();
  const [already] = await db.select({ id: engagements.id }).from(engagements).where(eq(engagements.relationshipId, relationshipId)).limit(1);
  if (already) return { error: "La lettre de mission a déjà été signée." };

  const rows = await db.select({ value: holdings.value }).from(holdings).where(eq(holdings.relationshipId, relationshipId));
  const declared = rows.map((r) => Number(r.value)).filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const fees = computeFees(declared, DEFAULT_FEE_GRID);
  const consumer = parsed.data.isConsumer === "oui";
  const now = new Date();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await db.insert(engagements).values({
    relationshipId,
    version: ENGAGEMENT_VERSION,
    declaredWealth: declared.toFixed(2),
    annualFeeNet: fees.net.toFixed(2),
    vatRate: DEFAULT_FEE_GRID.vatRate.toFixed(4),
    acceptedBy: user.id,
    acceptedName: parsed.data.acceptedName,
    acceptedAt: now,
    ip,
    isConsumer: consumer,
    waivedWithdrawalStart: consumer && parsed.data.waiveStart,
    withdrawalUntil: consumer ? new Date(now.getTime() + WITHDRAWAL_DAYS * 86_400_000) : null,
  });
  await db
    .update(onboardingSteps)
    .set({ status: "termine", updatedAt: now })
    .where(and(eq(onboardingSteps.relationshipId, relationshipId), eq(onboardingSteps.key, "lettre_mission")));
  await audit(user.id, "lettre_mission.signee", { relationshipId, details: { version: ENGAGEMENT_VERSION, declared, fee: fees.net } });
  return done("/espace/onboarding/lettre_mission", "Lettre de mission signée. Merci !");
}
