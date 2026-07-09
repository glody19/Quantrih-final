export const UCITS_CATEGORIES = [
  {
    id: "world",
    title: "Actions Monde (Global)",
    icon: "🌍",
    etfs: [
      { isin: "IE00B4L5Y983", ticker: "IWDA.AS", name: "iShares Core MSCI World UCITS ETF", ter: "0.20%", cap: "Large Cap", desc: "ETF de base - 1 500 entreprises développées, 70% USA" },
      { isin: "IE00BK5BQT80", ticker: "VWCE.DE", name: "Vanguard FTSE All-World UCITS ETF", ter: "0.22%", cap: "Large + Mid Cap", desc: "Couverture mondiale avec les marchés émergents inclus (20%)" },
      { isin: "IE00BJ0KDQ92", ticker: "SPYI.DE", name: "Xtrackers MSCI ACWI IMI UCITS ETF", ter: "0.20%", cap: "All Cap", desc: "Capitalisation totale mondiale - 2 900+ entreprises" }
    ]
  },
  {
    id: "us",
    title: "Actions États-Unis (USA)",
    icon: "🇺🇸",
    etfs: [
      { isin: "IE00B5BMR087", ticker: "CSPX.AS", name: "iShares Core S&P 500 UCITS ETF", ter: "0.07%", cap: "Large Cap", desc: "ETF US #1 en Europe - 500 plus grandes entreprises US" },
      { isin: "IE00BFMXXD54", ticker: "VUSA.AS", name: "Vanguard S&P 500 UCITS ETF", ter: "0.07%", cap: "Large Cap", desc: "Alternative faibles frais à iShares" },
      { isin: "IE0031442068", ticker: "SXRV.DE", name: "iShares Core NASDAQ 100 UCITS ETF", ter: "0.33%", cap: "Large Cap (Tech)", desc: "Tech US - 100 entreprises non-financières du NASDAQ" },
      { isin: "IE00BZ173V67", ticker: "EQQQ.MI", name: "Invesco EQQQ NASDAQ-100 UCITS ETF", ter: "0.30%", cap: "Large Cap", desc: "Alternative NASDAQ" },
      { isin: "IE00BM67HT60", ticker: "XD9U.DE", name: "Xtrackers MSCI USA IMI UCITS ETF", ter: "0.15%", cap: "All Cap", desc: "USA total - couverture large + mid + small cap" },
      { isin: "IE00B4WXJJ64", ticker: "ISP6.L", name: "iShares Core S&P Small-Cap 600", ter: "0.30%", cap: "Small Cap", desc: "Small Caps US - 600 petites entreprises US" }
    ]
  },
  {
    id: "europe",
    title: "Actions Europe",
    icon: "🇪🇺",
    etfs: [
      { isin: "IE00B4K48X80", ticker: "EXSA.DE", name: "iShares Core STOXX Europe 600 UCITS", ter: "0.20%", cap: "Large + Mid", desc: "ETF Europe #1 - 600 entreprises pan-européennes" },
      { isin: "LU0908500753", ticker: "MEUD.PA", name: "Lyxor Core STOXX Europe 600", ter: "0.07%", cap: "Large + Mid", desc: "ETF Europe le moins cher - même indice que iShares" },
      { isin: "IE00B1YZSC51", ticker: "IMEU.AS", name: "iShares Core MSCI Europe UCITS ETF", ter: "0.12%", cap: "Large + Mid", desc: "Alternative MSCI Europe (450 entreprises)" },
      { isin: "IE00B0M62Q58", ticker: "CSX5.AS", name: "iShares Core MSCI EMU UCITS ETF", ter: "0.12%", cap: "Large + Mid", desc: "Zone Euro uniquement - 20 pays (ex: UK, Suisse exclus)" },
      { isin: "IE00B14X4M10", ticker: "ISF.L", name: "iShares Core FTSE 100 UCITS ETF", ter: "0.09%", cap: "Large Cap", desc: "Royaume-Uni - 100 plus grandes entreprises UK" },
      { isin: "IE00B441G979", ticker: "EXS1.DE", name: "iShares Core DAX UCITS ETF", ter: "0.51%", cap: "Large Cap", desc: "Allemagne - 40 entreprises allemandes" },
      { isin: "IE00B0M63148", ticker: "CAC.PA", name: "iShares Core CAC 40 UCITS ETF", ter: "0.32%", cap: "Large Cap", desc: "France - 40 entreprises françaises" },
      { isin: "IE00BKV55Z17", ticker: "CEU2.PA", name: "Amundi IS MSCI Europe Small Cap", ter: "0.30%", cap: "Small Cap", desc: "Europe Small Caps - 950+ petites capitalisations européennes" }
    ]
  },
  {
    id: "asia",
    title: "Actions Asie-Pacifique & Émergents",
    icon: "🌏",
    etfs: [
      { isin: "IE00B4L5YX21", ticker: "CPXJ.AS", name: "iShares Core MSCI Pacific ex-Japan", ter: "0.25%", cap: "Large Cap", desc: "Pacifique - Australie, NZ, Hong Kong (exclut Japon)" },
      { isin: "IE00BQNKRK15", ticker: "CEMA.AS", name: "iShares Core MSCI EM Asia UCITS", ter: "0.25%", cap: "Large + Mid", desc: "Asie Émergente - Chine, Taiwan, Inde, Corée, Singapour" },
      { isin: "IE00B0M62R71", ticker: "IJPN.AS", name: "iShares Core MSCI Japan IMI", ter: "0.20%", cap: "All Cap", desc: "Japon total - 2 200+ entreprises japonaises" },
      { isin: "IE00BYVQ9F29", ticker: "NDIA.L", name: "iShares Core MSCI India UCITS", ter: "0.24%", cap: "Large + Mid", desc: "Inde - 75+ entreprises indiennes (économie croissante)" },
      { isin: "IE00BQT3WG13", ticker: "XCS4.DE", name: "Xtrackers MSCI South Korea UCITS", ter: "0.40%", cap: "Large + Mid", desc: "Corée du Sud - Samsung, SK Hynix, LG" }
    ]
  },
  {
    id: "sectors_tech",
    title: "Secteurs & Thématiques",
    icon: "🔬",
    etfs: [
      { isin: "IE00B3VVMM84", ticker: "IUIT.L", name: "iShares S&P 500 Information Technology", ter: "0.15%", cap: "Tech US", desc: "Tech US pure - Apple, Microsoft, NVIDIA, Broadcom" },
      { isin: "IE00BM67HW55", ticker: "XDWT.DE", name: "Xtrackers MSCI World IT", ter: "0.30%", cap: "Tech Mondiale", desc: "Tech mondiale - 150+ entreprises tech" },
      { isin: "IE00BZCQ2764", ticker: "SMH.L", name: "VanEck Semiconductor UCITS ETF", ter: "0.55%", cap: "Semis", desc: "Semis US/Global - NVIDIA, AMD, Broadcom, TSMC" },
      { isin: "IE00B3VW1128", ticker: "IUFS.L", name: "iShares S&P 500 Financials", ter: "0.15%", cap: "Finance", desc: "Finance US - JPMorgan, Bank of America, Visa" },
      { isin: "IE000YYE6WK5", ticker: "DFNS.L", name: "VanEck Defense UCITS ETF", ter: "0.55%", cap: "Défense", desc: "Défense mondiale - pure-play défense (50%+ CA)" },
      { isin: "IE000WRQ9RR1", ticker: "ARMR.L", name: "Global X Europe Defence Tech", ter: "0.40%", cap: "Défense", desc: "Tech défense Europe - Rheinmetall, Thales, Leonardo" }
    ]
  },
  {
    id: "factors",
    title: "Stratégies Factorielles (Smart Beta)",
    icon: "📈",
    etfs: [
      { isin: "IE00B4L5ZX95", ticker: "IWVL.L", name: "iShares MSCI World Value UCITS", ter: "0.30%", cap: "Multi", desc: "Value Mondiale - entreprises avec PER/PBV bas" },
      { isin: "IE00BM67HK33", ticker: "XDEM.DE", name: "Xtrackers MSCI World Momentum", ter: "0.30%", cap: "Multi", desc: "Momentum - dynamique de prix sur 6-12 mois" },
      { isin: "IE00BM67HM86", ticker: "XDEQ.DE", name: "Xtrackers MSCI World Quality", ter: "0.30%", cap: "Multi", desc: "Qualité - haut ROE, endettement faible" },
      { isin: "IE00BM67HN93", ticker: "XDEV.DE", name: "Xtrackers MSCI World Low Volatility", ter: "0.30%", cap: "Multi", desc: "Basse Volatilité - entreprises défensives et stables" }
    ]
  },
  {
    id: "bonds",
    title: "Obligations (Fixed Income)",
    icon: "🏛️",
    etfs: [
      { isin: "IE00B4WXJJ64", ticker: "AGGG.L", name: "iShares Core Global Aggregate Bond", ter: "0.10%", cap: "~7 ans", desc: "Obligation globale #1 (12 000+ obligations monde)" },
      { isin: "IE00B3VVMM84", ticker: "CBU7.L", name: "iShares USD Treasury Bond 7-10yr", ter: "0.15%", cap: "8.5 ans", desc: "US Treasuries 7-10Y - durée moyenne" },
      { isin: "IE00B4WXJK10", ticker: "IB01.L", name: "iShares USD Treasury Bond 0-1yr", ter: "0.10%", cap: "0.5 ans", desc: "US T-Bills - très court terme, quasi cash" },
      { isin: "IE00B4WXJN41", ticker: "IDTL.L", name: "iShares USD Treasury Bond 20+yr", ter: "0.15%", cap: "17 ans", desc: "US Long Term - sensibilité élevée aux taux" },
      { isin: "IE00B1FZS798", ticker: "EUNA.DE", name: "iShares Core Euro Government Bond", ter: "0.09%", cap: "~8 ans", desc: "Euro Govt #1 - 1 200+ obligations publiques zone euro" },
      { isin: "IE00B3VVMM92", ticker: "IEAC.L", name: "iShares Core EUR Corp Bond", ter: "0.10%", cap: "Corp IG", desc: "3 000+ obligations entreprises zone euro (Investment Grade)" },
      { isin: "IE00B3VWZ162", ticker: "IHYU.L", name: "iShares USD High Yield Corp Bond", ter: "0.15%", cap: "Junk", desc: "USD High Yield - obligations US à haut rendement" }
    ]
  },
  {
    id: "commodities",
    title: "Matières Premières (Commodities)",
    icon: "🥇",
    etfs: [
      { isin: "IE00B4ND3602", ticker: "IGLN.L", name: "iShares Physical Gold ETC", ter: "0.12%", cap: "Or", desc: "Or physique #1 - réplication physique (1 000+ tonnes stockées)" },
      { isin: "IE00BZCQFP70", ticker: "GDX.L", name: "VanEck Gold Miners UCITS ETF", ter: "0.55%", cap: "Mines Or", desc: "Mines d'or - Barrick, Newmont, Agnico" },
      { isin: "IE00B3VVMM00", ticker: "ISLN.L", name: "iShares Physical Silver ETC", ter: "0.20%", cap: "Argent", desc: "Argent physique - réplication physique argent" },
      { isin: "IE00BZCQJT18", ticker: "COMM.L", name: "VanEck Commodity Long UCITS ETF", ter: "0.55%", cap: "Pétrole/Gaz", desc: "Expositions multiples énergie, métaux, agriculture" }
    ]
  },
  {
    id: "leverage",
    title: "ETFs à Effet de Levier",
    icon: "⚡",
    etfs: [
      { isin: "LU0378448740", ticker: "XNDX.DE", name: "Xtrackers NASDAQ 100 Daily (2x) Lev", ter: "0.95%", cap: "Levier x2", desc: "NASDAQ 100 Levier x2 - double variation quotidienne tech" },
      { isin: "FR0010655718", ticker: "LQQ.PA", name: "Lyxor CAC 40 Daily (2x) Leveraged", ter: "0.60%", cap: "Levier x2", desc: "CAC 40 Levier x2 (LQQ)" },
      { isin: "JE00BQS1JC77", ticker: "QQQ3.L", name: "WisdomTree NASDAQ 100 3x Daily Lev", ter: "0.77%", cap: "Levier x3", desc: "NASDAQ Levier x3 - triple variation quotidienne tech (Non-UCITS)" }
    ]
  }
];

export const getAllReferenceETFs = () => {
    const list = [];
    UCITS_CATEGORIES.forEach(cat => cat.etfs.forEach(etf => list.push(etf)));
    return list;
};
