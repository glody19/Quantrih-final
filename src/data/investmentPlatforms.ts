// Investment platforms available to Belgian and French investors, shown first on /platforms.
// Fees are indicative, cross-checked in November 2026 against public price lists and the
// Test-Achats, Curvo and Café de la Bourse comparisons. The official price list always prevails.

export type PlatformType = "broker" | "bank" | "neobank";
export type Market = "BE" | "FR";

interface Localized<T> {
  fr: T;
  en: T;
}

export interface InvestmentPlatform {
  id: string;
  name: string;
  type: PlatformType;
  markets: Market[];
  /** Supervisor(s) of the entity serving these clients. */
  regulator: string;
  group?: string;
  domain: string;
  url: string;
  color: string;
  products: string[];
  fees: Localized<string>;
  tax: Localized<string>;
  bestFor: Localized<string>;
  highlights: Localized<string[]>;
  watchouts: Localized<string[]>;
}

export const PLATFORM_SOURCES = [
  { label: "Test-Achats : comparatif des courtiers en Belgique", url: "https://www.test-achats.be/invest/investir/actions/news/frais-courtage-comparaison" },
  { label: "Test-Achats : courtiers qui facturent des frais de garde (mai 2026)", url: "https://www.test-achats.be/invest/investir/actions/articles/2026/05/courtiers-frais-garde" },
  { label: "Curvo : le courtier le moins cher de Belgique pour les ETF (2026)", url: "https://curvo.eu/article/cheapest-broker-belgium-etf" },
  { label: "Café de la Bourse : comparatif des PEA 2026", url: "https://www.cafedelabourse.com/bourse/comparatif-meilleur-pea" },
  { label: "SPF Finances : taxe sur les opérations de bourse (TOB)", url: "https://finances.belgium.be/fr" },
  { label: "FSMA : vérifier qu'un intermédiaire est agréé", url: "https://www.fsma.be/fr" },
  { label: "AMF : vérifier qu'un acteur est autorisé", url: "https://www.amf-france.org/fr" },
];

export const INVESTMENT_PLATFORMS: InvestmentPlatform[] = [
  // ─────────────────────────── Belgium ───────────────────────────
  {
    id: "bolero",
    name: "Bolero",
    type: "broker",
    markets: ["BE"],
    regulator: "FSMA, BNB",
    group: "Groupe KBC",
    domain: "bolero.be",
    url: "https://www.bolero.be/fr/tarifs",
    color: "#00AEEF",
    products: ["Actions", "ETF", "Obligations", "Fonds", "Options"],
    fees: {
      fr: "Dès 2,50 € par ordre jusqu'à 250 €, 5 € jusqu'à 1 000 € (Euronext). Playlist ETF à tarif réduit.",
      en: "From €2.50 per order up to €250, €5 up to €1,000 (Euronext). Discounted ETF Playlist.",
    },
    tax: {
      fr: "TOB et précompte mobilier retenus et déclarés automatiquement.",
      en: "Belgian stock exchange tax (TOB) and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "L'investisseur belge qui veut une fiscalité réglée sans démarche.",
      en: "Belgian investors who want their taxes handled for them.",
    },
    highlights: {
      fr: ["Courtier belge adossé au groupe KBC", "Pas de droits de garde", "Large accès aux bourses européennes et américaines"],
      en: ["Belgian broker backed by KBC Group", "No custody fees", "Broad access to European and US exchanges"],
    },
    watchouts: {
      fr: ["Plus cher que DEGIRO sur les gros ordres", "Moins de marchés qu'Interactive Brokers"],
      en: ["More expensive than DEGIRO on large orders", "Fewer markets than Interactive Brokers"],
    },
  },
  {
    id: "keytrade",
    name: "Keytrade Bank",
    type: "broker",
    markets: ["BE"],
    regulator: "FSMA, BNB",
    group: "Crédit Mutuel Arkéa",
    domain: "keytradebank.be",
    url: "https://www.keytradebank.be/fr/",
    color: "#E3007E",
    products: ["Actions", "ETF", "Obligations", "Fonds", "Épargne-pension"],
    fees: {
      fr: "Environ 5,95 € pour un ordre de 1 000 € sur Euronext. Plans ETF automatiques Keyplan.",
      en: "About €5.95 for a €1,000 Euronext order. Automatic Keyplan ETF plans.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Banque en ligne et courtier dans un seul compte, avec plans d'investissement.",
      en: "Online bank and broker in a single account, with investment plans.",
    },
    highlights: {
      fr: ["Plans d'investissement Keyplan", "Banque en ligne complète", "Pas de droits de garde"],
      en: ["Keyplan investment plans", "Full online bank", "No custody fees"],
    },
    watchouts: {
      fr: ["Frais par ordre au-dessus des néocourtiers", "Peu d'outils d'analyse avancés"],
      en: ["Per-order fees above neo-brokers", "Few advanced analysis tools"],
    },
  },
  {
    id: "degiro",
    name: "DEGIRO",
    type: "broker",
    markets: ["BE", "FR"],
    regulator: "BaFin (Allemagne), passeport européen",
    group: "flatexDEGIRO",
    domain: "degiro.com",
    url: "https://www.degiro.com/",
    color: "#00A3E0",
    products: ["Actions", "ETF", "Options", "Futures"],
    fees: {
      fr: "1 € de frais de traitement sur la sélection cœur d'ETF. 2,50 € par an et par bourse étrangère utilisée.",
      en: "€1 handling fee on the core ETF selection. €2.50 per year for each foreign exchange used.",
    },
    tax: {
      fr: "Belgique : la TOB est à déclarer soi-même. France : pas de PEA.",
      en: "Belgium: TOB must be declared by the investor. France: no PEA.",
    },
    bestFor: {
      fr: "Les frais les plus bas pour un portefeuille d'ETF simple.",
      en: "The lowest fees for a simple ETF portfolio.",
    },
    highlights: {
      fr: ["Parmi les frais les plus bas d'Europe", "Interface simple", "Nombreuses bourses accessibles"],
      en: ["Among the lowest fees in Europe", "Simple interface", "Many exchanges available"],
    },
    watchouts: {
      fr: ["TOB à déclarer en Belgique", "Pas de PEA en France", "Frais de transfert sortant"],
      en: ["TOB to declare in Belgium", "No PEA in France", "Outgoing transfer fees"],
    },
  },
  {
    id: "saxo",
    name: "Saxo",
    type: "broker",
    markets: ["BE", "FR"],
    regulator: "FSA (Danemark), FSMA, AMF",
    domain: "home.saxo",
    url: "https://www.home.saxo/fr-be",
    color: "#1E2A78",
    products: ["Actions", "ETF", "Obligations", "Options", "Futures", "PEA (France)"],
    fees: {
      fr: "0,08 % par ordre sur les actions européennes, minimum 2 €.",
      en: "0.08% per order on European stocks, minimum €2.",
    },
    tax: {
      fr: "Belgique : TOB retenue. France : PEA disponible.",
      en: "Belgium: TOB withheld. France: PEA available.",
    },
    bestFor: {
      fr: "L'investisseur actif qui veut beaucoup d'instruments et des plateformes professionnelles.",
      en: "Active investors who want many instruments and professional platforms.",
    },
    highlights: {
      fr: ["Plus de 70 000 instruments", "Plateformes SaxoTraderGO et PRO", "PEA en France"],
      en: ["Over 70,000 instruments", "SaxoTraderGO and PRO platforms", "PEA in France"],
    },
    watchouts: {
      fr: ["Interface dense pour un débutant", "Frais de change sur les devises étrangères"],
      en: ["Dense interface for beginners", "FX fees on foreign currencies"],
    },
  },
  {
    id: "ing",
    name: "ING Self Invest",
    type: "bank",
    markets: ["BE"],
    regulator: "BNB, FSMA",
    group: "ING Belgique",
    domain: "ing.be",
    url: "https://www.ing.be/en/individuals/investing/ing-self-invest",
    color: "#FF6200",
    products: ["Actions", "ETF", "Fonds", "Obligations"],
    fees: {
      fr: "Frais d'ordre en pourcentage du montant. Frais de garde mensuels par ligne.",
      en: "Order fees as a percentage of the amount. Monthly custody fee per position.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Les clients ING qui veulent investir depuis leur compte courant.",
      en: "ING customers who want to invest from their current account.",
    },
    highlights: {
      fr: ["Intégré à l'application ING Banking", "Sélection d'ETF", "Grand groupe bancaire"],
      en: ["Built into the ING Banking app", "ETF selection", "Large banking group"],
    },
    watchouts: {
      fr: ["Frais de garde par ligne", "Plus cher qu'un courtier en ligne"],
      en: ["Custody fee per position", "More expensive than an online broker"],
    },
  },
  {
    id: "bnp_fortis",
    name: "BNP Paribas Fortis",
    type: "bank",
    markets: ["BE"],
    regulator: "BNB, FSMA",
    group: "Groupe BNP Paribas",
    domain: "bnpparibasfortis.be",
    url: "https://www.bnpparibasfortis.be/fr/public/particuliers",
    color: "#00915A",
    products: ["Actions", "ETF", "Fonds", "Obligations", "Épargne-pension"],
    fees: {
      fr: "Frais d'ordre en pourcentage avec minimum. Droits de garde 0,242 % par an, minimum 4,84 € par ligne.",
      en: "Order fees as a percentage with a minimum. Custody fee 0.242% per year, minimum €4.84 per position.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Les clients qui veulent le conseil d'une grande banque.",
      en: "Clients who want advice from a large bank.",
    },
    highlights: {
      fr: ["Conseillers en agence", "Application Easy Banking", "Gamme de fonds maison"],
      en: ["Advisors in branches", "Easy Banking app", "In-house fund range"],
    },
    watchouts: {
      fr: ["Droits de garde annuels", "Frais d'ordre élevés pour les petits montants"],
      en: ["Annual custody fees", "High order fees on small amounts"],
    },
  },
  {
    id: "kbc",
    name: "KBC",
    type: "bank",
    markets: ["BE"],
    regulator: "BNB, FSMA",
    group: "Groupe KBC",
    domain: "kbc.be",
    url: "https://www.kbc.be/particuliers/fr.html",
    color: "#00AEEF",
    products: ["Fonds", "Plans d'investissement", "Épargne-pension", "Actions via Bolero"],
    fees: {
      fr: "Plans d'investissement et fonds maison. Ordres en ligne via Bolero.",
      en: "Investment plans and in-house funds. Online orders through Bolero.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Investir par petits montants réguliers avec l'accompagnement de sa banque.",
      en: "Investing small regular amounts with support from your bank.",
    },
    highlights: {
      fr: ["Application KBC Mobile très complète", "Conseil en agence", "Lien direct avec Bolero"],
      en: ["Feature-rich KBC Mobile app", "Advice in branches", "Direct link with Bolero"],
    },
    watchouts: {
      fr: ["Frais des fonds au-dessus des ETF indiciels", "Gamme surtout maison"],
      en: ["Fund fees above index ETFs", "Mostly in-house range"],
    },
  },
  {
    id: "belfius",
    name: "Belfius",
    type: "bank",
    markets: ["BE"],
    regulator: "BNB, FSMA",
    domain: "belfius.be",
    url: "https://www.belfius.be/retail/fr/index.aspx",
    color: "#C30045",
    products: ["Fonds", "Actions", "Plans d'investissement", "Épargne-pension"],
    fees: {
      fr: "Ordres en ligne via l'application, plans d'investissement et fonds maison.",
      en: "Online orders in the app, investment plans and in-house funds.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Les clients Belfius qui veulent tout gérer depuis l'application.",
      en: "Belfius customers who want to manage everything in the app.",
    },
    highlights: {
      fr: ["Application mobile bien notée", "Banque belge", "Conseillers disponibles"],
      en: ["Highly rated mobile app", "Belgian bank", "Advisors available"],
    },
    watchouts: {
      fr: ["Frais des fonds maison", "Choix d'ETF externes limité"],
      en: ["In-house fund fees", "Limited choice of external ETFs"],
    },
  },
  {
    id: "argenta",
    name: "Argenta",
    type: "bank",
    markets: ["BE"],
    regulator: "BNB, FSMA",
    domain: "argenta.be",
    url: "https://www.argenta.be/fr.html",
    color: "#7AB800",
    products: ["Fonds", "Actions", "Épargne-pension"],
    fees: {
      fr: "Frais d'ordre en pourcentage avec un minimum élevé sur les petits ordres.",
      en: "Percentage order fees with a high minimum on small orders.",
    },
    tax: {
      fr: "TOB et précompte retenus automatiquement.",
      en: "TOB and withholding tax handled automatically.",
    },
    bestFor: {
      fr: "Les clients Argenta qui investissent surtout en fonds.",
      en: "Argenta customers who mainly invest in funds.",
    },
    highlights: {
      fr: ["Banque belge proche de ses clients", "Fonds et épargne-pension"],
      en: ["Customer-focused Belgian bank", "Funds and pension savings"],
    },
    watchouts: {
      fr: ["Peu adapté aux petits ordres fréquents"],
      en: ["Not suited to frequent small orders"],
    },
  },
  {
    id: "mexem",
    name: "MEXEM",
    type: "broker",
    markets: ["BE", "FR"],
    regulator: "CySEC, passeport européen",
    domain: "mexem.com",
    url: "https://www.mexem.com/fees",
    color: "#0B3D91",
    products: ["Actions", "ETF", "Options", "Futures", "Obligations"],
    fees: {
      fr: "0,06 % par ordre sur les actions européennes, minimum 1 €. Infrastructure Interactive Brokers.",
      en: "0.06% per order on European stocks, minimum €1. Interactive Brokers infrastructure.",
    },
    tax: {
      fr: "Rapports fiscaux pour les clients belges.",
      en: "Tax reports for Belgian clients.",
    },
    bestFor: {
      fr: "La puissance d'Interactive Brokers avec un service en français.",
      en: "Interactive Brokers power with service in French.",
    },
    highlights: {
      fr: ["Tarifs proches d'Interactive Brokers", "Pas de frais d'inactivité", "Support en français"],
      en: ["Pricing close to Interactive Brokers", "No inactivity fees", "Support in French"],
    },
    watchouts: {
      fr: ["Dépôt minimum", "Plateforme technique pour un débutant"],
      en: ["Minimum deposit", "Technical platform for beginners"],
    },
  },
  {
    id: "lynx",
    name: "LYNX",
    type: "broker",
    markets: ["BE", "FR"],
    regulator: "AFM (Pays-Bas), passeport européen",
    domain: "lynxbroker.be",
    url: "https://www.lynxbroker.be/",
    color: "#003B5C",
    products: ["Actions", "ETF", "Options", "Futures"],
    fees: {
      fr: "Tarif fixe par ordre selon la bourse. Infrastructure Interactive Brokers.",
      en: "Fixed fee per order depending on the exchange. Interactive Brokers infrastructure.",
    },
    tax: {
      fr: "Bureau en Belgique, accompagnement local.",
      en: "Office in Belgium, local support.",
    },
    bestFor: {
      fr: "Les traders actifs en options et actions qui veulent un support local.",
      en: "Active options and stock traders who want local support.",
    },
    highlights: {
      fr: ["Accès mondial", "Webinaires et formations", "Support local"],
      en: ["Global access", "Webinars and training", "Local support"],
    },
    watchouts: {
      fr: ["Plus cher qu'Interactive Brokers en direct"],
      en: ["More expensive than Interactive Brokers directly"],
    },
  },

  // ─────────────────────────── France ───────────────────────────
  {
    id: "boursobank",
    name: "BoursoBank",
    type: "broker",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    group: "Société Générale",
    domain: "boursobank.com",
    url: "https://www.boursobank.com/",
    color: "#D6006D",
    products: ["PEA", "Compte-titres", "ETF", "Actions", "Assurance-vie"],
    fees: {
      fr: "Offre Découverte : 1,99 € jusqu'à 500 €, puis 0,50 %. Frais du PEA plafonnés à 0,5 % par la loi.",
      en: "Discovery plan: €1.99 up to €500, then 0.50%. PEA fees capped at 0.5% by law.",
    },
    tax: {
      fr: "PEA et assurance-vie disponibles, IFU fourni.",
      en: "PEA and life insurance available, tax form provided.",
    },
    bestFor: {
      fr: "Un PEA bon marché dans une banque en ligne complète.",
      en: "An inexpensive PEA inside a full online bank.",
    },
    highlights: {
      fr: ["Banque en ligne leader en France", "Pas de droits de garde sur l'offre Découverte", "Assurance-vie"],
      en: ["Leading French online bank", "No custody fees on the Discovery plan", "Life insurance"],
    },
    watchouts: {
      fr: ["Frais en pourcentage sur les gros ordres"],
      en: ["Percentage fees on large orders"],
    },
  },
  {
    id: "fortuneo",
    name: "Fortuneo",
    type: "broker",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    group: "Crédit Mutuel Arkéa",
    domain: "fortuneo.fr",
    url: "https://www.fortuneo.fr/",
    color: "#6CB33F",
    products: ["PEA", "Compte-titres", "ETF", "Actions", "Assurance-vie"],
    fees: {
      fr: "Formule Starter : premier ordre du mois offert jusqu'à 500 €, puis 0,35 %.",
      en: "Starter plan: first order of the month free up to €500, then 0.35%.",
    },
    tax: {
      fr: "PEA, PEA-PME et assurance-vie disponibles.",
      en: "PEA, PEA-PME and life insurance available.",
    },
    bestFor: {
      fr: "Investir par petits montants sur PEA.",
      en: "Investing small amounts in a PEA.",
    },
    highlights: {
      fr: ["Pas de droits de garde", "PEA et PEA-PME", "Banque en ligne complète"],
      en: ["No custody fees", "PEA and PEA-PME", "Full online bank"],
    },
    watchouts: {
      fr: ["Frais de clôture du PEA"],
      en: ["PEA closing fee"],
    },
  },
  {
    id: "bourse_direct",
    name: "Bourse Direct",
    type: "broker",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    domain: "boursedirect.fr",
    url: "https://www.boursedirect.fr/",
    color: "#E2001A",
    products: ["PEA", "Compte-titres", "ETF", "Actions", "Assurance-vie"],
    fees: {
      fr: "0,99 € jusqu'à 500 €, puis paliers, et 0,09 % au-delà de 4 400 €.",
      en: "€0.99 up to €500, then tiers, and 0.09% above €4,400.",
    },
    tax: {
      fr: "PEA et compte-titres, IFU fourni.",
      en: "PEA and securities account, tax form provided.",
    },
    bestFor: {
      fr: "Les frais parmi les plus bas pour un PEA actif.",
      en: "Among the lowest fees for an active PEA.",
    },
    highlights: {
      fr: ["Courtier français spécialisé", "Pas de droits de garde", "Outils de bourse complets"],
      en: ["Specialist French broker", "No custody fees", "Comprehensive trading tools"],
    },
    watchouts: {
      fr: ["Interface moins moderne que les néocourtiers"],
      en: ["Interface less modern than neo-brokers"],
    },
  },
  {
    id: "trade_republic",
    name: "Trade Republic",
    type: "neobank",
    markets: ["FR", "BE"],
    regulator: "BaFin, Bundesbank",
    domain: "traderepublic.com",
    url: "https://traderepublic.com/fr-fr",
    color: "#111111",
    products: ["Actions", "ETF", "Plans d'investissement", "PEA (France)", "Crypto"],
    fees: {
      fr: "1 € par ordre, plans d'investissement programmés sans frais de courtage.",
      en: "€1 per order, scheduled investment plans without brokerage fees.",
    },
    tax: {
      fr: "France : PEA disponible. Belgique : vérifier la gestion de la TOB.",
      en: "France: PEA available. Belgium: check TOB handling.",
    },
    bestFor: {
      fr: "Les plans d'investissement mensuels en ETF depuis le mobile.",
      en: "Monthly ETF investment plans on mobile.",
    },
    highlights: {
      fr: ["Tarif simple", "Plans programmés gratuits", "Intérêts sur les liquidités"],
      en: ["Simple pricing", "Free scheduled plans", "Interest on cash"],
    },
    watchouts: {
      fr: ["Peu de bourses accessibles", "Application mobile d'abord"],
      en: ["Few exchanges available", "Mobile-first app"],
    },
  },
  {
    id: "credit_agricole",
    name: "Crédit Agricole",
    type: "bank",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    domain: "credit-agricole.fr",
    url: "https://www.credit-agricole.fr/",
    color: "#007461",
    products: ["PEA", "Compte-titres", "Assurance-vie", "Fonds"],
    fees: {
      fr: "Tarifs de banque traditionnelle, variables selon la caisse régionale.",
      en: "Traditional bank pricing, varying by regional bank.",
    },
    tax: {
      fr: "PEA et assurance-vie disponibles.",
      en: "PEA and life insurance available.",
    },
    bestFor: {
      fr: "Les clients qui privilégient le conseil en agence.",
      en: "Clients who prefer advice in a branch.",
    },
    highlights: {
      fr: ["Réseau d'agences dense", "Conseil personnalisé"],
      en: ["Dense branch network", "Personal advice"],
    },
    watchouts: {
      fr: ["Frais nettement au-dessus des courtiers en ligne"],
      en: ["Fees well above online brokers"],
    },
  },
  {
    id: "bnp_paribas",
    name: "BNP Paribas",
    type: "bank",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    domain: "mabanque.bnpparibas",
    url: "https://mabanque.bnpparibas/",
    color: "#00915A",
    products: ["PEA", "Compte-titres", "Assurance-vie", "Fonds"],
    fees: {
      fr: "Tarifs de banque traditionnelle, droits de garde selon l'offre.",
      en: "Traditional bank pricing, custody fees depending on the plan.",
    },
    tax: {
      fr: "PEA et assurance-vie disponibles.",
      en: "PEA and life insurance available.",
    },
    bestFor: {
      fr: "Les clients d'une grande banque qui veulent un accompagnement.",
      en: "Clients of a large bank who want guidance.",
    },
    highlights: {
      fr: ["Grand groupe européen", "Gamme de fonds et d'assurance-vie"],
      en: ["Large European group", "Fund and life insurance range"],
    },
    watchouts: {
      fr: ["Frais plus élevés qu'en ligne"],
      en: ["Higher fees than online"],
    },
  },
  {
    id: "societe_generale",
    name: "Société Générale",
    type: "bank",
    markets: ["FR"],
    regulator: "ACPR, AMF",
    domain: "particuliers.sg.fr",
    url: "https://particuliers.sg.fr/",
    color: "#E60028",
    products: ["PEA", "Compte-titres", "Assurance-vie", "Fonds"],
    fees: {
      fr: "Tarifs de banque traditionnelle.",
      en: "Traditional bank pricing.",
    },
    tax: {
      fr: "PEA et assurance-vie disponibles.",
      en: "PEA and life insurance available.",
    },
    bestFor: {
      fr: "Les clients Société Générale qui veulent tout centraliser.",
      en: "Société Générale customers who want everything in one place.",
    },
    highlights: {
      fr: ["Conseillers en agence", "Maison mère de BoursoBank"],
      en: ["Advisors in branches", "Parent company of BoursoBank"],
    },
    watchouts: {
      fr: ["Frais plus élevés qu'en ligne"],
      en: ["Higher fees than online"],
    },
  },
];
