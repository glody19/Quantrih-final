import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Activity, TrendingUp, Search, Info } from 'lucide-react';
import { AssetLogo } from '../ui/AssetLogo';
import { AdvancedTradingViewChart } from '../ui/AdvancedTradingViewChart';

const formatNumber = (num: number) => {
 if (!num) return '0';
 if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
 if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
 const parts = num.toFixed(2).split('.');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 return parts.join('.');
};

const CRYPTO_TOKENS: Record<string, {name: string, ticker: string, category: string}> = {
 'BTCUSDT': { name: 'Bitcoin', ticker: 'BTC', category: 'Layer 1' },
 'ETHUSDT': { name: 'Ethereum', ticker: 'ETH', category: 'Smart Contracts' },
 'SOLUSDT': { name: 'Solana', ticker: 'SOL', category: 'Smart Contracts' },
 'BNBUSDT': { name: 'Binance Coin', ticker: 'BNB', category: 'Exchange' },
 'XRPUSDT': { name: 'Ripple', ticker: 'XRP', category: 'Payments' },
 'ADAUSDT': { name: 'Cardano', ticker: 'ADA', category: 'Smart Contracts' },
 'DOGEUSDT': { name: 'Dogecoin', ticker: 'DOGE', category: 'Meme' },
 'AVAXUSDT': { name: 'Avalanche', ticker: 'AVAX', category: 'Smart Contracts' },
 'LINKUSDT': { name: 'Chainlink', ticker: 'LINK', category: 'Oracle' },
 'DOTUSDT': { name: 'Polkadot', ticker: 'DOT', category: 'Layer 1' }
};

export function CryptoMarket({ onBack, defaultSymbol = 'BTCUSDT' }: { onBack?: () => void, defaultSymbol?: string }) {
 const [symbol, setSymbol] = useState(defaultSymbol);
 const [searchInput, setSearchInput] = useState('');
 const [cryptoInfo, setCryptoInfo] = useState<any>(null);
 const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, any>>({});
 const [showSuggestions, setShowSuggestions] = useState(false);

 // Derive suggestions locally from our list
 const suggestions = Object.entries(CRYPTO_TOKENS)
 .filter(([sym, data]) => sym.toLowerCase().includes(searchInput.toLowerCase()) || data.name.toLowerCase().includes(searchInput.toLowerCase()))
 .slice(0, 5);

 useEffect(() => {
 // Current ticker fetching
 const get24HTicker = async () => {
 try {
 const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
 if(res.ok) {
  const ct = res.headers.get("content-type"); if (ct && ct.includes("application/json")) { const json = await res.json(); setCryptoInfo(json); }
 }
 } catch (e) {
 console.warn(e);
 }
 };
 get24HTicker();
 const interval = setInterval(get24HTicker, 20000);
 return () => clearInterval(interval);
 }, [symbol]);

 useEffect(() => {
 // Fetch watchlist bulk sequentially
 const getWatchlist = async () => {
 const cryptos = Object.keys(CRYPTO_TOKENS);
 for(let cr of cryptos) {
 fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cr}`)
  .then(r => { const ct = r.headers.get("content-type"); if (r.ok && ct && ct.includes("application/json")) return r.json(); throw new Error("Invalid response"); })
 .then(data => {
 setWatchlistQuotes(prev => ({
 ...prev, 
 [cr]: { price: parseFloat(data.lastPrice), change: parseFloat(data.priceChangePercent), volume: parseFloat(data.volume || data.quoteVolume || '0') }
 }));
 }).catch(e => {});
 }
 };
 getWatchlist();
 const interval = setInterval(getWatchlist, 30000);
 return () => clearInterval(interval);
 }, []);

 const activeTokenInfo = CRYPTO_TOKENS[symbol] || { name: 'Crypto Asset', ticker: symbol.replace('USDT', ''), category: 'Crypto' };

 return (
 <div className="w-full mx-auto px-4 md:px-8 pb-16 pt-8 animate-in fade-in py-12 duration-500 font-sans">
 
 {/* Search Header */}
 <div className="mb-6 w-full max-w-md relative z-50">
 <form onSubmit={(e) => { e.preventDefault(); if (suggestions.length > 0) { setSymbol(suggestions[0][0]); setShowSuggestions(false); } }} className="relative flex items-center shadow-sm">
 <div className="absolute left-4 z-10 text-text">
 <Search size={18} className="text-pv-blue" />
 </div>
 <input
 type="text"
 placeholder="Search cryptocurrency (e.g. BTC, Solana)..."
 className="w-full bg-surface border border-border rounded-[1.5rem] pl-12 pr-4 py-3 text-sm text-text focus:border-pv-blue outline-none transition-all shadow-sm focus:ring-4 focus:ring-pv-blue/10 placeholder:text-text/70"
 value={searchInput}
 onChange={(e) => {
 setSearchInput(e.target.value);
 setShowSuggestions(true);
 }}
 onFocus={() => { if(searchInput.trim().length > 0) setShowSuggestions(true); }}
 onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
 />
 </form>

 {showSuggestions && suggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-xl border border-border overflow-hidden divide-y divide-border/50 animate-in slide-in-from-top-2 fade-in duration-200 z-50">
 {suggestions.map(([sym, data]) => (
 <div 
 key={sym}
 className="px-4 py-3 hover:bg-surface-2 cursor-pointer flex items-center justify-between transition-colors"
 onClick={() => {
 setSymbol(sym);
 setSearchInput("");
 setShowSuggestions(false);
 }}
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-text border border-border/50 text-sm">
 {data.ticker.charAt(0)}
 </div>
 <div>
 <div className="font-bold text-text text-sm tracking-tight">{data.ticker}</div>
 <div className="text-sm font-medium text-text mt-0.5">{data.name}</div>
 </div>
 </div>
 <div className="text-sm font-semibold text-text bg-surface-2 px-2 py-1 rounded">
 {data.category}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between mt-6 gap-6 border-b border-border/50 pb-6">
 <div className="flex items-center gap-6">
 {onBack && (
 <button onClick={onBack} className="text-text hover:text-pv-blue transition-colors flex items-center gap-2 text-sm font-bold mb-1">
 <ArrowLeft size={16} /> Returns
 </button>
 )}
 <div className="flex items-center gap-4">
 <div className="relative">
 <AssetLogo ticker={symbol} name={activeTokenInfo?.name || symbol} isCrypto={true} className="w-16 h-16 rounded-full bg-surface shadow-sm border border-border relative z-10" />
 </div>
 <div className="flex flex-col">
 <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
      <h1 className="text-3xl md:text-4xl font-bold text-pv-blue tracking-tight">
        {activeTokenInfo.name}
      </h1>
    </div>
 <div className="flex items-center gap-2 mt-2">
 <span className="text-pv-blue font-bold ">{symbol.replace('USDT', '')}</span>
 <span className="text-text text-sm font-medium">/ USD</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
 <div className="lg:col-span-3 space-y-8">
 <div className="w-full bg-surface border border-border rounded-[2rem] overflow-hidden h-[600px] xl:h-[750px] relative shadow-sm">
 <AdvancedTradingViewChart symbol={`BINANCE:${symbol}`} theme="light" />
 </div>

 {/* Watchlist Table */}
 <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5">
 <div className="p-6 md:px-8 border-b border-surface-2 flex justify-between items-center bg-surface-2 backdrop-blur-sm">
 <h3 className="text-sm font-semibold text-text flex items-center gap-2"><Activity size={16} className="text-pv-blue" /> Crypto Tracker Live</h3>
 </div>
 <div className="overflow-x-auto hide-scrollbar">
 <table className="w-full text-left border-collapse text-sm">
 <thead className="bg-white border-b border-surface-2">
 <tr>
 <th className="px-8 py-5 font-semibold text-text text-sm ">Actif</th>
 <th className="px-8 py-5 font-semibold text-text text-sm text-right">Prix</th>
 <th className="px-8 py-5 font-semibold text-text text-sm text-right">Variation 24h</th>
 <th className="px-8 py-5 font-semibold text-text text-sm text-right hidden sm:table-cell">Volume</th>
 <th className="px-8 py-5 font-semibold text-text text-sm text-right">Catégorie</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {Object.entries(CRYPTO_TOKENS).map(([sym, tk]) => {
 const price = watchlistQuotes[sym]?.price;
 const change = watchlistQuotes[sym]?.change;
 const isUp = change > 0;
 const isDown = change < 0;
 const isActive = symbol === sym;
 
 return (
 <tr key={sym} onClick={() => setSymbol(sym)} className={`last:border-0 hover:bg-surface-2/80 cursor-pointer transition-colors group ${isActive ? 'bg-blue-50/40 relative' : ''}`}>
 {isActive && <td className="absolute left-0 top-0 bottom-0 w-1 bg-pv-blue"></td>}
 <td className="px-8 py-5">
 <div className="flex items-center gap-4">
 <div className="relative">
 <AssetLogo ticker={sym} name={tk.name} isCrypto={true} className="w-10 h-10 rounded-full bg-white shadow-sm border border-surface-2" />
 {isActive && <div className="absolute inset-0 rounded-full ring-2 ring-pv-blue ring-offset-2"></div>}
 </div>
 <div className="flex flex-col">
 <span className={`font-bold transition-colors text-[14px] ${isActive ? 'text-pv-blue' : 'text-text group-hover:text-pv-blue'}`}>{tk.name}</span>
 <span className="text-text font-bold text-sm mt-0.5">{sym.replace('USDT','')}</span>
 </div>
 </div>
 </td>
 <td className="px-8 py-5 text-right text-[14px] font-bold text-text tracking-tight">
 {price ? `${formatNumber(price)} $US` : '-'}
 </td>
 <td className="px-8 py-5 text-right">
 <span className={`inline-flex items-center justify-center min-w-[76px] px-2.5 py-1.5 rounded-2xl text-[13px] font-bold transition-colors ${isUp ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : isDown ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-surface-2 text-text'}`}>
 {change ? `${isUp ? '+' : ''}${change.toFixed(2)}%` : '-'}
 </span>
 </td>
 <td className="px-8 py-5 text-right font-medium text-text text-[13px] hidden sm:table-cell">
 {watchlistQuotes[sym]?.volume ? formatNumber(watchlistQuotes[sym].volume) : '-'}
 </td>
 <td className="px-8 py-5 text-right font-medium text-sm text-text">
 <span className="px-3 py-1.5 bg-surface-2 rounded-2xl group-hover:bg-slate-100/80 transition-colors inline-block">{tk.category}</span>
 </td>
 </tr>
 )})}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 
 <div className="space-y-6">
 <div className="bg-gradient-to-br from-pv-blue to-blue-900 border border-blue-800 rounded-3xl p-8 shadow-[0_8px_40px_rgba(37,99,235,0.15)] relative overflow-hidden group">
 <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
 <Activity size={180} />
 </div>
 <div className="relative z-10 flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
 <TrendingUp size={16} />
 </div>
 <h3 className="text-sm font-semibold text-blue-100">Market Momentum</h3>
 </div>
 <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold text-white ">
 LIVE
 </div>
 </div>

 <div className="relative z-10">
 <p className="text-white text-5xl font-semibold tracking-tighter mb-2">74</p>
 <p className="text-blue-200 text-sm font-bold ">Greed</p>
 <div className="w-full h-2 bg-blue-950/50 rounded-full mt-6 overflow-hidden flex">
 <div className="h-full bg-rose-500 w-1/4"></div>
 <div className="h-full bg-amber-500 w-1/4"></div>
 <div className="h-full bg-emerald-400 w-1/4"></div>
 <div className="h-full bg-emerald-600 w-1/4"></div>
 </div>
 <div className="relative w-full h-4 mt-2">
 <div className="absolute top-0 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" style={{ left: '74%' }}></div>
 </div>
 </div>
 </div>

 <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-pv-blue border border-border/50">
 <Info size={16} />
 </div>
 <h3 className="text-sm font-semibold text-text">Market Statistics</h3>
 </div>
 
 {cryptoInfo ? (
 <div className="space-y-6">
 <div className="bg-surface-2 rounded-[2rem] p-5 border border-border/50">
 <p className="text-sm text-text font-bold mb-2">Current Price</p>
 <p className="text-4xl font-semibold text-text tracking-tighter">${formatNumber(parseFloat(cryptoInfo.lastPrice || '0'))}</p>
 </div>
 <div className="pt-6 border-t border-border/50">
 <p className="text-sm text-text font-bold mb-2">24h Change</p>
 <div className="flex items-center gap-3">
 <p className={`text-2xl font-semibold tracking-tight ${parseFloat(cryptoInfo.priceChangePercent || '0') >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
 {parseFloat(cryptoInfo.priceChangePercent || '0') > 0 ? '+' : ''}{parseFloat(cryptoInfo.priceChangePercent || '0').toFixed(2)}%
 </p>
 {parseFloat(cryptoInfo.priceChangePercent || '0') !== 0 && (
 <TrendingUp size={24} strokeWidth={2.5} className={`${parseFloat(cryptoInfo.priceChangePercent || '0') >= 0 ? 'text-emerald-500' : 'text-rose-500'} ${parseFloat(cryptoInfo.priceChangePercent || '0') < 0 ? 'transform rotate-180' : ''}`} />
 )}
 </div>
 </div>
 <div className="pt-6 border-t border-surface-2/80 grid grid-cols-2 gap-6">
 <div>
 <p className="text-sm text-text font-bold mb-2">24h High</p>
 <p className="text-[15px] font-bold text-text tracking-tight">${formatNumber(parseFloat(cryptoInfo.highPrice || cryptoInfo.lastPrice || '0'))}</p>
 </div>
 <div>
 <p className="text-sm text-text font-bold mb-2">24h Low</p>
 <p className="text-[15px] font-bold text-text tracking-tight">${formatNumber(parseFloat(cryptoInfo.lowPrice || cryptoInfo.lastPrice || '0'))}</p>
 </div>
 </div>
 <div className="pt-6 border-t border-surface-2/80">
 <p className="text-sm text-text font-bold mb-2">24h Volume</p>
 <p className="text-lg font-semibold text-text tracking-tight">{formatNumber(parseFloat(cryptoInfo.quoteVolume || '0'))}</p>
 </div>
 </div>
 ) : (
 <div className="animate-pulse space-y-6">
 <div className="h-24 bg-slate-100 rounded-[2rem] w-full"></div>
 <div className="pt-6 border-t border-surface-2/80">
 <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
 <div className="h-8 bg-slate-100 rounded w-1/2"></div>
 </div>
 <div className="pt-6 border-t border-surface-2/80 grid grid-cols-2 gap-6">
 <div className="h-12 bg-slate-100 rounded w-full"></div>
 <div className="h-12 bg-slate-100 rounded w-full"></div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
