import { Portfolio, MonthlyPrice, AssetAllocation, TacticalModel } from './types';

export function evaluateTacticalModel(
  portfolio: Portfolio,
  currentMonthIndex: number,
  allCommonMonths: string[], // e.g. ["2010-01", "2010-02", ...]
  pricesBySymbol: Map<string, MonthlyPrice[]>
): AssetAllocation[] {
  const model = portfolio.tacticalModel;
  // Def fallback is just the original static allocations
  if (!model) return portfolio.allocations;

  const currentMonthDate = allCommonMonths[currentMonthIndex];

  // Helper to get price of a symbol N months ago
  const getPrice = (symbol: string, monthsAgo: number): number | null => {
    if (currentMonthIndex - monthsAgo < 0) return null;
    const targetMonth = allCommonMonths[currentMonthIndex - monthsAgo];
    const prices = pricesBySymbol.get(symbol) || [];
    const p = prices.find(x => x.normalizedDate === targetMonth);
    return p ? p.close : null;
  };

  const getMomentum = (symbol: string, lookback: number): number | null => {
    const currentPrice = getPrice(symbol, 0);
    const oldPrice = getPrice(symbol, lookback);
    if (currentPrice === null || oldPrice === null || oldPrice === 0) return null;
    return (currentPrice / oldPrice) - 1;
  };

  // Safe asset fallback if all risky assets fail
  const fallbackSafe = (safeAsset: string) => [{ symbol: safeAsset, weight: 1 }];

  if (model.type === 'moving_average') {
    // Single or Portfolio... If it's a MA model, usually it applies independently to each asset:
    // If Asset Price > MA(N) -> Weight = original weight. If < MA(N) -> Weight = 0 (moves to safe asset).
    // Or if there's only 1 asset (single), 100% to Asset or 100% to Safe.
    const allocations: AssetAllocation[] = [];
    let safeWeight = 0;

    for (const alloc of portfolio.allocations) {
       // Only process non-safe assets usually, but here we process all defined in `allocations`
       if (alloc.symbol === model.safeAsset) continue;

       const currentPrice = getPrice(alloc.symbol, 0);
       let sum = 0;
       let count = 0;
       for (let i = 0; i < model.movingAverageMonths; i++) {
          const p = getPrice(alloc.symbol, i);
          if (p !== null) { sum += p; count++; }
       }
       
       if (count < model.movingAverageMonths || currentPrice === null) {
          allocations.push({ symbol: alloc.symbol, weight: alloc.weight }); // not enough data, keep original
       } else {
          const ma = sum / count;
          if (currentPrice > ma) {
            allocations.push({ symbol: alloc.symbol, weight: alloc.weight });
          } else {
            // Allocate to safe asset instead
            safeWeight += alloc.weight;
          }
       }
    }
    
    // Add safe asset weight
    if (safeWeight > 0 || allocations.length === 0) {
       allocations.push({ symbol: model.safeAsset, weight: safeWeight + (allocations.length === 0 ? 1 : 0) });
    }
    
    // Merge weights for the same symbol just in case safe asset was already in allocations
    return mergeAllocations(allocations);
  }

  if (model.type === 'relative_momentum') {
    // Rank all `portfolio.allocations` by lookback momentum, pick Top K and equal weight them
    const momData = portfolio.allocations.map(a => {
        return { symbol: a.symbol, mom: getMomentum(a.symbol, model.lookbackMonths) ?? -Infinity };
    });
    momData.sort((a, b) => b.mom - a.mom);
    
    const topK = momData.slice(0, model.topK);
    const weightPerAsset = 1 / topK.length;
    return topK.map(t => ({ symbol: t.symbol, weight: weightPerAsset }));
  }

  if (model.type === 'dual_momentum') {
    // Global equities vs bonds vs safe. 
    // Usually: Rank Equities. Best equity > Safe Asset ? Best Equity : Safe Asset.
    const momData = portfolio.allocations.filter(a => a.symbol !== model.safeAsset).map(a => {
        return { symbol: a.symbol, mom: getMomentum(a.symbol, model.lookbackMonths) ?? -Infinity };
    });
    momData.sort((a, b) => b.mom - a.mom);
    const safeMom = getMomentum(model.safeAsset, model.lookbackMonths) ?? 0;
    
    const best = momData[0];
    if (!best || best.mom < safeMom) {
       return [{ symbol: model.safeAsset, weight: 1 }];
    } else {
       return [{ symbol: best.symbol, weight: 1 }];
    }
  }

  if (model.type === 'adaptive_allocation') {
     // Momentum + Volatility scaling.
     // Top half by momentum, inverse volatility weighted.
     const momData = portfolio.allocations.map(a => {
        return { symbol: a.symbol, mom: getMomentum(a.symbol, model.lookbackMonths) ?? -Infinity };
     });
     momData.sort((a, b) => b.mom - a.mom);
     
     // Select top 50% max (at least 1)
     const topK = Math.max(1, Math.floor(portfolio.allocations.length / 2));
     const selected = momData.slice(0, topK);

     // Calculate inverse volatility (simplified to stdev of last `volatilityMonths`)
     const getAssetVol = (symbol: string) => {
         const rets = [];
         for (let i = 0; i < model.volatilityMonths; i++) {
             const m = getMomentum(symbol, i + 1);
             const p_m = getMomentum(symbol, i);
             // Return of that month is price(i) / price(i+1) - 1 ... wait, getMomentum is current vs lookback.
             const curr = getPrice(symbol, i);
             const prev = getPrice(symbol, i+1);
             if (curr !== null && prev !== null && prev > 0) rets.push(curr / prev - 1);
         }
         if (rets.length < 2) return 1;
         const mean = rets.reduce((a,b)=>a+b,0)/rets.length;
         const variance = rets.reduce((a,b)=>a + Math.pow(b-mean, 2), 0) / (rets.length - 1);
         return Math.sqrt(variance) || 0.0001; // Avoid divide by zero
     };

     let sumInvVol = 0;
     const withInvVol = selected.map(s => {
         const vol = getAssetVol(s.symbol);
         const invVol = 1 / vol;
         sumInvVol += invVol;
         return { symbol: s.symbol, invVol };
     });

     return withInvVol.map(s => ({ symbol: s.symbol, weight: s.invVol / sumInvVol }));
  }
  
  if (model.type === 'target_volatility') {
      const getAssetVol = (symbol: string) => {
          const rets = [];
          for (let i = 0; i < model.lookbackMonths; i++) {
              const curr = getPrice(symbol, i);
              const prev = getPrice(symbol, i+1);
              if (curr !== null && prev !== null && prev > 0) rets.push(curr / prev - 1);
          }
          if (rets.length < 2) return 1;
          const mean = rets.reduce((a,b)=>a+b,0)/rets.length;
          const variance = rets.reduce((a,b)=>a + Math.pow(b-mean, 2), 0) / (rets.length - 1);
          // Scale to annualized
          return Math.sqrt(variance) * Math.sqrt(12) || 0.0001; 
      };

      const results = [];
      let safeWeight = 0;

      for (const alloc of portfolio.allocations) {
         if (alloc.symbol === model.safeAsset) continue;
         const annVol = getAssetVol(alloc.symbol);
         
         // e.g. target 10% (0.1), real vol is 15% (0.15). weight = 0.1 / 0.15 = 0.66
         let targetW = model.targetVolatility / annVol;
         if (targetW > 1) targetW = 1; // Unlevered target vol limits exposure to 100%
         
         results.push({ symbol: alloc.symbol, weight: alloc.weight * targetW });
         safeWeight += alloc.weight * (1 - targetW);
      }

      if (safeWeight > 0 || results.length === 0) {
         results.push({ symbol: model.safeAsset, weight: safeWeight + (results.length === 0 ? 1 : 0) });
      }

      return mergeAllocations(results);
  }

  if (model.type === 'pe10') {
      // Mock valuation: Sine wave between -10% out of bonds into equities to +10% over/under valuation
      // In real life we'd load Multpl dataset or similar.
      const pseudoPE = 20 + Math.sin(currentMonthIndex / 24) * 10; // varies 10 to 30 over cycles
      const eqWeight = pseudoPE < 15 ? 0.7 : (pseudoPE > 25 ? 0.4 : 0.6); // Cheap -> increase equity, Expensive -> decrease
      const valAllocs = [];
      valAllocs.push({ symbol: model.baselineEquity, weight: eqWeight });
      valAllocs.push({ symbol: model.baselineBond, weight: 1 - eqWeight });
      return valAllocs;
  }

  // Fallback
  return portfolio.allocations;
}

function mergeAllocations(allocs: AssetAllocation[]): AssetAllocation[] {
    const map = new Map<string, number>();
    for (const a of allocs) map.set(a.symbol, (map.get(a.symbol) || 0) + a.weight);
    return Array.from(map.entries()).map(([symbol, weight]) => ({ symbol, weight }));
}
