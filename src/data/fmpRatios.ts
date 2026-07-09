export interface FMPRatioDef {
  fmp_key: string;
  label: string;
  category: string;
  unit: string;
  description: string;
  typical_good_range?: string;
  is_must_have?: boolean;
}

export const FMP_RATIOS: FMPRatioDef[] = [
  // Valuation
  { fmp_key: "priceEarningsRatioTTM", label: "P/E TTM", category: "Valuation", unit: "x", description: "Price / EPS trailing 12 months", typical_good_range: "< 20x", is_must_have: false },
  { fmp_key: "priceToEarningsRatioForward", label: "P/E Forward", category: "Valuation", unit: "x", description: "Price / Forecasted EPS next 12 months", typical_good_range: "< 18x", is_must_have: false },
  { fmp_key: "pegRatioTTM", label: "PEG Ratio TTM", category: "Valuation", unit: "x", description: "P/E divided by EPS growth rate", typical_good_range: "< 1.0x", is_must_have: true },
  { fmp_key: "priceToSalesRatioTTM", label: "P/S TTM", category: "Valuation", unit: "x", description: "Market cap / Revenue TTM", typical_good_range: "< 3x", is_must_have: true },
  { fmp_key: "priceToBookRatioTTM", label: "P/B TTM", category: "Valuation", unit: "x", description: "Price / Book Value per Share", typical_good_range: "< 3x", is_must_have: true },
  { fmp_key: "priceToCashFlowRatioTTM", label: "P/CF TTM", category: "Valuation", unit: "x", description: "Price / Operating Cash Flow per Share", typical_good_range: "< 15x", is_must_have: false },
  { fmp_key: "priceToFreeCashFlowRatioTTM", label: "P/FCF TTM", category: "Valuation", unit: "x", description: "Price / Free Cash Flow per Share", typical_good_range: "< 20x", is_must_have: true },
  { fmp_key: "enterpriseValueMultipleTTM", label: "EV/EBITDA TTM", category: "Valuation", unit: "x", description: "Enterprise Value / EBITDA", typical_good_range: "< 12x", is_must_have: true },
  { fmp_key: "evToSalesTTM", label: "EV/Sales TTM", category: "Valuation", unit: "x", description: "Enterprise Value / Revenue", typical_good_range: "< 4x", is_must_have: false },
  { fmp_key: "evToFreeCashFlowTTM", label: "EV/FCF TTM", category: "Valuation", unit: "x", description: "Enterprise Value / Free Cash Flow", typical_good_range: "< 20x", is_must_have: false },
  { fmp_key: "evToOperatingCashFlowTTM", label: "EV/OCF TTM", category: "Valuation", unit: "x", description: "Enterprise Value / Operating Cash Flow", typical_good_range: "< 15x", is_must_have: false },
  { fmp_key: "earningsYieldTTM", label: "Earnings Yield TTM", category: "Valuation", unit: "%", description: "EPS / Price = 1 / P/E", typical_good_range: "> 5%", is_must_have: false },
  { fmp_key: "freeCashFlowYieldTTM", label: "FCF Yield TTM", category: "Valuation", unit: "%", description: "FCF per Share / Price", typical_good_range: "> 5%", is_must_have: true },
  { fmp_key: "dividendYieldTTM", label: "Dividend Yield TTM", category: "Valuation", unit: "%", description: "Dividend per Share / Price", typical_good_range: "2-6%", is_must_have: true },
  { fmp_key: "enterpriseValueTTM", label: "Enterprise Value TTM", category: "Valuation", unit: "USD", description: "Market Cap + Debt - Cash", typical_good_range: "n/a", is_must_have: false },
  { fmp_key: "marketCapTTM", label: "Market Cap TTM", category: "Valuation", unit: "USD", description: "Shares Outstanding * Price", typical_good_range: "n/a", is_must_have: false },
  { fmp_key: "earningsPerShareTTM", label: "EPS TTM", category: "Valuation", unit: "USD", description: "Net Income / Shares Outstanding", typical_good_range: "Growing", is_must_have: false },
  { fmp_key: "bookValuePerShareTTM", label: "BVPS TTM", category: "Valuation", unit: "USD", description: "Shareholders Equity / Shares", typical_good_range: "Growing", is_must_have: false },

  // Quality / Profitability
  { fmp_key: "grossProfitMarginTTM", label: "Gross Margin TTM", category: "Quality", unit: "%", description: "Gross Profit / Revenue", typical_good_range: "> 40%", is_must_have: true },
  { fmp_key: "operatingProfitMarginTTM", label: "Operating Margin TTM", category: "Quality", unit: "%", description: "Operating Income / Revenue", typical_good_range: "> 15%", is_must_have: true },
  { fmp_key: "netProfitMarginTTM", label: "Net Margin TTM", category: "Quality", unit: "%", description: "Net Income / Revenue", typical_good_range: "> 10%", is_must_have: true },
  { fmp_key: "pretaxProfitMarginTTM", label: "Pretax Margin TTM", category: "Quality", unit: "%", description: "EBT / Revenue", typical_good_range: "> 12%", is_must_have: false },
  { fmp_key: "ebitdaMarginTTM", label: "EBITDA Margin TTM", category: "Quality", unit: "%", description: "EBITDA / Revenue", typical_good_range: "> 20%", is_must_have: false },
  { fmp_key: "ebitMarginTTM", label: "EBIT Margin TTM", category: "Quality", unit: "%", description: "EBIT / Revenue", typical_good_range: "> 15%", is_must_have: false },
  { fmp_key: "freeCashFlowMarginTTM", label: "FCF Margin TTM", category: "Quality", unit: "%", description: "Free Cash Flow / Revenue", typical_good_range: "> 10%", is_must_have: true },
  { fmp_key: "returnOnAssetsTTM", label: "ROA TTM", category: "Quality", unit: "%", description: "Net Income / Total Assets", typical_good_range: "> 5%", is_must_have: true },
  { fmp_key: "returnOnEquityTTM", label: "ROE TTM", category: "Quality", unit: "%", description: "Net Income / Shareholders Equity", typical_good_range: "> 15%", is_must_have: true },
  { fmp_key: "returnOnCapitalEmployedTTM", label: "ROCE TTM", category: "Quality", unit: "%", description: "EBIT / Capital Employed", typical_good_range: "> 15%", is_must_have: false },
  { fmp_key: "returnOnInvestedCapitalTTM", label: "ROIC TTM", category: "Quality", unit: "%", description: "NOPAT / Invested Capital", typical_good_range: "> 15%", is_must_have: true },
  { fmp_key: "effectiveTaxRateTTM", label: "Tax Rate TTM", category: "Quality", unit: "%", description: "Income Tax Expense / EBT", typical_good_range: "15-25%", is_must_have: false },
  { fmp_key: "incomeQualityTTM", label: "Income Quality TTM", category: "Quality", unit: "x", description: "Operating Cash Flow / Net Income", typical_good_range: "> 1.0x", is_must_have: false },
  { fmp_key: "cashReturnOnInvestedCapitalTTM", label: "CROIC TTM", category: "Quality", unit: "%", description: "Free Cash Flow / Invested Capital", typical_good_range: "> 10%", is_must_have: false },
  { fmp_key: "operatingCashFlowPerShareTTM", label: "OCF/Share TTM", category: "Quality", unit: "USD", description: "Operating Cash Flow / Shares", typical_good_range: "Growing", is_must_have: false },
  { fmp_key: "freeCashFlowPerShareTTM", label: "FCF/Share TTM", category: "Quality", unit: "USD", description: "Free Cash Flow / Shares", typical_good_range: "Growing", is_must_have: false },
  { fmp_key: "revenuePerShareTTM", label: "Revenue/Share TTM", category: "Quality", unit: "USD", description: "Revenue / Shares Outstanding", typical_good_range: "Growing", is_must_have: false },
  { fmp_key: "cashPerShareTTM", label: "Cash/Share TTM", category: "Quality", unit: "USD", description: "Cash & Equivalents / Shares", typical_good_range: "n/a", is_must_have: false },
  { fmp_key: "salesGeneralAndAdministrativeToRevenueTTM", label: "SG&A/Sales TTM", category: "Quality", unit: "%", description: "SG&A Expense / Revenue", typical_good_range: "< 20%", is_must_have: false },
  { fmp_key: "researchAndDevelopementToRevenueTTM", label: "R&D/Sales TTM", category: "Quality", unit: "%", description: "R&D Expense / Revenue", typical_good_range: "Varies by sector", is_must_have: false },

  // Financial Strength / Solvency
  { fmp_key: "currentRatioTTM", label: "Current Ratio TTM", category: "Financial Strength", unit: "x", description: "Current Assets / Current Liabilities", typical_good_range: "> 1.5x", is_must_have: true },
  { fmp_key: "quickRatioTTM", label: "Quick Ratio TTM", category: "Financial Strength", unit: "x", description: "(Cash + Receivables) / Current Liabilities", typical_good_range: "> 1.0x", is_must_have: false },
  { fmp_key: "cashRatioTTM", label: "Cash Ratio TTM", category: "Financial Strength", unit: "x", description: "Cash / Current Liabilities", typical_good_range: "> 0.5x", is_must_have: false },
  { fmp_key: "debtRatioTTM", label: "Debt Ratio TTM", category: "Financial Strength", unit: "x", description: "Total Debt / Total Assets", typical_good_range: "< 0.5x", is_must_have: false },
  { fmp_key: "debtEquityRatioTTM", label: "Debt/Equity TTM", category: "Financial Strength", unit: "x", description: "Total Debt / Shareholders Equity", typical_good_range: "< 1.0x", is_must_have: true },
  { fmp_key: "longTermDebtToCapitalizationTTM", label: "LT Debt/Cap TTM", category: "Financial Strength", unit: "%", description: "Long Term Debt / (LT Debt + Equity)", typical_good_range: "< 40%", is_must_have: false },
  { fmp_key: "totalDebtToCapitalizationTTM", label: "Total Debt/Cap TTM", category: "Financial Strength", unit: "%", description: "Total Debt / (Total Debt + Equity)", typical_good_range: "< 50%", is_must_have: false },
  { fmp_key: "interestCoverageTTM", label: "Interest Coverage TTM", category: "Financial Strength", unit: "x", description: "EBIT / Interest Expense", typical_good_range: "> 5x", is_must_have: true },
  { fmp_key: "cashFlowToDebtRatioTTM", label: "CF/Debt TTM", category: "Financial Strength", unit: "x", description: "Operating Cash Flow / Total Debt", typical_good_range: "> 0.2x", is_must_have: false },
  { fmp_key: "companyEquityMultiplierTTM", label: "Equity Multiplier TTM", category: "Financial Strength", unit: "x", description: "Total Assets / Shareholders Equity", typical_good_range: "< 3x", is_must_have: false },
  { fmp_key: "netDebtToEBITDATTM", label: "Net Debt/EBITDA TTM", category: "Financial Strength", unit: "x", description: "(Total Debt - Cash) / EBITDA", typical_good_range: "< 3x", is_must_have: true },
  { fmp_key: "shortTermCoverageRatiosTTM", label: "Short Term Coverage TTM", category: "Financial Strength", unit: "x", description: "Operating Cash Flow / Short Term Debt", typical_good_range: "> 1x", is_must_have: false },
  { fmp_key: "capitalExpenditureCoverageRatioTTM", label: "Capex Coverage TTM", category: "Financial Strength", unit: "x", description: "Operating Cash Flow / Capex", typical_good_range: "> 2x", is_must_have: false },
  { fmp_key: "dividendPayoutRatioTTM", label: "Payout Ratio TTM", category: "Financial Strength", unit: "%", description: "Dividend / Net Income", typical_good_range: "< 60%", is_must_have: true },
  { fmp_key: "altmanZScore", label: "Altman Z-Score", category: "Financial Strength", unit: "score", description: "Bankruptcy prediction model", typical_good_range: "> 3.0 = Safe", is_must_have: true },

  // Efficiency / Operating
  { fmp_key: "assetTurnoverTTM", label: "Asset Turnover TTM", category: "Efficiency", unit: "x", description: "Revenue / Total Assets", typical_good_range: "> 0.5x", is_must_have: true },
  { fmp_key: "fixedAssetTurnoverTTM", label: "Fixed Asset Turnover TTM", category: "Efficiency", unit: "x", description: "Revenue / Fixed Assets", typical_good_range: "> 1.0x", is_must_have: false },
  { fmp_key: "inventoryTurnoverTTM", label: "Inventory Turnover TTM", category: "Efficiency", unit: "x", description: "Cost of Goods Sold / Inventory", typical_good_range: "> 5x", is_must_have: false },
  { fmp_key: "receivablesTurnoverTTM", label: "Receivables Turnover TTM", category: "Efficiency", unit: "x", description: "Revenue / Accounts Receivable", typical_good_range: "> 5x", is_must_have: false },
  { fmp_key: "payablesTurnoverTTM", label: "Payables Turnover TTM", category: "Efficiency", unit: "x", description: "Cost of Goods Sold / Accounts Payable", typical_good_range: "Varies", is_must_have: false },
  { fmp_key: "daysOfSalesOutstandingTTM", label: "DSO TTM", category: "Efficiency", unit: "days", description: "Average days to collect revenue", typical_good_range: "< 45 days", is_must_have: false },
  { fmp_key: "daysOfInventoryOnHandTTM", label: "DIO TTM", category: "Efficiency", unit: "days", description: "Average days inventory is held", typical_good_range: "< 60 days", is_must_have: false },
  { fmp_key: "daysOfPayablesOutstandingTTM", label: "DPO TTM", category: "Efficiency", unit: "days", description: "Average days to pay suppliers", typical_good_range: "> 30 days", is_must_have: false },
  { fmp_key: "operatingCycleTTM", label: "Operating Cycle TTM", category: "Efficiency", unit: "days", description: "DSO + DIO", typical_good_range: "Varies", is_must_have: false },
  { fmp_key: "cashConversionCycleTTM", label: "Cash Conversion Cycle TTM", category: "Efficiency", unit: "days", description: "DSO + DIO - DPO", typical_good_range: "< 45 days", is_must_have: true },
  { fmp_key: "workingCapitalTurnoverTTM", label: "WC Turnover TTM", category: "Efficiency", unit: "x", description: "Revenue / Working Capital", typical_good_range: "> 1x", is_must_have: false },
  { fmp_key: "tangibleAssetValueTTM", label: "Tangible Assets", category: "Efficiency", unit: "USD", description: "Total Assets - Intangible Assets - Liabilities", typical_good_range: "n/a", is_must_have: false },

  // Growth
  { fmp_key: "revenueGrowthTTM", label: "Revenue Growth TTM", category: "Growth", unit: "%", description: "Revenue growth over last 12 months", typical_good_range: "> 5%", is_must_have: true },
  { fmp_key: "revenueGrowth5Y", label: "Revenue Growth (5Y)", category: "Growth", unit: "%", description: "Revenue growth over 5 years", typical_good_range: "> 5%", is_must_have: false },
  { fmp_key: "epsGrowthTTM", label: "EPS Growth TTM", category: "Growth", unit: "%", description: "EPS growth over last 12 months", typical_good_range: "> 10%", is_must_have: true },
  { fmp_key: "epsGrowth5Y", label: "EPS Growth (5Y)", category: "Growth", unit: "%", description: "EPS growth over 5 years", typical_good_range: "> 10%", is_must_have: false },
  { fmp_key: "ebitdaGrowthTTM", label: "EBITDA Growth TTM", category: "Growth", unit: "%", description: "EBITDA growth over last 12 months", typical_good_range: "> 8%", is_must_have: false },
  { fmp_key: "operatingCashFlowGrowthTTM", label: "OCF Growth TTM", category: "Growth", unit: "%", description: "Operating Cash Flow growth over last 12 months", typical_good_range: "> 8%", is_must_have: false },
  { fmp_key: "freeCashFlowGrowthTTM", label: "FCF Growth TTM", category: "Growth", unit: "%", description: "Free Cash Flow growth over last 12 months", typical_good_range: "> 8%", is_must_have: true },
  { fmp_key: "bookValueGrowthTTM", label: "Book Value Growth TTM", category: "Growth", unit: "%", description: "Book Value growth over last 12 months", typical_good_range: "> 5%", is_must_have: false },

  // Capital Allocation
  { fmp_key: "capexToRevenueTTM", label: "CapEx / Revenue TTM", category: "Capital Allocation", unit: "%", description: "Capital Expenditures / Revenue", typical_good_range: "< 10%", is_must_have: true },
  { fmp_key: "capexToOperatingCashFlowTTM", label: "CapEx / OCF TTM", category: "Capital Allocation", unit: "%", description: "Capital Expenditures / Operating Cash Flow", typical_good_range: "< 50%", is_must_have: false },
  { fmp_key: "capexToDepreciationTTM", label: "CapEx / D&A TTM", category: "Capital Allocation", unit: "x", description: "Capital Expenditures / Depreciation & Amortization", typical_good_range: "> 1x", is_must_have: false },
  { fmp_key: "stockBasedCompensationToRevenueTTM", label: "SBC / Revenue TTM", category: "Capital Allocation", unit: "%", description: "Stock-Based Compensation / Revenue", typical_good_range: "< 3%", is_must_have: false },
  { fmp_key: "grahamNumberTTM", label: "Graham Number TTM", category: "Capital Allocation", unit: "USD", description: "Square root of (22.5 x EPS x BVPS)", typical_good_range: "> Price", is_must_have: false },

  // Accounting Health
  { fmp_key: "piotroskiScore", label: "Piotroski F-Score", category: "Accounting Health", unit: "score", description: "Score out of 9 indicating financial health", typical_good_range: "7-9", is_must_have: true },
  { fmp_key: "accrualsRatioTTM", label: "Accruals Ratio TTM", category: "Accounting Health", unit: "%", description: "(Net Income - Operating Cash Flow) / Total Assets", typical_good_range: "< 5%", is_must_have: false },
  { fmp_key: "debtServiceCoverageRatioTTM", label: "DSCR TTM", category: "Accounting Health", unit: "x", description: "Operating Income / Debt Service", typical_good_range: "> 1.5x", is_must_have: false },
  { fmp_key: "dividendYieldIndicatedAnnualTTM", label: "Indicated Div Yield", category: "Accounting Health", unit: "%", description: "Indicated Annual Dividend / Price", typical_good_range: "Varies", is_must_have: false }
];
