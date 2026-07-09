import { BacktestResult } from "./types";

export interface DividendMetrics {
  yieldOnCost: number;
  cagr1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  aristocratYears: number;
}

export function analyzeDividends(history: { exDate: string, amount: number }[], currentPrice: number, costBasis: number): DividendMetrics {
  if (history.length === 0) {
    return { yieldOnCost: 0, cagr1Y: 0, cagr3Y: 0, cagr5Y: 0, aristocratYears: 0 };
  }

  const byYear: Record<number, number> = {};
  history.forEach(d => {
    const y = new Date(d.exDate).getFullYear();
    byYear[y] = (byYear[y] || 0) + d.amount;
  });

  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  if (years.length === 0) return { yieldOnCost: 0, cagr1Y: 0, cagr3Y: 0, cagr5Y: 0, aristocratYears: 0 };

  const lastFullYear = new Date().getFullYear() - 1;
  const lastYearDiv = byYear[lastFullYear] || 0;

  const yieldOnCost = costBasis > 0 ? (lastYearDiv / costBasis) * 100 : 0;

  const getCagr = (y: number) => {
    if (!byYear[lastFullYear - y] || byYear[lastFullYear - y] === 0) return 0;
    return (Math.pow(lastYearDiv / byYear[lastFullYear - y], 1 / y) - 1) * 100;
  };

  let aristocratYears = 0;
  for (let i = years.length - 1; i > 0; i--) {
    if (byYear[years[i]] >= byYear[years[i - 1]]) {
      aristocratYears++;
    } else {
      break;
    }
  }

  return {
    yieldOnCost,
    cagr1Y: getCagr(1),
    cagr3Y: getCagr(3),
    cagr5Y: getCagr(5),
    aristocratYears
  };
}
