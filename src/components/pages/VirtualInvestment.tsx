import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Briefcase, BarChart2, Newspaper, Settings, Search, LayoutDashboard, Compass, ChevronDown } from 'lucide-react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { useAuth } from "../../contexts/AuthContext";

// Format numbers with commas
const formatNumber = (num: number, decimals: number = 2) => {
 if (num === undefined || num === null || Number.isNaN(num)) return "0";
 const parts = num.toFixed(decimals).split('.');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 return parts.join('.');
};

interface Position {
 ticker: string;
 qty: number;
 pru: number;
}
interface Trade {
 id: string;
 timestamp: Date;
 ticker: string;
 action: 'BUY' | 'SELL';
 qty: number;
 price: number;
 status: string;
}

function BlinkingPriceText({ price, className, formattedText }: { price: number, className?: string, formattedText?: string }) {
 const [blink, setBlink] = useState('');
 const prevPrice = React.useRef(price);

 useEffect(() => {
 if (price > prevPrice.current) {
 setBlink('bg-emerald-500/20 text-emerald-400');
 setTimeout(() => setBlink('text-emerald-400'), 150);
 setTimeout(() => setBlink(''), 600);
 } else if (price < prevPrice.current) {
 setBlink('bg-rose-500/20 text-rose-400');
 setTimeout(() => setBlink('text-rose-400'), 150);
 setTimeout(() => setBlink(''), 600);
 }
 prevPrice.current = price;
 }, [price]);

 return (
 <span className={cn("transition-colors duration-100 px-1 rounded", blink, className)}>
 {formattedText || price != null ? price.toFixed(2) : "0.00"}
 </span>
 );
}

export function VirtualInvestment() {
 const { user } = useAuth();
 const [balance, setBalance] = useState(500000); 
 const [positions, setPositions] = useState<Position[]>([]);
 
 const [trades, setTrades] = useState<Trade[]>([]);
 const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
 'TSLA': 243.10, 'AAPL': 192.90, 'AMZN': 179.08, 'MSFT': 381.69, 'SPY': 522.26, 'QQQ': 443.85, 'NVDA': 120.45
 });
 
 const [activeSymbol, setActiveSymbol] = useState('TSLA');
 const [tradeForm, setTradeForm] = useState({ qty: 10, action: 'BUY' as 'BUY' | 'SELL', orderType: 'MKT' });
 const [realizedPnL, setRealizedPnL] = useState(0);
 const [searchInput, setSearchInput] = useState('');

 useEffect(() => {
 const intv = setInterval(() => {
 setCurrentPrices(prev => {
 const newP = { ...prev };
 Object.keys(newP).forEach(k => {
 const volatility = 0.002;
 const change = newP[k] * volatility * (Math.random() - 0.5);
 newP[k] = Math.max(0.01, newP[k] + change);
 });
 if (!newP[activeSymbol]) {
 newP[activeSymbol] = 150.00 + (Math.random() * 50);
 } else {
 newP[activeSymbol] = newP[activeSymbol] + (newP[activeSymbol] * 0.002 * (Math.random() - 0.5));
 }
 return newP;
 });
 }, 1000);
 return () => clearInterval(intv);
 }, [activeSymbol]);

 const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Enter') {
 const val = searchInput.trim().toUpperCase();
 if (val) {
 setActiveSymbol(val);
 setSearchInput('');
 }
 }
 };

 const executeTrade = (e?: React.FormEvent, actionOverride?: 'BUY' | 'SELL') => {
 if (e) e.preventDefault();
 
 const action = actionOverride || tradeForm.action;
 const qty = Number(tradeForm.qty);
 if (isNaN(qty) || qty <= 0) return;

 const currentPrice = currentPrices[activeSymbol] || 150.00;
 const orderValue = qty * currentPrice;
 const leverage = 5; // 1:5 leverage
 const marginRequired = orderValue / leverage;

 if (action === 'BUY') {
 if (marginAvailable < marginRequired) return; 
 setBalance(prev => prev - marginRequired);
 setPositions(prev => {
 const existing = prev.find(p => p.ticker === activeSymbol);
 if (existing) {
 const totalCost = (existing.qty * existing.pru) + orderValue;
 const newQty = existing.qty + qty;
 return prev.map(p => p.ticker === activeSymbol ? { ...p, qty: newQty, pru: totalCost / newQty } : p);
 } else {
 return [...prev, { ticker: activeSymbol, qty, pru: currentPrice }];
 }
 });
 } else {
 setBalance(prev => prev + marginRequired);
 let profit = 0;
 const existingForPnl = positions.find(p => p.ticker === activeSymbol);
 if (existingForPnl && existingForPnl.qty > 0) {
 const soldQty = Math.min(qty, existingForPnl.qty);
 profit = soldQty * (currentPrice - existingForPnl.pru);
 }
 if (profit !== 0) setRealizedPnL(r => r + profit);

 setPositions(prev => {
 const existing = prev.find(p => p.ticker === activeSymbol);
 if (existing) {
 const newQty = existing.qty - qty;
 if (Math.abs(newQty) < 0.0001) return prev.filter(p => p.ticker !== activeSymbol);
 return prev.map(p => p.ticker === activeSymbol ? { ...p, qty: newQty } : p);
 } else {
 return [...prev, { ticker: activeSymbol, qty: -qty, pru: currentPrice }];
 }
 });
 }

 setTrades(prev => [{
 id: Math.random().toString(36).substr(2, 9), timestamp: new Date(),
 ticker: activeSymbol, action, qty, price: currentPrice, status: 'FILL'
 }, ...prev].slice(0, 50));
 };

 const currentActivePrice = currentPrices[activeSymbol] || 150.00;
 const activePositionObj = positions.find(p => p.ticker === activeSymbol);
 
 const leverage = 5;
 const marginUsed = positions.reduce((acc, pos) => acc + (Math.abs(pos.qty) * (currentPrices[pos.ticker] || pos.pru)) / leverage, 0);
 const totalPortfolioValue = positions.reduce((acc, pos) => acc + (pos.qty * (currentPrices[pos.ticker] || pos.pru)), 0);
 
 const unrealizedPnL = positions.reduce((acc, pos) => acc + ((currentPrices[pos.ticker] || pos.pru) - pos.pru) * pos.qty, 0);
 const netLiquidity = balance + marginUsed + unrealizedPnL;
 const marginAvailable = balance; // In our simplified model balance is the free margin
 const marginLevel = marginUsed > 0 ? (netLiquidity / marginUsed) * 100 : 0;
 
 const totalPnL = unrealizedPnL + realizedPnL;

 const formatWithSign = (num: number, dec = 2) => {
 if (num === 0) return '0';
 const sign = num > 0 ? '+' : '';
 return `${sign}${num.toFixed(dec)}`;
 };

 return (
 <div className="w-full flex-1 flex flex-col font-sans overflow-hidden min-h-0 bg-[#0f1015] text-[#b2b5be]">
 {/* Top Header */}
 <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39] bg-[#1a1b26] shrink-0 text-sm">
 <div className="flex items-center gap-6">
 <div className="font-bold text-white tracking-tight flex items-center gap-2">
 <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white text-xs">{(user?.displayName || 'V')[0].toUpperCase()}</div>
 {user?.displayName ? `${user.displayName}'s Virtual Portfolio` : 'Virtual Portfolio'}
 </div>
 
 <div className="flex items-center gap-4 bg-[#0f1015] px-3 py-1.5 rounded-xl border border-[#2a2e39]">
 <Search size={14} className="text-text" />
 <input 
 type="text" 
 value={searchInput}
 onChange={e => setSearchInput(e.target.value)}
 onKeyDown={handleSearch}
 placeholder="Search instrument..." 
 className="bg-transparent outline-none border-none text-white w-48 placeholder-[#555] text-xs" 
 />
 </div>
 </div>
 
 <div className="flex items-center gap-6">
 <div className="flex flex-col text-right">
 <span className="text-xs font-semibold">Margin Lvl</span>
 <span className={cn("font-medium", marginLevel < 100 && marginLevel > 0 ? "text-rose-500 animate-pulse" : "text-white")}>
 {marginLevel > 0 ? `${marginLevel.toFixed(1)}%` : '---'}
 </span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-xs font-semibold">Margin Used</span>
 <span className="text-white font-medium">${formatNumber(marginUsed, 2)}</span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-xs font-semibold">Available Funds</span>
 <span className="text-white font-medium">${formatNumber(balance, 2)}</span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-xs font-semibold">Net Liq</span>
 <span className="text-white font-medium">${formatNumber(netLiquidity, 2)}</span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-xs font-semibold">Today's P&L</span>
 <span className={cn("font-medium", totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
 {formatWithSign(totalPnL)}
 </span>
 </div>
 <button className="px-3 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white rounded text-xs ml-4 transition-colors">
 PRACTICE MODE
 </button>
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden">
 {/* Left Sidebar Menu */}
 <div className="w-14 shrink-0 bg-[#1a1b26] border-r border-[#2a2e39] py-4 flex flex-col items-center gap-6">
 <button className="text-white bg-[#2a2e39] p-2 rounded-2xl cursor-pointer"><BarChart2 size={20} /></button>
 <button className="text-text hover:text-white transition-colors p-2"><Compass size={20} /></button>
 <button className="text-text hover:text-white transition-colors p-2"><Briefcase size={20} /></button>
 <button className="text-text hover:text-white transition-colors p-2"><Newspaper size={20} /></button>
 <button className="text-text hover:text-white transition-colors p-2 mt-auto"><Settings size={20} /></button>
 </div>

 {/* Portfolio & Watchlist Panel */}
 <div className="w-[320px] shrink-0 bg-[#131722] border-r border-[#2a2e39] flex flex-col min-h-0">
 <div className="p-3 border-b border-[#2a2e39] flex justify-between items-center bg-[#1a1b26]">
 <span className="text-white font-semibold text-sm">Portfolio</span>
 <button className="text-xs text-text hover:text-white">Edit</button>
 </div>
 
 <div className="flex-1 overflow-auto no-scrollbar">
 <table className="w-full text-left text-xs">
 <thead className="bg-[#131722] text-text sticky top-0 border-b border-[#2a2e39]">
 <tr>
 <th className="py-2 px-3 font-normal">Market</th>
 <th className="py-2 px-3 font-normal text-right">Price</th>
 <th className="py-2 px-3 font-normal text-right">P&L</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#2a2e39]/50">
 {positions.map(pos => {
 const price = currentPrices[pos.ticker] || pos.pru;
 const unrlPnL = (price - pos.pru) * pos.qty;
 const isAct = pos.ticker === activeSymbol;
 return (
 <tr 
 key={pos.ticker} 
 onClick={() => setActiveSymbol(pos.ticker)} 
 className={cn("cursor-pointer hover:bg-[#2a2e39] transition-colors", isAct ? "bg-[#2a2e39]" : "")}
 >
 <td className="py-2.5 px-3">
 <div className="text-white font-medium">{pos.ticker}</div>
 <div className="text-xs text-text mt-0.5">{pos.qty} shrs</div>
 </td>
 <td className="py-2.5 px-3 text-right">
 <BlinkingPriceText price={price} className="text-white" />
 </td>
 <td className={cn("py-2.5 px-3 text-right", unrlPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
 {formatWithSign(unrlPnL)}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Blotter Summary Below Portfolio */}
 <div className="h-48 border-t border-[#2a2e39] flex flex-col shrink-0">
 <div className="p-2 border-b border-[#2a2e39] bg-[#1a1b26] flex justify-between items-center text-xs">
 <span className="text-white font-medium">Recent Trades</span>
 </div>
 <div className="flex-1 overflow-auto p-1 space-y-1">
 {trades.slice(0, 10).map(t => (
 <div key={t.id} className="text-sm px-2 py-1.5 flex justify-between items-center rounded hover:bg-[#2a2e39]/50">
 <span className="text-white">{t.ticker}</span>
 <span className={t.action === 'BUY' ? "text-emerald-500" : "text-rose-500"}>{t.action} {t.qty}</span>
 <span className="text-text">@{t.price != null ? t.price.toFixed(2) : "0.00"}</span>
 </div>
 ))}
 {trades.length === 0 && <div className="text-center p-4 text-sm text-[#555]">No trades today</div>}
 </div>
 </div>
 </div>

 {/* Main Chart Area */}
 <div className="flex-1 flex flex-col min-w-0 bg-[#0f1015]">
 <div className="h-14 border-b border-[#2a2e39] bg-[#1a1b26] flex items-center px-6 gap-6">
 <div className="flex items-center gap-3">
 <span className="text-white font-bold text-xl">{activeSymbol}</span>
 <span className="bg-[#2a2e39] px-2 py-0.5 rounded text-xs text-text font-bold">Stock</span>
 </div>
 <div className="flex items-baseline gap-2">
 <BlinkingPriceText price={currentActivePrice} className="text-white font-bold text-xl" />
 <span className={cn("text-xs font-semibold", currentActivePrice > (currentPrices[activeSymbol] || 150) ? "text-emerald-500" : "text-rose-500")}>
 +0.15%
 </span>
 </div>
 </div>
 
 <div className="flex-1 w-full bg-[#131722]">
 <AdvancedRealTimeChart 
 symbol={activeSymbol} 
 theme="dark" 
 autosize 
 enable_publishing={false} 
 allow_symbol_change={false} 
 hide_side_toolbar={false}
 timezone="exchange"
 />
 </div>
 </div>

 {/* Right Order Entry Panel */}
 <div className="w-[300px] shrink-0 bg-[#1a1b26] border-l border-[#2a2e39] flex flex-col overflow-y-auto">
 <div className="p-5 border-b border-[#2a2e39]">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-white font-bold text-lg">Order Ticket</h2>
 <Settings size={16} className="text-text hover:text-white cursor-pointer" />
 </div>

 <form onSubmit={executeTrade} className="space-y-5">
 {/* BS Switcher */}
 <div className="flex p-1 bg-[#0f1015] rounded-[1.5rem] font-bold text-sm">
 <button type="button" onClick={() => setTradeForm({...tradeForm, action:'SELL'})} className={cn("flex-1 py-2 rounded-2xl transition-colors", tradeForm.action === 'SELL' ? 'bg-rose-600 text-white shadow-md' : 'text-text hover:text-white')}>Sell</button>
 <button type="button" onClick={() => setTradeForm({...tradeForm, action:'BUY'})} className={cn("flex-1 py-2 rounded-2xl transition-colors", tradeForm.action === 'BUY' ? 'bg-emerald-600 text-white shadow-md' : 'text-text hover:text-white')}>Buy</button>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-sm text-text font-semibold">Order Type</label>
 <div className="w-full bg-[#0f1015] border border-[#2a2e39] rounded-2xl px-3 py-2 text-white text-sm flex justify-between items-center cursor-not-allowed">
 Market <ChevronDown size={14} className="text-[#555]" />
 </div>
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm text-text font-semibold">Quantity</label>
 <input 
 type="number" 
 value={tradeForm.qty} 
 onChange={e => setTradeForm({...tradeForm, qty: Number(e.target.value)})}
 className="w-full bg-[#0f1015] border border-[#2a2e39] rounded-2xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
 />
 </div>
 </div>

 <div className="bg-[#131722] rounded-[1.5rem] p-4 border border-[#2a2e39] space-y-3 shadow-inner">
 <div className="flex justify-between text-xs items-center">
 <span className="text-text">Estimated Value</span>
 <span className="text-white font-mono">${formatNumber(tradeForm.qty * currentActivePrice)}</span>
 </div>
 <div className="flex justify-between text-xs items-center">
 <span className="text-text">Commission (<span className="text-emerald-500">Free</span>)</span>
 <span className="text-white font-mono">$0.00</span>
 </div>
 <div className="w-full h-px bg-[#2a2e39]"></div>
 <div className="flex justify-between text-xs items-center">
 <span className="text-white">Margin Req (1:{leverage})</span>
 <span className="text-white">${formatNumber((tradeForm.qty * currentActivePrice) / leverage)}</span>
 </div>
 </div>

 <button type="submit" className={cn("w-full py-4 rounded-[1.5rem] font-bold transition-all text-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:scale-[0.98]", tradeForm.action === 'BUY' ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50" : "bg-rose-600 hover:bg-rose-500 shadow-rose-900/50")}>
 {tradeForm.action === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'}
 </button>
 </form>
 </div>

 {/* Position Display Info */}
 <div className="p-5 border-b border-[#2a2e39] bg-[#131722]">
 <h3 className="text-sm font-bold text-text mb-4">Position Summary</h3>
 {activePositionObj ? (
 <div className="space-y-4">
 <div className="flex justify-between items-baseline">
 <span className="text-text text-sm">Shares Held</span>
 <span className="text-white font-mono text-lg">{formatNumber(activePositionObj.qty, 4)}</span>
 </div>
 <div className="flex justify-between items-baseline">
 <span className="text-text text-sm">Average Cost</span>
 <span className="text-white font-mono">${activePositionObj.pru.toFixed(2)}</span>
 </div>
 <div className="flex justify-between items-baseline">
 <span className="text-text text-sm">Unrealized P&L</span>
 <span className={cn("font-mono font-bold", ((currentActivePrice - activePositionObj.pru) * activePositionObj.qty) >= 0 ? "text-emerald-500" : "text-rose-500")}>
 {formatWithSign(((currentActivePrice - activePositionObj.pru) * activePositionObj.qty))}
 </span>
 </div>
 <div className="flex justify-between items-baseline">
 <span className="text-text text-sm">Market Value</span>
 <span className="text-white font-mono">${formatNumber(activePositionObj.qty * currentActivePrice)}</span>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 opacity-50">
 <Briefcase size={24} className="text-[#555]" />
 <span className="text-sm">No position in {activeSymbol}</span>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}

