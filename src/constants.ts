import { Asset } from "./types";

export const YEARS = [1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];
export const PARTIAL_YEAR = 2026;

// The backend will populate this dynamically on startup through the API
export let ASSET_DATA: Record<string, Asset> = {};

export const FX_TO_USD: Record<string, Record<number, number>> = {
  USD: { 1992: 1, 2025: 1, 2026: 1 },
  EUR: { 1999: 1.005, 2024: 1.040, 2025: 1.1750, 2026: 1.1762 },
  GBP: { 1993: 1.503, 2024: 1.252, 2025: 1.3465, 2026: 1.3517 },
  CHF: { 1993: 0.698, 2024: 1.107, 2025: 1.0820, 2026: 1.0820 }
};

export const INFLATION: Record<string, { label: string, rates: Record<number, number> }> = {
  USD: { label: "CPI-U (US)", rates: { 1993: 2.75, 2023: 4.13, 2024: 2.90, 2025: 2.95, 2026: 2.80 } },
  EUR: { label: "HICP (Eurozone)", rates: { 1996: 2.20, 2023: 5.40, 2024: 2.40, 2025: 2.30, 2026: 2.10 } }
};

export const CASH_RATES: Record<string, Record<number, number>> = {
  USD: { 1993: 3.00, 2023: 5.02, 2024: 5.27, 2025: 4.35, 2026: 4.25 },
  EUR: { 1999: 3.00, 2023: 2.40, 2024: 3.85, 2025: 2.65, 2026: 2.40 }
};

export const SIM_PROXIES: Record<string, { proxy: string, date: string }> = {
  'VWCE.DE': { proxy: 'VTSMX', date: '2019-07-23' },
  'IWDA.AS': { proxy: 'VTSMX', date: '2009-09-25' },
  'EUNA.DE': { proxy: 'VBMFX', date: '2017-08-01' },
  'AGG': { proxy: 'VBMFX', date: '2003-09-22' },
  'BND': { proxy: 'VBMFX', date: '2007-04-03' },
  'QQQ': { proxy: 'VTSMX', date: '1999-03-10' }, // Proxy with total market before QQQ
  'SPY': { proxy: 'VTSMX', date: '1993-01-22' },
  'PE500': { proxy: 'SPY', date: '2019-07-23' },
  'PE500.PA': { proxy: 'SPY', date: '2019-07-23' },
  'PUST': { proxy: 'QQQ', date: '2014-06-25' },
  'PUST.PA': { proxy: 'QQQ', date: '2014-06-25' },
  'PAEEM': { proxy: 'EEM', date: '2019-07-23' },
  'PAEEM.PA': { proxy: 'EEM', date: '2019-07-23' },
};
