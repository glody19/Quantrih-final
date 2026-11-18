export const RISK_FR: Record<string, string> = {
  "Very Low": "Risque très faible",
  Low: "Risque faible",
  Medium: "Risque moyen",
  High: "Risque élevé",
  "Very High": "Risque très élevé",
};

export const REBALANCE_FR: Record<string, string> = {
  none: "Jamais",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  "semi-annual": "Semestriel",
  annual: "Annuel",
  threshold: "Par seuil",
};

/** Plain names for the tickers used by the model portfolios. */
export const TICKER_NAMES: Record<string, string> = {
  VTI: "Actions US", VOO: "S&P 500", SPY: "S&P 500", VT: "Actions monde", VXUS: "Actions hors US", VEA: "Actions pays développés",
  VWO: "Actions émergentes", BND: "Obligations US", BNDW: "Obligations monde", BNDX: "Obligations internationales", AGG: "Obligations US",
  TLT: "Obligations US 20 ans+", IEF: "Obligations US 7-10 ans", SHY: "Obligations US 1-3 ans", SHV: "Monétaire US", BIL: "Monétaire US",
  GLD: "Or", IAU: "Or", DBC: "Matières premières", GSG: "Matières premières", VNQ: "Immobilier coté", TIP: "Obligations indexées",
  QQQ: "Nasdaq 100", SCHD: "Dividendes US", VIG: "Croissance du dividende", VYM: "Haut dividende", IJS: "Petites valeurs US",
  VBR: "Petites valeurs US", AVUV: "Petites valeurs US", VB: "Petites capitalisations US", MTUM: "Momentum US", QUAL: "Qualité US",
  USMV: "Faible volatilité US", "BTC-USD": "Bitcoin", "ETH-USD": "Ethereum", IBIT: "Bitcoin", VTV: "Valeur US", VUG: "Croissance US",
  EFA: "Actions pays développés", EEM: "Actions émergentes", LQD: "Obligations d'entreprises", HYG: "Haut rendement", VGLT: "Obligations US longues",
  EDV: "Obligations US très longues", VCIT: "Obligations d'entreprises", VTIP: "Obligations indexées courtes", "VWCE.DE": "Actions monde",
  "IWDA.AS": "MSCI World", "EIMI.AS": "Actions émergentes", "AGGH.AS": "Obligations monde",
};
