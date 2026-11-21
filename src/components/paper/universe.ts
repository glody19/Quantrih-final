/**
 * Curated list of instruments for the paper-trading search: the most traded European and US stocks,
 * UCITS ETFs listed in euros, euro bond ETFs, gold, commodities and crypto quoted in euros.
 * Prices always come from the live quote API; this file only holds descriptions.
 */
export type Kind = "stock" | "etf" | "bond" | "commodity" | "crypto";
export type Region = "eu" | "us" | "world" | "em";
export type AssetClass = "equity" | "bond" | "gold" | "commodity" | "realestate" | "cash" | "crypto";

export interface Instrument {
  s: string; // quote symbol
  n: string; // name
  k: Kind;
  r: Region;
  x: string; // exchange
  c: string; // trading currency (GBp = pence)
  sec?: string; // sector or index
  ter?: number; // ongoing charges, % per year
  cls: AssetClass;
  /** US-domiciled fund: no KID, not sold to EU retail investors (PRIIPs). */
  priips?: boolean;
}

const st = (s: string, n: string, r: Region, x: string, c: string, sec: string): Instrument => ({ s, n, k: "stock", r, x, c, sec, cls: "equity" });
const etf = (s: string, n: string, r: Region, x: string, sec: string, ter: number, cls: AssetClass = "equity", k: Kind = "etf"): Instrument => ({ s, n, k, r, x, c: "EUR", sec, ter, cls });

export const UNIVERSE: Instrument[] = [
  // ── ETF UCITS en euros ──
  etf("VWCE.DE", "Vanguard FTSE All-World (Acc)", "world", "Xetra", "FTSE All-World", 0.22),
  etf("IWDA.AS", "iShares Core MSCI World (Acc)", "world", "Euronext Amsterdam", "MSCI World", 0.20),
  etf("SXR8.DE", "iShares Core S&P 500 (Acc)", "us", "Xetra", "S&P 500", 0.07),
  etf("VUSA.AS", "Vanguard S&P 500 (Dist)", "us", "Euronext Amsterdam", "S&P 500", 0.07),
  etf("EQQQ.DE", "Invesco EQQQ Nasdaq-100", "us", "Xetra", "Nasdaq-100", 0.30),
  etf("EXSA.DE", "iShares STOXX Europe 600", "eu", "Xetra", "STOXX Europe 600", 0.20),
  etf("EMIM.AS", "iShares Core MSCI EM IMI (Acc)", "em", "Euronext Amsterdam", "MSCI EM IMI", 0.18),
  etf("IUSN.DE", "iShares MSCI World Small Cap", "world", "Xetra", "MSCI World Small Cap", 0.35),
  etf("IQQ7.DE", "iShares Developed Markets Property Yield", "world", "Xetra", "Immobilier coté", 0.59, "realestate"),
  // ── Obligations ──
  etf("EUNA.DE", "iShares Core Global Aggregate Bond (EUR Hedged)", "world", "Xetra", "Obligations mondiales", 0.10, "bond", "bond"),
  etf("EUNH.DE", "iShares Core Euro Government Bond", "eu", "Xetra", "Obligations d'État zone euro", 0.07, "bond", "bond"),
  etf("SXRM.DE", "iShares USD Treasury Bond 7-10yr", "us", "Xetra", "Trésor US 7-10 ans", 0.07, "bond", "bond"),
  etf("IS04.DE", "iShares USD Treasury Bond 20+yr", "us", "Xetra", "Trésor US 20 ans et plus", 0.07, "bond", "bond"),
  etf("XEON.DE", "Xtrackers EUR Overnight Rate Swap", "eu", "Xetra", "Monétaire €STR", 0.10, "cash", "bond"),
  // ── Or et matières premières ──
  etf("4GLD.DE", "Xetra-Gold (ETC)", "world", "Xetra", "Or physique", 0.0, "gold", "commodity"),
  etf("EXXY.DE", "iShares Diversified Commodity Swap", "world", "Xetra", "Matières premières diversifiées", 0.19, "commodity", "commodity"),
  // ── Crypto en euros ──
  { s: "BTC-EUR", n: "Bitcoin", k: "crypto", r: "world", x: "Crypto 24/7", c: "EUR", sec: "Crypto", cls: "crypto" },
  { s: "ETH-EUR", n: "Ethereum", k: "crypto", r: "world", x: "Crypto 24/7", c: "EUR", sec: "Crypto", cls: "crypto" },
  { s: "SOL-EUR", n: "Solana", k: "crypto", r: "world", x: "Crypto 24/7", c: "EUR", sec: "Crypto", cls: "crypto" },
  // ── Actions européennes ──
  st("ASML.AS", "ASML Holding", "eu", "Euronext Amsterdam", "EUR", "Semi-conducteurs"),
  st("ADYEN.AS", "Adyen", "eu", "Euronext Amsterdam", "EUR", "Paiements"),
  st("INGA.AS", "ING Groep", "eu", "Euronext Amsterdam", "EUR", "Banques"),
  st("HEIA.AS", "Heineken", "eu", "Euronext Amsterdam", "EUR", "Boissons"),
  st("MC.PA", "LVMH", "eu", "Euronext Paris", "EUR", "Luxe"),
  st("OR.PA", "L'Oréal", "eu", "Euronext Paris", "EUR", "Cosmétiques"),
  st("TTE.PA", "TotalEnergies", "eu", "Euronext Paris", "EUR", "Énergie"),
  st("SAN.PA", "Sanofi", "eu", "Euronext Paris", "EUR", "Santé"),
  st("AIR.PA", "Airbus", "eu", "Euronext Paris", "EUR", "Aéronautique"),
  st("SU.PA", "Schneider Electric", "eu", "Euronext Paris", "EUR", "Équipements électriques"),
  st("BNP.PA", "BNP Paribas", "eu", "Euronext Paris", "EUR", "Banques"),
  st("ABI.BR", "AB InBev", "eu", "Euronext Bruxelles", "EUR", "Boissons"),
  st("UCB.BR", "UCB", "eu", "Euronext Bruxelles", "EUR", "Santé"),
  st("KBC.BR", "KBC Groupe", "eu", "Euronext Bruxelles", "EUR", "Banques"),
  st("SAP.DE", "SAP", "eu", "Xetra", "EUR", "Logiciels"),
  st("SIE.DE", "Siemens", "eu", "Xetra", "EUR", "Industrie"),
  st("ALV.DE", "Allianz", "eu", "Xetra", "EUR", "Assurance"),
  st("DTE.DE", "Deutsche Telekom", "eu", "Xetra", "EUR", "Télécoms"),
  st("RHM.DE", "Rheinmetall", "eu", "Xetra", "EUR", "Défense"),
  st("RACE.MI", "Ferrari", "eu", "Borsa Italiana", "EUR", "Automobile"),
  st("ITX.MC", "Inditex", "eu", "Bolsa de Madrid", "EUR", "Distribution"),
  st("IBE.MC", "Iberdrola", "eu", "Bolsa de Madrid", "EUR", "Services publics"),
  st("NESN.SW", "Nestlé", "eu", "SIX Swiss", "CHF", "Alimentation"),
  st("NOVN.SW", "Novartis", "eu", "SIX Swiss", "CHF", "Santé"),
  st("NOVO-B.CO", "Novo Nordisk", "eu", "Nasdaq Copenhague", "DKK", "Santé"),
  st("AZN.L", "AstraZeneca", "eu", "London Stock Exchange", "GBp", "Santé"),
  st("SHEL.L", "Shell", "eu", "London Stock Exchange", "GBp", "Énergie"),
  // ── Actions américaines ──
  st("AAPL", "Apple", "us", "Nasdaq", "USD", "Technologie"),
  st("MSFT", "Microsoft", "us", "Nasdaq", "USD", "Logiciels"),
  st("NVDA", "NVIDIA", "us", "Nasdaq", "USD", "Semi-conducteurs"),
  st("AMZN", "Amazon", "us", "Nasdaq", "USD", "Commerce en ligne"),
  st("GOOGL", "Alphabet (A)", "us", "Nasdaq", "USD", "Internet"),
  st("META", "Meta Platforms", "us", "Nasdaq", "USD", "Internet"),
  st("TSLA", "Tesla", "us", "Nasdaq", "USD", "Automobile"),
  st("AVGO", "Broadcom", "us", "Nasdaq", "USD", "Semi-conducteurs"),
  st("NFLX", "Netflix", "us", "Nasdaq", "USD", "Médias"),
  st("AMD", "Advanced Micro Devices", "us", "Nasdaq", "USD", "Semi-conducteurs"),
  st("BRK-B", "Berkshire Hathaway (B)", "us", "NYSE", "USD", "Holding"),
  st("JPM", "JPMorgan Chase", "us", "NYSE", "USD", "Banques"),
  st("V", "Visa", "us", "NYSE", "USD", "Paiements"),
  st("LLY", "Eli Lilly", "us", "NYSE", "USD", "Santé"),
  st("KO", "Coca-Cola", "us", "NYSE", "USD", "Boissons"),
  st("XOM", "Exxon Mobil", "us", "NYSE", "USD", "Énergie"),
  // ── ETF américains (sans KID) ──
  { s: "SPY", n: "SPDR S&P 500 ETF (US)", k: "etf", r: "us", x: "NYSE Arca", c: "USD", sec: "S&P 500", ter: 0.09, cls: "equity", priips: true },
  { s: "QQQ", n: "Invesco QQQ (US)", k: "etf", r: "us", x: "Nasdaq", c: "USD", sec: "Nasdaq-100", ter: 0.20, cls: "equity", priips: true },
  { s: "VTI", n: "Vanguard Total Stock Market (US)", k: "etf", r: "us", x: "NYSE Arca", c: "USD", sec: "Marché US total", ter: 0.03, cls: "equity", priips: true },
];

export const BY_SYMBOL: Record<string, Instrument> = Object.fromEntries(UNIVERSE.map((i) => [i.s, i]));

const SUFFIX: Record<string, { c: string; x: string; r: Region }> = {
  DE: { c: "EUR", x: "Xetra", r: "eu" }, F: { c: "EUR", x: "Francfort", r: "eu" }, PA: { c: "EUR", x: "Euronext Paris", r: "eu" },
  AS: { c: "EUR", x: "Euronext Amsterdam", r: "eu" }, BR: { c: "EUR", x: "Euronext Bruxelles", r: "eu" }, MI: { c: "EUR", x: "Borsa Italiana", r: "eu" },
  MC: { c: "EUR", x: "Bolsa de Madrid", r: "eu" }, LS: { c: "EUR", x: "Euronext Lisbonne", r: "eu" }, VI: { c: "EUR", x: "Vienne", r: "eu" },
  IR: { c: "EUR", x: "Euronext Dublin", r: "eu" }, HE: { c: "EUR", x: "Helsinki", r: "eu" }, L: { c: "GBp", x: "London Stock Exchange", r: "eu" },
  SW: { c: "CHF", x: "SIX Swiss", r: "eu" }, CO: { c: "DKK", x: "Nasdaq Copenhague", r: "eu" }, ST: { c: "SEK", x: "Nasdaq Stockholm", r: "eu" },
  OL: { c: "NOK", x: "Oslo", r: "eu" }, TO: { c: "CAD", x: "Toronto", r: "us" }, T: { c: "JPY", x: "Tokyo", r: "world" }, HK: { c: "HKD", x: "Hong Kong", r: "em" },
};

/** Best description for any symbol, curated or found through the search API. */
export function describe(symbol: string, hint?: { name?: string; type?: string; exchange?: string | null; ccy?: string }): Instrument {
  const known = BY_SYMBOL[symbol];
  if (known) return known;
  const isCrypto = /-(EUR|USD)$/i.test(symbol) || hint?.type === "Crypto" || hint?.type === "CRYPTOCURRENCY";
  if (isCrypto) return { s: symbol, n: hint?.name || symbol, k: "crypto", r: "world", x: "Crypto 24/7", c: hint?.ccy || (symbol.endsWith("-EUR") ? "EUR" : "USD"), cls: "crypto" };
  const m = symbol.match(/\.([A-Z]+)$/i);
  const suf = m ? SUFFIX[m[1].toUpperCase()] : undefined;
  const isEtf = hint?.type === "ETF" || hint?.type === "MUTUALFUND";
  const usFund = isEtf && !suf;
  return {
    s: symbol, n: hint?.name || symbol, k: isEtf ? "etf" : "stock", r: suf?.r || "us", x: hint?.exchange || suf?.x || "US", c: hint?.ccy || suf?.c || "USD",
    cls: "equity", priips: usFund || undefined,
  };
}

export const CLASS_COLORS: Record<AssetClass, string> = {
  equity: "#3B82F6", bond: "#14B8A6", gold: "#EAB308", commodity: "#F97316", realestate: "#A855F7", cash: "#94A3B8", crypto: "#EC4899",
};
