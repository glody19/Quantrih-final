import Constants from "expo-constants";
import { setApiBase } from "@shared/engine/apiBase";

/** Origin of the Quantrih API (the website). Set in app.json under expo.extra.apiBase. */
export const API_BASE: string = (Constants.expoConfig?.extra as any)?.apiBase || "https://quantrih.com";

// The shared backtest engine fetches prices with relative URLs: point it at the website.
setApiBase(API_BASE);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getJson<T>(path: string, timeoutMs = 15000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE + path, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export interface Quote {
  symbol: string;
  shortName?: string;
  regularMarketPrice: number | null;
  regularMarketChange: number | null;
  regularMarketChangePercent: number | null;
  currency?: string;
  trailingPE?: number;
  marketCap?: number;
}

/** Up to 20 quotes in one call (the API takes a comma separated list). */
export function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (!symbols.length) return Promise.resolve([]);
  return getJson<Quote[]>(`/api/stock/bulk-quotes?symbols=${symbols.slice(0, 20).map(encodeURIComponent).join(",")}`);
}

export interface SearchHit {
  symbol: string;
  label: string;
  exchange: string | null;
  type: string;
}

export async function searchSymbols(q: string): Promise<SearchHit[]> {
  if (q.trim().length < 1) return [];
  const data = await getJson<{ result?: SearchHit[] }>(`/api/stock/search?q=${encodeURIComponent(q.trim())}`);
  return (data.result || []).filter((x) => x && x.symbol).slice(0, 20);
}

export type Ratios = Record<string, number | string | null>;

export const fetchRatios = (symbol: string) => getJson<Ratios>(`/api/stock/ratios/${encodeURIComponent(symbol)}`);

export interface IncomeRow { calendarYear: string; revenue?: number; netIncome?: number; operatingIncome?: number; eps?: number }

export const fetchFinancials = (symbol: string) =>
  getJson<{ income: IncomeRow[] }>(`/api/stock/financials/${encodeURIComponent(symbol)}?type=annual`);

export interface AssetQuote {
  quote: {
    symbol: string;
    name?: string;
    price?: number;
    change?: number;
    changesPercentage?: number;
    yearHigh?: number;
    yearLow?: number;
    marketCap?: number;
    pe?: number;
    eps?: number;
    currency?: string | null;
    quoteType?: string | null;
    fullExchangeName?: string | null;
  };
  profile: { description?: string; sector?: string; industry?: string; country?: string | null; website?: string } | null;
}

export const fetchAssetQuote = (symbol: string) => getJson<AssetQuote>(`/api/stock/quote/${encodeURIComponent(symbol)}`);

export type HistoryRange = "1mo" | "6mo" | "1y" | "5y" | "max";

export const fetchHistory = (symbol: string, range: HistoryRange) =>
  getJson<{ date: string; close: number }[]>(
    `/api/stock/history/${encodeURIComponent(symbol)}?range=${range}&interval=${range === "1mo" ? "1d" : range === "6mo" || range === "1y" ? "1d" : "1wk"}`,
  );
