const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/"ta\.tit": "Asignación Táctica",\n\};/g, `"ta.tit": "Asignación Táctica"\n  }\n};`);
fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log('Fixed translations wrapper');
