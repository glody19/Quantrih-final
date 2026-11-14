import { describe, it, expect, vi } from 'vitest';

// Deterministic monthly prices (2020-01 to 2023-12) so the test never depends on the network.
vi.mock('../data', () => {
  const series = (drift: number) => {
    const out: { date: string; close: number; volume: number }[] = [];
    let p = 100;
    for (let y = 2020; y <= 2023; y++) {
      for (let m = 1; m <= 12; m++) {
        out.push({ date: `${y}-${String(m).padStart(2, '0')}-01T00:00:00Z`, close: p, volume: 1000 });
        p *= 1 + drift + 0.02 * Math.sin(y * 12 + m);
      }
    }
    return out;
  };
  return {
    fetchMonthlyPrices: vi.fn(async (sym: string) => series(0.002 + (sym.charCodeAt(0) % 5) * 0.001)),
    fetchDividends: vi.fn(async () => []),
  };
});
import { LAZY_PORTFOLIOS } from '../../data/lazyPortfolios';
import { runBacktest } from '../index';
import { Portfolio } from '../types';

describe('Lazy Portfolios Data and Engine', () => {
  it('should have unique IDs for all portfolios', () => {
    const ids = LAZY_PORTFOLIOS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have weights summing to approximately 100% for each portfolio', () => {
    LAZY_PORTFOLIOS.forEach(p => {
      const totalWeight = p.holdings.reduce((sum, h) => sum + h.weight, 0);
      expect(totalWeight).toBeGreaterThan(99.5);
      expect(totalWeight).toBeLessThan(100.5);
    });
  });

  it('should be able to backtest a sample lazy portfolio without throwing', async () => {
    const lp = LAZY_PORTFOLIOS[0]; // All Weather
    const portfolio: Portfolio = {
      id: lp.id,
      name: lp.name,
      allocations: lp.holdings.map(h => ({ symbol: h.ticker, weight: h.weight / 100 }))
    };

    const results = await runBacktest([portfolio], {
      initialBalance: 10000,
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      rebalanceFrequency: 'annually'
    });
    expect(results.length).toBe(1);
    expect(results[0].equityCurve.length).toBe(48);
    expect(results[0].equityCurve[0].value).toBe(10000);
    expect(results[0].metrics.endBalance).toBeGreaterThan(0);
  });
});
