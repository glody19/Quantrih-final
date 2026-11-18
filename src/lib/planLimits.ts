/**
 * Plans and their limits, without any React or Firebase import so the mobile app can share them.
 */
export type PlanId = "free" | "premium" | "pro";

export interface PlanLimits {
  /** Portfolios compared in one backtest. */
  maxPortfolios: number;
  /** Longest backtest period in years (Infinity = full history). */
  maxYears: number;
  /** PDF reports per calendar month (Infinity = unlimited). */
  pdfPerMonth: number;
  /** Logo, company and advisor name on the PDF. */
  branding: boolean;
  /** PDF without any Quantrih mention, with the firm's colour. */
  whiteLabel: boolean;
  /** Saved analyses kept in the account. */
  maxSaved: number;
  /** Portfolios shown side by side in the comparison workspace. */
  compareMax: number;
  /** CSV export of saved results and comparisons. */
  csv: boolean;
  /** Notes and tags on saved analyses. */
  notes: boolean;
  /** Fundamental analysis: none, core (statements and key ratios) or full (history, valuation, peers). */
  fundamentals: "none" | "core" | "full";
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxPortfolios: 3, maxYears: 20, pdfPerMonth: 1, branding: false, whiteLabel: false, maxSaved: 5, compareMax: 2, csv: false, notes: false, fundamentals: "none" },
  premium: { maxPortfolios: 6, maxYears: Infinity, pdfPerMonth: 10, branding: true, whiteLabel: false, maxSaved: 100, compareMax: 4, csv: true, notes: true, fundamentals: "core" },
  pro: { maxPortfolios: 10, maxYears: Infinity, pdfPerMonth: Infinity, branding: true, whiteLabel: true, maxSaved: Infinity, compareMax: 8, csv: true, notes: true, fundamentals: "full" },
};

export const PLAN_PRICES: Record<PlanId, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 15, yearly: 150 },
  pro: { monthly: 40, yearly: 400 },
};

export const PLAN_NAMES: Record<PlanId, string> = { free: "Freemium", premium: "Premium", pro: "Pro" };
