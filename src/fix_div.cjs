const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx',
  'src/components/pages/PortfolioBacktesting.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the missing closing div
  const regex = /<EliteDonut([\s\S]*?)title="Asset Allocation Details" \s*\/>\s*<div className="flex-1">/g;

  content = content.replace(regex, `<EliteDonut$1title="Asset Allocation Details" />\n                        </div>\n                        <div className="flex-1">`);
  
  // also wait, lg:w-1/3 is too small for EliteDonut which has flex-row. Let's make it wider, maybe lg:w-1/2.
  content = content.replace(/<div className="lg:w-1\/3">\s*<h3([\s\S]*?)<EliteDonut/g, `<div className="lg:w-1/2 lg:border-r lg:border-border lg:pr-12">\n                          <h3$1<EliteDonut`);

  fs.writeFileSync(file, content);
  console.log('Fixed div in', file);
});
