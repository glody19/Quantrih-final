const fs = require('fs');
let file = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

const oldMarqueeStart = '<div className="w-full mt-12 bg-white flex items-center overflow-hidden z-40 mb-4 border border-border/80 rounded-xl">';
const newMarqueeStart = '<div className="fixed bottom-0 left-0 w-full bg-white flex items-center overflow-hidden z-[100] border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">';

file = file.replace(oldMarqueeStart, newMarqueeStart);

// We should also add some padding to the bottom of the page to prevent content from hiding behind the fixed marquee
// The main container is: <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-12 pt-8">
file = file.replace('<div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-12 pt-8">', '<div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-[80px] pt-8">');

fs.writeFileSync('src/components/pages/FinancialModeling.tsx', file);
console.log('Done moving marquee to fixed bottom');
