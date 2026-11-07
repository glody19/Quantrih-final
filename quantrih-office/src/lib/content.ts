/** Contenus partagés par le site public et les formulaires. */

export const SERVICES = [
  { key: "coordination", title: "Coordination des spécialistes", text: "Un seul interlocuteur qui mandate, briefe et suit les professionnels dont vous avez besoin." },
  { key: "consolidation", title: "Consolidation et reporting", text: "Tous vos comptes, banques et sociétés réunis dans une vision unique, à jour et documentée." },
  { key: "audit", title: "Diagnostic patrimonial", text: "Un inventaire complet, la cartographie de vos structures et les points d'attention à soumettre à vos conseillers." },
  { key: "investissements", title: "Banques et gérants", text: "Mise en relation avec des banques et gérants agréés, suivi de leurs prestations et de leurs frais ; les décisions restent les vôtres." },
  { key: "comptabilite", title: "Services comptables", text: "Coordination avec des experts-comptables ITAA pour vos sociétés et structures." },
  { key: "international", title: "Sociétés et holdings", text: "Création de sociétés, structuration de holdings en Belgique et à l'international." },
  { key: "fiscalite", title: "Fiscalité et structures", text: "Coordination avec des avocats et des conseillers fiscaux, qui vous conseillent dans le respect du cadre légal." },
  { key: "immobilier", title: "Immobilier et financement", text: "Acquisition, détention, financement et arbitrage de votre patrimoine immobilier." },
  { key: "transmission", title: "Transmission et succession", text: "Donations, successions et pactes familiaux, préparés avec vos notaires et avocats." },
  { key: "entreprise", title: "Acquisition et cession d'entreprise", text: "Préparation, recherche de conseils M&A et suivi de l'opération jusqu'au closing." },
  { key: "financement", title: "Financement d'opérations", text: "Mise en concurrence des banques et structuration des financements." },
  { key: "assurance", title: "Assurance et prévoyance", text: "Revue des couvertures et coordination avec des courtiers indépendants." },
] as const;

export const PROFILES = [
  { key: "famille", label: "Une famille" },
  { key: "entrepreneur", label: "Un entrepreneur ou dirigeant" },
  { key: "particulier", label: "Un particulier" },
] as const;

export const WEALTH_RANGES = [
  { key: "lt1", label: "Moins de 1 M€" },
  { key: "1-5", label: "1 à 5 M€" },
  { key: "5-10", label: "5 à 10 M€" },
  { key: "10-20", label: "10 à 20 M€" },
  { key: "gt20", label: "Plus de 20 M€" },
] as const;

export const CATEGORY_LABEL = {
  liquidites: "Liquidités",
  titres: "Portefeuilles titres",
  assurance_vie: "Assurance-vie",
  immobilier: "Immobilier",
  participations: "Participations",
  private_equity: "Private equity",
  actifs_passion: "Actifs de passion",
  pension: "Pension (2e et 3e piliers)",
  dettes: "Crédits et dettes",
  autres: "Autres",
} as const;

export const CONTACT = {
  email: "bonjour@quantrih-office.be",
  city: "Louvain-la-Neuve",
  country: "Belgique",
};
