const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/"common\.toplines": "Toplines"/g, `"common.toplines": "Toplines",`);
fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log('Fixed LanguageContext');
