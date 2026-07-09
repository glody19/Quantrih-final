const fs = require('fs');

function enhanceTables(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change table row styling to a more inventive look
  content = content.replace(/className="border-b border-border hover:bg-surface-2 transition-all font-sans"/g, 'className="border-b border-border hover:bg-pv-blue/5 transition-all font-sans group"');
  
  // Make returns text flashier:
  content = content.replace(/className="text-lg font-black text-green"/g, 'className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green to-emerald-400 drop-shadow-sm"');
  content = content.replace(/className="text-lg font-black text-red"/g, 'className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red to-rose-400 drop-shadow-sm"');

  fs.writeFileSync(filePath, content);
}

['src/components/pages/TacticalAllocation.tsx', 'src/components/pages/AssetAllocations.tsx', 'src/components/pages/PortfolioBacktesting.tsx'].forEach(p => {
  if (fs.existsSync(p)) enhanceTables(p);
})
