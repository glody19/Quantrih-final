const fs = require('fs');

let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Header nav links
header = header.replace(/text-xs font-semibold tracking-wide capitalize/g, 'text-sm font-semibold tracking-wide capitalize');

// Connect button
header = header.replace(/text-\[13px\]/g, 'text-[14px]');

// Market hours strip
header = header.replace(/text-\[10px\] font-bold uppercase/g, 'text-[11px] font-bold uppercase');
header = header.replace(/text-\[11px\] font-mono/g, 'text-xs font-mono');

// Select languages
header = header.replace(/text-\[10px\] font-bold uppercase tracking-widest transition-all px-2 py-1/g, 'text-[11px] font-bold uppercase tracking-widest transition-all px-2 py-1');

// Profile 
header = header.replace(/text-\[10px\] font-semibold text-text uppercase/g, 'text-[12px] font-semibold text-text uppercase');

// Menu labels mobile
header = header.replace(/text-\[10px\] font-black uppercase tracking-\[0.2em\]/g, 'text-xs font-bold uppercase tracking-[0.1em]');

// Logo
header = header.replace(/text-lg font-black tracking-tighter/g, 'text-xl font-black tracking-tighter');

fs.writeFileSync('src/components/layout/Header.tsx', header);
console.log('Fixed font sizes in header');
