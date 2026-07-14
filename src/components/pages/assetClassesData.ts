export const majorIndices = [
  { ticker: "^GSPC", asset: "S&P 500 Index", m1: 5.26, m3: 10.58, m6: 11.33, y1: 29.82, y3: 23.45, y5: 14.04, y10: 15.56, y30: 10.32 },
  { ticker: "^IXIC", asset: "NASDAQ Composite", m1: 6.12, m3: 12.30, m6: 15.40, y1: 34.50, y3: 25.10, y5: 16.20, y10: 18.50, y30: 12.10 },
  { ticker: "^DJI", asset: "Dow Jones Industrial Average", m1: 3.50, m3: 8.10, m6: 9.20, y1: 22.40, y3: 18.20, y5: 11.50, y10: 12.80, y30: 9.80 },
  { ticker: "^STOXX50E", asset: "EURO STOXX 50", m1: 2.10, m3: 4.50, m6: 8.10, y1: 18.20, y3: 14.30, y5: 9.10, y10: 8.50, y30: 6.40 },
  { ticker: "^FCHI", asset: "CAC 40", m1: 1.50, m3: 3.20, m6: 6.40, y1: 15.10, y3: 12.20, y5: 8.40, y10: 7.80, y30: 5.50 },
  { ticker: "^FTSE", asset: "FTSE 100", m1: 1.20, m3: 2.30, m6: 5.40, y1: 12.50, y3: 10.10, y5: 6.20, y10: 7.10, y30: 5.20 },
  { ticker: "^N225", asset: "Nikkei 225", m1: 4.50, m3: 9.20, m6: 14.10, y1: 28.50, y3: 19.40, y5: 12.30, y10: 11.50, y30: 3.20 },
];

export const assetClasses = [
  { ticker: "QQQ", asset: "US Technology", m1: -0.15, m3: 27.73, m6: 20.16, y1: 34.14, y3: 26.58, y5: 16.44, y10: 22.06, y20: 16.77, y30: 14.10 },
  { ticker: "IJH", asset: "US Mid Cap Blend", m1: 3.62, m3: 14.47, m6: 17.40, y1: 25.96, y3: 15.39, y5: 9.05, y10: 11.59, y20: 10.01, y30: 10.77 },
  { ticker: "VTI", asset: "US Total Stock Market", m1: -0.39, m3: 15.68, m6: 11.04, y1: 23.17, y3: 20.45, y5: 12.24, y10: 15.04, y20: 11.23, y30: 10.30 },
  { ticker: "SPY", asset: "US Large Cap Blend", m1: -1.03, m3: 15.12, m6: 10.09, y1: 22.21, y3: 20.48, y5: 13.30, y10: 15.40, y20: 11.28, y30: 10.25 },
  { ticker: "IJR", asset: "US Small Cap Blend", m1: 7.28, m3: 19.67, m6: 23.98, y1: 37.48, y3: 16.00, y5: 7.29, y10: 11.46, y20: 9.61, y30: 9.97 },
  { ticker: "CWB", asset: "US Convertible Bonds", m1: -0.12, m3: 18.26, m6: 21.63, y1: 32.55, y3: 17.72, y5: 6.55, y10: 12.72, y20: 8.95, y30: 9.16 },
  { ticker: "VNQ", asset: "US REITs", m1: 1.65, m3: 9.67, m6: 11.11, y1: 12.47, y3: 9.13, y5: 2.79, y10: 4.91, y20: 6.25, y30: 9.02 },
  { ticker: "EMB", asset: "Emerg. Market Bonds", m1: 0.43, m3: 4.05, m6: 2.38, y1: 9.57, y3: 9.23, y5: 1.81, y10: 3.02, y20: 5.13, y30: 8.63 },
  { ticker: "VT", asset: "World All Countries", m1: -0.38, m3: 13.88, m6: 11.93, y1: 24.26, y3: 19.68, y5: 10.87, y10: 12.81, y20: 8.55, y30: 8.39 },
  { ticker: "GLD", asset: "Gold", m1: -11.68, m3: -14.39, m6: -7.05, y1: 20.85, y3: 27.37, y5: 17.34, y10: 11.28, y20: 9.39, y30: 7.83 },
  { ticker: "EEM", asset: "Emerging Markets", m1: 0.24, m3: 21.09, m6: 25.69, y1: 44.59, y3: 22.92, y5: 6.89, y10: 9.51, y20: 6.16, y30: 6.51 },
  { ticker: "EFA", asset: "EAFE Stocks", m1: 0.69, m3: 8.64, m6: 9.89, y1: 20.19, y3: 16.33, y5: 9.06, y10: 9.60, y20: 5.47, y30: 5.75 },
  { ticker: "HYG", asset: "US High Yield Bonds", m1: 0.09, m3: 2.05, m6: 1.69, y1: 5.15, y3: 8.37, y5: 3.56, y10: 4.78, y20: 5.12, y30: 5.44 },
  { ticker: "PFF", asset: "US Preferred Stocks", m1: -2.97, m3: 1.93, m6: 0.48, y1: 4.99, y3: 5.80, y5: 0.49, y10: 2.82, y20: 3.68, y30: 5.38 },
  { ticker: "LQD", asset: "US Invest. Grade Bonds", m1: 0.11, m3: 1.26, m6: 0.88, y1: 4.10, y3: 4.83, y5: -0.31, y10: 2.36, y20: 4.35, y30: 5.05 },
  { ticker: "TIP", asset: "US TIPS", m1: -0.46, m3: 0.82, m6: 1.23, y1: 3.22, y3: 3.77, y5: 0.53, y10: 2.25, y20: 3.44, y30: 4.97 },
  { ticker: "TLT", asset: "US Long Term Treasuries", m1: 1.17, m3: 0.85, m6: 1.03, y1: 2.39, y3: -1.68, y5: -6.71, y10: -1.96, y20: 3.34, y30: 4.67 },
  { ticker: "BNDX", asset: "International Bonds", m1: 0.44, m3: 1.50, m6: 1.38, y1: 2.23, y3: 4.22, y5: 0.46, y10: 1.63, y20: 3.88, y30: 4.61 },
  { ticker: "BND", asset: "US Total Bond Market", m1: 0.27, m3: 0.70, m6: 0.75, y1: 3.69, y3: 4.11, y5: 0.02, y10: 1.49, y20: 3.20, y30: 4.10 },
  { ticker: "DBC", asset: "Commodities", m1: -9.57, m3: -7.91, m6: 19.23, y1: 26.35, y3: 10.29, y5: 9.74, y10: 7.47, y20: 1.33, y30: 3.69 },
  { ticker: "BIL", asset: "US Cash", m1: 0.27, m3: 0.88, m6: 1.74, y1: 3.83, y3: 4.59, y5: 3.46, y10: 2.21, y20: 1.53, y30: 2.22 }
];

export const megatrends = [
  { ticker: "QTUM", asset: "Quantum Computing", m1: 3.70, m3: 54.38, m6: 51.37, y1: 81.91, y3: 49.87, y5: 28.39, y10: null },
  { ticker: "IDNA", asset: "Genomics Immunology and Healthcare", m1: 13.43, m3: 16.67, m6: 29.41, y1: 66.22, y3: 14.35, y5: -7.41, y10: null },
  { ticker: "ICLN", asset: "Global Clean Energy", m1: -12.83, m3: 12.33, m6: 25.05, y1: 57.93, y3: 5.22, y5: -1.37, y10: 10.64 },
  { ticker: "AIQ", asset: "Technology and Artificial Intelligence", m1: -2.54, m3: 40.58, m6: 29.00, y1: 50.30, y3: 33.12, y5: 16.84, y10: null },
  { ticker: "XT", asset: "Exponential Techonologies", m1: -0.98, m3: 21.79, m6: 19.01, y1: 36.95, y3: 17.59, y5: 7.71, y10: 14.84 },
  { ticker: "QQQ", asset: "[Benchmark] US Nasdaq", m1: -0.15, m3: 27.73, m6: 20.16, y1: 34.14, y3: 26.58, y5: 16.44, y10: 22.06 },
  { ticker: "SNSR", asset: "Internet Of Things", m1: -2.31, m3: 34.30, m6: 35.45, y1: 33.09, y3: 13.74, y5: 7.66, y10: null },
  { ticker: "IFRA", asset: "US Infrastructure", m1: 3.79, m3: 10.54, m6: 20.73, y1: 30.42, y3: 19.52, y5: 14.51, y10: null },
  { ticker: "IDRV", asset: "Self-Driving EV and Tech", m1: -14.63, m3: -0.39, m6: 1.19, y1: 26.62, y3: -0.32, y5: -3.31, y10: null },
  { ticker: "HACK", asset: "Cyber Security", m1: 5.62, m3: 39.74, m6: 30.56, y1: 21.58, y3: 27.70, y5: 11.78, y10: 16.42 },
  { ticker: "BOTZ", asset: "Robotics and Artificial Intelligence", m1: -5.46, m3: 14.27, m6: 4.77, y1: 16.76, y3: 10.02, y5: 1.92, y10: null },
  { ticker: "IGF", asset: "Global Infrastructure", m1: 1.41, m3: 0.80, m6: 10.07, y1: 15.94, y3: 16.12, y5: 11.23, y10: 8.29 },
  { ticker: "EMIF", asset: "Emerging Markets Infrastructure", m1: -1.73, m3: -5.51, m6: 0.31, y1: 14.65, y3: 10.36, y5: 4.79, y10: 1.85 },
  { ticker: "BLCN", asset: "Blockchain", m1: -5.15, m3: 20.86, m6: 5.92, y1: 12.00, y3: 6.90, y5: -10.83, y10: null },
  { ticker: "METV", asset: "Metaverse", m1: -4.55, m3: 15.82, m6: -1.76, y1: 8.53, y3: 21.27, y5: 4.15, y10: null },
  { ticker: "CGW", asset: "Global Water", m1: 5.22, m3: 2.80, m6: 4.32, y1: 6.83, y3: 10.50, y5: 5.92, y10: 10.01 },
  { ticker: "EBIZ", asset: "Global E-Commerce", m1: -0.64, m3: 3.45, m6: -14.78, y1: -9.33, y3: 14.71, y5: -3.96, y10: null },
  { ticker: "EMQQ", asset: "Emerging Markets E-Commerce", m1: -3.69, m3: -5.67, m6: -22.69, y1: -22.81, y3: 3.66, y5: -12.39, y10: 4.13 }
];
