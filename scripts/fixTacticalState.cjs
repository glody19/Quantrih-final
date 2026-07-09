const fs = require('fs');

let content = fs.readFileSync('src/components/pages/TacticalAllocation.tsx', 'utf8');

content = content.replace(
  `const [maPortfolioAssets, setMaPortfolioAssets] = useState([{ symbol: '', alloc: '' }, { symbol: '', alloc: '' }, { symbol: '', alloc: '' }]);`,
  `const [maPortfolioAssets, setMaPortfolioAssets] = useState([{ symbol: 'VFINX', alloc: '60' }, { symbol: 'VBMFX', alloc: '40' }]);`
);

content = content.replace(
  `const [adaptivePortfolioAssets, setAdaptivePortfolioAssets] = useState([{ symbol: '', alloc: '' }, { symbol: '', alloc: '' }, { symbol: '', alloc: '' }]);`,
  `const [adaptivePortfolioAssets, setAdaptivePortfolioAssets] = useState([{ symbol: 'VFINX', alloc: '40' }, { symbol: 'VGTSX', alloc: '20' }, { symbol: 'VBMFX', alloc: '40' }]);`
);

content = content.replace(
  `const [relativeTickers, setRelativeTickers] = useState("");`,
  `const [relativeTickers, setRelativeTickers] = useState("VFINX, VGTSX, VBMFX");`
);

content = content.replace(
  `const [dualTickers, setDualTickers] = useState("");`,
  `const [dualTickers, setDualTickers] = useState("VFINX, VGTSX, VBMFX");`
);

content = content.replace(
  `const [adaptiveTickers, setAdaptiveTickers] = useState("");`,
  `const [adaptiveTickers, setAdaptiveTickers] = useState("VFINX, VGTSX, VBMFX, CASH");`
);

fs.writeFileSync('src/components/pages/TacticalAllocation.tsx', content);
