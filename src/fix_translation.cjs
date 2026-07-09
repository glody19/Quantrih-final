const fs = require('fs');

const files = [
  'src/components/pages/TacticalAllocation.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/const \{ language \} = useTranslation\(\);/g, "const { t, language } = useTranslation();");
  
  fs.writeFileSync(file, content);
  console.log('Fixed useTranslation in ', file);
}
