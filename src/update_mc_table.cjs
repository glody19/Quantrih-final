const fs = require('fs');

let content = fs.readFileSync('src/components/pages/MonteCarlo.tsx', 'utf8');

content = content.replace(
  /<table className="w-full text-left border-collapse">/g,
  '<table className="w-full text-sm font-sans border-collapse">'
);

content = content.replace(
  /<tr className="bg-surface\/50 text-xs font-semibold text-text border-b border-border">/g,
  '<tr className="bg-surface-2 border-b border-border text-sm font-semibold text-text">'
);

content = content.replace(
  /<tbody className="divide-y divide-border text-xs font-mono font-medium">/g,
  '<tbody className="divide-y divide-border text-sm font-sans font-medium">'
);

fs.writeFileSync('src/components/pages/MonteCarlo.tsx', content);
