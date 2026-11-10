// Ten well-known asset allocations, implemented with liquid US-listed ETFs.
// Weights in %. Their year-to-date performance is computed live from real prices.
export interface FamousAllocation {
  id: string;
  name: string;
  author: string;
  assets: { symbol: string; weight: number }[];
}

export const FAMOUS_ALLOCATIONS: FamousAllocation[] = [
  { id: "6040", name: "Classic 60/40", author: "Benchmark", assets: [{ symbol: "VTI", weight: 60 }, { symbol: "BND", weight: 40 }] },
  { id: "allweather", name: "All Weather", author: "Ray Dalio", assets: [{ symbol: "VTI", weight: 30 }, { symbol: "TLT", weight: 40 }, { symbol: "IEF", weight: 15 }, { symbol: "GLD", weight: 7.5 }, { symbol: "DBC", weight: 7.5 }] },
  { id: "permanent", name: "Permanent Portfolio", author: "Harry Browne", assets: [{ symbol: "VTI", weight: 25 }, { symbol: "TLT", weight: 25 }, { symbol: "BIL", weight: 25 }, { symbol: "GLD", weight: 25 }] },
  { id: "butterfly", name: "Golden Butterfly", author: "Tyler", assets: [{ symbol: "VTI", weight: 20 }, { symbol: "IJS", weight: 20 }, { symbol: "TLT", weight: 20 }, { symbol: "SHY", weight: 20 }, { symbol: "GLD", weight: 20 }] },
  { id: "threefund", name: "Three-Fund Portfolio", author: "Bogleheads", assets: [{ symbol: "VTI", weight: 48 }, { symbol: "VXUS", weight: 32 }, { symbol: "BND", weight: 20 }] },
  { id: "buffett", name: "Buffett 90/10", author: "Warren Buffett", assets: [{ symbol: "VOO", weight: 90 }, { symbol: "BIL", weight: 10 }] },
  { id: "swensen", name: "Yale Endowment", author: "David Swensen", assets: [{ symbol: "VTI", weight: 30 }, { symbol: "VEA", weight: 15 }, { symbol: "VWO", weight: 5 }, { symbol: "VNQ", weight: 20 }, { symbol: "IEF", weight: 15 }, { symbol: "TIP", weight: 15 }] },
  { id: "nobrainer", name: "No-Brainer", author: "William Bernstein", assets: [{ symbol: "VOO", weight: 25 }, { symbol: "IJR", weight: 25 }, { symbol: "VEA", weight: 25 }, { symbol: "BND", weight: 25 }] },
  { id: "coffeehouse", name: "Coffeehouse", author: "Bill Schultheis", assets: [{ symbol: "VOO", weight: 10 }, { symbol: "VTV", weight: 10 }, { symbol: "IJR", weight: 10 }, { symbol: "IJS", weight: 10 }, { symbol: "VNQ", weight: 10 }, { symbol: "VEA", weight: 10 }, { symbol: "BND", weight: 40 }] },
  { id: "global8020", name: "Global 80/20", author: "Benchmark", assets: [{ symbol: "VT", weight: 80 }, { symbol: "BND", weight: 20 }] },
];
