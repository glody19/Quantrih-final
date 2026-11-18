import "./api"; // points the shared engine at quantrih.com before any run
import { runBacktest } from "@shared/engine";
import type { BacktestOptions, BacktestResult, Portfolio } from "@shared/engine/types";
import type { SavedPortfolioSummary } from "@shared/lib/savedSummary";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export interface Holding {
  symbol: string;
  label?: string;
  /** Percent, 0 to 100. */
  weight: number;
}

export interface DraftPortfolio {
  name: string;
  holdings: Holding[];
}

export type Rebalance = BacktestOptions["rebalanceFrequency"];

export interface BacktestSettings {
  startYear: number;
  endYear: number;
  initial: number;
  monthly: number;
  rebalance: Rebalance;
  currency: "EUR" | "USD";
  /** Ticker compared with the portfolio, or "" for none. */
  benchmark: string;
}

export const REBALANCE_LABELS: Record<Rebalance, string> = {
  none: "Jamais",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  annually: "Annuel",
};

export const BENCHMARKS = [
  { symbol: "", label: "Aucun" },
  { symbol: "URTH", label: "MSCI World" },
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "AOR", label: "60/40 mondial" },
];

export interface SeriesView {
  name: string;
  isBenchmark: boolean;
  dates: string[];
  values: number[];
  drawdowns: number[]; // fractions, <= 0
  years: number[];
  annual: number[]; // fractions
  endBalance: number;
  cagr: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number; // fraction, positive
  bestYear: number;
  worstYear: number;
  contributions: number;
  alloc: Record<string, number>; // percent
}

export interface RunOutput {
  settings: BacktestSettings;
  series: SeriesView[];
  warnings: string[];
  ranAt: number;
}

function annualFromMonthly(monthly: { date: string; value: number }[] | undefined) {
  const by = new Map<number, number>();
  (monthly || []).forEach((m) => {
    const y = parseInt(m.date.slice(0, 4), 10);
    if (!Number.isFinite(y) || !Number.isFinite(m.value)) return;
    by.set(y, (by.get(y) ?? 1) * (1 + m.value / 100)); // the engine gives monthly returns in percent
  });
  const years = [...by.keys()].sort((a, b) => a - b);
  return { years, annual: years.map((y) => (by.get(y) as number) - 1) };
}

function toView(r: BacktestResult, name: string, isBenchmark: boolean, alloc: Record<string, number>): SeriesView {
  const m = r.metrics;
  const { years, annual } = annualFromMonthly(m.monthlyReturns);
  return {
    name,
    isBenchmark,
    dates: r.equityCurve.map((e) => e.date.slice(0, 10)),
    values: r.equityCurve.map((e) => e.value),
    drawdowns: (m.drawdowns || []).map((d) => -Math.abs(d)),
    years,
    annual,
    endBalance: m.endBalance,
    cagr: m.cagr,
    volatility: m.volatility,
    sharpe: m.sharpeRatio,
    sortino: m.sortinoRatio,
    maxDrawdown: Math.abs(m.maxDrawdown),
    bestYear: m.bestYear,
    worstYear: m.worstYear,
    contributions: m.totalContributions ?? 0,
    alloc,
  };
}

/** The engine's notes, in French; technical notes the user cannot act on are dropped. */
function frenchWarning(w: string): string | null {
  const rf = w.match(/^Risk-free rate: .*fixed ([\d.]+)%/);
  if (rf) return `Taux sans risque indisponible : ${rf[1].replace(".", ",")} % par an utilisé pour les ratios de Sharpe et Sortino.`;
  if (w.startsWith("Inflation:")) return "Inflation indisponible : 3 % par an utilisés pour l'ajustement.";
  if (w.startsWith("No data for")) return "Certaines données manquent après le début de la période.";
  if (/^[\x00-\x7F]*$/.test(w) && !/[éèàç]/.test(w)) return null;
  return w;
}

/** Runs the website's engine on the device. Prices come from quantrih.com. */
export async function runPortfolios(portfolios: DraftPortfolio[], s: BacktestSettings): Promise<RunOutput> {
  const list: Portfolio[] = portfolios.map((p, i) => ({
    id: `p${i}`,
    name: p.name,
    allocations: p.holdings.filter((h) => h.weight > 0).map((h) => ({ symbol: h.symbol, weight: h.weight / 100 })),
  }));
  if (s.benchmark) list.push({ id: "bench", name: BENCHMARKS.find((b) => b.symbol === s.benchmark)?.label || s.benchmark, allocations: [{ symbol: s.benchmark, weight: 1 }] });

  const now = new Date();
  const endDate = s.endYear >= now.getFullYear() ? now.toISOString().slice(0, 10) : `${s.endYear}-12-31`;
  const opts = (startDate: string) => ({
    initialBalance: s.initial,
    startDate,
    endDate,
    rebalanceFrequency: s.rebalance,
    cashflowAmount: s.monthly > 0 ? s.monthly : undefined,
    cashflowFrequency: s.monthly > 0 ? ("monthly" as const) : undefined,
    reinvestDividends: true,
    baseCurrency: s.currency,
  });
  let results = await runBacktest(list, opts(`${s.startYear}-01-01`));
  // Each portfolio starts when all its assets have prices. Compare them over the same months:
  // run again from the latest start so curves and figures cover one common period.
  const starts = results.filter((r) => r.equityCurve?.length).map((r) => r.equityCurve[0].date.slice(0, 7));
  const common = starts.sort().at(-1);
  let adjustedFrom: string | null = null;
  if (common && starts.some((d) => d !== common)) {
    results = await runBacktest(list, opts(`${common}-01`));
    adjustedFrom = common;
  } else if (common && common > `${s.startYear}-01`) {
    adjustedFrom = common;
  }

  const series: SeriesView[] = [];
  const warnings: string[] = [];
  results.forEach((r) => {
    const src = list.find((p) => p.id === r.portfolioId);
    if (!src || !r.equityCurve?.length) return;
    const alloc: Record<string, number> = {};
    src.allocations.forEach((a) => (alloc[a.symbol] = Math.round(a.weight * 1000) / 10));
    series.push(toView(r, src.name, r.portfolioId === "bench", alloc));
    (r.warnings || []).map(frenchWarning).forEach((w) => w && !warnings.includes(w) && warnings.push(w));
  });
  if (!series.length) throw new Error("Aucune donnée de prix pour ces actifs sur cette période.");
  if (adjustedFrom) {
    const [y, m] = adjustedFrom.split("-");
    warnings.unshift(`Période ajustée : début en ${m}/${y}, premier mois où tous les actifs ont un historique.`);
  }
  const startYear = adjustedFrom ? parseInt(adjustedFrom.slice(0, 4), 10) : s.startYear;
  return { settings: { ...s, startYear }, series, warnings, ranAt: Date.now() };
}

/** Same document shape as the website (users/{uid}/backtests), so the analysis appears in the client area. */
export async function saveRun(uid: string, name: string, out: RunOutput, portfolios: DraftPortfolio[]) {
  const id = Date.now().toString();
  const summary: SavedPortfolioSummary[] = out.series.map((v) => {
    const step = Math.max(1, Math.ceil(v.values.length / 240));
    const curve: number[] = [];
    const curveDates: string[] = [];
    v.values.forEach((x, i) => {
      if (i % step === 0 || i === v.values.length - 1) {
        curve.push(Math.round(x * 100) / 100);
        curveDates.push(v.dates[i]);
      }
    });
    const r4 = (x: number) => Math.round(x * 10000) / 10000;
    return {
      name: v.name,
      cagr: r4(v.cagr * 100),
      stdev: r4(v.volatility * 100),
      sharpe: r4(v.sharpe),
      sortino: r4(v.sortino),
      bestYear: r4(v.bestYear * 100),
      worstYear: r4(v.worstYear * 100),
      maxDrawdown: r4(-v.maxDrawdown * 100),
      endBalance: Math.round(v.endBalance * 100) / 100,
      initialAmount: out.settings.initial,
      alloc: v.alloc,
      curve,
      curveDates,
      annualYears: v.years,
      annualReturns: v.annual.map((a) => r4(a * 100)),
    };
  });
  await setDoc(doc(db, `users/${uid}/backtests`, id), {
    name,
    userId: uid,
    pageId: "mobile",
    source: "app",
    startYear: out.settings.startYear,
    endYear: out.settings.endYear,
    initialAmount: out.settings.initial,
    cashflowAmount: out.settings.monthly,
    rebalancing: out.settings.rebalance,
    portNames: portfolios.map((p) => p.name),
    portfolios: portfolios.map((p) => ({ name: p.name, holdings: p.holdings.map((h) => ({ symbol: h.symbol, weight: h.weight })) })),
    resultsSummary: summary,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return id;
}

export interface SavedItem {
  id: string;
  name: string;
  pageId?: string;
  startYear?: number;
  endYear?: number;
  updatedAt?: number;
  resultsSummary?: SavedPortfolioSummary[] | null;
}

export async function listSaved(uid: string): Promise<SavedItem[]> {
  const snap = await getDocs(collection(db, `users/${uid}/backtests`));
  const out: SavedItem[] = [];
  snap.forEach((d) => out.push({ id: d.id, ...(d.data() as any) }));
  return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
