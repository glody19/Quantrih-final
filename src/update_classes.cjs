const fs = require('fs');

const fileNames = ['src/components/pages/TacticalAllocation.tsx', 'src/components/pages/DualMomentum.tsx', 'src/components/pages/RelativeStrength.tsx', 'src/components/pages/MovingAverage.tsx'];

for (const fn of fileNames) {
  let content = fs.readFileSync(fn, 'utf8');

  // For inputs
  content = content.replace(/className=\"w-full bg-surface(-2)? border border-border( text-text)? rounded-2xl px-4 py-3 text-text font-mono text-sm focus:outline-none focus:border-pv-blue transition-colors\"/g, 'className=\"w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors\"');
  
  content = content.replace(/className=\"w-full bg-surface(-2)? border border-border( text-text)? rounded-2xl px-4 py-3 text-text text-sm focus:outline-none focus:border-pv-blue transition-colors\"/g, 'className=\"w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors\"');

  content = content.replace(/className=\"w-full bg-surface-2 border border-border rounded-\[1.5rem\] px-4 py-3 text-sm font-semibold outline-none focus:border-text transition-all( num)? \"/g, (match, num) => {
    return num 
      ? 'className=\"w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors\"' 
      : 'className=\"w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors\"';
  });

  fs.writeFileSync(fn, content);
}
