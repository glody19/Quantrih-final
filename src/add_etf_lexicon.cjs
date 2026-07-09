const fs = require('fs');
let edu = fs.readFileSync('src/components/pages/Education.tsx', 'utf8');

const etfSection = `
export const ETFS_DATA = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    nameFr: "FNB SPDR S&P 500",
    index: "S&P 500",
    provider: "State Street",
    strategy: "Passive tracking of large-cap US equities.",
    strategyFr: "Suivi passif des actions américaines à grande capitalisation.",
    fees: "0.09%",
    risk: "Moderate-High (Market Risk)"
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    nameFr: "FNB Invesco QQQ",
    index: "Nasdaq-100",
    provider: "Invesco",
    strategy: "Tracks 100 of the largest non-financial companies listed on the Nasdaq.",
    strategyFr: "Suit 100 des plus grandes entreprises non financières cotées au Nasdaq.",
    fees: "0.20%",
    risk: "High (Tech/Growth concentration)"
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    nameFr: "FNB Vanguard Total Stock Market",
    index: "CRSP US Total Market Index",
    provider: "Vanguard",
    strategy: "Broad exposure across large, mid, and small-cap US stocks.",
    strategyFr: "Exposition large aux actions américaines de toutes capitalisations.",
    fees: "0.03%",
    risk: "Moderate-High (Market Risk)"
  },
  {
    ticker: "TLT",
    name: "iShares 20+ Year Treasury Bond ETF",
    nameFr: "FNB iShares 20+ Year Treasury",
    index: "ICE US Treasury 20+ Year",
    provider: "iShares (BlackRock)",
    strategy: "Exposure to long-term US Treasury bonds.",
    strategyFr: "Exposition aux bons du Trésor américain à long terme.",
    fees: "0.15%",
    risk: "Moderate (Interest Rate Risk)"
  },
  {
    ticker: "GLD",
    name: "SPDR Gold Shares",
    nameFr: "FNB SPDR Gold Shares",
    index: "Gold Bullion",
    provider: "State Street",
    strategy: "Physically backed gold trust tracking the price of gold.",
    strategyFr: "Fonds adossé à de l'or physique suivant le prix de l'or.",
    fees: "0.40%",
    risk: "Moderate (Commodity volatility)"
  },
  {
    ticker: "EEM",
    name: "iShares MSCI Emerging Markets ETF",
    nameFr: "FNB iShares MSCI Emerging Markets",
    index: "MSCI Emerging Markets Index",
    provider: "iShares (BlackRock)",
    strategy: "Exposure to large and mid-cap emerging market equities.",
    strategyFr: "Exposition aux actions de grandes et moyennes capitalisations des marchés émergents.",
    fees: "0.68%",
    risk: "High (Geopolitical/Currency Risk)"
  },
  {
    ticker: "VWO",
    name: "Vanguard Emerging Markets Stock Index Fund ETF",
    nameFr: "FNB Vanguard Emerging Markets",
    index: "FTSE Emerging Markets All Cap",
    provider: "Vanguard",
    strategy: "Invests in stocks of companies located in emerging markets worldwide.",
    strategyFr: "Investit dans des actions d'entreprises situées sur les marchés émergents mondiaux.",
    fees: "0.08%",
    risk: "High (Emerging Markets Risk)"
  },
  {
    ticker: "IWM",
    name: "iShares Russell 2000 ETF",
    nameFr: "FNB iShares Russell 2000",
    index: "Russell 2000 Index",
    provider: "iShares (BlackRock)",
    strategy: "Tracks small-cap U.S. equities.",
    strategyFr: "Suit les actions américaines à petite capitalisation.",
    fees: "0.19%",
    risk: "High (Small Cap Volatility)"
  },
  {
    ticker: "ARKK",
    name: "ARK Innovation ETF",
    nameFr: "FNB ARK Innovation",
    index: "Actively Managed",
    provider: "ARK Invest",
    strategy: "Active management focusing on disruptive innovation (genomics, fintech, web3).",
    strategyFr: "Gestion active axée sur l'innovation de rupture (génomique, fintech, web3).",
    fees: "0.75%",
    risk: "Very High (Concentration/Growth Reversal)"
  },
  {
    ticker: "XLF",
    name: "Financial Select Sector SPDR Fund",
    nameFr: "FNB Financial Select Sector SPDR",
    index: "Financial Select Sector",
    provider: "State Street",
    strategy: "Tracks the financial sector of the S&P 500.",
    strategyFr: "Suit le secteur financier du S&P 500.",
    fees: "0.10%",
    risk: "Moderate-High (Sector specific)"
  }
];

function EtfLexicon({ language, search }: { language: string, search: string }) {
  const filtered = ETFS_DATA.filter(etf => 
    etf.ticker.toLowerCase().includes(search.toLowerCase()) || 
    etf.name.toLowerCase().includes(search.toLowerCase()) ||
    etf.nameFr.toLowerCase().includes(search.toLowerCase()) ||
    etf.strategy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
       <div className="flex items-center gap-3 mb-8">
          <Database size={16} className="text-pv-blue" />
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-text-2">
            {language === 'fr' ? 'Lexique Global des ETF' : 'Global ETF Lexicon'}
          </h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((etf, i) => (
             <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:border-pv-blue hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center font-bold text-text">
                         {etf.provider.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-base font-black text-text leading-tight">{etf.ticker}</h3>
                         <div className="text-[10px] uppercase font-bold text-text-4 tracking-widest">{etf.provider}</div>
                      </div>
                   </div>
                   <div className="bg-pv-blue-bg text-pv-blue px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest hidden sm:block">
                      ETF
                   </div>
                </div>
                
                <h4 className="text-sm font-medium text-text-2 mb-4 leading-tight">
                  {language === 'fr' ? etf.nameFr : etf.name}
                </h4>

                <div className="space-y-4 text-xs">
                   <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-bold text-text-4 uppercase tracking-wider">{language === 'fr' ? 'Indice' : 'Index'}</span>
                      <span className="font-medium text-text">{etf.index}</span>
                   </div>
                   <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-bold text-text-4 uppercase tracking-wider">{language === 'fr' ? 'Frais' : 'TER (Fees)'}</span>
                      <span className="font-medium text-text">{etf.fees}</span>
                   </div>
                   <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-bold text-text-4 uppercase tracking-wider">{language === 'fr' ? 'Risque' : 'Risk'}</span>
                      <span className="font-medium text-rose-500">{etf.risk}</span>
                   </div>
                   <div className="grid grid-cols-[100px_1fr] gap-2 pt-2 border-t border-border">
                      <span className="font-bold text-text-4 uppercase tracking-wider">{language === 'fr' ? 'Stratégie' : 'Strategy'}</span>
                      <span className="font-medium text-text-3 leading-relaxed">{language === 'fr' ? etf.strategyFr : etf.strategy}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </section>
  );
}
`;

if (!edu.includes('EtfLexicon')) {
   edu = edu + '\n' + etfSection;
   fs.writeFileSync('src/components/pages/Education.tsx', edu, 'utf8');
}
