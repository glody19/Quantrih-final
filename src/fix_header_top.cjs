const fs = require('fs');

let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Move clocks to top right, above language switcher
// Currently clocks are in a fixed div at the bottom
const clockWidgetRegex = /\{\/\* Floating Status Bar - Premium Bottom Right Widget \*\/\}[\s\S]*?<\/div>\n      <\/div>/;

headerCode = headerCode.replace(clockWidgetRegex, '');

// We will insert the clocks in the main header right side
const langRegex = /\{\/\* Inventive Language Dropdown \*\/\}[\s\S]*?\{\/\* Currencies \*\/\}[\s\S]*?<\/div>/;

const newRightSide = `{/* Market Status / Clocks - Top Right Minimal */}
           <div className="hidden lg:flex items-center gap-3 mr-4">
              {CLOCK_CITIES.map(c => {
                const status = getClockStatus(c.tz, c.open[0], c.open[1], c.close[0], c.close[1]);
                return (
                  <div key={c.name} className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity cursor-default group">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                        status === 'open' ? "bg-green shadow-[0_0_8px_rgba(0,255,0,0.8)]" : 
                        status === 'pre' ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "bg-border"
                      )} />
                      <span className="text-[9px] font-black uppercase text-text-3 group-hover:text-text transition-colors">{c.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-4 tracking-tight group-hover:text-text-2 transition-colors -mt-0.5">{times[c.id] || '--:--'}</span>
                  </div>
                );
              })}
           </div>

           <div className="w-[1px] h-6 bg-border/60 mx-1 hidden lg:block" />

           {/* Currencies */}
           <div className="hidden md:flex items-center bg-surface-2 rounded-xl p-0.5 border border-border/40">
             {['USD', 'EUR', 'GBP'].map(c => (
               <button 
                 key={c} 
                 onClick={() => setBaseCcy(c)} 
                 className={\`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all \${baseCcy === c ? "bg-pv-blue text-white shadow-md shadow-pv-blue/20" : "text-text-4 hover:text-text-2 hover:bg-white/5"}\`}
               >
                 {c}
               </button>
             ))}
           </div>

           {/* Inventive Language Ring (Minimal Holographic Style) */}
           <div className="relative group hidden md:flex items-center ml-2">
              <button className="relative w-8 h-8 rounded-full border border-border/60 bg-surface flex items-center justify-center overflow-hidden hover:border-pv-blue/60 hover:shadow-[0_0_12px_rgba(0,182,212,0.3)] transition-all">
                 <div className="absolute inset-0 bg-gradient-to-tr from-pv-blue/10 to-transparent group-hover:opacity-100 opacity-0 transition-opacity" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-text z-10">{language}</span>
              </button>
              
              <div className="absolute top-[120%] right-0 mt-2 w-32 bg-surface/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all -translate-y-4 group-hover:translate-y-0 duration-400 z-[120] overflow-hidden">
                 <div className="relative p-1.5 flex flex-col gap-0.5">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-pv-blue/20 blur-2xl rounded-full" />
                    {[
                      { id: 'en', label: 'E N G', flag: 'US' },
                      { id: 'fr', label: 'F R A', flag: 'FR' },
                      { id: 'nl', label: 'N E D', flag: 'NL' },
                      { id: 'es', label: 'E S P', flag: 'ES' }
                    ].map(l => (
                       <button
                         key={l.id}
                         onClick={() => setLanguage(l.id as any)}
                         className={\`relative w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 overflow-hidden \${language === l.id ? "bg-white/10 text-white" : "text-text-3 hover:text-text hover:bg-white/5"}\`}
                       >
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">{l.label}</span>
                         {language === l.id && (
                           <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-pv-blue shadow-[0_0_8px_#06b6d4]" />
                         )}
                       </button>
                    ))}
                 </div>
              </div>
           </div>`;

headerCode = headerCode.replace(langRegex, newRightSide);

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log('Header done');
