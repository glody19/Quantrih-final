const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');


const bottomWidgetRegex = /\{\/\* Currencies \*\/\}[\s\S]*?\{\/\* Languages \*\/\}[\s\S]*?<\/div>\s*<\/div>/;

code = code.replace(bottomWidgetRegex, '</div></div>');

code = code.replace(/<div className="flex items-center gap-4">\s*\{user \? \(/g, 
`<div className="flex items-center gap-4">
           {/* Inventive Language Dropdown */}
           <div className="relative group hidden md:flex items-center">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-surface hover:border-pv-blue/60 hover:bg-surface-2 transition-all shadow-sm">
                 <Languages size={14} className="text-pv-blue" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-text-2">
                    {language}
                 </span>
                 <ChevronDown size={12} className="text-text-4 ml-1 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              <div className="absolute top-full right-0 mt-3 w-40 bg-surface/90 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all -translate-y-2 group-hover:translate-y-0 duration-300 z-[120] overflow-hidden">
                 <div className="p-1 flex flex-col">
                    {[
                      { id: 'en', label: 'English', flag: '🇬🇧' },
                      { id: 'fr', label: 'Français', flag: '🇫🇷' },
                      { id: 'nl', label: 'Nederlands', flag: '🇳🇱' },
                      { id: 'es', label: 'Español', flag: '🇪🇸' }
                    ].map(l => (
                       <button
                         key={l.id}
                         onClick={() => setLanguage(l.id as any)}
                         className={\`group/btn w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all \${language === l.id ? "bg-pv-blue text-white" : "text-text-3 hover:text-text hover:bg-surface-2"}\`}
                       >
                         <span className="text-[11px] font-black uppercase tracking-widest">{l.label}</span>
                         <span className={\`text-[14px] transition-transform duration-300 \${language !== l.id ? "group-hover/btn:scale-125" : ""}\`}>{l.flag}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
           
           {/* Currencies */}
           <div className="hidden md:flex items-center bg-surface-2/50 rounded-full p-0.5 border border-border/40 ml-2">
             {['USD', 'EUR', 'GBP'].map(c => (
               <button 
                 key={c} 
                 onClick={() => setBaseCcy(c)} 
                 className={\`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest transition-all \${baseCcy === c ? "bg-text text-bg shadow-sm" : "text-text-4 hover:text-text-2"}\`}
               >
                 {c}
               </button>
             ))}
           </div>

           <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />

           {user ? (`);

fs.writeFileSync('src/components/layout/Header.tsx', code);
console.log('Done replacing header');
