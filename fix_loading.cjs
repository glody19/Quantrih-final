const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newLoading = `  if (!configLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg font-sans overflow-hidden relative">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-[pulse_3s_ease-in-out_infinite] scale-[1.7] mb-12">
            <QuantrihLogo variant="sigma" size="lg" className="text-sky-400" />
          </div>
          
          {/* Innovative dotted loading */}
          <div className="relative flex justify-center items-center mt-6 h-8 w-32">
            <div className="absolute inset-0 flex justify-center items-center animate-[spin_3s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-sky-500/10 border-t-sky-400/60 border-b-blue-500/60" />
            </div>
            <div className="absolute inset-0 flex justify-center items-center animate-[spin_4s_linear_infinite_reverse]">
              <div className="w-[120%] h-[120%] rounded-full border border-indigo-500/10 border-r-indigo-400/40 border-l-sky-400/40" />
            </div>
            
            <div className="flex gap-2.5 items-center z-10">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-[ping_1.5s_infinite_-0.4s] opacity-80" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[ping_1.5s_infinite_-0.2s] opacity-80" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-[ping_1.5s_infinite] opacity-80" />
            </div>
            <div className="absolute flex gap-2.5 items-center z-20">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,1)] animate-[pulse_1.5s_infinite_-0.4s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] animate-[pulse_1.5s_infinite_-0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)] animate-[pulse_1.5s_infinite]" />
            </div>
          </div>
          
          <div className="mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-text-3 animate-pulse">
            Initialisation de l'espace
          </div>
        </div>
      </div>
    );
  }`;

content = content.replace(/  if \(\!configLoaded\) \{[\s\S]*?    \);\n  \}/, newLoading);

fs.writeFileSync('src/App.tsx', content);
