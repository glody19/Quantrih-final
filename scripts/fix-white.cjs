const fs = require('fs');

function fixTextWhite(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // But we want to keep text-white around "bg-pv-blue text-white" so we don't mess up buttons
  // Let's first replace 'bg-pv-blue text-white' to a placeholder
  content = content.replaceAll('bg-pv-blue text-white', 'TEMP_BUTTON_TEXT');
  
  // Then replace the remaining text-white
  content = content.replaceAll('text-white', 'text-slate-900');
  
  // Then revert
  content = content.replaceAll('TEMP_BUTTON_TEXT', 'bg-pv-blue text-white');

  fs.writeFileSync(filePath, content);
}

fixTextWhite('src/components/pages/PortfolioBacktesting.tsx');
fixTextWhite('src/components/pages/TacticalAllocation.tsx');
