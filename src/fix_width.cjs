const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx',
  'src/components/pages/PortfolioBacktesting.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="lg:w-1\/2 lg:border-r lg:border-border lg:pr-12"/g, 'className="lg:w-1/3 lg:border-r lg:border-border lg:pr-12"');
  fs.writeFileSync(file, content);
  console.log('Fixed div in', file);
});
