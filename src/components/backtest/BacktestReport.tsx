import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { cn } from "../../lib/utils";

/** Minimal shape of a backtest result used by the report (see PortfolioBacktesting). */
export interface ReportPortfolio {
  id: string;
  name: string;
  color: string;
  initialAmount: number;
  endBalance: number;
  cagr: number; // %
  stdev: number; // %
  maxDrawdown: number; // negative %
  sharpe: number;
  sortino: number;
  balances: number[];
  dates: string[];
  drawdowns: number[]; // negative %
  monthlyReturns: { date: string; value: number }[]; // % per month (time-weighted)
  rolling1Y?: any; rolling3Y?: any; rolling5Y?: any; rolling10Y?: any;
  totalContributions?: number;
  metrics?: Record<string, any>;
  ext?: Record<string, any>;
}

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const pct = (v: any, d = 2) => (isNum(v) ? `${v.toFixed(d)}%` : "—");
const num = (v: any, d = 2) => (isNum(v) ? v.toFixed(d) : "—");

const T = {
  en: {
    summary: "Summary", metrics: "Metrics", annual: "Annual returns", drawdowns: "Drawdowns", rolling: "Rolling returns",
    perfSummary: "Portfolio performance summary", portfolio: "Portfolio", initial: "Initial balance", final: "Final balance", cagr: "CAGR", stdev: "Stdev",
    best: "Best year", worst: "Worst year", maxdd: "Max. drawdown", sharpe: "Sharpe ratio", sortino: "Sortino ratio", corr: "Benchmark correlation",
    growth: "Portfolio growth", log: "Logarithmic scale", annualTitle: "Annual returns", trailing: "Trailing returns", full: "Full",
    riskReturn: "Risk and return metrics", metric: "Metric", year: "Year", balance: "Balance", rank: "Rank", start: "Start", end: "End", length: "Length",
    recoveryBy: "Recovered", recoveryTime: "Recovery time", underwater: "Underwater period", drawdown: "Drawdown", months: "months", ongoing: "Ongoing",
    underwaterChart: "Drawdowns from previous peak", rollingTitle: "Rolling returns (annualized)", period: "Period", average: "Average", high: "High", low: "Low",
    bestHint: "Best value per column is highlighted.", annualized: "annualized",
    method: "Methodology: monthly time-weighted returns (contributions and withdrawals excluded). Standard deviation and ratios are annualized from monthly data (× √12). Sharpe and Sortino use the 13-week US T-bill yield as the risk-free rate when available; Sortino uses the downside deviation of returns below the risk-free rate. Beta, alpha and R² come from a regression of monthly excess returns on the benchmark. VaR figures are monthly at the 5% level. Up/down capture ratios use compounded returns in the benchmark's up and down months.",
    rows: {
      arithMean: "Arithmetic mean (annualized)", geometricMean: "Geometric mean (annualized)", stdev: "Standard deviation (annualized)", downsideDeviation: "Downside deviation (annualized)",
      maxDrawdown: "Maximum drawdown", correlation: "Benchmark correlation", beta: "Beta", alpha: "Alpha (annualized)", rSquared: "R²", sharpe: "Sharpe ratio", sortino: "Sortino ratio",
      treynor: "Treynor ratio (%)", calmar: "Calmar ratio", modigliani: "Modigliani (M²)", activeReturn: "Active return", trackingError: "Tracking error", informationRatio: "Information ratio",
      skewness: "Skewness", excessKurtosis: "Excess kurtosis", historicalVaR5: "Historical VaR (5%)", analyticalVaR5: "Analytical VaR (5%)", conditionalVaR5: "Conditional VaR (5%)",
      upCapture: "Upside capture ratio (%)", downCapture: "Downside capture ratio (%)", positiveMonths: "Positive periods", gainLossRatio: "Gain/loss ratio", riskFreeAnnual: "Risk-free rate used (annualized)",
    } as Record<string, string>,
  },
  fr: {
    summary: "Synthèse", metrics: "Indicateurs", annual: "Rendements annuels", drawdowns: "Pertes maximales", rolling: "Rendements glissants",
    perfSummary: "Synthèse des performances", portfolio: "Portefeuille", initial: "Capital initial", final: "Valeur finale", cagr: "TCAC", stdev: "Volatilité",
    best: "Meilleure année", worst: "Pire année", maxdd: "Perte max.", sharpe: "Ratio de Sharpe", sortino: "Ratio de Sortino", corr: "Corrélation au benchmark",
    growth: "Croissance du portefeuille", log: "Échelle logarithmique", annualTitle: "Rendements annuels", trailing: "Rendements sur période", full: "Total",
    riskReturn: "Indicateurs de risque et de rendement", metric: "Indicateur", year: "Année", balance: "Valeur", rank: "Rang", start: "Début", end: "Fin", length: "Durée",
    recoveryBy: "Récupéré", recoveryTime: "Temps de récupération", underwater: "Période sous l'eau", drawdown: "Perte", months: "mois", ongoing: "En cours",
    underwaterChart: "Baisse depuis le précédent sommet", rollingTitle: "Rendements glissants (annualisés)", period: "Période", average: "Moyenne", high: "Plus haut", low: "Plus bas",
    bestHint: "La meilleure valeur de chaque colonne est mise en évidence.", annualized: "annualisé",
    method: "Méthode : rendements mensuels pondérés dans le temps (versements et retraits exclus). Volatilité et ratios annualisés à partir des données mensuelles (× √12). Sharpe et Sortino utilisent le rendement des bons du Trésor américain à 13 semaines comme taux sans risque lorsqu'il est disponible ; le Sortino utilise l'écart-type des rendements inférieurs au taux sans risque. Bêta, alpha et R² proviennent d'une régression des rendements excédentaires mensuels sur le benchmark. Les VaR sont mensuelles au seuil de 5 %. Les ratios de capture utilisent les rendements composés des mois de hausse et de baisse du benchmark.",
    rows: {
      arithMean: "Moyenne arithmétique (annualisée)", geometricMean: "Moyenne géométrique (annualisée)", stdev: "Écart-type (annualisé)", downsideDeviation: "Écart-type à la baisse (annualisé)",
      maxDrawdown: "Perte maximale", correlation: "Corrélation au benchmark", beta: "Bêta", alpha: "Alpha (annualisé)", rSquared: "R²", sharpe: "Ratio de Sharpe", sortino: "Ratio de Sortino",
      treynor: "Ratio de Treynor (%)", calmar: "Ratio de Calmar", modigliani: "Modigliani (M²)", activeReturn: "Rendement actif", trackingError: "Tracking error", informationRatio: "Ratio d'information",
      skewness: "Asymétrie", excessKurtosis: "Kurtosis excédentaire", historicalVaR5: "VaR historique (5 %)", analyticalVaR5: "VaR analytique (5 %)", conditionalVaR5: "VaR conditionnelle (5 %)",
      upCapture: "Capture haussière (%)", downCapture: "Capture baissière (%)", positiveMonths: "Mois positifs", gainLossRatio: "Ratio gain/perte", riskFreeAnnual: "Taux sans risque utilisé (annualisé)",
    } as Record<string, string>,
  },
};

type Tab = "summary" | "metrics" | "annual" | "drawdowns" | "rolling";

function money(v: number, ccy: string) {
  if (!isNum(v)) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(v);
  } catch {
    return Math.round(v).toLocaleString("en-US");
  }
}

/** Calendar-year time-weighted returns from monthly returns. */
function calendarReturns(p: ReportPortfolio) {
  const map = new Map<number, number>();
  p.monthlyReturns.forEach((m) => {
    const y = parseInt(m.date.substring(0, 4));
    map.set(y, (map.get(y) ?? 1) * (1 + m.value / 100));
  });
  return map; // growth factors
}

function trailing(p: ReportPortfolio, months: number | "ytd" | "full") {
  const r = p.monthlyReturns;
  if (!r.length) return null;
  let slice: typeof r;
  if (months === "full") slice = r;
  else if (months === "ytd") {
    const lastYear = r[r.length - 1].date.substring(0, 4);
    slice = r.filter((m) => m.date.startsWith(lastYear));
  } else {
    if (r.length < months) return null;
    slice = r.slice(-months);
  }
  const g = slice.reduce((a, m) => a * (1 + m.value / 100), 1);
  const n = slice.length;
  if (months === "ytd" || (typeof months === "number" && months <= 12)) return (g - 1) * 100;
  return (Math.pow(g, 12 / n) - 1) * 100;
}

export function BacktestReport({ portfolios, benchmarkId, currency = "USD", language = "en" }: { portfolios: ReportPortfolio[]; benchmarkId?: string; currency?: string; language?: string }) {
  const t = T[language === "fr" ? "fr" : "en"];
  const [tab, setTab] = useState<Tab>("summary");
  const [logScale, setLogScale] = useState(false);
  const [ddPortfolio, setDdPortfolio] = useState(0);

  const ext = (p: ReportPortfolio) => p.ext || p.metrics || {};
  const hasBenchmark = !!benchmarkId && portfolios.some((p) => p.id === benchmarkId);

  // Growth chart data (merged on date)
  const growthData = useMemo(() => {
    const byDate = new Map<string, any>();
    portfolios.forEach((p) => p.dates.forEach((d, i) => {
      const k = d.substring(0, 7);
      const row = byDate.get(k) || { d: k };
      row[p.id] = p.balances[i];
      byDate.set(k, row);
    }));
    return Array.from(byDate.values()).sort((a, b) => (a.d < b.d ? -1 : 1));
  }, [portfolios]);

  const ddData = useMemo(() => {
    const byDate = new Map<string, any>();
    portfolios.forEach((p) => p.dates.forEach((d, i) => {
      const k = d.substring(0, 7);
      const row = byDate.get(k) || { d: k };
      row[p.id] = p.drawdowns[i];
      byDate.set(k, row);
    }));
    return Array.from(byDate.values()).sort((a, b) => (a.d < b.d ? -1 : 1));
  }, [portfolios]);

  const annual = useMemo(() => {
    const years = new Set<number>();
    const maps = portfolios.map((p) => calendarReturns(p));
    maps.forEach((m) => m.forEach((_, y) => years.add(y)));
    const balByYear = portfolios.map((p) => {
      const m = new Map<number, number>();
      p.dates.forEach((d, i) => m.set(parseInt(d.substring(0, 4)), p.balances[i]));
      return m;
    });
    return Array.from(years).sort().map((y) => {
      const row: any = { y: String(y) };
      portfolios.forEach((p, i) => {
        const g = maps[i].get(y);
        row[p.id] = isNum(g) ? (g - 1) * 100 : null;
        row[`${p.id}_bal`] = balByYear[i].get(y) ?? null;
      });
      return row;
    });
  }, [portfolios]);

  const best = (vals: (number | null)[], higherIsBetter = true) => {
    const nums = vals.filter(isNum) as number[];
    if (nums.length < 2) return null;
    return higherIsBetter ? Math.max(...nums) : Math.min(...nums);
  };

  const summaryCols: { key: string; label: string; get: (p: ReportPortfolio) => number | null; fmt: (v: any) => string; hib?: boolean }[] = [
    { key: "initial", label: t.initial, get: (p) => p.initialAmount, fmt: (v) => money(v, currency) },
    { key: "final", label: t.final, get: (p) => p.endBalance, fmt: (v) => money(v, currency), hib: true },
    { key: "cagr", label: t.cagr, get: (p) => p.cagr, fmt: (v) => pct(v), hib: true },
    { key: "stdev", label: t.stdev, get: (p) => p.stdev, fmt: (v) => pct(v), hib: false },
    { key: "best", label: t.best, get: (p) => { const m = calendarReturns(p); return m.size ? (Math.max(...m.values()) - 1) * 100 : null; }, fmt: (v) => pct(v), hib: true },
    { key: "worst", label: t.worst, get: (p) => { const m = calendarReturns(p); return m.size ? (Math.min(...m.values()) - 1) * 100 : null; }, fmt: (v) => pct(v), hib: true },
    { key: "maxdd", label: t.maxdd, get: (p) => p.maxDrawdown, fmt: (v) => pct(v), hib: true },
    { key: "sharpe", label: t.sharpe, get: (p) => p.sharpe, fmt: (v) => num(v), hib: true },
    { key: "sortino", label: t.sortino, get: (p) => p.sortino, fmt: (v) => num(v), hib: true },
    ...(hasBenchmark ? [{ key: "corr", label: t.corr, get: (p: ReportPortfolio) => (p.id === benchmarkId ? 1 : ext(p).correlation ?? null), fmt: (v: any) => num(v) }] : []),
  ];

  const metricRows: { key: string; get: (p: ReportPortfolio) => any; fmt: (v: any) => string; rel?: boolean }[] = [
    { key: "arithMean", get: (p) => (isNum(ext(p).arithMean) ? ext(p).arithMean * 100 : null), fmt: (v) => pct(v) },
    { key: "geometricMean", get: (p) => (isNum(ext(p).geometricMean) ? ext(p).geometricMean * 100 : p.cagr), fmt: (v) => pct(v) },
    { key: "stdev", get: (p) => p.stdev, fmt: (v) => pct(v) },
    { key: "downsideDeviation", get: (p) => (isNum(ext(p).downsideDeviation) ? ext(p).downsideDeviation * 100 : null), fmt: (v) => pct(v) },
    { key: "maxDrawdown", get: (p) => p.maxDrawdown, fmt: (v) => pct(v) },
    { key: "correlation", get: (p) => (p.id === benchmarkId ? 1 : ext(p).correlation), fmt: (v) => num(v), rel: true },
    { key: "beta", get: (p) => (p.id === benchmarkId ? 1 : ext(p).beta), fmt: (v) => num(v), rel: true },
    { key: "alpha", get: (p) => (p.id === benchmarkId ? 0 : isNum(ext(p).alpha) ? ext(p).alpha * 100 : null), fmt: (v) => pct(v), rel: true },
    { key: "rSquared", get: (p) => (p.id === benchmarkId ? 100 : isNum(ext(p).rSquared) ? ext(p).rSquared * 100 : null), fmt: (v) => pct(v), rel: true },
    { key: "sharpe", get: (p) => p.sharpe, fmt: (v) => num(v) },
    { key: "sortino", get: (p) => p.sortino, fmt: (v) => num(v) },
    { key: "treynor", get: (p) => (isNum(ext(p).treynor) ? ext(p).treynor * 100 : null), fmt: (v) => num(v), rel: true },
    { key: "calmar", get: (p) => ext(p).calmar, fmt: (v) => num(v) },
    { key: "modigliani", get: (p) => (isNum(ext(p).modigliani) ? ext(p).modigliani * 100 : null), fmt: (v) => pct(v), rel: true },
    { key: "activeReturn", get: (p) => (p.id === benchmarkId ? 0 : isNum(ext(p).activeReturn) ? ext(p).activeReturn * 100 : null), fmt: (v) => pct(v), rel: true },
    { key: "trackingError", get: (p) => (p.id === benchmarkId ? 0 : isNum(ext(p).trackingError) ? ext(p).trackingError * 100 : null), fmt: (v) => pct(v), rel: true },
    { key: "informationRatio", get: (p) => (p.id === benchmarkId ? null : ext(p).informationRatio), fmt: (v) => num(v), rel: true },
    { key: "skewness", get: (p) => ext(p).skewness, fmt: (v) => num(v) },
    { key: "excessKurtosis", get: (p) => ext(p).excessKurtosis, fmt: (v) => num(v) },
    { key: "historicalVaR5", get: (p) => (isNum(ext(p).historicalVaR5) ? ext(p).historicalVaR5 * 100 : null), fmt: (v) => pct(v) },
    { key: "analyticalVaR5", get: (p) => (isNum(ext(p).analyticalVaR5) ? ext(p).analyticalVaR5 * 100 : null), fmt: (v) => pct(v) },
    { key: "conditionalVaR5", get: (p) => (isNum(ext(p).conditionalVaR5) ? ext(p).conditionalVaR5 * 100 : null), fmt: (v) => pct(v) },
    { key: "upCapture", get: (p) => (p.id === benchmarkId ? 100 : ext(p).upCapture), fmt: (v) => num(v), rel: true },
    { key: "downCapture", get: (p) => (p.id === benchmarkId ? 100 : ext(p).downCapture), fmt: (v) => num(v), rel: true },
    { key: "positiveMonths", get: (p) => (isNum(ext(p).positiveMonths) ? ext(p).positiveMonths * 100 : null), fmt: (v) => pct(v) },
    { key: "gainLossRatio", get: (p) => ext(p).gainLossRatio, fmt: (v) => num(v) },
    { key: "riskFreeAnnual", get: (p) => (isNum(ext(p).riskFreeAnnual) ? ext(p).riskFreeAnnual * 100 : null), fmt: (v) => pct(v) },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: t.summary },
    { id: "metrics", label: t.metrics },
    { id: "annual", label: t.annual },
    { id: "drawdowns", label: t.drawdowns },
    { id: "rolling", label: t.rolling },
  ];

  const Th = ({ children, left }: { children: React.ReactNode; left?: boolean }) => (
    <th className={cn("px-3 py-3 text-xs font-semibold uppercase tracking-wider text-text-3 whitespace-nowrap", left ? "text-left" : "text-right")}>{children}</th>
  );
  const Dot = ({ color }: { color: string }) => <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" style={{ background: color }} />;
  const card = "bg-white border border-border rounded-2xl";
  const h3 = "font-serif text-2xl font-semibold text-text";
  const tooltipStyle = { borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn("px-4 pb-3 pt-1 text-[15px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors", tab === tb.id ? "border-pv-blue text-text" : "border-transparent text-text-3 hover:text-text")}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <>
          <section className={card}>
            <div className="px-6 pt-5 pb-3 flex items-end justify-between gap-4">
              <h3 className={h3}>{t.perfSummary}</h3>
              <span className="text-xs text-text-3 hidden md:block">{t.bestHint}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm xl:text-[15px]">
                <thead className="border-y border-border bg-surface-2/60">
                  <tr><Th left>{t.portfolio}</Th>{summaryCols.map((c) => <Th key={c.key}>{c.label}</Th>)}</tr>
                </thead>
                <tbody>
                  {portfolios.map((p) => (
                    <tr key={p.id} className="border-b border-border/70 hover:bg-surface-2/40">
                      <td className="px-4 py-3 font-semibold text-text whitespace-nowrap"><Dot color={p.color} />{p.name}</td>
                      {summaryCols.map((c) => {
                        const v = c.get(p);
                        const b = c.hib === undefined ? null : best(portfolios.map((x) => c.get(x)), c.hib);
                        const isBest = b !== null && isNum(v) && v === b;
                        return (
                          <td key={c.key} className={cn("px-3 py-3 text-right tabular-nums whitespace-nowrap", isBest ? "font-semibold text-emerald-700 bg-emerald-50/60" : "text-text-2")}>{c.fmt(v)}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cn(card, "p-6")}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className={h3}>{t.growth}</h3>
              <label className="inline-flex items-center gap-2 text-sm text-text-2 cursor-pointer select-none">
                <input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} className="accent-[var(--color-pv-blue)]" />
                {t.log}
              </label>
            </div>
            <ResponsiveContainer width="100%" height={480}>
              <LineChart data={growthData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#EEF0F4" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} minTickGap={48} />
                <YAxis scale={logScale ? "log" : "auto"} domain={logScale ? ["auto", "auto"] : [0, "auto"]} allowDataOverflow tickFormatter={(v) => money(v, currency)} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [money(Number(v), currency), name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                {portfolios.map((p) => (
                  <Line key={p.id} dataKey={p.id} name={p.name} stroke={p.color} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>

          <div className="grid grid-cols-1 min-[1800px]:grid-cols-5 gap-6">
            <section className={cn(card, "p-6 min-[1800px]:col-span-3")}>
              <h3 className={cn(h3, "mb-4")}>{t.annualTitle}</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={annual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%">
                  <CartesianGrid stroke="#EEF0F4" vertical={false} />
                  <XAxis dataKey="y" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} minTickGap={8} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={52} />
                  <ReferenceLine y={0} stroke="#CBD5E1" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [pct(Number(v)), name]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                  {portfolios.map((p) => <Bar key={p.id} dataKey={p.id} name={p.name} fill={p.color} isAnimationActive={false} />)}
                </BarChart>
              </ResponsiveContainer>
            </section>
            <section className={cn(card, "min-[1800px]:col-span-2 overflow-hidden")}>
              <h3 className={cn(h3, "px-6 pt-5 pb-3")}>{t.trailing}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-[15px]">
                  <thead className="border-y border-border bg-surface-2/60">
                    <tr><Th left>{t.portfolio}</Th><Th>3M</Th><Th>YTD</Th><Th>1Y</Th><Th>3Y</Th><Th>5Y</Th><Th>10Y</Th><Th>{t.full}</Th></tr>
                  </thead>
                  <tbody>
                    {portfolios.map((p) => (
                      <tr key={p.id} className="border-b border-border/70">
                        <td className="px-4 py-3 font-semibold text-text whitespace-nowrap"><Dot color={p.color} />{p.name}</td>
                        {[3, "ytd", 12, 36, 60, 120, "full"].map((m) => {
                          const v = trailing(p, m as any);
                          return <td key={String(m)} className={cn("px-4 py-3 text-right tabular-nums", !isNum(v) ? "text-text-4" : v >= 0 ? "text-emerald-700" : "text-rose-700")}>{pct(v)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-6 py-3 text-xs text-text-3">3Y, 5Y, 10Y, {t.full}: {t.annualized}.</p>
            </section>
          </div>
        </>
      )}

      {tab === "metrics" && (
        <section className={cn(card, "overflow-hidden")}>
          <h3 className={cn(h3, "px-6 pt-5 pb-3")}>{t.riskReturn}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[15px]">
              <thead className="border-y border-border bg-surface-2/60">
                <tr><Th left>{t.metric}</Th>{portfolios.map((p) => <Th key={p.id}><Dot color={p.color} />{p.name}</Th>)}</tr>
              </thead>
              <tbody>
                {metricRows.filter((r) => !r.rel || hasBenchmark).map((r) => (
                  <tr key={r.key} className="border-b border-border/70 hover:bg-surface-2/40">
                    <td className="px-4 py-2.5 text-text-2 whitespace-nowrap">{t.rows[r.key]}</td>
                    {portfolios.map((p) => <td key={p.id} className="px-4 py-2.5 text-right tabular-nums text-text">{r.fmt(r.get(p))}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "annual" && (
        <section className={cn(card, "overflow-hidden")}>
          <h3 className={cn(h3, "px-6 pt-5 pb-3")}>{t.annualTitle}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[15px]">
              <thead className="border-y border-border bg-surface-2/60">
                <tr>
                  <Th left>{t.year}</Th>
                  {portfolios.map((p) => <React.Fragment key={p.id}><Th><Dot color={p.color} />{p.name}</Th><Th>{t.balance}</Th></React.Fragment>)}
                </tr>
              </thead>
              <tbody>
                {[...annual].reverse().map((row) => (
                  <tr key={row.y} className="border-b border-border/70 hover:bg-surface-2/40">
                    <td className="px-4 py-2.5 font-semibold text-text">{row.y}</td>
                    {portfolios.map((p) => (
                      <React.Fragment key={p.id}>
                        <td className={cn("px-4 py-2.5 text-right tabular-nums font-medium", !isNum(row[p.id]) ? "text-text-4" : row[p.id] >= 0 ? "text-emerald-700" : "text-rose-700")}>{pct(row[p.id])}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-text-3">{isNum(row[`${p.id}_bal`]) ? money(row[`${p.id}_bal`], currency) : "—"}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "drawdowns" && (
        <>
          <section className={cn(card, "p-6")}>
            <h3 className={cn(h3, "mb-4")}>{t.underwaterChart}</h3>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={ddData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF0F4" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} minTickGap={48} />
                <YAxis tickFormatter={(v) => `${Math.round(v)}%`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={52} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [pct(Number(v)), name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                {portfolios.map((p) => (
                  <Area key={p.id} dataKey={p.id} name={p.name} stroke={p.color} fill={p.color} fillOpacity={0.08} strokeWidth={1.6} isAnimationActive={false} connectNulls />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </section>
          <section className={cn(card, "overflow-hidden")}>
            <div className="px-6 pt-5 pb-3 flex flex-wrap items-center gap-3 justify-between">
              <h3 className={h3}>{t.drawdowns}</h3>
              <div className="flex flex-wrap gap-1.5">
                {portfolios.map((p, i) => (
                  <button key={p.id} onClick={() => setDdPortfolio(i)} className={cn("px-3 h-8 rounded-lg text-sm font-medium border", ddPortfolio === i ? "bg-text text-bg border-text" : "border-border text-text-2 hover:border-border-2")}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[15px]">
                <thead className="border-y border-border bg-surface-2/60">
                  <tr><Th left>{t.rank}</Th><Th left>{t.start}</Th><Th left>{t.end}</Th><Th>{t.length}</Th><Th left>{t.recoveryBy}</Th><Th>{t.recoveryTime}</Th><Th>{t.underwater}</Th><Th>{t.drawdown}</Th></tr>
                </thead>
                <tbody>
                  {((ext(portfolios[ddPortfolio] || portfolios[0]).drawdownEpisodes as any[]) || []).map((e, i) => (
                    <tr key={i} className="border-b border-border/70">
                      <td className="px-4 py-2.5 text-text-3">{i + 1}</td>
                      <td className="px-4 py-2.5 text-text">{e.start}</td>
                      <td className="px-4 py-2.5 text-text">{e.trough}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-text-2">{e.lengthMonths} {t.months}</td>
                      <td className="px-4 py-2.5 text-text">{e.end || <span className="text-amber-700">{t.ongoing}</span>}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-text-2">{isNum(e.recoveryMonths) ? `${e.recoveryMonths} ${t.months}` : "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-text-2">{isNum(e.underwaterMonths) ? `${e.underwaterMonths} ${t.months}` : "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-rose-700">{pct(-e.depth * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === "rolling" && (
        <section className={cn(card, "overflow-hidden")}>
          <h3 className={cn(h3, "px-6 pt-5 pb-3")}>{t.rollingTitle}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[15px]">
              <thead className="border-y border-border bg-surface-2/60">
                <tr>
                  <Th left>{t.period}</Th>
                  {portfolios.map((p) => <Th key={p.id}><Dot color={p.color} />{p.name}</Th>)}
                </tr>
              </thead>
              <tbody>
                {(["rolling1Y", "rolling3Y", "rolling5Y", "rolling10Y"] as const).flatMap((k) =>
                  (["average", "best", "worst"] as const).map((stat) => (
                    <tr key={k + stat} className={cn("border-b border-border/70", stat === "average" && "bg-surface-2/30")}>
                      <td className="px-4 py-2.5 text-text-2 whitespace-nowrap">{k.replace("rolling", "")} · {stat === "average" ? t.average : stat === "best" ? t.high : t.low}</td>
                      {portfolios.map((p) => {
                        const v = (p as any)[k]?.[stat];
                        const vv = isNum(v) ? v * 100 : null;
                        return <td key={p.id} className={cn("px-4 py-2.5 text-right tabular-nums", !isNum(vv) ? "text-text-4" : vv >= 0 ? "text-emerald-700" : "text-rose-700")}>{pct(vv)}</td>;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-xs text-text-3 leading-relaxed max-w-6xl">{t.method}</p>
    </div>
  );
}
