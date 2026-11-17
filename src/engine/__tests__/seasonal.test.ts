import { describe, it, expect } from 'vitest';
import { evaluateTacticalModel } from '../tactical';

const months = ['2020-04', '2020-05', '2020-09', '2020-10', '2020-12'];
const portfolio = {
  id: 'p', name: 'P', allocations: [{ symbol: 'VTI', weight: 1 }],
  tacticalModel: { type: 'seasonal' as const, outOfMarketStartMonth: 5, outOfMarketEndMonth: 10, safeAsset: 'CASH' },
};

describe('seasonal model', () => {
  it('holds the safe asset from May to September and the portfolio otherwise', () => {
    const picks = months.map((_, i) => evaluateTacticalModel(portfolio, i, months, new Map())[0].symbol);
    expect(picks).toEqual(['VTI', 'CASH', 'CASH', 'VTI', 'VTI']);
  });
  it('handles a window that wraps over the new year', () => {
    const p = { ...portfolio, tacticalModel: { ...portfolio.tacticalModel, outOfMarketStartMonth: 11, outOfMarketEndMonth: 2 } };
    const ms = ['2020-10', '2020-11', '2021-01', '2021-02'];
    expect(ms.map((_, i) => evaluateTacticalModel(p, i, ms, new Map())[0].symbol)).toEqual(['VTI', 'CASH', 'CASH', 'VTI']);
  });
});

describe('moving average and absolute momentum options', () => {
  const ms = ['2020-01', '2020-02', '2020-03'];
  const flat = new Map([['VTI', new Map(ms.map((m) => [m, 100]))]]);
  const ma = (buySignal: 'gt' | 'gte') => ({
    id: 'p', name: 'P', allocations: [{ symbol: 'VTI', weight: 1 }],
    tacticalModel: { type: 'moving_average' as const, movingAverageMonths: 3, safeAsset: 'CASH', buySignal },
  });
  it('price equal to the average stays invested only with >=', () => {
    expect(evaluateTacticalModel(ma('gte'), 2, ms, flat)[0].symbol).toBe('VTI');
    expect(evaluateTacticalModel(ma('gt'), 2, ms, flat)[0].symbol).toBe('CASH');
  });
  it('absolute momentum sends a losing leader to the safe asset', () => {
    const prices = new Map([
      ['VTI', new Map([['2020-01', 100], ['2020-02', 95], ['2020-03', 90]])],
      ['CASH', new Map([['2020-01', 100], ['2020-02', 100.1], ['2020-03', 100.2]])],
    ]);
    const p = { id: 'p', name: 'P', allocations: [{ symbol: 'VTI', weight: 1 }],
      tacticalModel: { type: 'relative_momentum' as const, lookbackMonths: 2, topK: 1, absoluteMomentum: true, safeAsset: 'CASH' } };
    expect(evaluateTacticalModel(p, 2, ms, prices)[0].symbol).toBe('CASH');
    expect(evaluateTacticalModel({ ...p, tacticalModel: { ...p.tacticalModel, absoluteMomentum: false } }, 2, ms, prices)[0].symbol).toBe('VTI');
  });
});
