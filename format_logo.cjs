const fs = require('fs');
let content = fs.readFileSync('src/components/ui/Logo.tsx', 'utf8');
content = content.replace('lg: "w-8 h-8"', 'lg: "w-8 h-8 lg:w-10 lg:h-10"');
content = content.replace('lg: "text-2xl"', 'lg: "text-2xl lg:text-3xl"');
fs.writeFileSync('src/components/ui/Logo.tsx', content);
