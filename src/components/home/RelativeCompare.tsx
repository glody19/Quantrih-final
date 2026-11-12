import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

const SERIES = [
  { s: "NVDA", n: "Nvidia", c: "#5B4BDB" },
  { s: "AAPL", n: "Apple", c: "#18B8A0" },
  { s: "MSFT", n: "Microsoft", c: "#E0B341" },
  { s: "GOOGL", n: "Alphabet", c: "#F08A5D" },
  { s: "AMZN", n: "Amazon", c: "#4C8DFF" },
  { s: "TSLA", n: "Tesla", c: "#C2587C" },
  { s: "SPY", n: "S&P 500", c: "#94A3B8" },
];
const PERIODS = [
  { k: "6mo", l: "6M", i: "1d" },
  { k: "1y", l: "1Y", i: "1d" },
  { k: "5y", l: "5Y", i: "1wk" },
] as const;

type Pt = { t: number; v: number };
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
            return [x.s, pts.map((d) => ({ t: d.t, v: (d.c / base - 1) * 100 }))] as const;
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

  return (
    <div ref={ref} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_70px_-45px_rgba(23,20,74,0.45)] p-5 md:p-8">
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

      <div className="grid lg:grid-cols-[1fr_250px] gap-6 items-stretch">
        <div className="relative">
          {!geo ? (
            <div className="aspect-[1000/380] rounded-2xl bg-slate-50 animate-pulse" />
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto overflow-visible"
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * W; setHover(x >= PAD.l && x <= W - PAD.r ? x : null); }}
              onMouseLeave={() => setHover(null)}
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
                  <text x={Math.min(hover! + 8, W - PAD.r - 90)} y={H - 6} fontSize="12" fill="#64748B">{new Date(hoverT).toLocaleDateString(fr ? "fr-BE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* ranking: returns over the period, or at the hovered date */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">{hoverT !== null ? (fr ? "À cette date" : "At this date") : (fr ? "Sur la période" : "Over the period")}</p>
          <ul className="grid gap-1.5">
            {ranking.map((x, i) => {
              const v = hoverT !== null ? valueAt(data[x.s], hoverT) : x.last;
              return (
                <motion.li key={x.s} layout initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.6 + i * 0.1 }} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
                  <span className="flex items-center gap-2.5 text-[15px] text-slate-700"><span className="w-1.5 h-5 rounded-full" style={{ background: x.c }} />{x.n}</span>
                  <b className={cn("font-mono tabular-nums text-[15px]", v >= 0 ? "text-emerald-600" : "text-[#9F1239]")}>{v >= 0 ? "+" : ""}{v.toFixed(1)}%</b>
                </motion.li>
              );
            })}
          </ul>
          <button onClick={onOpen} className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5B4BDB] hover:gap-3 transition-all">
            {fr ? "Comparer d'autres titres dans Marchés" : "Compare other assets in Markets"} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
