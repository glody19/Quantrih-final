import { matrix, multiply, transpose, inv, lusolve, mean, variance } from 'mathjs';

/**
 * Standard Ordinary Least Squares (OLS) Regression
 * @param y Dependent variable (target returns - risk-free)
 * @param x Independent variables (factor returns) - Intercept will be added automatically
 */
export function olsRegression(y: number[], x: number[][]) {
  if (y.length !== x.length || y.length === 0) {
    throw new Error("Input lengths must match and be non-zero");
  }

  // Add intercept (Alpha) column
  const X = x.map(row => [1, ...row]);
  const n = y.length;
  const k = X[0].length;

  try {
    // b = (X'X)^-1 X'y
    const Xt = transpose(X);
    const XtX = multiply(Xt, X);
    const Xty = multiply(Xt, y);
    
    // Using inv for small matrices is fine (factors are usually 1-5)
    const beta = multiply(inv(XtX), Xty) as any as number[];

    // Calculate R-squared
    const yHat = multiply(X, beta) as any as number[];
    const yMean = mean(y);
    
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      ssRes += Math.pow(y[i] - yHat[i], 2);
      ssTot += Math.pow(y[i] - yMean, 2);
    }
    
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - k));

    // Standard Error and t-stats
    const sigmaSq = ssRes / (n - k);
    const varCovarMatrix = multiply(inv(XtX), sigmaSq) as any as number[][];
    
    const standardErrors = varCovarMatrix.map((row, i) => Math.sqrt(row[i]));
    const tStats = beta.map((b, i) => b / (standardErrors[i] || 1));
    
    // Simple p-value approximation (normal distribution)
    // In a real app we'd use a T-distribution table
    const pValues = tStats.map(t => {
      const absT = Math.abs(t);
      // Very crude approximation of p-value for large n
      if (absT > 3.29) return 0.001; // 99.9%
      if (absT > 2.58) return 0.01;  // 99%
      if (absT > 1.96) return 0.05;  // 95%
      if (absT > 1.64) return 0.10;  // 90%
      return 0.50;
    });

    return {
      coefficients: beta, // [alpha, b1, b2, ...]
      rSquared,
      adjRSquared,
      tStats,
      pValues,
      standardErrors,
      fStatistic: ((ssTot - ssRes) / (k - 1)) / (ssRes / (n - k))
    };
  } catch (err) {
    console.error("OLS Error:", err);
    throw err;
  }
}
