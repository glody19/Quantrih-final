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
  
  const pathLength = months + 1;
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  
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
    finalBalances.push(balance);
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
