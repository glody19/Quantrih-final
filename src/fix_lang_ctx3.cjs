const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/,,/g, `,`);
fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log('Fixed LanguageContext 3');
