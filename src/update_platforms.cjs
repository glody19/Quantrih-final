const fs = require('fs');

let content = fs.readFileSync('src/components/pages/Platforms.tsx', 'utf8');

const oldDegiroFees = /\{platform\.id === 'degiro' && \([\s\S]*?\}\)/m;

const newDegiroFees = `{platform.id === 'degiro' && (
                                  <div className="pt-8 border-t border-border/40">
                                     <h4 className="text-sm font-black uppercase tracking-widest text-text-4 mb-4 flex items-center gap-2">
                                        <DollarSign size={16} className="text-pv-blue"/>
                                        {language === 'fr' ? 'Transparence Tarifaire (Grille 2026)' : 
                                         language === 'es' ? 'Transparencia de Tarifas (2026)' : 
                                         language === 'nl' ? 'Tarieventransparantie (2026)' : 
                                         'Fee Transparency (2026)'}
                                     </h4>
                                     <div className="bg-surface border border-border p-6 rounded-2xl text-sm text-text-3 space-y-5">
                                         <p className="font-medium leading-relaxed italic text-text-4">
                                            {language === 'fr' ? 'La grille tarifaire "Basic / Active / Trader" de DEGIRO se distingue par sa simplicité. Un frais fixe de gestion de 1,00 € s\\'applique aux transactions pour couvrir les coûts (compensation, règlement, courtage). Les ETFs de la sélection principale (Core Selection) font exception et sont commissionnés à 0,00 € (des conditions s\\'appliquent). Pour les conversions de devises, le profil Auto FX s\\'élève à 0,25 % par transaction. Les frais annuels de connectivité boursière sont plafonnés à 2,50 € par place boursière (hors place nationale).' : 
                                             language === 'es' ? 'La estructura de tarifas "Basic / Active / Trader" de DEGIRO destaca por su simplicidad. Se aplica una tarifa fija de gestión de 1,00 € a las transacciones para cubrir los gastos. La excepción es la "Core Selection" de ETFs, que tiene una comisión de 0,00 €. Para la conversión de divisas (Auto FX), se cobra un 0,25%. Las tarifas anuales de conectividad están limitadas a 2,50 € por mercado.' : 
                                             language === 'nl' ? 'De tariefstructuur "Basic / Active / Trader" van DEGIRO valt op door zijn eenvoud. Voor transacties geldt een vaste beheerkost van € 1,00 om de kosten te dekken. De kernselectie van ETF\\'s vormt hierop een uitzondering en wordt tegen € 0,00 verhandeld. Voor valutacompensatie via Auto FX geldt 0,25%. Jaarlijkse aansluitingskosten zijn beperkt tot € 2,50 per beurs.' : 
                                             'DEGIRO\\'s "Basic / Active / Trader" fee structure stands out for its simplicity. A flat handling fee of € 1.00 applies to transactions to cover clearing and settlement. The notable exception is the Core Selection of ETFs, which are traded at € 0.00 commission. Currency conversion under Auto FX incurs a 0.25% fee. Annual exchange connectivity fees are capped at € 2.50 per exchange.'}
                                         </p>

                                         <div className="grid grid-cols-1 gap-3 pt-2">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-border/40">
                                                <span className="font-semibold">{language === 'fr' ? 'Actions & ADR (US, EUR)' : 'Stocks & ADR (US, EUR)'}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] uppercase text-text-4">Commission</span>
                                                  <span className="font-mono text-text font-bold">1,00€</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-border/40">
                                                <span className="font-semibold">{language === 'fr' ? 'ETFs (Sélection Principale)' : 'ETFs (Core Selection)'}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] uppercase text-text-4">Commission</span>
                                                  <span className="font-mono text-green-500 font-bold drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">0,00€</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-border/40">
                                                <span className="font-semibold">{language === 'fr' ? 'Autres ETFs & Obligations' : 'Other ETFs & Bonds'}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] uppercase text-text-4">Commission</span>
                                                  <span className="font-mono text-text font-bold">2,00€</span>
                                                </div>
                                            </div>
                                         </div>
                                     </div>
                                  </div>
                              )}`;

content = content.replace(oldDegiroFees, newDegiroFees);

fs.writeFileSync('src/components/pages/Platforms.tsx', content);
console.log('Fixed Degiro fees layout and translations');
