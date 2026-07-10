import * as fs from "fs";

let content = fs.readFileSync('src/components/pages/AssetAllocations.tsx', 'utf8');

const reportStartTag = `<div id="report-content" className={cn("space-y-10 pb-20 transition-all duration-700 bg-background", results ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden")}>`;
const startIndex = content.indexOf(reportStartTag);

if (startIndex === -1) {
    console.error("Could not find start tag");
    process.exit(1);
}

// Find the matching end div.
let openDivs = 0;
let endIndex = -1;
for (let i = startIndex; i < content.length; i++) {
    const substr4 = content.substr(i, 4);
    const substr5 = content.substr(i, 5);
    const substr6 = content.substr(i, 6);
    if (substr4 === '<div') openDivs++;
    if (substr5 === '</div') {
        openDivs--;
        if (openDivs === 0) {
            endIndex = i + 6; // Include closing tag '</div>'
            break;
        }
    }
}

if (endIndex === -1) {
    console.error("Could not find matching end div");
    process.exit(1);
}

const replacement = `
      <div id="report-content" className={cn("space-y-8 pb-20 transition-all duration-700 bg-background", results ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden")}>
        {results && (
          <div className="max-w-[1240px] mx-auto text-sm text-[#333333] font-sans">
            {/* Header info */}
            <div className="flex flex-col gap-2 border-b border-border/50 mb-8 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-medium text-[#2d3748]">
                  Portfolio Analysis Results ({results[0].years[0]} - {results[0].years[results[0].years.length - 1]})
                </h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('portfolio-backtest');
                    }}
                    className="text-xs text-[#3182ce] hover:underline flex items-center gap-1"
                  >
                    Analyze Output
                  </button>
                  <button 
                    onClick={async () => {
                      setIsExporting(true);
                      await generatePDFReport('report-content');
                      setIsExporting(false);
                    }}
                    className="text-xs text-[#3182ce] hover:underline flex items-center gap-1"
                  >
                    PDF
                  </button>
                  <button 
                    onClick={() => {
                        results.forEach(r => downloadCSV(r.annualReturns, r.years, \`portfolio_\${r.name}\`));
                    }}
                    className="text-xs text-[#3182ce] hover:underline flex items-center gap-1"
                  >
                    Excel
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#718096]">
                Note: The time period was constrained by the available data for the selected assets [{results[0].years[0]} - {results[0].years[results[0].years.length - 1]}].
              </p>
              {results.some(r => r.warnings && r.warnings.length > 0) && (
                  <p className="text-xs text-amber-600 mt-2">
                    {results.flatMap(r => r.warnings || []).filter((v, i, a) => a.indexOf(v) === i).join(' | ')}
                  </p>
              )}
            </div>

            {/* Portfolio Allocation Charts */}
            <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
               <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Portfolio Allocation</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((r, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <h4 className="text-[15px] font-medium text-[#2d3748] mb-4">{r.name}</h4>
                      <div className="w-[200px] h-[200px] mb-6">
                        <Pie 
                          data={{
                            labels: Object.keys(r.alloc),
                            datasets: [{
                              data: Object.values(r.alloc),
                              backgroundColor: Object.keys(r.alloc).map((ticker, i) => \`hsl(\${(i * 360 / Object.keys(r.alloc).length)}, 70%, 50%)\`),
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left font-semibold py-1">Asset Class</th>
                            <th className="text-right font-semibold py-1">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(r.alloc).map(([ticker, weight], i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="text-left py-1.5 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: \`hsl(\${(i * 360 / Object.keys(r.alloc).length)}, 70%, 50%)\`}}></div>
                                {ticker}
                              </td>
                              <td className="text-right py-1.5">{weight}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary Card */}
            <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Performance Summary</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#cbd5e0] text-[#2b6cb0]">
                      <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Portfolio</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Initial Balance</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Final Balance</th>
                      <th className="text-right font-semibold py-2 px-2">CAGR</th>
                      <th className="text-right font-semibold py-2 px-2">IRR</th>
                      <th className="text-right font-semibold py-2 px-2">Stdev</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Best Year</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Worst Year</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Max. Drawdown</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Sharpe Ratio</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Sortino Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="text-left py-3 px-2 font-medium flex items-center gap-2 whitespace-nowrap">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }}></div>
                          {r.name}
                        </td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">
                           ${'$'}{(initialAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">
                           ${'$'}{r.metrics.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{(r.metrics.cagr * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{( (r.metrics.irr || 0) * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{(r.metrics.stdev * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap text-[#38a169]">{(r.metrics.bestYear * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap text-[#e53e3e]">{(r.metrics.worstYear * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap text-[#e53e3e]">-{(r.metrics.maxDrawdown * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{r.metrics.sharpe.toFixed(2)}</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{r.metrics.sortino.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Portfolio Growth Graph */}
            <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
               <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Portfolio Growth</h3>
              </div>
              <div className="p-6">
                <div className="h-[400px]">
                  <Line 
                    data={{
                      labels: results[0].years,
                      datasets: results.map(r => ({
                        label: r.name,
                        data: r.path,
                        borderColor: r.color,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        tension: 0
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 12, family: 'sans-serif' } } },
                        tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', titleColor: '#333', bodyColor: '#666', borderColor: '#ccc', borderWidth: 1 }
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: { 
                           position: 'left',
                           ticks: { callback: v => '$' + Number(v).toLocaleString() },
                           grid: { color: '#f0f0f0' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Annual Returns Bar Chart */}
            <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Annual Returns</h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <Bar 
                     data={{
                       labels: results[0].years,
                       datasets: results.map((r, i) => ({
                         label: r.name,
                         data: r.annualReturns,
                         backgroundColor: r.color,
                         barPercentage: 0.8 / results.length,
                         categoryPercentage: 0.9
                       }))
                     }}
                     options={{
                       responsive: true,
                       maintainAspectRatio: false,
                       interaction: { mode: 'index', intersect: false },
                       plugins: {
                         legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 12, family: 'sans-serif' } } }
                       },
                       scales: {
                         x: { grid: { display: false } },
                         y: { ticks: { callback: v => v + '%' }, grid: { color: '#f0f0f0' } }
                       }
                     }}
                  />
                </div>
              </div>
            </div>

            {/* Trailing Returns Table */}
             <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Trailing Returns</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#cbd5e0] text-[#2b6cb0]">
                      <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Portfolio</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">1 Year</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">3 Years (Annualized)</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">5 Years (Annualized)</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">10 Years (Annualized)</th>
                      <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Full Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                       const calcPeriod = (yearsAgo) => {
                        const len = r.annualReturns.length;
                        if (len < yearsAgo) return null;
                        const sub = r.annualReturns.slice(-yearsAgo);
                        let prod = 1;
                        sub.forEach(x => prod *= (1 + x/100));
                        return (Math.pow(prod, 1/yearsAgo) - 1) * 100;
                      };
                      return (
                       <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="text-left py-3 px-2 font-medium flex items-center gap-2 whitespace-nowrap">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }}></div>
                          {r.name}
                        </td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{r.annualReturns[r.annualReturns.length - 1]?.toFixed(2) || "N/A"}%</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{calcPeriod(3)?.toFixed(2) || "N/A"}{calcPeriod(3) ? '%' : ''}</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{calcPeriod(5)?.toFixed(2) || "N/A"}{calcPeriod(5) ? '%' : ''}</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap">{calcPeriod(10)?.toFixed(2) || "N/A"}{calcPeriod(10) ? '%' : ''}</td>
                        <td className="text-right py-3 px-2 whitespace-nowrap font-bold">{(r.metrics.cagr * 100).toFixed(2)}%</td>
                       </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

             {/* Drawdowns Chart */}
             <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Drawdowns</h3>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <Line 
                    data={{
                      labels: results[0].years,
                      datasets: results.map((r, dIdx) => ({
                        label: r.name,
                        data: r.metrics.drawdowns?.map(d => -(d * 100)) || [],
                        borderColor: r.color,
                        backgroundColor: r.color + "15",
                        fill: dIdx === 0,
                        pointRadius: 0,
                        borderWidth: 2,
                        tension: 0
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 12, family: 'sans-serif' } } }
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: { 
                            max: 0,
                            ticks: { callback: v => v + '%' },
                            grid: { color: '#f0f0f0' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Annual Returns Table */}
            <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Annual Returns</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#cbd5e0] text-[#2b6cb0]">
                      <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Year</th>
                      {results.map((r, i) => (
                        <th key={i} className="text-right font-semibold py-2 px-2 whitespace-nowrap">{r.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...results[0].years].reverse().map((year, yearIndex) => {
                      const actualIdx = results[0].years.length - 1 - yearIndex;
                      return (
                        <tr key={actualIdx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="text-left py-2 px-2 font-medium">{year}</td>
                          {results.map((r, i) => {
                            const val = r.annualReturns[actualIdx];
                            return (
                               <td key={i} className={\`text-right py-2 px-2 whitespace-nowrap \${val < 0 ? 'text-[#e53e3e]' : ''}\`}>
                                 {val ? val.toFixed(2) + '%' : '-'}
                               </td>
                            );
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Stress Scenarios Table */}
             <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
              <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                <h3 className="text-[17px] text-[#2b6cb0] font-medium">Historical Market Stress Periods</h3>
              </div>
               <div className="overflow-x-auto p-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#cbd5e0] text-[#2b6cb0]">
                        <th className="text-left py-2 px-2 whitespace-nowrap font-semibold">Stress Period</th>
                        <th className="text-left py-2 px-2 whitespace-nowrap font-semibold">Timeline</th>
                        {results.map((r, i) => (
                          <th key={i} className="text-right py-2 px-2 whitespace-nowrap font-semibold">{r.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                       {[
                          { name: "Dotcom Crash", start: 2000, end: 2002 },
                          { name: "Financial Crisis", start: 2008, end: 2008 },
                          { name: "COVID-19 Shock", start: 2020, end: 2020 },
                          { name: "Inflation Spike & Rate Hikes", start: 2022, end: 2022 }
                        ].map((event, ei) => (
                           <tr key={ei} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium whitespace-nowrap text-left">{event.name}</td>
                            <td className="py-3 px-2 text-[#718096] whitespace-nowrap text-left">{event.start === event.end ? event.start : \`\${event.start} - \${event.end}\`}</td>
                            {results.map((r, i) => {
                                const sub = r.annualReturns.filter((_, idx) => r.years[idx] >= event.start && r.years[idx] <= event.end);
                                if (!sub.length) return <td key={i} className="py-3 px-2 text-right text-gray-400">N/A</td>;
                                let prod = 1;
                                sub.forEach(x => prod *= (1 + x/100));
                                const ret = (prod - 1) * 100;
                                return (
                                  <td key={i} className={\`py-3 px-2 whitespace-nowrap text-right \${ret < 0 ? "text-[#e53e3e]" : ""}\`}>
                                    {ret.toFixed(2)}%
                                  </td>
                                );
                            })}
                           </tr>
                        ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Monthly Returns Heatmap & Asset Allocation Drift (Portfolio 1) */}
             <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
                <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                  <h3 className="text-[17px] text-[#2b6cb0] font-medium">Monthly Returns (Portfolio 1 Estimate)</h3>
                </div>
                <div className="p-6">
                  {results[0].metrics.monthlyReturns ? (
                    <ReturnsHeatmap monthlyReturns={results[0].metrics.monthlyReturns} />
                  ) : (
                    <p className="text-gray-500 italic text-sm">Note: Only annual data is available for this simulation. Heatmap is approximated.</p>
                  )}
                </div>
             </div>

             {rebalancing === "none" && (
                <div className="bg-white border text-[#333] border-gray-200 shadow-sm mb-6 rounded-md overflow-hidden">
                  <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                    <h3 className="text-[17px] text-[#2b6cb0] font-medium">Asset Allocation Drift (Portfolio 1)</h3>
                  </div>
                  <div className="p-6">
                    <div className="h-[350px]">
                      <Bar
                        data={{
                          labels: results[0].years,
                          datasets: Object.keys(results[0].alloc).map((ticker, idx) => ({
                            label: ticker,
                            data: results[0].allocHistory.map(h => h[ticker] || 0),
                            backgroundColor: \`hsla(\${idx * 40}, 70%, 50%, 0.7)\`,
                            stack: 'stack0'
                          }))
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                             legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 12, family: 'sans-serif' } } },
                          },
                          scales: {
                            x: { stacked: true, grid: { display: false } },
                            y: { stacked: true, min: 0, max: 100, title: { display: true, text: 'Allocation %' } }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border text-[#333] border-gray-200 shadow-sm rounded-md overflow-hidden">
                  <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                    <h3 className="text-[17px] text-[#2b6cb0] font-medium">Efficient Frontier</h3>
                  </div>
                  <div className="p-6">
                    <EfficientFrontier results={results} />
                  </div>
                </div>
                <div className="bg-white border text-[#333] border-gray-200 shadow-sm rounded-md overflow-hidden">
                  <div className="bg-[#f7fafc] px-6 py-3 border-b border-gray-200">
                    <h3 className="text-[17px] text-[#2b6cb0] font-medium">Monte Carlo Simulation</h3>
                  </div>
                  <div className="p-6">
                    <MonteCarloChart results={results[0]} />
                  </div>
                </div>
             </div>

          </div>
        )}
      </div>`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('src/components/pages/AssetAllocations.tsx', content);
console.log("Replaced successfully with Pie charts.");
