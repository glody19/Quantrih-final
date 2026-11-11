import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { cn } from "../../lib/utils";

const COINS: { s: string; n: string; c: string }[] = [
  { s: "BTC", n: "Bitcoin", c: "#F7931A" },
  { s: "ETH", n: "Ethereum", c: "#8C9EFF" },
  { s: "SOL", n: "Solana", c: "#19FB9B" },
  { s: "BNB", n: "BNB", c: "#F3BA2F" },
  { s: "XRP", n: "XRP", c: "#9CA3AF" },
  { s: "ADA", n: "Cardano", c: "#4C8DFF" },
  { s: "DOGE", n: "Dogecoin", c: "#C2A633" },
  { s: "AVAX", n: "Avalanche", c: "#E84142" },
];

type Coin = { price: number; pct: number; vol: number; spark: number[] };

function Price({ value, start }: { value: number; start: boolean }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!start) return;
    const c = animate(prev.current, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value, start]);
  const d = value >= 100 ? 2 : value >= 1 ? 3 : 5;
  return <>${v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}</>;
}

function Spark({ data, color, up, start, delay }: { data: number[]; color: string; up: boolean; start: boolean; delay: number }) {
  if (data.length < 2) return <div className="h-16" />;
  const lo = Math.min(...data), hi = Math.max(...data), span = hi - lo || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 200},${56 - ((v - lo) / span) * 50}`);
  const line = "M" + pts.join(" L");
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-16">
      <defs>
        <linearGradient id={`cg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      <motion.path d={`${line} L200,60 L0,60 Z`} fill={`url(#cg-${color.slice(1)})`} initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: delay + 0.5 }} />
      <motion.path d={line} fill="none" stroke={up ? color : "#FDA4AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={start ? { pathLength: 1 } : {}} transition={{ duration: 1.3, delay, ease: "easeOut" }} />
    </svg>
  );
}

/** Live crypto prices straight from Binance's public API (no key). Hidden if Binance is unreachable. */
export function CryptoBoard({ fr }: { fr: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [data, setData] = useState<Record<string, Coin>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const symbols = JSON.stringify(COINS.map((c) => `${c.s}USDT`));
    const sparks: Record<string, number[]> = {};
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`);
        if (!res.ok) throw new Error(String(res.status));
        const list = await res.json();
        if (!alive) return;
        const next: Record<string, Coin> = {};
        list.forEach((x: any) => {
          const s = String(x.symbol).replace("USDT", "");
          next[s] = { price: +x.lastPrice, pct: +x.priceChangePercent, vol: +x.quoteVolume, spark: sparks[s] || [] };
        });
        setData(next);
      } catch {
        if (alive) setFailed(true);
      }
    };
    // 7 days of 4-hour candles for the sparklines, loaded once
    Promise.all(COINS.map((c) =>
      fetch(`https://api.binance.com/api/v3/klines?symbol=${c.s}USDT&interval=4h&limit=42`).then((r) => (r.ok ? r.json() : [])).then((k: any[]) => { sparks[c.s] = k.map((x) => +x[4]); }).catch(() => {})
    )).finally(load);
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (failed && Object.keys(data).length === 0) return null;

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {COINS.map((c, i) => {
        const d = data[c.s];
        const up = (d?.pct ?? 0) >= 0;
        return (
          <motion.div
            key={c.s}
            initial={{ opacity: 0, y: 40, rotateX: 25 }}
            animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 [transform-style:preserve-3d]"
          >
            <span className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: c.c }} />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0B0A24]" style={{ background: c.c }}>{c.s.slice(0, 3)}</span>
                <span><span className="block text-sm font-semibold text-white leading-tight">{c.n}</span><span className="text-[11px] text-white/40 font-mono">{c.s}/USDT</span></span>
              </span>
              {d && <span className={cn("text-xs font-mono font-semibold px-2 py-1 rounded-full", up ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300")}>{up ? "+" : ""}{d.pct.toFixed(2)}%</span>}
            </div>
            <p className="relative mt-4 text-2xl md:text-[28px] font-semibold text-white font-mono tabular-nums tracking-tight">
              {d ? <Price value={d.price} start={inView} /> : <span className="inline-block w-28 h-7 rounded bg-white/10 animate-pulse" />}
            </p>
            <div className="relative mt-2 -mx-1"><Spark data={d?.spark || []} color={c.c} up={up} start={inView} delay={0.2 + i * 0.08} /></div>
            <p className="relative text-[11px] text-white/35">{fr ? "7 jours · volume 24 h" : "7 days · 24h volume"} {d ? `$${(d.vol / 1e9).toFixed(2)}B` : ""}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
