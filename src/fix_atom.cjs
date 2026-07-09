const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AtomAnimation.tsx', 'utf8');

// Use alpha: true
code = code.replace(/const ctx = canvas\.getContext\('2d', \{ alpha: false \}\); \/\/ alpha: false can improve performance if we fill background/, "const ctx = canvas.getContext('2d', { alpha: true });");
code = code.replace(/const ctx = canvas\.getContext\('2d', \{ alpha: false \}\);/, "const ctx = canvas.getContext('2d', { alpha: true });");

// Remove fillRect for background
code = code.replace(/\/\/ Draw background \(since alpha: false\)\s*ctx\.fillStyle = '#0f172a';[^\n]*\n\s*ctx\.fillRect\(0, 0, width, height\);/, "ctx.clearRect(0, 0, width, height);");

fs.writeFileSync('src/components/ui/AtomAnimation.tsx', code);
console.log('AtomAnimation fixed');
