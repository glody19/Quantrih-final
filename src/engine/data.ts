import { MonthlyPrice } from './types';
import { SIM_PROXIES, ASSET_DATA } from '../constants';

// Global cache to prevent duplicate requests for the same symbol/range
const priceCache = new Map<string, MonthlyPrice[]>();

function resolveSymbol(symbol: string): string {
  const entry = ASSET_DATA[symbol];
  return entry?.short || symbol;
}

async function fetchRaw(symbol: string, fromDate: string, toDate: string): Promise<MonthlyPrice[]> {
  const actualSymbol = resolveSymbol(symbol);
  let data: MonthlyPrice[];
  try {
    const cacheRes = await fetch(`/data/prices/${encodeURIComponent(actualSymbol)}.json`);
    if (cacheRes.ok) {
      const contentType = cacheRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await cacheRes.json();
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
      const res = await fetch(`/api/prices/monthly/${encodeURIComponent(actualSymbol)}?from=${fromDate}&to=${toDate}`);
      if (!res.ok) throw new Error(`Failed to fetch prices for ${actualSymbol}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(`Expected JSON for ${actualSymbol} prices but got ${contentType}`);
        throw new Error(`Invalid data format for ${actualSymbol}`);
      }
      
      data = await res.json();
    } catch (apiError: any) {
      console.warn(`Monthly prices fetch failed for ${actualSymbol}, trying proxy fallback. Error:`, apiError?.message || apiError);
      const proxyInfo = SIM_PROXIES[actualSymbol];
      const fallbackSymbol = proxyInfo ? proxyInfo.proxy : 'SPY';
      console.warn(`Falling back from ${actualSymbol} to ${fallbackSymbol}`);
      try {
        data = await fetchRaw(fallbackSymbol, fromDate, toDate);
      } catch (fallbackError) {
        console.error(`Severe: fallback also failed for ${fallbackSymbol}`, fallbackError);
        throw apiError;
      }
    }
  }
  return data;
}

export async function fetchMonthlyPrices(symbol: string, fromDate: string, toDate: string): Promise<MonthlyPrice[]> {
  const actualSymbol = resolveSymbol(symbol);
  const cacheKey = `${actualSymbol}_${fromDate}_${toDate}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  let data = await fetchRaw(actualSymbol, fromDate, toDate);

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
  try {
    const res = await fetch(`/api/prices/divs/${encodeURIComponent(actualSymbol)}`);
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
