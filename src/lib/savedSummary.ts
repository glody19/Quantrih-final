/**
 * Compact copy of backtest results stored with a saved analysis, so the client area can redraw
 * growth curves, annual returns and PDF reports without running the backtest again.
 */
export interface SavedPortfolioSummary {
  name: string;
  cagr?: number;
  stdev?: number;
  sharpe?: number;
  sortino?: number;
  bestYear?: number;
  worstYear?: number;
  maxDrawdown?: number;
  endBalance?: number;
  initialAmount?: number;
  alloc?: Record<string, number>;
  /** Portfolio value, at most ~240 points. */
  curve?: number[];
  curveDates?: string[];
  annualYears?: number[];
  annualReturns?: number[];
}

const fin = (v: any) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 10000) / 10000 : undefined);

/** Drops undefined values: Firestore refuses them. */
function clean<T extends Record<string, any>>(o: T): T {
  const out: any = {};
  Object.keys(o).forEach((k) => { if (o[k] !== undefined) out[k] = o[k]; });
  return out;
}

export function summarizeResults(results: any[] | null | undefined): SavedPortfolioSummary[] | null {
  if (!results || results.length === 0) return null;
  return results.map((r) => {
    const balances: number[] = Array.isArray(r.balances) ? r.balances : [];
    const dates: string[] = Array.isArray(r.dates) ? r.dates : [];
    const step = Math.max(1, Math.ceil(balances.length / 240));
    const curve: number[] = [];
    const curveDates: string[] = [];
    for (let i = 0; i < balances.length; i += step) {
      curve.push(Math.round(balances[i] * 100) / 100);
      curveDates.push(String(dates[i] || "").slice(0, 10));
    }
    if (balances.length > 0 && (balances.length - 1) % step !== 0) {
      curve.push(Math.round(balances[balances.length - 1] * 100) / 100);
      curveDates.push(String(dates[dates.length - 1] || "").slice(0, 10));
    }
    const alloc: Record<string, number> = {};
    if (r.alloc && typeof r.alloc === "object") Object.entries(r.alloc).forEach(([k, v]) => { const n = fin(Number(v)); if (k && n !== undefined) alloc[k] = n; });
    return clean({
      name: String(r.name || ""),
      cagr: fin(r.cagr),
      stdev: fin(r.stdev),
      sharpe: fin(r.sharpe),
      sortino: fin(r.sortino),
      bestYear: fin(r.bestYear),
      worstYear: fin(r.worstYear),
      maxDrawdown: fin(r.maxDrawdown),
      endBalance: fin(r.endBalance),
      initialAmount: fin(r.initialAmount),
      alloc: Object.keys(alloc).length ? alloc : undefined,
      curve: curve.length > 1 && dates.length ? curve : undefined,
      curveDates: curve.length > 1 && dates.length ? curveDates : undefined,
      annualYears: Array.isArray(r.yearsInteger) ? r.yearsInteger.map(Number) : undefined,
      annualReturns: Array.isArray(r.annualReturns) ? r.annualReturns.map((x: any) => fin(Number(x)) ?? 0) : undefined,
    });
  });
}
