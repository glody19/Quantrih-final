import { MonthlyPrice } from './types';
import { boxMuller } from '../utils';

export interface SimulationOptions {
  model: 'Normal' | 'Bootstrap' | 'BlockBootstrap';
  horizonYears: number;
  simulations: number;
  initialBalance: number;
  cashflow: number;
  cashflowType?: 'none' | 'fixed' | 'percentage';
  cashflowFreq?: 'annual' | 'monthly';
  spendingRule?: 'none' | 'rolling_avg' | 'geometric';
  sequenceOfReturnsYears?: number;
  inflationModel?: 'historical' | 'fixed';
  inflationRate?: number;
  blockSize?: number; // months for BlockBootstrap
}

export function runSimulation(
  assetReturns: { symbol: string, returns: number[] }[],
  weights: Record<string, number>,
  options: SimulationOptions,
  correlationMatrix?: Record<string, Record<string, number>>
): number[][] {
  const { model, horizonYears, simulations, initialBalance, cashflow, blockSize = 12 } = options;
  const horizonMonths = horizonYears * 12;
  const paths: number[][] = [];

  // Prepare data
  const symbols = assetReturns.map(a => a.symbol);
  const numAssets = symbols.length;
  
  // Align returns (assuming they are already aligned or we use available indices)
  const returnsMatrix: number[][] = []; // [month][asset]
  const minLen = Math.min(...assetReturns.map(a => a.returns.length));
  
  for (let m = 0; m < minLen; m++) {
    const monthReturns: number[] = [];
    symbols.forEach(s => {
      const asset = assetReturns.find(a => a.symbol === s)!;
      monthReturns.push(asset.returns[m]);
    });
    returnsMatrix.push(monthReturns);
  }

  // Pre-calculate portfolio stats for Normal model
  const monthlyAvgReturns = symbols.map((s, i) => {
    const returns = assetReturns.find(a => a.symbol === s)!.returns;
    return returns.reduce((a, b) => a + b, 0) / returns.length;
  });

  // Calculate portfolio monthly mean and variance
  const portfolioMean = symbols.reduce((acc, s, i) => acc + (monthlyAvgReturns[i] * (weights[s] / 100)), 0);
  
  let portfolioVar = 0;
  if (correlationMatrix) {
    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        const s1 = symbols[i];
        const s2 = symbols[j];
        const w1 = weights[s1] / 100;
        const w2 = weights[s2] / 100;
        const v1 = Math.sqrt(assetReturns[i].returns.reduce((a, b) => a + Math.pow(b - monthlyAvgReturns[i], 2), 0) / assetReturns[i].returns.length);
        const v2 = Math.sqrt(assetReturns[j].returns.reduce((a, b) => a + Math.pow(b - monthlyAvgReturns[j], 2), 0) / assetReturns[j].returns.length);
        const corr = correlationMatrix[s1]?.[s2] ?? 0;
        portfolioVar += w1 * w2 * v1 * v2 * corr;
      }
    }
  } else {
    // Simple fallback
    const portfolioReturns = returnsMatrix.map(m => m.reduce((acc, r, i) => acc + r * (weights[symbols[i]] / 100), 0));
    const mean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
    portfolioVar = portfolioReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / portfolioReturns.length;
  }
  const portfolioStdDev = Math.sqrt(portfolioVar);

  for (let s = 0; s < simulations; s++) {
    const rawReturns: number[] = [];
    
    // Step 1: Generate Raw Returns
    for (let m = 1; m <= horizonMonths; m++) {
      let monthReturn = 0;
      if (model === 'Normal') {
        monthReturn = portfolioMean + portfolioStdDev * boxMuller();
      } else if (model === 'Bootstrap') {
        const randomIndex = Math.floor(Math.random() * returnsMatrix.length);
        const selectedReturns = returnsMatrix[randomIndex];
        monthReturn = selectedReturns.reduce((acc, r, i) => acc + r * (weights[symbols[i]] / 100), 0);
      } else if (model === 'BlockBootstrap') {
        const blockStart = Math.floor(Math.random() * (returnsMatrix.length - blockSize));
        const blockIndex = (m - 1) % blockSize;
        const selectedReturns = returnsMatrix[blockStart + blockIndex];
        monthReturn = selectedReturns.reduce((acc, r, i) => acc + r * (weights[symbols[i]] / 100), 0);
      }
      rawReturns.push(monthReturn);
    }

    // Step 2: Sequence of Returns Risk Adjustment
    if (options.sequenceOfReturnsYears && options.sequenceOfReturnsYears > 0) {
      const yearsData = [];
      for(let y = 0; y < horizonYears; y++) {
         const mStart = y * 12;
         const yrReturns = rawReturns.slice(mStart, mStart + 12);
         const cmpReturn = yrReturns.reduce((acc, r) => acc * (1 + r), 1) - 1;
         yearsData.push({ idx: y, cmp: cmpReturn, rets: yrReturns });
      }
      // Sort by cmp return
      const sortedYears = [...yearsData].sort((a,b) => a.cmp - b.cmp);
      const worstN = sortedYears.slice(0, options.sequenceOfReturnsYears);
      const worstIdxs = new Set(worstN.map(x => x.idx));
      const remainingYears = yearsData.filter(x => !worstIdxs.has(x.idx));
      
      const adjustedReturns: number[] = [];
      worstN.forEach(yr => adjustedReturns.push(...yr.rets));
      remainingYears.forEach(yr => adjustedReturns.push(...yr.rets));
      
      // replace rawReturns
      for(let i=0; i<horizonMonths; i++) {
        rawReturns[i] = adjustedReturns[i];
      }
    }

    // Step 3: Apply to balance & Inflation
    let balance = initialBalance;
    const path = [balance];
    let rollingSum = initialBalance;
    let prevSpending = 0;

    let currentInflationAgg = 1;
    const fixedInfMonthly = options.inflationModel === 'fixed' && options.inflationRate !== undefined ? Math.pow(1 + options.inflationRate, 1/12) - 1 : 0;
    
    for (let m = 1; m <= horizonMonths; m++) {
      const monthReturn = rawReturns[m - 1];
      balance *= (1 + monthReturn);

      // Simple Fixed Inflation Model
      if (options.inflationModel === 'fixed') {
         currentInflationAgg *= (1 + fixedInfMonthly);
      }

      // Handle monthly cashflows
      let mcf = 0;
      if (options.cashflowType !== 'none' && options.cashflowFreq === 'monthly') {
         if (options.cashflowType === 'percentage') {
             mcf += (balance * (options.cashflow / 100)) / 12;
             balance += mcf;
         } else {
             mcf += options.cashflow;
             balance += (options.inflationModel === 'fixed' ? mcf * currentInflationAgg : mcf);
         }
      }

      // Handle annual
      if (m % 12 === 0) {
         if (options.cashflowType !== 'none' && (!options.cashflowFreq || options.cashflowFreq === 'annual')) {
             let acf = 0;
             if (options.spendingRule === 'rolling_avg') {
                 // Simplified rolling 3-year avg (or 1 year if earlier)
                 const pathLen = Math.min(3, path.length);
                 const sum = path.slice(-pathLen).reduce((a,b)=>a+b, 0);
                 acf = (sum / pathLen) * (options.cashflow / 100);
             } else {
                 if (options.cashflowType === 'percentage') {
                     acf = balance * (options.cashflow / 100);
                 } else {
                     acf = options.cashflow;
                 }
             }
             balance += (options.inflationModel === 'fixed' && options.cashflowType !== 'percentage' ? acf * currentInflationAgg : acf);
         }
         path.push(balance > 0 ? balance : 0);
      }

      if (balance <= 0) balance = 0;
    }
    paths.push(path);
  }

  return paths;


}
