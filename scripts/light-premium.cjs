const fs = require('fs');

function makeLightPremium(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Backgrounds
  content = content.replaceAll('bg-[#0B0E14]', 'bg-slate-50/50');
  content = content.replaceAll('bg-[#121620]/80', 'bg-white/80');
  content = content.replaceAll('bg-[#121620]/40', 'bg-white/40');
  content = content.replaceAll('bg-[#0A0D14]/50', 'bg-slate-50/60');
  content = content.replaceAll('bg-[#0A0D14]', 'bg-white');
  content = content.replaceAll('bg-[#161a25]', 'bg-white/90');
  content = content.replaceAll('bg-[#1a1f2e]', 'bg-slate-50/80');

  // Borders
  content = content.replaceAll('border-slate-800/80', 'border-slate-200/80');
  content = content.replaceAll('border-slate-800/40', 'border-slate-200/60');
  
  // Shadows (making them lighter but still 3D)
  content = content.replaceAll('shadow-[0_8px_30px_rgb(0,0,0,0.4)]', 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5');
  content = content.replaceAll('shadow-[0_4px_20px_rgb(0,0,0,0.3)]', 'shadow-[0_4px_20px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5');

  // Text colors
  content = content.replaceAll('text-slate-300', 'text-slate-600');
  content = content.replaceAll('text-slate-400', 'text-slate-500');
  // Be careful with replacing text-white, as some buttons might need white text. 
  // Let's replace 'text-white' in inputs and forms:
  content = content.replaceAll('text-white placeholder-', 'text-slate-900 placeholder-');
  content = content.replaceAll('text-slate-100', 'text-slate-800');
  content = content.replaceAll('text-slate-200', 'text-slate-700');

  // Fix up specific text-white that were headers
  content = content.replaceAll('<h2 className="text-[11px] font-black text-white uppercase', '<h2 className="text-[11px] font-black text-slate-800 uppercase');
  content = content.replaceAll('<h3 className="text-[10px] font-black text-white uppercase', '<h3 className="text-[10px] font-black text-slate-800 uppercase');
  
  // Specific replacements for text-white in tactical allocation generic replacements
  // Just generic text-white replace except in buttons?
  // It's safer to just change the text colors we bumped to white
  
  content = content.replaceAll('bg-bg text-text', 'bg-slate-50/50 text-slate-800');

  fs.writeFileSync(filePath, content);
}

makeLightPremium('src/components/pages/PortfolioBacktesting.tsx');
makeLightPremium('src/components/pages/TacticalAllocation.tsx');
