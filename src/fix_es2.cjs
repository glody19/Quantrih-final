const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/"ta\.tit": "Asignación Táctica",\n\};\n\nconst LanguageContext/g, `"ta.tit": "Asignación Táctica"\n  }\n};\n\nconst LanguageContext`);
fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log('Fixed translations wrapper');
