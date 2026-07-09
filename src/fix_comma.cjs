const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix missing comma
  content = content.replace(/capitalGainsTaxRate: capitalGainsTaxRate \/ 100\r?\n\s*transactionFeeAmount:/g, "capitalGainsTaxRate: capitalGainsTaxRate / 100,\n        transactionFeeAmount:");
  content = content.replace(/capitalGainsTaxRate: 0,\r?\n\s*transactionFeeAmount:/g, "capitalGainsTaxRate: 0,\n        transactionFeeAmount:");

  fs.writeFileSync(file, content);
  console.log('Fixed missing comma in ', file);
}
