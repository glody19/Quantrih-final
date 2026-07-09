const fs = require('fs');

let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

content = content.replace(
  /th className="font-semibold py-3 px-4 text-xs/g,
  'th className="font-semibold py-3 px-4 text-sm'
);

fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', content);
