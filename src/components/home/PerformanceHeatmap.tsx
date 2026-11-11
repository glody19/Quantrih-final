import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, animate } from "motion/react";
import { cn } from "../../lib/utils";

export interface HeatRow {
  label: string;
  symbol: string;
}

type Perf = { y1: number | null; y3: number | null; y5: number | null; asOf: string } | null;

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

// Columns animate one after the other (1Y, then 3Y, then 5Y); rows ripple inside each column.
const COL_DELAY = 0.45;
const ROW_DELAY = 0.045;

/** Diverging bar behind the figure: mint for gains, coral for losses, width scales with magnitude. */
function Bar({ v, maxAbs, inView, delay }: { v: number | null; maxAbs: number; inView: boolean; delay: number }) {
  if (!isNum(v)) return null;
  const k = Math.min(1, Math.abs(v) / (maxAbs || 1));
  const gain = v >= 0;
  return (
    <motion.span
      className="absolute inset-y-0 rounded-md"
      style={{
        [gain ? "left" : "right"]: 0,
        background: gain ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0.32))" : "linear-gradient(270deg, rgba(159,18,57,0.08), rgba(159,18,57,0.26))",
        originX: gain ? 0 : 1,
      } as React.CSSProperties}
      initial={{ width: 0, opacity: 0 }}
      animate={inView ? { width: `${Math.max(6, k * 100)}%`, opacity: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

function CountUp({ value, inView, delay }: { value: number | null; inView: boolean; delay: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || !isNum(value)) return;
    const c = animate(0, value, { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(v) });
    return () => c.stop();
  }, [inView, value, delay]);
  if (!isNum(value)) return <>-</>;
  return <>{shown > 0 ? "+" : ""}{shown.toFixed(2)}%</>;
}

export function PerformanceHeatmap({ title, firstCol, rows, perf, note }: { title: string; firstCol: string; rows: HeatRow[]; perf: Record<string, Perf>; note?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const data = useMemo(
    () =>
      rows
        .map((r) => ({ ...r, p: perf[r.symbol] || null }))
        .filter((r) => r.p && (isNum(r.p.y1) || isNum(r.p.y3) || isNum(r.p.y5)))
        .sort((a, b) => (b.p?.y1 ?? -999) - (a.p?.y1 ?? -999)),
    [rows, perf]
  );
  const maxAbs = useMemo(() => {
    const m: Record<string, number> = {};
    (["y1", "y3", "y5"] as const).forEach((k) => {
      m[k] = Math.max(1, ...data.map((d) => Math.abs((d.p as any)[k] ?? 0)));
    });
    return m;
  }, [data]);

  const asOf = data.find((d) => d.p?.asOf)?.p?.asOf;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-text border border-border bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]"
    >
      <h3 className="relative text-lg font-semibold tracking-tight text-text mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 rounded-md bg-surface-3 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-text-3">
                <th className="text-left font-medium pl-3 pb-2">{firstCol}</th>
                {["1Y", "3Y", "5Y"].map((h) => (
                  <th key={h} className="font-medium pb-2 w-[22%] text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <motion.tr
                  key={d.symbol}
                  initial={{ opacity: 0, x: -24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: ROW_DELAY * i, ease: "easeOut" }}
                  className="group"
                  title={d.symbol}
                >
                  <td className="pl-2 pr-2 py-0.5 text-text-2 font-medium whitespace-nowrap group-hover:text-pv-blue transition-colors">{d.label}</td>
                  {(["y1", "y3", "y5"] as const).map((k, col) => {
                    const v = (d.p as any)[k] as number | null;
                    const delay = col * COL_DELAY + i * ROW_DELAY;
                    return (
                      <td key={k} className="px-1.5 sm:px-3">
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay, ease: "easeOut" }}
                          className="relative mx-auto max-w-[104px] h-7 rounded-md bg-slate-50 overflow-hidden"
                        >
                          <Bar v={v} maxAbs={maxAbs[k]} inView={inView} delay={delay} />
                          <span className={cn("relative z-10 flex h-full items-center justify-center tabular-nums font-mono text-[12px] font-semibold", !isNum(v) ? "text-text-4" : v >= 0 ? "text-emerald-700" : "text-[#9F1239]")}>
                            <CountUp value={v} inView={inView} delay={delay} />
                          </span>
                        </motion.div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="relative text-[11px] text-text-3 mt-3">
        {note}
        {asOf ? ` · ${asOf}` : ""}
      </p>
    </motion.div>
  );
}
