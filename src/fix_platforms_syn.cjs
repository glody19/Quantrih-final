const fs = require('fs');
let content = fs.readFileSync('src/components/pages/Platforms.tsx', 'utf8');

const regex = /\{platform\.id === 'degiro' && \([\s\S]*?\)\} \(\)\}/m;
// wait looking at my old code:
// The regex was: /\{platform\.id === 'degiro' && \([\s\S]*?\}\)/m
// It probably matched too little or too much.

content = content.replace(/ \(\)\}/g, ''); // just remove that rogue trailing `()}`

fs.writeFileSync('src/components/pages/Platforms.tsx', content);
