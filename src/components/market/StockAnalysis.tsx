import React, { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  BarChart2, ShieldCheck, Percent, Scale, Coins, Target, Users, Newspaper, CheckCircle2, XCircle, MinusCircle, Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers - every value comes from real API data; missing data = "-" */
/* ------------------------------------------------------------------ */

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

const big = (v: any) => {
  if (!isNum(v)) return "-";
  const a = Math.abs(v);
  if (a >= 1e12) return (v / 1e12).toFixed(2) + " T";
  if (a >= 1e9) return (v / 1e9).toFixed(2) + " B";
  if (a >= 1e6) return (v / 1e6).toFixed(2) + " M";
  if (a >= 1e3) return (v / 1e3).toFixed(1) + " K";
  return v.toFixed(2);
};
const pct = (v: any, digits = 2) => (isNum(v) ? `${v.toFixed(digits)}%` : "-");
const signedPct = (v: any) => (isNum(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "-");
const mult = (v: any) => (isNum(v) ? `${v.toFixed(2)}x` : "-");
const num = (v: any, d = 2) => (isNum(v) ? v.toFixed(d) : "-");

const money = (v: any, ccy?: string | null) => {
  if (!isNum(v)) return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy || "USD", maximumFractionDigits: 2 }).format(v);
  } catch {
    return v.toFixed(2);
  }
};

const growth = (cur: any, prev: any) => (isNum(cur) && isNum(prev) && prev !== 0 ? ((cur - prev) / Math.abs(prev)) * 100 : null);

const L: Record<string, Record<string, string>> = {
  en: {
    keyStats: "Key statistics", marketCap: "Market cap", pe: "P/E (TTM)", fpe: "Forward P/E", eps: "EPS (TTM)", beta: "Beta (5Y)",
    volume: "Volume", avgVolume: "Avg. volume", divYield: "Dividend yield", shares: "Shares outstanding", ev: "EV / EBITDA",
    range52: "52-week range", dayRange: "Day range", ma50: "50-day avg", ma200: "200-day avg", change52: "52-week change",
    valuation: "Valuation", profitability: "Profitability", health: "Financial health", dividends: "Dividends & ownership",
    ps: "Price / Sales", pb: "Price / Book", peg: "PEG ratio", evs: "EV / Sales", ey: "Earnings yield",
    gm: "Gross margin", om: "Operating margin", nm: "Net margin", ebm: "EBITDA margin", roe: "Return on equity", roa: "Return on assets",
    cr: "Current ratio", qr: "Quick ratio", de: "Debt / Equity", cash: "Total cash", debt: "Total debt", fcf: "Free cash flow (TTM)",
    payout: "Payout ratio", divRate: "Annual dividend", insiders: "Held by insiders", institutions: "Held by institutions", short: "Short % of float",
    growthTitle: "Growth & margins", period: "Period", revenue: "Revenue", netIncome: "Net income", epsShort: "EPS", fcfShort: "Free cash flow",
    yoy: "growth", marginsTrend: "Margin trend", checklist: "Quality checklist", analysts: "Analyst consensus", target: "Mean price target",
    targetRange: "Target range", upside: "Implied upside", recommendation: "Recommendation", opinions: "analysts", peers: "Comparable companies",
    news: "Company news", noData: "Data not available for this symbol.", revGrowth: "Revenue growth (YoY)", earnGrowth: "Earnings growth (YoY)",
    c1: "Profitable (net income > 0)", c2: "Positive free cash flow", c3: "Revenue growing year over year", c4: "Debt / Equity below 100%",
    c5: "Current ratio above 1", c6: "Net margin above 10%", c7: "Return on equity above 15%", c8: "Price above 200-day average",
    passed: "criteria met", disclaimer: "Indicative checklist computed from the latest reported data. Not investment advice.",
    strongBuy: "Strong buy", buy: "Buy", hold: "Hold", sell: "Sell", strongSell: "Strong sell",
  },
  fr: {
    keyStats: "Statistiques clés", marketCap: "Capitalisation", pe: "PER (12 m)", fpe: "PER prévisionnel", eps: "BPA (12 m)", beta: "Bêta (5 ans)",
    volume: "Volume", avgVolume: "Volume moyen", divYield: "Rendement dividende", shares: "Actions en circulation", ev: "VE / EBITDA",
    range52: "Plage 52 semaines", dayRange: "Plage du jour", ma50: "Moyenne 50 j", ma200: "Moyenne 200 j", change52: "Variation 52 sem.",
    valuation: "Valorisation", profitability: "Rentabilité", health: "Santé financière", dividends: "Dividendes & actionnariat",
    ps: "Cours / Ventes", pb: "Cours / Actif net", peg: "Ratio PEG", evs: "VE / Ventes", ey: "Rendement bénéficiaire",
    gm: "Marge brute", om: "Marge opérationnelle", nm: "Marge nette", ebm: "Marge EBITDA", roe: "Rentabilité des fonds propres", roa: "Rentabilité des actifs",
    cr: "Ratio de liquidité", qr: "Ratio de liquidité immédiate", de: "Dette / Fonds propres", cash: "Trésorerie totale", debt: "Dette totale", fcf: "Flux de trésorerie libre (12 m)",
    payout: "Taux de distribution", divRate: "Dividende annuel", insiders: "Détenu par les dirigeants", institutions: "Détenu par les institutions", short: "Vente à découvert (% flottant)",
    growthTitle: "Croissance & marges", period: "Période", revenue: "Chiffre d'affaires", netIncome: "Résultat net", epsShort: "BPA", fcfShort: "Flux de trésorerie libre",
    yoy: "croissance", marginsTrend: "Évolution des marges", checklist: "Check-list qualité", analysts: "Consensus des analystes", target: "Objectif de cours moyen",
    targetRange: "Fourchette d'objectifs", upside: "Potentiel", recommendation: "Recommandation", opinions: "analystes", peers: "Sociétés comparables",
    news: "Actualités de l'entreprise", noData: "Données non disponibles pour ce symbole.", revGrowth: "Croissance du CA (sur 1 an)", earnGrowth: "Croissance des bénéfices (sur 1 an)",
    c1: "Rentable (résultat net > 0)", c2: "Flux de trésorerie libre positif", c3: "Chiffre d'affaires en hausse sur 1 an", c4: "Dette / Fonds propres sous 100 %",
    c5: "Ratio de liquidité supérieur à 1", c6: "Marge nette supérieure à 10 %", c7: "Rentabilité des fonds propres > 15 %", c8: "Cours au-dessus de la moyenne 200 j",
    passed: "critères validés", disclaimer: "Check-list indicative calculée à partir des dernières données publiées. Ce n'est pas un conseil en investissement.",
    strongBuy: "Achat fort", buy: "Achat", hold: "Conserver", sell: "Vente", strongSell: "Vente forte",
  },
};

/* ------------------------------------------------------------------ */

function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm", className)}>
      <h3 className="flex items-center gap-2 text-base font-semibold text-text mb-4">
        <span className="text-pv-blue">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-text-3">{label}</span>
      <span className={cn("text-sm font-semibold font-mono tabular-nums", tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-text")}>
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface-2/60 border border-border/70 rounded-xl p-3.5">
      <div className="text-xs font-medium text-text-3 mb-1">{label}</div>
      <div className="text-lg font-semibold text-text font-mono tabular-nums leading-tight">{value}</div>
      {sub && <div className="text-xs text-text-3 mt-0.5">{sub}</div>}
    </div>
  );
}

function RangeBar({ label, low, high, current, ccy }: { label: string; low: any; high: any; current: any; ccy?: string | null }) {
  const ok = isNum(low) && isNum(high) && isNum(current) && high > low;
  const pos = ok ? Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-text-3 mb-1.5">
        <span>{label}</span>
        {ok && <span className="font-mono">{pos.toFixed(0)}%</span>}
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
        {ok && <div className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-text shadow" style={{ left: `calc(${pos}% - 8px)` }} />}
      </div>
      <div className="flex justify-between text-xs font-mono text-text-2 mt-1.5">
        <span>{money(low, ccy)}</span>
        <span>{money(high, ccy)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface StockAnalysisProps {
  quote: any;
  profile: any;
  ratios: any;
  income: any[];
  balance: any[];
  cashFlow: any[];
  recommendation?: any[];
  peers?: string[];
  news?: any[];
  language?: string;
  onSelectSymbol?: (sym: string) => void;
}

export function StockAnalysis({ quote, profile, ratios, income, balance, cashFlow, recommendation, peers, news, language = "en", onSelectSymbol }: StockAnalysisProps) {
  const t = L[language] || L.en;
  const r = ratios || {};
  const ccy = quote?.currency || r.currency || profile?.currency || "USD";
  const price = isNum(quote?.price) ? quote.price : null;

  // Statements arrive newest first; build chronological rows with YoY growth & margins
  const rows = useMemo(() => {
    const inc = [...(income || [])].slice(0, 6).reverse();
    return inc.map((row, i) => {
      const prev = i > 0 ? inc[i - 1] : null;
      const cf = (cashFlow || []).find((c) => c.calendarYear === row.calendarYear);
      const prevCf = prev ? (cashFlow || []).find((c) => c.calendarYear === prev.calendarYear) : null;
      const rev = row.revenue;
      return {
        period: row.calendarYear,
        revenue: rev,
        netIncome: row.netIncome,
        eps: row.eps,
        fcf: cf?.freeCashFlow,
        revenueG: prev ? growth(rev, prev.revenue) : null,
        netIncomeG: prev ? growth(row.netIncome, prev.netIncome) : null,
        epsG: prev ? growth(row.eps, prev.eps) : null,
        fcfG: prev && cf && prevCf ? growth(cf.freeCashFlow, prevCf.freeCashFlow) : null,
        grossMargin: isNum(rev) && rev !== 0 && isNum(row.grossProfit) ? (row.grossProfit / rev) * 100 : null,
        operatingMargin: isNum(rev) && rev !== 0 && isNum(row.operatingIncome) ? (row.operatingIncome / rev) * 100 : null,
        netMargin: isNum(rev) && rev !== 0 && isNum(row.netIncome) ? (row.netIncome / rev) * 100 : null,
      };
    });
  }, [income, cashFlow]);

  const latestInc = income?.[0];
  const latestBal = balance?.[0];
  const latestCf = cashFlow?.[0];

  // Quality checklist - each criterion is null when the underlying data is missing
  const debtToEquity = isNum(r.debtEquityRatioTTM)
    ? r.debtEquityRatioTTM
    : isNum(latestBal?.totalDebt) && isNum(latestBal?.totalStockholdersEquity) && latestBal.totalStockholdersEquity > 0
      ? (latestBal.totalDebt / latestBal.totalStockholdersEquity) * 100
      : null;
  const lastGrowth = rows.length > 1 ? rows[rows.length - 1].revenueG : null;
  const checks: { label: string; ok: boolean | null }[] = [
    { label: t.c1, ok: isNum(latestInc?.netIncome) ? latestInc.netIncome > 0 : null },
    { label: t.c2, ok: isNum(latestCf?.freeCashFlow) ? latestCf.freeCashFlow > 0 : isNum(r.freeCashflow) ? r.freeCashflow > 0 : null },
    { label: t.c3, ok: isNum(lastGrowth) ? lastGrowth > 0 : isNum(r.revenueGrowth) ? r.revenueGrowth > 0 : null },
    { label: t.c4, ok: isNum(debtToEquity) ? debtToEquity < 100 : null },
    { label: t.c5, ok: isNum(r.currentRatioTTM) ? r.currentRatioTTM > 1 : null },
    { label: t.c6, ok: isNum(r.netProfitMarginTTM) ? r.netProfitMarginTTM > 10 : null },
    { label: t.c7, ok: isNum(r.returnOnEquityTTM) ? r.returnOnEquityTTM > 15 : null },
    { label: t.c8, ok: isNum(price) && isNum(r.twoHundredDayAverage) ? price > r.twoHundredDayAverage : null },
  ];
  const evaluated = checks.filter((c) => c.ok !== null);
  const passed = evaluated.filter((c) => c.ok).length;

  // Analyst data
  const upside = isNum(price) && isNum(r.targetMeanPrice) && price > 0 ? ((r.targetMeanPrice - price) / price) * 100 : null;
  const rec = Array.isArray(recommendation) && recommendation.length > 0 ? recommendation[0] : null;
  const recParts = rec
    ? [
        { k: "strongBuy", v: rec.strongBuy || 0, c: "bg-emerald-600" },
        { k: "buy", v: rec.buy || 0, c: "bg-emerald-400" },
        { k: "hold", v: rec.hold || 0, c: "bg-amber-400" },
        { k: "sell", v: rec.sell || 0, c: "bg-rose-400" },
        { k: "strongSell", v: rec.strongSell || 0, c: "bg-rose-600" },
      ]
    : [];
  const recTotal = recParts.reduce((a, b) => a + b.v, 0);

  const divYield = isNum(r.dividendYieldTTM) ? r.dividendYieldTTM : null;

  return (
    <div className="space-y-6">
      {/* KEY STATS */}
      <Card title={t.keyStats} icon={<BarChart2 size={18} />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label={t.marketCap} value={big(quote?.marketCap ?? r.marketCapTTM)} />
          <Stat label={t.pe} value={mult(quote?.pe ?? r.priceEarningsRatioTTM)} />
          <Stat label={t.fpe} value={mult(r.priceToEarningsRatioForward)} />
          <Stat label={t.eps} value={money(quote?.eps ?? r.trailingEps, ccy)} sub={isNum(r.forwardEps) ? `Fwd ${money(r.forwardEps, ccy)}` : undefined} />
          <Stat label={t.beta} value={num(r.beta ?? profile?.beta)} />
          <Stat label={t.divYield} value={pct(divYield)} />
          <Stat label={t.volume} value={big(quote?.volume)} />
          <Stat label={t.avgVolume} value={big(quote?.avgVolume ?? r.averageVolume)} />
          <Stat label={t.shares} value={big(r.sharesOutstanding)} />
          <Stat label={t.ev} value={mult(r.enterpriseValueMultipleTTM)} />
          <Stat label={t.change52} value={signedPct(r.week52Change)} />
          <Stat label={t.revGrowth} value={signedPct(r.revenueGrowth)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RangeBar label={t.dayRange} low={quote?.dayLow} high={quote?.dayHigh} current={price} ccy={ccy} />
          <RangeBar label={t.range52} low={quote?.yearLow ?? r.fiftyTwoWeekLow} high={quote?.yearHigh ?? r.fiftyTwoWeekHigh} current={price} ccy={ccy} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm text-text-3">
          <span>{t.ma50}: <b className="text-text font-mono">{money(r.fiftyDayAverage, ccy)}</b></span>
          <span>{t.ma200}: <b className="text-text font-mono">{money(r.twoHundredDayAverage, ccy)}</b></span>
        </div>
      </Card>

      {/* RATIO PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title={t.valuation} icon={<Scale size={18} />}>
          <Row label={t.pe} value={mult(r.priceEarningsRatioTTM ?? quote?.pe)} />
          <Row label={t.fpe} value={mult(r.priceToEarningsRatioForward)} />
          <Row label={t.peg} value={num(r.pegRatioTTM)} />
          <Row label={t.ps} value={mult(r.priceToSalesRatioTTM)} />
          <Row label={t.pb} value={mult(r.priceToBookRatioTTM)} />
          <Row label={t.evs} value={mult(r.evToSalesTTM)} />
          <Row label={t.ey} value={pct(r.earningsYieldTTM)} />
        </Card>
        <Card title={t.profitability} icon={<Percent size={18} />}>
          <Row label={t.gm} value={pct(r.grossProfitMarginTTM)} />
          <Row label={t.om} value={pct(r.operatingProfitMarginTTM)} />
          <Row label={t.nm} value={pct(r.netProfitMarginTTM)} tone={isNum(r.netProfitMarginTTM) ? (r.netProfitMarginTTM >= 0 ? "up" : "down") : null} />
          <Row label={t.ebm} value={pct(r.ebitdaMarginTTM)} />
          <Row label={t.roe} value={pct(r.returnOnEquityTTM)} />
          <Row label={t.roa} value={pct(r.returnOnAssetsTTM)} />
          <Row label={t.earnGrowth} value={signedPct(r.earningsGrowth)} tone={isNum(r.earningsGrowth) ? (r.earningsGrowth >= 0 ? "up" : "down") : null} />
        </Card>
        <Card title={t.health} icon={<ShieldCheck size={18} />}>
          <Row label={t.cr} value={num(r.currentRatioTTM)} />
          <Row label={t.qr} value={num(r.quickRatioTTM)} />
          <Row label={t.de} value={pct(debtToEquity, 1)} />
          <Row label={t.cash} value={big(r.totalCash ?? latestBal?.cashAndCashEquivalents)} />
          <Row label={t.debt} value={big(r.totalDebt ?? latestBal?.totalDebt)} />
          <Row label={t.fcf} value={big(r.freeCashflow)} tone={isNum(r.freeCashflow) ? (r.freeCashflow >= 0 ? "up" : "down") : null} />
        </Card>
        <Card title={t.dividends} icon={<Coins size={18} />}>
          <Row label={t.divYield} value={pct(divYield)} />
          <Row label={t.divRate} value={money(r.dividendRate, ccy)} />
          <Row label={t.payout} value={pct(r.payoutRatio, 1)} />
          <Row label={t.insiders} value={pct(r.heldPercentInsiders, 1)} />
          <Row label={t.institutions} value={pct(r.heldPercentInstitutions, 1)} />
          <Row label={t.short} value={pct(r.shortPercentOfFloat, 1)} />
        </Card>
      </div>

      {/* GROWTH & MARGINS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card title={t.growthTitle} icon={<Activity size={18} />} className="xl:col-span-3">
          {rows.length === 0 ? (
            <p className="text-sm text-text-3">{t.noData}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-text-3 border-b border-border">
                    <th className="py-2 pr-3 font-semibold">{t.period}</th>
                    <th className="py-2 px-3 font-semibold text-right">{t.revenue}</th>
                    <th className="py-2 px-3 font-semibold text-right">{t.netIncome}</th>
                    <th className="py-2 px-3 font-semibold text-right">{t.epsShort}</th>
                    <th className="py-2 pl-3 font-semibold text-right">{t.fcfShort}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows].reverse().map((row) => (
                    <tr key={row.period} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-text">{row.period}</td>
                      {([["revenue", "revenueG"], ["netIncome", "netIncomeG"], ["eps", "epsG"], ["fcf", "fcfG"]] as const).map(([k, g]) => (
                        <td key={k} className="py-2.5 px-3 text-right">
                          <div className="font-mono font-semibold text-text tabular-nums">{k === "eps" ? num((row as any)[k]) : big((row as any)[k])}</div>
                          <div className={cn("text-xs font-mono", !isNum((row as any)[g]) ? "text-text-4" : (row as any)[g] >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            {isNum((row as any)[g]) ? signedPct((row as any)[g]) : "-"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title={t.marginsTrend} icon={<Percent size={18} />} className="xl:col-span-2">
          {rows.length === 0 ? (
            <p className="text-sm text-text-3">{t.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip formatter={(v: any) => (isNum(Number(v)) ? `${Number(v).toFixed(2)}%` : "-")} contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Line type="monotone" dataKey="grossMargin" name={t.gm} stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="operatingMargin" name={t.om} stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="netMargin" name={t.nm} stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* CHECKLIST + ANALYSTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title={t.checklist} icon={<ShieldCheck size={18} />}>
          {evaluated.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-semibold text-text font-mono">{passed}/{evaluated.length}</div>
              <div className="text-sm text-text-3">{t.passed}</div>
              <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(passed / evaluated.length) * 100}%` }} />
              </div>
            </div>
          )}
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                {c.ok === null ? <MinusCircle size={18} className="text-text-4 shrink-0" /> : c.ok ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> : <XCircle size={18} className="text-rose-500 shrink-0" />}
                <span className={c.ok === null ? "text-text-4" : "text-text"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-3 mt-4">{t.disclaimer}</p>
        </Card>

        <Card title={t.analysts} icon={<Target size={18} />}>
          {!isNum(r.targetMeanPrice) && recTotal === 0 ? (
            <p className="text-sm text-text-3">{t.noData}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <Stat label={t.target} value={money(r.targetMeanPrice, ccy)} sub={isNum(r.numberOfAnalystOpinions) ? `${r.numberOfAnalystOpinions} ${t.opinions}` : undefined} />
                <Stat label={t.upside} value={signedPct(upside)} />
                <Stat label={t.targetRange} value={isNum(r.targetLowPrice) && isNum(r.targetHighPrice) ? `${money(r.targetLowPrice, ccy)} - ${money(r.targetHighPrice, ccy)}` : "-"} />
                <Stat label={t.recommendation} value={r.recommendationKey ? String(r.recommendationKey).replace(/_/g, " ").toUpperCase() : "-"} sub={isNum(r.recommendationMean) ? `${r.recommendationMean.toFixed(2)} / 5` : undefined} />
              </div>
              {recTotal > 0 && (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden mb-2">
                    {recParts.map((p) => p.v > 0 && <div key={p.k} className={p.c} style={{ width: `${(p.v / recTotal) * 100}%` }} />)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-3">
                    {recParts.map((p) => (
                      <span key={p.k} className="flex items-center gap-1.5">
                        <span className={cn("w-2.5 h-2.5 rounded-full", p.c)} /> {t[p.k]} <b className="text-text">{p.v}</b>
                      </span>
                    ))}
                    {rec?.period && <span className="ml-auto">{rec.period}</span>}
                  </div>
                </>
              )}
            </>
          )}
        </Card>
      </div>

      {/* PEERS + NEWS */}
      {((peers && peers.length > 0) || (news && news.length > 0)) && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {peers && peers.length > 0 && (
            <Card title={t.peers} icon={<Users size={18} />}>
              <div className="flex flex-wrap gap-2">
                {peers.filter((p) => p && p !== quote?.symbol).slice(0, 12).map((p) => (
                  <button
                    key={p}
                    onClick={() => onSelectSymbol?.(p)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-sm font-semibold text-text hover:border-pv-blue hover:text-pv-blue transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Card>
          )}
          {news && news.length > 0 && (
            <Card title={t.news} icon={<Newspaper size={18} />} className={peers && peers.length > 0 ? "xl:col-span-2" : "xl:col-span-3"}>
              <ul className="divide-y divide-border/60">
                {news.slice(0, 6).map((n: any, i: number) => (
                  <li key={n.id || i}>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="block py-3 group">
                      <div className="text-sm font-semibold text-text group-hover:text-pv-blue transition-colors">{n.headline}</div>
                      <div className="text-xs text-text-3 mt-1">
                        {n.source}
                        {isNum(n.datetime) && ` · ${new Date(n.datetime * 1000).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}`}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
