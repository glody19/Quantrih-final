import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  date,
} from "drizzle-orm/pg-core";

/*
 * Modèle de données de Quantrih Office (première version, cf. docs/family-office/PLAN-PLATEFORME.md §6).
 * Une « relation client » regroupe une personne seule, un foyer ou une famille élargie avec ses sociétés.
 */

export const roleEnum = pgEnum("role", ["client", "collaborateur", "admin"]);
export type Role = (typeof roleEnum.enumValues)[number];

export const memberRoleEnum = pgEnum("member_role", ["titulaire", "membre", "mandataire"]);
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];

export const relationshipKindEnum = pgEnum("relationship_kind", ["personne", "foyer", "famille"]);
export const relationshipStatusEnum = pgEnum("relationship_status", ["onboarding", "actif", "suspendu", "clos"]);

export const leadStatusEnum = pgEnum("lead_status", ["nouveau", "rdv_planifie", "rdv_fait", "proposition", "converti", "sans_suite"]);
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];

export const stepStatusEnum = pgEnum("step_status", ["a_faire", "en_cours", "en_revue", "termine"]);
export type StepStatus = (typeof stepStatusEnum.enumValues)[number];

export const assetCategoryEnum = pgEnum("asset_category", [
  "liquidites",
  "titres",
  "assurance_vie",
  "immobilier",
  "participations",
  "private_equity",
  "actifs_passion",
  "pension",
  "dettes",
  "autres",
]);
export type AssetCategory = (typeof assetCategoryEnum.enumValues)[number];

export const valueSourceEnum = pgEnum("value_source", ["releve", "agregation", "declaratif", "expertise"]);

/* ---------- Comptes de connexion ---------- */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  /** Vide tant que l'invitation n'a pas été acceptée. */
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull().default("client"),
  active: boolean("active").notNull().default(true),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  /** Clé TOTP chiffrée (AES-256-GCM). La double authentification est obligatoire pour tous. */
  totpSecret: text("totp_secret"),
  totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
  recoveryCodes: jsonb("recovery_codes").$type<string[]>(),
  /** Incrémenté pour fermer toutes les sessions ouvertes. */
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginEvents = pgTable(
  "login_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    success: boolean("success").notNull(),
    reason: text("reason"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_events_ip_idx").on(t.ip, t.createdAt), index("login_events_user_idx").on(t.userId, t.createdAt)],
);

/** Lien d'invitation : seule son empreinte SHA-256 est conservée. */
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Relations clients ---------- */

export const relationships = pgTable("relationships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kind: relationshipKindEnum("kind").notNull().default("personne"),
  status: relationshipStatusEnum("status").notNull().default("onboarding"),
  advisorId: uuid("advisor_id").references(() => users.id, { onDelete: "set null" }),
  leadId: uuid("lead_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Qui a accès à quelle relation, avec quel rôle. Tout accès client passe par cette table. */
export const memberships = pgTable(
  "memberships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("titulaire"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.relationshipId] })],
);

/** Étapes du parcours d'onboarding (cf. plan §3), une ligne par étape et par relation. */
export const onboardingSteps = pgTable(
  "onboarding_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    status: stepStatusEnum("status").notNull().default("a_faire"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("onboarding_steps_rel_key").on(t.relationshipId, t.key)],
);

/** Éléments de patrimoine consolidés (version simple : un montant par ligne, daté et sourcé). */
export const holdings = pgTable(
  "holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    category: assetCategoryEnum("category").notNull(),
    institution: text("institution"),
    owner: text("owner"),
    /** Positif pour un actif, négatif pour une dette. */
    value: numeric("value", { precision: 16, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    valuedAt: date("valued_at").notNull(),
    source: valueSourceEnum("source").notNull().default("declaratif"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("holdings_rel_idx").on(t.relationshipId)],
);

/* ---------- Prospects ---------- */

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  profile: text("profile").notNull(),
  wealthRange: text("wealth_range").notNull(),
  needs: jsonb("needs").$type<string[]>().notNull().default([]),
  message: text("message"),
  source: text("source"),
  status: leadStatusEnum("status").notNull().default("nouveau"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Journal d'audit (non modifiable par l'application) ---------- */

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    target: text("target"),
    relationshipId: uuid("relationship_id"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_rel_idx").on(t.relationshipId, t.createdAt)],
);

/* ---------- Paramètres (grille tarifaire, etc.) ---------- */

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Onboarding détaillé (phase 2) ---------- */

/** Personnes de la relation. Le numéro de registre national est chiffré ; seuls les 4 derniers chiffres sont lisibles. */
export const persons = pgTable(
  "persons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    link: text("link").notNull(),
    birthDate: date("birth_date"),
    nissEncrypted: text("niss_encrypted"),
    nissLast4: text("niss_last4"),
    nationality: text("nationality").notNull().default("BE"),
    taxResidence: text("tax_residence").notNull().default("BE"),
    maritalRegime: text("marital_regime"),
    pep: boolean("pep").notNull().default(false),
    usPerson: boolean("us_person").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("persons_rel_idx").on(t.relationshipId)],
);

/** Sociétés et structures détenues (belges ou étrangères). */
export const entities = pgTable(
  "entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    legalForm: text("legal_form").notNull(),
    country: text("country").notNull().default("BE"),
    bceNumber: text("bce_number"),
    role: text("role").notNull(),
    ownership: text("ownership"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("entities_rel_idx").on(t.relationshipId)],
);

/** Documents déposés : chiffrés (AES-256-GCM) puis stockés dans le stockage privé européen. */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    sha256: text("sha256").notNull(),
    storageKey: text("storage_key").notNull(),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("documents_rel_idx").on(t.relationshipId, t.createdAt)],
);

/** Autorisations de partage d'informations (RGPD) : une ligne par professionnel, révocable. */
export const consents = pgTable(
  "consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => relationships.id, { onDelete: "cascade" }),
    partnerCategory: text("partner_category").notNull(),
    partnerName: text("partner_name").notNull(),
    scopes: jsonb("scopes").$type<string[]>().notNull(),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("consents_rel_idx").on(t.relationshipId)],
);

/** Lettre de mission acceptée : version, base de calcul, preuve d'acceptation, fin du délai de rétractation. */
export const engagements = pgTable("engagements", {
  id: uuid("id").primaryKey().defaultRandom(),
  relationshipId: uuid("relationship_id")
    .notNull()
    .references(() => relationships.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  declaredWealth: numeric("declared_wealth", { precision: 16, scale: 2 }).notNull(),
  annualFeeNet: numeric("annual_fee_net", { precision: 12, scale: 2 }).notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 4 }).notNull(),
  acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
  acceptedName: text("accepted_name").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  ip: text("ip"),
  isConsumer: boolean("is_consumer").notNull().default(true),
  waivedWithdrawalStart: boolean("waived_withdrawal_start").notNull().default(false),
  withdrawalUntil: timestamp("withdrawal_until", { withTimezone: true }),
});
