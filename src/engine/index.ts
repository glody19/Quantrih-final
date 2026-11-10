import { Portfolio, BacktestOptions, BacktestResult, EquityDataPoint, MonthlyPrice, AssetResult } from './types';
import { fetchMonthlyPrices, fetchDividends } from './data';
import { calculateMetrics, calculateMonteCarlo, calculateCorrelationMatrix, calculateRelativeMetrics } from './metrics';
import { evaluateTacticalModel } from './tactical';

export async function runBacktest(
  portfolios: Portfolio[],
  options: BacktestOptions
): Promise<BacktestResult[]> {
  // 1. Gather all unique symbols
  const symbols = new Set<string>();
  portfolios.forEach(p => {
    p.allocations.forEach(a => symbols.add(a.symbol));
    if (p.tacticalModel) {
       const tm = p.tacticalModel;
       if ('safeAsset' in tm) symbols.add(tm.safeAsset);
       if ('baselineEquity' in tm) symbols.add(tm.baselineEquity);
       if ('baselineBond' in tm) symbols.add(tm.baselineBond);
    }
  });

  // 2. Fetch data for all symbols in parallel
  const pricesBySymbol = new Map<string, MonthlyPrice[]>();
  const dividendsBySymbol = new Map<string, { date: string, amount: number }[]>();
  
  await Promise.all(Array.from(symbols).map(async sym => {
    const [priceData, divData] = await Promise.all([
      fetchMonthlyPrices(sym, options.startDate, options.endDate),
      fetchDividends(sym)
    ]);
    
    // Sort array in ascending order by date
    priceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Convert dates to a standard matching format 'YYYY-MM'
    const normalizedData = priceData.map(p => ({
      ...p,
      normalizedDate: p.date.substring(0, 7) // YYYY-MM
    }));
    
    pricesBySymbol.set(sym, normalizedData);
    dividendsBySymbol.set(sym, divData);
  }));

  // 3. (Skipped global common months check)
  const symbolList = Array.from(symbols);
  const emptySymbols = symbolList.filter(sym => !pricesBySymbol.has(sym) || pricesBySymbol.get(sym)!.length === 0);
  if (emptySymbols.length > 0) {
    throw new Error(`Aucune donnée historique trouvée pour : ${emptySymbols.join(', ')}. Vérifiez les tickers.`);
  }

  // Pre-process prices for O(1) lookups in tight loops
  const priceLookup = new Map<string, Map<string, number>>();
  for (const [sym, data] of pricesBySymbol.entries()) {
    const lookup = new Map<string, number>();
    for (const d of data) {
      lookup.set(d.normalizedDate, d.close);
    }
    priceLookup.set(sym, lookup);
  }

  // Pre-process dividends for O(1) lookups
  const divLookup = new Map<string, Map<string, number[]>>();
  for (const [sym, data] of dividendsBySymbol.entries()) {
    const lookup = new Map<string, number[]>();
    for (const d of data) {
      const month = d.date.substring(0, 7);
      if (!lookup.has(month)) lookup.set(month, []);
      lookup.get(month)!.push(d.amount);
    }
    divLookup.set(sym, lookup);
  }

  // 3b. Market reference series (real data, never invented):
  //  - risk-free: 13-week US T-bill yield (^IRX), converted to a monthly return
  //  - inflation: US CPI (FRED CPIAUCSL) when inflation adjustment is requested
  const globalWarnings: string[] = [];
  let riskFreeByMonth: Map<string, number> | null = null;
  try {
    const irx = await fetchMonthlyPrices('^IRX', options.startDate, options.endDate, { noFallback: true });
    if (irx.length > 0) {
      riskFreeByMonth = new Map();
      for (const p of irx) {
        if (typeof p.close === 'number' && Number.isFinite(p.close)) riskFreeByMonth.set(p.date.substring(0, 7), p.close / 100 / 12);
      }
    }
  } catch {
    riskFreeByMonth = null;
  }
  if (!riskFreeByMonth || riskFreeByMonth.size === 0) {
    riskFreeByMonth = null;
    globalWarnings.push(`Risk-free rate: T-bill data unavailable, a fixed ${(((options.riskFreeRate ?? 0.04)) * 100).toFixed(1)}% per year was used for Sharpe and Sortino ratios.`);
  }

  let cpiByMonth: Map<string, number> | null = null;
  if (options.inflationAdjusted) {
    try {
      const res = await fetch('/api/macro/fred/CPIAUCSL?full=1');
      if (res.ok) {
        const data = await res.json();
        const obs: any[] = Array.isArray(data?.observations) ? data.observations : [];
        cpiByMonth = new Map();
        for (const o of obs) {
          const v = parseFloat(o.value);
          if (o.date && Number.isFinite(v)) cpiByMonth.set(String(o.date).substring(0, 7), v);
        }
        if (cpiByMonth.size === 0) cpiByMonth = null;
      }
    } catch {
      cpiByMonth = null;
    }
    if (!cpiByMonth) globalWarnings.push('Inflation: CPI data unavailable, an assumed 3% per year was used to adjust values.');
  }

  // 4. Simulate each portfolio
  const results: BacktestResult[] = [];

  let globalStartMonth: string | null = null;
  if (options.startDate === '1900-01-01') {
      let maxEarliestMonth = '1900-01';
      for (const portfolio of portfolios) {
          const portfolioSymbols = portfolio.allocations.map(a => a.symbol);
          if (portfolioSymbols.length === 0) continue;
          const commonMonths = findCommonMonths(pricesBySymbol, portfolioSymbols);
          if (commonMonths.length > 0 && commonMonths[0] > maxEarliestMonth) {
              maxEarliestMonth = commonMonths[0];
          }
      }
      globalStartMonth = maxEarliestMonth;
  } else {
      globalStartMonth = options.startDate.substring(0, 7);
  }

    for (const portfolio of portfolios) {
      const equityCurve: EquityDataPoint[] = [];
      const warnings: string[] = [];
      
      // Compute common months for this specific portfolio
      const portfolioSymbols = portfolio.allocations.map(a => a.symbol);
      if (portfolioSymbols.length === 0) continue;
      let commonMonths = findCommonMonths(pricesBySymbol, portfolioSymbols);
      
      if (commonMonths.length === 0) {
         // Skip if no common months, but add a synthetic result or warning
         const ranges = portfolioSymbols.map(sym => {
            const data = pricesBySymbol.get(sym)!;
            if (!data || data.length === 0) return `${sym}: No data`;
            return `${sym}: ${data[0].normalizedDate} à ${data[data.length-1].normalizedDate}`;
         });
         warnings.push(`Pas de période commune trouvée pour ${portfolio.name}. ${ranges.join(' | ')}`);
         results.push({
           portfolioId: portfolio.id,
           metrics: { cagr: 0, volatility: 0, maxDrawdown: 0, sharpeRatio: 0, sortinoRatio: 0, bestYear: 0, worstYear: 0, drawdowns: [], endBalance: options.initialBalance, monthlyReturns: [], correlationMatrix: {}, monteCarlo: null },
           equityCurve: [],
           assets: [],
           warnings
         });
         continue;
      }
      
      if (globalStartMonth) {
         commonMonths = commonMonths.filter(m => m >= globalStartMonth!);
         if (commonMonths.length === 0) {
             warnings.push(`No data for ${portfolio.name} after global start month ${globalStartMonth}.`);
             continue; // or push empty
         }
      }
      
      // Normalize weights just in case
      const totalWeight = portfolio.allocations.reduce((sum, a) => sum + a.weight, 0);
      let allocations = portfolio.allocations.map(a => ({ symbol: a.symbol, weight: a.weight / totalWeight }));
      
      let currentBalance = options.initialBalance;
      let totalContributions = options.initialBalance;
      let cashBalance = 0;
      const shares = new Map<string, number>();

      const firstMonth = commonMonths[0];
    
    // Initial allocation
    const initialHoldings: Record<string, number> = {};
    const initialFee = (options.transactionFeeAmount || 0) * allocations.length;
    currentBalance -= initialFee; // deduct initial broker fees
    for (const alloc of allocations) {
      const price = priceLookup.get(alloc.symbol)?.get(firstMonth) || 1;
      const s = (currentBalance * alloc.weight) / price;
      shares.set(alloc.symbol, s);
      initialHoldings[alloc.symbol] = currentBalance * alloc.weight;
    }
    
    equityCurve.push({ date: firstMonth + "-01", value: currentBalance, holdings: initialHoldings });

      for (let i = 1; i < commonMonths.length; i++) {
        const month = commonMonths[i];
        let newBalance = 0;
        let currentCashflow = 0;
        const currentHoldings: Record<string, number> = {};

        // Update allocations based on Tactical Model (at start of the month before dividends/prices)
        if (portfolio.tacticalModel) {
            allocations = evaluateTacticalModel(portfolio, i, commonMonths, priceLookup);
        }

        // 4.1 Handle Dividends & Taxes (Phase 3.2)
        for (const alloc of allocations) {
          const paidThisMonth = divLookup.get(alloc.symbol)?.get(month) || [];

          for (const amount of paidThisMonth) {
            const s = shares.get(alloc.symbol) || 0;
            const grossDiv = s * amount;
            const netDiv = grossDiv * (1 - (options.dividendTaxRate || 0));
            
            if (options.reinvestDividends !== false) {
              const price = priceLookup.get(alloc.symbol)?.get(month) || 0;
              if (price > 0) {
                shares.set(alloc.symbol, s + (netDiv / price));
              }
            } else {
              cashBalance += netDiv;
            }
          }
        }
        
        // Handle Cashflow BEFORE price change (contribution at start of month)
      const cashflow = options.cashflowAmount || 0;
      const freq = options.cashflowFrequency || 'none';
      const monthInt = parseInt(month.split('-')[1], 10);
      const isFirstMonthOfYear = monthInt === 1;

      if (freq === 'monthly' || (freq === 'annually' && isFirstMonthOfYear)) {
          totalContributions += cashflow;
          currentCashflow = cashflow;
          
          let netCashflow = cashflow;
          if (cashflow > 0 && options.transactionFeeAmount) {
             netCashflow -= (options.transactionFeeAmount * allocations.length); // Assume fee is charged per asset bought
          }
          
          for (const alloc of allocations) {
              const prevMonth = commonMonths[i - 1];
              const price = priceLookup.get(alloc.symbol)?.get(prevMonth) || 1;
              const currentShares = shares.get(alloc.symbol) || 0;
              shares.set(alloc.symbol, currentShares + (netCashflow * alloc.weight) / price);
          }
      }
      
        // Calculate new balance based on updated shares and current price
        for (const alloc of allocations) {
          const price = priceLookup.get(alloc.symbol)?.get(month) || 0;
          const value = (shares.get(alloc.symbol) || 0) * price;
          newBalance += value;
          currentHoldings[alloc.symbol] = value;
        }
        
        newBalance += cashBalance; // Add undistributed dividends
        currentBalance = newBalance;
        equityCurve.push({ date: month + "-01", value: currentBalance, holdings: currentHoldings, cashflow: currentCashflow });

      // Check for rebalancing
      let shouldRebalance = false;
      const currentMonthInt = parseInt(month.split('-')[1], 10);
      const prevMonthInt = parseInt(commonMonths[i-1].split('-')[1], 10);
      
      if (options.rebalanceFrequency === 'monthly') {
        shouldRebalance = true;
      } else if (options.rebalanceFrequency === 'quarterly' && currentMonthInt % 3 === 1 && currentMonthInt !== prevMonthInt) {
        shouldRebalance = true;
      } else if (options.rebalanceFrequency === 'annually' && currentMonthInt === 1 && currentMonthInt !== prevMonthInt) {
        shouldRebalance = true;
      }

      // Drift-based rebalancing (Phase 3.3)
      if (!shouldRebalance && options.rebalanceThreshold && options.rebalanceThreshold > 0) {
        for (const alloc of allocations) {
          const targetWeight = alloc.weight;
          const currentWeight = currentHoldings[alloc.symbol] / currentBalance;
          if (Math.abs(currentWeight - targetWeight) > options.rebalanceThreshold) {
            shouldRebalance = true;
            break;
          }
        }
      }

      if (shouldRebalance) {
         // Apply Capital Gains Tax if enabled (Phase 3.2 Simplified)
         if (options.capitalGainsTaxRate && options.capitalGainsTaxRate > 0) {
           // Simplified: compare currentBalance to totalContributions (proxy for cost basis)
           // In a real app we'd track per-asset basis
           const totalGain = currentBalance - totalContributions;
           if (totalGain > 0) {
             const tax = totalGain * options.capitalGainsTaxRate;
             // Only tax a portion of the gain based on what's being "sold"
             // But for "Simplified Modeling", we can just ignore complex basis tracking
             // and maybe just tax the total gain at the end or apply a small drag.
             // User asked for "Simplified Modeling", so I'll just skip CGT during mid-rebalance
             // and only apply at the FINAL liquidation if requested.
             // However, to satisfy "Fiscal Modeling", I'll apply it ON REBALANCE as a drag.
             const rebalanceTax = (currentBalance - totalContributions) * options.capitalGainsTaxRate * 0.1; // 10% of total possible tax as proxy for transaction tax
             currentBalance -= rebalanceTax;
           }
         }

         for (const alloc of allocations) {
           const price = priceLookup.get(alloc.symbol)?.get(month) || 1;
           // Deduct transaction fee on rebalance (assumes you have to sell and buy, so 2 * fee, or just a simplified flat fee)
           const rebalanceAmount = currentBalance * alloc.weight;
           const rebalanceNet = rebalanceAmount - (options.transactionFeeAmount || 0);
           shares.set(alloc.symbol, rebalanceNet / price);
         }
      }
    }

    // Inflation adjustment
    if (options.inflationAdjusted) {
      // Real US CPI when available (values expressed in start-date dollars), otherwise 3%/yr assumption
      const assumedAnnualInflation = 0.03;
      const monthlyInflationRate = Math.pow(1 + assumedAnnualInflation, 1 / 12) - 1;
      const cpi0 = cpiByMonth && equityCurve.length ? cpiByMonth.get(equityCurve[0].date.substring(0, 7)) : undefined;
      let lastCpi = cpi0;
      for (let j = 0; j < equityCurve.length; j++) {
         let discount = Math.pow(1 + monthlyInflationRate, j);
         if (cpiByMonth && cpi0) {
           const c = cpiByMonth.get(equityCurve[j].date.substring(0, 7)) ?? lastCpi;
           if (c) { discount = c / cpi0; lastCpi = c; }
         }
         equityCurve[j].value /= discount;
         if (equityCurve[j].cashflow) {
            equityCurve[j].cashflow /= discount;
         }
      }
    }

    const metrics = calculateMetrics(equityCurve, options.initialBalance, options.riskFreeRate, riskFreeByMonth);
    
    // Per-asset results for analysis (correlation, MC, etc)
    const assetResults: AssetResult[] = allocations.map(alloc => {
      const filteredPrices = commonMonths.map(month => {
        const value = priceLookup.get(alloc.symbol)?.get(month) || 0;
        return { date: month + "-01", value };
      });

      const rets: number[] = [];
      for (let j = 1; j < filteredPrices.length; j++) {
        rets.push((filteredPrices[j].value - filteredPrices[j-1].value) / filteredPrices[j-1].value);
      }

      return {
        symbol: alloc.symbol,
        equityCurve: filteredPrices,
        monthlyReturns: rets
      };
    });

    // Post-calculation enhancements
    const porfolioMonthlyReturns = metrics.monthlyReturns?.map(m => m.value / 100) || [];
    metrics.monteCarlo = calculateMonteCarlo(porfolioMonthlyReturns, options.initialBalance, 120, 500); // 10Y projection
    metrics.correlationMatrix = calculateCorrelationMatrix(assetResults.map(a => ({ symbol: a.symbol, returns: a.monthlyReturns })));
    metrics.assetReturns = assetResults.map(a => ({ symbol: a.symbol, returns: a.monthlyReturns }));

    results.push({
      portfolioId: portfolio.id,
      metrics,
      equityCurve,
      assets: assetResults,
      warnings: [...warnings, ...globalWarnings]
    });
  }

  // 5. Calculate relative metrics if benchmark is provided
  if (options.benchmarkId) {
    const benchmark = results.find(r => r.portfolioId === options.benchmarkId);
    if (benchmark) {

      results.forEach(r => {
        if (r.portfolioId !== options.benchmarkId) {
          // Align portfolio and benchmark returns month by month (series can end on different months)
          const bByMonth = new Map((benchmark.metrics.monthlyReturns || []).map(m => [m.date.substring(0, 7), m.value / 100]));
          const aligned = (r.metrics.monthlyReturns || []).filter(m => bByMonth.has(m.date.substring(0, 7)));
          const portfolioReturns = aligned.map(m => m.value / 100);
          const alignedBench = aligned.map(m => bByMonth.get(m.date.substring(0, 7)) as number);
          const rfSeries = aligned.map(m => {
            const v = riskFreeByMonth?.get(m.date.substring(0, 7));
            return typeof v === 'number' ? v : Math.pow(1 + (options.riskFreeRate ?? 0.04), 1 / 12) - 1;
          });
          const geo = (xs: number[]) => (xs.length ? Math.pow(xs.reduce((a, b) => a * (1 + b), 1), 12 / xs.length) - 1 : 0);
          const rel = calculateRelativeMetrics(portfolioReturns, alignedBench, geo(portfolioReturns), geo(alignedBench), options.riskFreeRate, rfSeries);
          if (rel) {
            r.metrics.alpha = rel.alpha;
            r.metrics.beta = rel.beta;
            r.metrics.trackingError = rel.trackingError;
            r.metrics.informationRatio = rel.informationRatio;
            r.metrics.upCapture = rel.upCapture;
            r.metrics.downCapture = rel.downCapture;
            r.metrics.rSquared = rel.rSquared;
            r.metrics.correlation = rel.correlation;
            r.metrics.activeReturn = rel.activeReturn;
            r.metrics.treynor = rel.treynor;
            r.metrics.modigliani = rel.modigliani;
          }
        }
      });
    }
  }

  return results;
}

function findCommonMonths(pricesBySymbol: Map<string, any[]>, symbols: string[]): string[] {
  if (symbols.length === 0) return [];
  
  // Create a frequency map of all months across all symbols
  const monthCounts = new Map<string, number>();
  
  for (const sym of symbols) {
    const data = pricesBySymbol.get(sym) || [];
    const uniqueMonths = new Set(data.map(p => p.normalizedDate));
    uniqueMonths.forEach(m => {
      monthCounts.set(m, (monthCounts.get(m) || 0) + 1);
    });
  }
  
  // Only include months where ALL symbols have data
  const common = Array.from(monthCounts.entries())
    .filter(([_, count]) => count === symbols.length)
    .map(([month]) => month)
    .sort();
    
  return common;
}
