import { describe, it, expect, vi } from 'vitest';
import { runBacktest } from '../index';
import * as dataFetcher from '../data';
import { Portfolio, BacktestOptions } from '../types';

// Mock the network requests
vi.mock('../data', () => ({
  fetchMonthlyPrices: vi.fn(),
}));

describe('Backtesting Engine', () => {
  it('should run a basic backtest without crashing (Golden Path)', async () => {
    // Generate some mock price data so we are not at the mercy of real APIs during tests
    const mockSPY = [
      { date: '2020-01-01T00:00:00Z', close: 100, volume: 1000 },
      { date: '2020-02-01T00:00:00Z', close: 110, volume: 1000 },
      { date: '2020-03-01T00:00:00Z', close: 99, volume: 1000 },
      { date: '2020-04-01T00:00:00Z', close: 121, volume: 1000 },
      { date: '2020-05-01T00:00:00Z', close: 130, volume: 1000 },
    ];
    
    // Setup our mock
    vi.mocked(dataFetcher.fetchMonthlyPrices).mockResolvedValue(mockSPY);
    
    const portfolios: Portfolio[] = [
      {
        id: 'test-1',
        name: 'Test Portfolio',
        allocations: [{ symbol: 'SPY', weight: 100 }]
      }
    ];
    
    const options: BacktestOptions = {
      initialBalance: 10000,
      startDate: '2020-01-01',
      endDate: '2020-05-01',
      rebalanceFrequency: 'annually'
    };
    
    const results = await runBacktest(portfolios, options);
    
    expect(results).toHaveLength(1);
    expect(results[0].portfolioId).toBe('test-1');
    expect(results[0].equityCurve).toHaveLength(5);
    
    // Start balance 10000
    expect(results[0].equityCurve[0].value).toBe(10000);
    
    // Second month price went 100 -> 110 (+10%), balance should be 11000
    expect(results[0].equityCurve[1].value).toBeCloseTo(11000, 1);
    
    // Final month price is 130 (+30% from start), balance should be 13000
    expect(results[0].equityCurve[4].value).toBeCloseTo(13000, 1);
    
    // Max Drawdown: 110 -> 99 is a 10% drop 
    expect(results[0].metrics).toHaveProperty('maxDrawdown');
    expect(results[0].metrics.maxDrawdown).toBeGreaterThan(0); 
    
    // Return metrics
    expect(results[0].metrics.endBalance).toBeCloseTo(13000, 1);
  });
});
