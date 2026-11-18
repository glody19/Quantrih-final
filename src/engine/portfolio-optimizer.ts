/**
 * Portfolio optimization on monthly returns (long only, per-asset min/max weights, weights sum to 1).
 *
 * Every problem is solved with projected gradient ascent on the capped simplex, which is exact for
 * the convex ones (minimum variance, mean-variance utility) and, started from the best point of the
 * efficient frontier, converges reliably for the ratio objectives (Sharpe, diversification).
 */

export type OptimizationGoal =
  | "maxSharpe"
  | "minVariance"
  | "riskParity"
  | "maxDiversification"
  | "targetVolatility"
  | "targetReturn"
  | "inverseVolatility"
  | "equalWeight";

export interface OptimizerInput {
  /** Annualized expected returns (decimal). */
  mu: number[];
  /** Annualized covariance matrix. */
  cov: number[][];
  /** Lower and upper bound of each weight (decimal). */
  lo: number[];
  hi: number[];
  /** Annual risk-free rate (decimal). */
  rf: number;
}

export interface FrontierPoint {
  weights: number[];
  ret: number;
  vol: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const matVec = (m: number[][], v: number[]) => m.map((row) => dot(row, v));

export function portfolioReturn(w: number[], mu: number[]) {
  return dot(w, mu);
}

export function portfolioVol(w: number[], cov: number[][]) {
  return Math.sqrt(Math.max(0, dot(w, matVec(cov, w))));
}

/** Annualized mean returns and covariance from aligned monthly return series (one array per asset). */
export function estimateMoments(returns: number[][]): { mu: number[]; cov: number[][] } {
  const n = returns.length;
  const T = n ? returns[0].length : 0;
  const means = returns.map((r) => (T ? sum(r) / T : 0));
  const cov: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let c = 0;
      for (let t = 0; t < T; t++) c += (returns[i][t] - means[i]) * (returns[j][t] - means[j]);
      c = T > 1 ? (c / (T - 1)) * 12 : 0;
      cov[i][j] = c;
      cov[j][i] = c;
    }
  }
  // geometric-consistent annualization of the arithmetic monthly mean
  const mu = means.map((m) => m * 12);
  return { mu, cov };
}

/** Euclidean projection onto { lo <= w <= hi, sum(w) = 1 } by bisection on the shift. */
export function projectCappedSimplex(v: number[], lo: number[], hi: number[]): number[] {
  const clip = (tau: number) => v.map((x, i) => Math.min(hi[i], Math.max(lo[i], x - tau)));
  let a = Math.min(...v.map((x, i) => x - hi[i])) - 1;
  let b = Math.max(...v.map((x, i) => x - lo[i])) + 1;
  for (let k = 0; k < 80; k++) {
    const m = (a + b) / 2;
    if (sum(clip(m)) > 1) a = m;
    else b = m;
  }
  return clip((a + b) / 2);
}

/** Checks that the bounds allow a fully invested portfolio, and repairs them if not. */
export function feasibleBounds(lo: number[], hi: number[]): { lo: number[]; hi: number[]; adjusted: boolean } {
  let L = lo.map((x) => Math.max(0, Math.min(1, x)));
  let H = hi.map((x, i) => Math.max(L[i], Math.min(1, x)));
  let adjusted = L.some((x, i) => x !== lo[i]) || H.some((x, i) => x !== hi[i]);
  if (sum(L) > 1) {
    const s = sum(L);
    L = L.map((x) => x / s);
    adjusted = true;
  }
  if (sum(H) < 1) {
    H = H.map(() => 1);
    adjusted = true;
  }
  return { lo: L, hi: H, adjusted };
}

function maxEigen(m: number[][]): number {
  const n = m.length;
  let v = new Array(n).fill(1 / Math.sqrt(n));
  let lambda = 0;
  for (let k = 0; k < 60; k++) {
    const w = matVec(m, v);
    const norm = Math.sqrt(dot(w, w)) || 1;
    lambda = norm;
    v = w.map((x) => x / norm);
  }
  return lambda || 1e-6;
}

/** Maximizes w'mu - (lambda/2) w'Σw on the capped simplex (lambda = 0 gives maximum return). */
function meanVariance(input: OptimizerInput, lambda: number, start?: number[]): number[] {
  const { mu, cov, lo, hi } = input;
  const L = Math.max(lambda * maxEigen(cov), 1e-4);
  const step = 1 / L;
  let w = projectCappedSimplex(start ?? mu.map(() => 1 / mu.length), lo, hi);
  for (let k = 0; k < 4000; k++) {
    const g = matVec(cov, w);
    const next = projectCappedSimplex(w.map((x, i) => x + step * (mu[i] - lambda * g[i])), lo, hi);
    let diff = 0;
    for (let i = 0; i < w.length; i++) diff = Math.max(diff, Math.abs(next[i] - w[i]));
    w = next;
    if (diff < 1e-10) break;
  }
  return w;
}

export function minVariance(input: OptimizerInput): number[] {
  const { cov, lo, hi } = input;
  const step = 1 / (2 * maxEigen(cov));
  let w = projectCappedSimplex(cov.map(() => 1 / cov.length), lo, hi);
  for (let k = 0; k < 6000; k++) {
    const g = matVec(cov, w);
    const next = projectCappedSimplex(w.map((x, i) => x - step * 2 * g[i]), lo, hi);
    let diff = 0;
    for (let i = 0; i < w.length; i++) diff = Math.max(diff, Math.abs(next[i] - w[i]));
    w = next;
    if (diff < 1e-11) break;
  }
  return w;
}

/** Efficient frontier traced by sweeping the risk aversion of the mean-variance utility. */
export function efficientFrontier(input: OptimizerInput, points = 40): FrontierPoint[] {
  const out: FrontierPoint[] = [];
  const wMin = minVariance(input);
  out.push({ weights: wMin, ret: portfolioReturn(wMin, input.mu), vol: portfolioVol(wMin, input.cov) });
  let prev = wMin;
  for (let k = points; k >= 0; k--) {
    const lambda = k === 0 ? 0 : Math.pow(10, -1 + (4 * k) / points); // 1000 down to 0.1, then 0
    const w = meanVariance(input, lambda, prev);
    prev = w;
    out.push({ weights: w, ret: portfolioReturn(w, input.mu), vol: portfolioVol(w, input.cov) });
  }
  // keep the efficient (non-dominated) points only, ordered by volatility
  const eff = out.filter((p) => !out.some((q) => q !== p && q.vol <= p.vol + 1e-9 && q.ret > p.ret + 1e-9));
  eff.sort((a, b) => a.vol - b.vol);
  const clean: FrontierPoint[] = [];
  for (const p of eff) {
    const last = clean[clean.length - 1];
    if (last && Math.abs(p.vol - last.vol) < 1e-5) continue;
    clean.push(p);
  }
  return clean;
}

/** Maximizes (w'a - c) / sqrt(w'Σw) by projected gradient ascent with backtracking. */
function maxRatio(input: OptimizerInput, a: number[], c: number, start: number[]): number[] {
  const { cov, lo, hi } = input;
  const ratio = (w: number[]) => {
    const v = portfolioVol(w, cov);
    return v > 1e-12 ? (dot(w, a) - c) / v : -Infinity;
  };
  let w = projectCappedSimplex(start, lo, hi);
  let f = ratio(w);
  let step = 0.5;
  for (let k = 0; k < 3000 && step > 1e-9; k++) {
    const s = matVec(cov, w);
    const v2 = Math.max(dot(w, s), 1e-12);
    const v = Math.sqrt(v2);
    const num = dot(w, a) - c;
    const g = a.map((ai, i) => ai / v - (num * s[i]) / (v2 * v));
    const next = projectCappedSimplex(w.map((x, i) => x + step * g[i]), lo, hi);
    const fn = ratio(next);
    if (fn > f + 1e-13) {
      const moved = Math.max(...next.map((x, i) => Math.abs(x - w[i])));
      w = next;
      f = fn;
      step *= 1.2;
      if (moved < 1e-10) break;
    } else {
      step *= 0.5;
    }
  }
  return w;
}

export function maxSharpe(input: OptimizerInput, frontier?: FrontierPoint[]): number[] {
  const fr = frontier ?? efficientFrontier(input);
  let best = fr[0];
  let bestS = -Infinity;
  for (const p of fr) {
    const s = p.vol > 1e-12 ? (p.ret - input.rf) / p.vol : -Infinity;
    if (s > bestS) {
      bestS = s;
      best = p;
    }
  }
  return maxRatio(input, input.mu, input.rf, best.weights);
}

export function maxDiversification(input: OptimizerInput): number[] {
  const sig = input.cov.map((row, i) => Math.sqrt(Math.max(row[i], 0)));
  const start = inverseVolatility(input);
  return maxRatio(input, sig, 0, start);
}

export function inverseVolatility(input: OptimizerInput): number[] {
  const inv = input.cov.map((row, i) => 1 / Math.max(Math.sqrt(Math.max(row[i], 0)), 1e-9));
  const s = sum(inv);
  return projectCappedSimplex(inv.map((x) => x / s), input.lo, input.hi);
}

export function equalWeight(input: OptimizerInput): number[] {
  return projectCappedSimplex(input.mu.map(() => 1 / input.mu.length), input.lo, input.hi);
}

/** Share of portfolio variance coming from each asset (sums to 1). */
export function riskContributions(w: number[], cov: number[][]): number[] {
  const s = matVec(cov, w);
  const total = dot(w, s);
  if (total <= 0) return w.map(() => 0);
  return w.map((x, i) => (x * s[i]) / total);
}

/** Equal risk contribution, then projected onto the bounds. */
export function riskParity(input: OptimizerInput): number[] {
  const n = input.mu.length;
  let w = inverseVolatility({ ...input, lo: new Array(n).fill(0), hi: new Array(n).fill(1) });
  for (let k = 0; k < 2000; k++) {
    const rc = riskContributions(w, input.cov);
    const next = w.map((x, i) => x * Math.pow(1 / n / Math.max(rc[i], 1e-12), 0.5));
    const s = sum(next);
    const norm = next.map((x) => x / s);
    const diff = Math.max(...norm.map((x, i) => Math.abs(x - w[i])));
    w = norm;
    if (diff < 1e-12) break;
  }
  return projectCappedSimplex(w, input.lo, input.hi);
}

/** Highest-return frontier portfolio whose volatility does not exceed the target. */
export function targetVolatility(input: OptimizerInput, target: number, frontier?: FrontierPoint[]): number[] {
  const fr = frontier ?? efficientFrontier(input, 80);
  const ok = fr.filter((p) => p.vol <= target + 1e-9);
  if (!ok.length) return fr[0].weights; // target below the minimum variance portfolio
  // interpolate between the last admissible point and the next one for an exact volatility
  const a = ok[ok.length - 1];
  const b = fr[fr.indexOf(a) + 1];
  if (!b || b.vol <= a.vol) return a.weights;
  // the mix of two frontier portfolios is slightly inside the frontier: bisect on its real volatility
  const mix = (s: number) => a.weights.map((x, i) => x * (1 - s) + b.weights[i] * s);
  let lo = 0, hi = 1;
  for (let k = 0; k < 50; k++) {
    const m = (lo + hi) / 2;
    if (portfolioVol(mix(m), input.cov) <= target) lo = m;
    else hi = m;
  }
  return mix(lo);
}

/** Lowest-volatility frontier portfolio whose expected return reaches the target. */
export function targetReturn(input: OptimizerInput, target: number, frontier?: FrontierPoint[]): number[] {
  const fr = frontier ?? efficientFrontier(input, 80);
  const idx = fr.findIndex((p) => p.ret >= target - 1e-9);
  if (idx === -1) return fr[fr.length - 1].weights; // target above the best achievable return
  if (idx === 0) return fr[0].weights;
  const a = fr[idx - 1], b = fr[idx];
  const mix = (s: number) => a.weights.map((x, i) => x * (1 - s) + b.weights[i] * s);
  let lo = 0, hi = 1;
  for (let k = 0; k < 50; k++) {
    const m = (lo + hi) / 2;
    if (portfolioReturn(mix(m), input.mu) >= target) hi = m;
    else lo = m;
  }
  return mix(hi);
}

export function optimize(
  goal: OptimizationGoal,
  input: OptimizerInput,
  opts: { targetVol?: number; targetRet?: number; frontier?: FrontierPoint[] } = {},
): number[] {
  switch (goal) {
    case "maxSharpe":
      return maxSharpe(input, opts.frontier);
    case "minVariance":
      return minVariance(input);
    case "riskParity":
      return riskParity(input);
    case "maxDiversification":
      return maxDiversification(input);
    case "targetVolatility":
      return targetVolatility(input, opts.targetVol ?? 0.1, opts.frontier);
    case "targetReturn":
      return targetReturn(input, opts.targetRet ?? 0.07, opts.frontier);
    case "inverseVolatility":
      return inverseVolatility(input);
    case "equalWeight":
    default:
      return equalWeight(input);
  }
}

/** Monthly returns of a price (total return index) series, aligned on months shared by every asset. */
export function alignMonthlyReturns(series: { symbol: string; prices: { month: string; close: number }[] }[]): {
  months: string[]; // month of each return (YYYY-MM): return i runs from priceMonths[i] to months[i]
  priceMonths: string[];
  returns: number[][];
} {
  if (!series.length) return { months: [], priceMonths: [], returns: [] };
  const maps = series.map((s) => new Map(s.prices.map((p) => [p.month, p.close])));
  const months = [...maps[0].keys()].filter((m) => maps.every((mp) => (mp.get(m) ?? 0) > 0)).sort();
  const returns = maps.map((mp) => {
    const r: number[] = [];
    for (let i = 1; i < months.length; i++) r.push(mp.get(months[i])! / mp.get(months[i - 1])! - 1);
    return r;
  });
  return { months: months.slice(1), priceMonths: months.slice(0, -1), returns };
}

export type Rebalance = "monthly" | "quarterly" | "annually";

/**
 * Value of a portfolio over monthly returns, rebalanced to target weights. `weightsAt(i)` gives the
 * target in force at the start of month i (it may change over time, for walk-forward optimization).
 */
export function simulatePath(
  returns: number[][],
  months: string[],
  weightsAt: (i: number) => number[] | null,
  initial: number,
  rebalance: Rebalance,
): { values: number[]; startIndex: number } {
  const T = months.length;
  const values: number[] = [];
  let hold: number[] | null = null;
  let target: number[] | null = null;
  let startIndex = -1;
  for (let i = 0; i < T; i++) {
    const w = weightsAt(i);
    if (!w) continue;
    const mo = parseInt(months[i].slice(5, 7), 10);
    const periodStart = rebalance === "monthly" || (rebalance === "quarterly" && (mo - 1) % 3 === 0) || (rebalance === "annually" && mo === 1);
    const changed = !target || w.some((x, k) => Math.abs(x - target![k]) > 1e-12);
    if (!hold) {
      startIndex = i;
      values.push(initial);
      hold = w.map((x) => x * initial);
      target = w;
    } else if (changed || periodStart) {
      const v = sum(hold);
      hold = w.map((x) => x * v);
      target = w;
    }
    hold = hold.map((h, k) => h * (1 + returns[k][i]));
    values.push(sum(hold));
  }
  return { values, startIndex };
}
