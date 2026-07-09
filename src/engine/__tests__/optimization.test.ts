import { describe, it, expect } from 'vitest';
import { optimizeMeanVariance, optimizeRiskParity } from '../optimization';

describe('optimization', () => {
  it('optimizeMeanVariance should return optimal weights', () => {
    const assets: any[] = [
      {
        symbol: 'A',
        monthlyReturns: [0.01, 0.02, 0.01, 0.03, -0.01, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01, 0.01]
      },
      {
        symbol: 'B',
        monthlyReturns: [-0.05, 0.1, -0.05, 0.1, -0.05, 0.1, -0.05, 0.1, -0.05, 0.1, -0.05, 0.1]
      }
    ];

    const result = optimizeMeanVariance(assets, 'maxSharpe', 0);
    expect(result.weights).toBeDefined();
    expect(Object.keys(result.weights).length).toBe(2);
    expect(result.weights['A']).toBeDefined();
    expect(result.weights['B']).toBeDefined();
    
    const sum = Object.values(result.weights).reduce((acc, w) => acc + w, 0);
    expect(sum).toBeCloseTo(1, 2);
    
    expect(result.expectedReturn).toBeDefined();
    expect(result.expectedVolatility).toBeDefined();
    expect(result.sharpeRatio).toBeDefined();
  });

  it('optimizeRiskParity should use inverse volatility', () => {
    const assets: any[] = [
      {
        symbol: 'A',
        monthlyReturns: [0.01, 0.015, 0.01, 0.015] // non-zero variance
      },
      {
        symbol: 'B',
        monthlyReturns: [-0.1, 0.1, -0.1, 0.1]
      }
    ];

    const result = optimizeRiskParity(assets);
    const weightA = result.weights['A'];
    const weightB = result.weights['B'];

    expect(weightA).toBeGreaterThan(weightB);
    const sum = weightA + weightB;
    expect(sum).toBeCloseTo(1, 2);
  });
});
