import { EquityDataPoint, BacktestMetrics } from './types';

export function calculateMetrics(
  equityCurve: EquityDataPoint[], 
  initialBalance: number, 
  riskFreeRate: number = 0.04
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
  let peak = initialBalance;
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
    
    if (curr > peak) peak = curr;
    const drawdown = (peak - curr) / peak;
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
  const riskFreeMonthly = Math.pow(1 + riskFreeRate, 1/12) - 1;
  const avgExcessReturn = returns.length ? returns.reduce((a, b) => a + (b - riskFreeMonthly), 0) / returns.length : 0;
  const annualizedExcessReturn = avgExcessReturn * 12; // Approximation
  
  // Accurate PV Sharpe (annualized from monthly)
  const monthlyExcessDev = returns.length > 1 ? Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - riskFreeMonthly - avgExcessReturn, 2), 0) / (returns.length - 1)) : 0;
  const sharpeRatioMonthly = monthlyExcessDev === 0 ? 0 : avgExcessReturn / monthlyExcessDev;
  const sharpeRatio = sharpeRatioMonthly * Math.sqrt(12);
  
  const downReturnsPV: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    const diff = returns[i] - riskFreeMonthly;
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

  return {
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
  riskFreeRate: number = 0.04
) {
  const minLen = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (minLen < 2) return null;

  const pr = portfolioReturns.slice(-minLen);
  const br = benchmarkReturns.slice(-minLen);

  const meanP = pr.reduce((a, b) => a + b, 0) / minLen;
  const meanB = br.reduce((a, b) => a + b, 0) / minLen;

  // Beta calculation
  let numCov = 0;
  let denVarB = 0;
  for (let i = 0; i < minLen; i++) {
    numCov += (pr[i] - meanP) * (br[i] - meanB);
    denVarB += Math.pow(br[i] - meanB, 2);
  }
  const beta = denVarB === 0 ? 1 : numCov / denVarB;

  // Alpha (Jensen's)
  const alpha = portfolioCagr - (riskFreeRate + beta * (benchmarkCagr - riskFreeRate));

  // Tracking Error
  const activeReturns = pr.map((r, i) => r - br[i]);
  const meanActive = activeReturns.reduce((a, b) => a + b, 0) / minLen;
  const varActive = activeReturns.reduce((a, b) => a + Math.pow(b - meanActive, 2), 0) / minLen;
  const trackingError = Math.sqrt(varActive) * Math.sqrt(12);

  // Information Ratio
  const informationRatio = trackingError === 0 ? 0 : (portfolioCagr - benchmarkCagr) / trackingError;

  // Up/Down Capture
  let upSumP = 0;
  let upSumB = 0;
  let downSumP = 0;
  let downSumB = 0;

  for (let i = 0; i < minLen; i++) {
    if (br[i] > 0) {
      upSumP += pr[i];
      upSumB += br[i];
    } else if (br[i] < 0) {
      downSumP += pr[i];
      downSumB += br[i];
    }
  }

  const upCapture = upSumB === 0 ? 100 : (upSumP / upSumB) * 100;
  const downCapture = downSumB === 0 ? 100 : (downSumP / downSumB) * 100;

  return { alpha, beta, trackingError, informationRatio, upCapture, downCapture };
}
