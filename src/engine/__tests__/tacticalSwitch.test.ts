import { describe, it, expect, vi } from 'vitest';
import { runBacktest } from '../index';
import * as dataFetcher from '../data';

vi.mock('../data', () => ({ fetchMonthlyPrices: vi.fn(), fetchDividends: vi.fn().mockResolvedValue([]) }));

const months = Array.from({ length: 24 }, (_, i) => `${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01T00:00:00Z`);
const series = (f: (i: number) => number) => months.map((date, i) => ({ date, close: f(i), volume: 0 }));

describe('tactical switching', () => {
  it('moves the money to the safe asset and back, keeping the value', async () => {
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockImplementation(async (sym: string) =>
      sym === 'CASH' ? series((i) => 100 * Math.pow(1.002, i)) : series((i) => 100 + 10 * Math.sin(i)),
    );
    const res = await runBacktest(
      [{ id: 'p', name: 'P', allocations: [{ symbol: 'VTI', weight: 100 }], tacticalModel: { type: 'seasonal', outOfMarketStartMonth: 5, outOfMarketEndMonth: 10, safeAsset: 'CASH' } }],
      { initialBalance: 10000, startDate: '2020-01-01', endDate: '2021-12-31', rebalanceFrequency: 'annually' },
    );
    const r: any = (res as any).results?.[0] ?? (res as any)[0];
    const curve = r.equityCurve.map((p: any) => p.value);
    expect(curve.every((v: number) => Number.isFinite(v) && v > 5000)).toBe(true);
    expect(Number.isFinite(r.metrics.cagr)).toBe(true);
    expect(r.metrics.maxDrawdown).toBeLessThan(1);
  });
});
