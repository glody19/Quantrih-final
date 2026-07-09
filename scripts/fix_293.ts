import fs from 'fs';

let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

// The lines we want to insert at
const lines = content.split('\n');

// 293 is index 292
lines.splice(292, 0, '                  </div>');

// Return to string
fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', lines.join('\n'));
