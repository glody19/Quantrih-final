const fs = require('fs');

const files = [
  'src/components/pages/PortfolioBacktesting.tsx',
  'src/components/pages/PortfolioAnalysisExplication.tsx',
  'src/components/pages/TacticalAllocation.tsx'
];

const replacements = [
  [/bg-white\/[0-9]+/g, 'bg-surface'],
  [/bg-white/g, 'bg-surface'],
  [/backdrop-blur-xl/g, ''],
  [/ring-1 ring-slate-900\/5/g, ''],
  [/shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\]/g, 'shadow-md'],
  [/shadow-xl/g, 'shadow-md'],
  [/shadow-sm/g, ''],
  [/border-slate-200\/80/g, 'border-border'],
  [/border-slate-200/g, 'border-border'],
  [/border-slate-100/g, 'border-border'],
  [/border-slate-50/g, 'border-border'],
  [/border-slate-700/g, 'border-border'],
  [/bg-slate-50\/[0-9]+/g, 'bg-surface-2'],
  [/bg-slate-50/g, 'bg-surface-2'],
  [/bg-slate-100\/[0-9]+/g, 'bg-surface-3'],
  [/bg-slate-100/g, 'bg-surface-3'],
  [/bg-slate-800\/80/g, 'bg-surface-3'],
  [/bg-slate-900\/95/g, 'bg-surface-3'],
  [/text-slate-900/g, 'text-text'],
  [/text-slate-800/g, 'text-text'],
  [/text-slate-700/g, 'text-text-2'],
  [/text-slate-600/g, 'text-text-2'],
  [/text-slate-500/g, 'text-text-3'],
  [/text-emerald-[0-9]+/g, 'text-green'],
  [/border-emerald-[0-9]+/g, 'border-green'],
  [/bg-emerald-[0-9]+/g, 'bg-green-bg'],
  [/text-rose-[0-9]+/g, 'text-red'],
  [/text-red-[0-9]+/g, 'text-red'],
  [/border-rose-[0-9]+/g, 'border-red'],
  [/bg-rose-[0-9]+/g, 'bg-red-bg'],
  [/text-amber-[0-9]+/g, 'text-gold'],
  [/bg-amber-[0-9]+/g, 'bg-surface-3'],
  [/border-amber-[0-9]+/g, 'border-gold'],
  [/bg-indigo-[0-9]+/g, 'bg-surface-3'],
  [/text-indigo-[0-9]+/g, 'text-pv-blue'],
  [/text-blue-[0-9]+/g, 'text-pv-blue'],
  [/bg-blue-[0-9]+/g, 'bg-surface-3'],
  [/bg-\[\#dff0d8\]/g, 'bg-green-bg'],
  [/border-\[\#d6e9c6\]/g, 'border-green'],
  [/bg-black/g, 'bg-surface-2'],
  [/border-t-black/g, 'border-t-border']
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [regex, replacement] of replacements) {
      content = content.replace(regex, replacement);
    }
    fs.writeFileSync(file, content);
  }
}
