const fs = require('fs');

let code = fs.readFileSync('src/components/pages/Market.tsx', 'utf8');

// Replace top header
const headerRegex = /<header className="space-y-4">[\s\S]*?<\/header>/;

const newHeader = `<div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-pv-blue/20 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pv-blue/10 text-pv-blue text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-pv-blue/20 mb-2">
               <Radio size={14} className="animate-pulse" /> Live Terminal
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-text leading-[1] drop-shadow-sm">
              Global Markets
            </h1>
            <p className="text-xs font-semibold text-text-4 uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
              IEX Premium WebSocket Feed. Portfolios evaluation and backtesting environment.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-surface-2 border border-border/60 rounded-xl px-5 py-3 shadow-inner">
             <div className="flex flex-col">
                <span className="text-[9px] text-text-4 font-black uppercase tracking-widest mb-0.5">Market Status</span>
                <span className="text-xs text-green font-bold flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(0,255,0,0.8)]" /> OPEN
                </span>
             </div>
             <div className="w-[1px] h-8 bg-border/80 mx-2" />
             <div className="flex flex-col text-right">
                <span className="text-[9px] text-text-4 font-black uppercase tracking-widest mb-0.5">Active Connections</span>
                <span className="text-xs text-text font-mono font-bold">1,024</span>
             </div>
          </div>
        </header>
      </div>`;

code = code.replace(headerRegex, newHeader);

// Update Lucide imports
code = code.replace(/RefreshCw, Play, Plus, Trash, ArrowRight, Percent, AreaChart, User, BarChart3/, 'RefreshCw, Play, Plus, Trash, ArrowRight, Percent, AreaChart, User, BarChart3, Radio');

// Add decorative background to main wrapper
code = code.replace(/<div className="max-w-\[1400px\] mx-auto px-4 md:px-8 space-y-12">/, `<div className="max-w-[1500px] mx-auto px-4 md:px-8 space-y-12 relative min-h-[calc(100vh-80px)]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pv-blue/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none -z-10" />`);

// Change the Ticker Marquee style to be more futuristic
let oldTicker = /\{\/\* 1\. TICKER MARQUEE \*\/\}[\s\S]*?<\/div>\n      <\/div>/;
let newTicker = `{/* 1. TICKER MARQUEE */}
      <div className="w-full rounded-2xl bg-surface-2/40 backdrop-blur-md overflow-hidden flex shadow-2xl relative border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-2 via-transparent to-transparent z-10 pointer-events-none w-16" />
        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-surface-2 via-transparent to-transparent z-10 pointer-events-none w-16" />
        
        <div className="bg-gradient-to-b from-pv-blue to-pv-blue-hover py-3 px-6 pl-8 z-20 flex items-center justify-center border-r border-border/10 shadow-[8px_0_24px_rgba(0,182,212,0.3)] relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 relative z-10">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce shadow-[0_0_8px_white]" /> LIVE
           </span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center group bg-black/20">
          <div className="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] py-2">
            {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((sym, i) => {
              const data = livePrices[sym];
              const price = data?.price ? data.price.toFixed(2) : '---';
              const change = data?.changePct || 0;
              return (
                <div key={i} className="flex flex-col px-8 border-r border-white/5 font-mono items-end justify-center min-w-[140px] hover:bg-white/5 transition-colors cursor-pointer rounded-lg m-1 p-2">
                  <div className="flex w-full justify-between items-center gap-4">
                    <span className="font-black text-[13px] text-text-3 tracking-tighter">{sym}</span>
                    <span className="text-[15px] text-text font-bold">{price}</span>
                  </div>
                  <span className={cn("text-[10px] font-black tracking-widest", change >= 0 ? "text-green" : "text-red drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]")}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>`;
code = code.replace(oldTicker, newTicker);

// Update table visuals
code = code.replace(/className="w-full overflow-x-auto border border-border rounded-xl bg-surface-2 mt-4"/g, 'className="w-full overflow-x-auto border border-border/60 rounded-2xl bg-surface/40 backdrop-blur-xl mt-4 shadow-xl"');

code = code.replace(/<tr className="border-b border-border bg-black\/10 uppercase tracking-widest text-\[#888\]">/g, '<tr className="border-b border-border/40 bg-surface-2/60 uppercase tracking-[0.15em] text-text-4">');

code = code.replace(/<tbody className="divide-y divide-border font-mono text-\[12px\] text-text-2">/g, '<tbody className="divide-y divide-border/40 font-mono text-[12px] text-text-2">');

code = code.replace(/<tr key=\{i\} className="hover:bg-black\/5 transition-colors">/g, '<tr key={i} className="hover:bg-white/5 transition-colors">');

fs.writeFileSync('src/components/pages/Market.tsx', code);
console.log('Done Market');
