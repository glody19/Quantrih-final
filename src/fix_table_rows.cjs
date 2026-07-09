const fs = require('fs');
let file = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

const searchStart = `                     const isUp = hoveredChange >= 0;`;
const searchEnd = `                            </div>\n                            \n                         </div>\n                      );\n                   })}\n               </div>`;

const replaceWith = `                     const isUp = hoveredChange >= 0;

                     const formatPrice = (val) => Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                     return (
                        <div 
                           key={m.ticker}
                           onClick={() => handleMoverClick(m.ticker)}
                           className={cn(
                              "group flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-b last:border-b-0 cursor-pointer transition-colors hover:bg-surface-2",
                              m.ticker === activeSymbol ? "bg-surface" : ""
                           )}
                        >
                           {/* Left side: Logo & Names */}
                           <div className="flex items-center gap-4 w-full sm:w-1/2">
                              {/* Selection Indicator */}
                              <div className={cn("w-1 h-10 rounded-full", m.ticker === activeSymbol ? "bg-pv-blue" : "bg-transparent")} />
                              
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-border/50 flex items-center justify-center shrink-0">
                                 {watchlistProfiles[m.ticker]?.image ? (
                                     <img src={watchlistProfiles[m.ticker].image} alt={m.ticker} className="w-full h-full object-cover" />
                                 ) : (
                                     <AssetLogo ticker={m.ticker} name={m.name || m.ticker} className="w-full h-full" />
                                 )}
                              </div>
                              <div className="flex flex-col">
                                 <h4 className="text-[16px] font-semibold text-text truncate max-w-[280px]">
                                    {watchlistProfiles[m.ticker]?.name || m.name || m.ticker}
                                 </h4>
                                 <span className="text-xs text-text-4 font-medium uppercase tracking-widest mt-0.5">
                                    {m.ticker} • {watchlistProfiles[m.ticker]?.exchange || 'NASDAQ'}
                                 </span>
                              </div>
                           </div>
                           
                           {/* Right side: Prices & Changes */}
                           <div className="flex w-full sm:w-1/2 items-center justify-end mt-2 sm:mt-0 gap-6">
                              <span className="text-[16px] font-medium font-mono text-text">
                                 {formatPrice(currentPrice)} $US
                              </span>
                              
                              <span className={cn(
                                 "text-[15px] font-medium font-mono min-w-[100px] text-right",
                                 isUp ? "text-emerald-600" : "text-rose-600"
                              )}>
                                 {isUp ? "+" : ""}{formatPrice(hoveredChangeVal)} $US
                              </span>

                              <div className={cn(
                                 "flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[105px] rounded-md font-mono text-[14px] font-bold",
                                 isUp ? "bg-emerald-100/60 text-emerald-700" : "bg-rose-100/60 text-rose-700"
                              )}>
                                 {isUp ? <TrendingUp size={14} className="stroke-[3]" /> : <TrendingUp size={14} className="transform rotate-180 stroke-[3]" />}
                                 {Math.abs(hoveredChange).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>`;

const startIdx = file.indexOf(searchStart);
const endIdx = file.indexOf(searchEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const substr = file.substring(startIdx, endIdx + searchEnd.length);
  file = file.replace(substr, replaceWith);
  
  // Update surrounding table container class for border-radius
  file = file.replace('<div className="w-full mt-8 mb-12 flex flex-col gap-4">', '<div className="w-full mt-4 mb-12 flex flex-col border border-border/70 rounded-[1.25rem] overflow-hidden shadow-sm bg-white">');
} else {
  console.log("Could not find table rows");
}

fs.writeFileSync('src/components/pages/FinancialModeling.tsx', file);
console.log('Fixed table rows in src/fix_fm.cjs');
