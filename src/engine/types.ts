export interface AssetAllocation {
  symbol: string;
  weight: number; // between 0 and 1
}

export type TacticalModel =
    | { type: 'moving_average', movingAverageMonths: number, safeAsset: string }
    | { type: 'relative_momentum', lookbackMonths: number, topK: number }
    | { type: 'dual_momentum', lookbackMonths: number, safeAsset: string }
    | { type: 'adaptive_allocation', lookbackMonths: number, volatilityMonths: number }
    | { type: 'target_volatility', targetVolatility: number, safeAsset: string, lookbackMonths: number }
    | { type: 'pe10', baselineEquity: string, baselineBond: string };

export interface Portfolio {
  tacticalModel?: TacticalModel;
  id: string;
  name: string;
  allocations: AssetAllocation[];
}

export interface BacktestOptions {
  initialBalance: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  rebalanceFrequency: 'monthly' | 'quarterly' | 'annually' | 'none';
  riskFreeRate?: number;
  cashflowAmount?: number;
  cashflowFrequency?: 'monthly' | 'annually' | 'none';
  inflationAdjusted?: boolean;
  benchmarkId?: string;
  reinvestDividends?: boolean;
  dividendTaxRate?: number; // decimal (0-1)
  capitalGainsTaxRate?: number; // decimal (0-1)
  rebalanceThreshold?: number; // decimal (e.g. 0.05 for 5%)
  transactionFeeAmount?: number; // fixed fee per transaction (e.g. 1 EUR for DEGIRO)
}

export interface BacktestMetrics {
  endBalance: number;
  startBalance?: number;
  cagr: number;
  irr?: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  bestYear: number;
  worstYear: number;
  drawdowns: number[]; // added drawdowns array
  monthlyReturns?: { date: string, value: number }[];
  annualReturns?: number[];
  n?: number;
  var95?: number;
  cvar95?: number;
  calmar?: number;
  marketCorrelation?: number;
  positiveMonths?: number;
  arithMean?: number;
  path?: number[];
  finalBalance?: number;
  totalContributions?: number;
  realCagr?: number;
  rolling1Y?: { average: number, best: number, worst: number, count: number } | null;
  rolling3Y?: { average: number, best: number, worst: number, count: number } | null;
  rolling5Y?: { average: number, best: number, worst: number, count: number } | null;
  rolling10Y?: { average: number, best: number, worst: number, count: number } | null;
  monteCarlo?: {
    paths: number[][];
    percentiles: Record<number, number[]>;
    probabilities: {
      endingAboveInitial: number;
      hittingZero: number;
    };
  } | null;
  correlationMatrix?: Record<string, Record<string, number>> | null;
  assetReturns?: { symbol: string, returns: number[] }[];
  alpha?: number;
  beta?: number;
  trackingError?: number;
  informationRatio?: number;
  upCapture?: number;
  downCapture?: number;
}

export interface EquityDataPoint {
  date: string;
  value: number;
  cashflow?: number; // Cashflow added AT THE START of this period
  holdings?: Record<string, number>; // symbol -> value
}

export interface MonthlyPrice {
  date: string;
  close: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  normalizedDate?: string; // YYYY-MM
  isSimulated?: boolean;
}

export interface BacktestResult {
  portfolioId: string;
  metrics: BacktestMetrics;
  equityCurve: EquityDataPoint[];
  assets?: AssetResult[]; // Added to allow correlation and MC analysis
  warnings?: string[];
}

export interface AssetResult {
  symbol: string;
  equityCurve: EquityDataPoint[];
  monthlyReturns: number[];
}
