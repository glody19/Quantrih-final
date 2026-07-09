export interface MonteCarloOptions {
  simulations: number;
  months: number;
  initialBalance: number;
}

export interface MonteCarloResult {
  p10: number[];
  p50: number[];
  p90: number[];
  mean: number;
  std: number;
}

/**
 * Historical Bootstrap Monte Carlo
 */
export function runMonteCarlo(
  historicalReturns: number[],
  options: MonteCarloOptions
): MonteCarloResult {
  const { simulations, months, initialBalance } = options;
  const finalBalances: number[] = [];
  const trajectories: number[][] = [];

  for (let s = 0; s < simulations; s++) {
    let balance = initialBalance;
    const trajectory: number[] = [balance];
    
    for (let m = 0; m < months; m++) {
      // Pick a random month's return from history
      const randomReturn = historicalReturns[Math.floor(Math.random() * historicalReturns.length)];
      balance *= (1 + randomReturn);
      trajectory.push(balance);
    }
    
    finalBalances.push(balance);
    trajectorie: trajectory; // We only keep a few for plotting or use distribution
    // For performance, we'll only calculate percentiles of trajectory at each step
  }

  // Calculate percentiles at each step
  const pathLength = months + 1;
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  // This is computationally expensive if we store all trajectories.
  // Instead, let's just do it for final balance first, or a reduced set of paths.
  
  // Revised approach for trajectory percentiles:
  const stepValues: number[][] = Array(pathLength).fill(0).map(() => []);
  
  // Re-run or store? Let's re-run a smaller set for paths if needed, 
  // but for the sake of accuracy we should store if possible.
  // Simulations=5000, months=120 = 600,000 numbers. Fine.
  
  const allPaths: number[][] = [];
  for (let s = 0; s < simulations; s++) {
    let balance = initialBalance;
    const path = [balance];
    for (let m = 0; m < months; m++) {
      const randomReturn = historicalReturns[Math.floor(Math.random() * historicalReturns.length)];
      balance *= (1 + randomReturn);
      path.push(balance);
    }
    allPaths.push(path);
  }

  for (let t = 0; t < pathLength; t++) {
    const valuesAtT = allPaths.map(p => p[t]).sort((a,b) => a-b);
    p10.push(valuesAtT[Math.floor(simulations * 0.1)]);
    p50.push(valuesAtT[Math.floor(simulations * 0.5)]);
    p90.push(valuesAtT[Math.floor(simulations * 0.9)]);
  }

  const sortedFinal = finalBalances.sort((a,b) => a-b);
  const mean = finalBalances.reduce((a,b) => a+b, 0) / simulations;
  
  return {
    p10,
    p50,
    p90,
    mean,
    std: Math.sqrt(finalBalances.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / simulations)
  };
}
