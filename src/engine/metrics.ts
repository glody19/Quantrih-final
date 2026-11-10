import { EquityDataPoint, BacktestMetrics } from './types';

export function calculateMetrics(
  equityCurve: EquityDataPoint[], 
  initialBalance: number, 
  riskFreeRate: number = 0.04,
  riskFreeByMonth?: Map<string, number> | null
): BacktestMetrics {
  if (equityCurve.length === 0) {
    return { endBalance: initialBalance, startBalance: initialBalance, cagr: 0, irr: 0, volatility: 0, sharpeRatio: 0, sortinoRatio: 0, maxDrawdown: 0, bestYear: 0, worstYear: 0, drawdowns: [] };
  }

  const endBalance = equityCurve[equityCurve.length - 1].value;
  let totalContributions = initialBalance;
  for (const point of equityCurve) {
     if (point.cashflow) totalContributions += point.cashflow;
  }
  
  // Calculate IRR (Money-Weighted Rate of Return)
  let irr = 0;
  if (equityCurve.length > 0) {
    const cashflows = new Array(equityCurve.length + 1).fill(0);
    cashflows[0] = -initialBalance;
    for (let i = 0; i < equityCurve.length; i++) {
        cashflows[i + 1] = -(equityCurve[i].cashflow || 0);
    }
    cashflows[equityCurve.length] += endBalance;

    let left = -0.9999;
    let right = 100.0;
    for (let step = 0; step < 100; step++) {
        const mid = (left + right) / 2;
        let npv = 0;
        for (let t = 0; t < cashflows.length; t++) {
            npv += cashflows[t] / Math.pow(1 + mid, t);
        }
        if (npv > 0) {
            left = mid;
        } else {
            right = mid;
        }
    }
    irr = Math.pow(1 + (left + right) / 2, 12) - 1;
  }

  // Monthly returns
  const returns: number[] = [];
  const monthlyReturnsList: { date: string, value: number }[] = [];
  const downReturns: number[] = [];
  let peak = 1;
  let twrIndex = 1;
  let maxDrawdown = 0;

  // Track yearly performance
  const yearlyBalances: Record<string, { start: number, end: number, contributions: number }> = {};

  const drawdownsList: number[] = [0];

  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].value;
    const curr = equityCurve[i].value;
    const cashflow = equityCurve[i].cashflow || 0;
    
    // Time-weighted return for the period
    const ret = (curr - (prev + cashflow)) / (prev + cashflow);
    returns.push(ret);
    monthlyReturnsList.push({ date: equityCurve[i].date, value: ret * 100 });
    
    if (ret < 0) {
      downReturns.push(ret);
    }
    
    // Drawdowns are measured on the time-weighted index, so contributions/withdrawals
    // do not create or hide drawdowns (same convention as Portfolio Visualizer).
    twrIndex *= (1 + ret);
    if (twrIndex > peak) peak = twrIndex;
    const drawdown = (peak - twrIndex) / peak;
    drawdownsList.push(drawdown);
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;

    const year = equityCurve[i].date.substring(0, 4);
    if (!yearlyBalances[year]) {
      yearlyBalances[year] = { start: prev + cashflow, end: curr, contributions: cashflow };
    } else {
      yearlyBalances[year].end = curr;
      yearlyBalances[year].contributions += cashflow;
    }
  }

  const years = (new Date(equityCurve[equityCurve.length - 1].date).getTime() - new Date(equityCurve[0].date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  // CAGR calculation: If we have cashflows, we use the geometric mean of periodic returns (TWR)
  const geometricReturn = returns.length > 0 
    ? Math.pow(returns.reduce((acc, r) => acc * (1 + r), 1), 12 / returns.length) - 1
    : 0;
  const cagr = geometricReturn;

  // Annualized Volatility (monthly data => * sqrt(12))
  const avgReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1 ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length - 1) : 0;
  const standardDeviation = Math.sqrt(variance);
  const annualizedVolatility = standardDeviation * Math.sqrt(12);

  // Sharpe and Sortino
  const riskFreeMonthlyFixed = Math.pow(1 + riskFreeRate, 1/12) - 1;
  // Monthly risk-free return: real T-bill series when available, fixed rate otherwise
  const rfSeries = returns.map((_, k) => {
    const month = equityCurve[k + 1].date.substring(0, 7);
    const v = riskFreeByMonth?.get(month);
    return typeof v === 'number' && Number.isFinite(v) ? v : riskFreeMonthlyFixed;
  });
  const riskFreeMonthly = rfSeries.length ? rfSeries.reduce((a, b) => a + b, 0) / rfSeries.length : riskFreeMonthlyFixed;
  const excess = returns.map((r, k) => r - rfSeries[k]);
  const avgExcessReturn = excess.length ? excess.reduce((a, b) => a + b, 0) / excess.length : 0;
  const annualizedExcessReturn = avgExcessReturn * 12; // Approximation
  
  // Accurate PV Sharpe (annualized from monthly)
  const monthlyExcessDev = excess.length > 1 ? Math.sqrt(excess.reduce((a, b) => a + Math.pow(b - avgExcessReturn, 2), 0) / (excess.length - 1)) : 0;
  const sharpeRatioMonthly = monthlyExcessDev === 0 ? 0 : avgExcessReturn / monthlyExcessDev;
  const sharpeRatio = sharpeRatioMonthly * Math.sqrt(12);
  
  const downReturnsPV: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    const diff = excess[i];
    if (diff < 0) downReturnsPV.push(diff);
  }
  const downsideDeviation = Math.sqrt(downReturnsPV.length ? downReturnsPV.reduce((a, b) => a + Math.pow(b, 2), 0) / returns.length : 0);

  // Accurate PV Sortino
  const downsideDeviationMonthly = downsideDeviation;
  const sortinoRatioMonthly = downsideDeviationMonthly === 0 ? 0 : avgExcessReturn / downsideDeviationMonthly;
  const sortinoRatio = sortinoRatioMonthly * Math.sqrt(12);

  // Best/Worst Year
  let bestYear = -Infinity;
  let worstYear = Infinity;
  
  // Group monthly returns by year to calculate annual TWR
  const yearlyTWR: Record<string, number> = {};
  monthlyReturnsList.forEach(m => {
     const year = m.date.substring(0, 4);
     if (!yearlyTWR[year]) yearlyTWR[year] = 1;
     yearlyTWR[year] *= (1 + (m.value / 100)); // m.value is percentage
  });
  
  for (const year in yearlyTWR) {
     const ret = yearlyTWR[year] - 1;
     if (ret > bestYear) bestYear = ret;
     if (ret < worstYear) worstYear = ret;
  }
  
  if (bestYear === -Infinity) bestYear = 0;
  if (worstYear === Infinity) worstYear = 0;

  // ---- Extended statistics (Portfolio Visualizer style, monthly data) ----
  const n = returns.length;
  const arithMeanMonthly = avgReturn;
  const arithMean = Math.pow(1 + arithMeanMonthly, 12) - 1;
  const m3 = n > 2 ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 3), 0) / n : 0;
  const m2 = n > 1 ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / n : 0;
  const m4 = n > 3 ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 4), 0) / n : 0;
  const skewness = m2 > 0 ? m3 / Math.pow(m2, 1.5) : 0;
  const excessKurtosis = m2 > 0 ? m4 / (m2 * m2) - 3 : 0;
  const sortedR = [...returns].sort((a, b) => a - b);
  const q5 = n ? sortedR[Math.max(0, Math.floor(0.05 * n) - (Number.isInteger(0.05 * n) ? 1 : 0))] : 0;
  const tail = sortedR.filter((r) => r <= q5);
  const historicalVaR5 = n ? -q5 : 0;
  const analyticalVaR5 = -(avgReturn - 1.6448536 * standardDeviation);
  const conditionalVaR5 = tail.length ? -(tail.reduce((a, b) => a + b, 0) / tail.length) : 0;
  const positiveMonths = n ? returns.filter((r) => r > 0).length / n : 0;
  const gains = returns.filter((r) => r > 0), losses = returns.filter((r) => r < 0);
  const gainLossRatio = gains.length && losses.length ? (gains.reduce((a, b) => a + b, 0) / gains.length) / Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
  const downsideDeviationAnnual = downsideDeviation * Math.sqrt(12);
  const calmar = maxDrawdown > 0 ? geometricReturn / maxDrawdown : 0;
  const riskFreeAnnual = Math.pow(1 + riskFreeMonthly, 12) - 1;

  // Drawdown episodes on the time-weighted index
  const drawdownEpisodes: { start: string; trough: string; end: string | null; depth: number; lengthMonths: number; recoveryMonths: number | null; underwaterMonths: number | null }[] = [];
  {
    let idx = 1, pk = 1, pkI = 0, inDd = false, trI = 0, depth = 0;
    const dates = equityCurve.map((e) => e.date.substring(0, 7));
    for (let k = 0; k < n; k++) {
      idx *= 1 + returns[k];
      const i = k + 1;
      if (idx >= pk) {
        if (inDd) {
          drawdownEpisodes.push({ start: dates[pkI], trough: dates[trI], end: dates[i], depth, lengthMonths: trI - pkI, recoveryMonths: i - trI, underwaterMonths: i - pkI });
          inDd = false;
        }
        pk = idx; pkI = i; depth = 0;
      } else {
        const dd = 1 - idx / pk;
        if (!inDd) { inDd = true; trI = i; depth = dd; }
        if (dd > depth) { depth = dd; trI = i; }
      }
    }
    if (inDd) drawdownEpisodes.push({ start: dates[pkI], trough: dates[trI], end: null, depth, lengthMonths: trI - pkI, recoveryMonths: null, underwaterMonths: null });
    drawdownEpisodes.sort((a, b) => b.depth - a.depth);
  }

  return {
    arithMean,
    geometricMean: geometricReturn,
    downsideDeviation: downsideDeviationAnnual,
    skewness,
    excessKurtosis,
    historicalVaR5,
    analyticalVaR5,
    conditionalVaR5,
    positiveMonths,
    gainLossRatio,
    calmar,
    riskFreeAnnual,
    drawdownEpisodes: drawdownEpisodes.slice(0, 10),
    startBalance: initialBalance,
    totalContributions,
    endBalance,
    cagr,
    irr,
    volatility: annualizedVolatility,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    bestYear,
    worstYear,
    drawdowns: drawdownsList,
    monthlyReturns: monthlyReturnsList,
    rolling1Y: calculateRollingReturns(equityCurve, 1),
    rolling3Y: calculateRollingReturns(equityCurve, 3),
    rolling5Y: calculateRollingReturns(equityCurve, 5),
    rolling10Y: calculateRollingReturns(equityCurve, 10),
  };
}

export function calculateMonteCarlo(returns: number[], initialBalance: number, months: number = 120, simulations: number = 500) {
  if (returns.length === 0) return null;
  
  const results: number[][] = [];
  let aboveInitialCount = 0;
  let hitZeroCount = 0;
  
  for (let s = 0; s < simulations; s++) {
    let balance = initialBalance;
    const path = [balance];
    let hitZero = false;
    for (let m = 0; m < months; m++) {
      const r = returns[Math.floor(Math.random() * returns.length)];
      balance *= (1 + r);
      if (balance <= 0) {
        balance = 0;
        hitZero = true;
      }
      path.push(balance);
    }
    results.push(path);
    if (balance > initialBalance) aboveInitialCount++;
    if (hitZero) hitZeroCount++;
  }

  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  for (let m = 0; m <= months; m++) {
    const monthValues = results.map(path => path[m]).sort((a, b) => a - b);
    p10.push(monthValues[Math.floor(simulations * 0.1)]);
    p50.push(monthValues[Math.floor(simulations * 0.5)]);
    p90.push(monthValues[Math.floor(simulations * 0.9)]);
  }

  return {
    paths: results.slice(0, 5), // Only keep a few paths to avoid bloating the result
    percentiles: { 10: p10, 50: p50, 90: p90 },
    probabilities: {
      endingAboveInitial: aboveInitialCount / simulations,
      hittingZero: hitZeroCount / simulations,
    }
  };
}

export function calculateCorrelationMatrix(assets: { symbol: string, returns: number[] }[]) {
  const size = assets.length;
  const matrix: Record<string, Record<string, number>> = {};

  for (let i = 0; i < size; i++) {
    const s1 = assets[i].symbol;
    matrix[s1] = {};
    for (let j = 0; j < size; j++) {
      const s2 = assets[j].symbol;
      if (i === j) {
        matrix[s1][s2] = 1;
      } else {
        const returns1 = assets[i].returns;
        const returns2 = assets[j].returns;
        const minLen = Math.min(returns1.length, returns2.length);
        if (minLen < 2) {
            matrix[s1][s2] = 0;
            continue;
        }

        const r1 = returns1.slice(0, minLen);
        const r2 = returns2.slice(0, minLen);

        const mean1 = r1.reduce((a, b) => a + b, 0) / minLen;
        const mean2 = r2.reduce((a, b) => a + b, 0) / minLen;
        
        let num = 0;
        let den1 = 0;
        let den2 = 0;
        
        for (let k = 0; k < minLen; k++) {
          num += (r1[k] - mean1) * (r2[k] - mean2);
          den1 += Math.pow(r1[k] - mean1, 2);
          den2 += Math.pow(r2[k] - mean2, 2);
        }
        
        matrix[s1][s2] = den1 * den2 === 0 ? 0 : num / (Math.sqrt(den1) * Math.sqrt(den2));
      }
    }
  }

  return matrix;
}

export function calculateRollingReturns(equityCurve: EquityDataPoint[], periodYears: number) {
  const offset = periodYears * 12;
  if (equityCurve.length <= offset) return null;
  
  const values: number[] = [];
  for (let i = offset; i < equityCurve.length; i++) {
    const startValue = equityCurve[i - offset].value;
    const endValue = equityCurve[i].value;
    const cagr = Math.pow(endValue / startValue, 1 / periodYears) - 1;
    values.push(cagr);
  }

  if (values.length === 0) return null;
  values.sort((a, b) => a - b);
  
  return {
    average: values.reduce((a, b) => a + b, 0) / values.length,
    best: values[values.length - 1],
    worst: values[0],
    count: values.length
  };
}

export function calculateRelativeMetrics(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  portfolioCagr: number,
  benchmarkCagr: number,
  riskFreeRate: number = 0.04,
  riskFreeMonthlySeries?: number[]
) {
  const minLen = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (minLen < 2) return null;

  const pr = portfolioReturns.slice(-minLen);
  const br = benchmarkReturns.slice(-minLen);
  const fixedRf = Math.pow(1 + riskFreeRate, 1 / 12) - 1;
  const rf = riskFreeMonthlySeries && riskFreeMonthlySeries.length >= minLen ? riskFreeMonthlySeries.slice(-minLen) : new Array(minLen).fill(fixedRf);

  // Regression of portfolio excess returns on benchmark excess returns (monthly)
  const ep = pr.map((r, i) => r - rf[i]);
  const eb = br.map((r, i) => r - rf[i]);
  const meanEp = ep.reduce((a, b) => a + b, 0) / minLen;
  const meanEb = eb.reduce((a, b) => a + b, 0) / minLen;
  let cov = 0, varB = 0, varP = 0;
  for (let i = 0; i < minLen; i++) {
    cov += (ep[i] - meanEp) * (eb[i] - meanEb);
    varB += Math.pow(eb[i] - meanEb, 2);
    varP += Math.pow(ep[i] - meanEp, 2);
  }
  const beta = varB === 0 ? 1 : cov / varB;
  const alphaMonthly = meanEp - beta * meanEb;
  const alpha = alphaMonthly * 12; // annualized
  const correlation = varB === 0 || varP === 0 ? 0 : cov / Math.sqrt(varB * varP);
  const rSquared = correlation * correlation;

  // Tracking error (sample stdev of active returns, annualized) and information ratio
  const active = pr.map((r, i) => r - br[i]);
  const meanActive = active.reduce((a, b) => a + b, 0) / minLen;
  const varActive = active.reduce((a, b) => a + Math.pow(b - meanActive, 2), 0) / (minLen - 1);
  const trackingError = Math.sqrt(varActive) * Math.sqrt(12);
  const activeReturn = portfolioCagr - benchmarkCagr;
  const informationRatio = trackingError === 0 ? 0 : (meanActive * 12) / trackingError;

  // Upside / downside capture: compound annualized returns in benchmark up / down months
  const geo = (xs: number[]) => (xs.length ? Math.pow(xs.reduce((a, b) => a * (1 + b), 1), 12 / xs.length) - 1 : 0);
  const upIdx = br.map((r, i) => (r > 0 ? i : -1)).filter((i) => i >= 0);
  const dnIdx = br.map((r, i) => (r < 0 ? i : -1)).filter((i) => i >= 0);
  const upB = geo(upIdx.map((i) => br[i])), upP = geo(upIdx.map((i) => pr[i]));
  const dnB = geo(dnIdx.map((i) => br[i])), dnP = geo(dnIdx.map((i) => pr[i]));
  const upCapture = upB === 0 ? 100 : (upP / upB) * 100;
  const downCapture = dnB === 0 ? 100 : (dnP / dnB) * 100;

  // Treynor and Modigliani (M²)
  const rfAnnual = Math.pow(1 + rf.reduce((a, b) => a + b, 0) / minLen, 12) - 1;
  const treynor = beta === 0 ? 0 : (portfolioCagr - rfAnnual) / beta;
  const sdP = Math.sqrt(pr.reduce((a, b, i) => a + Math.pow(b - pr.reduce((x, y) => x + y, 0) / minLen, 2), 0) / (minLen - 1)) * Math.sqrt(12);
  const sdB = Math.sqrt(br.reduce((a, b) => a + Math.pow(b - br.reduce((x, y) => x + y, 0) / minLen, 2), 0) / (minLen - 1)) * Math.sqrt(12);
  const modigliani = sdP === 0 ? 0 : rfAnnual + ((portfolioCagr - rfAnnual) / sdP) * sdB;

  return { alpha, beta, rSquared, correlation, trackingError, activeReturn, informationRatio, upCapture, downCapture, treynor, modigliani };
}
