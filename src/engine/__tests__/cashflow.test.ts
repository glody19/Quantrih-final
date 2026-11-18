import { describe, it, expect, vi } from 'vitest';
import { runBacktest } from '../index';
import * as dataFetcher from '../data';
import { isCashflowMonth, paymentsPerYear } from '../cashflow';
import { runSimulation } from '../simulation';

vi.mock('../data', () => ({ fetchMonthlyPrices: vi.fn(), fetchDividends: vi.fn().mockResolvedValue([]) }));

const N = 37; // Jan 2020 .. Jan 2023
const months = Array.from({ length: N }, (_, i) => `${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01T00:00:00Z`);
const flat = months.map((date) => ({ date, close: 100, volume: 0 }));
const opts = { initialBalance: 10000, startDate: '2020-01-01', endDate: '2023-01-31', rebalanceFrequency: 'none' as const };
const p = [{ id: 'a', name: 'A', allocations: [{ symbol: 'VTI', weight: 1 }] }];

describe('contribution and withdrawal schedules', () => {
  it('due months follow the calendar', () => {
    expect([1, 2, 3, 4, 5].map((m) => isCashflowMonth('quarterly', m))).toEqual([true, false, false, true, false]);
    expect([1, 5, 9, 2].map((m) => isCashflowMonth('quadrimester', m))).toEqual([true, true, true, false]);
    expect(paymentsPerYear('weekly')).toBe(52);
    expect(paymentsPerYear('quadrimester')).toBe(3);
  });

  it('adds the right total for each frequency on a flat price', async () => {
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockResolvedValue(flat as any);
    const end = async (f: any, amt = 100) => (await runBacktest(p, { ...opts, cashflowAmount: amt, cashflowFrequency: f }))[0].equityCurve.at(-1)!.value;
    // 36 months after the start, Feb 2020 .. Jan 2023
    expect(await end('monthly')).toBeCloseTo(10000 + 36 * 100, 0);
    expect(await end('weekly')).toBeCloseTo(10000 + 36 * 100 * 52 / 12, 0);
    expect(await end('quarterly')).toBeCloseTo(10000 + 12 * 100, 0); // Apr, Jul, Oct, Jan x3
    expect(await end('quadrimester')).toBeCloseTo(10000 + 9 * 100, 0); // May, Sep, Jan x3
    expect(await end('annually')).toBeCloseTo(10000 + 3 * 100, 0);
  });

  it('withdrawals reduce the balance and stop at zero', async () => {
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockResolvedValue(flat as any);
    const [r] = await runBacktest(p, { ...opts, cashflowAmount: -1000, cashflowFrequency: 'quarterly' });
    const last = r.equityCurve.at(-1)!.value;
    expect(last).toBeCloseTo(0, 6);
    expect(r.equityCurve.every((pt) => pt.value >= -1e-9)).toBe(true);
    expect(Number.isFinite(r.metrics.cagr)).toBe(true);
  });

  it('Monte Carlo pays a fixed amount at each due month', () => {
    const run = (freq: any) =>
      runSimulation([{ symbol: 'A', returns: Array(24).fill(0) }], { A: 100 }, { model: 'Bootstrap', horizonYears: 2, simulations: 1, initialBalance: 1000, cashflow: 10, cashflowType: 'contribute', cashflowFreq: freq } as any);
    expect(run('quarterly')[0].at(-1)).toBeCloseTo(1000 + 8 * 10, 6);
    expect(run('annual')[0].at(-1)).toBeCloseTo(1000 + 2 * 10, 6);
  });
});
