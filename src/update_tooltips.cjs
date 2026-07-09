const fs = require('fs');

function updateTooltip(file) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /className=\"flex items-center gap-1\.5 w-max\"/g,
    'className=\"flex items-center gap-1.5 mb-1.5\"'
  );

  content = content.replace(
    /className=\"text-xs font-bold text-text \"/g,
    'className=\"text-xs font-semibold text-text \"'
  );

  fs.writeFileSync(file, content);
}

updateTooltip('src/components/pages/MonteCarlo.tsx');
updateTooltip('src/components/pages/TacticalAllocation.tsx');
