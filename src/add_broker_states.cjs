const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add State
  if (!content.includes('const [broker, setBroker]')) {
      content = content.replace(
        /const \[initialAmount, setInitialAmount\] = useState\(10000\);/g,
        `const [initialAmount, setInitialAmount] = useState(10000);\n  const [broker, setBroker] = useState('degiro');\n  const [customFee, setCustomFee] = useState(1.5);`
      );
  }

  // Edit engineOptions
  if (!content.includes('transactionFeeAmount:')) {
      content = content.replace(
        /(initialBalance:[ \t]*initialAmount,[\s\S]*?)(};)/g,
        `$1transactionFeeAmount: broker === 'degiro' ? 1.0 : (broker === 'custom' ? customFee : 0),\n      $2`
      );
  }

  fs.writeFileSync(file, content);
  console.log('Fixed ', file);
}
