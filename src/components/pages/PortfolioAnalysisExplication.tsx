import React from 'react';
import { cn } from "../../lib/utils";
import { InfoTooltip } from "../ui/InfoTooltip";
import { useTranslation } from "../../contexts/LanguageContext";

interface MetricsResult {
  name: string;
  cagr: number;
  sharpe: number;
  sortino: number;
  stdev: number;
  maxDrawdown: number;
  historicalVaR: number;
  cVaR: number;
  posCount: number;
  mrCount: number;
  posPercent: number;
  gainLossRatio: number;
  skewness: number;
  kurtosis: number;
}

interface PortfolioAnalysisExplicationProps {
  advancedResults?: MetricsResult[];
  results?: any[];
}

const SECTION_I18N: Record<string, Record<string, string>> = {
  sec1_title: {
    en: "1. Compound Performance & Terminal Wealth",
    fr: "1. Performance Composée & Richesse Finale",
    nl: "1. Samengestelde Prestatie & Eindvermogen",
    de: "1. Zinseszins-Performance & Endvermögen",
    es: "1. Rendimiento Compuesto y Riqueza Final",
  },
  sec1_desc: {
    en: "Pure capital compounding capability across market cycles.",
    fr: "Capacité pure de capitalisation du capital à travers les cycles de marché.",
    nl: "Puur vermogen tot vermogensopbouw door marktcycli heen.",
    de: "Reine Kapitalwachstumskapazität über Marktzyklen hinweg.",
    es: "Capacidad pura de capitalización de capital a través de ciclos de mercado.",
  },
  cagr: {
    en: "Compound Annual Growth Rate (CAGR)",
    fr: "Taux de Croissance Annuel Composé (CAGR)",
    nl: "Geannualiseerde Groei (CAGR)",
    de: "Jährliche Wachstumsrate (CAGR)",
    es: "Tasa de Crecimiento Anual Compuesto (CAGR)",
  },
  cagr_tip: {
    en: "The true annualized return of the strategy, factoring in compounding.",
    fr: "Le vrai rendement annuel lissé de la stratégie, prenant en compte les intérêts composés.",
    nl: "Het werkelijke geannualiseerde rendement van de strategie, rekening houdend met samengestelde rente.",
    de: "Die tatsächliche jährliche Rendite der Strategie unter Berücksichtigung des Zinseszinses.",
    es: "El rendimiento anualizado real de la estrategia, teniendo en cuenta el interés compuesto.",
  },
  sec2_title: {
    en: "2. Total Volatility & Downside Stress",
    fr: "2. Volatilité Totale & Stress à la Baisse",
    nl: "2. Totale Volatiliteit & Neerwaartse Stress",
    de: "2. Gesamtvolatilität & Abwärtsstress",
    es: "2. Volatilidad Total y Estrés a la Baja",
  },
  sec2_desc: {
    en: "Oscillation amplitude and maximum drawdowns endured.",
    fr: "Amplitude d'oscillation et baisses maximales historiques subies.",
    nl: "Schommelingsamplitude en maximale geleden dalingen.",
    de: "Schwankungsbreite und historische maximale Verluste.",
    es: "Amplitud de oscilación y caídas máximas sufridas.",
  },
  stdev: {
    en: "Annualized Standard Deviation",
    fr: "Écart-Type Annualisé (Volatilité)",
    nl: "Geannualiseerde Standaarddeviatie",
    de: "Annualisierte Standardabweichung",
    es: "Desviación Estándar Anualizada",
  },
  stdev_tip: {
    en: "Measures the dispersion of returns around the mean. Higher means more volatile swings.",
    fr: "Mesure la dispersion des rendements autour de la moyenne. Plus élevé signifie des variations plus violentes.",
    nl: "Meet de spreiding van de rendementen rond het gemiddelde. Hoger betekent meer volatiliteit.",
    de: "Misst die Streuung der Renditen um den Mittelwert. Höher bedeutet stärkere Schwankungen.",
    es: "Mide la dispersión de los rendimientos alrededor de la media. Mayor significa más volatilidad.",
  },
  mdd: {
    en: "Maximum Drawdown (Peak to Trough)",
    fr: "Perte Maximale Historique (Max Drawdown)",
    nl: "Maximale Drawdown (Piek naar Dal)",
    de: "Maximaler Drawdown (Höchst- bis Tiefststand)",
    es: "Caída Máxima (Pico a Valle)",
  },
  mdd_tip: {
    en: "The worst loss experienced from a peak before recovering a new high.",
    fr: "La pire baisse subie depuis un sommet avant de retrouver un nouveau plus haut.",
    nl: "Het ergste verlies ervaren vanaf een piek voordat een nieuw record werd bereikt.",
    de: "Der größte Verlust von einem Höchststand bis zum Erreichen eines neuen Hochs.",
    es: "La peor pérdida sufrida desde un pico antes de recuperar un nuevo máximo.",
  },
  sec3_title: {
    en: "3. Risk-Adjusted Efficiency (Ratios)",
    fr: "3. Efficience Ajustée du Risque (Ratios)",
    nl: "3. Risicogecorrigeerde Efficiëntie (Ratios)",
    de: "3. Risikoadjustierte Effizienz (Ratios)",
    es: "3. Eficiencia Ajustada al Riesgo (Ratios)",
  },
  sec3_desc: {
    en: "Reward per unit of risk taken.",
    fr: "Rendement généré par unité de risque prise.",
    nl: "Rendement per genomen risico-eenheid.",
    de: "Rendite pro eingegangener Risikoeinheit.",
    es: "Rendimiento por unidad de riesgo asumida.",
  },
  sharpe: {
    en: "Sharpe Ratio (Total Risk)",
    fr: "Ratio de Sharpe (Risque Global)",
    nl: "Sharpe Ratio (Totaal Risico)",
    de: "Sharpe-Ratio (Gesamtrisiko)",
    es: "Ratio de Sharpe (Riesgo Total)",
  },
  sharpe_tip: {
    en: "Excess return relative to risk-free rate divided by total volatility.",
    fr: "Rendement excédentaire par rapport au taux sans risque divisé par la volatilité totale.",
    nl: "Rendement boven de risicovrije rente gedeeld door de totale volatiliteit.",
    de: "Überschussrendite gegenüber dem risikofreien Zins geteilt durch die Gesamtvolatilität.",
    es: "Exceso de rendimiento en relación con la tasa libre de riesgo dividido por la volatilidad total.",
  },
  sortino: {
    en: "Sortino Ratio (Downside Risk Only)",
    fr: "Ratio de Sortino (Risque de Baisse Seul)",
    nl: "Sortino Ratio (Alleen Neerwaarts Risico)",
    de: "Sortino-Ratio (Nur Abwärtsrisiko)",
    es: "Ratio de Sortino (Solo Riesgo a la Baja)",
  },
  sortino_tip: {
    en: "Excess return divided only by downside volatility. Ignores positive upside volatility.",
    fr: "Rendement excédentaire divisé uniquement par la volatilité baissière. Ignore la volatilité haussière.",
    nl: "Extra rendement alleen gedeeld door neerwaartse volatiliteit. Negeert positieve opwaartse volatiliteit.",
    de: "Überschussrendite nur geteilt durch die Abwärtsvolatilität. Ignoriert positive Aufwärtsvolatilität.",
    es: "Exceso de rendimiento dividido solo por la volatilidad a la baja. Ignora la volatilidad positiva a la alza.",
  },
  sec4_title: {
    en: "4. Extreme Monthly Risk (VaR & CVaR)",
    fr: "4. Risque Mensuel Extrême (VaR & CVaR)",
    nl: "4. Extreem Maandelijks Risico (VaR & CVaR)",
    de: "4. Extremes Monatliches Risiko (VaR & CVaR)",
    es: "4. Riesgo Mensual Extremo (VaR y CVaR)",
  },
  sec4_desc: {
    en: "Exposure to the worst possible months: Value at Risk and Expected Shortfall.",
    fr: "Exposition aux pires mois possibles : Value at Risk et Expected Shortfall.",
    nl: "Blootstelling aan de slechtst mogelijke maanden: Value at Risk en Expected Shortfall.",
    de: "Exposition gegenüber den schlechtesten Monaten: Value at Risk und Expected Shortfall.",
    es: "Exposición a los peores meses posibles: Value at Risk y Expected Shortfall.",
  },
  sec5_title: {
    en: "5. Monthly Win Rate & Statistical Skewness",
    fr: "5. Taux de Réussite Mensuel & Asymétrie",
    nl: "5. Maandelijks Winstpercentage & Asymmetrie",
    de: "5. Monatliche Gewinnrate & Schiefe",
    es: "5. Tasa de Ganancia Mensual y Asimetría Estadistica",
  },
  sec5_desc: {
    en: "Temporal distribution of performance and tail risks.",
    fr: "Distribution temporelle de la performance et risques de queue.",
    nl: "Temporele verdeling van prestaties en staartrisico's.",
    de: "Zeitliche Verteilung der Performance und Tail-Risiken.",
    es: "Distribución temporal del rendimiento y riesgos de cola.",
  },
  winrate: {
    en: "Positive Months (Win Rate)",
    fr: "Mois Positifs (Taux de Réussite)",
    nl: "Positieve Maanden (Winstpercentage)",
    de: "Positive Monate (Gewinnrate)",
    es: "Meses Positivos (Tasa de Ganancia)",
  },
  gainloss: {
    en: "Gain/Loss Ratio",
    fr: "Ratio Gain/Perte",
    nl: "Winst/Verlies Ratio",
    de: "Gewinn/Verlust-Verhältnis",
    es: "Ratio Ganancia/Pérdida",
  },
  skewness: {
    en: "Skewness (Asymmetry)",
    fr: "Skewness (Asymétrie)",
    nl: "Skewness (Asymmetrie)",
    de: "Schiefe (Skewness)",
    es: "Sesgo (Skewness)",
  },
  kurtosis: {
    en: "Excess Kurtosis (Fat Tails)",
    fr: "Excess Kurtosis (Queues Épaisses)",
    nl: "Excess Kurtosis (Extreme Waarden)",
    de: "Kurtosis (Extremwerte)",
    es: "Exceso de Curtosis (Colas Anchas)",
  },
  metric: {
    en: "Metric",
    fr: "Métrique",
    nl: "Metriek",
    de: "Metrik",
    es: "Métrica",
  },
  var: {
    en: "Historical VaR (5%)",
    fr: "VaR Historique (5%)",
    nl: "Historische VaR (5%)",
    de: "Historischer VaR (5%)",
    es: "VaR Histórico (5%)",
  },
  cvar: {
    en: "Conditional VaR (5%) (CVaR)",
    fr: "VaR Conditionnelle (5%) (CVaR)",
    nl: "Voorwaardelijke VaR (5%) (CVaR)",
    de: "Bedingter VaR (5%) (CVaR)",
    es: "VaR Condicional (5%) (CVaR)",
  }
};

export function PortfolioAnalysisExplication({ advancedResults, results }: PortfolioAnalysisExplicationProps) {
  const { language } = useTranslation();
  const langKey = (["en", "fr", "nl", "de", "es"].includes(language) ? language : "en") as keyof typeof SECTION_I18N["sec1_title"];

  const getText = (key: string) => {
    return SECTION_I18N[key]?.[langKey] || SECTION_I18N[key]?.["en"] || key;
  };

  const baseResults = advancedResults || results || [];

  if (!baseResults || baseResults.length === 0) return null;

  const activeResults = baseResults.map(r => {
    if (r.historicalVaR !== undefined) return r;
    
    let historicalVaR = 0, cVaR = 0, posCount = 0, mrCount = 0, posPercent = 0, gainLossRatio = 0, skewness = 0, kurtosis = 0;
    
    if (r.monthlyReturns && Array.isArray(r.monthlyReturns)) {
      const mrVals = r.monthlyReturns.map((m: any) => m.value || 0).sort((a: number, b: number) => a - b);
      mrCount = mrVals.length;
      if (mrCount > 0) {
        const idx5 = Math.floor(mrCount * 0.05);
        historicalVaR = mrVals[idx5] || 0;
        cVaR = mrVals.slice(0, idx5 + 1).reduce((sum: number, v: number) => sum + v, 0) / (idx5 + 1) || 0;
        
        posCount = mrVals.filter((v: number) => v > 0).length;
        posPercent = (posCount / mrCount) * 100;
        
        const avgGain = posCount > 0 ? mrVals.filter((v: number) => v > 0).reduce((sum: number, v: number) => sum + v, 0) / posCount : 0;
        const negCount = mrCount - posCount;
        const avgLoss = negCount > 0 ? mrVals.filter((v: number) => v < 0).reduce((sum: number, v: number) => sum + v, 0) / negCount : 0;
        gainLossRatio = avgLoss !== 0 ? Math.abs(avgGain / avgLoss) : 0;
        
        const avgMr = mrVals.reduce((sum: number, v: number) => sum + v, 0) / mrCount;
        const varMr = mrVals.reduce((sum: number, v: number) => sum + Math.pow(v - avgMr, 2), 0) / mrCount;
        const stdMr = Math.sqrt(varMr);
        
        if (stdMr !== 0) {
          skewness = (mrVals.reduce((sum: number, v: number) => sum + Math.pow(v - avgMr, 3), 0) / mrCount) / Math.pow(stdMr, 3);
          kurtosis = (mrVals.reduce((sum: number, v: number) => sum + Math.pow(v - avgMr, 4), 0) / mrCount) / Math.pow(stdMr, 4) - 3;
        }
      }
    }
    
    return {
      ...r,
      historicalVaR,
      cVaR,
      posCount,
      mrCount,
      posPercent,
      gainLossRatio,
      skewness,
      kurtosis
    };
  });

  const formatPercent = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return "N/A";
    return `${val.toFixed(2)}%`;
  };

  const formatNum = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return "N/A";
    return val.toFixed(2);
  };

  const getWinner = (metricKey: keyof MetricsResult, idx: number, lowerIsBetter = false) => {
    if (activeResults.length <= 1) return false;
    const values = activeResults.map(r => Number(r[metricKey]) || 0);
    const target = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    return Number(activeResults[idx][metricKey]) === target;
  };

  const getWinnerNegative = (metricKey: keyof MetricsResult, idx: number) => {
    if (activeResults.length <= 1) return false;
    const values = activeResults.map(r => Number(r[metricKey]) || 0);
    const target = Math.max(...values);
    return Number(activeResults[idx][metricKey]) === target;
  };

  return (
    <div className="w-full space-y-10 mt-12 font-sans">
      <div className="space-y-8">
        {/* 1. PERFORMANCE COMPOSÉE */}
        <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
          <div className="bg-surface-2 px-8 py-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text tracking-tight">{getText("sec1_title")}</h3>
            <p className="text-xs font-medium text-text mt-1 leading-relaxed">{getText("sec1_desc")}</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th className="text-left font-semibold pb-3 w-1/4">{getText("metric")}</th>
                  {activeResults.map((r, i) => (
                    <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">
                    <div className="flex items-center gap-1">
                      {getText("cagr")}
                      <InfoTooltip content={getText("cagr_tip")} />
                    </div>
                  </td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums", Number(r.cagr) >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold")}>
                      {Number(r.cagr) > 0 ? "+" : ""}{formatPercent(r.cagr)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. VOLATILITÉ & DRAWDOWNS */}
        <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
          <div className="bg-surface-2 px-8 py-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text tracking-tight">{getText("sec2_title")}</h3>
            <p className="text-xs font-medium text-text mt-1 leading-relaxed">{getText("sec2_desc")}</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th className="text-left font-semibold pb-3 w-1/4">{getText("metric")}</th>
                  {activeResults.map((r, i) => (
                    <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">
                    <div className="flex items-center gap-1">
                      {getText("stdev")}
                      <InfoTooltip content={getText("stdev_tip")} />
                    </div>
                  </td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner('stdev', i, true) ? "font-bold text-emerald-600" : "font-medium")}>
                      {formatPercent(r.stdev)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">
                    <div className="flex items-center gap-1">
                      {getText("mdd")}
                      <InfoTooltip content={getText("mdd_tip")} />
                    </div>
                  </td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-rose-600", getWinner('maxDrawdown', i, true) ? "font-bold" : "font-medium")}>
                      {formatPercent(r.maxDrawdown)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. RATIOS */}
        <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
          <div className="bg-surface-2 px-8 py-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text tracking-tight">{getText("sec3_title")}</h3>
            <p className="text-xs font-medium text-text mt-1 leading-relaxed">{getText("sec3_desc")}</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th className="text-left font-semibold pb-3 w-1/4">{getText("metric")}</th>
                  {activeResults.map((r, i) => (
                    <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">
                    <div className="flex items-center gap-1">
                      {getText("sharpe")}
                      <InfoTooltip content={getText("sharpe_tip")} />
                    </div>
                  </td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner('sharpe', i) ? "font-bold text-emerald-600" : "font-medium")}>
                      {formatNum(r.sharpe)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">
                    <div className="flex items-center gap-1">
                      {getText("sortino")}
                      <InfoTooltip content={getText("sortino_tip")} />
                    </div>
                  </td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner('sortino', i) ? "font-bold text-emerald-600" : "font-medium")}>
                      {formatNum(r.sortino)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. VAR & CVAR */}
        <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
          <div className="bg-surface-2 px-8 py-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text tracking-tight">{getText("sec4_title")}</h3>
            <p className="text-xs font-medium text-text mt-1 leading-relaxed">{getText("sec4_desc")}</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th className="text-left font-semibold pb-3 w-1/4">{getText("metric")}</th>
                  {activeResults.map((r, i) => (
                    <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("var")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums", Number(r.historicalVaR) >= 0 ? "text-emerald-600" : "text-rose-600", getWinnerNegative('historicalVaR', i) ? "font-bold" : "font-medium")}>
                      {Number(r.historicalVaR) > 0 ? "+" : ""}{formatPercent(r.historicalVaR)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("cvar")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums", Number(r.cVaR) >= 0 ? "text-emerald-600" : "text-rose-600", getWinnerNegative('cVaR', i) ? "font-semibold" : "font-medium")}>
                      {Number(r.cVaR) > 0 ? "+" : ""}{formatPercent(r.cVaR)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. MONTHLY WIN RATE & SKEWNESS */}
        <section className="bg-surface border border-border rounded-3xl shadow-md overflow-hidden text-left">
          <div className="bg-surface-2 px-8 py-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text tracking-tight">{getText("sec5_title")}</h3>
            <p className="text-xs font-medium text-text mt-1 leading-relaxed">{getText("sec5_desc")}</p>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th className="text-left font-semibold pb-3 w-1/4">{getText("metric")}</th>
                  {activeResults.map((r, i) => (
                    <th key={i} className="text-right font-bold text-text pb-3">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("winrate")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner('posPercent', i) ? "font-bold" : "font-medium")}>
                      {r.posCount}/{r.mrCount} ({formatPercent(r.posPercent)})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("gainloss")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner("gainLossRatio", i) ? "font-semibold" : "font-medium")}>
                      {formatNum(r.gainLossRatio)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("skewness")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinnerNegative("skewness", i) ? "font-bold" : "font-medium")}>
                      {Number(r.skewness) > 0 ? "+" : ""}{formatNum(r.skewness)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-surface-2">
                  <td className="py-4 font-semibold text-text my-auto">{getText("kurtosis")}</td>
                  {activeResults.map((r, i) => (
                    <td key={i} className={cn("text-right tabular-nums text-text", getWinner("kurtosis", i, true) ? "font-bold" : "font-medium")}>
                      {formatNum(r.kurtosis)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
