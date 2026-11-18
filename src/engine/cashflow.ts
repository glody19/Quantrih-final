/**
 * Periodic contributions and withdrawals.
 * Prices are monthly, so a weekly amount is booked once a month as 52/12 times the weekly amount.
 * Other frequencies fall on calendar months: quarterly in Jan/Apr/Jul/Oct, every four months in
 * Jan/May/Sep, twice a year in Jan/Jul, yearly in January.
 */
export type CashflowFrequency =
  | 'none'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'quadrimester'
  | 'semiannually'
  | 'annually';

const STEP: Record<Exclude<CashflowFrequency, 'none'>, number> = {
  weekly: 1,
  monthly: 1,
  quarterly: 3,
  quadrimester: 4,
  semiannually: 6,
  annually: 12,
};

/** Months between two payments (weekly counts as every month). */
export function cashflowStepMonths(freq: CashflowFrequency | string | undefined): number {
  if (!freq || freq === 'none') return 0;
  if (freq === 'annual' || freq === 'yearly') return 12;
  return STEP[freq as keyof typeof STEP] ?? 0;
}

/** How many payments one monthly booking stands for. */
export function cashflowMonthlyMultiplier(freq: CashflowFrequency | string | undefined): number {
  return freq === 'weekly' ? 52 / 12 : 1;
}

/** Is a payment due in this month? `monthOfYear` is 1..12 for calendar months (or any counter starting at 1). */
export function isCashflowMonth(freq: CashflowFrequency | string | undefined, monthOfYear: number): boolean {
  const step = cashflowStepMonths(freq);
  if (!step) return false;
  return (monthOfYear - 1) % step === 0;
}

/** Number of payments in a year, used to show yearly totals. */
export function paymentsPerYear(freq: CashflowFrequency | string | undefined): number {
  if (freq === 'weekly') return 52;
  const step = cashflowStepMonths(freq);
  return step ? 12 / step : 0;
}
