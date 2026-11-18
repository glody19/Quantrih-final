import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis, AreaChart, Area, ReferenceLine, LabelList } from "recharts";
import { Check, FileDown, FileSpreadsheet, Lock, X } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PlanLimits, PlanId } from "../../lib/plans";
import { CARD, SERIES, pct, num, isNum, downloadCsv, type PortfolioRow } from "./shared";

const L = {
  fr: {
    pick: "Choisissez les portefeuilles à comparer", pickHint: "Cochez des portefeuilles issus de vos analyses enregistrées.", max: "maximum avec votre formule",
    empty: "Enregistrez au moins une analyse avec ses résultats pour la comparer ici.", none: "Sélectionnez au moins un portefeuille.",
    growth: "Croissance de 10 000", growthLead: "Chaque portefeuille repart de 10 000 à sa date de départ, pour comparer des analyses de périodes différentes.",
    noCurve: "Courbes non enregistrées pour certaines analyses : relancez-les puis enregistrez-les.",
    metrics: "Indicateurs clés", table: "Tableau comparatif", bestHint: "Meilleure valeur de chaque ligne en gras.",
    cagr: "TCAC", vol: "Volatilité", maxdd: "Perte max.", sharpe: "Sharpe", sortino: "Sortino", best: "Meilleure année", worst: "Pire année", final: "Valeur finale", period: "Période", analysis: "Analyse",
    advanced: "Analyses avancées", advancedLead: "Rendement contre risque, pertes depuis le plus haut et rendements annuels.",
    scatter: "Rendement et risque", dd: "Pertes depuis le plus haut", annual: "Rendements annuels", year: "Année",
    proOnly: "Réservé à la formule Pro", proLead: "Carte rendement-risque, courbes de pertes et grille des rendements annuels.", see: "Voir les formules",
    pdf: "Rapport PDF", csv: "CSV", alloc: "Allocation", clear: "Tout retirer",
  },
  en: {
    pick: "Choose the portfolios to compare", pickHint: "Tick portfolios from your saved analyses.", max: "maximum on your plan",
    empty: "Save at least one analysis with its results to compare it here.", none: "Select at least one portfolio.",
    growth: "Growth of 10,000", growthLead: "Each portfolio starts at 10,000 on its own start date, so analyses over different periods can be compared.",
    noCurve: "Some analyses were saved without curves: run them again and save them.",
    metrics: "Key metrics", table: "Comparison table", bestHint: "Best value of each row in bold.",
    cagr: "CAGR", vol: "Volatility", maxdd: "Max drawdown", sharpe: "Sharpe", sortino: "Sortino", best: "Best year", worst: "Worst year", final: "Final value", period: "Period", analysis: "Analysis",
    advanced: "Advanced analysis", advancedLead: "Return against risk, drawdowns from peak and annual returns.",
    scatter: "Return and risk", dd: "Drawdown from peak", annual: "Annual returns", year: "Year",
    proOnly: "Pro plan only", proLead: "Risk-return map, drawdown curves and annual returns grid.", see: "See plans",
    pdf: "PDF report", csv: "CSV", alloc: "Allocation", clear: "Clear all",
  },
};

function H({ children, lead }: { children: React.ReactNode; lead?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-900">{children}</h3>
      <span className="block mt-2 h-[3px] w-12 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
      {lead && <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">{lead}</p>}
    </div>
  );
}

export function CompareWorkspace({
  rows, limits, plan, language, currency, preselect, onReport, onUpgrade,
}: {
  rows: PortfolioRow[];
  limits: PlanLimits;
  plan: PlanId;
  language: "fr" | "en";
  currency: string;
  preselect: string[];
  onReport: (keys: string[]) => void;
  onUpgrade: () => void;
}) {
  const l = L[language];
  const max = limits.compareMax;
  const [sel, setSel] = useState<string[]>([]);
  useEffect(() => {
    if (preselect.length) setSel(preselect.slice(0, max));
    else if (!sel.length && rows.length) setSel(rows.slice(0, Math.min(max, 3)).map((r) => r.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselect.join("|"), rows.length, max]);

  const chosen = sel.map((k) => rows.find((r) => r.key === k)).filter(Boolean) as PortfolioRow[];
  const label = (r: PortfolioRow) => (r.portfolio.name && r.portfolio.name !== r.analysis ? `${r.portfolio.name} · ${r.analysis}` : r.analysis);
  const color = (i: number) => SERIES[i % SERIES.length];
  const locale = language === "fr" ? "fr-BE" : "en-GB";
  const money = (v: any) => (isNum(v) ? new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(v) : "-");

  const toggle = (k: string) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : s.length >= max ? s : [...s, k]));

  // Growth of 10,000 on a common monthly axis
  const growth = useMemo(() => {
    const map = new Map<string, any>();
    chosen.forEach((r, i) => {
      const c = r.portfolio.curve, d = r.portfolio.curveDates;
      if (!c || !d || c.length < 2) return;
      c.forEach((v, k) => {
        const key = String(d[k]).slice(0, 7);
        if (!map.has(key)) map.set(key, { date: key });
        map.get(key)[`s${i}`] = Math.round((v / c[0]) * 10000);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [chosen]);
  const missingCurve = chosen.some((r) => !r.portfolio.curve || r.portfolio.curve.length < 2);

  const drawdowns = useMemo(() => {
    const map = new Map<string, any>();
    chosen.forEach((r, i) => {
      const c = r.portfolio.curve, d = r.portfolio.curveDates;
      if (!c || !d || c.length < 2) return;
      let peak = c[0];
      c.forEach((v, k) => {
        peak = Math.max(peak, v);
        const key = String(d[k]).slice(0, 7);
        if (!map.has(key)) map.set(key, { date: key });
        map.get(key)[`s${i}`] = Math.round((v / peak - 1) * 1000) / 10;
      });
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [chosen]);

  const years = useMemo(() => Array.from(new Set(chosen.flatMap((r) => r.portfolio.annualYears || []))).sort((a, b) => b - a), [chosen]);

  type Metric = { k: string; get: (r: PortfolioRow) => number | undefined; fmt: (v: any) => string; higher: boolean };
  const metrics: Metric[] = [
    { k: l.cagr, get: (r) => r.portfolio.cagr, fmt: (v) => pct(v), higher: true },
    { k: l.vol, get: (r) => r.portfolio.stdev, fmt: (v) => pct(v), higher: false },
    { k: l.maxdd, get: (r) => (isNum(r.portfolio.maxDrawdown) ? -Math.abs(r.portfolio.maxDrawdown) : undefined), fmt: (v) => pct(v), higher: true },
    { k: l.sharpe, get: (r) => r.portfolio.sharpe, fmt: num, higher: true },
    { k: l.sortino, get: (r) => r.portfolio.sortino, fmt: num, higher: true },
    { k: l.best, get: (r) => r.portfolio.bestYear, fmt: (v) => pct(v), higher: true },
    { k: l.worst, get: (r) => r.portfolio.worstYear, fmt: (v) => pct(v), higher: true },
    { k: l.final, get: (r) => r.portfolio.endBalance, fmt: money, higher: true },
  ];

  const exportCsv = () => {
    const out: (string | number)[][] = [[language === "fr" ? "Indicateur" : "Metric", ...chosen.map(label)]];
    out.push([l.period, ...chosen.map((r) => r.period)]);
    metrics.forEach((m) => out.push([m.k, ...chosen.map((r) => m.get(r) ?? "")]));
    years.forEach((y) => out.push([String(y), ...chosen.map((r) => { const k = (r.portfolio.annualYears || []).indexOf(y); return k >= 0 ? r.portfolio.annualReturns?.[k] ?? "" : ""; })]));
    downloadCsv(`quantrih-comparaison-${new Date().toISOString().slice(0, 10)}.csv`, out);
  };

  if (!rows.length) return <p className={cn(CARD, "px-6 py-12 text-center text-slate-500")}>{l.empty}</p>;

  // Bars use the absolute value so drawdowns grow to the right like the others
  const bar = (m: Metric) => chosen.map((r, i) => { const v = m.get(r); return { name: r.portfolio.name || r.analysis, v: isNum(v) ? Math.abs(v) : undefined, raw: v, fill: color(i) }; });
  const axis = { fontSize: 12, fill: "#64748B" };

  return (
    <div className="space-y-8">
      {/* Picker */}
      <section className={cn(CARD, "p-5 md:p-6")}>
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{l.pick}</h3>
            <p className="text-sm text-slate-500 mt-1">{l.pickHint} <b className="text-slate-700">{sel.length} / {max}</b> {l.max}.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sel.length > 0 && <button type="button" onClick={() => setSel([])} className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 inline-flex items-center gap-1.5"><X className="w-4 h-4" />{l.clear}</button>}
            <button type="button" onClick={limits.csv ? exportCsv : onUpgrade} disabled={!chosen.length} className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1B3F72] inline-flex items-center gap-1.5 disabled:opacity-40">
              {limits.csv ? <FileSpreadsheet className="w-4 h-4" /> : <Lock className="w-4 h-4" />}{l.csv}
            </button>
            <button type="button" onClick={() => onReport(sel)} disabled={!chosen.length} className="h-10 px-4 rounded-full bg-[#0A1E2D] text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#14466B] disabled:opacity-40"><FileDown className="w-4 h-4" />{l.pdf}</button>
          </div>
        </div>
        <div className="mt-4 max-h-[260px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-1">
          {rows.map((r) => {
            const on = sel.includes(r.key);
            const idx = sel.indexOf(r.key);
            const full = !on && sel.length >= max;
            return (
              <button key={r.key} type="button" onClick={() => toggle(r.key)} disabled={full}
                className={cn("text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors", on ? "border-[#1B3F72] bg-[#1B3F72]/[0.05]" : "border-slate-200 hover:border-slate-400", full && "opacity-40 cursor-not-allowed")}>
                <span className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0", on ? "border-transparent text-white" : "border-slate-300")} style={on ? { background: color(idx) } : undefined}>{on && <Check className="w-3.5 h-3.5" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-slate-800 truncate">{r.portfolio.name || r.analysis}</span>
                  <span className="block text-xs text-slate-500 truncate">{r.analysis} · {r.period}</span>
                </span>
                <span className={cn("text-sm font-mono shrink-0", isNum(r.portfolio.cagr) && r.portfolio.cagr < 0 ? "text-rose-600" : "text-emerald-700")}>{pct(r.portfolio.cagr)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {!chosen.length ? (
        <p className="text-center text-slate-500 py-8">{l.none}</p>
      ) : (
        <>
          {/* Growth */}
          <section className={cn(CARD, "p-5 md:p-7")}>
            <H lead={l.growthLead}>{l.growth}</H>
            {growth.length > 1 ? (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#EEF2F7" vertical={false} />
                    <XAxis dataKey="date" tick={axis} tickFormatter={(d) => String(d).slice(0, 4)} minTickGap={40} />
                    <YAxis tick={axis} width={64} tickFormatter={(v) => new Intl.NumberFormat(locale, { notation: "compact" }).format(v)} />
                    <Tooltip formatter={(v: any, k: any) => [new Intl.NumberFormat(locale).format(v), label(chosen[Number(String(k).slice(1))])]} labelFormatter={(d) => String(d)} contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }} />
                    {chosen.map((_, i) => <Line key={i} type="monotone" dataKey={`s${i}`} stroke={color(i)} strokeWidth={2} dot={false} connectNulls />)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            {missingCurve && <p className="mt-3 text-sm text-amber-700">{l.noCurve}</p>}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {chosen.map((r, i) => <span key={r.key} className="text-sm text-slate-600 inline-flex items-center gap-2"><span className="w-3 h-1 rounded-full" style={{ background: color(i) }} />{label(r)}</span>)}
            </div>
          </section>

          {/* Metric bars */}
          <section>
            <H>{l.metrics}</H>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[metrics[0], metrics[1], metrics[2], metrics[3]].map((m) => (
                <div key={m.k} className={cn(CARD, "p-5")}>
                  <p className="text-sm font-semibold text-slate-700 mb-2">{m.k}</p>
                  <div style={{ height: Math.max(120, chosen.length * 38) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bar(m)} layout="vertical" margin={{ top: 0, right: 76, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide domain={[(dataMin: number) => Math.min(0, dataMin), (dataMax: number) => Math.max(0, dataMax)]} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: "#334155" }} tickFormatter={(s) => (String(s).length > 18 ? String(s).slice(0, 17) + "…" : s)} />
                        <ReferenceLine x={0} stroke="#CBD5E1" />
                        <Bar dataKey="v" radius={[0, 6, 6, 0]} barSize={18}>
                          {bar(m).map((d, i) => <Cell key={i} fill={d.fill} />)}
                          <LabelList dataKey="raw" content={(p: any) => <text x={Number(p.x) + Number(p.width) + 6} y={Number(p.y) + Number(p.height) / 2 + 4} fontSize={12} fontWeight={600} fill="#0F172A">{m.fmt(p.value)}</text>} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Table */}
          <section className={cn(CARD, "overflow-hidden")}>
            <div className="px-5 md:px-7 pt-6"><H lead={l.bestHint}>{l.table}</H></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]" style={{ minWidth: 220 + chosen.length * 150 }}>
                <thead>
                  <tr className="bg-[#0A1E2D] text-white">
                    <th className="text-left px-5 py-3 font-semibold sticky left-0 bg-[#0A1E2D]"> </th>
                    {chosen.map((r, i) => (
                      <th key={r.key} className="text-right px-4 py-3 font-semibold align-bottom">
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: color(i) }} />{r.portfolio.name || r.analysis}
                        <span className="block text-[11px] font-normal text-white/60">{r.analysis}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-5 py-2.5 text-slate-500 sticky left-0 bg-white">{l.period}</td>{chosen.map((r) => <td key={r.key} className="px-4 py-2.5 text-right text-slate-600">{r.period}</td>)}</tr>
                  {metrics.map((m) => {
                    const vals = chosen.map(m.get);
                    const ok = vals.filter(isNum) as number[];
                    const best = ok.length > 1 ? (m.higher ? Math.max(...ok) : Math.min(...ok)) : undefined;
                    return (
                      <tr key={m.k}>
                        <td className="px-5 py-2.5 text-slate-500 sticky left-0 bg-white">{m.k}</td>
                        {vals.map((v, i) => <td key={i} className={cn("px-4 py-2.5 text-right font-mono", v === best ? "font-bold text-slate-900" : "text-slate-600")}>{m.fmt(v)}</td>)}
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="px-5 py-2.5 text-slate-500 align-top sticky left-0 bg-white">{l.alloc}</td>
                    {chosen.map((r) => (
                      <td key={r.key} className="px-4 py-2.5 text-right text-xs text-slate-600 align-top">
                        {Object.entries(r.portfolio.alloc || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div key={k}><span className="font-semibold text-slate-800">{k}</span> {v.toFixed(0)} %</div>)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Advanced */}
          <section>
            <H lead={l.advancedLead}>{l.advanced}</H>
            {plan !== "pro" ? (
              <div className={cn(CARD, "p-8 text-center bg-[linear-gradient(180deg,#F8FAFC,white)]")}>
                <Lock className="w-6 h-6 text-[#1B3F72] mx-auto" />
                <p className="mt-3 text-lg font-semibold text-slate-900">{l.proOnly}</p>
                <p className="mt-1 text-slate-500">{l.proLead}</p>
                <button type="button" onClick={onUpgrade} className="mt-5 h-10 px-5 rounded-full bg-[#0A1E2D] text-white text-sm font-semibold">{l.see}</button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className={cn(CARD, "p-5")}>
                    <p className="text-sm font-semibold text-slate-700 mb-2">{l.scatter}</p>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                          <CartesianGrid stroke="#EEF2F7" />
                          <XAxis type="number" dataKey="x" name={l.vol} unit=" %" tick={axis} />
                          <YAxis type="number" dataKey="y" name={l.cagr} unit=" %" tick={axis} width={52} />
                          <ZAxis range={[160, 160]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: any) => `${Number(v).toFixed(2)} %`} contentStyle={{ borderRadius: 12 }} />
                          {chosen.map((r, i) => (isNum(r.portfolio.stdev) && isNum(r.portfolio.cagr) ? <Scatter key={r.key} name={label(r)} data={[{ x: r.portfolio.stdev, y: r.portfolio.cagr }]} fill={color(i)} /> : null))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className={cn(CARD, "p-5")}>
                    <p className="text-sm font-semibold text-slate-700 mb-2">{l.dd}</p>
                    <div className="h-[300px]">
                      {drawdowns.length > 1 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={drawdowns} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="#EEF2F7" vertical={false} />
                            <XAxis dataKey="date" tick={axis} tickFormatter={(d) => String(d).slice(0, 4)} minTickGap={40} />
                            <YAxis tick={axis} unit=" %" width={56} />
                            <Tooltip formatter={(v: any, k: any) => [`${v} %`, label(chosen[Number(String(k).slice(1))])]} contentStyle={{ borderRadius: 12 }} />
                            {chosen.map((_, i) => <Area key={i} type="monotone" dataKey={`s${i}`} stroke={color(i)} fill={color(i)} fillOpacity={0.08} strokeWidth={1.5} connectNulls />)}
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
                {years.length > 0 && (
                  <div className={cn(CARD, "overflow-hidden")}>
                    <p className="text-sm font-semibold text-slate-700 px-5 pt-5 pb-3">{l.annual}</p>
                    <div className="overflow-x-auto max-h-[460px]">
                      <table className="w-full text-[13px]" style={{ minWidth: 120 + chosen.length * 120 }}>
                        <thead className="sticky top-0 bg-white">
                          <tr className="text-slate-500 text-xs uppercase tracking-wider">
                            <th className="text-left px-5 py-2">{l.year}</th>
                            {chosen.map((r, i) => <th key={r.key} className="text-right px-3 py-2"><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: color(i) }} />{(r.portfolio.name || r.analysis).slice(0, 16)}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {years.map((y) => (
                            <tr key={y} className="border-t border-slate-100">
                              <td className="px-5 py-1.5 font-medium text-slate-700">{y}</td>
                              {chosen.map((r) => {
                                const k = (r.portfolio.annualYears || []).indexOf(y);
                                const v = k >= 0 ? r.portfolio.annualReturns?.[k] : undefined;
                                const a = isNum(v) ? Math.min(1, Math.abs(v) / 30) : 0;
                                return <td key={r.key} className="px-3 py-1.5 text-right font-mono" style={{ background: isNum(v) ? (v >= 0 ? `rgba(16,185,129,${0.08 + a * 0.35})` : `rgba(239,68,68,${0.08 + a * 0.35})`) : undefined }}>{isNum(v) ? `${v.toFixed(1)} %` : "-"}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
