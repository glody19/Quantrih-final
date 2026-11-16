import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { FAMOUS_ALLOCATIONS } from "../../data/famousAllocations";

type Item = { key: string; name: string; sub?: string; value: number; icon?: string; onClick?: () => void };

/** One scrolling row. The label stays small in the corner; names are the readable part. */
function Row({ label, items, seconds, reverse }: { label: string; items: Item[]; seconds: number; reverse?: boolean }) {
  if (items.length < 3) return null;
  const run = (
    <div className="flex items-center shrink-0">
      {items.map((it) => (
        <button key={it.key} type="button" onClick={it.onClick} className="flex items-center gap-2 px-5 py-1.5 whitespace-nowrap hover:bg-white/[0.04] rounded-md">
          {it.icon && <img src={it.icon} alt="" className="w-5 h-5 rounded-full" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
          <span className="text-[19px] font-medium text-white/90">{it.name}</span>
          {it.sub && <span className="text-[14px] text-white/40">{it.sub}</span>}
          <span className={cn("text-[17px] font-mono font-semibold tabular-nums", it.value >= 0 ? "text-emerald-400" : "text-rose-400")}>{it.value >= 0 ? "+" : ""}{it.value.toFixed(2)}%</span>
        </button>
      ))}
    </div>
  );
  return (
    <div>
      <div className="overflow-hidden group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}>
          {run}
          {run}
        </div>
      </div>
      {/* discreet caption under the row */}
      <p className="text-right pr-4 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">{label}</p>
    </div>
  );
}

/**
 * Scrolling row under the hero: famous allocations year to date, computed from real prices.
 * A discreet caption under the row says what the figures are.
 */
export function MarketTickers({ fr }: { fr: boolean }) {
  const navigate = useNavigate();
  const go = (path: string) => { navigate(path); window.scrollTo({ top: 0 }); };
  const [ytd, setYtd] = useState<Record<string, { ytd: number } | null>>({});

  const allocSymbols = useMemo(() => Array.from(new Set(FAMOUS_ALLOCATIONS.flatMap((a) => a.assets.map((x) => x.symbol)))), []);
  useEffect(() => {
    let alive = true;
    fetch(`/api/stock/ytd?symbols=${encodeURIComponent(allocSymbols.join(","))}`).then((r) => (r.ok ? r.json() : {})).then((d: any) => { if (alive && d) setYtd(d); }).catch(() => {});
    return () => { alive = false; };
  }, [allocSymbols]);

  const allocItems: Item[] = FAMOUS_ALLOCATIONS.flatMap((a) => {
    const parts = a.assets.map((x) => ytd[x.symbol]);
    if (parts.some((p) => !p || typeof p.ytd !== "number")) return [];
    return [{ key: a.id, name: a.name, sub: a.author, value: a.assets.reduce((s, x, i) => s + (x.weight / 100) * (parts[i] as any).ytd, 0), onClick: () => go(`/portfolio-backtest?preset=${a.id}`) }];
  });
  if (allocItems.length === 0) return null;
  return (
    <div className="w-full bg-[#06111A] border-y border-white/10 pt-2 pb-1">
      <Row label={fr ? "Allocations · depuis le 1er janv." : "Allocations · YTD"} items={allocItems} seconds={Math.max(28, allocItems.length * 3)} />
    </div>
  );
}
