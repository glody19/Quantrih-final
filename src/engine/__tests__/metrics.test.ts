import { describe, it, expect } from 'vitest';
import { calculateMetrics, calculateCorrelationMatrix } from '../metrics';

describe('metrics', () => {
  it('calculateMetrics should calculate metrics for flat equity curve', () => {
    const equityCurve = [
      { date: '2020-01-01', value: 1000 },
      { date: '2020-02-01', value: 1000 },
      { date: '2020-03-01', value: 1000 },
    ];
    const result = calculateMetrics(equityCurve, 1000, 0);
    expect(result.cagr).toBe(0);
    expect(result.volatility).toBe(0);
    expect(result.sharpeRatio).toBe(0);
    expect(result.maxDrawdown).toBe(0);
  });

  it('calculateMetrics should handle positive returns (monthly data)', () => {
    const equityCurve = [];
    let val = 1000;
    // 12 months, 1% per month
    for (let i = 1; i <= 13; i++) {
      equityCurve.push({ date: `2020-\${i.toString().padStart(2, '0')}-01`, value: val });
      val *= 1.01;
    }
    const result = calculateMetrics(equityCurve, 1000, 0);
    // (1.01)^12 - 1 = ~12.68%
    expect(result.cagr).toBeCloseTo(0.1268, 3);
    expect(result.maxDrawdown).toBe(0);
  });

  it('calculateMetrics should handle drawdowns', () => {
    const equityCurve = [
      { date: '2020-01-01', value: 1000 },
      { date: '2020-02-01', value: 800 },
      { date: '2020-03-01', value: 1000 },
    ];
    const result = calculateMetrics(equityCurve, 1000, 0);
    expect(result.maxDrawdown).toBeCloseTo(0.2, 2);
  });

  it('calculateCorrelationMatrix should compute basic correlations', () => {
    const assets = [
      { symbol: 'A', returns: [0.1, 0.2, 0.3] },
      { symbol: 'B', returns: [0.1, 0.2, 0.3] },
      { symbol: 'C', returns: [-0.1, -0.2, -0.3] },
    ];
    const result = calculateCorrelationMatrix(assets);
    expect(result['A']['B']).toBeCloseTo(1, 2);
    expect(result['A']['C']).toBeCloseTo(-1, 2);
  });
});
