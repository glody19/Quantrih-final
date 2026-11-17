import { describe, it, expect, vi } from 'vitest';
import { runBacktest } from '../index';
import * as dataFetcher from '../data';
import { minVarianceWeights } from '../tactical';

vi.mock('../data', () => ({ fetchMonthlyPrices: vi.fn(), fetchDividends: vi.fn().mockResolvedValue([]) }));

const N = 36;
const months = Array.from({ length: N }, (_, i) => `${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01T00:00:00Z`);
const series = (f: (i: number) => number) => months.map((date, i) => ({ date, close: f(i), volume: 0 }));
const opts = { initialBalance: 10000, startDate: '2020-01-01', endDate: '2022-12-31', rebalanceFrequency: 'annually' as const };
const ma = { type: 'moving_average' as const, movingAverageMonths: 3, safeAsset: 'CASH' };

describe('tactical execution options', () => {
  it('leverage 2x doubles a steady gain minus the borrowing cost', async () => {
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockImplementation(async (sym: string) =>
      sym === 'CASH' ? series(() => 100) : series((i) => 100 * Math.pow(1.01, i)));
    const [plain, lev] = await runBacktest([
      { id: 'a', name: 'A', allocations: [{ symbol: 'VTI', weight: 1 }], tacticalModel: ma },
      { id: 'b', name: 'B', allocations: [{ symbol: 'VTI', weight: 1 }], tacticalModel: ma, execution: { leverage: 2, borrowRate: 0 } },
    ], opts);
    const gain = (r: any) => r.equityCurve[r.equityCurve.length - 1].value / 10000 - 1;
    expect(gain(lev)).toBeGreaterThan(gain(plain) * 1.9);
  });

  it('a trailing stop moves to the safe asset during a crash', async () => {
    // Rises, then falls 40% over 6 months, then flat
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockImplementation(async (sym: string) =>
      sym === 'CASH' ? series(() => 100) : series((i) => (i < 12 ? 100 + i : i < 18 ? 111 * (1 - 0.08 * (i - 11)) : 58)));
    const seasonalNever = { type: 'seasonal' as const, outOfMarketStartMonth: 1, outOfMarketEndMonth: 1, safeAsset: 'CASH' };
    const [noStop, stop] = await runBacktest([
      { id: 'a', name: 'A', allocations: [{ symbol: 'VTI', weight: 1 }], tacticalModel: seasonalNever },
      { id: 'b', name: 'B', allocations: [{ symbol: 'VTI', weight: 1 }], tacticalModel: seasonalNever, execution: { trailingStop: 0.1, frequencyMonths: 12 } },
    ], opts);
    expect(stop.metrics.maxDrawdown).toBeLessThan(noStop.metrics.maxDrawdown);
  });

  it('minimum variance favours the calmer asset', () => {
    const w = minVarianceWeights([[0.05, -0.05, 0.04, -0.04, 0.06], [0.01, -0.005, 0.008, -0.01, 0.006]])!;
    expect(w[1]).toBeGreaterThan(w[0]);
    expect(w[0] + w[1]).toBeCloseTo(1);
  });
});

describe('costs and currency', () => {
  it('annual fees and trading costs lower the result; euro base converts dollar assets', async () => {
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockImplementation(async (sym: string) =>
      sym === 'EURUSD=X' ? series((i) => 1 + i * 0.01) : series((i) => 100 * Math.pow(1.01, i)));
    const p = [{ id: 'a', name: 'A', allocations: [{ symbol: 'VTI', weight: 0.5 }, { symbol: 'BND', weight: 0.5 }] }];
    const endOf = async (o: any) => { const [r] = await runBacktest(p, { ...opts, rebalanceFrequency: 'monthly', ...o }); return r.equityCurve.at(-1)!.value; };
    const plain = await endOf({});
    expect(await endOf({ annualFeeRate: 0.01 })).toBeLessThan(plain);
    expect(await endOf({ baseCurrency: 'EUR' })).toBeLessThan(plain); // the euro rises against the dollar here
  });
});
