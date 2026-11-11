import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { ArrowDown, ArrowUp, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const pct = (v: any) => (isNum(v) ? `${v.toFixed(2)}%` : "-");
const num = (v: any) => (isNum(v) ? v.toFixed(2) : "-");
const COLORS = ["#5B4BDB", "#0EA5E9", "#F59E0B", "#10B981"];

interface Row {
  rowId: string;
  configId: string;
  config: any;
  configName: string;
  portfolio: string;
  period: string;
  savedAt: number;
  cagr?: number;
  stdev?: number;
  maxDrawdown?: number;
  sharpe?: number;
  sortino?: number;
  bestYear?: number;
  worstYear?: number;
  endBalance?: number;
  initialAmount?: number;
  alloc?: Record<string, number>;
}

type SortKey = "cagr" | "stdev" | "maxDrawdown" | "sharpe" | "sortino" | "bestYear" | "worstYear" | "endBalance" | "savedAt";

const L = {
  en: {
    title: "Saved backtests", subtitle: "Every portfolio of every saved backtest, side by side. Select up to 4 rows to compare them in detail.",
    signin: "Sign in to save backtests and compare them.", empty: "No saved backtest yet. Run a backtest, then use “Save this analysis” below it.", loading: "Loading…",
    name: "Backtest / portfolio", period: "Period", cagr: "CAGR", stdev: "Stdev", maxdd: "Max DD", sharpe: "Sharpe", sortino: "Sortino", best: "Best yr", worst: "Worst yr",
    final: "Final balance", saved: "Saved", load: "Load", confirm: "Confirm", refresh: "Refresh", compare: "Comparison", select: "Select up to 4 rows to compare.",
    metric: "Metric", allocation: "Allocation", notComputed: "Results were not saved with this backtest. Load it and run it again to save its results.", best_hint: "Best value per column is highlighted.",
  },
  fr: {
    title: "Backtests enregistrés", subtitle: "Chaque portefeuille de chaque backtest enregistré, côte à côte. Sélectionnez jusqu'à 4 lignes pour les comparer en détail.",
    signin: "Connectez-vous pour enregistrer vos backtests et les comparer.", empty: "Aucun backtest enregistré. Lancez un backtest puis utilisez « Enregistrer cette analyse » en dessous.", loading: "Chargement…",
    name: "Backtest / portefeuille", period: "Période", cagr: "TCAC", stdev: "Volatilité", maxdd: "Perte max.", sharpe: "Sharpe", sortino: "Sortino", best: "Meilleure année", worst: "Pire année",
    final: "Valeur finale", saved: "Enregistré", load: "Charger", confirm: "Confirmer", refresh: "Actualiser", compare: "Comparaison", select: "Sélectionnez jusqu'à 4 lignes à comparer.",
    metric: "Indicateur", allocation: "Allocation", notComputed: "Les résultats n'ont pas été enregistrés avec ce backtest. Chargez-le et relancez-le pour enregistrer ses résultats.", best_hint: "La meilleure valeur de chaque colonne est mise en évidence.",
  },
};

export function SavedBacktestsComparison({
  configs, loading, signedIn, currency = "USD", language = "en", onLoad, onDelete, onRefresh,
}: {
  configs: any[];
  loading: boolean;
  signedIn: boolean;
  currency?: string;
  language?: string;
  onLoad: (config: any) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const l = L[language === "fr" ? "fr" : "en"];
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "savedAt", dir: -1 });
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    configs.forEach((c) => {
      const period = c.startYear && c.endYear ? `${c.startMonth ? String(c.startMonth).padStart(2, "0") + "/" : ""}${c.startYear} - ${c.endMonth ? String(c.endMonth).padStart(2, "0") + "/" : ""}${c.endYear}` : "-";
      const summary: any[] = Array.isArray(c.resultsSummary) ? c.resultsSummary : [];
      if (summary.length === 0) {
        out.push({ rowId: `${c.id}:none`, configId: c.id, config: c, configName: c.name || "-", portfolio: "", period, savedAt: c.updatedAt || c.createdAt || 0 });
      } else {
        summary.forEach((r, i) =>
          out.push({
            rowId: `${c.id}:${i}`, configId: c.id, config: c, configName: c.name || "-", portfolio: r.name || `#${i + 1}`, period, savedAt: c.updatedAt || c.createdAt || 0,
            cagr: r.cagr, stdev: r.stdev, maxDrawdown: isNum(r.maxDrawdown) ? -Math.abs(r.maxDrawdown) : undefined, sharpe: r.sharpe, sortino: r.sortino,
            bestYear: r.bestYear, worstYear: r.worstYear, endBalance: r.endBalance, initialAmount: r.initialAmount ?? c.initialAmount, alloc: r.alloc,
          })
        );
      }
    });
    return out.sort((a, b) => {
      const va = (a as any)[sort.key], vb = (b as any)[sort.key];
      if (!isNum(va) && !isNum(vb)) return 0;
      if (!isNum(va)) return 1;
      if (!isNum(vb)) return -1;
      return (va - vb) * sort.dir;
    });
  }, [configs, sort]);

  const cols: { key: SortKey; label: string; fmt: (v: any) => string; hib?: boolean }[] = [
    { key: "cagr", label: l.cagr, fmt: pct, hib: true },
    { key: "stdev", label: l.stdev, fmt: pct, hib: false },
    { key: "maxDrawdown", label: l.maxdd, fmt: pct, hib: true },
    { key: "sharpe", label: l.sharpe, fmt: num, hib: true },
    { key: "sortino", label: l.sortino, fmt: num, hib: true },
    { key: "bestYear", label: l.best, fmt: pct, hib: true },
    { key: "worstYear", label: l.worst, fmt: pct, hib: true },
    { key: "endBalance", label: l.final, fmt: (v) => (isNum(v) ? new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v) : "-"), hib: true },
  ];

  const bestOf = (key: SortKey, hib?: boolean) => {
    const vals = rows.map((r) => (r as any)[key]).filter(isNum) as number[];
    if (vals.length < 2 || hib === undefined) return null;
    return hib ? Math.max(...vals) : Math.min(...vals);
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? s : [...s, id]));
  const compared = selected.map((id) => rows.find((r) => r.rowId === id)).filter(Boolean) as Row[];

  const chartData = [
    { m: l.cagr, ...Object.fromEntries(compared.map((r) => [r.rowId, r.cagr ?? null])) },
    { m: l.stdev, ...Object.fromEntries(compared.map((r) => [r.rowId, r.stdev ?? null])) },
    { m: l.maxdd, ...Object.fromEntries(compared.map((r) => [r.rowId, r.maxDrawdown ?? null])) },
    { m: l.best, ...Object.fromEntries(compared.map((r) => [r.rowId, r.bestYear ?? null])) },
    { m: l.worst, ...Object.fromEntries(compared.map((r) => [r.rowId, r.worstYear ?? null])) },
  ];

  if (!signedIn) {
    return <div className="border border-border rounded-2xl p-10 text-center text-text-3"><a href="/auth" className="text-pv-blue hover:underline">{l.signin}</a></div>;
  }

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="px-3 py-3 text-right">
      <button onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : -1 }))} className={cn("inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap", sort.key === k ? "text-text" : "text-text-3 hover:text-text")}>
        {label}
        {sort.key === k && (sort.dir === -1 ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-text">{l.title}</h2>
            <p className="text-sm text-text-3 mt-1">{l.subtitle}</p>
          </div>
          <button onClick={onRefresh} className="h-9 px-3 rounded-lg border border-border text-sm font-medium text-text-2 hover:border-pv-blue inline-flex items-center gap-1.5 self-start md:self-auto">
            <RefreshCw size={14} /> {l.refresh}
          </button>
        </div>
        {loading ? (
          <p className="px-6 py-10 text-center text-text-3">{l.loading}</p>
        ) : rows.length === 0 ? (
          <p className="px-6 py-10 text-center text-text-3">{l.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-[15px]">
              <thead className="border-y border-border bg-surface-2/60">
                <tr>
                  <th className="w-10" />
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-3">{l.name}</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-3">{l.period}</th>
                  {cols.map((c) => <SortTh key={c.key} k={c.key} label={c.label} />)}
                  <SortTh k="savedAt" label={l.saved} />
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const sel = selected.includes(r.rowId);
                  const colorIdx = selected.indexOf(r.rowId);
                  return (
                    <tr key={r.rowId} className={cn("border-b border-border/70", sel ? "bg-pv-blue/5" : "hover:bg-surface-2/40")}>
                      <td className="pl-4">
                        {r.portfolio && (
                          <input type="checkbox" checked={sel} disabled={!sel && selected.length >= 4} onChange={() => toggle(r.rowId)} className="w-4 h-4 accent-[var(--color-pv-blue)]" aria-label="compare" />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-text flex items-center gap-2">
                          {sel && <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[colorIdx] }} />}
                          {r.configName}
                        </div>
                        <div className="text-sm text-text-3">{r.portfolio || l.notComputed}</div>
                      </td>
                      <td className="px-3 py-3 text-text-2 whitespace-nowrap">{r.period}</td>
                      {cols.map((c) => {
                        const v = (r as any)[c.key];
                        const b = bestOf(c.key, c.hib);
                        return <td key={c.key} className={cn("px-3 py-3 text-right tabular-nums whitespace-nowrap", b !== null && isNum(v) && v === b ? "font-semibold text-emerald-700" : "text-text-2")}>{c.fmt(v)}</td>;
                      })}
                      <td className="px-3 py-3 text-right text-text-3 whitespace-nowrap">{r.savedAt ? new Date(Number(r.savedAt)).toLocaleDateString(language === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button onClick={() => onLoad(r.config)} className="text-pv-blue font-medium hover:underline mr-3">{l.load}</button>
                        {confirmId === r.configId ? (
                          <button onClick={() => { onDelete(r.configId); setConfirmId(null); }} className="text-sm font-semibold text-rose-700">{l.confirm}</button>
                        ) : (
                          <button onClick={() => { setConfirmId(r.configId); setTimeout(() => setConfirmId((c) => (c === r.configId ? null : c)), 3000); }} className="text-text-4 hover:text-rose-600 align-middle" aria-label="delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-6 py-3 text-xs text-text-3">{l.best_hint}</p>
          </div>
        )}
      </section>

      {rows.some((r) => r.portfolio) && (
        <section className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-serif text-2xl font-semibold text-text">{l.compare}</h3>
          {compared.length < 2 ? (
            <p className="text-sm text-text-3 mt-2">{l.select}</p>
          ) : (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 mt-5">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF0F4" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 13, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={52} />
                  <ReferenceLine y={0} stroke="#CBD5E1" />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }} formatter={(v: any, name: any) => [pct(Number(v)), name]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                  {compared.map((r, i) => (
                    <Bar key={r.rowId} dataKey={r.rowId} name={`${r.configName} · ${r.portfolio}`} fill={COLORS[i]} isAnimationActive={false} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-[15px]">
                  <thead className="border-y border-border bg-surface-2/60">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-3">{l.metric}</th>
                      {compared.map((r, i) => (
                        <th key={r.rowId} className="px-3 py-3 text-right text-xs font-semibold text-text-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ background: COLORS[i] }} />
                          {r.configName}
                          <div className="font-normal text-text-3 normal-case">{r.portfolio}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...cols, { key: "period" as any, label: l.period, fmt: (v: any) => v || "-" }].map((c: any) => {
                      const vals = compared.map((r) => (r as any)[c.key]);
                      const nums = vals.filter(isNum) as number[];
                      const b = c.hib === undefined || nums.length < 2 ? null : c.hib ? Math.max(...nums) : Math.min(...nums);
                      return (
                        <tr key={c.key} className="border-b border-border/70">
                          <td className="px-3 py-2.5 text-text-2">{c.label}</td>
                          {vals.map((v, i) => <td key={i} className={cn("px-3 py-2.5 text-right tabular-nums", b !== null && v === b ? "font-semibold text-emerald-700" : "text-text")}>{c.fmt(v)}</td>)}
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="px-3 py-2.5 text-text-2 align-top">{l.allocation}</td>
                      {compared.map((r) => (
                        <td key={r.rowId} className="px-3 py-2.5 text-right align-top">
                          <div className="flex flex-wrap justify-end gap-1">
                            {Object.entries(r.alloc || {}).filter(([, w]) => Number(w) > 0).map(([s, w]) => (
                              <span key={s} className="text-xs font-medium bg-surface-2 border border-border rounded px-1.5 py-0.5">{s} {Number(w)}%</span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
