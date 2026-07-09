import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';
import { InfoTooltip } from '../ui/InfoTooltip';

interface PortfolioAnalysisExplicationProps {
 results: any[];
}

export function PortfolioAnalysisExplication({ results }: PortfolioAnalysisExplicationProps) {
 const { t, language } = useTranslation();

 if (!results || results.length === 0) return null;

 const isMulti = results.length > 1;

 const advancedResults = results.map(r => {
 const mr = r.monthlyReturns?.map((m: any) => m.value) || [];
 const avgMonthly = mr.length > 0 ? mr.reduce((a: number, b: number) => a + b, 0) / mr.length : 0;
 
 const sortedReturns = [...mr].sort((a, b) => a - b);
 const var5Idx = Math.floor(sortedReturns.length * 0.05);
 const historicalVaR = sortedReturns[Math.max(0, var5Idx)] || 0;
 
 const stdevMonthly = r.stdev / Math.sqrt(12);
 const analyticalVaR = avgMonthly - 1.645 * stdevMonthly;
 
 const varReturns = sortedReturns.slice(0, Math.max(1, var5Idx));
 const cVaR = varReturns.length > 0 ? (varReturns.reduce((a, b) => a + b, 0) / varReturns.length) : 0;

 const posCount = mr.filter((m: number) => m > 0).length;
 const posPercent = mr.length > 0 ? (posCount / mr.length) * 100 : 0;
 
 const gains = mr.filter((m: number) => m > 0);
 const avgGain = gains.length > 0 ? gains.reduce((a: number, b: number) => a + b, 0) / gains.length : 0;
 const losses = mr.filter((m: number) => m < 0);
 const avgLoss = losses.length > 0 ? losses.reduce((a: number, b: number) => a + b, 0) / losses.length : 0;
 const gainLossRatio = avgLoss !== 0 ? Math.abs(avgGain / avgLoss) : 0;

 const skewness = mr.length > 0 && stdevMonthly > 0 ? mr.reduce((a: number, b: number) => a + Math.pow((b - avgMonthly) / stdevMonthly, 3), 0) / mr.length : 0;
 const kurtosis = mr.length > 0 && stdevMonthly > 0 ? (mr.reduce((a: number, b: number) => a + Math.pow((b - avgMonthly) / stdevMonthly, 4), 0) / mr.length) - 3 : 0;
 const downsideDev = mr.length > 0 ? Math.sqrt(mr.reduce((acc: number, curr: number) => curr < 0 ? acc + Math.pow(curr, 2) : acc, 0) / mr.length) * Math.sqrt(12) : 0;

 return {
 ...r,
 avgMonthly,
 historicalVaR,
 analyticalVaR,
 cVaR,
 posCount,
 posPercent,
 gainLossRatio,
 skewness,
 kurtosis,
 downsideDev,
 mrCount: mr.length
 };
 });

 const getWinner = (metric: string, index: number, invert: boolean = false) => {
 if (!isMulti) return false;
 let vals = advancedResults.map(r => Number(r[metric]) || 0);
 let bestVal = invert ? Math.min(...vals) : Math.max(...vals);
 return Math.abs(Number(advancedResults[index][metric]) - bestVal) < 0.0001;
 };

 const getWinnerNegative = (metric: string, index: number) => {
 if (!isMulti) return false;
 let vals = advancedResults.map(r => r[metric] > 0 ? -r[metric] : r[metric]);
 let bestVal = Math.max(...vals);
 let myVal = advancedResults[index][metric] > 0 ? -advancedResults[index][metric] : advancedResults[index][metric];
 return Math.abs(myVal - bestVal) < 0.0001;
 };

 const formatPercent = (n: number) => isNaN(Number(n)) ? '0.00%' : Number(n).toFixed(2) + '%';
 const formatNum = (n: number) => isNaN(Number(n)) ? '0.00' : Number(n).toFixed(2);

 return (
 <div className="space-y-12 animate-fade-in font-sans pb-16">
 
 <div className="grid grid-cols-1 gap-12 mx-auto">
 
 {/* 1. RENDEMENTS */}
 <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
 <div className="bg-surface-2 px-8 py-6 border-b border-border">
 <h3 className="text-lg font-semibold text-text tracking-tight">1. Rendements (Returns)</h3>
 <p className="text-xs font-medium text-text mt-1 leading-relaxed">
 The absolute profitability of your investments. The Compound Annual Growth Rate (CAGR) is the most important metric because it accounts for the "snowball effect" of compound interest over time.
 </p>
 </div>
 <div className="p-8 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-text">
 <th className="text-left font-semibold pb-3 w-1/4">Métrique</th>
 
 {advancedResults.map((r, i) => (
 <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Arithmetic Mean (monthly)
 <InfoTooltip content={language === "fr" ? <>Rendement moyen mensuel simple. Ne prend pas en compte l'intérêt composé.</> : <>Simple average monthly return. Does not account for compounding.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.avgMonthly) >= 0 ? "text-green" : "text-red", getWinner('avgMonthly', i)  ? "font-bold" : "font-medium")}>{Number(r.avgMonthly) > 0 ? "+" : ""}{formatPercent(r.avgMonthly)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Arithmetic Mean (annualized)
 <InfoTooltip content={language === "fr" ? <>Rendement moyen annuel simple (moyenne mensuelle x 12).</> : <>Simple average annual return (monthly average x 12).</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.avgMonthly * 12) >= 0 ? "text-green" : "text-red", getWinner('avgMonthly', i)  ? "font-bold" : "font-medium")}>{Number(r.avgMonthly * 12) > 0 ? "+" : ""}{formatPercent(r.avgMonthly * 12)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Geometric Mean (annualized)
 <InfoTooltip content={language === "fr" ? <><span className="font-bold">CAGR</span> : The true compound annual average return experienced by your portfolio.</> : <><span className="font-bold">CAGR</span> : The true compound annual growth rate experienced by your portfolio.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.cagr) >= 0 ? "text-green" : "text-red", getWinner('cagr', i)  ? "font-semibold" : "font-medium")}>{Number(r.cagr) > 0 ? "+" : ""}{formatPercent(r.cagr)}</td>)}
 </tr>
 </tbody>
 </table>
 {isMulti && (
 <div className="mt-8 space-y-3">
 <p className="text-sm text-text leading-relaxed">
 <span className="font-bold text-text">Profitability Analysis:</span> The decisive parameter here is the CAGR (Geometric Mean). Unlike the simple average (Arithmetic Mean) which tends to positively exaggerate performance, the CAGR reflects exactly the real growth of the money invested year after year.
 </p>
 <p className="text-sm text-text leading-relaxed">
 Le portefeuille <span className="text-text font-semibold">{advancedResults.reduce((prev, curr) => prev.cagr > curr.cagr ? prev : curr).name}</span> demonstrates the best structural wealth creation capability here with a CAGR of <span className="font-mono bg-surface-3 px-1.5 py-0.5 rounded text-text">{formatPercent(Math.max(...advancedResults.map(r=>Number(r.cagr))))}</span>. This indicates a more efficient exposure to market risk premiums over the observed period.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* 2. RISQUE / VOLATILITÉ */}
 <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
 <div className="bg-surface-2 px-8 py-6 border-b border-border">
 <h3 className="text-lg font-semibold text-text tracking-tight">2. Risque / Volatilité (Risk)</h3>
 <p className="text-xs font-medium text-text mt-1 leading-relaxed">
 Mesure l'amplitude des variations de votre capital. Une forte volatilité peut mener à des rendements supérieurs mais augmente drastiquement la difficulté psychologique à conserver ses positions lors des crises.
 </p>
 </div>
 <div className="p-8 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-text">
 <th className="text-left font-semibold pb-3 w-1/4">Métrique</th>
 
 {advancedResults.map((r, i) => (
 <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Standard Deviation
 <InfoTooltip content={language === "fr" ? <>Volatilité globale du portefeuille. Plus ce chiffre est bas, plus la courbe de croissance est lisse.</> : <>Total portfolio volatility. A lower number indicates a smoother growth curve.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.stdev) >= 0 ? "text-green" : "text-red", getWinner('stdev', i, true)  ? "font-bold" : "font-medium")}>{formatPercent(r.stdev)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Downside Deviation
 <InfoTooltip content={language === "fr" ? <>Isole uniquement la volatilité des rendements négatifs. Un bon portefeuille limite ce chiffre.</> : <>Isolates the volatility of negative returns only. A good portfolio limits this number.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.downsideDev) >= 0 ? "text-green" : "text-red", getWinner('downsideDev', i, true)  ? "font-bold" : "font-medium")}>{formatPercent(r.downsideDev)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Maximum Drawdown
 <InfoTooltip content={language === "fr" ? <>La plus grande chute de capital historique (du plus haut sommet au plus bas creux).</> : <>The largest historical capital drop (from peak to trough).</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.maxDrawdown) >= 0 ? "text-green" : "text-red", getWinnerNegative('maxDrawdown', i)  ? "font-semibold" : "font-medium")}>{Number(r.maxDrawdown) > 0 ? "+" : ""}{formatPercent(r.maxDrawdown)}</td>)}
 </tr>
 </tbody>
 </table>
 {isMulti && (
 <div className="mt-8 space-y-3">
 <p className="text-sm text-text leading-relaxed">
 <span className="font-bold text-text">Vulnerability Analysis:</span> The Maximum Drawdown is by far the most concrete risk indicator. It simulates what you would have experienced at the worst time (2000, 2008, or 2020 crisis). 
 </p>
 <p className="text-sm text-text leading-relaxed">
 Le modèle <span className="text-text font-semibold">{advancedResults.reduce((prev, curr) => Math.abs(prev.maxDrawdown) < Math.abs(curr.maxDrawdown) ? prev : curr).name}</span> presents the most resilient profile with the most contained maximum drop (<span className="font-mono bg-surface-3 px-1.5 py-0.5 rounded text-text">{formatPercent(Math.max(...advancedResults.map(r=>Number(r.maxDrawdown))))}</span>). A lower Drawdown guarantees a faster return to breakeven (recovery time) and prevents panic selling. It is better to sacrifice a little yield if the gain in resilience is very important.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* 3. RAPPORT RISQUE RENDEMENT */}
 <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
 <div className="bg-surface-2 px-8 py-6 border-b border-border">
 <h3 className="text-lg font-semibold text-text tracking-tight">3. Rapport Risque / Rentabilité</h3>
 <p className="text-xs font-medium text-text mt-1 leading-relaxed">
 Juge de l'efficience pure du portefeuille : chaque unité de risque (stress) prise a-t-elle été suffisamment récompensée par du rendement ?
 </p>
 </div>
 <div className="p-8 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-text">
 <th className="text-left font-semibold pb-3 w-1/4">Métrique</th>
 
 {advancedResults.map((r, i) => (
 <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Sharpe Ratio
 <InfoTooltip content={language === "fr" ? <>Rendement excédentaire généré par niveau de risque "total". Généralement &gt; 1 est excellent.</> : <>Excess return generated per unit of "total" risk. Generally, &gt; 1 is excellent.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinner("sharpe", i) ? "font-bold" : "font-medium")}>{Number(r.sharpe) > 0 ? "+" : ""}{formatNum(r.sharpe)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Sortino Ratio
 <InfoTooltip content={language === "fr" ? <>Pénalise seulement les volatilités à la baisse (ne sanctionne pas les fortes hausses inattendues). Plus précis que Sharpe.</> : <>Penalizes only downside volatility (does not penalize unexpected large gains). More precise than Sharpe.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinner("sortino", i) ? "font-semibold" : "font-medium")}>{Number(r.sortino) > 0 ? "+" : ""}{formatNum(r.sortino)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Calmar Ratio
 <InfoTooltip content={language === "fr" ? <>CAGR divisé par le Max Drawdown. Détermine votre gain annuel par rapport à votre pire chute théorique.</> : <>CAGR divided by Max Drawdown. Determines your annual gain relative to your worst theoretical drop.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => {
 const calmar = r.maxDrawdown !== 0 ? Math.abs(r.cagr / r.maxDrawdown) : 0;
 const isWinner = isMulti && advancedResults.every(o => (o.maxDrawdown !== 0 ? Math.abs(o.cagr/o.maxDrawdown) : 0) <= calmar + 0.0001);
 return <td key={i} className={cn("text-right tabular-nums", isWinner ? "font-bold text-text" : "font-medium text-text")}>{formatNum(calmar)}</td>
 })}
 </tr>
 </tbody>
 </table>
 {isMulti && (
 <div className="mt-8 space-y-3">
 <p className="text-sm text-text leading-relaxed">
 <span className="font-bold text-text">Analyse d'Efficience :</span> Les professionnels s'accordent pour préférer le ratio de Sortino au ratio de Sharpe en gestion de portefeuilles longs, car la volatilité à la hausse (bien que capturée mathématiquement comme un risque dans Sharpe) est en réalité souhaitée par l'investisseur.
 </p>
 <p className="text-sm text-text leading-relaxed">
 L'allocation <span className="text-text font-semibold">{advancedResults.reduce((prev, curr) => prev.sortino > curr.sortino ? prev : curr).name}</span> est structurellement la plus optimale avec un Sortino Ratio dominant de <span className="font-mono bg-surface-3 px-1.5 py-0.5 rounded text-text">{formatNum(Math.max(...advancedResults.map(r=>Number(r.sortino))))}</span>. Elle compense très généreusement l'investisseur pour chaque goutte de volatilité baissière endurée. Si un portefeuille vous force à prendre beaucoup plus de risques pour très peu de rendement supplémentaire, ses ratios s'effondreront.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* 4. PERTE EXTRÊME (VaR) */}
 <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
 <div className="bg-surface-2 px-8 py-6 border-b border-border">
 <h3 className="text-lg font-semibold text-text tracking-tight">4. Risque Catastrophique Mensuel (VaR)</h3>
 <p className="text-xs font-medium text-text mt-1 leading-relaxed">
 Exposition aux pires mois possibles : Value at Risk et Expected Shortfall modélisent le risque systémique extrême (queues de distribution).
 </p>
 </div>
 <div className="p-8 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-text">
 <th className="text-left font-semibold pb-3 w-1/4">Métrique</th>
 
 {advancedResults.map((r, i) => (
 <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Historical VaR (5%)
 <InfoTooltip content={language === "fr" ? <>Pire perte mensuelle potentielle avec un niveau de confiance à 95%. "Sur 100 mois, les pires 5 mois seront en dessous de ce seuil".</> : <>Worst potential monthly loss with a 95% confidence level. "Out of 100 months, the worst 5 months will fall below this threshold".</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.historicalVaR) >= 0 ? "text-green" : "text-red", getWinnerNegative('historicalVaR', i)  ? "font-bold" : "font-medium")}>{Number(r.historicalVaR) > 0 ? "+" : ""}{formatPercent(r.historicalVaR)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Conditional VaR (5%) (CVaR)
 <InfoTooltip content={language === "fr" ? <><span className="font-bold underline">Expected Shortfall</span> : La moyenne absolue des 5% de pires mois. Exprime "quand les choses vont vraiment mal, à quoi s'attendre en moyenne".</> : <><span className="font-bold underline">Expected Shortfall</span> : The absolute average of the worst 5% of months. Expresses "when things go really wrong, what to expect on average".</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums", Number(r.cVaR) >= 0 ? "text-green" : "text-red", getWinnerNegative('cVaR', i)  ? "font-semibold" : "font-medium")}>{Number(r.cVaR) > 0 ? "+" : ""}{formatPercent(r.cVaR)}</td>)}
 </tr>
 </tbody>
 </table>
 {isMulti && (
 <div className="mt-8 space-y-3">
 <p className="text-sm text-text leading-relaxed">
 <span className="font-bold text-text">Extreme Events Analysis:</span> The Conditional VaR (CVaR) is particularly revealing for identifying mental "bankruptcy risk". In a month that would be in the Top 5% of the worst months in financial history, the CVaR identifies the average magnitude of capital destruction.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* 5. GESTION DES BAISSES */}
 <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
 <div className="bg-surface-2 px-8 py-6 border-b border-border">
 <h3 className="text-lg font-semibold text-text tracking-tight">5. Fiabilité Mensuelle et Asymétrie</h3>
 <p className="text-xs font-medium text-text mt-1 leading-relaxed">
 Répartition temporelle de la performance : Fréquence des mois gagnants et distribution statistique autour de la moyenne.
 </p>
 </div>
 <div className="p-8 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-text">
 <th className="text-left font-semibold pb-3 w-1/4">Métrique</th>
 
 {advancedResults.map((r, i) => (
 <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Mois Positifs (Win Rate)
 <InfoTooltip content={language === "fr" ? <>Probabilité qu'un mois donné clôture dans le vert. Indicateur clé du confort psychologique de l'investisseur.</> : <>Probability that a given month closes in the green. Key indicator of the investor's psychological comfort.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinner('posPercent', i) ? "font-bold" : "font-medium")}>{r.posCount}/{r.mrCount} ({formatPercent(r.posPercent)})</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Gain/Loss Ratio
 <InfoTooltip content={language === "fr" ? <>Moyenne des pourcentages de gains absolus divisée par la moyenne des pourcentages de pertes absolues.</> : <>Average of absolute percentage gains divided by the average of absolute percentage losses.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinner("gainLossRatio", i) ? "font-semibold" : "font-medium")}>{formatNum(r.gainLossRatio)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Skewness (Asymétrie)
 <InfoTooltip content={language === "fr" ? <>Un Skewness très négatif avertit d'une forte asymétrie vers les krachs rapides (queue gauche épaisse). Un skewness proche de 0 ou positif est préférable.</> : <>A highly negative Skewness warns of a strong asymmetry towards rapid crashes (fat left tail). A skewness near 0 or positive is preferable.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinnerNegative("skewness", i) ? "font-bold" : "font-medium")}>{Number(r.skewness) > 0 ? "+" : ""}{formatNum(r.skewness)}</td>)}
 </tr>
 <tr className="border-b border-border hover:bg-surface-2">
 <td className="py-4 font-semibold text-text my-auto">
 <div className="flex items-center gap-1">
 Excess Kurtosis
 <InfoTooltip content={language === "fr" ? <>Indique l'aplatissement de la courbe. Plus de 3 (ou positif ici) indique de nombreuses "black swans" ou valeurs très extrêmes. Mieux vaut un niveau bas.</> : <>Indicates the flatness of the curve. Greater than 3 (or positive here) indicates many "black swans" or very extreme values. Better to have a low level.</>} />
 </div>
 </td>
 {advancedResults.map((r, i) => <td key={i} className={cn("text-right tabular-nums text-text", getWinner("kurtosis", i, true) ? "font-bold" : "font-medium")}>{formatNum(r.kurtosis)}</td>)}
 </tr>
 </tbody>
 </table>
 {isMulti && (
 <div className="mt-8 space-y-3">
 <p className="text-sm text-text leading-relaxed">
 <span className="font-bold text-text">Monthly Asymmetry Analysis:</span> The Gain/Loss ratio and the Win Rate give you a glimpse of the "path". The general stock market usually has negative skewness (takes the stairs up, elevator down). If your model successfully cancels this negative skewness or drastically improves the ratio of positive months, it indicates it contains strong de-correlators (like Gold, long "Safe Haven" bonds, or Trend Following strategies).
 </p>
 </div>
 )}
 </div>
 </section>

 </div>
 </div>
 );
}

