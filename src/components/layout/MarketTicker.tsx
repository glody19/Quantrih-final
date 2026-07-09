import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isCurrency?: boolean;
}

const INITIAL_TIKERS: TickerItem[] = [
  { symbol: "SPX", name: "S&P 500", price: 5320.40, change: 0.45 },
  { symbol: "IXIC", name: "NASDAQ 100", price: 18485.20, change: 1.12 },
  { symbol: "DJI", name: "Dow Jones", price: 39120.15, change: -0.15 },
  { symbol: "FCHI", name: "CAC 40", price: 7984.60, change: -0.28 },
  { symbol: "GDAXI", name: "DAX 40", price: 18210.30, change: 0.18 },
  { symbol: "BTC", name: "Bitcoin", price: 68450.00, change: 2.38 },
  { symbol: "GC=F", name: "Gold", price: 2345.10, change: 0.85 },
  { symbol: "EURUSD", name: "EUR / USD", price: 1.0845, change: -0.08, isCurrency: true },
  { symbol: "GBPUSD", name: "GBP / USD", price: 1.2740, change: 0.15, isCurrency: true },
  { symbol: "TNX", name: "US 10Y Yield", price: 4.352, change: 0.02, isCurrency: true },
];

export const MarketTicker: React.FC = () => {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TIKERS);

  // Gentle live pricing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((item) => {
          const deltaPct = (Math.random() - 0.5) * 0.001; // max 0.05% change
          const newPrice = item.price * (1 + deltaPct);
          const newChange = item.change + deltaPct * 100;
          return {
            ...item,
            price: Number(newPrice.toFixed(item.isCurrency ? 4 : 2)),
            change: Number(newChange.toFixed(2)),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Concatenate tickers to ensure seamless scrolling animation (needs twice length)
  const doubleTickers = [...tickers, ...tickers, ...tickers];

  return (
    <div className="w-full bg-surface border-t border-b border-border/60 py-2.5 overflow-hidden relative z-40 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg to-transparent pointer-events-none z-10" />
      
      <div className="flex animate-scroll hover:[animation-play-state:paused] whitespace-nowrap min-w-full gap-16">
        {doubleTickers.map((item, idx) => {
          const isUp = item.change >= 0;
          return (
            <div 
              key={`${item.symbol}-${idx}`} 
              className="inline-flex items-center gap-2.5 px-2 cursor-pointer group"
            >
              <span className="text-[10px] font-black tracking-widest text-text-4 group-hover:text-text transition-colors">
                {item.symbol}
              </span>
              <span className="text-[11px] font-bold text-text-2 group-hover:text-text transition-colors">
                {item.name}
              </span>
              <span className="text-[11px] font-mono font-bold text-text">
                {item.isCurrency ? item.price : item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </span>
              <span 
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xl ${
                  isUp 
                    ? "text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10" 
                    : "text-rose-500 bg-rose-500/5 dark:bg-rose-500/10"
                }`}
              >
                {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isUp ? "+" : ""}{item.change.toFixed(2)}%
              </span>
              <span className="text-text-4/20 text-[8px] font-mono pl-4">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
