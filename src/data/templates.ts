export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  holdings: { ticker: string, weight: number }[];
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: '100% VT - Maximum simplicity.',
    holdings: [{ ticker: 'VT', weight: 100 }]
  },
  {
    id: 'early-career',
    name: 'Early Career',
    description: '80% Stocks, 20% Bonds - Long horizon growth.',
    holdings: [{ ticker: 'VT', weight: 80 }, { ticker: 'BND', weight: 20 }]
  },
  {
    id: 'mid-career',
    name: 'Mid Career',
    description: '60/20/20 - Balanced US, Intl, and Bonds.',
    holdings: [{ ticker: 'VTI', weight: 60 }, { ticker: 'VXUS', weight: 20 }, { ticker: 'BND', weight: 20 }]
  },
  {
    id: 'near-retirement',
    name: 'Near Retirement',
    description: '40/20/35/5 - Increasing safety and gold.',
    holdings: [{ ticker: 'VTI', weight: 40 }, { ticker: 'VXUS', weight: 20 }, { ticker: 'BND', weight: 35 }, { ticker: 'GLD', weight: 5 }]
  },
  {
    id: 'retired',
    name: 'Retired',
    description: 'Conservatively managed for withdrawal.',
    holdings: [{ ticker: 'VTI', weight: 30 }, { ticker: 'BND', weight: 50 }, { ticker: 'BIL', weight: 15 }, { ticker: 'GLD', weight: 5 }]
  },
  {
    id: 'fire',
    name: 'FIRE',
    description: 'Aggressive growth with cash buffer.',
    holdings: [{ ticker: 'VTI', weight: 75 }, { ticker: 'VXUS', weight: 20 }, { ticker: 'BIL', weight: 5 }]
  },
  {
    id: 'income',
    name: 'Income Focused',
    description: 'High distributions for cash flow.',
    holdings: [{ ticker: 'SCHD', weight: 40 }, { ticker: 'JEPI', weight: 20 }, { ticker: 'BND', weight: 25 }, { ticker: 'VNQ', weight: 15 }]
  },
  {
    id: 'defensive',
    name: 'Defensive',
    description: 'Minimal volatility focus.',
    holdings: [{ ticker: 'VTI', weight: 30 }, { ticker: 'BND', weight: 40 }, { ticker: 'GLD', weight: 15 }, { ticker: 'BIL', weight: 15 }]
  }
];
