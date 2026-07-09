const fs = require('fs');

let content = fs.readFileSync('src/components/pages/AssetAllocations.tsx', 'utf8');

// 1. Remove numPortfolios state
content = content.replace(/const \[numPortfolios, setNumPortfolios\] = useState\(5\);\n/g, '');

// 2. Add addPortfolio and removePortfolio methods under updatePortfolioName
const methodsToAdd = `  const addPortfolio = () => {
    if (portfolioNames.length >= 6) return;
    const newId = Date.now().toString();
    setPortfolioNames([...portfolioNames, { id: newId, name: \`Portfolio \${portfolioNames.length + 1}\` }]);
    setPortfolioAssets(portfolioAssets.map(a => ({ ...a, weights: [...a.weights, ''] })));
  };

  const removePortfolio = (idx: number) => {
    setPortfolioNames(portfolioNames.filter((_, i) => i !== idx));
    setPortfolioAssets(portfolioAssets.map(a => ({ ...a, weights: a.weights.filter((_, i) => i !== idx) })));
  };
`;

content = content.replace(/  const updatePortfolioName = /, methodsToAdd + '\n  const updatePortfolioName = ');

// 3. remove if(data.numPortfolios) setNumPortfolios(data.numPortfolios);
content = content.replace(/if\(data\.numPortfolios\) setNumPortfolios\(data\.numPortfolios\);\n/g, '');

// 4. Update definition of portfolios
content = content.replace(/const portfolios = portfolioNames\.slice\(0, numPortfolios\)\.map/g, 'const portfolios = portfolioNames.map');

// 5. Update lookups
content = content.replace(/Math\.min\(portfolios\.length, numPortfolios\)/g, 'portfolios.length');

content = content.replace(/portfolioNames\.slice\(0, numPortfolios\)\.map/g, 'portfolioNames.map');

// 6. Update HTML elements: replace the P1,P2,P3 buttons with + Add Portfolio
const oldHTML = /<div className="flex bg-surface-2 p-1 rounded-2xl border border-border">[\s\S]*?<\/div>\s*<\/div>\s*<div className="w-full overflow-x-auto/m;
const newHTML = `<button onClick={addPortfolio} className="text-[10px] bg-pv-blue/10 text-pv-blue px-3 py-1.5 border border-pv-blue/20 rounded font-bold uppercase tracking-widest hover:bg-pv-blue/20 transition-colors">+ Add Portfolio</button>
           </div>
           
           <div className="w-full overflow-x-auto`;

content = content.replace(oldHTML, newHTML);

// 7. Add Settings / Trash icon to remove portfolio in headers
const oldTh = /<th key=\{pn\.id\} className="p-3 text-sm font-semibold min-w-\[140px\] text-center group">\s*<div className="flex items-center justify-center gap-2">\s*<input\s*type="text"\s*value=\{pn\.name\}\s*onChange=\{e => updatePortfolioName\(i, e\.target\.value\)\}\s*className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0\.5 text-center font-bold text-text"\s*placeholder=\{`Portfolio #\$\{i \+ 1\}`\}\s*\/>\s*<\/div>\s*<\/th>/g;

const newTh = `<th key={pn.id} className="p-3 text-sm font-semibold min-w-[140px] text-center group">
                        <div className="flex items-center justify-center gap-2">
                          <input 
                             type="text" 
                             value={pn.name} 
                             onChange={e => updatePortfolioName(i, e.target.value)} 
                             className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text" 
                             placeholder={\`Portfolio #\${i + 1}\`}
                          />
                          {portfolioNames.length > 1 && (
                              <button onClick={() => removePortfolio(i)} className="text-text-3 hover:text-red transition-colors">
                                <Settings className="w-4 h-4" />
                              </button>
                          )}
                        </div>
                      </th>`;

content = content.replace(oldTh, newTh);

fs.writeFileSync('src/components/pages/AssetAllocations.tsx', content);
console.log('Done rewriting AssetAllocations portfolios functionality');
