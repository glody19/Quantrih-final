import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Plus, Trash, ArrowRight, Percent, AreaChart, User, BarChart3, Radio, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../../contexts/LanguageContext';
import { AdvancedTradingViewChart } from '../ui/AdvancedTradingViewChart';
import { TrendingUp, Search } from 'lucide-react';
import { TickerInput } from "../ui/TickerInput";

export function Market() {

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      // Get current time in New York
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const day = nyTime.getDay();
      const hours = nyTime.getHours();
      const minutes = nyTime.getMinutes();
      
      // Check if it's weekend
      if (day === 0 || day === 6) {
        setIsWeekend(true);
        setIsMarketOpen(false);
        return;
      }
      setIsWeekend(false);

      // US Market holidays (simplified for 2024-2026, can be extended)
      const holidays = [
        "01-01", // New Year's Day
        "01-15", // MLK Day 2024
        "01-20", // MLK Day 2025
        "01-19", // MLK Day 2026
        "02-19", // Presidents' Day 2024
        "02-17", // Presidents' Day 2025
        "02-16", // Presidents' Day 2026
        "03-29", // Good Friday 2024
        "04-18", // Good Friday 2025
        "04-03", // Good Friday 2026
        "05-27", // Memorial Day 2024
        "05-26", // Memorial Day 2025
        "05-25", // Memorial Day 2026
        "06-19", // Juneteenth
        "07-04", // Independence Day
        "09-02", // Labor Day 2024
        "09-01", // Labor Day 2025
        "09-07", // Labor Day 2026
        "11-28", // Thanksgiving 2024
        "11-27", // Thanksgiving 2025
        "11-26", // Thanksgiving 2026
        "12-25"  // Christmas Day
      ];
      
      const monthStr = String(nyTime.getMonth() + 1).padStart(2, '0');
      const dayStr = String(nyTime.getDate()).padStart(2, '0');
      const md = `${monthStr}-${dayStr}`;
      
      if (holidays.includes(md)) {
        setIsWeekend(true); // Treat holiday as weekend
        setIsMarketOpen(false);
        return;
      }

      // Check if between 9:30 AM and 4:00 PM
      const isPastOpen = hours > 9 || (hours === 9 && minutes >= 30);
      const isBeforeClose = hours < 16;
      
      setIsMarketOpen(isPastOpen && isBeforeClose);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

 const { t, language } = useTranslation();
  const [currentSymbol, setCurrentSymbol] = useState("SPY");
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCurrentSymbol(searchInput.trim().toUpperCase());
    }
  };
 const [portfolios, setPortfolios] = useState<any>({ lazy: [] });
 const [livePrices, setLivePrices] = useState<Record<string, { price: number, changePct: number }>>({});
 const [loading, setLoading] = useState(true);
 
 useEffect(() => {
 fetch('/api/portfolios')
 .then(r => r.json())
 .then(data => {
 setPortfolios(data);
 setLoading(false);
 });

 // WebSocket connection
 const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 const ws = new WebSocket(`${protocol}//${window.location.host}`);
 
 ws.onmessage = (e) => {
 const msg = JSON.parse(e.data);
 if (msg.type === 'snapshot') {
 const lp: any = {};
 for (const [sym, data] of Object.entries(msg.data)) {
 lp[sym] = { price: (data as any).price, changePct: (data as any).changePct || 0 };
 }
 setLivePrices(lp);
 } else if (msg.type === 'trade') {
 const { symbol, price, changePct } = msg.data;
 setLivePrices(prev => ({ ...prev, [symbol]: { price, changePct } }));
 }
 };

 return () => ws.close();
 }, []);

 const SYMBOLS = ["SPY", "QQQ", "VOO", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "AMD", "AVGO", "COST", "NFLX", "JPM", "V", "UNH", "MA", "PG", "XOM"];

 /** 
 * Calculate live total value & daily % based on WebSocket live prices. 
 * (Assuming base is 10000 USD for display logic, or just %)
 */
 const getLivePortfolioStats = (comp: Record<string, number>) => {
 let currentVal = 0;
 let baselineVal = 0;
 for (const [sym, weight] of Object.entries(comp)) {
 if (!livePrices[sym] || !livePrices[sym].price) {
 // fallback if no live data
 currentVal += weight;
 baselineVal += weight;
 continue;
 }
 const changePct = livePrices[sym].changePct || 0;
 // Inverse math to get prev close: price = prevClose * (1 + changePct/100)
 // prevClose = price / (1 + changePct/100)
 const prevClose = livePrices[sym].price / (1 + (changePct/100));
 
 // Let's pretend initial investment was "weight" dollars
 const shares = weight / prevClose;
 baselineVal += weight;
 currentVal += shares * livePrices[sym].price;
 }
 const dayChangePct = baselineVal > 0 ? ((currentVal - baselineVal) / baselineVal) * 100 : 0;
 return { dayChangePct };
 };

 const renderTable = (list: any[]) => (
 <div className="w-full relative overflow-hidden bg-surface border border-border/60 rounded-[2rem] shadow-sm">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead>
 <tr className="border-b border-border bg-surface-2">
 <th className="font-semibold px-6 py-4 text-text">Portfolio</th>
 <th className="font-semibold px-6 py-4 text-text">Allocation</th>
 <th className="font-semibold px-6 py-4 text-right text-text">1D Live (%)</th>
 <th className="font-semibold px-6 py-4 text-right text-text">3M (%)</th>
 <th className="font-semibold px-6 py-4 text-right text-text">6M (%)</th>
 <th className="font-semibold px-6 py-4 text-right text-text">1Y (%)</th>
 <th className="font-semibold px-6 py-4 text-right text-text">3Y (%)</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40">
 {list.map((p, i) => {
 const liveStats = getLivePortfolioStats(p.composition);
 return (
 <tr key={i} className="hover:bg-black/[0.01] transition-colors cursor-default">
 <td className="px-6 py-5 font-semibold text-text">{p.name}</td>
 <td className="px-6 py-5">
 <div className="flex gap-2 flex-wrap max-w-sm">
 {Object.entries(p.composition).slice(0, 5).map(([sym, w]: [string, any]) => (
 <span key={sym} className="px-2 py-1 rounded bg-surface-3 text-text text-xs font-medium border border-border">
 {sym} <span className="opacity-60">{w}%</span>
 </span>
 ))}
 {Object.keys(p.composition).length > 5 && (
 <span className="px-2 py-1 rounded bg-surface-3 text-text text-xs font-medium border border-border">
 +{Object.keys(p.composition).length - 5}
 </span>
 )}
 </div>
 </td>
 <td className={cn("px-6 py-5 text-right font-medium", liveStats.dayChangePct >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {liveStats.dayChangePct >= 0 ? '+' : ''}{liveStats.dayChangePct.toFixed(2)}%
 </td>
 <td className={cn("px-6 py-5 text-right font-medium", p.perf?.perf_3m >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {p.perf?.perf_3m ? (p.perf.perf_3m >= 0 ? '+' : '') + p.perf.perf_3m.toFixed(2) + '%' : '-'}
 </td>
 <td className={cn("px-6 py-5 text-right font-medium", p.perf?.perf_6m >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {p.perf?.perf_6m ? (p.perf.perf_6m >= 0 ? '+' : '') + p.perf.perf_6m.toFixed(2) + '%' : '-'}
 </td>
 <td className={cn("px-6 py-5 text-right font-medium", p.perf?.perf_1y >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {p.perf?.perf_1y ? (p.perf.perf_1y >= 0 ? '+' : '') + p.perf.perf_1y.toFixed(2) + '%' : '-'}
 </td>
 <td className={cn("px-6 py-5 text-right font-medium", p.perf?.perf_3y >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {p.perf?.perf_3y ? (p.perf.perf_3y >= 0 ? '+' : '') + p.perf.perf_3y.toFixed(2) + '%' : '-'}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 );

 return (
 <div className="w-full mx-auto max-w-[1400px] px-6 md:px-12 space-y-12 pb-24 relative min-h-[calc(100vh-80px)] font-sans">
 <div className="relative pt-12 pb-8 border-b border-border/40 flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-3">
 <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
      <h1 className="text-3xl md:text-4xl font-bold text-pv-blue tracking-tight">
        Markets
      </h1>
    </div>
 <p className="text-sm text-text max-w-2xl leading-relaxed">
 Real-time index performance and benchmark portfolios.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <div className="flex flex-col text-right">
 <span className="text-xs text-text font-bold mb-1">Status</span>
 <span className="text-xs text-text font-medium flex items-center justify-end gap-2">
 
      {!isWeekend && (
        <span className="flex items-center gap-2">
          {isMarketOpen ? (
            <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Market Open</>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" /> Market Closed</>
          )}
        </span>
      )}
    
 </span>
 </div>
 </div>
 </div>
 
 {/* 1. TICKER MARQUEE */}
 <div className="w-full rounded-[1.5rem] bg-surface/50 overflow-hidden flex shadow-sm relative border border-border/40">
 <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none w-20" />
 <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none w-20" />
 
 <div className="flex-1 overflow-hidden relative flex items-center group">
 <div className="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] py-4">
 {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((sym, i) => {
 const data = livePrices[sym];
 const price = data?.price ? data.price.toFixed(2) : '---';
 const change = data?.changePct || 0;
 return (
 <div key={i} className="flex flex-col px-6 border-r border-border/40 items-end justify-center min-w-[120px] transition-colors cursor-default">
 <div className="flex w-full justify-between items-center gap-3">
 <span className="font-semibold text-xs text-text">{sym}</span>
 <span className="text-sm text-text font-medium">{price}</span>
 </div>
 <span className={cn("text-sm font-medium mt-0.5", change >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {change >= 0 ? '+' : ''}{change.toFixed(2)}%
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center p-24 text-text gap-4">
 <RefreshCw className="animate-spin text-pv-blue opacity-50" size={24} />
 <span className="text-xs font-bold">Synchronizing Historical Cache...</span>
 </div>
 ) : (
 <div className="space-y-16">
 <section className="space-y-6">
 <div className="w-full h-[650px] bg-surface rounded-[2rem] p-6 flex flex-col gap-6 border border-border shadow-sm">
 
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 shrink-0 border-b border-border/40 pb-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50/50 dark:bg-sky-500/10">
        <Activity size={20} className="text-sky-500" />
      </div>
      <div>
        <h2 className="text-lg font-medium text-text">{currentSymbol} Tracker</h2> 
        <p className="text-xs text-text-4">{'Real-time performance chart'}</p>
      </div>
    </div>
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative z-50 w-full md:w-64">
        <TickerInput 
          value={searchInput}
          onChange={setSearchInput}
          onSelect={(sym) => setCurrentSymbol(sym)}
          onSubmit={(sym) => setCurrentSymbol(sym)}
          placeholder={'Search ticker (e.g. AAPL)'}
          className="w-full bg-surface-2 border border-border rounded-2xl pl-3 pr-4 py-2 text-sm outline-none focus:border-sky-500 transition-colors text-text placeholder:text-text-4"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-sky-500/10 text-sky-500 font-medium text-sm rounded-2xl hover:bg-sky-500/20 transition-colors border border-sky-500/20">
        {'Search'}
      </button>
    </form>
  </div>
  <div className="flex-1 w-full relative overflow-hidden rounded-[1.5rem] border border-border/40">
    <AdvancedTradingViewChart symbol={currentSymbol} theme="light" />

 </div>
 </div>
 </section>

 {/* BENCHMARK PORTFOLIOS */}
 <section className="space-y-6">
 <div className="space-y-2 border-b border-border/40 pb-4">
 <h2 className="text-xl font-medium tracking-tight text-text">Benchmark Portfolios</h2>
 <p className="text-xs text-text">Classic static allocations and real-time performance</p>
 </div>
 {renderTable(portfolios.lazy)}
 </section>

 </div>
 )}
 </div>
 );
}
