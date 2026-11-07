import type { HoldingRow } from "@/lib/portfolio";
import type { StepStatus } from "@/lib/db/schema";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

/** Données entièrement fictives pour la démonstration publique de l'espace client. Aucune donnée réelle. */

export const DEMO_USER = { name: "Claire Exemple", email: "demo@quantrih-office.be" };
export const DEMO_RELATIONSHIP = "Famille Exemple";

const d = "2026-09-30";
export const DEMO_HOLDINGS: HoldingRow[] = [
  { id: "h1", label: "Comptes courants et épargne", category: "liquidites", institution: "Banque A", owner: "Claire Exemple", value: 420_000, valuedAt: d, source: "agregation" },
  { id: "h2", label: "Compte-titres", category: "titres", institution: "Banque A", owner: "Claire Exemple", value: 2_450_000, valuedAt: d, source: "releve" },
  { id: "h3", label: "Mandat de gestion", category: "titres", institution: "Banque B", owner: "Exemple Holding SRL", value: 1_380_000, valuedAt: d, source: "releve" },
  { id: "h4", label: "Assurance-vie branche 23", category: "assurance_vie", institution: "Assureur C", owner: "Claire Exemple", value: 650_000, valuedAt: d, source: "releve" },
  { id: "h5", label: "Épargne-pension et EIP", category: "pension", institution: "Assureur C", owner: "Claire Exemple", value: 185_000, valuedAt: d, source: "releve" },
  { id: "h6", label: "Résidence principale, Louvain-la-Neuve", category: "immobilier", institution: null, owner: "Claire Exemple", value: 1_150_000, valuedAt: "2026-03-15", source: "expertise" },
  { id: "h7", label: "Immeuble de rapport, Bruxelles", category: "immobilier", institution: null, owner: "Exemple Holding SRL", value: 980_000, valuedAt: "2026-01-31", source: "declaratif" },
  { id: "h8", label: "Participation Exemple Industries", category: "participations", institution: null, owner: "Exemple Holding SRL", value: 1_600_000, valuedAt: "2025-12-31", source: "declaratif" },
  { id: "h9", label: "Crédit hypothécaire", category: "dettes", institution: "Banque A", owner: "Exemple Holding SRL", value: -520_000, valuedAt: d, source: "releve" },
];

const STATUSES: StepStatus[] = ["termine", "termine", "termine", "en_revue", "en_cours", "a_faire", "a_faire", "a_faire"];
export const DEMO_STEPS = ONBOARDING_STEPS.map((s, i) => ({ ...s, status: STATUSES[i]! }));

export const DEMO_DOCUMENTS = [
  { name: "Avertissement-extrait de rôle 2025.pdf", category: "Fiscalité", date: "2026-10-02", expiry: null },
  { name: "Relevé compte-titres Banque A – T3 2026.pdf", category: "Relevés", date: "2026-10-05", expiry: null },
  { name: "Statuts coordonnés Exemple Holding SRL.pdf", category: "Sociétés", date: "2026-10-05", expiry: null },
  { name: "Contrat de mariage – séparation de biens.pdf", category: "Famille", date: "2026-10-06", expiry: null },
  { name: "Conditions particulières branche 23.pdf", category: "Assurances", date: "2026-10-08", expiry: "2027-06-30" },
  { name: "Carte d'identité – Claire Exemple.pdf", category: "Identité", date: "2026-10-01", expiry: "2027-02-14" },
];

export const DEMO_ACTIONS = [
  { what: "Projet de donation aux enfants : rendez-vous de lecture", who: "Étude notariale (partenaire)", when: "2026-11-20", status: "Planifié" },
  { what: "Comparaison des frais des deux banques", who: "Quantrih Office", when: "2026-11-30", status: "En cours" },
  { what: "Comptes annuels 2025 d'Exemple Holding SRL", who: "Expert-comptable ITAA (partenaire)", when: "2026-12-15", status: "À recevoir" },
  { what: "Renouvellement de la carte d'identité", who: "Vous", when: "2027-02-14", status: "Rappel" },
];
