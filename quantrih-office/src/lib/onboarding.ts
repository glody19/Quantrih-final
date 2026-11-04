import type { StepStatus } from "@/lib/db/schema";

/** Étapes du parcours d'onboarding visibles par le client (plan §3, étapes 4 à 11). */
export const ONBOARDING_STEPS = [
  { key: "lettre_mission", title: "Lettre de mission", owner: "Vous", description: "Relire la proposition, la grille d'honoraires et la politique de rétrocessions, puis signer électroniquement." },
  { key: "identite", title: "Identité et conformité", owner: "Vous", description: "Vérifier l'identité de chaque personne (itsme ou pièce d'identité), la résidence fiscale et l'origine du patrimoine." },
  { key: "profil", title: "Profil et objectifs", owner: "Vous", description: "Décrire la composition de votre relation (personnes, sociétés), vos objectifs et votre horizon." },
  { key: "patrimoine", title: "Inventaire du patrimoine", owner: "Vous", description: "Recenser comptes, titres, immobilier, participations, assurances et dettes, catégorie par catégorie." },
  { key: "documents", title: "Documents", owner: "Vous", description: "Déposer les pièces demandées selon votre situation : relevés, actes, statuts, contrats." },
  { key: "autorisations", title: "Autorisations et partenaires", owner: "Vous", description: "Choisir les professionnels avec qui nous pouvons échanger, et pour quelles informations." },
  { key: "revue", title: "Revue par Quantrih Office", owner: "Quantrih Office", description: "Contrôle de complétude et de conformité de votre dossier." },
  { key: "activation", title: "Activation et audit patrimonial", owner: "Quantrih Office", description: "Ouverture de votre vision consolidée et rendez-vous de restitution de l'audit." },
] as const;

export type StepKey = (typeof ONBOARDING_STEPS)[number]["key"];

export const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  en_revue: "En revue",
  termine: "Terminé",
};

export function progress(statuses: StepStatus[]) {
  if (!statuses.length) return 0;
  const done = statuses.filter((s) => s === "termine").length;
  return Math.round((done / ONBOARDING_STEPS.length) * 100);
}
