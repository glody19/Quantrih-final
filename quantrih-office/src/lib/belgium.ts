/**
 * Référentiels et contrôles propres à la Belgique.
 * Fonctions pures, utilisées côté serveur (validation) et côté client (aide à la saisie). Testées dans tests/belgium.test.ts.
 */

const digits = (s: string) => s.replace(/\D/g, "");

/**
 * Numéro de registre national (NISS) : 11 chiffres AAMMJJ-SSS-CC.
 * Clé = 97 − (9 premiers chiffres mod 97) ; pour les personnes nées à partir de 2000, on préfixe « 2 ».
 * Renvoie la date de naissance déduite (si le mois/jour sont connus) ou null si invalide.
 */
export function parseNiss(input: string): { valid: true; birthDate: string | null } | { valid: false } {
  const n = digits(input);
  if (n.length !== 11) return { valid: false };
  const base = n.slice(0, 9);
  const check = Number(n.slice(9));
  const c1900 = 97 - (Number(base) % 97);
  const c2000 = 97 - (Number(`2${base}`) % 97);
  const century = check === c1900 ? 1900 : check === c2000 ? 2000 : null;
  if (!century) return { valid: false };
  const yy = Number(n.slice(0, 2));
  const mm = Number(n.slice(2, 4));
  const dd = Number(n.slice(4, 6));
  // Mois/jour à 0 ou numéros bis/ter (mois +20/+40) : date non déductible.
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { valid: true, birthDate: null };
  const y = century + yy;
  return { valid: true, birthDate: `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}` };
}

export const formatNiss = (input: string) => {
  const n = digits(input);
  return n.length === 11 ? `${n.slice(0, 2)}.${n.slice(2, 4)}.${n.slice(4, 6)}-${n.slice(6, 9)}.${n.slice(9)}` : input;
};
/** Affichage masqué : seuls les 4 derniers chiffres. */
export const maskNiss = (last4: string) => `••.••.••-•${last4.slice(0, 2)}.${last4.slice(2)}`;

/** Numéro d'entreprise BCE (Banque-Carrefour des Entreprises) : 10 chiffres, commence par 0 ou 1, clé modulo 97. */
export function isValidBce(input: string) {
  let n = digits(input);
  if (n.length === 9) n = `0${n}`; // anciens numéros à 9 chiffres
  if (n.length !== 10 || !/^[01]/.test(n)) return false;
  return 97 - (Number(n.slice(0, 8)) % 97) === Number(n.slice(8));
}
export const formatBce = (input: string) => {
  let n = digits(input);
  if (n.length === 9) n = `0${n}`;
  return n.length === 10 ? `${n.slice(0, 4)}.${n.slice(4, 7)}.${n.slice(7)}` : input;
};

/** IBAN (toutes zones SEPA), contrôle modulo 97 ; un IBAN belge compte 16 caractères. */
export function isValidIban(input: string) {
  const s = input.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  if (s.startsWith("BE") && s.length !== 16) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of numeric) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

export const MARITAL_REGIMES = [
  { key: "celibataire", label: "Célibataire" },
  { key: "communaute_legale", label: "Marié(e) — régime légal (communauté)" },
  { key: "separation_biens", label: "Marié(e) — séparation de biens pure et simple" },
  { key: "separation_acquets", label: "Marié(e) — séparation de biens avec société d'acquêts" },
  { key: "communaute_universelle", label: "Marié(e) — communauté universelle" },
  { key: "cohabitation_legale", label: "Cohabitation légale" },
  { key: "cohabitation_fait", label: "Cohabitation de fait" },
  { key: "divorce", label: "Divorcé(e)" },
  { key: "veuf", label: "Veuf ou veuve" },
] as const;

export const PERSON_LINKS = [
  { key: "titulaire", label: "Titulaire" },
  { key: "conjoint", label: "Conjoint(e) ou partenaire" },
  { key: "enfant", label: "Enfant" },
  { key: "petit_enfant", label: "Petit-enfant" },
  { key: "parent", label: "Parent" },
  { key: "autre", label: "Autre" },
] as const;

export const LEGAL_FORMS = [
  { key: "srl", label: "SRL — société à responsabilité limitée" },
  { key: "sa", label: "SA — société anonyme" },
  { key: "sc", label: "SC — société coopérative" },
  { key: "scomm", label: "SComm — société en commandite" },
  { key: "snc", label: "SNC — société en nom collectif" },
  { key: "societe_simple", label: "Société simple" },
  { key: "fondation_privee", label: "Fondation privée" },
  { key: "asbl", label: "ASBL" },
  { key: "etrangere", label: "Structure étrangère (société, trust, fondation…)" },
] as const;

export const ENTITY_ROLES = [
  { key: "holding", label: "Holding" },
  { key: "operationnelle", label: "Société opérationnelle" },
  { key: "patrimoniale", label: "Société patrimoniale ou de management" },
  { key: "immobiliere", label: "Société immobilière" },
  { key: "autre", label: "Autre" },
] as const;

/** Pays les plus fréquents en premier ; la liste complète n'est pas utile à ce stade. */
export const COUNTRIES = [
  ["BE", "Belgique"], ["FR", "France"], ["LU", "Luxembourg"], ["NL", "Pays-Bas"], ["DE", "Allemagne"], ["CH", "Suisse"],
  ["GB", "Royaume-Uni"], ["ES", "Espagne"], ["IT", "Italie"], ["PT", "Portugal"], ["MC", "Monaco"], ["US", "États-Unis"],
  ["CD", "République démocratique du Congo"], ["MA", "Maroc"], ["AE", "Émirats arabes unis"], ["XX", "Autre pays"],
] as const;
export const countryLabel = (code: string) => COUNTRIES.find(([c]) => c === code)?.[1] ?? code;

/** Origine du patrimoine (questionnaire anti-blanchiment, loi du 18 septembre 2017). */
export const WEALTH_ORIGINS = [
  { key: "revenus_professionnels", label: "Revenus professionnels (salaires, rémunérations de dirigeant)" },
  { key: "cession_entreprise", label: "Cession d'une entreprise ou de parts" },
  { key: "dividendes", label: "Dividendes et revenus d'une société" },
  { key: "succession_donation", label: "Succession ou donation" },
  { key: "immobilier", label: "Vente ou revenus immobiliers" },
  { key: "placements", label: "Plus-values et revenus de placements" },
  { key: "autre", label: "Autre origine" },
] as const;

export const OBJECTIVES = [
  { key: "vision", label: "Avoir une vision claire et consolidée" },
  { key: "fructifier", label: "Faire fructifier le patrimoine" },
  { key: "preserver", label: "Préserver le capital" },
  { key: "transmettre", label: "Préparer la transmission" },
  { key: "ceder", label: "Préparer la cession de mon entreprise" },
  { key: "revenus", label: "Générer des revenus réguliers" },
  { key: "immobilier", label: "Développer un patrimoine immobilier" },
  { key: "pension", label: "Préparer ma pension" },
  { key: "philanthropie", label: "Philanthropie" },
] as const;

/** Catégories de professionnels avec lesquels le client peut autoriser un échange d'informations. */
export const PARTNER_CATEGORIES = [
  { key: "banque", label: "Banque ou gestionnaire agréé (FSMA / BNB)", hint: "Relevés, positions, frais" },
  { key: "notaire", label: "Notaire", hint: "Actes, donations, testaments" },
  { key: "avocat", label: "Avocat", hint: "Structuration, contrats, litiges" },
  { key: "comptable", label: "Expert-comptable ou conseiller fiscal (ITAA)", hint: "Comptes annuels, déclarations fiscales" },
  { key: "assurance", label: "Courtier ou assureur (inscrit FSMA)", hint: "Contrats d'assurance-vie et de prévoyance" },
  { key: "credit", label: "Intermédiaire en crédit (inscrit FSMA)", hint: "Financements, crédits hypothécaires" },
] as const;

export const SHARE_SCOPES = [
  { key: "identite", label: "Identité et coordonnées" },
  { key: "patrimoine", label: "Inventaire du patrimoine" },
  { key: "documents", label: "Documents utiles à la mission" },
  { key: "objectifs", label: "Objectifs et contraintes" },
] as const;

/** Catégories de documents usuels en Belgique. */
export const DOCUMENT_CATEGORIES = [
  { key: "identite", label: "Carte d'identité (eID) ou passeport" },
  { key: "fiscal", label: "Avertissement-extrait de rôle (impôt des personnes physiques)" },
  { key: "releve", label: "Relevés bancaires et de comptes-titres" },
  { key: "assurance", label: "Contrats d'assurance-vie (branche 21, 23, 44) et de pension (épargne-pension, EIP, PLCI)" },
  { key: "immobilier", label: "Actes notariés, avertissement-extrait de rôle du précompte immobilier (revenu cadastral)" },
  { key: "societe", label: "Statuts publiés au Moniteur belge, derniers comptes annuels (BNB), extrait du registre UBO" },
  { key: "credit", label: "Contrats et tableaux d'amortissement de crédit" },
  { key: "famille", label: "Contrat de mariage, déclaration de cohabitation légale, testament, actes de donation" },
  { key: "autre", label: "Autre document" },
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["key"];

/** Liste des pièces demandées selon la situation déclarée (personnes, sociétés, patrimoine). */
export function requiredDocuments(ctx: { persons: number; maritalRegimes: string[]; entities: number; categories: string[] }) {
  const req: { key: DocumentCategory; reason: string }[] = [
    { key: "identite", reason: `Une pièce par personne majeure (${Math.max(ctx.persons, 1)}).` },
    { key: "fiscal", reason: "Le dernier avertissement-extrait de rôle reçu du SPF Finances." },
    { key: "releve", reason: "Le dernier relevé de chaque banque ou compte-titres." },
  ];
  if (ctx.maritalRegimes.some((r) => r.startsWith("separation") || r === "communaute_universelle" || r === "cohabitation_legale"))
    req.push({ key: "famille", reason: "Votre contrat de mariage ou la déclaration de cohabitation légale." });
  if (ctx.entities > 0) req.push({ key: "societe", reason: "Pour chaque société : statuts coordonnés, derniers comptes annuels et extrait UBO." });
  if (ctx.categories.includes("immobilier")) req.push({ key: "immobilier", reason: "Titre de propriété et avertissement-extrait de rôle du précompte immobilier." });
  if (ctx.categories.includes("assurance_vie") || ctx.categories.includes("pension"))
    req.push({ key: "assurance", reason: "Conditions particulières et dernier relevé annuel." });
  if (ctx.categories.includes("dettes")) req.push({ key: "credit", reason: "Contrat et tableau d'amortissement." });
  return req;
}

/** Délai de rétractation de 14 jours pour un contrat de services conclu à distance avec un consommateur (Code de droit économique, livre VI). */
export const WITHDRAWAL_DAYS = 14;
