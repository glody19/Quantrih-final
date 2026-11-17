// ETF universe of the ETF overview page: funds for which live performance is available.
// Static facts (TER, replication, distribution policy, domicile, ISIN) are indicative and only filled
// in where they are well established; an empty field is shown as "-". The KID and the issuer's
// factsheet always prevail.

export type EtfClass = "equity" | "bond" | "commodity" | "realestate" | "crypto" | "cash";
export type EtfStrategy = "core" | "region" | "sector" | "factor" | "dividend" | "thematic" | "esg";
export type EtfWrapper = "UCITS" | "US";

export interface Etf {
  /** Symbol used for market data. */
  s: string;
  n: string;
  issuer: string;
  wrapper: EtfWrapper;
  cls: EtfClass;
  strategy: EtfStrategy;
  /** Exposure label. */
  focus: { en: string; fr: string };
  isin?: string;
  /** Total expense ratio in % per year. */
  ter?: number;
  policy?: "Acc" | "Dist";
  replication?: "Physical" | "Synthetic" | "Futures";
  domicile?: string;
}

type Row = [
  s: string, n: string, issuer: string, cls: EtfClass, strategy: EtfStrategy, en: string, fr: string,
  isin?: string, ter?: number, policy?: "Acc" | "Dist", replication?: "Physical" | "Synthetic" | "Futures", domicile?: string,
];

const U: Row[] = [
  // ── Equity, global and regional cores ──
  ["IWDA.AS", "iShares Core MSCI World", "iShares", "equity", "core", "World, developed", "Monde développé", "IE00B4L5Y983", 0.20, "Acc", "Physical", "IE"],
  ["SWRD.L", "SPDR MSCI World", "SPDR", "equity", "core", "World, developed", "Monde développé", "IE00BFY0GT14", 0.12, "Acc", "Physical", "IE"],
  ["XDWD.DE", "Xtrackers MSCI World 1C", "Xtrackers", "equity", "core", "World, developed", "Monde développé", "IE00BJ0KDQ92", 0.12, "Acc", "Physical", "IE"],
  ["CW8.PA", "Amundi MSCI World (swap)", "Amundi", "equity", "core", "World, developed", "Monde développé", "LU1681043599", 0.38, "Acc", "Synthetic", "LU"],
  ["VEVE.AS", "Vanguard FTSE Developed World", "Vanguard", "equity", "core", "World, developed", "Monde développé", "IE00BKX55T58", 0.12, "Dist", "Physical", "IE"],
  ["VWCE.DE", "Vanguard FTSE All-World (Acc)", "Vanguard", "equity", "core", "World, all countries", "Monde, tous pays", "IE00BK5BQT80", undefined, "Acc", "Physical", "IE"],
  ["VWRL.AS", "Vanguard FTSE All-World (Dist)", "Vanguard", "equity", "core", "World, all countries", "Monde, tous pays", "IE00B3RBWM25", undefined, "Dist", "Physical", "IE"],
  ["SSAC.L", "iShares MSCI ACWI", "iShares", "equity", "core", "World, all countries", "Monde, tous pays", "IE00B6R52259", 0.20, "Acc", "Physical", "IE"],
  ["IUSN.DE", "iShares MSCI World Small Cap", "iShares", "equity", "core", "World small caps", "Petites caps monde", "IE00BF4RFH31", 0.35, "Acc", "Physical", "IE"],
  ["CSPX.AS", "iShares Core S&P 500", "iShares", "equity", "region", "US large caps", "Grandes caps US", "IE00B5BMR087", 0.07, "Acc", "Physical", "IE"],
  ["VUSA.AS", "Vanguard S&P 500 (Dist)", "Vanguard", "equity", "region", "US large caps", "Grandes caps US", "IE00B3XXRP09", 0.07, "Dist", "Physical", "IE"],
  ["VUAA.DE", "Vanguard S&P 500 (Acc)", "Vanguard", "equity", "region", "US large caps", "Grandes caps US", "IE00BFMXXD54", 0.07, "Acc", "Physical", "IE"],
  ["ESE.PA", "BNP Paribas Easy S&P 500 (swap)", "BNP Paribas", "equity", "region", "US large caps", "Grandes caps US", "FR0011550185", undefined, "Acc", "Synthetic", "FR"],
  ["SXRV.DE", "iShares Nasdaq 100", "iShares", "equity", "region", "US tech heavy", "US à dominante tech", "IE00B53SZB19", undefined, "Acc", "Physical", "IE"],
  ["EQQQ.DE", "Invesco EQQQ Nasdaq-100", "Invesco", "equity", "region", "US tech heavy", "US à dominante tech", "IE0032077012", 0.30, "Dist", "Physical", "IE"],
  ["IMEU.AS", "iShares Core MSCI Europe", "iShares", "equity", "region", "Europe", "Europe", "IE00B1YZSC51", 0.12, "Dist", "Physical", "IE"],
  ["EXSA.DE", "iShares STOXX Europe 600", "iShares", "equity", "region", "Europe", "Europe", "DE0002635307", 0.20, "Dist", "Physical", "DE"],
  ["MEUD.PA", "Amundi Stoxx Europe 600", "Amundi", "equity", "region", "Europe", "Europe", "LU0908500753", 0.07, "Acc", "Physical", "LU"],
  ["SXRT.DE", "iShares Core EURO STOXX 50", "iShares", "equity", "region", "Eurozone", "Zone euro", "IE00B53L3W79", 0.10, "Acc", "Physical", "IE"],
  ["EXS1.DE", "iShares Core DAX", "iShares", "equity", "region", "Germany", "Allemagne", "DE0005933931", 0.16, "Acc", "Physical", "DE"],
  ["CAC.PA", "Amundi CAC 40", "Amundi", "equity", "region", "France", "France", "FR0007052782", 0.25, "Dist", "Physical", "FR"],
  ["ISF.L", "iShares Core FTSE 100", "iShares", "equity", "region", "United Kingdom", "Royaume-Uni", "IE0005042456", 0.07, "Dist", "Physical", "IE"],
  ["IJPA.AS", "iShares Core MSCI Japan IMI", "iShares", "equity", "region", "Japan", "Japon", "IE00B4L5YX21", 0.12, "Acc", "Physical", "IE"],
  ["CPXJ.AS", "iShares Core MSCI Pacific ex-Japan", "iShares", "equity", "region", "Pacific ex-Japan", "Pacifique hors Japon", "IE00B52MJY50", 0.20, "Acc", "Physical", "IE"],
  ["EMIM.AS", "iShares Core MSCI EM IMI", "iShares", "equity", "region", "Emerging markets", "Marchés émergents", "IE00BKM4GZ66", 0.18, "Acc", "Physical", "IE"],
  ["VFEM.AS", "Vanguard FTSE Emerging Markets", "Vanguard", "equity", "region", "Emerging markets", "Marchés émergents", "IE00B3VVMM84", 0.22, "Dist", "Physical", "IE"],
  ["XMME.DE", "Xtrackers MSCI Emerging Markets", "Xtrackers", "equity", "region", "Emerging markets", "Marchés émergents", "IE00BTJRMP35", 0.18, "Acc", "Physical", "IE"],
  ["NDIA.L", "iShares MSCI India", "iShares", "equity", "region", "India", "Inde", "IE00BZCQB185", 0.65, "Acc", "Physical", "IE"],
  // ── Factors and dividends ──
  ["IWVL.L", "iShares Edge MSCI World Value", "iShares", "equity", "factor", "Value", "Value", "IE00BP3QZB59", 0.25, "Acc", "Physical", "IE"],
  ["IWMO.L", "iShares Edge MSCI World Momentum", "iShares", "equity", "factor", "Momentum", "Momentum", "IE00BP3QZ825", 0.25, "Acc", "Physical", "IE"],
  ["IWQU.L", "iShares Edge MSCI World Quality", "iShares", "equity", "factor", "Quality", "Qualité", "IE00BP3QZ601", 0.25, "Acc", "Physical", "IE"],
  ["MVOL.L", "iShares Edge MSCI World Min Volatility", "iShares", "equity", "factor", "Minimum volatility", "Volatilité minimale", "IE00B8FHGS14", 0.30, "Acc", "Physical", "IE"],
  ["ZPRV.DE", "SPDR MSCI USA Small Cap Value Weighted", "SPDR", "equity", "factor", "US small cap value", "Small cap value US", "IE00BSPLC413", 0.30, "Acc", "Physical", "IE"],
  ["ZPRX.DE", "SPDR MSCI Europe Small Cap Value Weighted", "SPDR", "equity", "factor", "Europe small cap value", "Small cap value Europe", "IE00BSPLC298", 0.30, "Acc", "Physical", "IE"],
  ["VHYL.AS", "Vanguard FTSE All-World High Dividend Yield", "Vanguard", "equity", "dividend", "Global high dividend", "Dividendes élevés monde", "IE00B8GKDB10", 0.29, "Dist", "Physical", "IE"],
  ["TDIV.AS", "VanEck Developed Markets Dividend Leaders", "VanEck", "equity", "dividend", "Developed dividend leaders", "Leaders du dividende", "NL0011683594", 0.38, "Dist", "Physical", "NL"],
  ["ISPA.DE", "iShares STOXX Global Select Dividend 100", "iShares", "equity", "dividend", "Global select dividend", "Dividendes sélection monde", "DE000A0F5UH1", 0.46, "Dist", "Physical", "DE"],
  ["SUSW.L", "iShares MSCI World SRI", "iShares", "equity", "esg", "World SRI", "Monde ISR", "IE00BYX2JD69", 0.20, "Acc", "Physical", "IE"],
  // ── Sectors and themes ──
  ["IUIT.L", "iShares S&P 500 Information Technology", "iShares", "equity", "sector", "Technology", "Technologie", "IE00B3WJKG14", 0.15, "Acc", "Physical", "IE"],
  ["IUFS.L", "iShares S&P 500 Financials", "iShares", "equity", "sector", "Financials", "Finance", "IE00B4JNQZ49", 0.15, "Acc", "Physical", "IE"],
  ["IUHC.L", "iShares S&P 500 Health Care", "iShares", "equity", "sector", "Health care", "Santé", "IE00B43HR379", 0.15, "Acc", "Physical", "IE"],
  ["IUES.L", "iShares S&P 500 Energy", "iShares", "equity", "sector", "Energy", "Énergie", "IE00B42NKQ00", 0.15, "Acc", "Physical", "IE"],
  ["VVSM.DE", "VanEck Semiconductor", "VanEck", "equity", "thematic", "Semiconductors", "Semi-conducteurs", "IE00BMC38736", 0.35, "Acc", "Physical", "IE"],
  ["INRG.L", "iShares Global Clean Energy", "iShares", "equity", "thematic", "Clean energy", "Énergie propre", "IE00B1XNHC34", 0.65, "Dist", "Physical", "IE"],
  ["RBOT.L", "iShares Automation & Robotics", "iShares", "equity", "thematic", "Robotics", "Robotique", "IE00BYZK4552", 0.40, "Acc", "Physical", "IE"],
  ["LOCK.L", "iShares Digital Security", "iShares", "equity", "thematic", "Cybersecurity", "Cybersécurité", "IE00BG0J4C88", 0.40, "Acc", "Physical", "IE"],
  ["HEAL.L", "iShares Healthcare Innovation", "iShares", "equity", "thematic", "Healthcare innovation", "Innovation santé", "IE00BYZK4776", 0.40, "Acc", "Physical", "IE"],
  // ── Real estate ──
  ["IPRP.AS", "iShares European Property Yield", "iShares", "realestate", "core", "European listed property", "Immobilier coté Europe", "IE00B0M63284", 0.40, "Dist", "Physical", "IE"],
  ["IWDP.AS", "iShares Developed Markets Property Yield", "iShares", "realestate", "core", "Developed listed property", "Immobilier coté monde", "IE00B1FZS350", 0.59, "Dist", "Physical", "IE"],
  // ── Bonds and cash ──
  ["AGGH.AS", "iShares Core Global Aggregate Bond EUR Hedged", "iShares", "bond", "core", "Global aggregate, EUR hedged", "Agrégat monde, couvert EUR", "IE00BDBRDM35", 0.10, "Acc", "Physical", "IE"],
  ["IEGA.AS", "iShares Core Euro Government Bond", "iShares", "bond", "core", "Euro government", "États zone euro", "IE00B4WXJJ64", undefined, "Dist", "Physical", "IE"],
  ["IEAC.AS", "iShares Core Euro Corporate Bond", "iShares", "bond", "core", "Euro investment grade", "Entreprises euro IG", "IE00B3F81R35", undefined, "Dist", "Physical", "IE"],
  ["IHYG.AS", "iShares Euro High Yield Corporate Bond", "iShares", "bond", "core", "Euro high yield", "Haut rendement euro", "IE00B66F4759", 0.50, "Dist", "Physical", "IE"],
  ["IBCI.AS", "iShares Euro Inflation Linked Government Bond", "iShares", "bond", "core", "Euro inflation linked", "Indexées inflation euro", "IE00B0M62X26", undefined, "Acc", "Physical", "IE"],
  ["IBTS.L", "iShares USD Treasury Bond 1-3yr", "iShares", "bond", "core", "US Treasuries 1-3y", "Treasuries US 1-3 ans", "IE00B14X4S71", 0.07, "Dist", "Physical", "IE"],
  ["IBTM.L", "iShares USD Treasury Bond 7-10yr", "iShares", "bond", "core", "US Treasuries 7-10y", "Treasuries US 7-10 ans", "IE00B1FZS798", 0.07, "Dist", "Physical", "IE"],
  ["IDTL.L", "iShares USD Treasury Bond 20+yr", "iShares", "bond", "core", "US Treasuries 20y+", "Treasuries US 20 ans+", "IE00BSKRJZ44", 0.07, "Dist", "Physical", "IE"],
  ["IEMB.L", "iShares J.P. Morgan USD EM Bond", "iShares", "bond", "core", "Emerging sovereign, USD", "Souverains émergents, USD", "IE00B2NPKV68", 0.45, "Dist", "Physical", "IE"],
  ["XEON.DE", "Xtrackers EUR Overnight Rate Swap", "Xtrackers", "cash", "core", "Euro overnight rate", "Taux au jour le jour euro", "LU0290358497", 0.10, "Acc", "Synthetic", "LU"],
  // ── Commodities and crypto ──
  ["IGLN.L", "iShares Physical Gold ETC", "iShares", "commodity", "core", "Gold", "Or", "IE00B4ND3602", 0.12, undefined, "Physical", "IE"],
  ["SGLD.L", "Invesco Physical Gold ETC", "Invesco", "commodity", "core", "Gold", "Or", "IE00B579F325", 0.12, undefined, "Physical", "IE"],
  ["4GLD.DE", "Xetra-Gold", "Deutsche Börse Commodities", "commodity", "core", "Gold", "Or", "DE000A0S9GB0", undefined, undefined, "Physical", "DE"],
  ["PHAG.L", "WisdomTree Physical Silver", "WisdomTree", "commodity", "core", "Silver", "Argent", "JE00B1VS3333", 0.49, undefined, "Physical", "JE"],
  ["ICOM.L", "iShares Diversified Commodity Swap", "iShares", "commodity", "core", "Broad commodities", "Matières premières diversifiées", "IE00BDFL4P12", 0.19, "Acc", "Synthetic", "IE"],
  ["BTCE.DE", "ETC Group Physical Bitcoin", "ETC Group", "crypto", "core", "Bitcoin", "Bitcoin", "DE000A27Z304", 2.00, undefined, "Physical", "DE"],
];

// US-listed funds: US domicile, distributing. Not sold to EU retail investors (no PRIIPs KID).
type UsRow = [s: string, n: string, issuer: string, cls: EtfClass, strategy: EtfStrategy, en: string, fr: string, ter?: number, replication?: "Physical" | "Futures"];
const US: UsRow[] = [
  ["VTI", "Vanguard Total Stock Market", "Vanguard", "equity", "core", "US total market", "Marché US total", 0.03],
  ["VOO", "Vanguard S&P 500", "Vanguard", "equity", "core", "US large caps", "Grandes caps US", 0.03],
  ["SPY", "SPDR S&P 500", "SPDR", "equity", "core", "US large caps", "Grandes caps US", 0.0945],
  ["QQQ", "Invesco QQQ (Nasdaq 100)", "Invesco", "equity", "core", "US tech heavy", "US à dominante tech", 0.20],
  ["DIA", "SPDR Dow Jones Industrial Average", "SPDR", "equity", "core", "US blue chips", "Valeurs vedettes US", 0.16],
  ["IWM", "iShares Russell 2000", "iShares", "equity", "core", "US small caps", "Petites caps US", 0.19],
  ["IJR", "iShares Core S&P Small-Cap", "iShares", "equity", "core", "US small caps", "Petites caps US", 0.06],
  ["VT", "Vanguard Total World Stock", "Vanguard", "equity", "core", "World, all countries", "Monde, tous pays"],
  ["ACWI", "iShares MSCI ACWI", "iShares", "equity", "core", "World, all countries", "Monde, tous pays", 0.32],
  ["VXUS", "Vanguard Total International Stock", "Vanguard", "equity", "core", "World ex-US", "Monde hors US"],
  ["VEA", "Vanguard FTSE Developed Markets", "Vanguard", "equity", "region", "Developed ex-US", "Développés hors US"],
  ["EFA", "iShares MSCI EAFE", "iShares", "equity", "region", "Developed ex-US", "Développés hors US"],
  ["VWO", "Vanguard FTSE Emerging Markets", "Vanguard", "equity", "region", "Emerging markets", "Marchés émergents"],
  ["IEMG", "iShares Core MSCI Emerging Markets", "iShares", "equity", "region", "Emerging markets", "Marchés émergents", 0.09],
  ["VGK", "Vanguard FTSE Europe", "Vanguard", "equity", "region", "Europe", "Europe"],
  ["EWJ", "iShares MSCI Japan", "iShares", "equity", "region", "Japan", "Japon"],
  ["EWG", "iShares MSCI Germany", "iShares", "equity", "region", "Germany", "Allemagne"],
  ["EWU", "iShares MSCI United Kingdom", "iShares", "equity", "region", "United Kingdom", "Royaume-Uni"],
  ["EWQ", "iShares MSCI France", "iShares", "equity", "region", "France", "France"],
  ["EWI", "iShares MSCI Italy", "iShares", "equity", "region", "Italy", "Italie"],
  ["EWP", "iShares MSCI Spain", "iShares", "equity", "region", "Spain", "Espagne"],
  ["EWL", "iShares MSCI Switzerland", "iShares", "equity", "region", "Switzerland", "Suisse"],
  ["EWN", "iShares MSCI Netherlands", "iShares", "equity", "region", "Netherlands", "Pays-Bas"],
  ["EWD", "iShares MSCI Sweden", "iShares", "equity", "region", "Sweden", "Suède"],
  ["EPOL", "iShares MSCI Poland", "iShares", "equity", "region", "Poland", "Pologne"],
  ["GREK", "Global X MSCI Greece", "Global X", "equity", "region", "Greece", "Grèce"],
  ["TUR", "iShares MSCI Turkey", "iShares", "equity", "region", "Turkey", "Turquie"],
  ["EWC", "iShares MSCI Canada", "iShares", "equity", "region", "Canada", "Canada"],
  ["EWW", "iShares MSCI Mexico", "iShares", "equity", "region", "Mexico", "Mexique"],
  ["EWZ", "iShares MSCI Brazil", "iShares", "equity", "region", "Brazil", "Brésil"],
  ["ARGT", "Global X MSCI Argentina", "Global X", "equity", "region", "Argentina", "Argentine"],
  ["INDA", "iShares MSCI India", "iShares", "equity", "region", "India", "Inde"],
  ["MCHI", "iShares MSCI China", "iShares", "equity", "region", "China", "Chine"],
  ["FXI", "iShares China Large-Cap", "iShares", "equity", "region", "China large caps", "Grandes caps Chine"],
  ["KWEB", "KraneShares CSI China Internet", "KraneShares", "equity", "thematic", "China internet", "Internet chinois"],
  ["EWY", "iShares MSCI South Korea", "iShares", "equity", "region", "South Korea", "Corée du Sud"],
  ["EWT", "iShares MSCI Taiwan", "iShares", "equity", "region", "Taiwan", "Taïwan"],
  ["EWA", "iShares MSCI Australia", "iShares", "equity", "region", "Australia", "Australie"],
  ["VNM", "VanEck Vietnam", "VanEck", "equity", "region", "Vietnam", "Vietnam"],
  ["EZA", "iShares MSCI South Africa", "iShares", "equity", "region", "South Africa", "Afrique du Sud"],
  ["KSA", "iShares MSCI Saudi Arabia", "iShares", "equity", "region", "Saudi Arabia", "Arabie saoudite"],
  // factors and dividends
  ["VTV", "Vanguard Value", "Vanguard", "equity", "factor", "US value", "Value US", 0.04],
  ["VUG", "Vanguard Growth", "Vanguard", "equity", "factor", "US growth", "Croissance US", 0.04],
  ["VLUE", "iShares MSCI USA Value Factor", "iShares", "equity", "factor", "Value", "Value", 0.15],
  ["MTUM", "iShares MSCI USA Momentum Factor", "iShares", "equity", "factor", "Momentum", "Momentum", 0.15],
  ["QUAL", "iShares MSCI USA Quality Factor", "iShares", "equity", "factor", "Quality", "Qualité", 0.15],
  ["USMV", "iShares MSCI USA Min Vol Factor", "iShares", "equity", "factor", "Minimum volatility", "Volatilité minimale", 0.15],
  ["AVUV", "Avantis US Small Cap Value", "Avantis", "equity", "factor", "US small cap value", "Small cap value US", 0.25],
  ["SCHD", "Schwab US Dividend Equity", "Schwab", "equity", "dividend", "US dividend quality", "Dividendes US de qualité", 0.06],
  ["VYM", "Vanguard High Dividend Yield", "Vanguard", "equity", "dividend", "US high dividend", "Dividendes élevés US", 0.06],
  ["VIG", "Vanguard Dividend Appreciation", "Vanguard", "equity", "dividend", "US dividend growth", "Dividendes croissants US"],
  // sectors
  ["XLK", "Technology Select Sector SPDR", "SPDR", "equity", "sector", "Technology", "Technologie"],
  ["XLF", "Financial Select Sector SPDR", "SPDR", "equity", "sector", "Financials", "Finance"],
  ["XLE", "Energy Select Sector SPDR", "SPDR", "equity", "sector", "Energy", "Énergie"],
  ["XLV", "Health Care Select Sector SPDR", "SPDR", "equity", "sector", "Health care", "Santé"],
  ["XLI", "Industrial Select Sector SPDR", "SPDR", "equity", "sector", "Industrials", "Industrie"],
  ["XLU", "Utilities Select Sector SPDR", "SPDR", "equity", "sector", "Utilities", "Services publics"],
  ["XLY", "Consumer Discretionary Select Sector SPDR", "SPDR", "equity", "sector", "Consumer discretionary", "Consommation discrétionnaire"],
  ["XLP", "Consumer Staples Select Sector SPDR", "SPDR", "equity", "sector", "Consumer staples", "Consommation de base"],
  ["XLB", "Materials Select Sector SPDR", "SPDR", "equity", "sector", "Materials", "Matériaux"],
  ["XLC", "Communication Services Select Sector SPDR", "SPDR", "equity", "sector", "Communication", "Communication"],
  ["KRE", "SPDR S&P Regional Banking", "SPDR", "equity", "sector", "Regional banks", "Banques régionales", 0.35],
  ["KBE", "SPDR S&P Bank", "SPDR", "equity", "sector", "Banks", "Banques", 0.35],
  ["XBI", "SPDR S&P Biotech", "SPDR", "equity", "sector", "Biotech", "Biotechnologies", 0.35],
  ["IBB", "iShares Biotechnology", "iShares", "equity", "sector", "Biotech", "Biotechnologies"],
  ["ITB", "iShares US Home Construction", "iShares", "equity", "sector", "Home builders", "Construction résidentielle"],
  ["XME", "SPDR S&P Metals & Mining", "SPDR", "equity", "sector", "Metals and mining", "Métaux et mines", 0.35],
  ["JETS", "US Global Jets", "US Global", "equity", "sector", "Airlines", "Compagnies aériennes", 0.60],
  // themes
  ["SMH", "VanEck Semiconductor", "VanEck", "equity", "thematic", "Semiconductors", "Semi-conducteurs", 0.35],
  ["SOXX", "iShares Semiconductor", "iShares", "equity", "thematic", "Semiconductors", "Semi-conducteurs"],
  ["IGV", "iShares Expanded Tech-Software", "iShares", "equity", "thematic", "Software", "Logiciels"],
  ["ARKK", "ARK Innovation", "ARK", "equity", "thematic", "Disruptive innovation", "Innovation de rupture", 0.75],
  ["ARKG", "ARK Genomic Revolution", "ARK", "equity", "thematic", "Genomics", "Génomique", 0.75],
  ["ICLN", "iShares Global Clean Energy", "iShares", "equity", "thematic", "Clean energy", "Énergie propre"],
  ["TAN", "Invesco Solar", "Invesco", "equity", "thematic", "Solar", "Solaire"],
  ["LIT", "Global X Lithium & Battery Tech", "Global X", "equity", "thematic", "Lithium and batteries", "Lithium et batteries", 0.75],
  ["URA", "Global X Uranium", "Global X", "equity", "thematic", "Uranium", "Uranium", 0.69],
  ["URNM", "Sprott Uranium Miners", "Sprott", "equity", "thematic", "Uranium miners", "Mines d'uranium"],
  ["NLR", "VanEck Uranium & Nuclear", "VanEck", "equity", "thematic", "Nuclear", "Nucléaire"],
  ["COPX", "Global X Copper Miners", "Global X", "equity", "thematic", "Copper miners", "Mines de cuivre", 0.65],
  ["GDX", "VanEck Gold Miners", "VanEck", "equity", "thematic", "Gold miners", "Mines d'or", 0.51],
  ["GDXJ", "VanEck Junior Gold Miners", "VanEck", "equity", "thematic", "Junior gold miners", "Petites mines d'or"],
  ["SIL", "Global X Silver Miners", "Global X", "equity", "thematic", "Silver miners", "Mines d'argent", 0.65],
  ["ITA", "iShares US Aerospace & Defense", "iShares", "equity", "thematic", "Aerospace and defence", "Aéronautique et défense"],
  ["PPA", "Invesco Aerospace & Defense", "Invesco", "equity", "thematic", "Aerospace and defence", "Aéronautique et défense"],
  ["CIBR", "First Trust Nasdaq Cybersecurity", "First Trust", "equity", "thematic", "Cybersecurity", "Cybersécurité"],
  ["HACK", "Amplify Cybersecurity", "Amplify", "equity", "thematic", "Cybersecurity", "Cybersécurité", 0.60],
  ["SKYY", "First Trust Cloud Computing", "First Trust", "equity", "thematic", "Cloud", "Cloud", 0.60],
  ["BOTZ", "Global X Robotics & AI", "Global X", "equity", "thematic", "Robotics and AI", "Robotique et IA", 0.68],
  ["ROBO", "ROBO Global Robotics & Automation", "ROBO Global", "equity", "thematic", "Robotics", "Robotique", 0.95],
  ["AIQ", "Global X AI & Technology", "Global X", "equity", "thematic", "Artificial intelligence", "Intelligence artificielle", 0.68],
  ["FINX", "Global X FinTech", "Global X", "equity", "thematic", "Fintech", "Fintech", 0.68],
  ["BLOK", "Amplify Transformational Data Sharing", "Amplify", "equity", "thematic", "Blockchain equities", "Actions blockchain"],
  ["PAVE", "Global X US Infrastructure Development", "Global X", "equity", "thematic", "Infrastructure", "Infrastructures", 0.47],
  ["MOO", "VanEck Agribusiness", "VanEck", "equity", "thematic", "Agribusiness", "Agro-industrie"],
  ["PHO", "Invesco Water Resources", "Invesco", "equity", "thematic", "Water", "Eau"],
  // real estate
  ["VNQ", "Vanguard Real Estate", "Vanguard", "realestate", "core", "US REITs", "REIT US"],
  ["XLRE", "Real Estate Select Sector SPDR", "SPDR", "realestate", "core", "US REITs, large caps", "REIT US, grandes caps"],
  // bonds and cash
  ["BND", "Vanguard Total Bond Market", "Vanguard", "bond", "core", "US aggregate", "Agrégat US", 0.03],
  ["AGG", "iShares Core US Aggregate Bond", "iShares", "bond", "core", "US aggregate", "Agrégat US", 0.03],
  ["SHY", "iShares 1-3 Year Treasury Bond", "iShares", "bond", "core", "US Treasuries 1-3y", "Treasuries US 1-3 ans", 0.15],
  ["IEF", "iShares 7-10 Year Treasury Bond", "iShares", "bond", "core", "US Treasuries 7-10y", "Treasuries US 7-10 ans", 0.15],
  ["TLT", "iShares 20+ Year Treasury Bond", "iShares", "bond", "core", "US Treasuries 20y+", "Treasuries US 20 ans+", 0.15],
  ["TIP", "iShares TIPS Bond", "iShares", "bond", "core", "US inflation linked", "Indexées inflation US"],
  ["LQD", "iShares iBoxx USD Investment Grade Corporate", "iShares", "bond", "core", "US investment grade", "Entreprises US IG", 0.14],
  ["HYG", "iShares iBoxx USD High Yield Corporate", "iShares", "bond", "core", "US high yield", "Haut rendement US", 0.49],
  ["BIL", "SPDR Bloomberg 1-3 Month T-Bill", "SPDR", "cash", "core", "US T-bills 1-3m", "Bons du Trésor US 1-3 mois"],
  // commodities and crypto
  ["GLD", "SPDR Gold Shares", "SPDR", "commodity", "core", "Gold", "Or", 0.40, "Physical"],
  ["SLV", "iShares Silver Trust", "iShares", "commodity", "core", "Silver", "Argent", 0.50, "Physical"],
  ["PPLT", "abrdn Physical Platinum Shares", "abrdn", "commodity", "core", "Platinum", "Platine", 0.60, "Physical"],
  ["CPER", "United States Copper Index Fund", "USCF", "commodity", "core", "Copper", "Cuivre", undefined, "Futures"],
  ["USO", "United States Oil Fund", "USCF", "commodity", "core", "Crude oil", "Pétrole brut", undefined, "Futures"],
  ["UNG", "United States Natural Gas Fund", "USCF", "commodity", "core", "Natural gas", "Gaz naturel", undefined, "Futures"],
  ["DBA", "Invesco DB Agriculture", "Invesco", "commodity", "core", "Agriculture", "Agriculture", undefined, "Futures"],
  ["DBC", "Invesco DB Commodity Index Tracking", "Invesco", "commodity", "core", "Broad commodities", "Matières premières diversifiées", undefined, "Futures"],
  ["IBIT", "iShares Bitcoin Trust", "iShares", "crypto", "core", "Bitcoin", "Bitcoin", 0.25, "Physical"],
];

export const ETF_UNIVERSE: Etf[] = [
  ...U.map(([s, n, issuer, cls, strategy, en, fr, isin, ter, policy, replication, domicile]): Etf => ({
    s, n, issuer, wrapper: "UCITS", cls, strategy, focus: { en, fr }, isin, ter, policy, replication, domicile,
  })),
  ...US.map(([s, n, issuer, cls, strategy, en, fr, ter, replication]): Etf => ({
    s, n, issuer, wrapper: "US", cls, strategy, focus: { en, fr }, ter,
    policy: cls === "commodity" || cls === "crypto" ? undefined : "Dist",
    replication: replication ?? "Physical", domicile: "US",
  })),
];
