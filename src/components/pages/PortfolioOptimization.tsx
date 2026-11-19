import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Scatter, Line, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, BarChart, Bar, Cell,
} from "recharts";
import { Settings, Plus, Trash2, AlertTriangle, Target, Info } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { InfoTooltip } from "../ui/InfoTooltip";
import { TickerInput } from "../ui/TickerInput";
import { RunButton, ShareLinkButton } from "../ui/AllocationInputs";
import { consumeSharedFlag } from "../../lib/shareLink";
import { BacktestReport, ReportPortfolio } from "../backtest/BacktestReport";
import { fetchTotalReturnPrices, fetchMonthlyPrices } from "../../engine/data";
import { calculateMetrics, calculateRelativeMetrics } from "../../engine/metrics";
import {
  OptimizationGoal, OptimizerInput, FrontierPoint, Rebalance,
  alignMonthlyReturns, estimateMoments, efficientFrontier, feasibleBounds, optimize,
  portfolioReturn, portfolioVol, riskContributions, simulatePath,
} from "../../engine/portfolio-optimizer";

interface AssetRow { symbol: string; min: number; max: number }

const COLORS = ["#1B3F72", "#E0A100", "#E5484D", "#12A26E", "#7C5CD6", "#0EA5E9", "#F97316", "#64748B", "#DB2777", "#84CC16", "#14B8A6", "#A16207"];
const SERIES = { opt: "#1B3F72", wf: "#0EA5E9", ew: "#E0A100", bench: "#858899" };

const PRESETS: { id: string; fr: string; en: string; assets: string[] }[] = [
  { id: "global", fr: "Multi-actifs mondial", en: "Global multi-asset", assets: ["VTI", "VEA", "VWO", "BND", "TLT", "GLD", "VNQ"] },
  { id: "classic", fr: "Actions, obligations, or", en: "Stocks, bonds, gold", assets: ["SPY", "TLT", "IEF", "GLD"] },
  { id: "sectors", fr: "Secteurs américains", en: "US sectors", assets: ["XLK", "XLV", "XLF", "XLE", "XLP", "XLU", "XLI"] },
  { id: "factors", fr: "Facteurs actions", en: "Equity factors", assets: ["SPY", "IWM", "MTUM", "QUAL", "USMV", "VLUE"] },
];

const GOALS: OptimizationGoal[] = ["maxSharpe", "minVariance", "riskParity", "maxDiversification", "targetVolatility", "targetReturn"];
const COMPARE_GOALS: OptimizationGoal[] = ["maxSharpe", "minVariance", "riskParity", "maxDiversification", "inverseVolatility", "equalWeight"];

const L = {
  fr: {
    badge: "Backtesting avancé",
    title: "Optimisation de portefeuille",
    description: "Trouvez la meilleure répartition entre vos actifs selon un objectif précis : meilleur ratio de Sharpe, volatilité minimale, parité des risques ou rendement cible. La frontière efficiente, les contributions au risque et un backtest glissant hors échantillon montrent ce que l'optimisation aurait vraiment donné.",
    params: "Paramètres de l'optimisation",
    assets: "Actifs à optimiser",
    assetsTt: "Entre 2 et 12 actifs. Les poids min. et max. limitent la part de chaque actif dans le portefeuille optimisé.",
    add: "Ajouter un actif",
    presets: "Univers prêts à l'emploi",
    min: "Min. %",
    max: "Max. %",
    goal: "Objectif",
    goalTt: "Le critère que l'optimiseur cherche à maximiser ou minimiser.",
    goals: {
      maxSharpe: "Maximiser le ratio de Sharpe",
      minVariance: "Minimiser la volatilité",
      riskParity: "Parité des risques",
      maxDiversification: "Maximiser la diversification",
      targetVolatility: "Rendement max. pour une volatilité cible",
      targetReturn: "Volatilité min. pour un rendement cible",
      inverseVolatility: "Inverse de la volatilité",
      equalWeight: "Poids égaux",
    } as Record<OptimizationGoal, string>,
    goalHelp: {
      maxSharpe: "Le portefeuille qui offre le plus de rendement par unité de risque (portefeuille tangent).",
      minVariance: "Le portefeuille le moins volatil possible, sans tenir compte des rendements attendus.",
      riskParity: "Chaque actif contribue autant au risque total. Ne dépend pas des rendements passés, donc plus robuste.",
      maxDiversification: "Maximise le rapport entre la volatilité moyenne des actifs et celle du portefeuille.",
      targetVolatility: "Le meilleur rendement attendu sans dépasser la volatilité que vous fixez.",
      targetReturn: "Le risque le plus faible pour atteindre le rendement attendu que vous fixez.",
      inverseVolatility: "Chaque actif pondéré par l'inverse de sa volatilité.",
      equalWeight: "Même poids pour chaque actif.",
    } as Record<OptimizationGoal, string>,
    targetVol: "Volatilité cible (%)",
    targetRet: "Rendement cible (%)",
    startYear: "Année de début",
    endYear: "Année de fin",
    capital: "Capital initial",
    rebalance: "Rééquilibrage",
    rebal: { monthly: "Mensuel", quarterly: "Trimestriel", annually: "Annuel" } as Record<Rebalance, string>,
    benchmark: "Indice de référence",
    walkForward: "Optimisation glissante (hors échantillon)",
    walkForwardTt: "Chaque janvier, l'optimiseur ne voit que les mois précédents (fenêtre d'estimation) et fixe les poids de l'année suivante. C'est ce qu'un investisseur aurait réellement pu faire, sans connaître l'avenir.",
    lookback: "Fenêtre d'estimation (mois)",
    run: "Optimiser",
    running: "Calcul en cours...",
    errMin: "Ajoutez au moins deux actifs différents.",
    errData: "Pas assez de données communes pour ces actifs sur la période (au moins 24 mois).",
    noData: "Données introuvables pour",
    boundsFixed: "Les bornes min./max. ne permettaient pas d'investir 100 % : elles ont été ajustées.",
    shortWindow: "Période analysée",
    months: "mois",
    optimal: "Portefeuille optimal",
    expRet: "Rendement attendu",
    expVol: "Volatilité attendue",
    sharpe: "Ratio de Sharpe",
    divRatio: "Ratio de diversification",
    weights: "Poids optimaux",
    asset: "Actif",
    weight: "Poids",
    riskContrib: "Contribution au risque",
    assetRet: "Rendement annualisé",
    assetVol: "Volatilité",
    lastWf: "Poids glissants actuels",
    frontier: "Frontière efficiente",
    frontierHelp: "Chaque point de la courbe est le portefeuille le moins risqué pour un niveau de rendement attendu. Les points isolés sont les actifs seuls.",
    frontierSeries: "Frontière efficiente",
    assetsSeries: "Actifs",
    optSeries: "Optimal",
    ewSeries: "Poids égaux",
    compare: "Comparaison des méthodes d'optimisation",
    compareHelp: "Les mêmes actifs et la même période, optimisés selon six objectifs différents.",
    method: "Méthode",
    backtest: "Backtest des portefeuilles",
    backtestHelp: "Le portefeuille optimal est calculé avec toute la période : il connaît l'avenir et surestime ce qu'on aurait obtenu. Le portefeuille glissant ne connaît que le passé à chaque date, c'est le test honnête.",
    optName: "Optimal (période complète)",
    wfName: "Optimal glissant",
    ewName: "Poids égaux",
    wfWeights: "Évolution des poids du portefeuille glissant",
    wfLate: "Le portefeuille glissant commence en",
    wfLate2: "faute d'historique suffisant pour la fenêtre d'estimation.",
    corr: "Corrélations mensuelles",
    methodology: "Méthode : rendements mensuels avec dividendes réinvestis. Les rendements attendus sont les moyennes historiques annualisées (× 12) et la matrice de covariance est estimée sur la même période (× 12). L'optimisation est faite sans vente à découvert ni levier, avec les bornes min./max. de chaque actif. Le taux sans risque est le rendement moyen des bons du Trésor américain à 13 semaines sur la période. Les performances passées ne préjugent pas des performances futures, et une optimisation sur données historiques est sensible aux erreurs d'estimation.",
    empty: "Choisissez vos actifs et un objectif, puis lancez l'optimisation.",
  },
  en: {
    badge: "Advanced backtesting",
    title: "Portfolio optimization",
    description: "Find the best mix of your assets for a precise goal: highest Sharpe ratio, lowest volatility, risk parity or a target return. The efficient frontier, risk contributions and an out-of-sample walk-forward backtest show what the optimization would really have delivered.",
    params: "Optimization settings",
    assets: "Assets to optimize",
    assetsTt: "Between 2 and 12 assets. Min. and max. weights limit the share of each asset in the optimized portfolio.",
    add: "Add asset",
    presets: "Ready-made universes",
    min: "Min. %",
    max: "Max. %",
    goal: "Goal",
    goalTt: "The criterion the optimizer maximizes or minimizes.",
    goals: {
      maxSharpe: "Maximize Sharpe ratio",
      minVariance: "Minimize volatility",
      riskParity: "Risk parity",
      maxDiversification: "Maximize diversification",
      targetVolatility: "Max. return for a target volatility",
      targetReturn: "Min. volatility for a target return",
      inverseVolatility: "Inverse volatility",
      equalWeight: "Equal weight",
    } as Record<OptimizationGoal, string>,
    goalHelp: {
      maxSharpe: "The portfolio with the most return per unit of risk (tangency portfolio).",
      minVariance: "The least volatile portfolio possible, ignoring expected returns.",
      riskParity: "Every asset contributes the same share of total risk. Does not rely on past returns, so it is more robust.",
      maxDiversification: "Maximizes the ratio of the assets' average volatility to the portfolio volatility.",
      targetVolatility: "The best expected return without exceeding the volatility you set.",
      targetReturn: "The lowest risk that reaches the expected return you set.",
      inverseVolatility: "Each asset weighted by the inverse of its volatility.",
      equalWeight: "Same weight for every asset.",
    } as Record<OptimizationGoal, string>,
    targetVol: "Target volatility (%)",
    targetRet: "Target return (%)",
    startYear: "Start year",
    endYear: "End year",
    capital: "Initial amount",
    rebalance: "Rebalancing",
    rebal: { monthly: "Monthly", quarterly: "Quarterly", annually: "Annually" } as Record<Rebalance, string>,
    benchmark: "Benchmark",
    walkForward: "Walk-forward optimization (out of sample)",
    walkForwardTt: "Every January the optimizer only sees the previous months (estimation window) and sets the weights for the following year. This is what an investor could really have done, without knowing the future.",
    lookback: "Estimation window (months)",
    run: "Optimize",
    running: "Computing...",
    errMin: "Add at least two different assets.",
    errData: "Not enough common data for these assets over the period (at least 24 months).",
    noData: "No data found for",
    boundsFixed: "The min./max. bounds did not allow a fully invested portfolio: they were adjusted.",
    shortWindow: "Period analyzed",
    months: "months",
    optimal: "Optimal portfolio",
    expRet: "Expected return",
    expVol: "Expected volatility",
    sharpe: "Sharpe ratio",
    divRatio: "Diversification ratio",
    weights: "Optimal weights",
    asset: "Asset",
    weight: "Weight",
    riskContrib: "Risk contribution",
    assetRet: "Annualized return",
    assetVol: "Volatility",
    lastWf: "Current walk-forward weights",
    frontier: "Efficient frontier",
    frontierHelp: "Each point of the curve is the least risky portfolio for a level of expected return. Single dots are the assets on their own.",
    frontierSeries: "Efficient frontier",
    assetsSeries: "Assets",
    optSeries: "Optimal",
    ewSeries: "Equal weight",
    compare: "Optimization methods compared",
    compareHelp: "The same assets and period, optimized for six different goals.",
    method: "Method",
    backtest: "Portfolio backtest",
    backtestHelp: "The optimal portfolio is computed with the whole period: it knows the future and overstates what you would have earned. The walk-forward portfolio only knows the past at each date, which makes it the honest test.",
    optName: "Optimal (full period)",
    wfName: "Walk-forward optimal",
    ewName: "Equal weight",
    wfWeights: "Walk-forward portfolio weights over time",
    wfLate: "The walk-forward portfolio starts in",
    wfLate2: "because the estimation window needs more history.",
    corr: "Monthly correlations",
    methodology: "Method: monthly returns with dividends reinvested. Expected returns are annualized historical means (× 12) and the covariance matrix is estimated over the same period (× 12). The optimization allows no short selling and no leverage, within each asset's min./max. bounds. The risk-free rate is the average 13-week US T-bill yield over the period. Past performance does not guarantee future results, and optimizing on historical data is sensitive to estimation error.",
    empty: "Pick your assets and a goal, then run the optimization.",
  },
};

const pct = (v: number, d = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : "-");

function Label({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-xs font-semibold text-text">{children}</label>
      {tip && <InfoTooltip content={<>{tip}</>} />}
    </div>
  );
}

function Card({ title, help, children, className }: { title: React.ReactNode; help?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("bg-surface border border-border rounded-[2rem] p-6 md:p-8 shadow-sm text-left", className)}>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {help && <p className="text-sm text-text-3 mt-1 mb-5 max-w-3xl">{help}</p>}
      {!help && <div className="mb-5" />}
      {children}
    </section>
  );
}

const inputCls = "w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-semibold outline-none focus:border-pv-blue transition-colors";

interface Result {
  symbols: string[];
  months: string[];
  mu: number[];
  vols: number[];
  cov: number[][];
  corr: number[][];
  rf: number;
  frontier: FrontierPoint[];
  weights: number[];
  ew: number[];
  compare: { goal: OptimizationGoal; w: number[]; ret: number; vol: number; sharpe: number }[];
  report: ReportPortfolio[];
  wfHistory: { d: string; [k: string]: number | string }[];
  wfStart: string | null;
  lastWf: number[] | null;
  boundsAdjusted: boolean;
}

export function PortfolioOptimization({ baseCcy = "USD" }: { baseCcy?: string }) {
  const { language } = useTranslation();
  const t = L[language === "fr" ? "fr" : "en"];
  const thisYear = new Date().getFullYear();

  const [assets, setAssets] = useLocalStorage<AssetRow[]>("po_assets", PRESETS[0].assets.map((s) => ({ symbol: s, min: 0, max: 100 })));
  const [goal, setGoal] = useLocalStorage<OptimizationGoal>("po_goal", "maxSharpe");
  const [targetVol, setTargetVol] = useLocalStorage("po_targetVol", 10);
  const [targetRet, setTargetRet] = useLocalStorage("po_targetRet", 7);
  const [startYear, setStartYear] = useLocalStorage("po_start", 2008);
  const [endYear, setEndYear] = useLocalStorage("po_end", thisYear);
  const [capital, setCapital] = useLocalStorage("po_capital", 10000);
  const [rebalance, setRebalance] = useLocalStorage<Rebalance>("po_rebal", "annually");
  const [benchmark, setBenchmark] = useLocalStorage("po_bench", "SPY");
  const [walkForward, setWalkForward] = useLocalStorage("po_wf", true);
  const [lookback, setLookback] = useLocalStorage("po_lookback", 60);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);

  const setRow = (i: number, patch: Partial<AssetRow>) => setAssets(assets.map((a, k) => (k === i ? { ...a, ...patch } : a)));

  const run = async () => {
    setError(null);
    const rows = assets
      .map((a) => ({ ...a, symbol: a.symbol.trim().toUpperCase() }))
      .filter((a, i, arr) => a.symbol && arr.findIndex((b) => b.symbol === a.symbol) === i);
    if (rows.length < 2) {
      setError(t.errMin);
      return;
    }
    setRunning(true);
    try {
      const sy = Math.min(startYear, endYear);
      const ey = Math.max(startYear, endYear);
      const lb = Math.max(12, Math.min(240, Math.round(lookback)));
      const fetchFrom = `${walkForward ? sy - Math.ceil(lb / 12) - 1 : sy - 1}-12-01`;
      const to = `${ey}-12-31`;
      const symbols = rows.map((r) => r.symbol);
      const bench = benchmark.trim().toUpperCase();

      const loaded = await Promise.all(
        [...symbols, ...(bench ? [bench] : [])].map(async (sym) => {
          try {
            const p = await fetchTotalReturnPrices(sym, fetchFrom, to);
            return { symbol: sym, prices: p.map((x) => ({ month: x.date.substring(0, 7), close: x.close })) };
          } catch {
            return { symbol: sym, prices: [] as { month: string; close: number }[] };
          }
        }),
      );
      const missing = loaded.filter((s) => s.prices.length < 2).map((s) => s.symbol);
      if (missing.some((m) => symbols.includes(m))) throw new Error(`${t.noData} ${missing.join(", ")}`);

      const assetSeries = loaded.filter((s) => symbols.includes(s.symbol));
      const all = alignMonthlyReturns(assetSeries);
      // analysis window: return months inside [start year, end year]
      const inWin = all.months.map((m, i) => (m >= `${sy}-01` && m <= `${ey}-12` ? i : -1)).filter((i) => i >= 0);
      if (inWin.length < 24) throw new Error(t.errData);
      const i0 = inWin[0];
      const i1 = inWin[inWin.length - 1];
      const months = all.months.slice(i0, i1 + 1);
      const rets = all.returns.map((r) => r.slice(i0, i1 + 1));

      // risk-free: average T-bill yield over the window
      let rfByMonth: Map<string, number> | null = null;
      let rf = 0.02;
      try {
        const irx = await fetchMonthlyPrices("^IRX", fetchFrom, to, { noFallback: true });
        if (irx.length) {
          rfByMonth = new Map(irx.filter((p) => Number.isFinite(p.close)).map((p) => [p.date.substring(0, 7), p.close / 100 / 12]));
          const vals = months.map((m) => rfByMonth!.get(m)).filter((v): v is number => typeof v === "number");
          if (vals.length) rf = (vals.reduce((a, b) => a + b, 0) / vals.length) * 12;
        }
      } catch {
        rfByMonth = null;
      }

      const bounds = feasibleBounds(rows.map((r) => (r.min || 0) / 100), rows.map((r) => (r.max ?? 100) / 100));
      const { mu, cov } = estimateMoments(rets);
      const input: OptimizerInput = { mu, cov, lo: bounds.lo, hi: bounds.hi, rf };
      const frontier = efficientFrontier(input, 60);
      const opts = { targetVol: targetVol / 100, targetRet: targetRet / 100, frontier };
      const weights = optimize(goal, input, opts);
      const ew = symbols.map(() => 1 / symbols.length);
      const vols = cov.map((r, i) => Math.sqrt(r[i]));
      const corr = cov.map((r, i) => r.map((c, j) => (vols[i] && vols[j] ? c / (vols[i] * vols[j]) : 0)));

      const compare = COMPARE_GOALS.map((g) => {
        const w = g === goal ? weights : optimize(g, input, opts);
        const ret = portfolioReturn(w, mu);
        const vol = portfolioVol(w, cov);
        return { goal: g, w, ret, vol, sharpe: vol > 0 ? (ret - rf) / vol : 0 };
      });

      // walk-forward: re-optimize every January on the trailing window only
      let wfPath: { values: number[]; startIndex: number } | null = null;
      const wfHistory: Result["wfHistory"] = [];
      let lastWf: number[] | null = null;
      if (walkForward) {
        const cache = new Map<number, number[]>();
        const weightsAt = (iWin: number) => {
          const iAll = iWin + i0;
          // most recent January at or before this month
          let j = iAll;
          while (j > 0 && all.months[j].slice(5, 7) !== "01") j--;
          if (all.months[j].slice(5, 7) !== "01" || j < lb) return null;
          if (!cache.has(j)) {
            const window = all.returns.map((r) => r.slice(j - lb, j));
            const m = estimateMoments(window);
            const inp: OptimizerInput = { mu: m.mu, cov: m.cov, lo: bounds.lo, hi: bounds.hi, rf };
            cache.set(j, optimize(goal, inp, { targetVol: targetVol / 100, targetRet: targetRet / 100 }));
          }
          return cache.get(j)!;
        };
        wfPath = simulatePath(rets, months, weightsAt, capital, rebalance);
        if (wfPath.startIndex >= 0) {
          for (const [j, w] of [...cache.entries()].sort((a, b) => a[0] - b[0])) {
            const row: Result["wfHistory"][number] = { d: all.months[j].slice(0, 4) };
            symbols.forEach((s, k) => (row[s] = Math.round(w[k] * 1000) / 10));
            wfHistory.push(row);
            lastWf = w;
          }
        }
      }

      const toReport = (id: string, name: string, color: string, values: number[], startIndex: number): ReportPortfolio => {
        const dates = [all.priceMonths[i0 + startIndex], ...months.slice(startIndex)].map((m) => `${m}-01`);
        const curve = values.map((v, k) => ({ date: dates[k], value: v }));
        const m = calculateMetrics(curve, capital, rf, rfByMonth);
        return {
          id, name, color,
          initialAmount: capital,
          endBalance: m.endBalance,
          cagr: m.cagr * 100,
          stdev: m.volatility * 100,
          maxDrawdown: -m.maxDrawdown * 100,
          sharpe: m.sharpeRatio,
          sortino: m.sortinoRatio,
          balances: values,
          dates,
          drawdowns: m.drawdowns.map((d) => -d * 100),
          monthlyReturns: m.monthlyReturns || [],
          rolling1Y: m.rolling1Y, rolling3Y: m.rolling3Y, rolling5Y: m.rolling5Y, rolling10Y: m.rolling10Y,
          totalContributions: capital,
          ext: m as any,
        };
      };

      const fixed = (w: number[]) => simulatePath(rets, months, () => w, capital, rebalance);
      const report: ReportPortfolio[] = [];
      const optP = fixed(weights);
      report.push(toReport("opt", t.optName, SERIES.opt, optP.values, optP.startIndex));
      if (wfPath && wfPath.startIndex >= 0) report.push(toReport("wf", t.wfName, SERIES.wf, wfPath.values, wfPath.startIndex));
      const ewP = fixed(ew);
      report.push(toReport("ew", t.ewName, SERIES.ew, ewP.values, ewP.startIndex));

      const benchSeries = loaded.find((s) => s.symbol === bench && s.prices.length >= 2);
      if (bench && benchSeries) {
        const b = alignMonthlyReturns([benchSeries]);
        const bm = new Map(b.months.map((m, k) => [m, b.returns[0][k]]));
        const bRet = months.map((m) => bm.get(m));
        const firstOk = bRet.findIndex((x) => typeof x === "number");
        if (firstOk >= 0) {
          const bp = simulatePath([bRet.map((x) => x ?? 0)], months, (i) => (i >= firstOk ? [1] : null), capital, "annually");
          const benchP = toReport("bench", `${bench}`, SERIES.bench, bp.values, bp.startIndex);
          report.push(benchP);
          const bByMonth = new Map(benchP.monthlyReturns.map((x) => [x.date.substring(0, 7), x.value / 100]));
          for (const p of report) {
            if (p.id === "bench") continue;
            const al = p.monthlyReturns.filter((x) => bByMonth.has(x.date.substring(0, 7)));
            const pr = al.map((x) => x.value / 100);
            const br = al.map((x) => bByMonth.get(x.date.substring(0, 7)) as number);
            const rfs = al.map((x) => rfByMonth?.get(x.date.substring(0, 7)) ?? rf / 12);
            const geo = (xs: number[]) => (xs.length ? Math.pow(xs.reduce((a, c) => a * (1 + c), 1), 12 / xs.length) - 1 : 0);
            const rel = calculateRelativeMetrics(pr, br, geo(pr), geo(br), rf, rfs);
            if (rel) p.ext = { ...(p.ext || {}), ...rel };
          }
        }
      }

      setRes({
        symbols, months, mu, vols, cov, corr, rf, frontier, weights, ew, compare, report, wfHistory,
        wfStart: wfPath && wfPath.startIndex > 0 ? months[wfPath.startIndex] : null,
        lastWf, boundsAdjusted: bounds.adjusted,
      });
      setTimeout(() => document.getElementById("po-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (e: any) {
      setError(e?.message || String(e));
      setRes(null);
    } finally {
      setRunning(false);
    }
  };

  // Opened from a shared link: show the results straight away
  React.useEffect(() => {
    if (consumeSharedFlag("po_")) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24 font-sans">
      <div className="mt-4">
        <PageHeader title={t.title} badge={t.badge} icon={Target} description={t.description} />
      </div>

      {/* Settings */}
      <section className="bg-surface border border-border p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Settings size={14} className="text-pv-blue" />
            {t.params}
          </h2>
          <div className="flex items-center gap-1.5"><RunButton onClick={run} running={running} label={t.run} runningLabel={t.running} /><ShareLinkButton prefix="po_" /></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8">
          {/* Assets */}
          <div>
            <Label tip={t.assetsTt}>{t.assets}</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs text-text-3 self-center mr-1">{t.presets} :</span>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAssets(p.assets.map((s) => ({ symbol: s, min: 0, max: 100 })))}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-pv-blue hover:text-pv-blue transition-colors"
                >
                  {language === "fr" ? p.fr : p.en}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_76px_76px_36px] gap-2 items-center text-xs font-semibold text-text-3 px-1 mb-1">
              <span>{t.asset}</span>
              <span className="text-center">{t.min}</span>
              <span className="text-center">{t.max}</span>
              <span />
            </div>
            <div className="space-y-2">
              {assets.map((a, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_76px_76px_36px] gap-2 items-center">
                  <TickerInput value={a.symbol} onChange={(v) => setRow(i, { symbol: v })} className={inputCls} />
                  <input type="number" min={0} max={100} value={a.min} onChange={(e) => setRow(i, { min: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className={cn(inputCls, "px-2 text-center num")} />
                  <input type="number" min={0} max={100} value={a.max} onChange={(e) => setRow(i, { max: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className={cn(inputCls, "px-2 text-center num")} />
                  <button type="button" aria-label="remove" onClick={() => setAssets(assets.filter((_, k) => k !== i))} className="w-9 h-9 flex items-center justify-center rounded-full text-text-4 hover:text-red hover:bg-red-bg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            {assets.length < 12 && (
              <button type="button" onClick={() => setAssets([...assets, { symbol: "", min: 0, max: 100 }])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-pv-blue hover:underline">
                <Plus size={14} /> {t.add}
              </button>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 content-start">
            <div className="sm:col-span-2">
              <Label tip={t.goalTt}>{t.goal}</Label>
              <select value={goal} onChange={(e) => setGoal(e.target.value as OptimizationGoal)} className={inputCls}>
                {GOALS.map((g) => <option key={g} value={g}>{t.goals[g]}</option>)}
              </select>
              <p className="text-xs text-text-3 mt-2 flex gap-1.5"><Info size={13} className="shrink-0 mt-0.5" />{t.goalHelp[goal]}</p>
            </div>
            {goal === "targetVolatility" && (
              <div className="sm:col-span-2">
                <Label>{t.targetVol}</Label>
                <input type="number" step={0.5} value={targetVol} onChange={(e) => setTargetVol(Number(e.target.value) || 0)} className={cn(inputCls, "num")} />
              </div>
            )}
            {goal === "targetReturn" && (
              <div className="sm:col-span-2">
                <Label>{t.targetRet}</Label>
                <input type="number" step={0.5} value={targetRet} onChange={(e) => setTargetRet(Number(e.target.value) || 0)} className={cn(inputCls, "num")} />
              </div>
            )}
            <div>
              <Label>{t.startYear}</Label>
              <input type="number" min={1985} max={thisYear} value={startYear} onChange={(e) => setStartYear(Number(e.target.value) || 2008)} className={cn(inputCls, "num")} />
            </div>
            <div>
              <Label>{t.endYear}</Label>
              <input type="number" min={1985} max={thisYear} value={endYear} onChange={(e) => setEndYear(Number(e.target.value) || thisYear)} className={cn(inputCls, "num")} />
            </div>
            <div>
              <Label>{t.capital}</Label>
              <input type="number" min={100} step={1000} value={capital} onChange={(e) => setCapital(Math.max(1, Number(e.target.value) || 10000))} className={cn(inputCls, "num")} />
            </div>
            <div>
              <Label>{t.rebalance}</Label>
              <select value={rebalance} onChange={(e) => setRebalance(e.target.value as Rebalance)} className={inputCls}>
                {(["monthly", "quarterly", "annually"] as Rebalance[]).map((r) => <option key={r} value={r}>{t.rebal[r]}</option>)}
              </select>
            </div>
            <div>
              <Label>{t.benchmark}</Label>
              <TickerInput value={benchmark} onChange={setBenchmark} className={inputCls} />
            </div>
            <div>
              <Label>{t.lookback}</Label>
              <select value={lookback} onChange={(e) => setLookback(Number(e.target.value))} className={inputCls} disabled={!walkForward}>
                {[24, 36, 60, 120].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <label className="sm:col-span-2 flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={walkForward} onChange={(e) => setWalkForward(e.target.checked)} className="mt-1 w-4 h-4 accent-[#1B3F72]" />
              <span className="text-sm">
                <span className="font-semibold text-text">{t.walkForward}</span>
                <span className="block text-xs text-text-3 mt-0.5">{t.walkForwardTt}</span>
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red bg-red-bg rounded-2xl px-4 py-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
      </section>

      {!res && !running && (
        <div className="border border-dashed border-border rounded-[2rem] py-16 text-center text-sm text-text-3">{t.empty}</div>
      )}

      {res && <Results res={res} t={t} goal={goal} language={language} currency={baseCcy} />}
    </div>
  );
}

function Results({ res, t, goal, language, currency }: { res: Result; t: typeof L["fr"]; goal: OptimizationGoal; language: string; currency: string }) {
  const ret = portfolioReturn(res.weights, res.mu);
  const vol = portfolioVol(res.weights, res.cov);
  const sharpe = vol > 0 ? (ret - res.rf) / vol : 0;
  const divRatio = vol > 0 ? res.weights.reduce((s, w, i) => s + w * res.vols[i], 0) / vol : 0;
  const rc = riskContributions(res.weights, res.cov);
  const ewRet = portfolioReturn(res.ew, res.mu);
  const ewVol = portfolioVol(res.ew, res.cov);

  const frontierData = res.frontier.map((p) => ({ x: p.vol * 100, y: p.ret * 100 }));
  const assetPts = res.symbols.map((s, i) => ({ x: res.vols[i] * 100, y: res.mu[i] * 100, name: s }));

  const weightRows = useMemo(
    () => res.symbols.map((s, i) => ({ s, w: res.weights[i], rc: rc[i], mu: res.mu[i], vol: res.vols[i], wf: res.lastWf?.[i], color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.w - a.w),
    [res, rc],
  );

  const tooltipStyle = { backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "12px", fontSize: "12px" };
  const period = `${res.months[0]} / ${res.months[res.months.length - 1]}`;

  return (
    <div id="po-results" className="space-y-8 scroll-mt-24">
      {res.boundsAdjusted && (
        <div className="flex items-start gap-2 text-sm text-text-2 bg-surface-3 rounded-2xl px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#E0A100]" /> {t.boundsFixed}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: t.expRet, v: pct(ret, 2) },
          { k: t.expVol, v: pct(vol, 2) },
          { k: t.sharpe, v: sharpe.toFixed(2) },
          { k: t.divRatio, v: divRatio.toFixed(2) },
        ].map((c) => (
          <div key={c.k} className="bg-surface border border-border rounded-[1.5rem] p-5 shadow-sm text-left">
            <div className="text-xs font-semibold text-text-3">{c.k}</div>
            <div className="text-2xl font-semibold num mt-1 text-text">{c.v}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-3 -mt-4 text-left">
        {t.goals[goal]} · {t.shortWindow} : {period} ({res.months.length} {t.months}) · rf {pct(res.rf, 2)}
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Weights */}
        <Card title={t.weights}>
          <div className="h-[220px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightRows} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11, fill: "var(--color-text-4)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="s" width={56} tick={{ fontSize: 12, fill: "var(--color-text)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => pct(Number(v))} cursor={{ fill: "var(--color-surface-3)" }} />
                <Bar dataKey="w" name={t.weight} radius={[0, 6, 6, 0]} isAnimationActive={false}>
                  {weightRows.map((r) => <Cell key={r.s} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-3 border-b border-border">
                  <th className="text-left py-2 font-semibold">{t.asset}</th>
                  <th className="text-right py-2 font-semibold">{t.weight}</th>
                  <th className="text-right py-2 font-semibold">{t.riskContrib}</th>
                  <th className="text-right py-2 font-semibold">{t.assetRet}</th>
                  <th className="text-right py-2 font-semibold">{t.assetVol}</th>
                  {res.lastWf && <th className="text-right py-2 font-semibold">{t.lastWf}</th>}
                </tr>
              </thead>
              <tbody>
                {weightRows.map((r) => (
                  <tr key={r.s} className="border-b border-border/60 last:border-0">
                    <td className="py-2 font-semibold flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />{r.s}</td>
                    <td className="py-2 text-right num font-semibold">{pct(r.w)}</td>
                    <td className="py-2 text-right num">{pct(r.rc)}</td>
                    <td className="py-2 text-right num">{pct(r.mu)}</td>
                    <td className="py-2 text-right num">{pct(r.vol)}</td>
                    {res.lastWf && <td className="py-2 text-right num">{pct(r.wf ?? 0)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Frontier */}
        <Card title={t.frontier} help={t.frontierHelp}>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" dataKey="x" name={t.assetVol} unit="%" domain={[0, "auto"]} tick={{ fontSize: 11, fill: "var(--color-text-4)" }} tickFormatter={(v) => Number(v).toFixed(0)}
                  label={{ value: t.assetVol, position: "insideBottom", offset: -10, fontSize: 11, fill: "var(--color-text-3)" }} />
                <YAxis type="number" dataKey="y" name={t.assetRet} unit="%" tick={{ fontSize: 11, fill: "var(--color-text-4)" }} tickFormatter={(v) => Number(v).toFixed(0)} />
                <ZAxis range={[70, 70]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${Number(v).toFixed(2)}%`}
                  labelFormatter={() => ""} />
                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                <Line data={frontierData} dataKey="y" name={t.frontierSeries} stroke={SERIES.opt} strokeWidth={2.5} dot={false} type="linear" isAnimationActive={false} />
                <Scatter data={assetPts} name={t.assetsSeries} fill="#858899" isAnimationActive={false}
                  shape={(p: any) => (
                    <g>
                      <circle cx={p.cx} cy={p.cy} r={5} fill="#858899" />
                      <text x={p.cx + 8} y={p.cy + 4} fontSize={11} fontWeight={600} fill="var(--color-text-2)">{p.payload.name}</text>
                    </g>
                  )} />
                <Scatter data={[{ x: ewVol * 100, y: ewRet * 100 }]} name={t.ewSeries} fill={SERIES.ew} shape="diamond" isAnimationActive={false} />
                <Scatter data={[{ x: vol * 100, y: ret * 100 }]} name={t.optSeries} fill="#E5484D" shape="star" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Compare methods */}
      <Card title={t.compare} help={t.compareHelp}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-xs text-text-3 border-b border-border">
                <th className="text-left py-2 font-semibold">{t.method}</th>
                <th className="text-right py-2 font-semibold">{t.expRet}</th>
                <th className="text-right py-2 font-semibold">{t.expVol}</th>
                <th className="text-right py-2 font-semibold">{t.sharpe}</th>
                {res.symbols.map((s) => <th key={s} className="text-right py-2 font-semibold">{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {res.compare.map((c) => (
                <tr key={c.goal} className={cn("border-b border-border/60 last:border-0", c.goal === goal && "bg-pv-blue-bg/60")}>
                  <td className="py-2 font-semibold">{t.goals[c.goal]}</td>
                  <td className="py-2 text-right num">{pct(c.ret, 2)}</td>
                  <td className="py-2 text-right num">{pct(c.vol, 2)}</td>
                  <td className="py-2 text-right num font-semibold">{c.sharpe.toFixed(2)}</td>
                  {c.w.map((w, i) => <td key={i} className={cn("py-2 text-right num", w < 0.0005 && "text-text-4")}>{pct(w)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Backtest */}
      <Card title={t.backtest} help={t.backtestHelp}>
        {res.wfStart && (
          <p className="text-xs text-text-3 mb-4 flex items-center gap-1.5"><Info size={13} /> {t.wfLate} {res.wfStart} {t.wfLate2}</p>
        )}
        <BacktestReport portfolios={res.report} benchmarkId={res.report.some((p) => p.id === "bench") ? "bench" : undefined} currency={currency} language={language} />
      </Card>

      {res.wfHistory.length > 0 && (
        <Card title={t.wfWeights}>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={res.wfHistory} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--color-text-4)" }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "var(--color-text-4)" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                {res.symbols.map((s, i) => (
                  <Area key={s} type="stepAfter" dataKey={s} stackId="1" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} isAnimationActive={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Correlations */}
      <Card title={t.corr}>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th />
                {res.symbols.map((s) => <th key={s} className="px-3 py-2 text-xs font-semibold text-text-3">{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {res.symbols.map((a, i) => (
                <tr key={a}>
                  <td className="pr-3 py-1 text-xs font-semibold text-text-3 text-right">{a}</td>
                  {res.corr[i].map((c, j) => {
                    const alpha = Math.min(1, Math.abs(c));
                    const bg = c >= 0 ? `rgba(27,63,114,${alpha * 0.55})` : `rgba(229,72,77,${alpha * 0.55})`;
                    return (
                      <td key={j} className="px-1 py-1">
                        <div className={cn("w-16 h-10 rounded-lg flex items-center justify-center num text-xs font-semibold", alpha > 0.6 ? "text-white" : "text-text")} style={{ background: bg }}>
                          {c.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-text-3 leading-relaxed text-left max-w-5xl">{t.methodology}</p>
    </div>
  );
}
