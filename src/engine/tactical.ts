import { Portfolio, MonthlyPrice, AssetAllocation, TacticalModel } from './types';

export function evaluateTacticalModel(
  portfolio: Portfolio,
  currentMonthIndex: number,
  allCommonMonths: string[], // e.g. ["2010-01", "2010-02", ...]
  priceLookup: Map<string, Map<string, number>>
): AssetAllocation[] {
  const model = portfolio.tacticalModel;
  // Def fallback is just the original static allocations
  if (!model) return portfolio.allocations;

  const currentMonthDate = allCommonMonths[currentMonthIndex];

  // Helper to get price of a symbol N months ago
  const getPrice = (symbol: string, monthsAgo: number): number | null => {
    if (currentMonthIndex - monthsAgo < 0) return null;
    const targetMonth = allCommonMonths[currentMonthIndex - monthsAgo];
    const price = priceLookup.get(symbol)?.get(targetMonth);
    return price ?? null;
  };

  const getMomentum = (symbol: string, lookback: number): number | null => {
    const currentPrice = getPrice(symbol, 0);
    const oldPrice = getPrice(symbol, lookback);
    if (currentPrice === null || oldPrice === null || oldPrice === 0) return null;
    return (currentPrice / oldPrice) - 1;
  };

  // Safe asset fallback if all risky assets fail
  const fallbackSafe = (safeAsset: string) => [{ symbol: safeAsset, weight: 1 }];

  // Momentum with the model options: skipped recent months and multi-period average (1, 3, 6, 12 months)
  const mom = (symbol: string, lookback: number): number | null => {
    const m: any = model;
    const skip = Math.max(0, Number(m.skipMonths) || 0);
    const one = (L: number) => {
      const cur = getPrice(symbol, skip);
      const old = getPrice(symbol, skip + L);
      return cur === null || old === null || old === 0 ? null : cur / old - 1;
    };
    if (m.multiPeriod) {
      const vals = [1, 3, 6, 12].map(one).filter((v): v is number => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    return one(lookback);
  };

  // Monthly returns of the last `months` months (most recent first)
  const monthlyReturns = (symbol: string, months: number): number[] => {
    const rets: number[] = [];
    for (let i = 0; i < months; i++) {
      const curr = getPrice(symbol, i);
      const prev = getPrice(symbol, i + 1);
      if (curr !== null && prev !== null && prev > 0) rets.push(curr / prev - 1);
    }
    return rets;
  };
  const stdev = (rets: number[]) => {
    if (rets.length < 2) return 1;
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    return Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)) || 0.0001;
  };
  const inverseVolWeights = (syms: string[], months: number) => {
    const inv = syms.map(sym => 1 / stdev(monthlyReturns(sym, months)));
    const tot = inv.reduce((a, b) => a + b, 0) || 1;
    return syms.map((symbol, i) => ({ symbol, weight: inv[i] / tot }));
  };

  if (model.type === 'seasonal') {
    // Out of the market from the start month (included) to the re-entry month (excluded), e.g. May to October.
    const month = Number(currentMonthDate.substring(5, 7));
    const start = model.outOfMarketStartMonth, end = model.outOfMarketEndMonth;
    const out = start === end ? false : start < end ? month >= start && month < end : month >= start || month < end;
    return out ? fallbackSafe(model.safeAsset) : portfolio.allocations;
  }

  if (model.type === 'moving_average') {
    // Single or Portfolio... If it's a MA model, usually it applies independently to each asset:
    // If Asset Price > MA(N) -> Weight = original weight. If < MA(N) -> Weight = 0 (moves to safe asset).
    // Or if there's only 1 asset (single), 100% to Asset or 100% to Safe.
    const allocations: AssetAllocation[] = [];
    let safeWeight = 0;

    // Signal asset: one in/out decision for the whole portfolio, read on another asset (e.g. the S&P 500)
    const signal = model.signalSymbol && model.signalSymbol !== 'same' ? model.signalSymbol : null;

    for (const alloc of portfolio.allocations) {
       // Only process non-safe assets usually, but here we process all defined in `allocations`
       if (alloc.symbol === model.safeAsset) continue;

       const sigSym = signal || alloc.symbol;
       const currentPrice = getPrice(sigSym, 0);
       const n = model.movingAverageMonths;
       let count = 0;
       let ma = 0;
       if (model.maType === 'ema') {
          // Exponential average over up to 3N months, seeded with the oldest price, alpha = 2 / (N + 1)
          const alpha = 2 / (n + 1);
          let ema: number | null = null;
          for (let i = Math.min(3 * n, currentMonthIndex); i >= 0; i--) {
             const p = getPrice(sigSym, i);
             if (p === null) continue;
             ema = ema === null ? p : alpha * p + (1 - alpha) * ema;
             count++;
          }
          ma = ema ?? 0;
       } else {
          let sum = 0;
          for (let i = 0; i < n; i++) {
             const p = getPrice(sigSym, i);
             if (p !== null) { sum += p; count++; }
          }
          ma = count ? sum / count : 0;
       }

       if (count < n || currentPrice === null) {
          allocations.push({ symbol: alloc.symbol, weight: alloc.weight }); // not enough data, keep original
       } else {
          const inMarket = model.buySignal === 'gte' ? currentPrice >= ma : currentPrice > ma;
          if (inMarket) {
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
    const momData = portfolio.allocations.filter(a => a.symbol !== model.safeAsset).map(a => {
        return { symbol: a.symbol, mom: mom(a.symbol, model.lookbackMonths) ?? -Infinity };
    });
    momData.sort((a, b) => b.mom - a.mom);

    const topK = momData.slice(0, Math.max(1, model.topK));
    const base = model.weighting === 'inverse_vol'
      ? inverseVolWeights(topK.map(t => t.symbol), model.volatilityMonths || 3)
      : topK.map(t => ({ symbol: t.symbol, weight: 1 / topK.length }));
    if (model.absoluteMomentum && model.safeAsset) {
      // Absolute momentum filter: a selected asset that did not beat the safe asset over the
      // lookback hands its share to the safe asset.
      const safeMom = mom(model.safeAsset, model.lookbackMonths) ?? 0;
      return mergeAllocations(base.map((b, i) => ({ symbol: topK[i].mom > safeMom ? b.symbol : model.safeAsset!, weight: b.weight })));
    }
    return base;
  }

  if (model.type === 'dual_momentum') {
    // Global equities vs bonds vs safe. 
    // Usually: Rank Equities. Best equity > Safe Asset ? Best Equity : Safe Asset.
    const momData = portfolio.allocations.filter(a => a.symbol !== model.safeAsset).map(a => {
        return { symbol: a.symbol, mom: mom(a.symbol, model.lookbackMonths) ?? -Infinity };
    });
    momData.sort((a, b) => b.mom - a.mom);
    const safeMom = mom(model.safeAsset, model.lookbackMonths) ?? 0;
    
    const best = momData[0];
    if (!best || best.mom < safeMom) {
       return [{ symbol: model.safeAsset, weight: 1 }];
    } else {
       return [{ symbol: best.symbol, weight: 1 }];
    }
  }

  if (model.type === 'adaptive_allocation') {
     // Keep the best half by momentum (or topK), then weight by risk parity (inverse volatility)
     // or minimum variance over the volatility window.
     const ranked = portfolio.allocations.filter(a => a.symbol !== model.safeAsset)
       .map(a => ({ symbol: a.symbol, mom: mom(a.symbol, model.lookbackMonths) ?? -Infinity }))
       .sort((a, b) => b.mom - a.mom);
     const k = Math.max(1, model.topK || Math.floor(ranked.length / 2));
     let selected = ranked.slice(0, k);
     if (model.safeAsset) {
       // Absolute filter when a safe asset is set: only assets with positive momentum stay
       const kept = selected.filter(s => s.mom > 0);
       if (kept.length === 0) return fallbackSafe(model.safeAsset);
       const safeShare = 1 - kept.length / selected.length;
       const w = weightAssets(kept.map(s => s.symbol));
       const out = w.map(x => ({ symbol: x.symbol, weight: x.weight * (1 - safeShare) }));
       if (safeShare > 0) out.push({ symbol: model.safeAsset, weight: safeShare });
       return mergeAllocations(out);
     }
     return weightAssets(selected.map(s => s.symbol));

     function weightAssets(syms: string[]): AssetAllocation[] {
       const months = Math.max(2, model.type === 'adaptive_allocation' ? model.volatilityMonths : 3);
       if (model.type === 'adaptive_allocation' && model.weighting === 'min_variance' && syms.length > 1) {
         const w = minVarianceWeights(syms.map(sym => monthlyReturns(sym, months)));
         if (w) return syms.map((symbol, i) => ({ symbol, weight: w[i] }));
       }
       return inverseVolWeights(syms, months);
     }
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

/**
 * Long-only minimum variance weights: w proportional to inverse(covariance) x 1, negatives set to 0.
 * Returns null when the covariance cannot be inverted.
 */
export function minVarianceWeights(returns: number[][]): number[] | null {
  const n = returns.length;
  const len = Math.min(...returns.map(r => r.length));
  if (len < 2) return null;
  const rs = returns.map(r => r.slice(0, len));
  const means = rs.map(r => r.reduce((a, b) => a + b, 0) / len);
  const cov = rs.map((ri, i) => rs.map((rj, j) => ri.reduce((a, x, t) => a + (x - means[i]) * (rj[t] - means[j]), 0) / (len - 1)));
  // Small ridge so short windows stay invertible
  const trace = cov.reduce((a, row, i) => a + row[i], 0) / n || 1e-6;
  for (let i = 0; i < n; i++) cov[i][i] += trace * 1e-3;
  // Solve cov x = 1 by Gauss-Jordan elimination
  const m = cov.map((row, i) => [...row, 1]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    if (Math.abs(m[p][c]) < 1e-14) return null;
    [m[c], m[p]] = [m[p], m[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = m[r][c] / m[c][c];
      for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k];
    }
  }
  const x = m.map((row, i) => Math.max(0, row[n] / row[i]));
  const tot = x.reduce((a, b) => a + b, 0);
  return tot > 0 ? x.map(v => v / tot) : null;
}
