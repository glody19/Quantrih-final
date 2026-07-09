import { Metrics } from "./types";
import { ASSET_DATA, FX_TO_USD, CASH_RATES, INFLATION } from "./constants";

export function getCashReturn(year: number, ccy: string): number {
  return (CASH_RATES[ccy] || CASH_RATES.USD)[year] || 0;
}

export function convertReturn(ticker: string, year: number, baseCcy: string): number {
  const a = ASSET_DATA[ticker];
  if (!a || a.returns[year] === undefined) return NaN;
  const r = a.returns[year];
  if (a.ccy === baseCcy) return r;

  const fxAEnd = FX_TO_USD[a.ccy]?.[year];
  const fxAStart = FX_TO_USD[a.ccy]?.[year - 1] || fxAEnd;
  const fxBEnd = FX_TO_USD[baseCcy]?.[year];
  const fxBStart = FX_TO_USD[baseCcy]?.[year - 1] || fxBEnd;

  if (!fxAEnd || !fxBEnd) return r;
  return ((1 + r / 100) * (fxAEnd / fxAStart) * (fxBStart / fxBEnd) - 1) * 100;
}

export function computeMetrics(rets: number[], initial: number, years: number[], baseCcy: string, cashflows: number[] = []): Metrics | null {
  const valid = rets.filter(r => !isNaN(r));
  if (!valid.length) return null;
  const dec = valid.map(r => r / 100);
  const n = valid.length;

  let val = initial;
  const path = [initial];
  for (let i = 0; i < dec.length; i++) {
    const r = dec[i];
    const cf = cashflows[i] || 0;
    val = (val + cf) * (1 + r);
    path.push(val);
  }
  
  // CAGR is tricky with cashflows, usually we use IRR for the performance metric
  // But we still show CAGR of the time-weighted return series.
  const cagr = geoMean(dec);
  const arithMeanVal = arithMean(dec);

  const cashSeries = CASH_RATES[baseCcy] || CASH_RATES.USD;
  const cashRets = years.map(y => (cashSeries[y] || 0) / 100);
  const rf = cashRets.reduce((s, x) => s + x, 0) / cashRets.length || 0.02;

  const sd = Math.sqrt(dec.reduce((s, x) => s + (x - arithMeanVal) ** 2, 0) / (n - 1)) || 0;
  const variance = sd * sd;

  const downside = dec.map(r => r < rf ? r : rf).map(r => r < rf ? r - rf : 0);
  const dd = Math.sqrt(downside.reduce((s, x) => s + x * x, 0) / n);

  const sharpe = sd > 0 ? (arithMeanVal - rf) / sd : 0;
  const sortino = dd > 0 ? (arithMeanVal - rf) / dd : 0;

  let peak = path[0], maxDD = 0;
  for (const v of path) {
    if (v > peak) peak = v;
    if (peak > 0) maxDD = Math.max(maxDD, (peak - v) / peak);
  }

  const inflRates = INFLATION[baseCcy]?.rates || INFLATION.USD.rates;
  const cpi = years.map(y => (inflRates[y] || 0) / 100).filter(x => !isNaN(x));
  let cpiCum = 1;
  for (const c of cpi) cpiCum *= (1 + c);
  const realCagr = cpi.length ? Math.pow((val / cpiCum) / initial, 1 / cpi.length) - 1 : cagr;

  const s95 = [...dec].sort((a, b) => a - b);
  const vi = Math.max(0, Math.floor(0.05 * s95.length));
  const var95 = -s95[vi] || 0;
  const cvar95 = s95.slice(0, vi + 1).length ? -s95.slice(0, vi + 1).reduce((s, v) => s + v, 0) / (vi + 1) : var95;
  const calmar = maxDD > 0 ? cagr / maxDD : 0;

  // IRR Calculation
  const irr = calculateIRR([-initial, ...cashflows.map(c => -c), val]);

  // MDD Duration
  let mddDuration = 0, currentDuration = 0, pCap = path[0];
  for (const v of path) {
    if (v >= pCap) {
      pCap = v;
      mddDuration = Math.max(mddDuration, currentDuration);
      currentDuration = 0;
    } else {
      currentDuration++;
    }
  }
  mddDuration = Math.max(mddDuration, currentDuration);

  // Ulcer index
  let pkU = path[0];
  const udd = path.map(v => {
    if (v > pkU) pkU = v;
    return pkU > 0 ? (((pkU - v) / pkU) * 100) : 0;
  });
  const ulcer = Math.sqrt(udd.reduce((s, d) => s + d * d, 0) / udd.length);

  // Omega ratio
  const gains = dec.filter(r => r > 0).reduce((s, r) => s + r, 0);
  const losses = dec.filter(r => r < 0).reduce((s, r) => s + Math.abs(r), 0);
  const omega = losses > 0 ? gains / losses : 9.99;

  const totalContributions = initial + (cashflows.reduce((s, x) => s + x, 0) || 0);

  return {
    finalBalance: val, cagr, realCagr, stdev: sd, sharpe, sortino, maxDrawdown: maxDD,
    bestYear: Math.max(...valid), worstYear: Math.min(...valid), path, annualReturns: rets, rf, n,
    var95, cvar95, calmar, mddDuration, ulcer, omega,
    arithMean: arithMeanVal, geoMean: cagr, variance, irr,
    totalContributions
  };
}

export function calculateIRR(cashflows: number[], guess = 0.1): number {
  const maxIter = 100;
  const precision = 0.00001;
  let r = guess;
  
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + r, t);
      dnpv -= t * cashflows[t] / Math.pow(1 + r, t + 1);
    }
    
    const nextR = r - npv / dnpv;
    if (Math.abs(nextR - r) < precision) return nextR;
    r = nextR;
  }
  return r;
}

export function arithMean(arr: number[]): number {
  const v = arr.filter(x => !isNaN(x));
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
}

export function geoMean(arr: number[]): number {
  const v = arr.filter(x => !isNaN(x));
  if (!v.length) return 0;
  let prod = 1;
  v.forEach(x => prod *= (1 + x));
  return Math.pow(prod, 1 / v.length) - 1;
}

export function downsideDev(arr: number[], target = 0): number {
  const v = arr.filter(x => !isNaN(x));
  const downs = v.filter(x => x < target).map(x => (x - target) * (x - target));
  return downs.length ? Math.sqrt(downs.reduce((s, x) => s + x, 0) / v.length) : 0;
}

export function calculateBeta(arr: number[], bench: number[]): number {
  const muA = arithMean(arr), muB = arithMean(bench);
  let cov = 0, varB = 0;
  const n = Math.min(arr.length, bench.length);
  for (let i = 0; i < n; i++) {
    cov += (arr[i] - muA) * (arr[i] - muB);
    varB += (bench[i] - muB) * (bench[i] - muB);
  }
  return varB > 0 ? cov / varB : 1;
}

export function calculateRSquared(arr: number[], bench: number[]): number {
  const muA = arithMean(arr), muB = arithMean(bench);
  let cov = 0, varA = 0, varB = 0;
  const n = Math.min(arr.length, bench.length);
  for (let i = 0; i < n; i++) {
    cov += (arr[i] - muA) * (bench[i] - muB);
    varA += (arr[i] - muA) * (arr[i] - muA);
    varB += (bench[i] - muB) * (bench[i] - muB);
  }
  return (varA * varB) > 0 ? (cov * cov) / (varA * varB) : 0;
}

export function calculateCorrelation(a: (number | null)[], b: (number | null)[]): number {
  const pairs = a.map((x, i) => [x, b[i]]).filter(([x, y]) => x !== null && y !== null) as number[][];
  if (pairs.length < 2) return NaN;
  const n = pairs.length;
  const ax = pairs.map(p => p[0]), bx = pairs.map(p => p[1]);
  const ma = arithMean(ax), mb = arithMean(bx);
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    cov += (ax[i] - ma) * (bx[i] - mb);
    va += (ax[i] - ma) * (ax[i] - ma);
    vb += (bx[i] - mb) * (bx[i] - mb);
  }
  return (va * vb > 0) ? cov / Math.sqrt(va * vb) : 0;
}

export function boxMuller(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
