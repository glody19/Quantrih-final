import { AssetResult } from './types';

export interface OptimizationResult {
  weights: Record<string, number>;
  expectedReturn: number;
  expectedVolatility: number;
  sharpeRatio: number;
}

export function optimizeMeanVariance(
  assets: AssetResult[],
  target: 'maxSharpe' | 'minVol',
  riskFreeRate: number = 0.04
): OptimizationResult {
  const n = assets.length;
  if (n === 0) throw new Error('No assets provided for optimization');

  // Simple Monte Carlo optimization (heuristic) for speed and simplicity
  // More robust quadratic programming would require a solver library
  const iterations = 5000;
  let bestWeights: number[] = [];
  let bestSharpe = -Infinity;
  let minVol = Infinity;
  let bestForMinVol: number[] = [];

  const returns = assets.map(a => {
    const total = a.monthlyReturns.reduce((s, r) => s + r, 0);
    return (total / a.monthlyReturns.length) * 12; // Annualized
  });

  const covMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    covMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      let cov = 0;
      const meanI = returns[i] / 12;
      const meanJ = returns[j] / 12;
      for (let k = 0; k < assets[i].monthlyReturns.length; k++) {
        cov += (assets[i].monthlyReturns[k] - meanI) * (assets[j].monthlyReturns[k] - meanJ);
      }
      covMatrix[i][j] = (cov / assets[i].monthlyReturns.length) * 12; // Annualized
    }
  }

  for (let i = 0; i < iterations; i++) {
    const w = Array.from({ length: n }, () => Math.random());
    const sum = w.reduce((s, val) => s + val, 0);
    const normalizedW = w.map(val => val / sum);

    let portfolioReturn = 0;
    for (let j = 0; j < n; j++) {
      portfolioReturn += normalizedW[j] * returns[j];
    }

    let portfolioVar = 0;
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        portfolioVar += normalizedW[j] * normalizedW[k] * covMatrix[j][k];
      }
    }
    const portfolioVol = Math.sqrt(portfolioVar);
    const sharpe = (portfolioReturn - riskFreeRate) / portfolioVol;

    if (target === 'maxSharpe' && sharpe > bestSharpe) {
      bestSharpe = sharpe;
      bestWeights = normalizedW;
    }
    if (target === 'minVol' && portfolioVol < minVol) {
      minVol = portfolioVol;
      bestForMinVol = normalizedW;
    }
  }

  const finalWeights = target === 'maxSharpe' ? bestWeights : bestForMinVol;
  
  let finalReturn = 0;
  for (let j = 0; j < n; j++) finalReturn += finalWeights[j] * returns[j];
  
  let finalVar = 0;
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      finalVar += finalWeights[j] * finalWeights[k] * covMatrix[j][k];
    }
  }
  const finalVol = Math.sqrt(finalVar);

  const weightsMap: Record<string, number> = {};
  assets.forEach((a, i) => {
    weightsMap[a.symbol] = finalWeights[i];
  });

  return {
    weights: weightsMap,
    expectedReturn: finalReturn,
    expectedVolatility: finalVol,
    sharpeRatio: (finalReturn - riskFreeRate) / finalVol
  };
}

export function optimizeRiskParity(assets: AssetResult[]): OptimizationResult {
  const n = assets.length;
  // Inverse Volatility weighting (Naive Risk Parity)
  const vols = assets.map(a => {
    const mean = a.monthlyReturns.reduce((s, r) => s + r, 0) / a.monthlyReturns.length;
    const variance = a.monthlyReturns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / a.monthlyReturns.length;
    return Math.sqrt(variance * 12);
  });

  const invVols = vols.map(v => 1 / v);
  const sumInv = invVols.reduce((s, val) => s + val, 0);
  const weights = invVols.map(val => val / sumInv);

  const weightsMap: Record<string, number> = {};
  assets.forEach((a, i) => {
    weightsMap[a.symbol] = weights[i];
  });

  // Calculate stats for result
  const returns = assets.map(a => (a.monthlyReturns.reduce((s, r) => s + r, 0) / a.monthlyReturns.length) * 12);
  let pRet = 0;
  for (let i = 0; i < n; i++) pRet += weights[i] * returns[i];

  // (Ideally we'd use covMatrix here too, but for speed simplified vol proxy)
  let pVol = 0;
  for (let i = 0; i < n; i++) pVol += weights[i] * vols[i]; // Bound estimate

  return {
    weights: weightsMap,
    expectedReturn: pRet,
    expectedVolatility: pVol,
    sharpeRatio: (pRet - 0.04) / pVol
  };
}
