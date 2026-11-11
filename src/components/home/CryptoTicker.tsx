import React, { useEffect, useState } from "react";

const COINS = [
  ["BTC", "Bitcoin"], ["ETH", "Ethereum"], ["SOL", "Solana"], ["BNB", "BNB"], ["XRP", "XRP"], ["ADA", "Cardano"],
  ["DOGE", "Dogecoin"], ["AVAX", "Avalanche"], ["DOT", "Polkadot"], ["LINK", "Chainlink"], ["LTC", "Litecoin"], ["TRX", "TRON"],
] as const;

type Q = { price: number; pct: number; logo?: string };
const iconFallback = (s: string) => `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${s.toLowerCase()}.svg`;

/** Thin horizontal band of crypto prices with their real icons, scrolling sideways. Hidden until data arrives. */
export function CryptoTicker() {
  const [q, setQ] = useState<Record<string, Q>>({});
  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.hidden) return;
      fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${COINS.map(([s]) => s + "-USD").join(",")}`)
        .then((r) => (r.ok && r.headers.get("X-Quantrih-Data") !== "demo" ? r.json() : []))
        .then((arr: any[]) => {
          if (!alive || !Array.isArray(arr)) return;
          const o: Record<string, Q> = {};
          arr.forEach((x) => { if (x?.symbol && typeof x.regularMarketPrice === "number") o[x.symbol.replace("-USD", "")] = { price: x.regularMarketPrice, pct: x.regularMarketChangePercent ?? 0, logo: x.logoUrl || x.coinImageUrl }; });
          setQ((old) => ({ ...old, ...o }));
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const items = COINS.filter(([s]) => q[s]);
  if (items.length < 4) return null;
  return (
    <div className="w-full border-y border-white/10 bg-[#07061A] overflow-hidden group [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: "55s" }}>
        {[...items, ...items].map(([s, name], i) => {
          const c = q[s];
          const d = c.price >= 100 ? 2 : c.price >= 1 ? 3 : 4;
          return (
            <span key={s + i} className="flex items-center gap-2.5 px-6 py-2.5 border-r border-white/[0.07] text-sm whitespace-nowrap">
              <img src={c.logo || iconFallback(s)} onError={(e) => { if (!e.currentTarget.src.includes("jsdelivr")) e.currentTarget.src = iconFallback(s); else e.currentTarget.style.visibility = "hidden"; }} alt="" className="w-5 h-5 rounded-full" loading="lazy" referrerPolicy="no-referrer" />
              <span className="font-semibold text-white">{s}</span>
              <span className="text-white/45 hidden sm:inline">{name}</span>
              <span className="font-mono tabular-nums text-white/90">${c.price.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}</span>
              <span className={"font-mono tabular-nums text-xs " + (c.pct >= 0 ? "text-emerald-400" : "text-rose-400")}>{c.pct >= 0 ? "+" : ""}{c.pct.toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
