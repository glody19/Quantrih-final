// Well-known "lazy" model portfolios, built from liquid ETFs with long histories.
// Performance is never stored here: it is computed from live monthly data (see useModelPerformance).

export type AssetBucket = "usStocks" | "intlStocks" | "bonds" | "intlBonds" | "gold" | "realEstate" | "commodities" | "cash";

export interface ModelHolding {
  symbol: string;
  name: string;
  bucket: AssetBucket;
  weight: number;
}

export interface ModelPortfolio {
  id: string;
  name: string;
  author: string;
  risk: 1 | 2 | 3 | 4 | 5;
  description: { en: string; fr: string };
  holdings: ModelHolding[];
}

export const BUCKETS: Record<AssetBucket, { en: string; fr: string; color: string }> = {
  usStocks: { en: "US stocks", fr: "Actions US", color: "#6D5AE6" },
  intlStocks: { en: "International stocks", fr: "Actions internationales", color: "#A99BF5" },
  bonds: { en: "US bonds", fr: "Obligations US", color: "#18B8A0" },
  intlBonds: { en: "International bonds", fr: "Obligations internationales", color: "#7ADFCF" },
  gold: { en: "Gold", fr: "Or", color: "#E0B341" },
  realEstate: { en: "Real estate", fr: "Immobilier", color: "#F08A5D" },
  commodities: { en: "Commodities", fr: "Matières premières", color: "#C2587C" },
  cash: { en: "Cash and short bonds", fr: "Liquidités et court terme", color: "#94A3B8" },
};

const H = (symbol: string, name: string, bucket: AssetBucket, weight: number): ModelHolding => ({ symbol, name, bucket, weight });
const VTI = (w: number) => H("VTI", "Vanguard Total Stock Market", "usStocks", w);
const SPY = (w: number) => H("SPY", "SPDR S&P 500", "usStocks", w);
const VEA = (w: number) => H("VEA", "Vanguard Developed Markets", "intlStocks", w);
const VWO = (w: number) => H("VWO", "Vanguard Emerging Markets", "intlStocks", w);
const VXUS = (w: number) => H("VXUS", "Vanguard Total International Stock", "intlStocks", w);
const BND = (w: number) => H("BND", "Vanguard Total Bond Market", "bonds", w);
const TLT = (w: number) => H("TLT", "iShares 20+ Year Treasury", "bonds", w);
const IEF = (w: number) => H("IEF", "iShares 7-10 Year Treasury", "bonds", w);
const TIP = (w: number) => H("TIP", "iShares TIPS Bond", "bonds", w);
const SHY = (w: number) => H("SHY", "iShares 1-3 Year Treasury", "cash", w);
const GLD = (w: number) => H("GLD", "SPDR Gold Shares", "gold", w);
const VNQ = (w: number) => H("VNQ", "Vanguard Real Estate", "realEstate", w);
const DBC = (w: number) => H("DBC", "Invesco DB Commodity Index", "commodities", w);

export const MODEL_PORTFOLIOS: ModelPortfolio[] = [
  { id: "classic-60-40", name: "Classic 60/40", author: "Benchmark", risk: 3,
    description: { en: "60% US stocks and 40% US bonds: the reference balanced portfolio.", fr: "60 % d'actions US et 40 % d'obligations US : le portefeuille équilibré de référence." },
    holdings: [VTI(60), BND(40)] },
  { id: "all-weather", name: "All Weather", author: "Ray Dalio", risk: 2,
    description: { en: "Built to hold up in growth, recession, inflation and deflation.", fr: "Conçu pour tenir en période de croissance, de récession, d'inflation et de déflation." },
    holdings: [VTI(30), TLT(40), IEF(15), GLD(7.5), DBC(7.5)] },
  { id: "permanent", name: "Permanent Portfolio", author: "Harry Browne", risk: 2,
    description: { en: "Four equal parts: stocks, long bonds, gold and cash.", fr: "Quatre parts égales : actions, obligations longues, or et liquidités." },
    holdings: [VTI(25), TLT(25), GLD(25), SHY(25)] },
  { id: "golden-butterfly", name: "Golden Butterfly", author: "Tyler (Portfolio Charts)", risk: 2,
    description: { en: "A Permanent Portfolio variant with a larger share of stocks.", fr: "Une variante du Permanent Portfolio avec davantage d'actions." },
    holdings: [VTI(40), TLT(20), SHY(20), GLD(20)] },
  { id: "three-fund", name: "Three-Fund Portfolio", author: "Bogleheads", risk: 4,
    description: { en: "US stocks, international stocks and bonds. Simple and very low cost.", fr: "Actions US, actions internationales et obligations. Simple et très peu coûteux." },
    holdings: [VTI(50), VXUS(30), BND(20)] },
  { id: "buffett-90-10", name: "Buffett 90/10", author: "Warren Buffett", risk: 5,
    description: { en: "90% S&P 500 and 10% short-term government bonds.", fr: "90 % de S&P 500 et 10 % d'obligations d'État à court terme." },
    holdings: [SPY(90), SHY(10)] },
  { id: "swensen", name: "Yale Endowment (Swensen)", author: "David Swensen", risk: 4,
    description: { en: "Equity-oriented and diversified, with real estate and inflation-linked bonds.", fr: "Orienté actions et diversifié, avec immobilier et obligations indexées sur l'inflation." },
    holdings: [VTI(30), VEA(15), VWO(5), VNQ(20), IEF(15), TIP(15)] },
  { id: "ivy", name: "Ivy Portfolio", author: "Mebane Faber", risk: 3,
    description: { en: "Five equal asset classes inspired by the Harvard and Yale endowments.", fr: "Cinq classes d'actifs à parts égales, inspirées des fondations de Harvard et de Yale." },
    holdings: [VTI(20), VEA(20), IEF(20), VNQ(20), DBC(20)] },
  { id: "coffeehouse", name: "Coffeehouse", author: "Bill Schultheis", risk: 3,
    description: { en: "60% diversified stocks including real estate, 40% bonds.", fr: "60 % d'actions diversifiées avec de l'immobilier, 40 % d'obligations." },
    holdings: [VTI(40), VEA(10), VNQ(10), BND(40)] },
  { id: "global-80-20", name: "Global Growth 80/20", author: "Benchmark", risk: 4,
    description: { en: "80% global stocks and 20% bonds for long horizons.", fr: "80 % d'actions mondiales et 20 % d'obligations pour les horizons longs." },
    holdings: [VTI(48), VXUS(32), BND(20)] },
];
