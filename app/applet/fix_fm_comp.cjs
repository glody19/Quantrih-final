const fs = require('fs');
let file = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

file = file.replace(/Graphe Avancé & Comparaison/g, 'COMPARAISON PERFORMANCE RELATIVE');
file = file.replace(/Comparaison Performance Relative/gi, 'COMPARAISON PERFORMANCE RELATIVE');

const advChartRegex = /<AdvancedTradingViewChart symbol=\{activeSymbol \|\| 'AAPL'\} theme="light" \/>/;
if (advChartRegex.test(file)) {
  const newChartStr = `                  <TradingViewChart 
                    data={historicalData} 
                    multiData={watchlistData} 
                    period={chartPeriod.label} 
                    type="relative" 
                    theme="light" 
                    onCrosshairMove={setHoveredTime}
                  />`;
  file = file.replace(advChartRegex, newChartStr);
}

fs.writeFileSync('src/components/pages/FinancialModeling.tsx', file);
console.log('Fixed chart and titles');
