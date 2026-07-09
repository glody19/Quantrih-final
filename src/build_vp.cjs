import fs from 'fs';
import path from 'path';

const content = `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Search, Activity, Briefcase, TrendingUp, TrendingDown, Clock, X, Check, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';
import { AssetLogo } from '../ui/AssetLogo';

// Local storage keys
const STORAGE_KEY_BALANCE = 'pv_balance';
const STORAGE_KEY_POSITIONS = 'pv_positions';
const STORAGE_KEY_HISTORY = 'pv_history';

type Position = {
  symbol: string;
  name: string;
  shares: number;
  averageCost: number;
};

type HistoryPoint = {
  date: string;
  value: number;
};

export function VirtualPortfolio() {
  const [balance, setBalance] = useState<number>(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  
  const [liveQuotes, setLiveQuotes] = useState<Record<string, any>>({});
  
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQuote, setTradeQuote] = useState<any>(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeShares, setTradeShares] = useState<string>('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Helper
  const netLiqValue = balance + positions.reduce((acc, pos) => {
     const currentPrice = liveQuotes[pos.symbol]?.price || pos.averageCost;
     return acc + (currentPrice * pos.shares);
  }, 0);

  // Initialize
  useEffect(() => {
    const savedBalance = localStorage.getItem(STORAGE_KEY_BALANCE);
    const savedPositions = localStorage.getItem(STORAGE_KEY_POSITIONS);
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedPositions) setPositions(JSON.parse(savedPositions));
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      // populate fake history
      const now = new Date();
      const hist = [];
      let val = 100000;
      for(let i=30; i>=0; i--) {
         const d = new Date(now);
         d.setDate(d.getDate() - i);
         hist.push({ date: d.toISOString().split('T')[0], value: val });
         val += (Math.random() - 0.5) * 500;
      }
      setHistory(hist);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(hist));
    }
  }, []);

  // Update quotes for positions
  useEffect(() => {
     if (positions.length === 0) return;
     const symbols = positions.map(p => p.symbol).join(',');
     
     const fetchQuotes = async () => {
         try {
             const res = await fetch(\`/api/stock/bulk-quotes?symbols=\${symbols}\`);
             if (res.ok) {
                 const data = await res.json();
                 if (Array.isArray(data)) {
                     const quoteMap: Record<string, any> = {};
                     data.forEach(q => {
                         quoteMap[q.symbol] = q;
                     });
                     setLiveQuotes(prev => ({...prev, ...quoteMap}));
                 }
             }
         } catch(e) {}
     };
     
     fetchQuotes();
     const int = setInterval(fetchQuotes, 10000);
     return () => clearInterval(int);
  }, [positions]);

  // Persist state
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
      localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(positions));
  }, [balance, positions]);

  const handleSearchTrade = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!tradeSymbol.trim()) return;
      
      setTradeLoading(true);
      setTradeError('');
      setTradeQuote(null);
      
      try {
          const res = await fetch(\`/api/stock/quote/\${tradeSymbol.trim().toUpperCase()}\`);
          if (res.ok) {
              const data = await res.json();
              if (data && data.price) {
                  setTradeQuote(data);
                  setShowTradeModal(true);
              } else {
                  setTradeError('Symbol not found');
              }
          } else {
              setTradeError('Error fetching quote');
          }
      } catch(e) {
          setTradeError('Network error');
      } finally {
          setTradeLoading(false);
      }
  };

  const handleExecuteTrade = () => {
      if (!tradeQuote || !tradeShares) return;
      const numShares = parseFloat(tradeShares);
      if (isNaN(numShares) || numShares <= 0) {
          alert("Invalid shares amount");
          return;
      }

      const totalCost = numShares * tradeQuote.price;

      if (tradeType === 'BUY') {
          if (totalCost > balance * 4) { // Let's allow margin 4x
              alert("Insufficient buying power");
              return;
          }
          
          setBalance(prev => prev - totalCost);
          setPositions(prev => {
              const idx = prev.findIndex(p => p.symbol === tradeQuote.symbol);
              if (idx >= 0) {
                  const p = prev[idx];
                  const newShares = p.shares + numShares;
                  const newAvgCost = ((p.shares * p.averageCost) + totalCost) / newShares;
                  const newArr = [...prev];
                  newArr[idx] = { ...p, shares: newShares, averageCost: newAvgCost };
                  return newArr;
              } else {
                  return [...prev, { symbol: tradeQuote.symbol, name: tradeQuote.name, shares: numShares, averageCost: tradeQuote.price }];
              }
          });
      } else {
          // Sell
          const existing = positions.find(p => p.symbol === tradeQuote.symbol);
          if (!existing || existing.shares < numShares) {
              alert("Insufficient shares to sell");
              return;
          }
          
          setBalance(prev => prev + totalCost);
          setPositions(prev => {
              const idx = prev.findIndex(p => p.symbol === tradeQuote.symbol);
              const p = prev[idx];
              const newShares = p.shares - numShares;
              if (newShares <= 0) {
                  const newArr = [...prev];
                  newArr.splice(idx, 1);
                  return newArr;
              } else {
                  const newArr = [...prev];
                  newArr[idx] = { ...p, shares: newShares };
                  return newArr;
              }
          });
      }

      setShowTradeModal(false);
      setTradeShares('');
      setTradeSymbol('');
  };

  const closePositions = () => {
      let finalBalance = balance;
      positions.forEach(p => {
         const price = liveQuotes[p.symbol]?.price || p.averageCost;
         finalBalance += price * p.shares;
      });
      setPositions([]);
      setBalance(finalBalance);
      setLiveQuotes({});
  };

  return (
    <div className="w-full relative min-h-[calc(100vh-80px)]">
       {/* Ambient background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -right-1/4 w-3/4 h-3/4 bg-pv-blue/5 rounded-full blur-[150px]"></div>
         <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px]"></div>
       </div>

       <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
             {/* Header */}
             <div>
                <h1 className="text-4xl font-black text-text tracking-tight mb-2 flex items-center gap-3">
                   <Briefcase className="text-pv-blue" size={32} />
                   Virtual Portfolio
                </h1>
                <p className="text-text-4 font-medium text-sm">
                   Simulate your trading strategies with a paper margin account.
                </p>
             </div>

             {/* Account Summary & Chart */}
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 
                 {/* Left Column: Metrics */}
                 <div className="xl:col-span-1 flex flex-col gap-6">
                     {/* Net Liquidating Value */}
                     <div className="bg-surface border border-border/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                           <DollarSign size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 mt-2">
                                <DollarSign className="text-pv-blue" size={18} />
                                <h3 className="text-xs font-black text-text-3 uppercase tracking-widest">Net Liq Value</h3>
                            </div>
                            <div className="text-5xl font-black text-text mb-2 tracking-tight">\${netLiqValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                <TrendingUp size={14} /> {(netLiqValue - 100000) >= 0 ? '+' : ''}{((netLiqValue - 100000) / 1000).toFixed(2)}% All Time
                            </div>
                        </div>
                     </div>

                     {/* Available Funds */}
                     <div className="bg-surface border border-border/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex items-center gap-2 mb-4 mt-2">
                           <Activity className="text-emerald-500" size={18} />
                           <h3 className="text-xs font-black text-text-3 uppercase tracking-widest">Available Funds (Cash)</h3>
                        </div>
                        <div className="text-4xl font-black text-slate-700 mb-2 tracking-tight">\${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className="text-xs font-bold text-text-4">Buying Power (4x): \${(balance * 4).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                     </div>
                 </div>
                 
                 {/* Right Column: Chart & Trade */}
                 <div className="xl:col-span-2 flex flex-col gap-6">
                     
                     <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row gap-6">
                        {/* Chart Area */}
                        <div className="flex-1 w-full h-[250px] pr-4 xl:border-r border-border/80">
                           <div className="flex items-center gap-2 mb-4">
                              <h3 className="text-xs font-black text-text-3 uppercase tracking-widest">Portfolio History</h3>
                           </div>
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={history.map(h => ({ date: h.date, value: h.value }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1C61E7" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#1C61E7" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgb(0,0,0,0.08)' }} 
                                   formatter={(v: any) => [\`$\${Number(v).toLocaleString(undefined, {minimumFractionDigits: 2})}\`, 'Value']} 
                                   labelStyle={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#1C61E7" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>

                        {/* Trade Area */}
                        <div className="w-full xl:w-[350px] shrink-0 flex flex-col justify-center">
                            <div className="w-full bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-pv-blue blur-[60px] opacity-40 rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                       <h3 className="text-sm font-black uppercase tracking-widest text-[#E2E8F0]">Quick Trade</h3>
                                       <span className="px-2 py-1 bg-white/10 text-[10px] font-bold rounded text-white/80 uppercase tracking-widest">Live Market</span>
                                    </div>
                                    <form onSubmit={handleSearchTrade}>
                                        <div className="relative">
                                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                           <input 
                                             type="text" 
                                             value={tradeSymbol}
                                             onChange={e => setTradeSymbol(e.target.value)}
                                             placeholder="Enter Symbol..." 
                                             className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 font-mono text-lg uppercase outline-none focus:border-pv-blue focus:ring-1 focus:ring-pv-blue transition-all"
                                             autoComplete="off"
                                           />
                                           {tradeLoading && (
                                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/20 border-t-pv-blue animate-spin"></div>
                                           )}
                                        </div>
                                        {tradeError && <p className="text-rose-400 text-xs mt-2 font-medium">{tradeError}</p>}
                                        <button 
                                           disabled={tradeLoading || !tradeSymbol.trim()}
                                           type="submit" 
                                           className="w-full mt-4 bg-pv-blue text-white font-bold py-3.5 rounded-xl hover:bg-pv-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-pv-blue/20"
                                        >
                                           Search & Trade
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                     </div>
                 </div>
             </div>

             {/* Positions */}
             <div className="bg-surface border border-border/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="px-8 py-6 border-b border-border/80 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-black text-text tracking-tight flex items-center gap-3">
                       <Briefcase size={22} className="text-pv-blue" /> Open Positions
                    </h3>
                    {positions.length > 0 && (
                      <button onClick={closePositions} className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors">
                         Liquidate Portfolio
                      </button>
                    )}
                </div>
                
                {positions.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner relative">
                         <Briefcase className="text-slate-300" size={32} />
                         <div className="absolute bottom-0 right-0 w-6 h-6 bg-pv-blue rounded-full border-2 border-white flex items-center justify-center text-white"><ArrowRight size={12}/></div>
                      </div>
                      <h4 className="text-2xl font-black text-text mb-3">No Active Positions</h4>
                      <p className="text-text-4 max-w-sm text-sm font-medium leading-relaxed">
                         Your virtual portfolio is empty. Search for a ticker symbol in the Quick Trade panel to initiate a position.
                      </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8f9fa] border-b border-border/80 text-[11px] font-black text-text-3 uppercase tracking-widest">
                           <tr>
                              <th className="py-5 px-8 whitespace-nowrap">Asset</th>
                              <th className="py-5 px-4 text-right whitespace-nowrap">Shares</th>
                              <th className="py-5 px-4 text-right whitespace-nowrap">Avg Cost</th>
                              <th className="py-5 px-4 text-right whitespace-nowrap">Last Price</th>
                              <th className="py-5 px-4 text-right whitespace-nowrap">Market Value</th>
                              <th className="py-5 px-8 text-right whitespace-nowrap">Unrealized P&L</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-sm">
                           {positions.map((p, idx) => {
                               const livePrice = liveQuotes[p.symbol]?.price || p.averageCost;
                               const mktValue = livePrice * p.shares;
                               const costBasis = p.averageCost * p.shares;
                               const pnl = mktValue - costBasis;
                               const pnlPct = (pnl / costBasis) * 100;
                               const isUp = pnl >= 0;

                               return (
                                 <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                     <td className="py-4 px-8 border-l-[3px] border-transparent group-hover:border-pv-blue transition-colors">
                                         <div className="flex items-center gap-4">
                                             <AssetLogo symbol={p.symbol} size="sm" className="shadow-sm" />
                                             <div>
                                                <div className="font-black text-text text-base">{p.symbol}</div>
                                                <div className="text-xs text-text-4 font-medium truncate max-w-[150px]">{p.name || p.symbol}</div>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="py-4 px-4 text-right font-mono font-bold text-text-2">{p.shares.toLocaleString()}</td>
                                     <td className="py-4 px-4 text-right font-mono text-text-3">\${p.averageCost.toFixed(2)}</td>
                                     <td className="py-4 px-4 text-right font-mono font-bold text-text">\${livePrice.toFixed(2)}</td>
                                     <td className="py-4 px-4 text-right font-mono font-black text-text">\${mktValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                     <td className="py-4 px-8 text-right">
                                         <div className={cn("font-mono font-black", isUp ? "text-emerald-600" : "text-rose-600")}>
                                              {isUp ? '+' : ''}\${pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                         </div>
                                         <div className={cn("text-xs font-bold", isUp ? "text-emerald-500/80" : "text-rose-500/80")}>
                                              {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                                         </div>
                                     </td>
                                 </tr>
                               );
                           })}
                        </tbody>
                     </table>
                  </div>
                )}
             </div>

          </motion.div>
       </div>

       {/* Trade Modal */}
       <AnimatePresence>
          {showTradeModal && tradeQuote && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowTradeModal(false)}
                 />
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                 >
                    <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pv-blue blur-[50px] opacity-30 rounded-full"></div>
                        <button onClick={() => setShowTradeModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2">
                           <X size={16} />
                        </button>
                        <div className="flex items-center gap-4 relative z-10">
                           <AssetLogo symbol={tradeQuote.symbol} size="md" className="ring-4 ring-white/10 shadow-lg bg-white" />
                           <div>
                              <h2 className="text-2xl font-black">{tradeQuote.symbol}</h2>
                              <p className="text-white/70 text-sm font-medium">{tradeQuote.name}</p>
                           </div>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                            <div>
                               <p className="text-xs font-bold text-text-4 uppercase tracking-widest mb-1">Current Price</p>
                               <div className="text-3xl font-black font-mono text-text">\${tradeQuote.price.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-bold text-text-4 uppercase tracking-widest mb-1">Buying Power</p>
                               <div className="text-lg font-black font-mono text-pv-blue">\${(balance * 4).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                            <button 
                               onClick={() => setTradeType('BUY')}
                               className={cn("flex-1 py-2 font-bold text-sm rounded-lg transition-all shadow-sm", tradeType === 'BUY' ? "bg-white text-emerald-600 shadow" : "text-text-4 hover:text-text")}
                            >
                               BUY
                            </button>
                            <button 
                               onClick={() => setTradeType('SELL')}
                               className={cn("flex-1 py-2 font-bold text-sm rounded-lg transition-all shadow-sm", tradeType === 'SELL' ? "bg-white text-rose-600 shadow" : "text-text-4 hover:text-text")}
                            >
                               SELL
                            </button>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-text-3 uppercase tracking-widest mb-2">Quantity (Shares)</label>
                            <input 
                               type="number"
                               min="1"
                               step="any"
                               value={tradeShares}
                               onChange={e => setTradeShares(e.target.value)}
                               placeholder="e.g. 10"
                               className="w-full bg-surface border border-border/80 rounded-xl py-4 px-5 text-xl font-mono text-text placeholder:text-text-4 outline-none focus:border-pv-blue focus:ring-2 focus:ring-pv-blue/20 transition-all font-black text-center"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm mb-8 bg-slate-50 p-4 rounded-xl border border-border/50">
                            <span className="font-bold text-text-4">Estimated Total</span>
                            <span className="font-black text-text font-mono text-lg">
                               \${(parseFloat(tradeShares || '0') * tradeQuote.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                        </div>

                        <button 
                           onClick={handleExecuteTrade}
                           disabled={!tradeShares || parseFloat(tradeShares) <= 0}
                           className={cn("w-full py-4 rounded-xl font-black text-white text-lg transition-all shadow-lg", 
                             !tradeShares || parseFloat(tradeShares)<=0 ? "opacity-50 cursor-not-allowed bg-slate-400" :
                             (tradeType === 'BUY' ? "bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-400 hover:shadow-rose-500/20")
                           )}
                        >
                           {tradeType} {tradeQuote.symbol}
                        </button>
                    </div>
                 </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync('src/components/pages/VirtualPortfolio.tsx', content, 'utf8');
console.log('Virtual portfolio operational logic complete.');
