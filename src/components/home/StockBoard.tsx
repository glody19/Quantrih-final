import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/utils";

const STOCKS: { s: string; n: string; d: string }[] = [
  { s: "NVDA", n: "Nvidia", d: "nvidia.com" },
  { s: "AAPL", n: "Apple", d: "apple.com" },
  { s: "GOOGL", n: "Alphabet (Google)", d: "google.com" },
  { s: "MSFT", n: "Microsoft", d: "microsoft.com" },
  { s: "TSLA", n: "Tesla", d: "tesla.com" },
  { s: "AMZN", n: "Amazon", d: "amazon.com" },
  { s: "META", n: "Meta", d: "meta.com" },
  { s: "ASML.AS", n: "ASML", d: "asml.com" },
  { s: "MC.PA", n: "LVMH", d: "lvmh.com" },
  { s: "SAP.DE", n: "SAP", d: "sap.com" },
];

type Row = { s: string; n: string; d: string; price: number; ccy: string; day: number; y1: number | null; y5: number | null; cap: number | null; lo: number | null; hi: number | null };
type SortKey = "day" | "y1" | "y5" | "cap";

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

function Count({ value, decimals = 2, prefix = "", suffix = "", start }: { value: number; decimals?: number; prefix?: string; suffix?: string; start: boolean }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!start) return;
    const c = animate(prev.current, value, { duration: 1, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value, start]);
  return <>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

const cap = (v: number | null) => (!isNum(v) ? "-" : v >= 1e12 ? `${(v / 1e12).toFixed(2)}T` : `${(v / 1e9).toFixed(0)}B`);

export function StockBoard({ fr }: { fr: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [rows, setRows] = useState<Row[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "cap", dir: -1 });
  const [stamp, setStamp] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const syms = encodeURIComponent(STOCKS.map((x) => x.s).join(","));
    let perf: Record<string, any> = {};
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${syms}`);
        if (!res.ok || res.headers.get("X-Quantrih-Data") === "demo") return;
        const q = await res.json();
        if (!alive || !Array.isArray(q)) return;
        const next: Row[] = [];
        STOCKS.forEach((st) => {
          const x = q.find((y: any) => y?.symbol === st.s);
          if (!x || !isNum(x.regularMarketPrice)) return;
          next.push({
            ...st, price: x.regularMarketPrice, ccy: x.currency || "USD", day: x.regularMarketChangePercent ?? 0,
            y1: perf[st.s]?.y1 ?? null, y5: perf[st.s]?.y5 ?? null, cap: x.marketCap ?? null,
            lo: x.fiftyTwoWeekLow ?? null, hi: x.fiftyTwoWeekHigh ?? null,
          });
        });
        setRows(next);
        setStamp(new Date().toLocaleTimeString(fr ? "fr-BE" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
      } catch { /* keep last values */ }
    };
    fetch(`/api/stock/performance?symbols=${syms}`).then((r) => (r.ok ? r.json() : {})).then((d) => { perf = d || {}; load(); }).catch(load);
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [fr]);

  const sorted = useMemo(() => [...rows].sort((a, b) => ((a[sort.key] ?? -1e18) - (b[sort.key] ?? -1e18)) * sort.dir), [rows, sort]);
  const maxDay = Math.max(1, ...rows.map((r) => Math.abs(r.day)));

  const head = (key: SortKey, label: string) => (
    <button onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))} className={cn("inline-flex items-center gap-1 hover:text-white transition-colors", sort.key === key ? "text-white" : "")}>
      {label}
      {sort.key === key ? (sort.dir === -1 ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
    </button>
  );
  const pct = (v: number | null, start: boolean) => !isNum(v) ? <span className="text-white/30">-</span> : (
    <span className={v >= 0 ? "text-emerald-300" : "text-rose-300"}><Count value={v} prefix={v >= 0 ? "+" : ""} suffix="%" start={start} /></span>
  );

  return (
    <div ref={ref} className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {fr ? "Cours en direct" : "Live quotes"} {stamp && `· ${stamp}`}
        </span>
        <span className="text-xs text-white/40">{fr ? "Cliquez sur une colonne pour trier" : "Click a column to sort"}</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-8 pb-8 space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[15px]">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-white/45 border-y border-white/10">
                <th className="text-left font-medium py-3 pl-6 md:pl-8">{fr ? "Société" : "Company"}</th>
                <th className="text-right font-medium">{fr ? "Cours" : "Price"}</th>
                <th className="text-right font-medium pl-4">{head("day", fr ? "Jour" : "Day")}</th>
                <th className="text-right font-medium">{head("y1", fr ? "1 an" : "1Y")}</th>
                <th className="text-right font-medium">{head("y5", fr ? "5 ans / an" : "5Y / yr")}</th>
                <th className="font-medium px-4 text-center">{fr ? "Fourchette 52 semaines" : "52-week range"}</th>
                <th className="text-right font-medium pr-6 md:pr-8">{head("cap", fr ? "Capitalisation" : "Market cap")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const pos = isNum(r.lo) && isNum(r.hi) && r.hi > r.lo ? Math.min(1, Math.max(0, (r.price - r.lo) / (r.hi - r.lo))) : null;
                return (
                  <motion.tr
                    key={r.s}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ layout: { type: "spring", stiffness: 260, damping: 28 }, duration: 0.5, delay: i * 0.06 }}
                    className="border-b border-white/5 hover:bg-white/[0.05] transition-colors"
                  >
                    <td className="py-3.5 pl-6 md:pl-8">
                      <span className="flex items-center gap-3">
                        <span className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 text-[11px] font-bold text-[#15124A]">
                          {r.n.charAt(0)}
                          <img src={`https://www.google.com/s2/favicons?domain=${r.d}&sz=64`} alt="" className="absolute inset-0 m-auto w-6 h-6 bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        </span>
                        <span><span className="block font-semibold text-white leading-tight">{r.n}</span><span className="text-xs text-white/40 font-mono">{r.s}</span></span>
                      </span>
                    </td>
                    <td className="text-right font-mono text-white tabular-nums"><Count value={r.price} start={inView} /> <span className="text-xs text-white/40">{r.ccy}</span></td>
                    <td className="text-right pl-4">
                      <span className="inline-flex items-center gap-2 justify-end font-mono tabular-nums">
                        <span className="hidden lg:block w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.span className={cn("block h-full rounded-full", r.day >= 0 ? "bg-emerald-400" : "bg-rose-400")} initial={{ width: 0 }} animate={inView ? { width: `${(Math.abs(r.day) / maxDay) * 100}%` } : {}} transition={{ duration: 0.9, delay: 0.3 + i * 0.06 }} />
                        </span>
                        {pct(r.day, inView)}
                      </span>
                    </td>
                    <td className="text-right font-mono tabular-nums">{pct(r.y1, inView)}</td>
                    <td className="text-right font-mono tabular-nums">{pct(r.y5, inView)}</td>
                    <td className="px-4">
                      {pos === null ? <span className="block text-center text-white/30">-</span> : (
                        <span className="relative block h-1.5 w-full min-w-[110px] rounded-full bg-gradient-to-r from-rose-400/40 via-white/15 to-emerald-400/40">
                          <motion.span className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" initial={{ left: "0%" }} animate={inView ? { left: `${pos * 100}%` } : {}} transition={{ duration: 1.1, delay: 0.4 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} />
                        </span>
                      )}
                    </td>
                    <td className="text-right font-mono text-white/80 pr-6 md:pr-8">{cap(r.cap)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="px-6 md:px-8 py-4 text-xs text-white/35">{fr ? "Source : Yahoo Finance, cours différés d'environ 15 minutes. Rendements 1 an et 5 ans dividendes réinvestis." : "Source: Yahoo Finance, quotes delayed by about 15 minutes. 1Y and 5Y returns include reinvested dividends."}</p>
    </div>
  );
}
