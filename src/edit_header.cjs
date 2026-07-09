const fs = require('fs');

let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Modernize main nav items
header = header.replace(/text-\[10px\] font-medium uppercase tracking-\[0\.2em\]/g, 'text-xs font-semibold tracking-wide capitalize');
header = header.replace(/text-pv-blue bg-pv-blue-bg/g, 'text-pv-blue bg-pv-blue/10');

// Modernize the connect button
header = header.replace(
  /bg-\[#EAB308\] text-\[#422006\] rounded-full text-\[13px\] font-semibold tracking-wide transition-all hover:bg-\[#FACC15\] shadow-sm active:scale-95 whitespace-nowrap/g,
  'bg-pv-blue text-white rounded-lg px-5 py-2 text-[13px] font-semibold tracking-wide transition-all hover:bg-blue-600 shadow-sm active:scale-95 whitespace-nowrap'
);

// Modernize the upper data strip for a more institutional look
header = header.replace(/bg-white\/50 dark:bg-\[#0A0E1A\]\/50/g, 'bg-surface-2/80');
header = header.replace(/text-\[9px\] font-black uppercase text-text-4\/50 tracking-widest/g, 'hidden xl:block text-[10px] font-bold uppercase text-text-4 tracking-widest');
header = header.replace(/text-\[9px\] font-black uppercase text-text-4 tracking-\[0\.2em\] group-hover:text-text-2/g, 'text-[10px] font-bold uppercase text-text-4 tracking-widest group-hover:text-text-2');

// Improve the layout padding and heights
header = header.replace(/h-10 flex items-center/, 'h-9 flex items-center');
header = header.replace(/h-16 flex items-center/, 'h-16 flex items-center');

fs.writeFileSync('src/components/layout/Header.tsx', header);
console.log('Header updated for a more premium institutional look.');
