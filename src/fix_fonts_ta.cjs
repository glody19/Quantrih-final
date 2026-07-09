const fs = require('fs');

function unifyFonts(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix main headers if they don't exist
  if (!code.includes('<h1')) {
    if (filePath.includes('TacticalAllocation')) {
      code = code.replace(/<div className="-mx-4 md:-mx-8 -mt-4 pt-8 px-4 md:-px-8 pb-24 min-h-\[calc\(100vh-80px\)\] bg-surface-2 text-text-2 relative"><div className="absolute top-0 right-0 w-\[800px\] h-\[800px\] bg-pv-blue\/5 rounded-full blur-\[120px\] pointer-events-none translate-x-1\/2 -translate-y-1\/4" \/><div className="w-full max-w-\[1600px\] mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">\n      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border">\n          <div>\n              <p className="text-sm font-medium text-text-3 mt-2 max-w-2xl leading-relaxed">/g,
        `<div className="-mx-4 md:-mx-8 -mt-4 pt-8 px-4 md:px-8 pb-24 min-h-[calc(100vh-80px)] bg-surface-2 text-text-2 relative"><div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pv-blue/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4" /><div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      <div className="relative mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-text drop-shadow-sm flex items-center gap-4 mb-4">
          <Activity className="text-pv-blue w-10 h-10" />
          {language === 'fr' ? 'Allocation Tactique' : 'Tactical Allocation'}
        </h1>
        <p className="text-xs font-semibold text-text-4 uppercase tracking-[0.2em] max-w-3xl leading-relaxed border-l-2 border-pv-blue pl-4">`
      );
      code = code.replace(/<\/p>\n          <\/div>\n      <\/div>/, '</p>\n      </div>');
    }
    else if (filePath.includes('AssetAllocations')) {
      code = code.replace(/<div className="space-y-8 animate-fade-up max-w-full xl:max-w-\[1800px\] mx-auto px-4 md:px-8 pb-24">/,
        `<div className="space-y-8 animate-fade-up max-w-full xl:max-w-[1800px] mx-auto px-4 md:px-8 pb-24">
        <div className="relative mb-8 pt-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-text drop-shadow-sm flex items-center gap-4 mb-4">
            <PieChart className="text-pv-blue w-10 h-10" />
            {language === 'fr' ? 'Stratégies d\\'Allocation' : 'Asset Allocations'}
          </h1>
          <p className="text-xs font-semibold text-text-4 uppercase tracking-[0.2em] max-w-3xl leading-relaxed border-l-2 border-pv-blue pl-4">
            {language === 'fr' ? 'Évaluation des portefeuilles et stratégies structurelles ' : 'Review of portfolios and structural strategies'}
          </p>
        </div>`
      );
    }
    else if (filePath.includes('PortfolioBacktesting')) {
      code = code.replace(/<div className="space-y-8 animate-fade-up max-w-full xl:max-w-\[1800px\] mx-auto relative z-10">/,
        `<div className="space-y-8 animate-fade-up max-w-full xl:max-w-[1800px] mx-auto relative z-10">
        <div className="relative mb-8 pt-6">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-text drop-shadow-sm flex items-center gap-4 mb-4">
            <BarChart3 className="text-pv-blue w-10 h-10" />
            {language === 'fr' ? 'Portfolio Backtesting' : 'Portfolio Backtesting'}
          </h1>
          <p className="text-xs font-semibold text-text-4 uppercase tracking-[0.2em] max-w-3xl leading-relaxed border-l-2 border-pv-blue pl-4">
            {language === 'fr' ? 'Analysez les performances passées de vos allocations d\\'actifs' : 'Analyze past performances of your asset allocations'}
          </p>
        </div>`
      );
    }
  }

  // Update backtesting export
  let csvExportRegex = /results\.forEach\(r => downloadCSV\([\s\S]*?`portfolio_\$\{r\.name\.replace\(\/\\s\+\/g, '_'\)\}`[\s\S]*?\)\)/g;
  code = code.replace(csvExportRegex, `results.forEach(r => downloadCSV(
                 r.dates.map((d, idx) => ({ 
                   Date: d, 
                   Balance: r.balances[idx].toFixed(2),
                   Drawdown: r.drawdowns[idx].toFixed(2) + '%'
                 })), 
                 \`portfolio_\${r.name.replace(/\\s+/g, '_')}_monthly\`
               ))`);

  // General Typography normalisation
  code = code.replace(/text-\[11px\] font-black text-text uppercase tracking-\[0.2em\]/g, 'text-sm font-black uppercase tracking-[0.2em] text-text-3');
  // Add missing imports 
  if (filePath.includes('AssetAllocations') && !code.includes('PieChart')) {
      code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, `import { $1, PieChart } from 'lucide-react';`);
  }
  if (filePath.includes('PortfolioBacktesting') && !code.includes('BarChart3')) {
      code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, `import { $1, BarChart3 } from 'lucide-react';`);
  }

  fs.writeFileSync(filePath, code);
}

unifyFonts('src/components/pages/TacticalAllocation.tsx');
unifyFonts('src/components/pages/AssetAllocations.tsx');
unifyFonts('src/components/pages/PortfolioBacktesting.tsx');

console.log('Fonts and CSV unified');
