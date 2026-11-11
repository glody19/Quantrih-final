import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { MarketClock } from "../ui/MarketClock";

// Indices, ETFs, gold, FX and bitcoin shown in the scrolling bar at the bottom of the Market page.
const LIVE_SYMBOLS: { s: string; n: string }[] = [
  { s: "^BFX", n: "BEL 20" },
  { s: "^FCHI", n: "CAC 40" },
  { s: "^STOXX50E", n: "Euro Stoxx 50" },
  { s: "^GDAXI", n: "DAX" },
  { s: "^FTSE", n: "FTSE 100" },
  { s: "^GSPC", n: "S&P 500" },
  { s: "^IXIC", n: "Nasdaq" },
  { s: "^N225", n: "Nikkei 225" },
  { s: "VWCE.DE", n: "VWCE" },
  { s: "IWDA.AS", n: "IWDA" },
  { s: "GC=F", n: "Gold" },
  { s: "EURUSD=X", n: "EUR/USD" },
  { s: "BTC-USD", n: "Bitcoin" },
];

/** Fixed bottom bar of the Market page: real quotes scrolling + exchange opening hours. */
export function MarketTickerBar({ label = "Markets", onSelect }: { label?: string; onSelect?: (symbol: string) => void }) {
  const [quotes, setQuotes] = useState<Record<string, { price: number; pct: number }>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/stock/bulk-quotes?symbols=${encodeURIComponent(LIVE_SYMBOLS.map((x) => x.s).join(","))}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data)) return;
        const next: Record<string, { price: number; pct: number }> = {};
        data.forEach((q: any) => {
          const price = q?.regularMarketPrice ?? q?.price;
          const pct = q?.regularMarketChangePercent ?? q?.changesPercentage;
          // Only real quotes: skip anything without a numeric price
          if (q?.symbol && typeof price === "number" && price > 0) next[q.symbol] = { price, pct: typeof pct === "number" ? pct : 0 };
        });
        setQuotes(next);
      } catch {
        // Network issue: keep the last real values.
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const items = LIVE_SYMBOLS.filter((x) => quotes[x.s]);

  const row = (
    <div className="flex items-center gap-10 pr-10 shrink-0">
      {items.map((x) => {
        const q = quotes[x.s];
        const up = q.pct >= 0;
        return (
          <button
            key={x.s}
            type="button"
            onClick={() => onSelect?.(x.s)}
            className="inline-flex items-center gap-2.5 text-sm whitespace-nowrap hover:opacity-80"
          >
            <span className="font-semibold text-white/75">{x.n}</span>
            <span className="font-mono text-white">{q.price.toLocaleString("en-US", { maximumFractionDigits: q.price < 10 ? 4 : 2 })}</span>
            <span className={cn("font-mono font-semibold inline-flex items-center gap-0.5", up ? "text-emerald-400" : "text-rose-400")}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {up ? "+" : ""}
              {q.pct.toFixed(2)}%
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] h-12 bg-[#0B0A1F] border-t border-white/10 flex items-stretch shadow-[0_-6px_24px_rgba(0,0,0,0.25)]">
      <span className="shrink-0 flex items-center gap-1.5 px-4 text-xs font-bold uppercase tracking-wider text-[#B6ABF7] border-r border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {label}
      </span>
      <div className="flex-1 min-w-0 overflow-hidden flex items-center [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
        {items.length > 0 ? (
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: "60s" }}>
            {row}
            {row}
          </div>
        ) : (
          <span className="px-4 text-sm text-white/40">-</span>
        )}
      </div>
      <div className="hidden lg:flex items-center px-4 border-l border-white/10 overflow-x-auto no-scrollbar max-w-[55%]">
        <MarketClock dark />
      </div>
    </div>
  );
}
