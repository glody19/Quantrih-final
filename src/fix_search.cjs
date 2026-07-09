const fs = require('fs');

let input = fs.readFileSync('src/components/ui/TickerInput.tsx', 'utf8');
if (!input.includes('onSubmit?:')) {
  input = input.replace('disabled?: boolean;', 'disabled?: boolean;\n  onSubmit?: (val: string) => void;');
}
if (!input.includes('if (!isOpen && onSubmit)')) {
  input = input.replace('} else if (e.key === "Enter") {', '} else if (e.key === "Enter") {\n      if (!isOpen && onSubmit) { onSubmit(value); e.preventDefault(); return; }');
}
fs.writeFileSync('src/components/ui/TickerInput.tsx', input);

let fm = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

const searchBlockStart = '<div className="mb-8 flex gap-4 max-w-xl relative">';
const searchBlockEnd = '</div>\n        </div>';

const replaceWith = `<div className="mb-8 flex flex-row gap-0 max-w-xl relative rounded-xl shadow-sm border border-border/70 overflow-hidden bg-white">
          <TickerInput
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            onSelect={(val) => { setSearchInput(val); handleSelectSuggestion(val); }}
            onSubmit={(val) => handleSearch({ preventDefault: () => {} } as any)}
            className="border-0 focus:ring-0 shadow-none h-12 w-full text-lg"
            placeholder="Rechercher une entreprise..."
          />
          <button 
            onClick={(e) => handleSearch(e as any)}
            className="bg-pv-blue hover:bg-blue-600 text-white px-8 h-12 font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            Analyser
          </button>
        </div>`;

const sIdx = fm.indexOf(searchBlockStart);
if (sIdx !== -1) {
  const eIdx = fm.indexOf(searchBlockEnd, sIdx);
  if (eIdx !== -1) {
    const chunk = fm.substring(sIdx, eIdx + searchBlockEnd.length);
    fm = fm.replace(chunk, replaceWith);
    fs.writeFileSync('src/components/pages/FinancialModeling.tsx', fm);
    console.log("Replaced search block");
  }
}

