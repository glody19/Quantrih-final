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
