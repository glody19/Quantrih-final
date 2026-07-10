const fs = require('fs');

function replaceUseState(filePath, replaces) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const r of replaces) {
    content = content.replace(r.search, r.replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceUseState('src/components/pages/TacticalAllocation.tsx', [
  { search: /const \[startYear, setStartYear\] = useState\(2010\);/g, replace: 'const [startYear, setStartYear] = useLocalStorage("ta_startYear", 2010);' },
  { search: /const \[endYear, setEndYear\] = useState\(2025\);/g, replace: 'const [endYear, setEndYear] = useLocalStorage("ta_endYear", 2025);' },
  { search: /const \[initialAmount, setInitialAmount\] = useState\(10000\);/g, replace: 'const [initialAmount, setInitialAmount] = useLocalStorage("ta_initialAmount", 10000);' },
  { search: /const \[broker, setBroker\] = useState\('degiro'\);/g, replace: 'const [broker, setBroker] = useLocalStorage("ta_broker", "degiro");' },
  { search: /const \[customFee, setCustomFee\] = useState\(1\.5\);/g, replace: 'const [customFee, setCustomFee] = useLocalStorage("ta_customFee", 1.5);' },
  { search: /const \[maPortfolioAssets, setMaPortfolioAssets\] = useState\(\[\{ symbol: 'VFINX', alloc: '60' \}, \{ symbol: 'VBMFX', alloc: '40' \}\]\);/g, replace: 'const [maPortfolioAssets, setMaPortfolioAssets] = useLocalStorage("ta_maPortfolioAssets", [{ symbol: "VFINX", alloc: "60" }, { symbol: "VBMFX", alloc: "40" }]);' },
  { search: /const \[adaptivePortfolioAssets, setAdaptivePortfolioAssets\] = useState\(\[\{ symbol: 'VFINX', alloc: '40' \}, \{ symbol: 'VGTSX', alloc: '20' \}, \{ symbol: 'VBMFX', alloc: '40' \}\]\);/g, replace: 'const [adaptivePortfolioAssets, setAdaptivePortfolioAssets] = useLocalStorage("ta_adaptivePortfolioAssets", [{ symbol: "VFINX", alloc: "40" }, { symbol: "VGTSX", alloc: "20" }, { symbol: "VBMFX", alloc: "40" }]);' },
  { search: /const \[relativeTickers, setRelativeTickers\] = useState\("VFINX, VGTSX, VBMFX"\);/g, replace: 'const [relativeTickers, setRelativeTickers] = useLocalStorage("ta_relativeTickers", "VFINX, VGTSX, VBMFX");' },
  { search: /const \[dualTickers, setDualTickers\] = useState\("VFINX, VGTSX, VBMFX"\);/g, replace: 'const [dualTickers, setDualTickers] = useLocalStorage("ta_dualTickers", "VFINX, VGTSX, VBMFX");' },
  { search: /const \[adaptiveTickers, setAdaptiveTickers\] = useState\("VFINX, VGTSX, VBMFX, CASH"\);/g, replace: 'const [adaptiveTickers, setAdaptiveTickers] = useLocalStorage("ta_adaptiveTickers", "VFINX, VGTSX, VBMFX, CASH");' },
  { search: /const \[momLookback, setMomLookback\] = useState\(12\);/g, replace: 'const [momLookback, setMomLookback] = useLocalStorage("ta_momLookback", 12);' },
  { search: /const \[momTopK, setMomTopK\] = useState\(1\);/g, replace: 'const [momTopK, setMomTopK] = useLocalStorage("ta_momTopK", 1);' },
  { search: /const \[momSafeAsset, setMomSafeAsset\] = useState\('CASH'\);/g, replace: 'const [momSafeAsset, setMomSafeAsset] = useLocalStorage("ta_momSafeAsset", "CASH");' },
  { search: /const \[momOutMarket, setMomOutMarket\] = useState\(true\);/g, replace: 'const [momOutMarket, setMomOutMarket] = useLocalStorage("ta_momOutMarket", true);' },
  { search: /const \[targetVolatility, setTargetVolatility\] = useState\(10\);/g, replace: 'const [targetVolatility, setTargetVolatility] = useLocalStorage("ta_targetVolatility", 10);' },
  { search: /const \[pe10Equity, setPe10Equity\] = useState\('VFINX'\);/g, replace: 'const [pe10Equity, setPe10Equity] = useLocalStorage("ta_pe10Equity", "VFINX");' },
  { search: /const \[pe10Bond, setPe10Bond\] = useState\('VBMFX'\);/g, replace: 'const [pe10Bond, setPe10Bond] = useLocalStorage("ta_pe10Bond", "VBMFX");' },
  { search: /const \[maSingleAsset, setMaSingleAsset\] = useState\('VFINX'\);/g, replace: 'const [maSingleAsset, setMaSingleAsset] = useLocalStorage("ta_maSingleAsset", "VFINX");' },
  { search: /const \[maSingleMonths, setMaSingleMonths\] = useState\(10\);/g, replace: 'const [maSingleMonths, setMaSingleMonths] = useLocalStorage("ta_maSingleMonths", 10);' },
  { search: /const \[activeTab, setActiveTab\] = useState\("seasonal"\);/g, replace: 'const [activeTab, setActiveTab] = useLocalStorage("ta_activeTab", "seasonal");' },
]);

replaceUseState('src/components/pages/MovingAverage.tsx', [
  { search: /const \[assetSymbol, setAssetSymbol\] = useState\("SPY"\);/g, replace: 'const [assetSymbol, setAssetSymbol] = useLocalStorage("ma_assetSymbol", "SPY");' },
  { search: /const \[movingAverageLength, setMovingAverageLength\] = useState\(10\);/g, replace: 'const [movingAverageLength, setMovingAverageLength] = useLocalStorage("ma_length", 10);' },
  { search: /const \[period, setPeriod\] = useState\("monthly"\);/g, replace: 'const [period, setPeriod] = useLocalStorage("ma_period", "monthly");' },
]);

replaceUseState('src/components/pages/DualMomentum.tsx', [
  { search: /const \[lookback, setLookback\] = useState\(12\);/g, replace: 'const [lookback, setLookback] = useLocalStorage("dm_lookback", 12);' },
  { search: /const \[usEquity, setUsEquity\] = useState\("VFINX"\);/g, replace: 'const [usEquity, setUsEquity] = useLocalStorage("dm_usEquity", "VFINX");' },
  { search: /const \[intlEquity, setIntlEquity\] = useState\("VGTSX"\);/g, replace: 'const [intlEquity, setIntlEquity] = useLocalStorage("dm_intlEquity", "VGTSX");' },
  { search: /const \[bonds, setBonds\] = useState\("VBMFX"\);/g, replace: 'const [bonds, setBonds] = useLocalStorage("dm_bonds", "VBMFX");' },
]);

replaceUseState('src/components/pages/RelativeStrength.tsx', [
  { search: /const \[lookback, setLookback\] = useState\(6\);/g, replace: 'const [lookback, setLookback] = useLocalStorage("rs_lookback", 6);' },
  { search: /const \[topN, setTopN\] = useState\(2\);/g, replace: 'const [topN, setTopN] = useLocalStorage("rs_topN", 2);' },
]);

