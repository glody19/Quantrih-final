import { MonthlyPrice } from './types';
import { SIM_PROXIES, ASSET_DATA } from '../constants';
import { apiUrl } from './apiBase';

// Global cache to prevent duplicate requests for the same symbol/range
const priceCache = new Map<string, MonthlyPrice[]>();

function resolveSymbol(symbol: string): string {
  const entry = ASSET_DATA[symbol];
  return entry?.short || symbol;
}

/** "CASH" is a money market position, not the listed stock of the same ticker. */
export const CASH_SYMBOL = "CASH";

/**
 * Cash as a total return index: each month earns the 13-week US T-bill yield (^IRX, annual %)
 * of the month before. Starts at 100.
 */
async function fetchCashSeries(fromDate: string, toDate: string): Promise<MonthlyPrice[]> {
  const irx = await fetchRaw("^IRX", fromDate, toDate, true);
  const byMonth = new Map<string, number>();
  for (const p of irx) byMonth.set(p.date.substring(0, 7), p.close);
  const months = [...byMonth.keys()].sort();
  const out: MonthlyPrice[] = [];
  let level = 100;
  months.forEach((m, i) => {
    if (i > 0) level *= 1 + Math.max(0, byMonth.get(months[i - 1]) || 0) / 100 / 12;
    out.push({ date: `${m}-01T00:00:00.000Z`, close: level, volume: 0 });
  });
  return out;
}

/** Merge two monthly series by month (YYYY-MM); rows of `newer` win. */
function mergeByMonth(older: MonthlyPrice[], newer: MonthlyPrice[]): MonthlyPrice[] {
  const map = new Map<string, MonthlyPrice>();
  for (const d of older) map.set(d.date.substring(0, 7), d);
  for (const d of newer) map.set(d.date.substring(0, 7), d);
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, d]) => d);
}

const STALE_MS = 40 * 24 * 3600 * 1000;

async function fetchRaw(symbol: string, fromDate: string, toDate: string, noFallback = false): Promise<MonthlyPrice[]> {
  const actualSymbol = resolveSymbol(symbol);
  if (actualSymbol.toUpperCase() === CASH_SYMBOL) return fetchCashSeries(fromDate, toDate);
  let data: MonthlyPrice[];
  try {
    const cacheRes = await fetch(apiUrl(`/data/prices/${encodeURIComponent(actualSymbol)}.json`));
    if (cacheRes.ok) {
      const contentType = cacheRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await cacheRes.json();
        // The bundled files are snapshots: complete the months after the last cached one from the API.
        const lastCached = data.length ? new Date(data[data.length - 1].date).getTime() : 0;
        if (data.length && new Date(toDate).getTime() - lastCached > STALE_MS) {
          try {
            const from = data[data.length - 1].date.substring(0, 7) + "-01";
            const res = await fetch(apiUrl(`/api/prices/monthly/${encodeURIComponent(actualSymbol)}?from=${from}&to=${toDate}`));
            const ct = res.headers.get("content-type") || "";
            if (res.ok && ct.includes("application/json")) {
              const fresh: MonthlyPrice[] = await res.json();
              if (Array.isArray(fresh) && fresh.length) data = mergeByMonth(data, fresh);
            }
          } catch {
            // keep the cached snapshot
          }
        }
        const start = new Date(fromDate).getTime();
        const end = new Date(toDate).getTime();
        data = data.filter(d => {
          const t = new Date(d.date).getTime();
          return t >= start && t <= end;
        });
      } else {
        throw new Error("Local cache is not JSON");
      }
    } else {
      throw new Error("Cache miss");
    }
  } catch (e) {
    try {
      const res = await fetch(apiUrl(`/api/prices/monthly/${encodeURIComponent(actualSymbol)}?from=${fromDate}&to=${toDate}`));
      if (!res.ok) throw new Error(`Failed to fetch prices for ${actualSymbol}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(`Expected JSON for ${actualSymbol} prices but got ${contentType}`);
        throw new Error(`Invalid data format for ${actualSymbol}`);
      }
      
      data = await res.json();
    } catch (apiError: any) {
      // Only a documented historical proxy fund may stand in for a symbol; never substitute
      // an unrelated asset (e.g. the S&P 500) for a ticker whose data is missing.
      const proxyInfo = SIM_PROXIES[actualSymbol];
      if (noFallback || !proxyInfo) {
        throw new Error(`No price data available for ${actualSymbol}.`);
      }
      console.warn(`Monthly prices fetch failed for ${actualSymbol}, using documented proxy ${proxyInfo.proxy}.`);
      data = await fetchRaw(proxyInfo.proxy, fromDate, toDate, true);
    }
  }
  return data;
}

export async function fetchMonthlyPrices(symbol: string, fromDate: string, toDate: string, opts: { noFallback?: boolean } = {}): Promise<MonthlyPrice[]> {
  const actualSymbol = resolveSymbol(symbol);
  const cacheKey = `${actualSymbol}_${fromDate}_${toDate}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  let data = await fetchRaw(actualSymbol, fromDate, toDate, !!opts.noFallback);

  // Check if we need to apply SIM proxy
  const proxyInfo = SIM_PROXIES[actualSymbol];
  if (proxyInfo) {
    const startReq = new Date(fromDate).getTime();
    const inception = new Date(proxyInfo.date).getTime();

    if (startReq < inception) {
      // We need backfilled data
      try {
        const proxyData = await fetchRaw(proxyInfo.proxy, fromDate, proxyInfo.date);
        
        if (proxyData.length > 0 && data.length > 0) {
          // Splice them gracefully
          // Calculate a scalar to match the price at the crossover point
          // so the returns are preserved but the series is continuous
          const firstRealPoint = data[0];
          const lastProxyPoint = proxyData[proxyData.length - 1];
          
          if (firstRealPoint && lastProxyPoint) {
            const scalar = firstRealPoint.close / lastProxyPoint.close;
            const adjustedProxy = proxyData.map((p: any) => ({
              ...p,
              close: p.close * scalar,
              high: (p.high || p.close) * scalar,
              low: (p.low || p.close) * scalar,
              open: (p.open || p.close) * scalar,
              isSimulated: true
            }));
            
            // Combine them, removing any overlap month
            const realDates = new Set(data.map(d => d.date.substring(0, 7)));
            const filteredProxy = adjustedProxy.filter(p => !realDates.has(p.date.substring(0, 7)));
            
            data = [...filteredProxy, ...data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
        }
      } catch (e) {
        console.warn(`Could not backfill SIM data for ${symbol} using ${proxyInfo.proxy}:`, e);
      }
    }
  }

  priceCache.set(cacheKey, data);
  return data;
}

export async function fetchDividends(symbol: string): Promise<{ date: string, amount: number }[]> {
  const actualSymbol = resolveSymbol(symbol);
  // The cash series already includes its interest.
  if (actualSymbol.toUpperCase() === CASH_SYMBOL) return [];
  try {
    const res = await fetch(apiUrl(`/api/prices/divs/${encodeURIComponent(actualSymbol)}`));
    if (!res.ok) return [];
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Expected JSON for ${actualSymbol} dividends but got ${contentType}`);
      return [];
    }
    
    const data = await res.json();
    return data.map((d: any) => ({
      date: d.date,
      amount: d.dividend
    }));
  } catch (e) {
    console.error(`Error fetching dividends for ${actualSymbol}:`, e);
    return [];
  }
}

/**
 * Monthly prices with dividends reinvested (total return index). The price feed is not adjusted
 * for distributions, so without this bonds and T-bill funds show almost no return.
 */
export async function fetchTotalReturnPrices(symbol: string, fromDate: string, toDate: string): Promise<MonthlyPrice[]> {
  const [prices, divs] = await Promise.all([fetchMonthlyPrices(symbol, fromDate, toDate), fetchDividends(symbol)]);
  if (!divs.length || prices.length < 2) return prices;
  const divByMonth = new Map<string, number>();
  for (const d of divs) {
    const m = d.date.substring(0, 7);
    divByMonth.set(m, (divByMonth.get(m) || 0) + (d.amount || 0));
  }
  const out: MonthlyPrice[] = [{ ...prices[0] }];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].close;
    const cur = prices[i].close;
    const div = divByMonth.get(prices[i].date.substring(0, 7)) || 0;
    const growth = prev > 0 ? (cur + div) / prev : 1;
    out.push({ ...prices[i], close: out[i - 1].close * growth });
  }
  return out;
}
