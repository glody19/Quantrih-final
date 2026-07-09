import React, { useState } from "react";
import { ChevronDown, ChevronUp, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";

// Extracted from the justETF list dataset
const ETF_CATEGORIES = [
 {
 name: "Actions Dynamique",
 etfs: [
 { name: "iShares Edge MSCI Europe Momentum Factor UCITS ETF EUR (Dist)", ter: "0,25%", ytd: "7,29%", size: "39", date: "23/02/18", dist: "Distribution", rep: "Échantillonnage optimisé", isin: "IE00BG13YJ64", ticker: "IEMD" },
 { name: "iShares Edge MSCI USA Momentum Factor UCITS ETF USD (Dist)", ter: "0,20%", ytd: "29,37%", size: "13", date: "21/02/18", dist: "Distribution", rep: "Réplication complète", isin: "IE00BFF5RZ82", ticker: "IUMD" }
 ]
 },
 {
 name: "Actions Faible volatilité/pondéré en fonction des risques",
 etfs: [
 { name: "iShares Edge MSCI Europe Minimum Volatility UCITS ETF EUR (Dist)", ter: "0,25%", ytd: "6,12%", size: "23", date: "23/02/18", dist: "Distribution", rep: "Échantillonnage optimisé", isin: "IE00BG13YK79", ticker: "MVED" },
 { name: "iShares Edge S&P 500 Minimum Volatility UCITS ETF USD (Dist)", ter: "0,20%", ytd: "6,29%", size: "126", date: "21/02/18", dist: "Distribution", rep: "Échantillonnage optimisé", isin: "IE00BD93YH54", ticker: "SPMD" }
 ]
 },
 {
 name: "Actions Fondamental/qualité",
 etfs: [
 { name: "iShares Edge MSCI Europe Quality Factor UCITS ETF EUR (Dist)", ter: "0,25%", ytd: "4,32%", size: "29", date: "23/02/18", dist: "Distribution", rep: "Échantillonnage optimisé", isin: "IE00BG13YG34", ticker: "IEQD" },
 { name: "iShares Edge MSCI USA Quality Factor UCITS ETF USD (Dist)", ter: "0,20%", ytd: "10,63%", size: "313", date: "21/02/18", dist: "Distribution", rep: "Réplication complète", isin: "IE00BF2QSQ20", ticker: "IUQD" }
 ]
 },
 {
 name: "Actions Monde",
 etfs: [
 { name: "Amundi MSCI World Swap II UCITS ETF Dist", ter: "0,30%", ytd: "11,17%", size: "8 539", date: "26/04/06", dist: "Distribution", rep: "Basée sur swap", isin: "FR0010315770", ticker: "WLD" },
 { name: "iShares MSCI ACWI UCITS ETF USD (Acc)", ter: "0,20%", ytd: "12,56%", size: "28 619", date: "21/10/11", dist: "Capitalisation", rep: "Échantillonnage optimisé", isin: "IE00B6R52259", ticker: "ISAC" },
 { name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating", ter: "0,19%", ytd: "12,44%", size: "40 588", date: "23/07/19", dist: "Capitalisation", rep: "Échantillonnage optimisé", isin: "IE00BK5BQT80", ticker: "VWRA" }
 ]
 },
 {
 name: "Actions États-Unis",
 etfs: [
 { name: "Amundi Core S&P 500 Swap UCITS ETF EUR Dist", ter: "0,05%", ytd: "11,91%", size: "3 089", date: "26/03/10", dist: "Distribution", rep: "Basée sur swap", isin: "LU0496786574", ticker: "SP5" },
 { name: "iShares Core S&P 500 UCITS ETF USD (Dist)", ter: "0,07%", ytd: "11,92%", size: "18 988", date: "15/03/02", dist: "Distribution", rep: "Réplication complète", isin: "IE0031442068", ticker: "IUSA" },
 { name: "Vanguard S&P 500 UCITS ETF (USD) Accumulating", ter: "0,07%", ytd: "11,80%", size: "29 018", date: "14/05/19", dist: "Capitalisation", rep: "Réplication complète", isin: "IE00BFMXXD54", ticker: "VUAA" }
 ]
 },
 {
 name: "Actions Europe",
 etfs: [
 { name: "Amundi Core EURO STOXX 50 UCITS ETF EUR Dist", ter: "0,09%", ytd: "6,86%", size: "899", date: "29/06/10", dist: "Distribution", rep: "Réplication complète", isin: "LU1681047319", ticker: "CD5" },
 { name: "iShares Core MSCI Europe UCITS ETF EUR (Dist)", ter: "0,12%", ytd: "7,06%", size: "10 389", date: "06/07/07", dist: "Distribution", rep: "Échantillonnage optimisé", isin: "IE00B1YZSC51", ticker: "IMEU" }
 ]
 }
];

export function EtfLexicon({ language, search }: { language: string, search: string }) {
 const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
 ETF_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
 );

 const toggleCategory = (name: string) => {
 setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));
 };

 const safeSearch = (search || "").toLowerCase().trim();

 // Filter based on search
 const categoriesToRender = ETF_CATEGORIES.map(cat => {
 const filteredEtfs = cat.etfs.filter(etf => 
 etf.name.toLowerCase().includes(safeSearch) || 
 etf.ticker.toLowerCase().includes(safeSearch) ||
 etf.isin.toLowerCase().includes(safeSearch)
 );
 return { ...cat, etfs: filteredEtfs };
 }).filter(cat => cat.etfs.length > 0);

 return (
 <section className="animate-fade-in bg-white rounded-[2rem] shadow-sm border border-border pb-8 overflow-hidden">
 {categoriesToRender.length === 0 ? (
 <div className="text-center py-20 animate-fade-in">
 <Database size={48} className="mx-auto text-border mb-4" />
 <h3 className="text-xl font-bold text-text mb-2">Aucun ETF trouvé</h3>
 <p className="text-text font-medium">Essayez de modifier votre recherche.</p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {categoriesToRender.map((category, idx) => (
 <div key={idx} className="w-full text-text">
 <button 
 onClick={() => toggleCategory(category.name)}
 className="w-full flex items-center gap-2 py-4 px-6 text-left hover:bg-surface-2 transition-colors"
 >
 <h3 className={cn("text-xl font-semibold tracking-tight transition-colors", openCategories[category.name] ? "text-amber-600" : "text-text")}>
 {category.name}
 </h3>
 <div className={cn("text-amber-600 transition-transform duration-200", openCategories[category.name] ? "rotate-180" : "rotate-0")}>
 <ChevronDown size={20} strokeWidth={2.5} />
 </div>
 </button>

 <AnimatePresence>
 {openCategories[category.name] && (
 <motion.div 
 key="content"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left whitespace-nowrap min-w-[1000px]">
 <thead className="text-sm font-bold text-text bg-surface-2 border-y border-surface-2">
 <tr>
 <th className="px-6 py-3 font-semibold">Nom du fonds</th>
 <th className="px-4 py-3 font-semibold text-right">Frais annuels</th>
 <th className="px-4 py-3 font-semibold text-right">Cette année<br/><span className="lowercase text-xs font-normal">en %</span></th>
 <th className="px-4 py-3 font-semibold text-right">Taille fonds<br/><span className="lowercase text-xs font-normal">(en M €)</span></th>
 <th className="px-4 py-3 font-semibold">Date de lancement</th>
 <th className="px-4 py-3 font-semibold">Distribution</th>
 <th className="px-4 py-3 font-semibold">Réplication</th>
 <th className="px-4 py-3 font-semibold">ISIN</th>
 <th className="px-6 py-3 font-semibold">Ticker</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {category.etfs.map((etf, etfIdx) => (
 <tr key={etfIdx} className="hover:bg-surface-2 group">
 <td className="px-6 py-4">
 <a href="#" className="font-medium text-text group-hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-600 underline-offset-4 transition-colors">
 {etf.name}
 </a>
 </td>
 <td className="px-4 py-4 text-right text-text">{etf.ter}</td>
 <td className="px-4 py-4 text-right tabular-nums text-text">{etf.ytd}</td>
 <td className="px-4 py-4 text-right tabular-nums text-text">{etf.size}</td>
 <td className="px-4 py-4 text-text">{etf.date}</td>
 <td className="px-4 py-4 text-text">{etf.dist}</td>
 <td className="px-4 py-4 text-text">{etf.rep}</td>
 <td className="px-4 py-4 font-mono text-sm text-text">{etf.isin}</td>
 <td className="px-6 py-4 text-text">{etf.ticker}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>
 )}
 </section>
 );
}

