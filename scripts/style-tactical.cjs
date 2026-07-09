const fs = require('fs');
let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

content = content.replace(
  '<div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 space-y-8 animate-in fade-in duration-500">',
  '<div className="-mx-4 md:-mx-8 -mt-4 pt-8 px-4 md:px-8 pb-24 min-h-[calc(100vh-80px)] bg-[#0B0E14] text-slate-300 relative"><div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pv-blue/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4" /><div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">'
);
content = content.replace('    </div>\n  );\n}', '    </div>\n  </div>\n  );\n}');

// Parameters block
content = content.replace(
  'bg-surface border border-border p-6 rounded-2xl shadow-xl flex flex-col gap-6',
  'bg-[#121620]/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6 relative overflow-hidden'
);
// Forms
content = content.replaceAll(
  'bg-surface-2 border border-border rounded-lg px-4 py-3 text-text',
  'bg-[#0A0D14] border border-slate-800/80 rounded-lg px-4 py-3 text-white'
);
content = content.replaceAll(
  'bg-surface-2 border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-pv-blue w-48 text-text',
  'bg-[#0A0D14] border border-slate-800/80 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-pv-blue w-48 text-white'
);
content = content.replaceAll(
  'bg-surface border border-border',
  'bg-[#0A0D14] border border-slate-800/80 text-white'
);

content = content.replaceAll('bg-surface-2/40 border border-border/40', 'bg-[#121620]/40 border border-slate-800/40');

content = content.replaceAll('text-text-4', 'text-slate-400');
content = content.replaceAll('text-text-3', 'text-slate-300');
content = content.replaceAll('text-text-2', 'text-slate-200');
content = content.replaceAll('text-text', 'text-white');

content = content.replaceAll('border-border', 'border-slate-800/80');

fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', content);
