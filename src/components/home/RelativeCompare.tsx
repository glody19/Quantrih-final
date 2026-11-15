import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

const SERIES = [
  { s: "NVDA", n: "Nvidia", c: "#5B4BDB", d: "nvidia.com" },
  { s: "AAPL", n: "Apple", c: "#18B8A0", d: "apple.com" },
  { s: "MSFT", n: "Microsoft", c: "#E0B341", d: "microsoft.com" },
  { s: "GOOGL", n: "Alphabet", c: "#F08A5D", d: "abc.xyz" },
  { s: "AMZN", n: "Amazon", c: "#4C8DFF", d: "amazon.com" },
  { s: "TSLA", n: "Tesla", c: "#C2587C", d: "tesla.com" },
  { s: "SPY", n: "S&P 500", c: "#94A3B8", d: "ssga.com" },
];

type Quote = { price: number; ccy: string; day: number | null; cap: number | null; vol: number | null; avgVol: number | null; lo: number | null; hi: number | null; div: number | null; pe: number | null; ipo: number | null; exch: string | null };
const num = (v: any) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const big = (v: number | null) => v == null ? "-" : v >= 1e12 ? `${(v / 1e12).toFixed(2)} T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)} B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : v.toLocaleString("en-US");
const ipoMs = (v: any) => { if (v == null) return null; const t = typeof v === "number" ? v : new Date(v).getTime(); return Number.isFinite(t) ? t : null; };
const PERIODS = [
  { k: "6mo", l: "6M", i: "1d" },
  { k: "1y", l: "1Y", i: "1d" },
  { k: "5y", l: "5Y", i: "1wk" },
] as const;

type Pt = { t: number; v: number; c: number }; // time, % since start, close price
const W = 1000, H = 380, PAD = { l: 8, r: 92, t: 18, b: 26 };

/**
 * Home page version of the Market "relative performance" chart: every line starts at 0% and
 * draws itself in, the end of each line carries its return, hovering shows a crosshair.
 * Data: daily or weekly closes from /api/stock/history (Yahoo Finance). Hidden if unavailable.
 */
export function RelativeCompare({ fr, onOpen }: { fr: boolean; onOpen: () => void }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[1]);
  const [data, setData] = useState<Record<string, Pt[]>>({});
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  useEffect(() => {
    let alive = true;
    Promise.all(
      SERIES.map((x) =>
        fetch(`/api/stock/history/${encodeURIComponent(x.s)}?range=${period.k}&interval=${period.i}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((arr: any[]) => {
            const pts = (Array.isArray(arr) ? arr : [])
              .map((d) => ({ t: new Date(d.date).getTime(), c: Number(d.close) }))
              .filter((d) => Number.isFinite(d.t) && Number.isFinite(d.c) && d.c > 0)
              .sort((a, b) => a.t - b.t);
            if (pts.length < 2) return [x.s, []] as const;
            const base = pts[0].c;
            return [x.s, pts.map((d) => ({ t: d.t, v: (d.c / base - 1) * 100, c: d.c }))] as const;
          })
          .catch(() => [x.s, []] as const)
      )
    ).then((rows) => {
      if (!alive) return;
      const next: Record<string, Pt[]> = {};
      rows.forEach(([s, pts]) => { if (pts.length) next[s] = pts as Pt[]; });
      setData(next);
      setFailed(Object.keys(next).length < 2);
    });
    return () => { alive = false; };
  }, [period]);

  // live quote details for the table under the chart
  useEffect(() => {
    let alive = true;
    const load = () => fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${SERIES.map((x) => x.s).join(",")}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: any[]) => {
        if (!alive || !Array.isArray(arr)) return;
        const o: Record<string, Quote> = {};
        arr.forEach((q) => {
          const price = num(q?.regularMarketPrice);
          if (!q?.symbol || price == null) return;
          o[q.symbol] = {
            price, ccy: q.currency || "USD", day: num(q.regularMarketChangePercent), cap: num(q.marketCap), vol: num(q.regularMarketVolume), avgVol: num(q.averageDailyVolume3Month),
            lo: num(q.fiftyTwoWeekLow), hi: num(q.fiftyTwoWeekHigh), div: num(q.dividendYield), pe: num(q.trailingPE), ipo: ipoMs(q.firstTradeDateMilliseconds), exch: q.fullExchangeName || null,
          };
        });
        setQuotes(o);
      })
      .catch(() => {});
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const shown = SERIES.filter((x) => data[x.s] && !hidden.has(x.s));
  const geo = useMemo(() => {
    const all = shown.flatMap((x) => data[x.s]);
    if (!all.length) return null;
    const t0 = Math.min(...all.map((p) => p.t)), t1 = Math.max(...all.map((p) => p.t));
    let lo = Math.min(0, ...all.map((p) => p.v)), hi = Math.max(0, ...all.map((p) => p.v));
    const padV = (hi - lo) * 0.08 || 5; lo -= padV; hi += padV;
    const X = (t: number) => PAD.l + ((t - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
    const Y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    const step = (hi - lo) > 300 ? 100 : (hi - lo) > 120 ? 50 : (hi - lo) > 50 ? 20 : 10;
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
    return { t0, t1, X, Y, ticks };
  }, [shown.map((x) => x.s).join(), data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return null;

  const valueAt = (pts: Pt[], t: number) => {
    let best = pts[0];
    for (const p of pts) { if (p.t <= t) best = p; else break; }
    return best.v;
  };
  const ranking = shown.map((x) => ({ ...x, last: data[x.s][data[x.s].length - 1].v })).sort((a, b) => b.last - a.last);
  const hoverT = geo && hover !== null ? geo.t0 + ((hover - PAD.l) / (W - PAD.l - PAD.r)) * (geo.t1 - geo.t0) : null;
  const hoverLabel = hoverT !== null ? new Date(hoverT).toLocaleDateString(fr ? "fr-BE" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  // Figures shown in the table: today's quote, or the close at the date under the cursor
  const figures = (sym: string, q: Quote) => {
    const pts = data[sym];
    const lastPer = pts?.[pts.length - 1]?.v ?? null;
    if (hoverT === null || !pts?.length) return { price: q.price, day: q.day, per: lastPer };
    let i = 0;
    for (let k = 0; k < pts.length; k++) { if (pts[k].t <= hoverT) i = k; else break; }
    const prev = pts[i - 1];
    return { price: pts[i].c, day: prev ? (pts[i].c / prev.c - 1) * 100 : null, per: pts[i].v };
  };
  // pointer or finger on the chart moves the cursor
  const track = (clientX: number, el: Element) => { const r = el.getBoundingClientRect(); const x = ((clientX - r.left) / r.width) * W; setHover(x >= PAD.l && x <= W - PAD.r ? x : null); };

  return (
    <div ref={ref} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_70px_-45px_rgba(23,20,74,0.45)] p-3.5 sm:p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap gap-2">
          {SERIES.filter((x) => data[x.s]).map((x) => {
            const off = hidden.has(x.s);
            return (
              <button
                key={x.s}
                onClick={() => setHidden((h) => { const n = new Set(h); n.has(x.s) ? n.delete(x.s) : n.add(x.s); return n; })}
                className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border transition-all", off ? "border-slate-200 text-slate-400" : "border-transparent text-slate-800 shadow-sm")}
                style={off ? undefined : { background: `${x.c}14` }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: off ? "#CBD5E1" : x.c }} />
                {x.n}
              </button>
            );
          })}
        </div>
        <div className="inline-flex p-1 rounded-full bg-slate-100">
          {PERIODS.map((p) => (
            <button key={p.k} onClick={() => setPeriod(p)} className={cn("relative px-4 h-8 rounded-full text-sm font-semibold", period.k === p.k ? "text-white" : "text-slate-500 hover:text-slate-800")}>
              {period.k === p.k && <motion.span layoutId="rcPeriod" className="absolute inset-0 rounded-full bg-[#15124A]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{p.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="relative">
          {!geo ? (
            <div className="aspect-[1000/380] rounded-2xl bg-slate-50 animate-pulse" />
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto overflow-visible"
              onMouseMove={(e) => track(e.clientX, e.currentTarget)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={(e) => track(e.touches[0].clientX, e.currentTarget)}
              onTouchMove={(e) => track(e.touches[0].clientX, e.currentTarget)}
              onTouchEnd={() => setTimeout(() => setHover(null), 1500)}
              style={{ touchAction: "pan-y" }}
            >
              {geo.ticks.map((v) => (
                <g key={v}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={geo.Y(v)} y2={geo.Y(v)} stroke={v === 0 ? "#94A3B8" : "#EEF0F4"} strokeDasharray={v === 0 ? "4 4" : undefined} />
                  <text x={W - PAD.r + 8} y={geo.Y(v) + 4} fontSize="12" fill="#94A3B8">{v > 0 ? "+" : ""}{v}%</text>
                </g>
              ))}
              <AnimatePresence>
                {shown.map((x, i) => {
                  const pts = data[x.s];
                  const d = "M" + pts.map((p) => `${geo.X(p.t).toFixed(1)},${geo.Y(p.v).toFixed(1)}`).join(" L");
                  const last = pts[pts.length - 1];
                  const lead = ranking[0]?.s === x.s;
                  return (
                    <g key={x.s + period.k}>
                      {lead && (
                        <motion.path
                          d={`${d} L${geo.X(last.t)},${geo.Y(0)} L${geo.X(pts[0].t)},${geo.Y(0)} Z`}
                          fill={x.c} initial={{ opacity: 0 }} animate={inView ? { opacity: 0.08 } : {}} transition={{ duration: 1, delay: 2.2 }}
                        />
                      )}
                      <motion.path
                        d={d} fill="none" stroke={x.c} strokeWidth={lead ? 3 : 2} strokeLinejoin="round" strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={inView ? { pathLength: 1, opacity: hover !== null ? 0.9 : 1 } : {}}
                        exit={{ opacity: 0 }}
                        transition={{ pathLength: { duration: 2.2, delay: i * 0.18, ease: [0.45, 0, 0.2, 1] }, opacity: { duration: 0.3 } }}
                      />
                      <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 2.2 + i * 0.18, type: "spring", stiffness: 260, damping: 16 }} style={{ transformOrigin: `${geo.X(last.t)}px ${geo.Y(last.v)}px` }}>
                        <circle cx={geo.X(last.t)} cy={geo.Y(last.v)} r="5" fill="#fff" stroke={x.c} strokeWidth="2.5" />
                      </motion.g>
                    </g>
                  );
                })}
              </AnimatePresence>
              {hoverT !== null && (
                <g>
                  <line x1={hover!} x2={hover!} y1={PAD.t} y2={H - PAD.b} stroke="#15124A" strokeOpacity="0.25" />
                  {shown.map((x) => {
                    const v = valueAt(data[x.s], hoverT);
                    return <circle key={x.s} cx={hover!} cy={geo.Y(v)} r="4" fill={x.c} stroke="#fff" strokeWidth="1.5" />;
                  })}
                  <text x={Math.min(hover! + 8, W - PAD.r - 90)} y={H - 6} fontSize="12" fill="#64748B">{hoverLabel}</text>
                </g>
              )}
            </svg>
          )}
        </div>

      </div>

      {/* details under the chart, linked to the cursor: prices and changes follow the hovered date */}
      {Object.keys(quotes).length > 0 && (
        <>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <span className={cn("font-semibold uppercase tracking-[0.14em]", hoverLabel ? "text-[#5B4BDB]" : "text-slate-500")}>{hoverLabel ? `${fr ? "Au" : "On"} ${hoverLabel}` : (fr ? "Aujourd'hui" : "Today")}</span>
          <span className="text-slate-400 hidden sm:inline">{fr ? "Passez la souris sur le graphique pour voir les prix à une date" : "Move over the chart to see prices on any date"}</span>
        </div>
        {/* phones: one card per asset */}
        <div className="sm:hidden mt-3 grid gap-2.5">
          {SERIES.filter((x) => quotes[x.s]).map((x) => {
            const q = quotes[x.s];
            const f = figures(x.s, q);
            const per = f.per;
            const cell = (k: string, v: React.ReactNode) => <span className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400">{k}</span><span className="font-mono tabular-nums text-[12px] text-slate-800">{v}</span></span>;
            return (
              <div key={x.s} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="relative w-7 h-7 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center text-[11px] font-bold overflow-hidden" style={{ color: x.c }}>
                      {x.n.charAt(0)}
                      <img src={`/api/logo?domain=${x.d}&sz=64`} alt="" className="absolute inset-0 m-auto w-4 h-4 bg-white" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    </span>
                    <span className="leading-tight"><b className="block text-[13px] text-slate-900">{x.n}</b><span className="text-[11px] font-mono text-slate-500">{x.s}</span></span>
                  </span>
                  <span className="text-right leading-tight">
                    <b className="block font-mono text-[13px] text-slate-900">{f.price.toFixed(2)} <span className="text-[10px] text-slate-400">{q.ccy}</span></b>
                    <span className={cn("font-mono text-[11px]", f.day == null ? "text-slate-400" : f.day >= 0 ? "text-emerald-600" : "text-[#9F1239]")}>{f.day == null ? "-" : `${f.day >= 0 ? "+" : ""}${f.day.toFixed(2)}%`}</span>
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-4 gap-2">
                  {cell(period.l, <span className={per == null ? "" : per >= 0 ? "text-emerald-600" : "text-[#9F1239]"}>{per == null ? "-" : `${per >= 0 ? "+" : ""}${per.toFixed(1)}%`}</span>)}
                  {cell(fr ? "Capi." : "Cap", big(q.cap))}
                  {cell("Vol.", big(q.vol))}
                  {cell(fr ? "Depuis" : "Since", q.ipo == null ? "-" : new Date(q.ipo).getFullYear())}
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden sm:block mt-3 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[980px] text-[14px]">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="text-left font-semibold px-4 py-3">{fr ? "Actif" : "Asset"}</th>
                <th className="text-right font-semibold px-3">{fr ? "Prix" : "Price"}</th>
                <th className="text-right font-semibold px-3">{fr ? "Jour" : "Day"}</th>
                <th className="text-right font-semibold px-3">{period.l}</th>
                <th className="text-right font-semibold px-3">{fr ? "Capitalisation" : "Market cap"}</th>
                <th className="text-right font-semibold px-3">Volume</th>
                <th className="text-center font-semibold px-3">{fr ? "Fourchette 52 sem." : "52-week range"}</th>
                <th className="text-right font-semibold px-3">{fr ? "Div." : "Div."}</th>
                <th className="text-right font-semibold px-4">{fr ? "Cotée depuis" : "Listed since"}</th>
              </tr>
            </thead>
            <tbody>
              {SERIES.filter((x) => quotes[x.s]).map((x, i) => {
                const q = quotes[x.s];
                const f = figures(x.s, q);
                const per = f.per;
                const pos = q.lo != null && q.hi != null && q.hi > q.lo ? Math.min(1, Math.max(0, (f.price - q.lo) / (q.hi - q.lo))) : null;
                return (
                  <motion.tr key={x.s} initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.07, duration: 0.5 }} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span className="relative w-8 h-8 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center text-xs font-bold overflow-hidden" style={{ color: x.c }}>
                          {x.n.charAt(0)}
                          <img src={`/api/logo?domain=${x.d}&sz=64`} alt="" className="absolute inset-0 m-auto w-5 h-5 bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        </span>
                        <span><b className="block font-semibold text-slate-900">{x.n}</b><span className="text-xs text-slate-500 font-mono">{x.s}{q.exch ? ` · ${q.exch}` : ""}</span></span>
                      </span>
                    </td>
                    <td className={cn("text-right px-3 font-mono tabular-nums font-semibold text-slate-900 transition-colors", hoverLabel && "bg-[#5B4BDB]/[0.05]")}>{f.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[11px] text-slate-400">{q.ccy}</span></td>
                    <td className={cn("text-right px-3 font-mono tabular-nums transition-colors", hoverLabel && "bg-[#5B4BDB]/[0.05]", f.day == null ? "text-slate-400" : f.day >= 0 ? "text-emerald-600" : "text-[#9F1239]")}>{f.day == null ? "-" : `${f.day >= 0 ? "+" : ""}${f.day.toFixed(2)}%`}</td>
                    <td className={cn("text-right px-3 font-mono tabular-nums font-semibold transition-colors", hoverLabel && "bg-[#5B4BDB]/[0.05]", per == null ? "text-slate-400" : per >= 0 ? "text-emerald-600" : "text-[#9F1239]")}>{per == null ? "-" : `${per >= 0 ? "+" : ""}${per.toFixed(1)}%`}</td>
                    <td className="text-right px-3 font-mono tabular-nums text-slate-700">{big(q.cap)}</td>
                    <td className="text-right px-3 font-mono tabular-nums text-slate-700" title={q.avgVol ? `${fr ? "Moyenne 3 mois" : "3-month average"}: ${big(q.avgVol)}` : undefined}>{big(q.vol)}</td>
                    <td className="px-3">
                      {pos == null ? <span className="block text-center text-slate-400">-</span> : (
                        <span className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                          {q.lo!.toFixed(0)}
                          <span className="relative flex-1 h-1.5 rounded-full bg-slate-100 min-w-[70px]">
                            <motion.span className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full ring-2 ring-white shadow" style={{ background: x.c }} initial={{ left: "0%" }} animate={inView ? { left: `${pos * 100}%` } : {}} transition={hoverLabel ? { duration: 0.15 } : { duration: 1.4, delay: 0.8 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} />
                          </span>
                          {q.hi!.toFixed(0)}
                        </span>
                      )}
                    </td>
                    <td className="text-right px-3 font-mono tabular-nums text-slate-700">{q.div == null ? "-" : `${q.div.toFixed(2)}%`}</td>
                    <td className="text-right px-4 font-mono tabular-nums text-slate-700">{q.ipo == null ? "-" : new Date(q.ipo).toLocaleDateString(fr ? "fr-BE" : "en-GB", { year: "numeric", month: "short" })}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
      <button onClick={onOpen} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5B4BDB] hover:gap-3 transition-all">
        {fr ? "Comparer d'autres titres dans Marchés" : "Compare other assets in Markets"} <ArrowRight size={15} />
      </button>
    </div>
  );
}
