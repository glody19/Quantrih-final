import React, { useEffect, useMemo, useState } from "react";
import { runBacktest } from "../../engine";
import type { BacktestOptions, BacktestResult, Portfolio } from "../../engine/types";
import { cn } from "../../lib/utils";

type Lang = "fr" | "en";

/** The portfolios and options of the last backtest, so they can be run again with other fees or rebalancing rules. */
export interface CostLabBase {
  portfolios: Portfolio[];
  options: BacktestOptions;
}

const money = (v: number, lang: Lang, currency: string) =>
  new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
const pct = (v: number, lang: Lang, d = 1) => {
  const s = (v * 100).toFixed(d);
  return (lang === "fr" ? s.replace(".", ",") : s) + (lang === "fr" ? " %" : "%");
};
const num = (v: number, lang: Lang, d = 2) => (lang === "fr" ? v.toFixed(d).replace(".", ",") : v.toFixed(d));

const NO_FEES: Partial<BacktestOptions> = { annualFeeRate: 0, transactionFeeAmount: 0, tradingCostRate: 0 };

function useRuns(base: CostLabBase | null, jobs: { key: string; portfolios: Portfolio[]; options: Partial<BacktestOptions> }[] | null) {
  const [out, setOut] = useState<Record<string, BacktestResult[]> | null>(null);
  const [error, setError] = useState(false);
  const sig = jobs ? jobs.map((j) => j.key).join("|") : "";
  useEffect(() => {
    if (!base || !jobs || !jobs.length) return;
    let alive = true;
    setOut(null);
    setError(false);
    // One run after the other: the prices are cached after the first one, so this stays quick
    (async () => {
      const acc: Record<string, BacktestResult[]> = {};
      for (const j of jobs) {
        acc[j.key] = await runBacktest(j.portfolios, { ...base.options, benchmarkId: undefined, ...j.options });
        if (!alive) return;
      }
      setOut(acc);
    })().catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, sig]);
  return { out, error };
}

function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string; disabled?: boolean }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3" role="tablist">
      {items.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          disabled={c.disabled}
          aria-selected={c.id === value}
          onClick={() => onChange(c.id)}
          className={cn(
            "px-3 py-1 rounded-full text-[12.5px] transition-colors ring-1 bg-white disabled:opacity-40",
            c.id === value ? "ring-slate-800 text-slate-900 font-semibold" : "ring-slate-200 text-slate-500 hover:text-slate-900 hover:ring-slate-300",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

const Loading = ({ lang }: { lang: Lang }) => (
  <p className="text-[13px] text-slate-400 py-3">{lang === "fr" ? "Calcul en cours..." : "Calculating..."}</p>
);
const Failed = ({ lang }: { lang: Lang }) => (
  <p className="text-[13px] text-slate-400 py-3">{lang === "fr" ? "Calcul impossible pour le moment." : "Could not calculate right now."}</p>
);

function Dot({ color }: { color?: string }) {
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color || "#94A3B8" }} />;
}

/** What the fees really cost: the final value without any fee minus the final value with them. */
function FeeCost({ base, lang, currency, colors }: { base: CostLabBase; lang: Lang; currency: string; colors: Record<string, string> }) {
  const fr = lang === "fr";
  const o = base.options;
  const hasOwn = (o.annualFeeRate || 0) > 0 || (o.transactionFeeAmount || 0) > 0 || (o.tradingCostRate || 0) > 0;
  type S = "own" | "etf" | "bank";
  const [scenario, setScenario] = useState<S>(hasOwn ? "own" : "bank");
  useEffect(() => setScenario(hasOwn ? "own" : "bank"), [base, hasOwn]);

  const withFees: Partial<BacktestOptions> =
    scenario === "own" ? {} : { ...NO_FEES, annualFeeRate: scenario === "etf" ? 0.002 : 0.015 };
  const jobs = useMemo(
    () => [
      { key: "free", portfolios: base.portfolios, options: NO_FEES },
      { key: `fees-${scenario}`, portfolios: base.portfolios, options: withFees },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, scenario],
  );
  const { out, error } = useRuns(base, jobs);
  const free = out?.free;
  const paid = out?.[`fees-${scenario}`];

  const ownLabel = fr ? "Vos frais" : "Your fees";
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[15px] font-semibold text-slate-900">{fr ? "Ce que coûtent vraiment les frais" : "What fees really cost"}</h3>
        <span className="text-[12px] text-slate-500">{fr ? "Même période, même portefeuille, avec et sans frais" : "Same period, same portfolio, with and without fees"}</span>
      </div>
      <Chips<S>
        value={scenario}
        onChange={setScenario}
        items={[
          { id: "own", label: ownLabel, disabled: !hasOwn },
          { id: "etf", label: fr ? "ETF indiciel, 0,2 % par an" : "Index ETF, 0.2% a year" },
          { id: "bank", label: fr ? "Fonds de banque, 1,5 % par an" : "Bank fund, 1.5% a year" },
        ]}
      />
      {error ? (
        <Failed lang={lang} />
      ) : !free || !paid ? (
        <Loading lang={lang} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr>
                  <th>{fr ? "Portefeuille" : "Portfolio"}</th>
                  <th className="text-right">{fr ? "Sans frais" : "Without fees"}</th>
                  <th className="text-right">{fr ? "Avec ces frais" : "With these fees"}</th>
                  <th className="text-right">{fr ? "Coût réel" : "Real cost"}</th>
                  {!o.inflationAdjusted && <th className="text-right">{fr ? "dont frais payés" : "of which fees paid"}</th>}
                  <th className="text-right">{fr ? "Part perdue" : "Share lost"}</th>
                </tr>
              </thead>
              <tbody>
                {base.portfolios.map((p, i) => {
                  const a = free.find((r) => r.portfolioId === p.id);
                  const b = paid.find((r) => r.portfolioId === p.id);
                  if (!a || !b || !a.equityCurve.length) return null;
                  const cost = a.metrics.endBalance - b.metrics.endBalance;
                  return (
                    <tr key={p.id + i}>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <Dot color={colors[p.name]} />
                          {p.name}
                        </span>
                      </td>
                      <td className="text-right tabular-nums">{money(a.metrics.endBalance, lang, currency)}</td>
                      <td className="text-right tabular-nums">{money(b.metrics.endBalance, lang, currency)}</td>
                      <td className="text-right tabular-nums font-semibold text-slate-900">{money(cost, lang, currency)}</td>
                      {!o.inflationAdjusted && <td className="text-right tabular-nums text-slate-500">{money(b.metrics.feesPaid || 0, lang, currency)}</td>}
                      <td className="text-right tabular-nums">{a.metrics.endBalance > 0 ? pct(cost / a.metrics.endBalance, lang) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-500 mt-2 max-w-[900px]">
            {fr
              ? "Le coût réel comprend les frais payés et ce que cet argent aurait rapporté s'il était resté investi. Les frais annuels sont prélevés chaque mois ; les frais de courtage à chaque achat et rééquilibrage."
              : "The real cost includes the fees paid and what that money would have earned had it stayed invested. Yearly fees are taken monthly; broker fees on each purchase and rebalance."}
          </p>
        </>
      )}
    </div>
  );
}

type RuleId = "own" | "none" | "monthly" | "quarterly" | "annually" | "band5" | "band10";
const RULES: { id: Exclude<RuleId, "own">; fr: string; en: string; opts: Partial<BacktestOptions> }[] = [
  { id: "none", fr: "Jamais", en: "Never", opts: { rebalanceFrequency: "none", rebalanceThreshold: 0 } },
  { id: "monthly", fr: "Chaque mois", en: "Monthly", opts: { rebalanceFrequency: "monthly", rebalanceThreshold: 0 } },
  { id: "quarterly", fr: "Chaque trimestre", en: "Quarterly", opts: { rebalanceFrequency: "quarterly", rebalanceThreshold: 0 } },
  { id: "annually", fr: "Chaque année", en: "Yearly", opts: { rebalanceFrequency: "annually", rebalanceThreshold: 0 } },
  { id: "band5", fr: "Écart de 5 points", en: "5-point drift", opts: { rebalanceFrequency: "none", rebalanceThreshold: 0.05 } },
  { id: "band10", fr: "Écart de 10 points", en: "10-point drift", opts: { rebalanceFrequency: "none", rebalanceThreshold: 0.1 } },
];

/** Same portfolio under every rebalancing rule, with the user's own fees, to see which rule pays. */
function RebalanceGrid({ base, lang, currency, colors }: { base: CostLabBase; lang: Lang; currency: string; colors: Record<string, string> }) {
  const fr = lang === "fr";
  const own = base.options;
  const multi = base.portfolios.filter((p) => p.allocations.length > 1);
  const [pid, setPid] = useState<string>(multi[0]?.id || "");
  useEffect(() => {
    if (!multi.some((p) => p.id === pid)) setPid(multi[0]?.id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);
  const portfolio = multi.find((p) => p.id === pid);

  const ownMatch = RULES.find(
    (r) => r.opts.rebalanceFrequency === own.rebalanceFrequency && (r.opts.rebalanceThreshold || 0) === (own.rebalanceThreshold || 0),
  )?.id;
  const rules = useMemo(() => {
    const list: { id: RuleId; label: string; opts: Partial<BacktestOptions> }[] = RULES.map((r) => ({ id: r.id, label: fr ? r.fr : r.en, opts: r.opts }));
    if (!ownMatch) list.unshift({ id: "own", label: fr ? "Vos réglages" : "Your settings", opts: {} });
    return list;
  }, [fr, ownMatch]);

  const jobs = useMemo(
    () => (portfolio ? rules.map((r) => ({ key: `${portfolio.id}-${r.id}`, portfolios: [portfolio], options: r.opts })) : null),
    [portfolio, rules],
  );
  const { out, error } = useRuns(base, jobs);
  if (!multi.length) return null;

  const rows = out && portfolio ? rules.map((r) => ({ r, res: out[`${portfolio.id}-${r.id}`]?.[0] })).filter((x) => x.res && x.res.equityCurve.length) : [];
  const best = (f: (m: BacktestResult["metrics"]) => number) => (rows.length ? Math.max(...rows.map((x) => f(x.res!.metrics))) : NaN);
  const bestCagr = best((m) => m.cagr);
  const bestSharpe = best((m) => m.sharpeRatio);
  const bestDd = best((m) => -Math.abs(m.maxDrawdown));
  const strong = (on: boolean) => (on ? "font-semibold text-slate-900" : "");

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[15px] font-semibold text-slate-900">{fr ? "Grille de rééquilibrage" : "Rebalancing grid"}</h3>
        <span className="text-[12px] text-slate-500">{fr ? "Même portefeuille, chaque règle de rééquilibrage, avec vos frais" : "Same portfolio, every rebalancing rule, with your fees"}</span>
      </div>
      {multi.length > 1 && <Chips value={pid} onChange={setPid} items={multi.map((p) => ({ id: p.id, label: p.name }))} />}
      {error ? (
        <Failed lang={lang} />
      ) : !out ? (
        <Loading lang={lang} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr>
                  <th>
                    <span className="inline-flex items-center gap-2">
                      {portfolio && <Dot color={colors[portfolio.name]} />}
                      {fr ? "Rééquilibrer" : "Rebalance"}
                    </span>
                  </th>
                  <th className="text-right">{fr ? "Rendement annuel" : "Annual return"}</th>
                  <th className="text-right">{fr ? "Volatilité" : "Volatility"}</th>
                  <th className="text-right">{fr ? "Perte max." : "Max. loss"}</th>
                  <th className="text-right">Sharpe</th>
                  <th className="text-right">{fr ? "Valeur finale" : "Final value"}</th>
                  <th className="text-right">{fr ? "Rééquilibrages" : "Rebalances"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ r, res }) => {
                  const m = res!.metrics;
                  const mine = r.id === "own" || r.id === ownMatch;
                  return (
                    <tr key={r.id}>
                      <td>
                        {r.label}
                        {mine && r.id !== "own" && <span className="ml-2 text-[11px] text-slate-400">{fr ? "vos réglages" : "your settings"}</span>}
                      </td>
                      <td className={cn("text-right tabular-nums", strong(m.cagr === bestCagr))}>{pct(m.cagr, lang, 2)}</td>
                      <td className="text-right tabular-nums">{pct(m.volatility, lang)}</td>
                      <td className={cn("text-right tabular-nums", strong(-Math.abs(m.maxDrawdown) === bestDd))}>{Math.abs(m.maxDrawdown) > 0 ? "-" : ""}{pct(Math.abs(m.maxDrawdown), lang)}</td>
                      <td className={cn("text-right tabular-nums", strong(m.sharpeRatio === bestSharpe))}>{num(m.sharpeRatio, lang)}</td>
                      <td className="text-right tabular-nums">{money(m.endBalance, lang, currency)}</td>
                      <td className="text-right tabular-nums">{m.rebalanceCount ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-500 mt-2 max-w-[900px]">
            {fr
              ? "En gras, le meilleur résultat de chaque colonne. Une règle par écart rééquilibre seulement quand un actif s'éloigne de sa cible de plus de 5 ou 10 points : moins d'opérations, donc moins de frais."
              : "In bold, the best result of each column. A drift rule only rebalances when an asset moves more than 5 or 10 points from its target: fewer trades, so fewer fees."}
          </p>
        </>
      )}
    </div>
  );
}

/** Fee cost and rebalancing grid, under the crisis tests of a backtest report. */
export function CostLab({ base, language, currency = "USD", results }: { base: CostLabBase | null; language?: string; currency?: string; results: { name: string; color?: string }[] }) {
  const lang: Lang = language === "fr" ? "fr" : "en";
  const colors = useMemo(() => Object.fromEntries(results.map((r) => [r.name, r.color || ""])), [results]);
  if (!base || !base.portfolios.length) return null;
  return (
    <section className="mb-10 text-left">
      <FeeCost base={base} lang={lang} currency={currency} colors={colors} />
      <RebalanceGrid base={base} lang={lang} currency={currency} colors={colors} />
    </section>
  );
}
