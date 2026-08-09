const fs = require('fs');
let content = fs.readFileSync('src/components/profile/InvestorProfileForm.tsx', 'utf8');

// Find the auto-save block
const autosaveBlockRegex = /\{\/\* Subtle Auto-save status header bar \*\/\}([\s\S]*?)<div className="flex-1 pt-1">/m;
const match = content.match(autosaveBlockRegex);

if (match) {
  let autosaveBlock = match[0].replace('<div className="flex-1 pt-1">', '');
  
  // Remove it from current position
  content = content.replace(match[0], '<div className="flex-1 pt-1">');
  
  // Place it at the very top of the return statement
  const returnIndex = content.indexOf('<div className="w-full flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">');
  
  if (returnIndex !== -1) {
    const replacement = `
    <div className="w-full flex flex-col gap-4">
      ${autosaveBlock}
      <div className="w-full flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
    `;
    content = content.replace('<div className="w-full flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">', replacement);
    
    // Add closing div at the end
    const lastDivIndex = content.lastIndexOf('</div>');
    content = content.substring(0, lastDivIndex) + '</div>\n' + content.substring(lastDivIndex);
    
    fs.writeFileSync('src/components/profile/InvestorProfileForm.tsx', content, 'utf8');
    console.log("Moved autosave to top");
  }
}
