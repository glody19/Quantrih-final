/**
 * Allocation strategies built from UCITS ETFs listed in euros, so a European investor can buy them.
 * Ids match the model portfolios of the backtesting pages (src/data/modelPortfolios.ts), so a portfolio
 * picked there opens here preselected.
 */
export interface Strategy {
  id: string;
  name: string;
  author: string;
  risk: 1 | 2 | 3 | 4 | 5;
  fr: string;
  en: string;
  holdings: { symbol: string; weight: number }[];
}

const h = (symbol: string, weight: number) => ({ symbol, weight });

export const STRATEGIES: Strategy[] = [
  { id: "global-100", name: "100 % actions monde", author: "Indiciel", risk: 5,
    fr: "Un seul ETF sur plus de 3 600 sociétés de 50 pays. La stratégie la plus simple sur un horizon long.",
    en: "A single ETF holding over 3,600 companies in 50 countries. The simplest long-horizon strategy.",
    holdings: [h("VWCE.DE", 100)] },
  { id: "classic-60-40", name: "Classique 60/40", author: "Référence", risk: 3,
    fr: "60 % d'actions mondiales, 40 % d'obligations mondiales couvertes en euros. Le portefeuille équilibré de référence.",
    en: "60% global stocks, 40% global bonds hedged to euros. The reference balanced portfolio.",
    holdings: [h("VWCE.DE", 60), h("EUNA.DE", 40)] },
  { id: "global-80-20", name: "Croissance 80/20", author: "Référence", risk: 4,
    fr: "80 % d'actions mondiales, 20 % d'obligations pour amortir les baisses.",
    en: "80% global stocks, 20% bonds to cushion drawdowns.",
    holdings: [h("VWCE.DE", 80), h("EUNA.DE", 20)] },
  { id: "three-fund", name: "Trois fonds (version européenne)", author: "Bogleheads", risk: 4,
    fr: "Pays développés, émergents et obligations d'État de la zone euro. Frais totaux inférieurs à 0,2 % par an.",
    en: "Developed markets, emerging markets and euro-area government bonds. Total costs below 0.2% a year.",
    holdings: [h("IWDA.AS", 60), h("EMIM.AS", 10), h("EUNH.DE", 30)] },
  { id: "all-weather", name: "All Weather", author: "Ray Dalio", risk: 2,
    fr: "Pondéré par le risque pour tenir en croissance, récession, inflation et déflation : obligations longues, or et matières premières.",
    en: "Risk-weighted to hold up in growth, recession, inflation and deflation: long bonds, gold and commodities.",
    holdings: [h("IWDA.AS", 30), h("IS04.DE", 40), h("SXRM.DE", 15), h("4GLD.DE", 7.5), h("EXXY.DE", 7.5)] },
  { id: "permanent", name: "Portefeuille permanent", author: "Harry Browne", risk: 2,
    fr: "Quatre parts égales : actions, obligations longues, or et monétaire.",
    en: "Four equal parts: stocks, long bonds, gold and money market.",
    holdings: [h("IWDA.AS", 25), h("IS04.DE", 25), h("4GLD.DE", 25), h("XEON.DE", 25)] },
  { id: "golden-butterfly", name: "Golden Butterfly", author: "Portfolio Charts", risk: 2,
    fr: "Variante du portefeuille permanent avec une poche de petites capitalisations.",
    en: "Permanent Portfolio variant with a small-cap sleeve.",
    holdings: [h("IWDA.AS", 20), h("IUSN.DE", 20), h("IS04.DE", 20), h("XEON.DE", 20), h("4GLD.DE", 20)] },
  { id: "buffett-90-10", name: "Buffett 90/10", author: "Warren Buffett", risk: 5,
    fr: "90 % S&P 500 et 10 % monétaire, la consigne de Buffett pour sa succession.",
    en: "90% S&P 500 and 10% money market, Buffett's instruction for his estate.",
    holdings: [h("SXR8.DE", 90), h("XEON.DE", 10)] },
  { id: "swensen", name: "Fondation Yale", author: "David Swensen", risk: 4,
    fr: "Actions US, Europe et émergents, immobilier coté et obligations d'État.",
    en: "US, European and emerging stocks, listed real estate and government bonds.",
    holdings: [h("SXR8.DE", 30), h("EXSA.DE", 15), h("EMIM.AS", 5), h("IQQ7.DE", 20), h("EUNH.DE", 15), h("SXRM.DE", 15)] },
  { id: "ivy", name: "Ivy Portfolio", author: "Mebane Faber", risk: 3,
    fr: "Cinq classes d'actifs à parts égales, inspirées des fondations de Harvard et de Yale.",
    en: "Five asset classes in equal parts, inspired by the Harvard and Yale endowments.",
    holdings: [h("SXR8.DE", 20), h("EXSA.DE", 20), h("SXRM.DE", 20), h("IQQ7.DE", 20), h("EXXY.DE", 20)] },
  { id: "coffeehouse", name: "Coffeehouse", author: "Bill Schultheis", risk: 3,
    fr: "60 % d'actions diversifiées avec de l'immobilier, 40 % d'obligations.",
    en: "60% diversified stocks with real estate, 40% bonds.",
    holdings: [h("IWDA.AS", 40), h("EXSA.DE", 10), h("IQQ7.DE", 10), h("EUNA.DE", 40)] },
  { id: "core-satellite", name: "Cœur-satellite", author: "Quantrih", risk: 4,
    fr: "Un cœur monde à 70 %, trois satellites : Nasdaq-100, émergents et or.",
    en: "A 70% global core with three satellites: Nasdaq-100, emerging markets and gold.",
    holdings: [h("VWCE.DE", 70), h("EQQQ.DE", 10), h("EMIM.AS", 10), h("4GLD.DE", 10)] },
];

/** ETFs scanned by the momentum strategy. */
export const MOMENTUM_POOL = ["SXR8.DE", "EQQQ.DE", "EXSA.DE", "EMIM.AS", "IUSN.DE", "IQQ7.DE", "EUNH.DE", "IS04.DE", "4GLD.DE", "EXXY.DE", "XEON.DE"];
