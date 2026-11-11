import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { Download } from "lucide-react";
import { cn } from "../../lib/utils";

type StatementId = "income" | "balance" | "cash";
type Row = Record<string, any>;

interface LineDef {
  key: string;
  label: { en: string; fr: string };
  /** Bold subtotal line */
  total?: boolean;
  /** Displayed as a ratio (%), computed from other lines */
  ratio?: (row: Row, ctx: Ctx) => number | null;
  /** Per-share value (not abbreviated) */
  perShare?: boolean;
  /** Line indented under a subtotal */
  indent?: boolean;
  /** Outflows shown in parentheses */
  outflow?: boolean;
}

interface Ctx {
  income: Row[];
  balance: Row[];
  cashFlow: Row[];
}

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const pct = (a: any, b: any) => (isNum(a) && isNum(b) && b !== 0 ? (a / b) * 100 : null);
const sameRow = (rows: Row[], period: string) => rows.find((r) => r.calendarYear === period);

const LINES: Record<StatementId, LineDef[]> = {
  income: [
    { key: "revenue", label: { en: "Revenue", fr: "Chiffre d'affaires" }, total: true },
    { key: "costOfRevenue", label: { en: "Cost of revenue", fr: "Coût des ventes" }, indent: true, outflow: true },
    { key: "grossProfit", label: { en: "Gross profit", fr: "Marge brute" }, total: true },
    { key: "_grossMargin", label: { en: "Gross margin", fr: "Taux de marge brute" }, ratio: (r) => pct(r.grossProfit, r.revenue) },
    { key: "researchAndDevelopment", label: { en: "Research & development", fr: "Recherche & développement" }, indent: true, outflow: true },
    { key: "sellingGeneralAndAdministration", label: { en: "Selling, general & admin.", fr: "Frais commerciaux et généraux" }, indent: true, outflow: true },
    { key: "operatingIncome", label: { en: "Operating income", fr: "Résultat opérationnel" }, total: true },
    { key: "_operatingMargin", label: { en: "Operating margin", fr: "Marge opérationnelle" }, ratio: (r) => pct(r.operatingIncome, r.revenue) },
    { key: "ebitda", label: { en: "EBITDA", fr: "EBITDA" } },
    { key: "interestExpense", label: { en: "Interest expense", fr: "Charges d'intérêts" }, indent: true, outflow: true },
    { key: "pretaxIncome", label: { en: "Pre-tax income", fr: "Résultat avant impôt" } },
    { key: "taxProvision", label: { en: "Income tax", fr: "Impôt sur les bénéfices" }, indent: true, outflow: true },
    { key: "netIncome", label: { en: "Net income", fr: "Résultat net" }, total: true },
    { key: "_netMargin", label: { en: "Net margin", fr: "Marge nette" }, ratio: (r) => pct(r.netIncome, r.revenue) },
    { key: "eps", label: { en: "Diluted EPS", fr: "BPA dilué" }, perShare: true },
    { key: "dilutedShares", label: { en: "Diluted shares", fr: "Actions diluées" } },
  ],
  balance: [
    { key: "totalAssets", label: { en: "Total assets", fr: "Total de l'actif" }, total: true },
    { key: "currentAssets", label: { en: "Current assets", fr: "Actif courant" }, indent: true },
    { key: "cashAndCashEquivalents", label: { en: "Cash & equivalents", fr: "Trésorerie" }, indent: true },
    { key: "accountsReceivable", label: { en: "Receivables", fr: "Créances clients" }, indent: true },
    { key: "inventory", label: { en: "Inventory", fr: "Stocks" }, indent: true },
    { key: "netPPE", label: { en: "Property, plant & equipment", fr: "Immobilisations corporelles" }, indent: true },
    { key: "goodwill", label: { en: "Goodwill", fr: "Goodwill" }, indent: true },
    { key: "totalLiabilities", label: { en: "Total liabilities", fr: "Total du passif" }, total: true },
    { key: "currentLiabilities", label: { en: "Current liabilities", fr: "Passif courant" }, indent: true },
    { key: "longTermDebt", label: { en: "Long-term debt", fr: "Dette à long terme" }, indent: true },
    { key: "totalDebt", label: { en: "Total debt", fr: "Dette totale" } },
    { key: "netDebt", label: { en: "Net debt", fr: "Dette nette" } },
    { key: "totalStockholdersEquity", label: { en: "Shareholders' equity", fr: "Capitaux propres" }, total: true },
    { key: "retainedEarnings", label: { en: "Retained earnings", fr: "Résultats non distribués" }, indent: true },
    { key: "workingCapital", label: { en: "Working capital", fr: "Fonds de roulement" } },
    { key: "_currentRatio", label: { en: "Current ratio", fr: "Ratio de liquidité" }, ratio: (r) => (isNum(r.currentAssets) && isNum(r.currentLiabilities) && r.currentLiabilities !== 0 ? r.currentAssets / r.currentLiabilities : null) },
    { key: "_debtToEquity", label: { en: "Debt / equity", fr: "Dette / capitaux propres" }, ratio: (r) => pct(r.totalDebt, r.totalStockholdersEquity) },
  ],
  cash: [
    { key: "operatingCashFlow", label: { en: "Operating cash flow", fr: "Flux de trésorerie d'exploitation" }, total: true },
    { key: "depreciationAndAmortization", label: { en: "Depreciation & amortization", fr: "Amortissements" }, indent: true },
    { key: "stockBasedCompensation", label: { en: "Stock-based compensation", fr: "Rémunération en actions" }, indent: true },
    { key: "investingCashFlow", label: { en: "Investing cash flow", fr: "Flux d'investissement" }, total: true },
    { key: "capitalExpenditure", label: { en: "Capital expenditure", fr: "Investissements (capex)" }, indent: true, outflow: true },
    { key: "financingCashFlow", label: { en: "Financing cash flow", fr: "Flux de financement" }, total: true },
    { key: "repurchaseOfCapitalStock", label: { en: "Share buybacks", fr: "Rachats d'actions" }, indent: true, outflow: true },
    { key: "dividendsPaid", label: { en: "Dividends paid", fr: "Dividendes versés" }, indent: true, outflow: true },
    { key: "netChangeInCash", label: { en: "Net change in cash", fr: "Variation de trésorerie" } },
    { key: "freeCashFlow", label: { en: "Free cash flow", fr: "Flux de trésorerie disponible" }, total: true },
    { key: "_fcfMargin", label: { en: "FCF margin", fr: "Marge de FCF" }, ratio: (r, c) => pct(r.freeCashFlow, sameRow(c.income, r.calendarYear)?.revenue) },
    { key: "_fcfConversion", label: { en: "FCF / net income", fr: "FCF / résultat net" }, ratio: (r, c) => pct(r.freeCashFlow, sameRow(c.income, r.calendarYear)?.netIncome) },
  ],
};

const T = {
  en: {
    title: "Financial statements", income: "Income statement", balance: "Balance sheet", cash: "Cash flow", annual: "Annual", quarterly: "Quarterly",
    export: "Export CSV", item: "Line item", trend: "Trend", noData: "No reported data available for this symbol and period.", yoy: "vs prior period",
    note: "Reported figures from company filings (via Yahoo Finance). Margins and ratios are computed from these figures.", currency: "Amounts in",
  },
  fr: {
    title: "États financiers", income: "Compte de résultat", balance: "Bilan", cash: "Flux de trésorerie", annual: "Annuel", quarterly: "Trimestriel",
    export: "Exporter CSV", item: "Poste", trend: "Tendance", noData: "Aucune donnée publiée disponible pour ce symbole et cette période.", yoy: "vs période précédente",
    note: "Chiffres publiés par l'entreprise (via Yahoo Finance). Marges et ratios calculés à partir de ces chiffres.", currency: "Montants en",
  },
};

function fmtAmount(v: any) {
  if (!isNum(v)) return "-";
  const a = Math.abs(v);
  const s = a >= 1e12 ? (a / 1e12).toFixed(2) + "T" : a >= 1e9 ? (a / 1e9).toFixed(2) + "B" : a >= 1e6 ? (a / 1e6).toFixed(1) + "M" : a >= 1e3 ? (a / 1e3).toFixed(1) + "K" : a.toFixed(2);
  return v < 0 ? `(${s})` : s;
}

function Sparkline({ values }: { values: (number | null)[] }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p) => isNum(p.v)) as { v: number; i: number }[];
  if (pts.length < 2) return <span className="text-text-4">-</span>;
  const w = 72, h = 22;
  const min = Math.min(...pts.map((p) => p.v)), max = Math.max(...pts.map((p) => p.v));
  const span = max - min || 1;
  const x = (i: number) => (i / Math.max(1, values.length - 1)) * (w - 4) + 2;
  const y = (v: number) => h - 2 - ((v - min) / span) * (h - 4);
  const d = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const up = pts[pts.length - 1].v >= pts[0].v;
  return (
    <svg width={w} height={h} className="inline-block align-middle" aria-hidden>
      <path d={d} fill="none" stroke={up ? "#059669" : "#E11D48"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(pts[pts.length - 1].i)} cy={y(pts[pts.length - 1].v)} r={2.2} fill={up ? "#059669" : "#E11D48"} />
    </svg>
  );
}

export interface FinancialStatementsProps {
  symbol: string;
  income: Row[];
  balance: Row[];
  cashFlow: Row[];
  period: "annual" | "quarterly";
  onPeriodChange: (p: "annual" | "quarterly") => void;
  currency?: string | null;
  language?: string;
}

export function FinancialStatements({ symbol, income, balance, cashFlow, period, onPeriodChange, currency, language = "en" }: FinancialStatementsProps) {
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t = T[lang];
  const [tab, setTab] = useState<StatementId>("income");
  const ctx: Ctx = { income, balance, cashFlow };
  const source = tab === "income" ? income : tab === "balance" ? balance : cashFlow;

  // Newest period first in the table (like professional terminals), oldest → newest in charts
  const periods = useMemo(() => source.map((r) => r.calendarYear).filter(Boolean) as string[], [source]);
  const chronological = useMemo(() => [...source].reverse(), [source]);

  const visibleLines = LINES[tab].filter((l) => source.some((r) => (l.ratio ? isNum(l.ratio(r, ctx)) : isNum(r[l.key]))));

  const valueOf = (l: LineDef, r: Row | undefined) => (r ? (l.ratio ? l.ratio(r, ctx) : r[l.key]) : null);

  // KPI strip: latest value and change vs prior period
  const kpiKeys: Record<StatementId, string[]> = {
    income: ["revenue", "grossProfit", "operatingIncome", "netIncome", "eps"],
    balance: ["totalAssets", "totalLiabilities", "totalStockholdersEquity", "cashAndCashEquivalents", "totalDebt"],
    cash: ["operatingCashFlow", "capitalExpenditure", "freeCashFlow", "dividendsPaid", "repurchaseOfCapitalStock"],
  };
  const latest = source[0], prior = source[1];
  const kpis = kpiKeys[tab]
    .map((k) => LINES[tab].find((l) => l.key === k)!)
    .filter((l) => l && isNum(latest?.[l.key]));

  // Chart config per statement: bars (amounts) + lines (ratios, right axis)
  const chart = useMemo(() => {
    if (tab === "income") {
      return {
        data: chronological.map((r) => ({ p: r.calendarYear, a: r.revenue, b: r.operatingIncome, c: r.netIncome, m1: pct(r.grossProfit, r.revenue), m2: pct(r.operatingIncome, r.revenue), m3: pct(r.netIncome, r.revenue) })),
        bars: [["a", lang === "fr" ? "Chiffre d'affaires" : "Revenue", "#C7C2F7"], ["b", lang === "fr" ? "Résultat opérationnel" : "Operating income", "#7B6CF0"], ["c", lang === "fr" ? "Résultat net" : "Net income", "#3F2FB3"]],
        lines: [["m1", lang === "fr" ? "Marge brute" : "Gross margin", "#0EA5E9"], ["m2", lang === "fr" ? "Marge op." : "Operating margin", "#F59E0B"], ["m3", lang === "fr" ? "Marge nette" : "Net margin", "#10B981"]],
      };
    }
    if (tab === "balance") {
      return {
        data: chronological.map((r) => ({ p: r.calendarYear, a: r.totalAssets, b: r.totalLiabilities, c: r.totalStockholdersEquity, m1: pct(r.totalDebt, r.totalStockholdersEquity) })),
        bars: [["a", lang === "fr" ? "Actif" : "Assets", "#C7C2F7"], ["b", lang === "fr" ? "Passif" : "Liabilities", "#F59E0B"], ["c", lang === "fr" ? "Capitaux propres" : "Equity", "#3F2FB3"]],
        lines: [["m1", lang === "fr" ? "Dette / capitaux propres" : "Debt / equity", "#E11D48"]],
      };
    }
    return {
      data: chronological.map((r) => ({ p: r.calendarYear, a: r.operatingCashFlow, b: isNum(r.capitalExpenditure) ? r.capitalExpenditure : null, c: r.freeCashFlow, m1: pct(r.freeCashFlow, sameRow(income, r.calendarYear)?.revenue) })),
      bars: [["a", lang === "fr" ? "Flux d'exploitation" : "Operating cash flow", "#C7C2F7"], ["b", "Capex", "#F59E0B"], ["c", lang === "fr" ? "Flux disponible (FCF)" : "Free cash flow", "#3F2FB3"]],
      lines: [["m1", lang === "fr" ? "Marge de FCF" : "FCF margin", "#10B981"]],
    };
  }, [tab, chronological, income, lang]);

  const exportCsv = () => {
    const header = [t.item, ...periods].join(",");
    const rows = visibleLines.map((l) => [`"${l.label[lang]}"`, ...periods.map((p) => {
      const v = valueOf(l, source.find((r) => r.calendarYear === p));
      return isNum(v) ? String(v) : "";
    })].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${symbol}_${tab}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs: { id: StatementId; label: string }[] = [
    { id: "income", label: t.income },
    { id: "balance", label: t.balance },
    { id: "cash", label: t.cash },
  ];

  return (
    <section className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-text">{t.title} <span className="text-text-3 font-sans text-lg font-medium">· {symbol}</span></h2>
          <div className="flex gap-6 mt-4 -mb-4">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={cn("pb-3 text-[15px] font-semibold border-b-2 transition-colors", tab === tb.id ? "border-pv-blue text-text" : "border-transparent text-text-3 hover:text-text")}
              >
                {tb.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 bg-surface-2 border border-border rounded-lg">
            {(["annual", "quarterly"] as const).map((p) => (
              <button key={p} onClick={() => onPeriodChange(p)} className={cn("px-3 h-8 rounded-md text-sm font-semibold", period === p ? "bg-white text-text shadow-sm" : "text-text-3")}>
                {p === "annual" ? t.annual : t.quarterly}
              </button>
            ))}
          </div>
          <button onClick={exportCsv} disabled={!source.length} className="h-9 px-3 rounded-lg border border-border text-sm font-medium text-text-2 hover:border-pv-blue inline-flex items-center gap-1.5 disabled:opacity-40">
            <Download size={15} /> {t.export}
          </button>
        </div>
      </div>

      {source.length === 0 ? (
        <p className="px-6 py-16 text-center text-text-3">{t.noData}</p>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 divide-x divide-y xl:divide-y-0 divide-border border-b border-border">
            {kpis.map((l) => {
              const v = latest?.[l.key];
              const pv = prior?.[l.key];
              const g = isNum(v) && isNum(pv) && pv !== 0 ? ((v - pv) / Math.abs(pv)) * 100 : null;
              return (
                <div key={l.key} className="px-6 py-5">
                  <div className="text-sm text-text-3">{l.label[lang]}</div>
                  <div className="mt-1 text-2xl font-semibold text-text tabular-nums">{l.perShare ? (isNum(v) ? v.toFixed(2) : "-") : fmtAmount(v)}</div>
                  <div className={cn("mt-0.5 text-sm font-medium tabular-nums", !isNum(g) ? "text-text-4" : g >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {isNum(g) ? `${g >= 0 ? "▲" : "▼"} ${Math.abs(g).toFixed(1)}%` : "-"} <span className="text-text-4 font-normal">{t.yoy}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="px-4 md:px-6 pt-6">
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chart.data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke="#EEF0F4" vertical={false} />
                <XAxis dataKey="p" tick={{ fontSize: 13, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                <YAxis yAxisId="amt" tickFormatter={(v) => fmtAmount(v)} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={64} />
                <YAxis yAxisId="pct" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={48} />
                <ReferenceLine yAxisId="amt" y={0} stroke="#CBD5E1" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }}
                  formatter={(v: any, name: any, item: any) => (String(item?.dataKey || "").startsWith("m") ? (isNum(Number(v)) ? `${Number(v).toFixed(1)}%` : "-") : fmtAmount(Number(v)))}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                {chart.bars.map(([k, name, color]) => (
                  <Bar key={k} yAxisId="amt" dataKey={k} name={name} fill={color} radius={[3, 3, 0, 0]} maxBarSize={44} />
                ))}
                {chart.lines.map(([k, name, color]) => (
                  <Line key={k} yAxisId="pct" type="monotone" dataKey={k} name={name} stroke={color} strokeWidth={2.2} dot={{ r: 3 }} connectNulls />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Statement table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-[760px] text-[15px]">
              <thead>
                <tr className="border-y border-border bg-surface-2/60 text-xs uppercase tracking-wider text-text-3">
                  <th className="text-left font-semibold px-6 py-3 sticky left-0 bg-surface-2/95">{t.item}</th>
                  {periods.map((p) => (
                    <th key={p} className="text-right font-semibold px-4 py-3 whitespace-nowrap">{p}</th>
                  ))}
                  <th className="text-right font-semibold px-6 py-3">{t.trend}</th>
                </tr>
              </thead>
              <tbody>
                {visibleLines.map((l) => {
                  const vals = periods.map((p) => valueOf(l, source.find((r) => r.calendarYear === p)));
                  return (
                    <tr key={l.key} className={cn("border-b border-border/70 hover:bg-surface-2/40", l.total && "bg-surface-2/30")}>
                      <td className={cn("px-6 py-2.5 whitespace-nowrap sticky left-0 bg-white", l.total ? "font-semibold text-text" : l.ratio ? "italic text-text-3" : "text-text-2", l.indent && "pl-10")}>
                        {l.label[lang]}
                      </td>
                      {vals.map((v, idx) => {
                        const prev = vals[idx + 1];
                        const g = !l.ratio && isNum(v) && isNum(prev) && prev !== 0 ? ((v - prev) / Math.abs(prev)) * 100 : null;
                        return (
                          <td key={idx} className="px-4 py-2.5 text-right tabular-nums align-top">
                            <div className={cn(l.total ? "font-semibold text-text" : l.ratio ? "italic text-text-3" : "text-text-2", isNum(v) && v < 0 && !l.ratio && "text-rose-700")}>
                              {l.ratio ? (isNum(v) ? (l.key === "_currentRatio" ? v.toFixed(2) : `${v.toFixed(1)}%`) : "-") : l.perShare ? (isNum(v) ? v.toFixed(2) : "-") : fmtAmount(v)}
                            </div>
                            {isNum(g) && (
                              <div className={cn("text-[12px]", (l.outflow ? -g : g) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {g >= 0 ? "+" : ""}{g.toFixed(1)}%
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-2.5 text-right">
                        <Sparkline values={[...vals].reverse()} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-6 py-4 text-xs text-text-3">
            {t.note}
            {currency ? ` ${t.currency} ${currency}.` : ""}
          </p>
        </>
      )}
    </section>
  );
}
