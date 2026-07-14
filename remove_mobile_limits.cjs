const fs = require('fs');
const files = [
    'src/components/pages/AssetAllocations.tsx',
    'src/components/pages/PortfolioBacktesting.tsx',
    'src/components/pages/MonteCarlo.tsx',
    'src/components/pages/TacticalAllocation.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Replace isMobile limits
        content = content.replace(/const isMobile = typeof window !== "undefined" && window.innerWidth < 768;\s*if \(isMobile && [A-Za-z0-9_]+\.length >= 3\) \{\s*alert\([^)]+\);\s*return;\s*\}/g, '');
        fs.writeFileSync(file, content);
    }
});
