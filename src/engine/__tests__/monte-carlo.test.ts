import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from '../monte-carlo';

describe('monte-carlo', () => {
  it('should run monte carlo simulation with basic parameters', () => {
    // Very simple returns: always 1%
    const historicalReturns = [0.01];
    
    const result = runMonteCarlo(historicalReturns, {
      simulations: 100,
      months: 12,
      initialBalance: 1000
    });

    expect(result.p10.length).toBe(13); // 0 to 12
    expect(result.p50.length).toBe(13);
    expect(result.p90.length).toBe(13);

    // Final balance should be exactly 1000 * 1.01^12
    const expectedFinal = 1000 * Math.pow(1.01, 12);
    
    expect(result.p50[12]).toBeCloseTo(expectedFinal, 2);
    expect(result.mean).toBeCloseTo(expectedFinal, 2);
    expect(result.std).toBeCloseTo(0, 2); // No variance
  });

  it('should generate variance when given different historical returns', () => {
    const historicalReturns = [0.05, -0.02]; // 5% and -2%
    
    const result = runMonteCarlo(historicalReturns, {
      simulations: 500,
      months: 24,
      initialBalance: 1000
    });

    // With 500 simulations, mean should be roughly close to 1000 * (1.015)^24
    // standard deviation should be non-zero
    expect(result.std).toBeGreaterThan(0);
    expect(result.p90[24]).toBeGreaterThan(result.p10[24]);
  });
});
