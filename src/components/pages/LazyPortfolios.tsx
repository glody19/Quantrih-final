import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { InfoTooltip } from "../ui/InfoTooltip";
import { cn } from "../../lib/utils";
import { BUCKETS, MODEL_PORTFOLIOS, type AssetBucket, type ModelPortfolio } from "../../data/modelPortfolios";
import { useModelPerformance, type ModelStats } from "../../hooks/useModelPerformance";

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const PERIODS = [["y1", "1Y", "1 an"], ["y2", "2Y", "2 ans"], ["y3", "3Y", "3 ans"], ["y5", "5Y", "5 ans"]] as const;

const T = {
  en: {
    title: "Lazy portfolios", sub: "Ten well-known allocations you can hold with a handful of ETFs. Click one to see what is inside and how it has performed.",
    updated: "Computed from market data up to", method: "Total return in USD, dividends reinvested, rebalanced monthly. 2Y, 3Y and 5Y are annualised.",
    portfolio: "Portfolio", risk: "Risk", allocation: "Allocation", vol: "Volatility", dd: "Worst fall",
    volTip: "How much the portfolio moves in a typical year. Lower is calmer.", ddTip: "The largest fall from a peak to the following low over the last five years.",
    holdings: "Holdings", ticker: "Ticker", name: "Name", category: "Category", weight: "Weight",
    assetAllocation: "Asset allocation", performance: "Performance", growth: "Growth of 100 over five years",
    backtest: "Backtest it", invest: "Buy it in the virtual portfolio", loading: "Loading market data", error: "Market data is unavailable right now. Allocations are shown without performance.",
    riskLabels: ["Very low", "Low", "Medium", "High", "Very high"],
  },
  fr: {
    title: "Lazy portfolios", sub: "Dix allocations connues, à tenir avec une poignée d'ETF. Cliquez sur l'une d'elles pour voir sa composition et sa performance.",
    updated: "Calculé à partir des données de marché jusqu'à", method: "Rendement total en USD, dividendes réinvestis, rééquilibrage mensuel. 2, 3 et 5 ans sont annualisés.",
    portfolio: "Portefeuille", risk: "Risque", allocation: "Allocation", vol: "Volatilité", dd: "Pire baisse",
    volTip: "L'ampleur des variations du portefeuille sur une année type. Plus c'est bas, plus c'est calme.", ddTip: "La plus forte baisse entre un sommet et le creux suivant sur les cinq dernières années.",
    holdings: "Composition", ticker: "Ticker", name: "Nom", category: "Catégorie", weight: "Poids",
    assetAllocation: "Répartition par classe d'actifs", performance: "Performance", growth: "Évolution de 100 sur cinq ans",
    backtest: "Le backtester", invest: "L'acheter dans le portefeuille virtuel", loading: "Chargement des données de marché", error: "Les données de marché sont indisponibles pour le moment. Les allocations s'affichent sans performance.",
    riskLabels: ["Très faible", "Faible", "Moyen", "Élevé", "Très élevé"],
  },
};

function Count({ value, start, delay = 0 }: { value: number | null; start: boolean; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start || !isNum(value)) return;
    const c = animate(0, value, { duration: 1, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [value, start, delay]);
  if (!isNum(value)) return <span className="text-text-4">-</span>;
  return <span className={v >= 0 ? "text-green" : "text-red"}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span>;
}

function buckets(p: ModelPortfolio) {
  const m = new Map<AssetBucket, number>();
  p.holdings.forEach((h) => m.set(h.bucket, (m.get(h.bucket) || 0) + h.weight));
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function AllocationBar({ p }: { p: ModelPortfolio }) {
  return (
    <span className="flex h-2.5 w-full min-w-[140px] rounded-full overflow-hidden bg-surface-3">
      {buckets(p).map(([b, w]) => <span key={b} style={{ width: `${w}%`, background: BUCKETS[b].color }} title={`${BUCKETS[b].en} ${w}%`} />)}
    </span>
  );
}

/** Animated donut drawn with SVG arcs: segments sweep in one after the other. */
function Donut({ p, lang }: { p: ModelPortfolio; lang: "en" | "fr" }) {
  const data = buckets(p);
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90 shrink-0">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#F3F4F7" strokeWidth="34" />
        {data.map(([b, w], i) => {
          const len = (w / 100) * C, off = (acc / 100) * C;
          acc += w;
          return (
            <motion.circle key={b} cx="100" cy="100" r={R} fill="none" stroke={BUCKETS[b].color} strokeWidth="34"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off}
              initial={{ opacity: 0, strokeDasharray: `0 ${C}` }} animate={{ opacity: 1, strokeDasharray: `${len} ${C - len}` }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.18, ease: "easeOut" }} />
          );
        })}
      </svg>
      <ul className="grid gap-2 text-sm w-full">
        {data.map(([b, w], i) => (
          <motion.li key={b} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.18 }} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-text-2"><span className="w-3 h-3 rounded-full" style={{ background: BUCKETS[b].color }} />{BUCKETS[b][lang]}</span>
            <b className="font-mono tabular-nums text-text">{w.toFixed(1)}%</b>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function Detail({ p, s, lang, onClose, onNavigate, showInvest = true }: { p: ModelPortfolio; s: ModelStats | null; lang: "en" | "fr"; onClose: () => void; onNavigate?: (page: string) => void; showInvest?: boolean }) {
  const t = T[lang];
  const maxAbs = Math.max(1, ...PERIODS.map(([k]) => Math.abs((s as any)?.[k] ?? 0)));
  const buy = () => {
    try { localStorage.setItem("quantrih_vp_pending_model", p.id); } catch { /* storage unavailable */ }
    onNavigate?.("virtual-portfolio");
  };
  return (
    <motion.div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-[#0B0A24]/55 backdrop-blur-sm p-3 md:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, scale: 0.94, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 my-auto"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-3 hover:bg-border flex items-center justify-center"><X size={18} /></button>
        <p className="text-sm text-text-3">{p.author}</p>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-pv-blue pr-12">{p.name}</h2>
        <p className="mt-2 text-text-2 max-w-3xl">{p.description[lang]}</p>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-text">{t.holdings}</h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-[15px]">
            <thead className="bg-surface-3/70 text-text-3 text-sm"><tr><th className="text-left font-medium px-4 py-2.5">{t.ticker}</th><th className="text-left font-medium px-4">{t.name}</th><th className="text-left font-medium px-4">{t.category}</th><th className="text-right font-medium px-4">{t.weight}</th></tr></thead>
            <tbody>
              {p.holdings.map((h, i) => (
                <motion.tr key={h.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono font-semibold text-text">{h.symbol}</td>
                  <td className="px-4 text-text-2">{h.name}</td>
                  <td className="px-4"><span className="inline-flex items-center gap-1.5 text-text-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BUCKETS[h.bucket].color }} />{BUCKETS[h.bucket][lang]}</span></td>
                  <td className="px-4 text-right font-mono tabular-nums font-semibold text-text">{h.weight.toFixed(1)}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text">{t.assetAllocation}</h3>
            <Donut p={p} lang={lang} />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text">{t.performance}</h3>
            <div className="grid gap-3">
              {PERIODS.map(([k, en, fr], i) => {
                const v = (s as any)?.[k] as number | null | undefined;
                return (
                  <div key={k} className="grid grid-cols-[64px_1fr_86px] items-center gap-3 text-sm">
                    <span className="text-text-3">{lang === "fr" ? fr : en}</span>
                    <span className="h-7 rounded-lg bg-surface-3 overflow-hidden">
                      {isNum(v) && <motion.span className="block h-full rounded-lg" style={{ background: v >= 0 ? "linear-gradient(90deg,#6D5AE6,#A99BF5)" : "linear-gradient(90deg,#F08A5D,#E5484D)" }} initial={{ width: 0 }} animate={{ width: `${Math.max(4, (Math.abs(v) / maxAbs) * 100)}%` }} transition={{ duration: 0.9, delay: 0.25 + i * 0.2, ease: [0.16, 1, 0.3, 1] }} />}
                    </span>
                    <b className="text-right font-mono tabular-nums"><Count value={v ?? null} start delay={0.25 + i * 0.2} /></b>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-border p-3"><span className="text-text-3 flex items-center">{t.vol}<InfoTooltip content={t.volTip} /></span><b className="block mt-1 text-lg font-mono text-text">{isNum(s?.vol) ? `${s!.vol!.toFixed(1)}%` : "-"}</b></div>
              <div className="rounded-2xl border border-border p-3"><span className="text-text-3 flex items-center">{t.dd}<InfoTooltip content={t.ddTip} /></span><b className="block mt-1 text-lg font-mono text-red">{isNum(s?.maxDd) ? `${s!.maxDd!.toFixed(1)}%` : "-"}</b></div>
            </div>
          </div>
        </div>

        {s && s.growth.length > 2 && (
          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-text">{t.growth}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.growth} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
                  <defs><linearGradient id="lzg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D5AE6" stopOpacity={0.35} /><stop offset="100%" stopColor="#6D5AE6" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#858899" }} axisLine={false} tickLine={false} interval={11} />
                  <YAxis tick={{ fontSize: 11, fill: "#858899" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Area type="monotone" dataKey="v" stroke="#6D5AE6" strokeWidth={2.5} fill="url(#lzg)" animationDuration={1400} name={p.name} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {showInvest && <button onClick={buy} className="inline-flex items-center gap-2 bg-pv-blue hover:bg-pv-blue-d text-white font-semibold px-6 py-3 rounded-full">{t.invest} <ArrowRight size={16} /></button>}
          <button onClick={() => onNavigate?.("portfolio-backtest")} className={showInvest ? "inline-flex items-center gap-2 border border-border hover:border-border-2 font-semibold px-6 py-3 rounded-full text-text" : "inline-flex items-center gap-2 bg-pv-blue hover:bg-pv-blue-d text-white font-semibold px-6 py-3 rounded-full"}>{t.backtest} {!showInvest && <ArrowRight size={16} />}</button>
        </div>
        <p className="mt-5 text-xs text-text-4">{t.method}</p>
      </motion.div>
    </motion.div>
  );
}

/**
 * page: full page. embedded: same table inside another page (h2 title).
 * compact: short table for the home page (5 portfolios, 1Y/3Y/5Y), detail offers the backtest only.
 */
export function LazyPortfolios({ onNavigate, variant = "page" }: { onNavigate?: (page: string) => void; variant?: "page" | "embedded" | "compact" }) {
  const compact = variant === "compact";
  const periods: readonly (typeof PERIODS)[number][] = compact ? PERIODS.filter((x) => x[0] !== "y2") : PERIODS;
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t = T[lang];
  const { stats, state } = useModelPerformance();
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof PERIODS)[number][0]>("y1");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const rows = useMemo(() => [...MODEL_PORTFOLIOS].sort((a, b) => ((stats[b.id] as any)?.[sort] ?? -999) - ((stats[a.id] as any)?.[sort] ?? -999)).slice(0, compact ? 6 : undefined), [stats, sort, compact]);
  const asOf = Object.values(stats).find((s) => s)?.asOf;
  const active = MODEL_PORTFOLIOS.find((p) => p.id === open);

  return (
    <div id="lazy-portfolios" className={variant === "page" ? "page-container pb-24 pt-6" : "w-full scroll-mt-24"}>
      <div className="max-w-3xl">
        {variant === "page" ? <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">{t.title}</h1> : <h2 className={cn("font-semibold tracking-tight text-text", compact ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl")}>{t.title}</h2>}
        <p className={cn("mt-3 text-text-2 leading-relaxed", compact ? "text-base" : "text-lg")}>{t.sub}</p>
      </div>
      <p className="mt-5 inline-flex items-center gap-2 text-sm text-text-3">
        {state === "loading" && <><RefreshCw size={14} className="animate-spin" /> {t.loading}</>}
        {state === "ready" && asOf && <><span className="w-2 h-2 rounded-full bg-green" /> {t.updated} {asOf}</>}
        {state === "error" && <><ShieldAlert size={15} className="text-gold" /> {t.error}</>}
      </p>

      <div ref={ref} className="mt-6 overflow-x-auto rounded-3xl border border-border bg-white shadow-[0_20px_50px_-35px_rgba(17,17,24,0.4)]">
        <table className={cn("w-full", compact ? "min-w-[640px] text-sm" : "min-w-[920px] text-[15px]")}>
          <thead>
            <tr className="text-sm text-text-3 border-b border-border">
              <th className="text-left font-medium px-6 py-4">{t.portfolio}</th>
              <th className="text-left font-medium px-3">{t.allocation}</th>
              <th className="text-left font-medium px-3">{t.risk}</th>
              {periods.map(([k, en, fr]) => (
                <th key={k} className="text-right font-medium px-3">
                  <button onClick={() => setSort(k)} className={cn("hover:text-text", sort === k && "text-pv-blue font-semibold")}>{lang === "fr" ? fr : en}{sort === k ? " ↓" : ""}</button>
                </th>
              ))}
              <th className="px-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const s = stats[p.id];
              return (
                <motion.tr key={p.id} layout initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ layout: { type: "spring", stiffness: 260, damping: 28 }, delay: i * 0.05 }}
                  onClick={() => setOpen(p.id)} className="border-b border-border last:border-0 cursor-pointer hover:bg-surface-3/50 transition-colors">
                  <td className={compact ? "px-5 py-3" : "px-6 py-4"}><span className="block font-semibold text-text">{p.name}</span><span className="text-sm text-text-3">{p.author}</span></td>
                  <td className="px-3 w-[22%]"><AllocationBar p={p} /></td>
                  <td className="px-3"><span className="flex items-center gap-1" title={t.riskLabels[p.risk - 1]}>{[1, 2, 3, 4, 5].map((k) => <span key={k} className={cn("w-1.5 h-4 rounded-sm", k <= p.risk ? "bg-pv-blue" : "bg-surface-3")} />)}</span></td>
                  {periods.map(([k], col) => (
                    <td key={k} className="px-3 text-right font-mono tabular-nums font-semibold">
                      {state === "loading" ? <span className="inline-block w-14 h-4 rounded bg-surface-3 animate-pulse" /> : <Count value={(s as any)?.[k] ?? null} start={inView} delay={col * 0.35 + i * 0.04} />}
                    </td>
                  ))}
                  <td className="px-4 text-text-4"><ArrowRight size={16} /></td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-text-4 max-w-3xl">{t.method}</p>

      <AnimatePresence>{active && <Detail p={active} s={stats[active.id] || null} lang={lang} onClose={() => setOpen(null)} onNavigate={onNavigate} showInvest={!compact} />}</AnimatePresence>
    </div>
  );
}
