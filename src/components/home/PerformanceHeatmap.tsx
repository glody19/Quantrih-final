import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, animate } from "motion/react";
import { cn } from "../../lib/utils";

export interface HeatRow {
  label: string;
  symbol: string;
}

type Perf = { y1: number | null; y3: number | null; y5: number | null; asOf: string } | null;

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

/** Cell colour: teal for gains, pink for losses, grey near zero; intensity scales with magnitude. */
function cellStyle(v: number | null, maxAbs: number): React.CSSProperties {
  if (!isNum(v)) return { background: "#F1F3F5", color: "#94A3B8" };
  if (Math.abs(v) < 0.5) return { background: "#EEF0F2", color: "#1E293B" };
  const k = Math.min(1, Math.abs(v) / (maxAbs || 1));
  if (v > 0) return { background: `rgba(45, 212, 170, ${0.12 + 0.68 * k})`, color: "#0F172A" };
  return { background: `rgba(251, 113, 133, ${0.18 + 0.62 * k})`, color: "#0F172A" };
}

function CountUp({ value, inView, delay }: { value: number | null; inView: boolean; delay: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || !isNum(value)) return;
    const c = animate(0, value, { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(v) });
    return () => c.stop();
  }, [inView, value, delay]);
  if (!isNum(value)) return <>—</>;
  return <>{shown.toFixed(2)}%</>;
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
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.45)] transition-shadow"
    >
      <h3 className="text-2xl font-normal tracking-tight text-text mb-5">{title}</h3>
      {data.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-[15px] border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-sm text-text-3">
                <th className="text-left font-medium pl-3 pb-2">{firstCol}</th>
                {["1Y", "3Y", "5Y"].map((h) => (
                  <th key={h} className="font-medium pb-2 w-[22%] text-center border-l border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <motion.tr
                  key={d.symbol}
                  initial={{ opacity: 0, x: -24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.05 * i, ease: "easeOut" }}
                  className="group"
                  title={d.symbol}
                >
                  <td className="pl-3 pr-2 py-1 text-text font-medium whitespace-nowrap group-hover:text-pv-blue transition-colors">{d.label}</td>
                  {(["y1", "y3", "y5"] as const).map((k) => {
                    const v = (d.p as any)[k] as number | null;
                    return (
                      <td key={k} className="px-2 sm:px-4 border-l border-border">
                        <div
                          className={cn("mx-auto max-w-[96px] rounded-md py-2 text-center tabular-nums transition-transform duration-200 group-hover:scale-[1.06]")}
                          style={cellStyle(v, maxAbs[k])}
                        >
                          <CountUp value={v} inView={inView} delay={0.05 * i} />
                        </div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-text-3 mt-4">
        {note}
        {asOf ? ` · ${asOf}` : ""}
      </p>
    </motion.div>
  );
}
