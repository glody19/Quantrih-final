export const UCITS_CATEGORIES = [
  {
    id: "world",
    title: "World Stocks (Global)",
    icon: "🌍",
    etfs: [
      { isin: "IE00B4L5Y983", ticker: "IWDA.AS", name: "iShares Core MSCI World UCITS ETF", ter: "0.20%", cap: "Large Cap", desc: "Core ETF - 1,500 developed companies, 70% USA" },
      { isin: "IE00BK5BQT80", ticker: "VWCE.DE", name: "Vanguard FTSE All-World UCITS ETF", ter: "0.22%", cap: "Large + Mid Cap", desc: "Global coverage including emerging markets (20%)" },
      { isin: "IE00BJ0KDQ92", ticker: "SPYI.DE", name: "Xtrackers MSCI ACWI IMI UCITS ETF", ter: "0.20%", cap: "All Cap", desc: "Total global capitalization - 2,900+ companies" }
    ]
  },
  {
    id: "us",
    title: "United States Stocks (USA)",
    icon: "🇺🇸",
    etfs: [
      { isin: "IE00B5BMR087", ticker: "CSPX.AS", name: "iShares Core S&P 500 UCITS ETF", ter: "0.07%", cap: "Large Cap", desc: "#1 US ETF in Europe - 500 largest US companies" },
      { isin: "IE00BFMXXD54", ticker: "VUSA.AS", name: "Vanguard S&P 500 UCITS ETF", ter: "0.07%", cap: "Large Cap", desc: "Low-fee alternative to iShares" },
      { isin: "IE0031442068", ticker: "SXRV.DE", name: "iShares Core NASDAQ 100 UCITS ETF", ter: "0.33%", cap: "Large Cap (Tech)", desc: "US Tech - 100 non-financial companies on NASDAQ" },
      { isin: "IE00BZ173V67", ticker: "EQQQ.MI", name: "Invesco EQQQ NASDAQ-100 UCITS ETF", ter: "0.30%", cap: "Large Cap", desc: "NASDAQ alternative" },
      { isin: "IE00BM67HT60", ticker: "XD9U.DE", name: "Xtrackers MSCI USA IMI UCITS ETF", ter: "0.15%", cap: "All Cap", desc: "Total USA - large + mid + small cap coverage" },
      { isin: "IE00B4WXJJ64", ticker: "ISP6.L", name: "iShares Core S&P Small-Cap 600", ter: "0.30%", cap: "Small Cap", desc: "US Small Caps - 600 small US companies" }
    ]
  },
  {
    id: "europe",
    title: "Europe Stocks",
    icon: "🇪🇺",
    etfs: [
      { isin: "IE00B4K48X80", ticker: "EXSA.DE", name: "iShares Core STOXX Europe 600 UCITS", ter: "0.20%", cap: "Large + Mid", desc: "#1 Europe ETF - 600 pan-European companies" },
      { isin: "LU0908500753", ticker: "MEUD.PA", name: "Lyxor Core STOXX Europe 600", ter: "0.07%", cap: "Large + Mid", desc: "Cheapest Europe ETF - same index as iShares" },
      { isin: "IE00B1YZSC51", ticker: "IMEU.AS", name: "iShares Core MSCI Europe UCITS ETF", ter: "0.12%", cap: "Large + Mid", desc: "MSCI Europe alternative (450 companies)" },
      { isin: "IE00B0M62Q58", ticker: "CSX5.AS", name: "iShares Core MSCI EMU UCITS ETF", ter: "0.12%", cap: "Large + Mid", desc: "Eurozone only - 20 countries (e.g. UK, Swiss excluded)" },
      { isin: "IE00B14X4M10", ticker: "ISF.L", name: "iShares Core FTSE 100 UCITS ETF", ter: "0.09%", cap: "Large Cap", desc: "United Kingdom - 100 largest UK companies" },
      { isin: "IE00B441G979", ticker: "EXS1.DE", name: "iShares Core DAX UCITS ETF", ter: "0.51%", cap: "Large Cap", desc: "Germany - 40 German companies" },
      { isin: "IE00B0M63148", ticker: "CAC.PA", name: "iShares Core CAC 40 UCITS ETF", ter: "0.32%", cap: "Large Cap", desc: "France - 40 French companies" },
      { isin: "IE00BKV55Z17", ticker: "CEU2.PA", name: "Amundi IS MSCI Europe Small Cap", ter: "0.30%", cap: "Small Cap", desc: "Europe Small Caps - 950+ European small caps" }
    ]
  },
  {
    id: "asia",
    title: "Asia-Pacific & Emerging Stocks",
    icon: "🌏",
    etfs: [
      { isin: "IE00B4L5YX21", ticker: "CPXJ.AS", name: "iShares Core MSCI Pacific ex-Japan", ter: "0.25%", cap: "Large Cap", desc: "Pacific - Australia, NZ, Hong Kong (excludes Japan)" },
      { isin: "IE00BQNKRK15", ticker: "CEMA.AS", name: "iShares Core MSCI EM Asia UCITS", ter: "0.25%", cap: "Large + Mid", desc: "Emerging Asia - China, Taiwan, India, Korea, Singapore" },
      { isin: "IE00B0M62R71", ticker: "IJPN.AS", name: "iShares Core MSCI Japan IMI", ter: "0.20%", cap: "All Cap", desc: "Total Japan - 2,200+ Japanese companies" },
      { isin: "IE00BYVQ9F29", ticker: "NDIA.L", name: "iShares Core MSCI India UCITS", ter: "0.24%", cap: "Large + Mid", desc: "India - 75+ Indian companies (growing economy)" },
      { isin: "IE00BQT3WG13", ticker: "XCS4.DE", name: "Xtrackers MSCI South Korea UCITS", ter: "0.40%", cap: "Large + Mid", desc: "South Korea - Samsung, SK Hynix, LG" }
    ]
  },
  {
    id: "sectors_tech",
    title: "Sectors & Themes",
    icon: "🔬",
    etfs: [
      { isin: "IE00B3VVMM84", ticker: "IUIT.L", name: "iShares S&P 500 Information Technology", ter: "0.15%", cap: "US Tech", desc: "Pure US Tech - Apple, Microsoft, NVIDIA, Broadcom" },
      { isin: "IE00BM67HW55", ticker: "XDWT.DE", name: "Xtrackers MSCI World IT", ter: "0.30%", cap: "World Tech", desc: "Global Tech - 150+ tech companies" },
      { isin: "IE00BZCQ2764", ticker: "SMH.L", name: "VanEck Semiconductor UCITS ETF", ter: "0.55%", cap: "Semis", desc: "US/Global Semis - NVIDIA, AMD, Broadcom, TSMC" },
      { isin: "IE00B3VW1128", ticker: "IUFS.L", name: "iShares S&P 500 Financials", ter: "0.15%", cap: "Finance", desc: "US Finance - JPMorgan, Bank of America, Visa" },
      { isin: "IE000YYE6WK5", ticker: "DFNS.L", name: "VanEck Defense UCITS ETF", ter: "0.55%", cap: "Defense", desc: "Global Defense - defense pure-play (50%+ revenue)" },
      { isin: "IE000WRQ9RR1", ticker: "ARMR.L", name: "Global X Europe Defence Tech", ter: "0.40%", cap: "Defense", desc: "Europe Defense Tech - Rheinmetall, Thales, Leonardo" }
    ]
  },
  {
    id: "factors",
    title: "Factor Strategies (Smart Beta)",
    icon: "📈",
    etfs: [
      { isin: "IE00B4L5ZX95", ticker: "IWVL.L", name: "iShares MSCI World Value UCITS", ter: "0.30%", cap: "Multi", desc: "World Value - companies with low P/E or P/B ratios" },
      { isin: "IE00BM67HK33", ticker: "XDEM.DE", name: "Xtrackers MSCI World Momentum", ter: "0.30%", cap: "Multi", desc: "Momentum - 6-12 month price momentum" },
      { isin: "IE00BM67HM86", ticker: "XDEQ.DE", name: "Xtrackers MSCI World Quality", ter: "0.30%", cap: "Multi", desc: "Quality - high ROE, low debt" },
      { isin: "IE00BM67HN93", ticker: "XDEV.DE", name: "Xtrackers MSCI World Low Volatility", ter: "0.30%", cap: "Multi", desc: "Low Volatility - defensive and stable companies" }
    ]
  },
  {
    id: "bonds",
    title: "Bonds (Fixed Income)",
    icon: "🏛️",
    etfs: [
      { isin: "IE00B4WXJJ64", ticker: "AGGG.L", name: "iShares Core Global Aggregate Bond", ter: "0.10%", cap: "~7 years", desc: "#1 global bond ETF (12,000+ global bonds)" },
      { isin: "IE00B3VVMM84", ticker: "CBU7.L", name: "iShares USD Treasury Bond 7-10yr", ter: "0.15%", cap: "8.5 years", desc: "US Treasuries 7-10Y - medium duration" },
      { isin: "IE00B4WXJK10", ticker: "IB01.L", name: "iShares USD Treasury Bond 0-1yr", ter: "0.10%", cap: "0.5 years", desc: "US T-Bills - very short term, near cash" },
      { isin: "IE00B4WXJN41", ticker: "IDTL.L", name: "iShares USD Treasury Bond 20+yr", ter: "0.15%", cap: "17 years", desc: "US Long Term - high interest rate sensitivity" },
      { isin: "IE00B1FZS798", ticker: "EUNA.DE", name: "iShares Core Euro Government Bond", ter: "0.09%", cap: "~8 years", desc: "#1 Euro Govt - 1,200+ eurozone government bonds" },
      { isin: "IE00B3VVMM92", ticker: "IEAC.L", name: "iShares Core EUR Corp Bond", ter: "0.10%", cap: "Corp IG", desc: "3,000+ eurozone corporate bonds (Investment Grade)" },
      { isin: "IE00B3VWZ162", ticker: "IHYU.L", name: "iShares USD High Yield Corp Bond", ter: "0.15%", cap: "Junk", desc: "USD High Yield - US high yield corporate bonds" }
    ]
  },
  {
    id: "commodities",
    title: "Commodities",
    icon: "🥇",
    etfs: [
      { isin: "IE00B4ND3602", ticker: "IGLN.L", name: "iShares Physical Gold ETC", ter: "0.12%", cap: "Gold", desc: "#1 physical gold - physical replication (1,000+ tons stored)" },
      { isin: "IE00BZCQFP70", ticker: "GDX.L", name: "VanEck Gold Miners UCITS ETF", ter: "0.55%", cap: "Gold Miners", desc: "Gold miners - Barrick, Newmont, Agnico" },
      { isin: "IE00B3VVMM00", ticker: "ISLN.L", name: "iShares Physical Silver ETC", ter: "0.20%", cap: "Silver", desc: "Physical silver - physical replication of silver" },
      { isin: "IE00BZCQJT18", ticker: "COMM.L", name: "VanEck Commodity Long UCITS ETF", ter: "0.55%", cap: "Oil/Gas", desc: "Multiple exposures: energy, metals, agriculture" }
    ]
  },
  {
    id: "leverage",
    title: "Leveraged ETFs",
    icon: "⚡",
    etfs: [
      { isin: "LU0378448740", ticker: "XNDX.DE", name: "Xtrackers NASDAQ 100 Daily (2x) Lev", ter: "0.95%", cap: "2x Leverage", desc: "NASDAQ 100 2x Leverage - double daily tech variation" },
      { isin: "FR0010655718", ticker: "LQQ.PA", name: "Lyxor CAC 40 Daily (2x) Leveraged", ter: "0.60%", cap: "2x Leverage", desc: "CAC 40 2x Leverage (LQQ)" },
      { isin: "JE00BQS1JC77", ticker: "QQQ3.L", name: "WisdomTree NASDAQ 100 3x Daily Lev", ter: "0.77%", cap: "3x Leverage", desc: "NASDAQ 3x Leverage - triple daily tech variation (Non-UCITS)" }
    ]
  }
];

export const getAllReferenceETFs = () => {
    const list: any[] = [];
    UCITS_CATEGORIES.forEach(cat => cat.etfs.forEach(etf => list.push(etf)));
    return list;
};
