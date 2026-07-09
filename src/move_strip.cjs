const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// The block to replace is the "Upper Data Strip". We'll replace it with a bottom-right fixed widget and simplify the header.
// It starts at line 85 and ends before "/* Main Header */" at line 143.

const stripRegex = /\{\/\* Upper Data Strip \- Elegant Glassmorphism \*\/\}.*?\{\/\* Main Header \*\/\}/s;

const newWidget = `      {/* Floating Status Bar - Premium Bottom Right Widget */}
      <div className="fixed bottom-6 right-6 z-[100] hidden md:flex items-center gap-4 bg-surface/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full px-4 py-2 transition-all hover:bg-surface/90 hover:border-border duration-300 group">
        
        {/* Clocks */}
        <div className="flex items-center gap-4">
          {CLOCK_CITIES.map(c => {
            const status = getClockStatus(c.tz, c.open[0], c.open[1], c.close[0], c.close[1]);
            return (
              <div key={c.name} className="flex items-center gap-1.5 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black uppercase text-text-3">{c.name}</span>
                <span className="text-[10px] font-mono text-text-2 tracking-tight">{times[c.id]}</span>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  status === 'open' ? "bg-green drop-shadow-[0_0_8px_rgba(0,208,132,0.8)]" : 
                  status === 'pre' ? "bg-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "bg-border"
                )} />
              </div>
            );
          })}
        </div>

        <div className="w-[1px] h-3 bg-border/60 mx-1"></div>

        {/* Currencies */}
        <div className="flex items-center bg-surface-2/50 rounded-full p-0.5 border border-border/40">
          {['USD', 'EUR', 'GBP'].map(c => (
            <button 
              key={c} 
              onClick={() => setBaseCcy(c)} 
              className={cn(
                "px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest transition-all", 
                baseCcy === c ? "bg-text text-bg shadow-sm" : "text-text-4 hover:text-text-2"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-3 bg-border/60 mx-1"></div>

        {/* Languages */}
        <div className="flex items-center gap-0.5">
          {['en', 'fr', 'es'].map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l as any)}
              className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-all px-2.5 py-1 rounded-full",
                language === l ? "bg-pv-blue/20 text-pv-blue" : "text-text-4 hover:text-text hover:bg-surface-2"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main Header */}`;

content = content.replace(stripRegex, newWidget);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log('Moved data strip to premium bottom right widget');
