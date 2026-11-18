export interface AssetAllocation {
  symbol: string;
  weight: number; // between 0 and 1
}

/** Options shared by the momentum models. */
export interface MomentumOptions {
  /** Months skipped before measuring momentum (1 = the classic 12-1 momentum). */
  skipMonths?: number;
  /** Average of the 1, 3, 6 and 12 month returns instead of a single lookback. */
  multiPeriod?: boolean;
}

export type TacticalModel =
    | { type: 'moving_average', movingAverageMonths: number, safeAsset: string, buySignal?: 'gt' | 'gte', maType?: 'sma' | 'ema', signalSymbol?: string }
    | { type: 'seasonal', outOfMarketStartMonth: number, outOfMarketEndMonth: number, safeAsset: string }
    | ({ type: 'relative_momentum', lookbackMonths: number, topK: number, absoluteMomentum?: boolean, safeAsset?: string, weighting?: 'equal' | 'inverse_vol', volatilityMonths?: number } & MomentumOptions)
    | ({ type: 'dual_momentum', lookbackMonths: number, safeAsset: string } & MomentumOptions)
    | ({ type: 'adaptive_allocation', lookbackMonths: number, volatilityMonths: number, weighting?: 'risk_parity' | 'min_variance', topK?: number, safeAsset?: string } & MomentumOptions)
    | { type: 'target_volatility', targetVolatility: number, safeAsset: string, lookbackMonths: number }
    | { type: 'pe10', baselineEquity: string, baselineBond: string };

/** How a tactical portfolio is traded. */
export interface ExecutionOptions {
  /** Months between two decisions: 1 monthly, 3 quarterly, 12 yearly. */
  frequencyMonths?: number;
  /** 0: trade at the close the signal is computed on; 1: trade one month later. */
  signalLagMonths?: number;
  /** Trailing stop on the portfolio value, e.g. 0.15 for 15%. 0 = none. */
  trailingStop?: number;
  /** Asset held after a stop when the model has no safe asset. */
  stopAsset?: string;
  /** Exposure multiple, e.g. 1.5. 1 = no leverage. */
  leverage?: number;
  /** Annual borrowing rate for the leveraged part, e.g. 0.05. */
  borrowRate?: number;
}

export interface Portfolio {
  tacticalModel?: TacticalModel;
  execution?: ExecutionOptions;
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
  cashflowFrequency?: import('./cashflow').CashflowFrequency;
  inflationAdjusted?: boolean;
  benchmarkId?: string;
  reinvestDividends?: boolean;
  dividendTaxRate?: number; // decimal (0-1)
  capitalGainsTaxRate?: number; // decimal (0-1)
  rebalanceThreshold?: number; // decimal (e.g. 0.05 for 5%)
  transactionFeeAmount?: number; // fixed fee per transaction (e.g. 1 EUR for DEGIRO)
  /** Yearly running costs (fund fees, custody), e.g. 0.002 for 0.2%. Taken monthly. */
  annualFeeRate?: number;
  /** Cost per euro or dollar traded (slippage, stamp duty such as the Belgian TOB), e.g. 0.0017. */
  tradingCostRate?: number;
  /** Currency the results are expressed in. US dollar assets are converted month by month. */
  baseCurrency?: 'USD' | 'EUR';
}

export interface DrawdownEpisode {
  start: string;
  trough: string;
  end: string | null;
  depth: number;
  lengthMonths: number;
  recoveryMonths: number | null;
  underwaterMonths: number | null;
}

export interface BacktestMetrics {
  geometricMean?: number;
  downsideDeviation?: number;
  skewness?: number;
  excessKurtosis?: number;
  historicalVaR5?: number;
  analyticalVaR5?: number;
  conditionalVaR5?: number;
  gainLossRatio?: number;
  riskFreeAnnual?: number;
  drawdownEpisodes?: DrawdownEpisode[];
  rSquared?: number;
  correlation?: number;
  activeReturn?: number;
  treynor?: number;
  modigliani?: number;
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
