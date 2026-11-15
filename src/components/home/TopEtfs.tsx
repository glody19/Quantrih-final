import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { cn } from "../../lib/utils";

// Liquid US-listed ETFs across markets, sectors, themes and commodities. The table keeps the 7 best.
const UNIVERSE: { s: string; n: string; tag: { en: string; fr: string } }[] = [
  { s: "SPY", n: "SPDR S&P 500", tag: { en: "US large caps", fr: "Grandes caps US" } },
  { s: "QQQ", n: "Invesco QQQ (Nasdaq 100)", tag: { en: "US tech", fr: "Tech US" } },
  { s: "IWM", n: "iShares Russell 2000", tag: { en: "US small caps", fr: "Petites caps US" } },
  { s: "VEA", n: "Vanguard FTSE Developed", tag: { en: "Developed ex-US", fr: "Développés hors US" } },
  { s: "VWO", n: "Vanguard FTSE Emerging", tag: { en: "Emerging", fr: "Émergents" } },
  { s: "VGK", n: "Vanguard FTSE Europe", tag: { en: "Europe", fr: "Europe" } },
  { s: "EWJ", n: "iShares MSCI Japan", tag: { en: "Japan", fr: "Japon" } },
  { s: "INDA", n: "iShares MSCI India", tag: { en: "India", fr: "Inde" } },
  { s: "MCHI", n: "iShares MSCI China", tag: { en: "China", fr: "Chine" } },
  { s: "EWZ", n: "iShares MSCI Brazil", tag: { en: "Brazil", fr: "Brésil" } },
  { s: "SMH", n: "VanEck Semiconductor", tag: { en: "Semiconductors", fr: "Semi-conducteurs" } },
  { s: "XLK", n: "Technology Select SPDR", tag: { en: "Technology", fr: "Technologie" } },
  { s: "XLF", n: "Financial Select SPDR", tag: { en: "Financials", fr: "Finance" } },
  { s: "XLE", n: "Energy Select SPDR", tag: { en: "Energy", fr: "Énergie" } },
  { s: "XLV", n: "Health Care Select SPDR", tag: { en: "Health care", fr: "Santé" } },
  { s: "XLI", n: "Industrial Select SPDR", tag: { en: "Industrials", fr: "Industrie" } },
  { s: "XLU", n: "Utilities Select SPDR", tag: { en: "Utilities", fr: "Services publics" } },
  { s: "ITA", n: "iShares US Aerospace & Defense", tag: { en: "Defence", fr: "Défense" } },
  { s: "ARKK", n: "ARK Innovation", tag: { en: "Innovation", fr: "Innovation" } },
  { s: "ICLN", n: "iShares Global Clean Energy", tag: { en: "Clean energy", fr: "Énergie propre" } },
  { s: "URA", n: "Global X Uranium", tag: { en: "Uranium", fr: "Uranium" } },
  { s: "COPX", n: "Global X Copper Miners", tag: { en: "Copper miners", fr: "Mines de cuivre" } },
  { s: "GDX", n: "VanEck Gold Miners", tag: { en: "Gold miners", fr: "Mines d'or" } },
  { s: "GLD", n: "SPDR Gold Shares", tag: { en: "Gold", fr: "Or" } },
  { s: "SLV", n: "iShares Silver Trust", tag: { en: "Silver", fr: "Argent" } },
  { s: "VNQ", n: "Vanguard Real Estate", tag: { en: "Real estate", fr: "Immobilier" } },
  { s: "TLT", n: "iShares 20+ Year Treasury", tag: { en: "Long bonds", fr: "Obligations longues" } },
  { s: "IBIT", n: "iShares Bitcoin Trust", tag: { en: "Bitcoin", fr: "Bitcoin" } },
];

const COLS = [["m6", "6M", "6 mois"], ["y1", "1Y", "1 an"], ["y3", "3Y", "3 ans"], ["y5", "5Y", "5 ans"]] as const;
type Key = (typeof COLS)[number][0];
type Perf = Partial<Record<Key, number | null>> & { asOf?: string };
const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const FROM = [{ x: -40, y: 0 }, { x: 0, y: -26 }, { x: 40, y: 0 }, { x: 0, y: 26 }];

function Count({ value, start, delay }: { value: number; start: boolean; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const c = animate(0, value, { duration: 2.4, delay, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [value, start, delay]);
  return <>{v > 0 ? "+" : ""}{v.toFixed(1)}%</>;
}

/**
 * The seven best performing ETFs among ~30 liquid US-listed funds, ranked on the chosen period.
 * Total return (dividends reinvested), 3Y and 5Y annualised. Real data from /api/stock/performance.
 */
export function TopEtfs({ fr }: { fr: boolean }) {
  const [perf, setPerf] = useState<Record<string, Perf | null>>({});
  const [sort, setSort] = useState<Key>("y1");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    let alive = true;
    fetch(`/api/stock/performance?symbols=${UNIVERSE.map((x) => x.s).join(",")}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: any) => { if (alive && d && typeof d === "object") setPerf(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const rows = useMemo(
    () => UNIVERSE.filter((x) => isNum(perf[x.s]?.[sort])).sort((a, b) => (perf[b.s]![sort] as number) - (perf[a.s]![sort] as number)).slice(0, 7),
    [perf, sort]
  );
  const maxAbs = useMemo(() => {
    const m: Record<string, number> = {};
    COLS.forEach(([k]) => { m[k] = Math.max(1, ...rows.map((r) => Math.abs((perf[r.s]?.[k] as number) ?? 0))); });
    return m;
  }, [rows, perf]);
  const asOf = Object.values(perf).find((p) => p?.asOf)?.asOf;
  const loading = Object.keys(perf).length === 0;

  return (
    <div ref={ref} className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(6,18,27,0.45)] p-3 sm:p-5 md:p-7">
      <div className="sm:overflow-x-auto">
        <table className="w-full w-full sm:min-w-[640px] text-[13px] sm:text-[15px] border-separate border-spacing-y-[3px]">
          <thead>
            <tr className="text-[13px] text-slate-500">
              <th className="hidden sm:table-cell text-left font-medium pl-2 pb-2 w-10">#</th>
              <th className="text-left font-medium pb-2">ETF</th>
              {COLS.map(([k, en, frl]) => (
                <th key={k} className="pb-2 w-[16%] sm:w-[15%] text-center">
                  <button onClick={() => setSort(k)} className={cn("px-1.5 sm:px-2 py-0.5 rounded-full font-semibold transition-colors text-[11px] sm:text-[13px]", sort === k ? "bg-[#0C2233] text-white" : "hover:text-slate-800")}>{fr ? frl : en}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-11 rounded-lg bg-slate-50 animate-pulse" /></td></tr>)
              : rows.map((r, i) => (
                  <motion.tr key={r.s + sort} layout initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <td className="hidden sm:table-cell pl-2"><span className={cn("inline-flex w-7 h-7 rounded-full items-center justify-center text-[13px] font-bold", i === 0 ? "bg-[#E0B341] text-white" : i < 3 ? "bg-[#1B3F72]/10 text-[#1B3F72]" : "bg-slate-100 text-slate-500")}>{i + 1}</span></td>
                    <td className="py-1.5 pr-1 sm:pr-3 leading-tight">
                      <b className="font-mono sm:font-sans font-semibold text-slate-900"><span className="sm:hidden">{i + 1}. </span><span className="hidden sm:inline">{r.n}</span><span className="sm:hidden">{r.s}</span></b>
                      <span className="hidden sm:inline ml-2 font-mono text-xs text-slate-500">{r.s}</span>
                      <span className="block text-[11px] sm:text-xs text-[#1B3F72]">{fr ? r.tag.fr : r.tag.en}</span>
                    </td>
                    {COLS.map(([k], col) => {
                      const v = perf[r.s]?.[k];
                      const delay = col * 0.75 + i * 0.07;
                      return (
                        <td key={k} className="px-0.5 sm:px-1.5">
                          <div className={cn("relative mx-auto max-w-[118px] h-8 sm:h-9 rounded-md overflow-hidden", sort === k ? "bg-[#1B3F72]/[0.06]" : "bg-slate-50")}>
                            {isNum(v) && (
                              <motion.span
                                className="absolute inset-y-0 rounded-md"
                                style={{ [v >= 0 ? "left" : "right"]: 0, background: v >= 0 ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0.32))" : "linear-gradient(270deg, rgba(159,18,57,0.08), rgba(159,18,57,0.26))" } as React.CSSProperties}
                                initial={{ width: 0 }} animate={inView ? { width: `${Math.max(6, Math.min(1, Math.abs(v) / maxAbs[k]) * 100)}%` } : {}}
                                transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
                              />
                            )}
                            <motion.span
                              className={cn("relative z-10 flex h-full items-center justify-center font-mono tabular-nums text-[13px] sm:text-[14px] font-bold", !isNum(v) ? "text-slate-300" : v >= 0 ? "text-emerald-700" : "text-[#9F1239]")}
                              initial={{ opacity: 0, scale: 0.3, ...FROM[(i + col) % 4] }}
                              animate={inView ? { opacity: [0, 1, 1, 0.35, 1], scale: [0.3, 1.25, 1, 1, 1], x: 0, y: 0 } : {}}
                              transition={{ duration: 2.6, delay, times: [0, 0.3, 0.45, 0.8, 1], ease: "easeOut" }}
                            >
                              {isNum(v) ? <Count value={v} start={inView} delay={delay} /> : "-"}
                            </motion.span>
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-slate-500">
        {fr
          ? `Classement parmi ${UNIVERSE.length} ETF cotés aux États-Unis. Rendement total en USD, dividendes réinvestis ; 3 et 5 ans annualisés. Les performances passées ne préjugent pas des performances futures.`
          : `Ranked among ${UNIVERSE.length} US-listed ETFs. Total return in USD, dividends reinvested; 3Y and 5Y annualised. Past performance does not predict future returns.`}
        {asOf ? ` · ${asOf}` : ""}
      </p>
    </div>
  );
}
