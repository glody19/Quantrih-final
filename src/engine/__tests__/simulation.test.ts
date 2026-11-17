import { describe, it, expect } from 'vitest';
import { runSimulation } from '../simulation';

const assets = [{ symbol: 'A', returns: Array(24).fill(0.01) }, { symbol: 'B', returns: Array(24).fill(0) }];
const base = { model: 'Bootstrap' as const, horizonYears: 2, simulations: 3, initialBalance: 1000, cashflow: 100, cashflowFreq: 'annual' as const };
const end = (o: any) => runSimulation(assets, { A: 50, B: 50 }, { ...base, ...o })[0].at(-1)!;

describe('Monte Carlo simulation', () => {
  it('withdrawals lower and contributions raise the balance', () => {
    const none = end({ cashflowType: 'none' });
    expect(end({ cashflowType: 'fixed' })).toBeLessThan(none);
    expect(end({ cashflowType: 'contribute' })).toBeGreaterThan(none);
  });
  it('fees and taxes reduce the result, buy and hold drifts from the weights', () => {
    const none = end({ cashflowType: 'none' });
    expect(end({ cashflowType: 'none', annualFee: 0.01 })).toBeLessThan(none);
    expect(end({ cashflowType: 'none', taxRate: 0.3 })).toBeLessThan(none);
    expect(end({ cashflowType: 'none', rebalance: 'none' })).toBeGreaterThan(none);
  });
});
