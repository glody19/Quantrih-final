const fs = require('fs');
let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

const regex = /(<div className="space-y-4">\s*<label className="text-\[9px\] font-bold text-text-3 uppercase tracking-widest">Initial Amount<\/label>[\s\S]*?<\/div>)/;

const brokerUI = `
                  <div className="space-y-4">
                      <label className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{t('pb.broker')} / {t('common.parameters')}</label>
                      <select value={broker} onChange={e => setBroker(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text text-sm focus:outline-none focus:border-pv-blue transition-colors">
                        <option value="degiro">DEGIRO</option>
                        <option value="free">Sans Frais (0€)</option>
                        <option value="custom">Autre / Personnalisé</option>
                      </select>
                      {broker === 'custom' && (
                         <div className="pt-2">
                             <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1 block">{t('pb.customFee')}</label>
                             <input type="number" step="0.1" value={customFee} onChange={e => setCustomFee(Number(e.target.value))} className="w-full bg-surface border border-border text-text rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner" />
                         </div>
                      )}
                  </div>`;

if (!content.includes('value={broker}')) {
   content = content.replace(regex, "$1\n" + brokerUI);
   fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', content);
   console.log('Added to TacticalAllocation!');
}
