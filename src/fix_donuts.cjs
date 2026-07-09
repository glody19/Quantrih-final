const fs = require('fs');

const files = [
  'src/components/pages/AssetAllocations.tsx',
  'src/components/pages/TacticalAllocation.tsx',
  'src/components/pages/PortfolioBacktesting.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Ensure EliteDonut is imported
  if (!content.includes('EliteDonut')) {
    content = content.replace(
      /import { Line.*? } from "react-chartjs-2";/g,
      `$& \nimport { EliteDonut } from "../ui/EliteDonut";`
    );
  }

  // Replace the Doughnut block.
  // The layout is generally:
  // <div className="lg:w-1/3">
  //   <h3 ... >...</h3>
  //   <div className="w-full max-w-[280px] mx-auto aspect-square relative flex items-center justify-center">
  //     <Doughnut ... />
  //   </div>
  // </div>
  
  // Actually, wait, replacing the whole layout might be easier by matching the block. Let's use regex carefully.
  
  // PortfolioBacktesting & AssetAllocations & TacticalAllocation
  const regex = /<div className="lg:w-1\/3">([\s\S]*?)<div className="w-full max-w-\[280px\].*?>[\s\S]*?<Doughnut[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex-1">/g;

  content = content.replace(regex, (match) => {
    // We want to replace the lg:w-1/3 completely? Or rather change the flex layout.
    // Right now it's:
    // <div className="flex flex-col lg:flex-row gap-12">
    //   <div className="lg:w-1/3"> ... </div>
    //   <div className="flex-1"> ... </div>
    // </div>
    
    // Instead of side-by-side, maybe let's just put EliteDonut spanning full width or keep it side by side?
    // EliteDonut has its own legend attached.
    // Let's just return EliteDonut instead of <div className="w-full max-w-[280px]...">...</div>
    
    return match.replace(
      /<div className="w-full max-w-\[280px\][\s\S]*?<\/div>\s*(?=<div className="flex-1">|$)/,
      `<EliteDonut 
         assets={results[activeResIdx].assets || []} 
         allocations={results[activeResIdx].alloc || {}} 
         title="Asset Allocation Details" 
       />
      `
    );
  });
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
