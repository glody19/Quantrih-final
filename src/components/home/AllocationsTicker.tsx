import React, { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { FAMOUS_ALLOCATIONS } from "../../data/famousAllocations";

/**
 * Scrolling strip with the year-to-date return of ten famous allocations.
 * Each portfolio return = weighted sum of its ETFs' real YTD total returns
 * (weights set on 1 January). Portfolios with missing data are not shown.
 */
export function AllocationsTicker({ label = "YTD" }: { label?: string }) {
  const navigate = useNavigate();
  const [ytd, setYtd] = useState<Record<string, { ytd: number; asOf: string } | null>>({});

  const symbols = useMemo(() => Array.from(new Set(FAMOUS_ALLOCATIONS.flatMap((a) => a.assets.map((x) => x.symbol)))), []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/stock/ytd?symbols=${encodeURIComponent(symbols.join(","))}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: any) => {
        if (alive && d && typeof d === "object") setYtd(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [symbols]);

  const rows = FAMOUS_ALLOCATIONS.map((a) => {
    const parts = a.assets.map((x) => ytd[x.symbol]);
    if (parts.some((p) => !p || typeof p.ytd !== "number")) return null;
    const value = a.assets.reduce((s, x, i) => s + (x.weight / 100) * (parts[i] as any).ytd, 0);
    return { ...a, value };
  }).filter(Boolean) as (typeof FAMOUS_ALLOCATIONS[number] & { value: number })[];

  const asOf = Object.values(ytd).find((v) => v && v.asOf)?.asOf;

  if (rows.length === 0) return null;

  const row = (
    <div className="flex items-center gap-12 pr-12 shrink-0">
      {rows.map((r) => {
        const up = r.value >= 0;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => { navigate(`/portfolio-backtest?preset=${r.id}`); window.scrollTo({ top: 0 }); }}
            className="inline-flex items-center gap-3 whitespace-nowrap rounded-lg px-2 py-1 -mx-2 hover:bg-pv-blue/5 transition-colors"
            title={r.assets.map((x) => `${x.symbol} ${x.weight}%`).join(" · ")}
          >
            <span className="font-semibold text-text">{r.name}</span>
            <span className="text-text-3 text-sm">{r.author}</span>
            <span className={cn("font-mono font-semibold inline-flex items-center gap-1", up ? "text-emerald-600" : "text-rose-600")}>
              {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {up ? "+" : ""}
              {r.value.toFixed(2)}%
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full border-y border-border bg-white/80 backdrop-blur-sm">
      <div className="flex items-stretch">
        <div className="shrink-0 flex flex-col justify-center px-5 border-r border-border bg-white">
          <span className="text-xs font-bold uppercase tracking-wider text-pv-blue">{label}</span>
          {asOf && <span className="text-[11px] text-text-4">{asOf}</span>}
        </div>
        <div className="flex-1 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: "55s" }}>
            {row}
            {row}
          </div>
        </div>
      </div>
    </div>
  );
}
