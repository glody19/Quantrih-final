import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { FAMOUS_ALLOCATIONS } from "../../data/famousAllocations";
import { MODEL_PORTFOLIOS } from "../../data/modelPortfolios";
import { useModelPerformance } from "../../hooks/useModelPerformance";

const CRYPTO = [
  ["BTC", "Bitcoin"], ["ETH", "Ethereum"], ["SOL", "Solana"], ["BNB", "BNB"], ["XRP", "XRP"], ["ADA", "Cardano"],
  ["DOGE", "Dogecoin"], ["AVAX", "Avalanche"], ["DOT", "Polkadot"], ["LINK", "Chainlink"], ["LTC", "Litecoin"], ["TRX", "TRON"],
] as const;
const cryptoIcon = (s: string) => `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${s.toLowerCase()}.svg`;

type Item = { key: string; name: string; sub?: string; value: number; icon?: string; onClick?: () => void };

/** One scrolling row. The label stays small in the corner; names are the readable part. */
function Row({ label, items, seconds, reverse }: { label: string; items: Item[]; seconds: number; reverse?: boolean }) {
  if (items.length < 3) return null;
  const run = (
    <div className="flex items-center shrink-0">
      {items.map((it) => (
        <button key={it.key} type="button" onClick={it.onClick} className="flex items-center gap-2 px-5 py-1.5 whitespace-nowrap hover:bg-white/[0.04] rounded-md">
          {it.icon && <img src={it.icon} alt="" className="w-4 h-4 rounded-full" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
          <span className="text-[13px] font-medium text-white/90">{it.name}</span>
          {it.sub && <span className="text-[11px] text-white/40">{it.sub}</span>}
          <span className={cn("text-[12px] font-mono font-semibold tabular-nums", it.value >= 0 ? "text-emerald-400" : "text-rose-400")}>{it.value >= 0 ? "+" : ""}{it.value.toFixed(2)}%</span>
        </button>
      ))}
    </div>
  );
  return (
    <div className="relative">
      <div className="overflow-hidden group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}>
          {run}
          {run}
        </div>
      </div>
      {/* small label pinned on the left, over a fade so the moving names pass behind it */}
      <span className="pointer-events-none absolute left-0 inset-y-0 flex items-stretch">
        <span className="flex items-center pl-2 pr-2 bg-[#0A0920]">
          <span className="text-[9px] leading-none font-semibold uppercase tracking-[0.14em] text-[#B6ABF7] border border-[#B6ABF7]/30 rounded px-1.5 py-1 whitespace-nowrap">{label}</span>
        </span>
        <span className="w-12 bg-gradient-to-r from-[#0A0920] to-transparent" />
      </span>
    </div>
  );
}

/**
 * Three scrolling rows under the hero: famous allocations year to date, lazy portfolios over one year
 * and cryptocurrencies over one year. All figures are computed from real prices; rows without data hide.
 */
export function MarketTickers({ fr }: { fr: boolean }) {
  const navigate = useNavigate();
  const go = (path: string) => { navigate(path); window.scrollTo({ top: 0 }); };
  const [ytd, setYtd] = useState<Record<string, { ytd: number } | null>>({});
  const [crypto, setCrypto] = useState<Record<string, { y1: number | null } | null>>({});
  const { stats } = useModelPerformance();

  const allocSymbols = useMemo(() => Array.from(new Set(FAMOUS_ALLOCATIONS.flatMap((a) => a.assets.map((x) => x.symbol)))), []);
  useEffect(() => {
    let alive = true;
    fetch(`/api/stock/ytd?symbols=${encodeURIComponent(allocSymbols.join(","))}`).then((r) => (r.ok ? r.json() : {})).then((d: any) => { if (alive && d) setYtd(d); }).catch(() => {});
    fetch(`/api/stock/performance?symbols=${CRYPTO.map(([s]) => s + "-USD").join(",")}`).then((r) => (r.ok ? r.json() : {})).then((d: any) => { if (alive && d) setCrypto(d); }).catch(() => {});
    return () => { alive = false; };
  }, [allocSymbols]);

  const allocItems: Item[] = FAMOUS_ALLOCATIONS.flatMap((a) => {
    const parts = a.assets.map((x) => ytd[x.symbol]);
    if (parts.some((p) => !p || typeof p.ytd !== "number")) return [];
    return [{ key: a.id, name: a.name, sub: a.author, value: a.assets.reduce((s, x, i) => s + (x.weight / 100) * (parts[i] as any).ytd, 0), onClick: () => go(`/portfolio-backtest?preset=${a.id}`) }];
  });
  const lazyItems: Item[] = MODEL_PORTFOLIOS.flatMap((p) => {
    const v = stats[p.id]?.y1;
    return typeof v === "number" ? [{ key: p.id, name: p.name, sub: p.author, value: v, onClick: () => go(`/market?lazy=${p.id}`) }] : [];
  });
  const cryptoItems: Item[] = CRYPTO.flatMap(([s, n]) => {
    const v = crypto[s + "-USD"]?.y1;
    return typeof v === "number" ? [{ key: s, name: n, sub: s, value: v, icon: cryptoIcon(s), onClick: () => go("/market") }] : [];
  });

  if (allocItems.length + lazyItems.length + cryptoItems.length === 0) return null;
  return (
    <div className="w-full bg-[#0A0920] border-y border-white/10 py-2 grid gap-1">
      <Row label={fr ? "Allocations · depuis le 1er janv." : "Allocations · YTD"} items={allocItems} seconds={Math.max(28, allocItems.length * 3)} />
      <Row label={fr ? "Lazy portfolios · 1 an" : "Lazy portfolios · 1Y"} items={lazyItems} seconds={Math.max(24, lazyItems.length * 3.4)} reverse />
      <Row label={fr ? "Cryptomonnaies · 1 an" : "Cryptocurrency · 1Y"} items={cryptoItems} seconds={Math.max(24, cryptoItems.length * 2.6)} />
    </div>
  );
}
