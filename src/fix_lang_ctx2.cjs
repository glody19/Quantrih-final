const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/"common\.optimize": "Optimize"/g, `"common.optimize": "Optimize",`);
content = content.replace(/"common\.optimize": "Optimieren"/g, `"common.optimize": "Optimieren",`);
content = content.replace(/"common\.optimize": "Optimaliseren"/g, `"common.optimize": "Optimaliseren",`);
content = content.replace(/"common\.optimize": "Optimizar"/g, `"common.optimize": "Optimizar",`);

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log('Fixed LanguageContext 2');
