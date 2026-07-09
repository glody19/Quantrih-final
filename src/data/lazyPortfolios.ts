export interface LazyHolding {
  ticker: string;
  weight: number; // percent
}

export type LazyCategory =
  | 'Risk Parity' | 'Bogleheads' | 'Dividend' | 'Crypto'
  | 'Technology' | 'FIRE' | 'Defensive' | 'Single-ETF'
  | 'Factor Investing' | 'Income' | 'Glide Path';

export type LazyTag =
  | 'low-maintenance' | 'tax-efficient' | 'eu-investor' | 'pea-eligible'
  | 'income-focused' | 'inflation-hedge' | 'crash-proof' | 'high-growth';

export interface LazyPortfolio {
  id: string;             // slug unique kebab-case
  name: string;
  author: string;
  description: string;
  philosophy: string;     // 2-3 phrases pédagogiques sur la stratégie
  category: LazyCategory;
  tags: LazyTag[];        // ex: ['low-maintenance', 'tax-efficient', 'eu-investor']
  holdings: LazyHolding[];
  rebalance: 'none' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'threshold';
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  region: 'US' | 'EU' | 'Global' | 'EM';
  imageUrl?: string;
}

export const LAZY_PORTFOLIOS: LazyPortfolio[] = [
  {
    id: 'all-weather',
    name: 'All Weather',
    author: 'Ray Dalio',
    description: 'Designed to perform across all economic seasons.',
    philosophy: 'Aims to balance risk across four economic environments: rising growth, falling growth, rising inflation, and falling inflation.',
    category: 'Risk Parity',
    tags: ['low-maintenance', 'inflation-hedge', 'crash-proof'],
    holdings: [
      { ticker: 'VTI', weight: 30 },
      { ticker: 'TLT', weight: 40 },
      { ticker: 'IEF', weight: 15 },
      { ticker: 'GLD', weight: 7.5 },
      { ticker: 'DBC', weight: 7.5 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global',
    imageUrl: 'https://images.unsplash.com/photo-1611974717482-1ae363673e4a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'buffett-90-10',
    name: 'Warren Buffett 90/10',
    author: 'Warren Buffett',
    description: 'Aggressive 90% stock, 10% bond allocation.',
    philosophy: 'Simplicity at its finest. 90% low-cost S&P 500 index fund for growth, 10% short-term government bonds for safety and dry powder.',
    category: 'Bogleheads',
    tags: ['low-maintenance', 'tax-efficient', 'high-growth'],
    holdings: [
      { ticker: 'VOO', weight: 90 },
      { ticker: 'VGSH', weight: 10 }
    ],
    rebalance: 'annual',
    riskLevel: 'High',
    region: 'US',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'golden-butterfly',
    name: 'Golden Butterfly',
    author: 'Tyler',
    description: 'A higher-yielding variant of the Permanent Portfolio.',
    philosophy: 'Balances five assets equally to capture growth while minimizing drawdowns. Great for those who want smooth returns with gold and small-cap value tilt.',
    category: 'Risk Parity',
    tags: ['low-maintenance', 'crash-proof', 'inflation-hedge'],
    holdings: [
      { ticker: 'VTI', weight: 20 },
      { ticker: 'VBR', weight: 20 },
      { ticker: 'TLT', weight: 20 },
      { ticker: 'SHY', weight: 20 },
      { ticker: 'GLD', weight: 20 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'US',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'permanent-portfolio',
    name: 'Permanent Portfolio',
    author: 'Harry Browne',
    description: 'Ultra-stable 4-asset equal-weight allocation.',
    philosophy: 'Built to survive any economic environment by allocating equally to stocks, long-term bonds, cash, and gold. Designed for capital preservation.',
    category: 'Risk Parity',
    tags: ['low-maintenance', 'crash-proof', 'inflation-hedge'],
    holdings: [
      { ticker: 'VTI', weight: 25 },
      { ticker: 'TLT', weight: 25 },
      { ticker: 'BIL', weight: 25 },
      { ticker: 'GLD', weight: 25 }
    ],
    rebalance: 'annual',
    riskLevel: 'Low',
    region: 'US',
    imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'bogleheads-3-fund',
    name: 'Bogleheads 3-Fund',
    author: 'Bogleheads',
    description: 'The standard for passive indexing.',
    philosophy: 'Total US Stock, Total International Stock, and Total Bond. Covers almost every publicly traded company in the world.',
    category: 'Bogleheads',
    tags: ['low-maintenance', 'tax-efficient'],
    holdings: [
      { ticker: 'VTI', weight: 60 },
      { ticker: 'VXUS', weight: 30 },
      { ticker: 'BND', weight: 10 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'swedroe-factor',
    name: 'Larry Swedroe Factor Tilt',
    author: 'Larry Swedroe',
    description: 'Emphasizes low-beta and small-value factors.',
    philosophy: 'Tilts towards Small-Cap Value while keeping stocks low. The goal is to maximize the expected return per unit of exposure to the market.',
    category: 'Factor Investing',
    tags: ['low-maintenance', 'high-growth'],
    holdings: [
      { ticker: 'VTI', weight: 30 },
      { ticker: 'VTV', weight: 30 },
      { ticker: 'VBR', weight: 15 },
      { ticker: 'BND', weight: 25 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'US'
  },
  {
    id: 'coffeehouse',
    name: 'Coffeehouse',
    author: 'Bill Schultheis',
    description: 'Diversified equity strategy with 40% bonds.',
    philosophy: 'Uses a mix of asset classes to capture market returns without the stress of active trading.',
    category: 'Income',
    tags: ['low-maintenance', 'income-focused'],
    holdings: [
      { ticker: 'VTI', weight: 10 },
      { ticker: 'VTV', weight: 10 },
      { ticker: 'VBR', weight: 10 },
      { ticker: 'VB', weight: 10 },
      { ticker: 'VEA', weight: 10 },
      { ticker: 'VNQ', weight: 10 },
      { ticker: 'BND', weight: 40 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'US'
  },
  {
    id: 'yale-ivy',
    name: 'Yale Endowment / Ivy',
    author: 'David Swensen / Meb Faber',
    description: 'Institutional-style diversification for retail.',
    philosophy: 'Follows the endowment model by diversifying into international stocks, real estate, and commodities to reduce volatility.',
    category: 'Risk Parity',
    tags: ['low-maintenance', 'inflation-hedge'],
    holdings: [
      { ticker: 'VTI', weight: 30 },
      { ticker: 'VEA', weight: 15 },
      { ticker: 'VWO', weight: 5 },
      { ticker: 'BND', weight: 20 },
      { ticker: 'VNQ', weight: 20 },
      { ticker: 'GLD', weight: 10 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'no-brainer',
    name: 'No Brainer',
    author: 'Bill Bernstein',
    description: 'Simple 4-asset equal-weight stock/bond mix.',
    philosophy: 'Equal allocation to US Large Cap, US Small Cap, International Stocks, and Bonds.',
    category: 'Bogleheads',
    tags: ['low-maintenance', 'tax-efficient'],
    holdings: [
      { ticker: 'VTI', weight: 25 },
      { ticker: 'VEA', weight: 25 },
      { ticker: 'VBR', weight: 25 },
      { ticker: 'BND', weight: 25 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'sandwich-portfolio',
    name: 'Sandwich',
    author: 'Generic',
    description: 'Complex multi-asset diversification.',
    philosophy: 'Layers multiple asset classes to provide a robust return profile across various market conditions.',
    category: 'Risk Parity',
    tags: ['low-maintenance'],
    holdings: [
      { ticker: 'VTI', weight: 20 },
      { ticker: 'VBR', weight: 6 },
      { ticker: 'VEA', weight: 10 },
      { ticker: 'VSS', weight: 8 },
      { ticker: 'VWO', weight: 6 },
      { ticker: 'VNQ', weight: 6 },
      { ticker: 'IEF', weight: 4 },
      { ticker: 'BSV', weight: 30 },
      { ticker: 'GLD', weight: 5 },
      { ticker: 'BND', weight: 5 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'fire-4-percent',
    name: 'FIRE 4%',
    author: 'Generic',
    description: 'Classic FIRE retirement portfolio.',
    philosophy: 'Designed to support a 4% withdrawal rate over a long retirement.',
    category: 'FIRE',
    tags: ['low-maintenance', 'income-focused'],
    holdings: [
      { ticker: 'VTI', weight: 60 },
      { ticker: 'VXUS', weight: 20 },
      { ticker: 'BND', weight: 15 },
      { ticker: 'BIL', weight: 5 }
    ],
    rebalance: 'annual',
    riskLevel: 'High',
    region: 'Global'
  },
  {
    id: 'bond-ladder',
    name: 'Bond Ladder',
    author: 'Generic',
    description: 'Safety-first treasury ladder.',
    philosophy: 'Spans multiple maturity dates to manage interest rate risk and provide liquidity.',
    category: 'Defensive',
    tags: ['low-maintenance', 'income-focused', 'crash-proof'],
    holdings: [
      { ticker: 'SHY', weight: 25 },
      { ticker: 'IEF', weight: 25 },
      { ticker: 'TLT', weight: 25 },
      { ticker: 'LQD', weight: 25 }
    ],
    rebalance: 'annual',
    riskLevel: 'Low',
    region: 'US'
  },
  {
    id: 'vanguard-target-2050',
    name: 'Vanguard Target Retirement 2050',
    author: 'Vanguard',
    description: 'Automated glide path strategy.',
    philosophy: 'Diversified mix that becomes more conservative as the target date approaches.',
    category: 'Glide Path',
    tags: ['low-maintenance', 'tax-efficient'],
    holdings: [
      { ticker: 'VTI', weight: 54 },
      { ticker: 'VXUS', weight: 36 },
      { ticker: 'BND', weight: 6 },
      { ticker: 'BNDX', weight: 4 }
    ],
    rebalance: 'quarterly',
    riskLevel: 'High',
    region: 'Global'
  },
  {
    id: 'pinwheel',
    name: 'Pinwheel',
    author: 'PortfolioCharts',
    description: 'Modern diversification with high efficiency.',
    philosophy: 'Allocates across 6 non-correlated assets to maximize risk-adjusted returns.',
    category: 'Risk Parity',
    tags: ['low-maintenance', 'crash-proof'],
    holdings: [
      { ticker: 'VTI', weight: 20 },
      { ticker: 'VBR', weight: 20 },
      { ticker: 'VEA', weight: 20 },
      { ticker: 'IEF', weight: 20 },
      { ticker: 'GLD', weight: 10 },
      { ticker: 'VNQ', weight: 10 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'bogleheads-4-fund',
    name: 'Bogleheads 4-Fund',
    author: 'Bogleheads',
    description: '3-fund + REIT tilt.',
    philosophy: 'Adds Real Estate (REITs) to the standard 3-fund portfolio for extra diversification and income.',
    category: 'Bogleheads',
    tags: ['low-maintenance', 'income-focused'],
    holdings: [
      { ticker: 'VTI', weight: 48 },
      { ticker: 'VXUS', weight: 24 },
      { ticker: 'VNQ', weight: 8 },
      { ticker: 'BND', weight: 20 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'bogleheads-2-fund',
    name: 'Bogleheads 2-Fund',
    author: 'Bogleheads',
    description: 'The absolute simplest balanced portfolio.',
    philosophy: 'Uses VT (Total World Stock) and BND (Total bond market) to capture everything in just two symbols.',
    category: 'Bogleheads',
    tags: ['low-maintenance', 'tax-efficient'],
    holdings: [
      { ticker: 'VT', weight: 70 },
      { ticker: 'BND', weight: 30 }
    ],
    rebalance: 'annual',
    riskLevel: 'Medium',
    region: 'Global'
  },
  {
    id: 'dividend-aristocrats',
    name: 'Dividend Aristocrats',
    author: 'Generic',
    description: 'Companies with 25+ years of dividend growth.',
    philosophy: 'Focuses on quality companies that have consistently increased their dividends.',
    category: 'Dividend',
    tags: ['low-maintenance', 'income-focused'],
    holdings: [
      { ticker: 'NOBL', weight: 100 }
    ],
    rebalance: 'annual',
    riskLevel: 'High',
    region: 'US'
  },
  {
    id: 'monthly-income',
    name: 'Monthly Income',
    author: 'Generic',
    description: 'Yield-focused high distributions.',
    philosophy: 'Combination of high-dividend stocks, covered calls (JEPI), and bonds for a steady cash flow.',
    category: 'Income',
    tags: ['income-focused'],
    holdings: [
      { ticker: 'JEPI', weight: 25 },
      { ticker: 'SCHD', weight: 25 },
      { ticker: 'SPHD', weight: 25 },
      { ticker: 'PFF', weight: 25 }
    ],
    rebalance: 'monthly',
    riskLevel: 'Medium',
    region: 'US'
  },
  {
    id: 'eu-pea-eligible',
    name: 'EU PEA-Eligible',
    author: 'Quantrih',
    description: 'Optimized for French PEA investors.',
    philosophy: 'Uses synthetic UCITS ETFs that are eligible for the French Plan d\'Épargne en Actions (PEA).',
    category: 'Single-ETF',
    tags: ['eu-investor', 'pea-eligible', 'tax-efficient'],
    holdings: [
      { ticker: 'PE500', weight: 60 },
      { ticker: 'PUST', weight: 30 },
      { ticker: 'PAEEM', weight: 10 }
    ],
    rebalance: 'annual',
    riskLevel: 'High',
    region: 'EU'
  },
  {
    id: 'crypto-agg-10',
    name: 'Crypto Aggressive 10%',
    author: 'Quantrih',
    description: 'High growth with crypto allocation.',
    philosophy: '80/10/10 mix for those seeking high growth with a meaningful crypto slice.',
    category: 'Crypto',
    tags: ['high-growth'],
    holdings: [
      { ticker: 'VTI', weight: 80 },
      { ticker: 'BND', weight: 10 },
      { ticker: 'IBIT', weight: 10 }
    ],
    rebalance: 'quarterly',
    riskLevel: 'Very High',
    region: 'Global'
  }
];

