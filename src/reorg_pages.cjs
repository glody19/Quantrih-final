const fs = require('fs');

let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const regex = /const menus: MenuItem\[\] = \[\s*[\s\S]*?\s*\];/;

const newMenus = `const menus: MenuItem[] = [
    { id: 'fmp', label: language === 'fr' ? 'Marchés' : 'Markets' },
    { id: 'portfolio', label: language === 'fr' ? "Suivi Portefeuille" : 'Portfolio Tracking' },
    { id: 'asset-allocation', label: language === 'fr' ? "Backtest Portefeuille" : 'Backtest Portfolio' },
    { id: 'tactical-allocation', label: language === 'fr' ? 'Allocation Tactique' : 'Tactical Allocation' },
    { id: 'montecarlo', label: language === 'fr' ? 'Projections' : 'Projections' },
    { id: 'education', label: language === 'fr' ? 'Ressources' : 'Resources' }
  ];`;

headerCode = headerCode.replace(regex, newMenus);

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log("Pages Reorganized in Header");
