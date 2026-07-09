const fs = require('fs');
let content = fs.readFileSync('src/components/pages/AssetAllocations.tsx', 'utf8');

const regex = /(<div className="space-y-4">\s*<div className="space-y-1\.5">\s*<TooltipLabel label="Rebalancing"[^]*?<\/select>\s*<\/div>)/;

const brokerUI = `
              <div className="space-y-1.5 pt-2">
                <TooltipLabel label={t('pb.broker')} tooltip="Tarification du courtier simulée." />
                <select value={broker} onChange={e => setBroker(e.target.value)} className="w-full bg-surface-2 border border-border text-text rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                  <option value="degiro">DEGIRO</option>
                  <option value="free">Sans Frais (0€)</option>
                  <option value="custom">Autre / Personnalisé</option>
                </select>
                {broker === 'custom' && (
                   <div className="pt-2">
                       <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1 block">{t('pb.customFee')}</label>
                       <input type="number" step="0.1" value={customFee} onChange={e => setCustomFee(Number(e.target.value))} className="w-full bg-surface-2 border border-border text-text rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner" />
                   </div>
                )}
              </div>`;

if (!content.includes('value={broker}')) {
   content = content.replace(regex, "$1\n" + brokerUI);
   fs.writeFileSync('src/components/pages/AssetAllocations.tsx', content);
   console.log('Added to AssetAllocations!');
}
