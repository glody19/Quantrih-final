import { Portfolio, BacktestOptions } from '../engine/types';

export interface SharedBacktest {
  portfolios: Portfolio[];
  config: Partial<BacktestOptions>;
}

export function encodeBacktest(b: SharedBacktest): string {
  const json = JSON.stringify(b);
  // base64url encoding (safe in URLs)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBacktest(encoded: string): SharedBacktest | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode backtest:', e);
    return null;
  }
}
