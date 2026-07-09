const fs = require('fs');

let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// 1. Upper Data Strip Adjustments
// Height
header = header.replace(/h-9 flex items-center/g, 'h-11 flex items-center');

// Market Hours label
header = header.replace(/text-\[11px\] font-bold uppercase text-text-4 tracking-widest/g, 'text-xs font-semibold uppercase text-text-3 tracking-wider');

// Ticker times
header = header.replace(/text-xs font-mono text-text-2 font-semibold tracking-tighter/g, 'text-sm font-mono text-text-2 font-medium tracking-tight');

// Currency
header = header.replace(/text-\[9px\] font-black rounded-full uppercase/g, 'px-4 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider');
// The px-3.5 py-1 will be replaced but it might have been already or we just do:
header = header.replace(/px-3\.5 py-1 px-4 py-1\.5/g, 'px-4 py-1.5'); // just in case
header = header.replace(/"px-3\.5 py-1 text-\[9px\] font-black rounded-full uppercase transition-all"/g, '"px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider transition-all"');

// Languages
header = header.replace(/"text-\[11px\] font-bold uppercase tracking-widest transition-all px-2 py-1 rounded"/g, '"text-xs font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg"');


// 2. Main Header Adjustments
// Height
header = header.replace(/h-16 flex items-center/g, 'h-20 flex items-center');

// Nav links
header = header.replace(/"px-4 h-10 flex items-center gap-1\.5 text-sm font-semibold tracking-wide capitalize transition-all rounded-lg"/g, '"px-5 h-11 flex items-center gap-1.5 text-[15px] font-semibold tracking-tight capitalize transition-all rounded-lg"');

// Logo size
header = header.replace(/variant="sigma" size="sm"/g, 'variant="sigma" size="md"');

// Connect / Dashboard buttons
header = header.replace(/text-\[14px\] font-semibold tracking-wide/g, 'text-[15px] font-bold tracking-normal px-6 py-2.5');

// User profile block
header = header.replace(/text-\[12px\] font-semibold text-text uppercase/g, 'text-sm font-bold text-text uppercase tracking-wide');
header = header.replace(/text-\[11px\] font-medium text-text-3/g, 'text-xs font-medium text-text-3');

// Dropdown item links (children items)
header = header.replace(/"w-full text-left px-4 py-3 text-sm font-semibold tracking-wide capitalize transition-all rounded-lg"/g, '"w-full text-left px-5 py-3 text-[15px] font-semibold tracking-tight capitalize transition-all rounded-lg"');

// Mobile Menu Dropdown Link
header = header.replace(/"w-full text-left px-4 py-3 text-sm font-semibold tracking-wide capitalize transition-all rounded-lg mt-2"/g, '"w-full text-left px-5 py-3 text-[15px] font-semibold tracking-tight capitalize transition-all rounded-lg mt-2"');

fs.writeFileSync('src/components/layout/Header.tsx', header);
console.log('Premium fonts applied to Header');
