const fs = require('fs');

let content = fs.readFileSync('src/components/pages/PortfolioBacktesting.tsx', 'utf8');

// Container
content = content.replace(
  '<div className="space-y-8 animate-fade-up max-w-full xl:max-w-[1800px] mx-auto px-4 md:px-8 pb-24">',
  '<div className="-mx-4 md:-mx-8 -mt-4 pt-8 px-4 md:px-8 pb-24 min-h-[calc(100vh-80px)] bg-[#0B0E14] text-slate-300 relative"><div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pv-blue/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4" /><div className="space-y-8 animate-fade-up max-w-full xl:max-w-[1800px] mx-auto relative z-10">'
);
content = content.replace('      </div>\n    </div>\n  );\n}\n', '      </div>\n    </div>\n    </div>\n  );\n}\n');

// Parameters block
content = content.replace(
  'bg-surface border border-border p-6 rounded-2xl shadow-xl flex flex-col gap-6',
  'bg-[#121620]/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6 relative overflow-hidden'
);
// Forms
content = content.replaceAll(
  'bg-surface-2 border border-border',
  'bg-[#0A0D14] border border-slate-800/80 text-white placeholder-slate-600'
);
content = content.replaceAll('text-text-4', 'text-slate-400');
content = content.replaceAll('text-text-3', 'text-slate-300');
content = content.replaceAll('text-text-2', 'text-slate-200');

// Asset Allocations 
content = content.replace(
  '<div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden mt-8">',
  '<div className="bg-[#121620]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden mt-8">'
);
content = content.replaceAll(
  '<div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">',
  '<div className="px-6 py-5 border-b border-slate-800/80 bg-[#161a25] flex items-center justify-between">'
);
content = content.replaceAll('text-text', 'text-white');

// Portfolio columns
content = content.replaceAll('border-r border-border', 'border-r border-slate-800/80');
content = content.replaceAll('border-b border-border', 'border-b border-slate-800/80');
content = content.replaceAll('border-l border-border', 'border-l border-slate-800/80');
content = content.replaceAll('border border-border', 'border border-slate-800/80');

// Results tables & summary cards
content = content.replaceAll(
  'bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 overflow-hidden text-left',
  'bg-[#121620]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] mb-8 overflow-hidden text-left'
);
content = content.replaceAll(
  'border-b border-slate-100',
  'border-b border-slate-800/80'
);
content = content.replaceAll(
  'bg-slate-50/30',
  'bg-[#0A0D14]/50'
);
content = content.replaceAll(
  'bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative',
  'bg-[#161a25] rounded-2xl border border-slate-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.3)] overflow-hidden relative'
);
content = content.replaceAll(
  'bg-slate-100/70 border-b border-slate-200',
  'bg-[#1a1f2e] border-b border-slate-800/80'
);
content = content.replaceAll(
  'border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/50',
  'border border-slate-800/80 rounded-xl overflow-hidden shadow-sm bg-[#0A0D14]'
);
content = content.replaceAll('border-r border-slate-200', 'border-r border-slate-800/80');
content = content.replaceAll('border-r border-slate-100', 'border-r border-slate-800/80');

content = content.replaceAll('text-slate-900', 'text-slate-100');
content = content.replaceAll('text-slate-700', 'text-slate-300');
content = content.replaceAll('text-slate-500', 'text-slate-400');
content = content.replaceAll('<td className="px-4 py-4 text-center font-medium tabular-nums border-r border-slate-100 bg-white">', '<td className="px-4 py-4 text-center font-medium tabular-nums border-r border-slate-800/80 bg-[#161a25]">');

// All table cells were bg-white, replace with bg-[#161a25]
content = content.replaceAll('bg-white tabular-nums', 'bg-[#161a25] tabular-nums');
content = content.replaceAll('bg-white hover:bg-slate-50/50', 'bg-[#161a25] hover:bg-[#1a1f2e]');
content = content.replaceAll('bg-white', 'bg-[#161a25]');

// Colors for negative/positive values to pop out on dark
content = content.replaceAll('text-rose-600', 'text-rose-500');
content = content.replaceAll('text-emerald-600', 'text-emerald-400');
content = content.replaceAll('text-emerald-700', 'text-emerald-400');

fs.writeFileSync('src/components/pages/PortfolioBacktesting.tsx', content);
