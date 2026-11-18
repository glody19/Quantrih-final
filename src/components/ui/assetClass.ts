import { ASSET_DATA } from "../../constants";
import { ETF_UNIVERSE } from "../../data/etfUniverse";

/**
 * Asset class and full name of a ticker, shared by every asset picker of the allocation tools.
 * Sources, in order: the curated list below, the ETF overview universe, the server asset data, names
 * remembered from the search results, then a cautious reading of the name. Unknown stays grey.
 */
export type AssetClassKey = "equity" | "bond" | "commodity" | "realestate" | "cash" | "crypto" | "unknown";

export const ASSET_CLASS_META: Record<AssetClassKey, { en: string; fr: string; color: string }> = {
  equity: { en: "Equity", fr: "Actions", color: "#1D6FA8" },
  bond: { en: "Bonds", fr: "Obligations", color: "#0F9D8A" },
  commodity: { en: "Gold and commodities", fr: "Or et matières premières", color: "#C99A2E" },
  realestate: { en: "Real estate", fr: "Immobilier", color: "#D9466F" },
  cash: { en: "Cash", fr: "Monétaire", color: "#64748B" },
  crypto: { en: "Crypto", fr: "Crypto", color: "#E8761A" },
  unknown: { en: "Other", fr: "Autre", color: "#A3AEBD" },
};

// Full names and classes of the tickers the tools propose by default
const KNOWN: Record<string, [string, AssetClassKey]> = {
  AAPL: ["Apple Inc.", "equity"], MSFT: ["Microsoft Corporation", "equity"], NVDA: ["NVIDIA Corporation", "equity"],
  AMZN: ["Amazon.com, Inc.", "equity"], GOOGL: ["Alphabet Inc. (Class A)", "equity"], TSLA: ["Tesla, Inc.", "equity"],
  JPM: ["JPMorgan Chase & Co.", "equity"], META: ["Meta Platforms, Inc.", "equity"],
  SPY: ["SPDR S&P 500 ETF Trust", "equity"], VOO: ["Vanguard S&P 500 ETF", "equity"], IVV: ["iShares Core S&P 500 ETF", "equity"],
  QQQ: ["Invesco QQQ Trust (Nasdaq-100)", "equity"], IWM: ["iShares Russell 2000 ETF", "equity"],
  EEM: ["iShares MSCI Emerging Markets ETF", "equity"], VT: ["Vanguard Total World Stock ETF", "equity"],
  VTI: ["Vanguard Total Stock Market ETF", "equity"], VV: ["Vanguard Large-Cap ETF", "equity"],
  VTV: ["Vanguard Value ETF", "equity"], VUG: ["Vanguard Growth ETF", "equity"], VO: ["Vanguard Mid-Cap ETF", "equity"],
  VOE: ["Vanguard Mid-Cap Value ETF", "equity"], VOT: ["Vanguard Mid-Cap Growth ETF", "equity"],
  VB: ["Vanguard Small-Cap ETF", "equity"], VBR: ["Vanguard Small-Cap Value ETF", "equity"], VBK: ["Vanguard Small-Cap Growth ETF", "equity"],
  IWC: ["iShares Micro-Cap ETF", "equity"], VXUS: ["Vanguard Total International Stock ETF", "equity"],
  VEA: ["Vanguard FTSE Developed Markets ETF", "equity"], VWO: ["Vanguard FTSE Emerging Markets ETF", "equity"],
  VGK: ["Vanguard FTSE Europe ETF", "equity"], EZU: ["iShares MSCI Eurozone ETF", "equity"], IEUR: ["iShares Core MSCI Europe ETF", "equity"],
  FEZ: ["SPDR EURO STOXX 50 ETF", "equity"], EWU: ["iShares MSCI United Kingdom ETF", "equity"], EWG: ["iShares MSCI Germany ETF", "equity"],
  "VEUR.AS": ["Vanguard FTSE Developed Europe UCITS ETF", "equity"], "PCEU.PA": ["Amundi PEA MSCI Europe UCITS ETF", "equity"],
  "PE500.PA": ["Amundi PEA S&P 500 UCITS ETF", "equity"], "PUST.PA": ["Amundi PEA Nasdaq-100 UCITS ETF", "equity"],
  "PAEEM.PA": ["Amundi PEA MSCI Emerging Markets UCITS ETF", "equity"],
  VTSMX: ["Vanguard Total Stock Market Index Fund", "equity"], VGTSX: ["Vanguard Total International Stock Index Fund", "equity"],
  VEIEX: ["Vanguard Emerging Markets Stock Index Fund", "equity"], VFINX: ["Vanguard 500 Index Fund", "equity"],
  AGG: ["iShares Core US Aggregate Bond ETF", "bond"], BND: ["Vanguard Total Bond Market ETF", "bond"],
  TLT: ["iShares 20+ Year Treasury Bond ETF", "bond"], IEF: ["iShares 7-10 Year Treasury Bond ETF", "bond"],
  SHY: ["iShares 1-3 Year Treasury Bond ETF", "bond"], TIP: ["iShares TIPS Bond ETF", "bond"], BNDX: ["Vanguard Total International Bond ETF", "bond"],
  VBMFX: ["Vanguard Total Bond Market Index Fund", "bond"], VUSTX: ["Vanguard Long-Term Treasury Fund", "bond"],
  VWEHX: ["Vanguard High-Yield Corporate Fund", "bond"], "EUNA.DE": ["iShares Core Global Aggregate Bond UCITS ETF", "bond"],
  "SXRM.DE": ["iShares $ Treasury Bond 7-10yr UCITS ETF", "bond"], "IS04.DE": ["iShares $ Treasury Bond 20+yr UCITS ETF", "bond"],
  BIL: ["SPDR Bloomberg 1-3 Month T-Bill ETF", "cash"], SGOV: ["iShares 0-3 Month Treasury Bond ETF", "cash"], CASH: ["Cash", "cash"],
  GLD: ["SPDR Gold Shares", "commodity"], IAU: ["iShares Gold Trust", "commodity"], SLV: ["iShares Silver Trust", "commodity"],
  USO: ["United States Oil Fund", "commodity"], PDBC: ["Invesco Optimum Yield Diversified Commodity Strategy ETF", "commodity"],
  DBC: ["Invesco DB Commodity Index Tracking Fund", "commodity"],
  "SXR8.DE": ["iShares Core S&P 500 UCITS ETF", "equity"], "4GLD.DE": ["Xetra-Gold", "commodity"], "IQQ7.DE": ["iShares US Property Yield UCITS ETF", "realestate"],
  VNQ: ["Vanguard Real Estate ETF", "realestate"], VGSIX: ["Vanguard Real Estate Index Fund", "realestate"],
  "BTC-USD": ["Bitcoin", "crypto"], "ETH-USD": ["Ethereum", "crypto"], "SOL-USD": ["Solana", "crypto"],
};

const UNIVERSE = new Map(ETF_UNIVERSE.map((e) => [e.s.toUpperCase(), e]));
/** Names seen in the search results, so any ticker picked from the list keeps its full name. */
export const NAME_CACHE = new Map<string, string>();
export const rememberName = (symbol: string, name?: string) => {
  const s = symbol.trim().toUpperCase();
  if (s && name && name.trim() && name.trim().toUpperCase() !== s) NAME_CACHE.set(s, name.trim());
};

export function assetName(symbol: string): string {
  const s = (symbol || "").trim().toUpperCase();
  if (!s) return "";
  if (KNOWN[s]) return KNOWN[s][0];
  const u = UNIVERSE.get(s);
  if (u) return u.n;
  const label = ASSET_DATA[s]?.label;
  if (label && label.toUpperCase() !== s) return label;
  return NAME_CACHE.get(s) || "";
}

export function assetClass(symbol: string, hint?: string): AssetClassKey {
  const s = (symbol || "").trim().toUpperCase();
  if (!s) return "unknown";
  if (KNOWN[s]) return KNOWN[s][1];
  const u = UNIVERSE.get(s);
  if (u) return u.cls as AssetClassKey;
  const type = (ASSET_DATA[s]?.type || "").toLowerCase();
  if (type === "crypto" || /^(BTC|ETH|SOL|XRP|ADA|DOGE|BNB|AVAX|DOT|LTC|LINK)-[A-Z]{3}$/.test(s)) return "crypto";
  const name = `${assetName(s)} ${hint || ""}`.toLowerCase();
  if (/miners?\b/.test(name)) return "equity";
  if (/t-bill|money market|0-1 ?y|0-3 month|1-3 month|ultra ?short/.test(name)) return "cash";
  if (/\bbonds?\b|treasur|aggregate|\bgovt\b|government|gilt|\bbund|fixed income|obligation|\btips\b/.test(name)) return "bond";
  if (/\bgold\b|silver|platinum|commodit|crude|\boil\b|natural gas|copper|agricultur|\betc\b/.test(name)) return "commodity";
  if (/real estate|\breits?\b|property|immobilier/.test(name)) return "realestate";
  if (/bitcoin|ethereum|crypto/.test(name)) return "crypto";
  if (type === "stock" || /equity|stock|s&p|nasdaq|msci|ftse|stoxx|russell|\bdax\b|\bcac\b|nikkei|dividend|small.?cap|large.?cap|mid.?cap|\binc\b|corporation|\bplc\b|\bsa\b|\bag\b/.test(name)) return "equity";
  return "unknown";
}
