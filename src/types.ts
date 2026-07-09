export interface Asset {
  label: string;
  short: string;
  region: string;
  ccy: string;
  type: string;
  color: string;
  price: number;
  change: number;
  peaEligible: boolean;
  desc: string;
  sector: string;
  exchange: string;
  inception: number;
  returns: Record<number, number>;
  expectedReturn?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  volatility?: number;
}

export interface Portfolio {
  name: string;
  alloc: Record<string, number>;
}

export interface BacktestResult {
  name: string;
  color: string;
  startYear?: number;
  endYear?: number;
  metrics: Metrics;
  years: number[];
  annualReturns: number[];
  path: number[];
  totalContributed: number;
  alloc: Record<string, number>;
  allocHistory: Record<string, number>[];
  warnings?: string[];
}

export interface Metrics {
  finalBalance: number;
  cagr: number;
  realCagr: number;
  stdev: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  bestYear: number;
  worstYear: number;
  path: number[];
  annualReturns: number[];
  rf: number;
  n: number;
  var95: number;
  cvar95: number;
  calmar: number;
  ulcer?: number;
  omega?: number;
  mddDuration?: number;
  arithMean?: number;
  geoMean?: number;
  variance?: number;
  irr?: number;
  totalContributions: number;
  monthlyReturns?: { date: string, value: number }[];
  drawdowns?: number[];
  rolling1Y?: { average: number; best: number; worst: number; count: number };
  rolling3Y?: { average: number; best: number; worst: number; count: number };
  rolling5Y?: { average: number; best: number; worst: number; count: number };
  rolling10Y?: { average: number; best: number; worst: number; count: number };
  monteCarlo?: {
    paths: number[][];
    percentiles: Record<number, number[]>;
    probabilities: {
      endingAboveInitial: number;
      hittingZero: number;
    };
  };
  correlationMatrix?: Record<string, Record<string, number>>;
  assetReturns?: { symbol: string, returns: number[] }[];
  alpha?: number;
  beta?: number;
  trackingError?: number;
  informationRatio?: number;
  upCapture?: number;
  downCapture?: number;
}

export interface MCState {
  initial: number;
  horizon: number;
  cfType: string;
  cfFreq: string;
  cfAmount: number;
  inflation: number;
  muAnnual: number;
  sigmaAnnual: number;
  sims: number;
  pathsAnnual: number[][];
  pathsMarket: number[][];
  failureMonth: number[];
  maxDrawdown: number[];
  longestUnderwater: number[];
}
