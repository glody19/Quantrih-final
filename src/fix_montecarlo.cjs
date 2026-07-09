const fs = require('fs');

let content = fs.readFileSync('src/components/pages/MonteCarlo.tsx', 'utf8');

// 1. Rename title
content = content.replace(
  /<Settings size=\{14\} className=\"text-pv-blue\" \/> Simulation Model Configuration/g,
  '<Settings size={14} className="text-pv-blue" /> {language === "fr" ? "Paramètres" : "Parameters"}'
);

// 2. Change grid-cols-4 to grid-cols-3
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6"/g,
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6"'
);

const col4Regex = /\{\/\* Col 4 - Asset Allocation form embedded \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\{\/\* RESULTS SECTION \*\/})/m;

const newAssetTable = `
      <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mt-6 col-span-1 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text flex items-center gap-2 mb-2">
            Portfolio Assets Allocation
          </h3>
          <span className={cn("text-xs font-mono font-bold", totalWeight === 100 ? "text-emerald-500" : "text-red")}>
            Total: {totalWeight}%
          </span>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text">
                <th className="font-semibold py-3 px-4 text-sm w-[120px]">Asset</th>
                <th className="font-semibold py-3 px-4 text-sm w-[140px]">{language === 'fr' ? 'Allocation' : 'Allocation'}</th>
                <th className="font-semibold py-3 px-4 text-sm w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, aIdx) => (
                <tr key={aIdx} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="py-2 px-4">
                    <TickerInput 
                      value={asset.symbol} 
                      onChange={val => {
                        const newA = [...assets];
                        newA[aIdx].symbol = val;
                        setAssets(newA);
                      }} 
                      placeholder="e.g. SPY" 
                      className="bg-surface text-sm p-2 border border-border rounded-xl outline-none focus:border-pv-blue transition-colors w-full box-border font-mono font-bold" 
                    />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex w-full box-border group">
                      <input 
                        type="number" 
                        step="1" 
                        value={asset.weight || ''} 
                        onChange={e => {
                          const newA = [...assets];
                          newA[aIdx].weight = Number(e.target.value);
                          setAssets(newA);
                        }} 
                        className="bg-surface text-sm p-2 border border-border rounded-l-md outline-none focus:border-pv-blue transition-colors w-full box-border text-text font-bold" 
                      />
                      <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-2 py-2 text-xs text-text shrink-0 select-none">%</div>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => setAssets(assets.filter((_, idx) => idx !== aIdx))} className="text-text hover:text-red transition-colors p-1 rounded-xl hover:bg-surface-3">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-surface-2 border-t border-border border-dashed font-sans">
          <button onClick={() => setAssets([...assets, {symbol: '', weight: 0}])} className="text-xs font-bold text-pv-blue hover:underline">
            + Add more assets
          </button>
        </div>
      </div>`;

content = content.replace(col4Regex, newAssetTable);

fs.writeFileSync('src/components/pages/MonteCarlo.tsx', content);
