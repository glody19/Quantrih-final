const fs = require('fs');
const content = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');
const lines = content.split('\n');

const replacement = ` useEffect(() => {
  // 1. Real-time Crypto Data (Binance WebSocket) using single multiplexed stream
  const cryptoSymbols = [
   "btcusdt", "ethusdt", "solusdt", "bnbusdt", "xrpusdt", 
   "adausdt", "dogeusdt", "avaxusdt", "dotusdt", 
   "linkusdt", "ltcusdt", "uniusdt", "atomusdt", 
   "trxusdt", "xlmusdt", "nearusdt", "bchusdt", "hbarusdt", 
   "aptusdt", "icpusdt"
  ];
  
  const cryptoUpdates = new Map();
  
  const flushInterval = setInterval(() => {
   if (cryptoUpdates.size === 0) return;
   
   const symbolMap = {
    'btcusdt': 'BTC-USD',
    'ethusdt': 'ETH-USD'
   };
   
   let hasTickerUpdates = false;
   const newTickerPrices = {};
   
   setCryptos(prev => {
    let changed = false;
    const next = prev.map(c => {
     const update = cryptoUpdates.get(c.id);
     if (update && update.c) {
      const newPrice = parseFloat(update.c);
      if (newPrice !== c.price) {
       changed = true;
       return {
        ...c,
        prevPrice: c.price,
        price: newPrice,
        change: parseFloat(update.P)
       };
      }
     }
     return c;
    });
    return changed ? next : prev;
   });
   
   cryptoUpdates.forEach((update, id) => {
    const mappedSym = symbolMap[id];
    if (mappedSym) {
     hasTickerUpdates = true;
     newTickerPrices[mappedSym] = {
      price: parseFloat(update.c),
      changesPercentage: parseFloat(update.P)
     };
    }
   });
   
   if (hasTickerUpdates) {
    setTickerPrices(prev => {
     const next = { ...prev };
     let changed = false;
     Object.entries(newTickerPrices).forEach(([sym, data]) => {
      if (!next[sym] || next[sym].price !== data.price) {
       next[sym] = { ...(next[sym] || { change: 0, changesPercentage: 0 }), ...data };
       changed = true;
      }
     });
     return changed ? next : prev;
    });
   }
   
   cryptoUpdates.clear();
  }, 1000);

  const ws = new WebSocket(\`wss://stream.binance.com:9443/ws/!ticker@arr\`);
  ws.onmessage = (event) => {
   const dataArr = JSON.parse(event.data);
   if (Array.isArray(dataArr)) {
    dataArr.forEach(data => {
     const id = data.s.toLowerCase();
     if (cryptoSymbols.includes(id)) {
      cryptoUpdates.set(id, data);
     }
    });
   }
  };
  ws.onerror = (e) => {
   console.warn("Binance WS error", e);
  };
  
  return () => {
   clearInterval(flushInterval);
   ws.close();
  };
 }, []);`;

// Replace lines 951 to 1000 (0-indexed 951 to 1000 is length 50)
lines.splice(951, 51, replacement);
fs.writeFileSync('src/components/pages/FinancialModeling.tsx', lines.join('\n'));
