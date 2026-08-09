const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Enhance headings
  content = content.replace(/className="text-2xl font-bold text-white"/g, 'className="text-2xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-3xl font-bold text-white"/g, 'className="text-3xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-xl font-bold text-white"/g, 'className="text-xl font-bold text-blue-400 drop-shadow-md"');
  
  // Sometimes it's text-slate-100 or text-zinc-100
  content = content.replace(/className="text-2xl font-bold text-zinc-100"/g, 'className="text-2xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-3xl font-bold text-zinc-100"/g, 'className="text-3xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-xl font-bold text-zinc-100"/g, 'className="text-xl font-bold text-blue-400 drop-shadow-md"');

  content = content.replace(/className="text-2xl font-bold text-slate-100"/g, 'className="text-2xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-3xl font-bold text-slate-100"/g, 'className="text-3xl font-bold text-blue-400 drop-shadow-md"');
  content = content.replace(/className="text-xl font-bold text-slate-100"/g, 'className="text-xl font-bold text-blue-400 drop-shadow-md"');

  // And for the backgrounds, if the first attempt missed:
  content = content.replace(/bg-zinc-800\/50/g, 'bg-zinc-900/90 shadow-2xl');
  content = content.replace(/bg-slate-900\/50/g, 'bg-slate-900/90 shadow-2xl');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/profile/InvestorProfileForm.tsx');
fixFile('src/components/pages/Profile.tsx');
console.log("Fixed title colors and backgrounds");
