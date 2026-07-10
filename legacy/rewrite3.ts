import * as fs from "fs";

let content = fs.readFileSync('src/components/pages/AssetAllocations.tsx', 'utf8');

const reportStartTagStr = 'id="report-content"';
const startIndex = content.indexOf(reportStartTagStr);

if (startIndex === -1) {
    console.error("Could not find start tag");
    process.exit(1);
}

// rewind to finding "<div " right before id="report-content"
let trueStartIndex = content.lastIndexOf('<div', startIndex);

// Find the matching end div.
let openDivs = 0;
let endIndex = -1;
for (let i = trueStartIndex; i < content.length; i++) {
    const substr4 = content.substring(i, i+4);
    const substr5 = content.substring(i, i+5);
    const substr6 = content.substring(i, i+6);
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

const tableHeaderClass = "font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider";
const tableRowClass = "border-b border-slate-50 hover:bg-slate-50/50 transition-colors";
const cardClass = "bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 overflow-hidden";
const cardHeaderClass = "px-6 py-5 border-b border-slate-100 flex items-center justify-between";
const cardTitleClass = "text-base font-semibold text-slate-900 tracking-tight";

const replacement = `
      <div id="report-content" className={cn("space-y-12 pb-24 transition-all duration-700 bg-slate-50/50 pt-8", results ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden")}>
        {results && (
          <div className="max-w-[1240px] mx-auto px-4 md:px-8 text-sm text-slate-700 font-sans">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                  Portfolio Analysis
                </h2>
                <p className="text-slate-500 font-medium">
                  Historical simulation from {results[0].years[0]} to {results[0].years[results[0].years.length - 1]}
                </p>
                {results.some(r => r.warnings && r.warnings.length > 0) && (
                    <div className="flex items-center gap-2 mt-3 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm font-medium border border-amber-200/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      {results.flatMap(r => r.warnings || []).filter((v, i, a) => a.indexOf(v) === i).join(' | ')}
                    </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (onNavigate) onNavigate('portfolio-backtest');
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  Edit Configuration
                </button>
                <button 
                  onClick={async () => {
                    setIsExporting(true);
                    await generatePDFReport('report-content');
                    setIsExporting(false);
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  Export PDF
                </button>
                <button 
                  onClick={() => {
                      results.forEach(r => downloadCSV(r.annualReturns, r.years, \`portfolio_\${r.name}\`));
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Performance Summary Card */}
            <div className="${cardClass}">
              <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Performance Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left font-medium text-slate-500 py-3 px-6 text-xs uppercase tracking-wider whitespace-nowrap">Portfolio</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Initial Balance</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Final Balance</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1">CAGR <InfoTooltip content="Compound Annual Growth Rate (geometric mean)" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1">IRR <InfoTooltip content="Internal Rate of Return" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1">Vol <InfoTooltip content="Annualized Standard Deviation" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">Best Year <InfoTooltip content="Highest single-year return" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">Worst Year <InfoTooltip content="Lowest single-year return" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">Max DD <InfoTooltip content="Maximum peak-to-trough decline" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">Sharpe <InfoTooltip content="Risk-adjusted return vs. risk-free rate" /></div>
                      </th>
                      <th className="text-right font-medium text-slate-500 py-3 px-6 text-xs uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">Sortino <InfoTooltip content="Risk-adjusted downside return" /></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="text-left py-4 px-6 font-medium flex items-center gap-3 whitespace-nowrap text-slate-900">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: r.color }}></div>
                          {r.name}
                        </td>
                        <td className="text-right py-4 px-4 font-medium tabular-nums">
                           ${'$'}{(initialAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-4 px-4 font-semibold text-slate-900 tabular-nums">
                           ${'$'}{r.metrics.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-4 px-4 font-semibold text-emerald-600 tabular-nums">{(r.metrics.cagr * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-slate-600">{( (r.metrics.irr || 0) * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-slate-600">{(r.metrics.stdev * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-emerald-600">{(r.metrics.bestYear * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-rose-600">{(r.metrics.worstYear * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-rose-600">-{(r.metrics.maxDrawdown * 100).toFixed(2)}%</td>
                        <td className="text-right py-4 px-4 tabular-nums text-slate-700">{r.metrics.sharpe.toFixed(2)}</td>
                        <td className="text-right py-4 px-6 tabular-nums text-slate-700">{r.metrics.sortino.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Portfolio Allocation Charts */}
            <div className="${cardClass}">
               <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Portfolio Asset Allocation</h3>
              </div>
              <div className="p-8 bg-slate-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {results.map((r, idx) => (
                    <div key={idx} className="flex flex-col bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></div>
                        <h4 className="text-base font-semibold text-slate-900">{r.name}</h4>
                      </div>
                      <div className="w-full aspect-square max-w-[200px] mx-auto mb-8 relative">
                        <Pie 
                          data={{
                            labels: Object.keys(r.alloc),
                            datasets: [{
                              data: Object.values(r.alloc),
                              backgroundColor: Object.keys(r.alloc).map((ticker, i) => \`hsl(\${(i * 360 / Object.keys(r.alloc).length)}, 70%, 50%)\`),
                              borderWidth: 2,
                              borderColor: '#ffffff',
                              hoverOffset: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#0f172a',
                                bodyColor: '#334155',
                                borderColor: '#e2e8f0',
                                borderWidth: 1,
                                padding: 12,
                                displayColors: true,
                                boxPadding: 4,
                                usePointStyle: true
                              }
                            },
                            cutout: '65%'
                          }}
                        />
                      </div>
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          {Object.entries(r.alloc).map(([ticker, weight], i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="text-left py-2.5 font-medium text-slate-700 flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: \`hsl(\${(i * 360 / Object.keys(r.alloc).length)}, 70%, 50%)\`}}></div>
                                {ticker}
                              </td>
                              <td className="text-right py-2.5 font-semibold text-slate-900">{weight}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio Growth Graph */}
            <div className="${cardClass}">
               <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Cumulative Wealth Growth</h3>
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
                        backgroundColor: r.color + '10',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: false
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 24, font: { size: 13, family: 'Inter, sans-serif', weight: '500' } } },
                        tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0f172a', bodyColor: '#334155', borderColor: '#e2e8f0', borderWidth: 1, padding: 12, usePointStyle: true }
                      },
                      scales: {
                        x: { grid: { display: false, drawBorder: false }, ticks: { font: { family: 'Inter, sans-serif' }, color: '#64748b' } },
                        y: { 
                           position: 'left',
                           ticks: { callback: v => '$' + Number(v).toLocaleString(), font: { family: 'Inter, sans-serif' }, color: '#64748b' },
                           grid: { color: '#f1f5f9', drawBorder: false },
                           border: { dash: [4, 4] }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Annual Returns Bar Chart */}
              <div className="${cardClass} mb-0">
                <div className="${cardHeaderClass}">
                  <h3 className="${cardTitleClass}">Annual Returns Comparison</h3>
                </div>
                <div className="p-6">
                  <div className="h-[350px]">
                    <Bar 
                       data={{
                         labels: results[0].years,
                         datasets: results.map((r, i) => ({
                           label: r.name,
                           data: r.annualReturns,
                           backgroundColor: r.annualReturns.map(val => val >= 0 ? r.color : r.color + '80'),
                           borderRadius: 4,
                           barPercentage: 0.8 / results.length,
                           categoryPercentage: 0.9
                         }))
                       }}
                       options={{
                         responsive: true,
                         maintainAspectRatio: false,
                         interaction: { mode: 'index', intersect: false },
                         plugins: {
                           legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12, family: 'Inter, sans-serif' } } }
                         },
                         scales: {
                           x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
                           y: { ticks: { callback: v => v + '%' }, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } }
                         }
                       }}
                    />
                  </div>
                </div>
              </div>

               {/* Drawdowns Chart */}
               <div className="${cardClass} mb-0">
                <div className="${cardHeaderClass}">
                  <h3 className="${cardTitleClass}">Portfolio Drawdowns</h3>
                </div>
                <div className="p-6">
                  <div className="h-[350px]">
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
                          tension: 0.2
                        }))
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12, family: 'Inter, sans-serif' } } }
                        },
                        scales: {
                          x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
                          y: { 
                              max: 0,
                              ticks: { callback: v => v + '%' },
                              grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trailing Returns Table */}
             <div className="${cardClass}">
              <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Trailing Returns</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Portfolio</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">1 Year</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">3 Years (Ann.)</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">5 Years (Ann.)</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">10 Years (Ann.)</th>
                      <th className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Full Period</th>
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
                       <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="text-left py-4 px-4 font-medium flex items-center gap-3 whitespace-nowrap text-slate-900">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: r.color }}></div>
                          {r.name}
                        </td>
                        <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">{r.annualReturns[r.annualReturns.length - 1]?.toFixed(2) || "N/A"}%</td>
                        <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">{calcPeriod(3)?.toFixed(2) || "N/A"}{calcPeriod(3) ? '%' : ''}</td>
                        <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">{calcPeriod(5)?.toFixed(2) || "N/A"}{calcPeriod(5) ? '%' : ''}</td>
                        <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">{calcPeriod(10)?.toFixed(2) || "N/A"}{calcPeriod(10) ? '%' : ''}</td>
                        <td className="text-right py-4 px-4 whitespace-nowrap font-semibold tabular-nums text-emerald-600">{(r.metrics.cagr * 100).toFixed(2)}%</td>
                       </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annual Returns Table */}
            <div className="${cardClass}">
              <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Annual Returns Detail</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Year</th>
                      {results.map((r, i) => (
                        <th key={i} className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{r.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...results[0].years].reverse().map((year, yearIndex) => {
                      const actualIdx = results[0].years.length - 1 - yearIndex;
                      return (
                        <tr key={actualIdx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="text-left py-3 px-4 font-semibold text-slate-700">{year}</td>
                          {results.map((r, i) => {
                            const val = r.annualReturns[actualIdx];
                            return (
                               <td key={i} className={\`text-right py-3 px-4 whitespace-nowrap font-medium tabular-nums \${val < 0 ? 'text-rose-600' : 'text-emerald-600'}\`}>
                                 {val ? (val > 0 ? '+' : '') + val.toFixed(2) + '%' : '-'}
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
             <div className="${cardClass}">
              <div className="${cardHeaderClass}">
                <h3 className="${cardTitleClass}">Historical Market Stress Periods</h3>
              </div>
               <div className="overflow-x-auto p-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Stress Period</th>
                        <th className="text-left font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Timeline</th>
                        {results.map((r, i) => (
                          <th key={i} className="text-right font-medium text-slate-500 py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{r.name}</th>
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
                           <tr key={ei} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap text-left">{event.name}</td>
                            <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-left">{event.start === event.end ? event.start : \`\${event.start} - \${event.end}\`}</td>
                            {results.map((r, i) => {
                                const sub = r.annualReturns.filter((_, idx) => r.years[idx] >= event.start && r.years[idx] <= event.end);
                                if (!sub.length) return <td key={i} className="py-4 px-4 text-right text-slate-400 font-medium">N/A</td>;
                                let prod = 1;
                                sub.forEach(x => prod *= (1 + x/100));
                                const ret = (prod - 1) * 100;
                                return (
                                  <td key={i} className={\`py-4 px-4 whitespace-nowrap font-medium text-right tabular-nums \${ret < 0 ? "text-rose-600" : "text-emerald-600"}\`}>
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
             <div className="${cardClass}">
                <div className="${cardHeaderClass}">
                  <h3 className="${cardTitleClass}">Monthly Returns (Portfolio 1)</h3>
                </div>
                <div className="p-6">
                  {results[0].metrics.monthlyReturns ? (
                    <ReturnsHeatmap monthlyReturns={results[0].metrics.monthlyReturns} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-slate-600 font-medium mb-1">Monthly data unavailable</p>
                      <p className="text-slate-400 text-sm">Only annual data is available for this simulation dataset.</p>
                    </div>
                  )}
                </div>
             </div>

             {rebalancing === "none" && (
                <div className="${cardClass}">
                  <div className="${cardHeaderClass}">
                    <h3 className="${cardTitleClass}">Asset Allocation Drift (Portfolio 1)</h3>
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
                             legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12, family: 'Inter, sans-serif' } } },
                          },
                          scales: {
                            x: { stacked: true, grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
                            y: { stacked: true, min: 0, max: 100, title: { display: true, text: 'Allocation %', color: '#64748b' }, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                <div className="bg-white border text-slate-800 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="${cardHeaderClass}">
                    <h3 className="${cardTitleClass}">Efficient Frontier</h3>
                  </div>
                  <div className="p-6 bg-slate-50/30">
                    <EfficientFrontier results={results} />
                  </div>
                </div>
                <div className="bg-white border text-slate-800 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="${cardHeaderClass}">
                    <h3 className="${cardTitleClass}">Monte Carlo Simulation</h3>
                  </div>
                  <div className="p-6 bg-slate-50/30">
                    <MonteCarloChart results={results[0]} />
                  </div>
                </div>
             </div>

          </div>
        )}
      </div>`;

content = content.substring(0, trueStartIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('src/components/pages/AssetAllocations.tsx', content);
console.log("Replaced successfully with modern theme.");
