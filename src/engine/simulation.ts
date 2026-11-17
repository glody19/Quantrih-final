import { MonthlyPrice } from './types';
import { boxMuller } from '../utils';

export interface SimulationOptions {
  model: 'Normal' | 'Bootstrap' | 'BlockBootstrap';
  horizonYears: number;
  simulations: number;
  initialBalance: number;
  cashflow: number;
  cashflowType?: 'none' | 'fixed' | 'percentage' | 'contribute';
  cashflowFreq?: 'annual' | 'monthly';
  spendingRule?: 'none' | 'rolling_avg' | 'geometric';
  sequenceOfReturnsYears?: number;
  inflationModel?: 'historical' | 'fixed';
  inflationRate?: number;
  blockSize?: number; // months for BlockBootstrap
  /** Fixed cashflows grow with inflation (inflationRate per year). */
  inflationIndexed?: boolean;
  /** How the weights are restored. Monthly is implied by the statistical (Normal) model. */
  rebalance?: 'monthly' | 'annual' | 'none';
  /** Annual fees (fund costs, advice), e.g. 0.005 for 0.5%. Taken monthly. */
  annualFee?: number;
  /** Tax on each year's investment gain (taxable account), e.g. 0.3. 0 = pre-tax. */
  taxRate?: number;
  /** When given, receives each path's annualized time-weighted return (flows excluded). */
  twrOut?: number[];
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

  const w = symbols.map(sym => (weights[sym] || 0) / 100);
  const wSum = w.reduce((a, b) => a + b, 0) || 1;
  const wn = w.map(x => x / wSum);
  const trackAssets = model !== 'Normal' && options.rebalance !== undefined && options.rebalance !== 'monthly';
  const fee = Math.max(0, options.annualFee || 0);
  const taxRate = Math.max(0, options.taxRate || 0);
  const infRate = options.inflationRate ?? 0.025;
  const indexed = options.inflationIndexed ?? options.inflationModel === 'fixed';
  // The cashflow amount is a size: its direction comes from cashflowType
  const amount = Math.abs(cashflow || 0);

  for (let s = 0; s < simulations; s++) {
    const rawReturns: number[] = [];
    const rawAsset: number[][] = [];

    // Step 1: Generate raw returns (per asset for the historical models)
    for (let m = 1; m <= horizonMonths; m++) {
      if (model === 'Normal') {
        rawReturns.push(portfolioMean + portfolioStdDev * boxMuller());
        rawAsset.push([]);
      } else {
        let row: number[];
        if (model === 'BlockBootstrap' && returnsMatrix.length > blockSize) {
          // A new random block starts every blockSize months
          if ((m - 1) % blockSize === 0) (rawAsset as any).blockStart = Math.floor(Math.random() * (returnsMatrix.length - blockSize));
          row = returnsMatrix[(rawAsset as any).blockStart + ((m - 1) % blockSize)];
        } else {
          row = returnsMatrix[Math.floor(Math.random() * returnsMatrix.length)];
        }
        rawAsset.push(row);
        rawReturns.push(row.reduce((acc, r, k) => acc + r * wn[k], 0));
      }
    }

    // Step 2: Sequence of returns risk: the worst years first
    if (options.sequenceOfReturnsYears && options.sequenceOfReturnsYears > 0) {
      const years = [];
      for (let y = 0; y < horizonYears; y++) {
        const a = y * 12;
        years.push({ idx: y, cmp: rawReturns.slice(a, a + 12).reduce((acc, r) => acc * (1 + r), 1) - 1 });
      }
      const worst = [...years].sort((a, b) => a.cmp - b.cmp).slice(0, options.sequenceOfReturnsYears).map(x => x.idx);
      const order = [...worst, ...years.map(x => x.idx).filter(y => !worst.includes(y))];
      const r2: number[] = [], a2: number[][] = [];
      for (const y of order) { r2.push(...rawReturns.slice(y * 12, y * 12 + 12)); a2.push(...rawAsset.slice(y * 12, y * 12 + 12)); }
      for (let k = 0; k < horizonMonths; k++) { rawReturns[k] = r2[k]; rawAsset[k] = a2[k]; }
    }

    // Step 3: Balance, fees, cashflows, taxes, rebalancing
    let holdings = wn.map(x => x * initialBalance);
    let balance = initialBalance;
    const path = [balance];
    let inflationIndex = 1;
    let yearGain = 0;
    let growth = 1; // compounded investment return, net of fees and taxes, flows excluded
    const scale = (f: number) => { holdings = holdings.map(h => h * f); };
    const setBalance = (b: number) => {
      b = Math.max(0, b);
      if (trackAssets) { if (balance > 0) scale(b / balance); else holdings = wn.map(x => x * b); }
      balance = b;
    };

    for (let m = 1; m <= horizonMonths; m++) {
      const before = balance;
      if (trackAssets) {
        const row = rawAsset[m - 1];
        holdings = holdings.map((h, k) => h * (1 + row[k]));
        balance = holdings.reduce((a, b) => a + b, 0);
      } else {
        balance *= 1 + rawReturns[m - 1];
      }
      yearGain += balance - before;
      if (before > 0) growth *= balance / before;
      if (fee > 0) { setBalance(balance * (1 - fee / 12)); growth *= 1 - fee / 12; }
      inflationIndex *= Math.pow(1 + infRate, 1 / 12);

      const flow = (yearly: boolean) => {
        if (options.cashflowType === 'none' || !options.cashflowType || amount === 0) return;
        let cf: number;
        if (options.cashflowType === 'percentage') {
          if (yearly && options.spendingRule === 'rolling_avg') {
            const n = Math.min(3, path.length);
            cf = (path.slice(-n).reduce((a, b) => a + b, 0) / n) * (amount / 100);
          } else {
            cf = balance * (amount / 100) / (yearly ? 1 : 12);
          }
        } else {
          cf = amount * (indexed ? inflationIndex : 1);
        }
        setBalance(options.cashflowType === 'contribute' ? balance + cf : balance - cf);
      };
      if (options.cashflowFreq === 'monthly') flow(false);

      if (m % 12 === 0) {
        if (taxRate > 0 && yearGain > 0 && balance > 0) {
          const after = balance - yearGain * taxRate;
          growth *= Math.max(0, after) / balance;
          setBalance(after);
        }
        yearGain = 0;
        if (!options.cashflowFreq || options.cashflowFreq === 'annual') flow(true);
        if (trackAssets && options.rebalance === 'annual') holdings = wn.map(x => x * balance);
        path.push(balance);
      }
    }
    paths.push(path);
    if (options.twrOut) options.twrOut.push(Math.pow(Math.max(growth, 0), 1 / Math.max(horizonYears, 1)) - 1);
  }

  return paths;


}
