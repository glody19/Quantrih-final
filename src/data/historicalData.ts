
export interface YearlyReturn {
  year: number;
  usStock: number;
  intlStock: number;
  bonds: number;
  gold: number;
  cash: number;
}

export const HISTORICAL_RETURNS: YearlyReturn[] = [
  { year: 1994, usStock: 1.32, intlStock: 7.78, bonds: -2.92, gold: -2.01, cash: 4.29 },
  { year: 1995, usStock: 37.58, intlStock: 11.21, bonds: 18.47, gold: 1.15, cash: 5.52 },
  { year: 1996, usStock: 22.96, intlStock: 6.03, bonds: 3.63, gold: -4.37, cash: 5.02 },
  { year: 1997, usStock: 33.36, intlStock: 1.55, bonds: 9.65, gold: -21.44, cash: 5.06 },
  { year: 1998, usStock: 28.58, intlStock: 12.87, bonds: 8.69, gold: -0.61, cash: 4.86 },
  { year: 1999, usStock: 21.04, intlStock: 26.65, bonds: -0.82, gold: 1.18, cash: 4.68 },
  { year: 2000, usStock: -9.10, intlStock: -14.17, bonds: 11.63, gold: -6.26, cash: 5.85 },
  { year: 2001, usStock: -11.89, intlStock: -21.21, bonds: 8.44, gold: 2.18, cash: 3.41 },
  { year: 2002, usStock: -22.10, intlStock: -15.94, bonds: 10.26, gold: 24.43, cash: 1.62 },
  { year: 2003, usStock: 28.68, intlStock: 38.59, bonds: 4.10, gold: 19.58, cash: 1.02 },
  { year: 2004, usStock: 10.88, intlStock: 20.25, bonds: 4.34, gold: 5.55, cash: 1.38 },
  { year: 2005, usStock: 4.91, intlStock: 13.54, bonds: 2.43, gold: 17.77, cash: 3.22 },
  { year: 2006, usStock: 15.79, intlStock: 25.63, bonds: 4.27, gold: 23.21, cash: 4.96 },
  { year: 2007, usStock: 5.49, intlStock: 11.17, bonds: 6.97, gold: 31.59, cash: 4.47 },
  { year: 2008, usStock: -37.00, intlStock: -43.33, bonds: 5.24, gold: 5.53, cash: 1.37 },
  { year: 2009, usStock: 26.46, intlStock: 31.78, bonds: 5.93, gold: 24.04, cash: 0.10 },
  { year: 2010, usStock: 15.06, intlStock: 7.75, bonds: 6.54, gold: 29.26, cash: 0.12 },
  { year: 2011, usStock: 2.11, intlStock: -12.14, bonds: 7.84, gold: 10.12, cash: 0.05 },
  { year: 2012, usStock: 16.00, intlStock: 16.83, bonds: 4.21, gold: 7.06, cash: 0.07 },
  { year: 2013, usStock: 32.39, intlStock: 22.13, bonds: -2.02, gold: -28.33, cash: 0.03 },
  { year: 2014, usStock: 13.68, intlStock: -3.87, bonds: 5.97, gold: -1.72, cash: 0.01 },
  { year: 2015, usStock: 1.38, intlStock: -4.41, bonds: 0.55, gold: -10.42, cash: 0.03 },
  { year: 2016, usStock: 11.96, intlStock: 1.00, bonds: 2.65, gold: 8.63, cash: 0.27 },
  { year: 2017, usStock: 21.83, intlStock: 24.62, bonds: 3.54, gold: 13.12, cash: 0.93 },
  { year: 2018, usStock: -4.38, intlStock: -13.79, bonds: 0.01, gold: -1.15, cash: 1.94 },
  { year: 2019, usStock: 31.49, intlStock: 21.51, bonds: 8.72, gold: 18.42, cash: 2.22 },
  { year: 2020, usStock: 18.40, intlStock: 10.65, bonds: 7.51, gold: 24.43, cash: 0.45 },
  { year: 2021, usStock: 28.71, intlStock: 7.82, bonds: -1.54, gold: -3.51, cash: 0.03 },
  { year: 2022, usStock: -18.11, intlStock: -16.00, bonds: -13.01, gold: -0.13, cash: 2.02 },
  { year: 2023, usStock: 26.29, intlStock: 15.62, bonds: 5.53, gold: 13.10, cash: 5.15 },
];

export function calculateArithmeticMean(returns: number[]): number {
  return returns.reduce((a, b) => a + b, 0) / returns.length;
}

export function calculateGeometricMean(returns: number[]): number {
  const prod = returns.reduce((acc, r) => acc * (1 + r / 100), 1);
  return (Math.pow(prod, 1 / returns.length) - 1) * 100;
}

export function calculateStandardDeviation(returns: number[]): number {
  const mean = calculateArithmeticMean(returns);
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance);
}

export function calculateDownsideDeviation(returns: number[], mar: number = 0): number {
  const gains = returns.map(r => Math.min(0, r - mar));
  const sumSq = gains.reduce((acc, r) => acc + Math.pow(r, 2), 0);
  return Math.sqrt(sumSq / returns.length);
}

export function calculateSharpeRatio(returns: number[], rf: number = 0): number {
  const mean = calculateArithmeticMean(returns);
  const std = calculateStandardDeviation(returns);
  return (mean - rf) / std;
}

export function calculateSortinoRatio(returns: number[], rf: number = 0): number {
  const mean = calculateArithmeticMean(returns);
  const downStd = calculateDownsideDeviation(returns, rf);
  return (mean - rf) / downStd;
}

export function calculateMaxDrawdown(balances: number[]): number {
  let peak = -Infinity;
  let maxDD = 0;
  for (const b of balances) {
    if (b > peak) peak = b;
    const dd = (peak - b) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD * 100;
}
