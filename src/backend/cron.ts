import db, { getLazyPortfolios, savePortfolioPerf } from './db.ts';
import YahooFinance from 'yahoo-finance2';

const yfClass = (YahooFinance as any).default || YahooFinance;
const yahooFinance = new yfClass({
  validation: { logErrors: false }
});

export async function calculatePortfolioPerformances() {
  console.log("Starting daily portfolio performance calculation...");
  try {
    const lazy = getLazyPortfolios();
    const allPortfolios = [...lazy.map(l => ({...l, type: 'lazy'}))];

    // Collect all symbols
    const symbolsSet = new Set<string>();
    for (const p of allPortfolios) {
      for (const sym of Object.keys(p.composition)) {
        symbolsSet.add(sym);
      }
    }
    const symbols = Array.from(symbolsSet);
    
    if (symbols.length === 0) return;

    // Fetch historical data for all symbols
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    // Add a buffer
    twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 1); 

    const historicalData: Record<string, any[]> = {};
    for (const sym of symbols) {
      try {
        const hist = await yahooFinance.chart(sym, {
          period1: twoYearsAgo.toISOString().split("T")[0],
          interval: '1d'
        });
        historicalData[sym] = hist.quotes;
      } catch (e: any) {
        console.warn(`Failed to fetch hist for ${sym}:`, e.message);
      }
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    // Now calculate for each portfolio
    for (const p of allPortfolios) {
      const perfs = calcPerf(p.composition, historicalData);
      savePortfolioPerf(p.type, p.id, today.toISOString().split("T")[0], perfs);
    }
    console.log("Portfolio performance calculated and saved.");
  } catch (err) {
    console.error("Cron Error:", err);
  }
}

function calcPerf(composition: Record<string, number>, historicalData: Record<string, any[]>) {
  // composition looks like {"SPY": 60, "TLT": 40}
  const dates = {
    '3m': new Date(new Date().setMonth(new Date().getMonth() - 3)),
    '6m': new Date(new Date().setMonth(new Date().getMonth() - 6)),
    '1y': new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    '2y': new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    '3y': new Date(new Date().setFullYear(new Date().getFullYear() - 3)),
  };

  const getPriceApprox = (quotes: any[], targetDate: Date) => {
    if (!quotes || quotes.length === 0) return null;
    let closest = quotes[0];
    let minDiff = Infinity;
    for (const q of quotes) {
      const diff = Math.abs(q.date.getTime() - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = q;
      }
    }
    return closest.close;
  };

  const currentPrices: Record<string, number> = {};
  for (const sym of Object.keys(composition)) {
    const q = historicalData[sym];
    if (q && q.length > 0) {
      currentPrices[sym] = q[q.length - 1].close;
    }
  }

  const calcPerfForDate = (targetDate: Date) => {
    let startVal = 0;
    let endVal = 0;
    for (const [sym, weight] of Object.entries(composition)) {
      const q = historicalData[sym];
      const pastP = getPriceApprox(q, targetDate);
      const curP = currentPrices[sym];
      if (pastP && curP) {
        // Assume 1 USD total investment
        const shares = (weight / 100) / pastP;
        startVal += (weight / 100);
        endVal += shares * curP;
      } else {
        startVal += (weight / 100);
        endVal += (weight / 100); // 0% growth
      }
    }
    return startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
  };

  return {
    perf_1d: 0, // handeled real-time
    perf_3m: calcPerfForDate(dates['3m']),
    perf_6m: calcPerfForDate(dates['6m']),
    perf_1y: calcPerfForDate(dates['1y']),
    perf_2y: calcPerfForDate(dates['2y']),
    perf_3y: calcPerfForDate(dates['3y']),
  };
}
