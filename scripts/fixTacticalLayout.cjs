const fs = require('fs');

let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-surface border border-border\/60 rounded-xl p-6">/g,
  `<div className="bg-surface rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-5 text-left">
    <h3 className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2 mb-2">
      <Settings size={14} className="text-pv-blue" /> Paramètres Stratégiques
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">`
);

content = content.replace(
  /<\/div>\s*<div className="bg-surface border border-border\/60 rounded-xl p-6 space-y-6">/g,
  `</div></div>
  <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-5 text-left">`
);

// We need to also close the new inner div grid.
// Wait, replacing `</div>` is tricky because it's not unique.

fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', content);
