const fs = require('fs');
let content = fs.readFileSync('src/components/pages/PortfolioBacktesting.tsx', 'utf8');

const startMarker = '{/* PARAMS */}';
const endMarker = '{/* RESULTS */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if(startIndex === -1 || endIndex === -1) {
  console.error("Could not find markers; startIndex:", startIndex, "endIndex:", endIndex);
  process.exit(1);
}

const replacement = `{/* PARAMETERS HEADER - HORIZONTAL LAYOUT */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-4 flex items-center gap-2">
            <Settings size={14} className="text-pv-blue" /> {t('common.parameters')}
          </h2>
          <button 
            onClick={runBacktest} 
            disabled={isRunning}
            className="py-2 px-6 bg-pv-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-pv-blue-l transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isRunning ? (
              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
            ) : (
              <><Play size={12} fill="currentColor" /> Run Backtest</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Column 1: General */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <TooltipLabel label="Initial Amount" tooltip="Capital de départ injecté dans le portefeuille au début de la simulation." />
              <input type="number" value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue" />
            </div>
            <div className="space-y-1.5">
              <TooltipLabel label="Rebalancing" tooltip="La fréquence à laquelle le portefeuille est ajusté pour revenir aux poids cibles initiaux." />
              <select value={rebalancing} onChange={e => setRebalancing(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue">
                <option value="none">None</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annually</option>
              </select>
            </div>
          </div>

          {/* Column 2: Currency & Fees */}
          <div className="space-y-4">
             <div className="space-y-1.5">
              <TooltipLabel label="Base Currency" tooltip="La devise principale utilisée pour tous les calculs de rendement et d'affichage." />
              <select value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-text-4 uppercase tracking-tighter">Buy Fee (%)</label>
                <input type="number" step="0.01" value={buyFee} onChange={e => setBuyFee(Number(e.target.value))} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-pv-blue" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-text-4 uppercase tracking-tighter">Sell Fee (%)</label>
                <input type="number" step="0.01" value={sellFee} onChange={e => setSellFee(Number(e.target.value))} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-pv-blue" />
              </div>
            </div>
          </div>

          {/* Column 3: Dividends & Benchmarks */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-text-4 uppercase tracking-tighter">Dividends</label>
              <select value={dividendHandling} onChange={e => setDividendHandling(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-xs font-bold outline-none focus:border-pv-blue">
                <option value="reinvest">Reinvest All</option>
                <option value="distribute">Distribute (Cash)</option>
              </select>
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="benchToggle" checked={includeBenchmark} onChange={e => setIncludeBenchmark(e.target.checked)} className="w-4 h-4 accent-pv-blue rounded cursor-pointer" />
                 <label htmlFor="benchToggle" className="text-[10px] font-black text-text-3 uppercase tracking-widest cursor-pointer">Compare Benchmark</label>
               </div>
               {includeBenchmark && (
                 <input type="text" value={benchmarkSymbol} onChange={e => setBenchmarkSymbol(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none uppercase focus:border-pv-blue" placeholder="e.g. SPY" />
               )}
            </div>
          </div>

          {/* Column 4: European Taxes */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-text-4 uppercase tracking-tighter">Slippage (%)</label>
              <input type="number" step="0.01" value={slippage} onChange={e => setSlippage(Number(e.target.value))} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-pv-blue" />
            </div>
            <div className="space-y-2 pt-1.5">
               <div className="flex items-start gap-2">
                 <input type="checkbox" id="euTaxes" checked={applyEUTaxes} onChange={e => setApplyEUTaxes(e.target.checked)} className="w-4 h-4 accent-pv-blue rounded mt-0.5 cursor-pointer" />
                 <label htmlFor="euTaxes" className="text-[10px] font-black text-text-3 uppercase tracking-widest cursor-pointer leading-tight">
                   Apply European Taxes
                   <span className="block text-text-4 font-normal text-[9px] normal-case tracking-normal mt-1">Simulate BE TOB (0.12%) & 30% dividend drag</span>
                 </label>
               </div>
            </div>
          </div>
        </div>

        {/* Portfolios Row */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-4">Portfolios Configuration</h3>
            <button onClick={addPortfolio} className="text-[10px] bg-pv-blue/10 text-pv-blue px-3 py-1.5 border border-pv-blue/20 rounded font-bold uppercase tracking-widest hover:bg-pv-blue/20 transition">+ Add Portfolio</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {portfolios.map((p, pIndex) => {
              const totalWeight = p.assets.reduce((sum, a) => sum + Number(a.weight), 0);
              return (
                <div key={p.id} className="bg-surface-2 p-4 rounded-xl border border-border space-y-3 relative group">
                  {portfolios.length > 1 && (
                    <button onClick={() => removePortfolio(p.id)} className="absolute -top-2 -right-2 bg-red text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  )}
                  <input type="text" value={p.name} onChange={e => {
                    const newP = [...portfolios];
                    newP[pIndex].name = e.target.value;
                    setPortfolios(newP);
                  }} className="w-full bg-transparent border-b border-border text-sm font-bold pb-1 outline-none focus:border-pv-blue mb-2" />
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {p.assets.map((a, aIdx) => (
                      <div key={aIdx} className="flex gap-2 items-center">
                         <input type="text" value={a.symbol} onChange={e => updateAsset(p.id, aIdx, 'symbol', e.target.value)} placeholder="Ticker" className="w-1/2 bg-surface text-xs p-1.5 border border-border rounded uppercase outline-none focus:border-pv-blue" />
                         <input type="number" value={a.weight} onChange={e => updateAsset(p.id, aIdx, 'weight', e.target.value)} placeholder="%" className="w-1/3 bg-surface text-xs font-mono p-1.5 border border-border rounded outline-none flex-1" />
                         <span className="text-[10px] mb-0.5 text-text-4">%</span>
                         {p.assets.length > 1 && (
                           <button onClick={() => removeAsset(p.id, aIdx)} className="text-text-4 hover:text-red leading-none mb-0.5 px-1 py-1">×</button>
                         )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <button onClick={() => addAsset(p.id)} className="text-[10px] text-text-4 hover:text-pv-blue font-bold uppercase tracking-widest">+ Asset</button>
                    <span className={cn("text-xs font-mono font-bold", totalWeight === 100 ? "text-green-500" : "text-red")}>{totalWeight}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red/10 border border-red/20 text-red text-xs rounded-lg mt-2">
            {error}
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      <div className="w-full">
`;

// Also fix the grid layout that was wrapping the old params
content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">', '<div className="flex flex-col gap-8">');
content = content.replace('<div className="lg:col-span-1 space-y-6">', '');
content = content.replace('<div className="lg:col-span-3 space-y-8">', '<div className="space-y-8">');

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('src/components/pages/PortfolioBacktesting.tsx', content);
