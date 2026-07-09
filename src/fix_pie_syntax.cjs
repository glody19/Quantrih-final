const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx',
  'src/components/pages/PortfolioBacktesting.tsx'
];

const PREM_COLORS = "['#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#a855f7', '#64748b']";

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken code:
  const brokenRegex = /backgroundColor: \['#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#a855f7', '#64748b'\]\.slice\(0, Object\.keys\(r\.alloc\)\.length\), i\) => `hsl\(\$\{\(i \* 360 \/ Object\.keys\(r\.alloc\)\.length\)\}, 70%, 50%\)`\),?/g;
  
  content = content.replace(brokenRegex, `backgroundColor: ${PREM_COLORS}.slice(0, Object.keys(r.alloc).length),`);

  fs.writeFileSync(file, content);
  console.log('Fixed Pie colors syntax in', file);
});
