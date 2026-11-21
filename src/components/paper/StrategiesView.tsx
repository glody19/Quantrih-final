import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CalendarClock, Plus, Search, Trash2, Zap, Scale, PenLine, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { usePaper, useFormat, k, Badge, Seg, Empty } from "./ctx";
import { STRATEGIES, MOMENTUM_POOL } from "./strategies";
import { BY_SYMBOL, CLASS_COLORS, describe, UNIVERSE } from "./universe";
import { fill, fmtQty, missingCash, planOrders, month, type Account, type Plan, type Quote } from "./engine";

type W = { symbol: string; weight: number };
const CUSTOM_KEY = "quantrih_paper_custom";
const readCustom = (): W[] => { try { const v = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "null"); return Array.isArray(v) && v.length ? v : [{ symbol: "VWCE.DE", weight: 70 }, { symbol: "EUNH.DE", weight: 20 }, { symbol: "4GLD.DE", weight: 10 }]; } catch { return []; } };

/** One year of daily closes, used by the momentum and inverse-volatility strategies. */
async function closes(symbol: string): Promise<number[]> {
  try {
    const r = await fetch(`/api/stock/history/${encodeURIComponent(symbol)}?range=1y&interval=1d`);
    if (!r.ok) return [];
    const d = await r.json();
    return (Array.isArray(d) ? d : []).map((b: { close: number }) => b.close).filter((v: number) => Number.isFinite(v) && v > 0);
  } catch { return []; }
}
const vol = (c: number[]) => {
  const r = c.slice(1).map((v, i) => Math.log(v / c[i]));
  const m = r.reduce((a, b) => a + b, 0) / (r.length || 1);
  return Math.sqrt((r.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, r.length - 1)) * 252);
};

/** Executes planned orders one by one; an order that no longer fits the cash is skipped. */
export function runOrders(a: Account, orders: ReturnType<typeof planOrders>["orders"]): { acct: Account; done: number; skipped: string[] } {
  let acct = a; let done = 0; const skipped: string[] = [];
  for (const o of orders) {
    if (o.side === "buy" && missingCash(acct, o.costs)) { skipped.push(o.symbol); continue; }
    acct = fill(acct, o.symbol, o.inst.n, o.inst, o.side, o.qty, o.price, o.rate, "STRAT"); done++;
  }
  return { acct, done, skipped };
}

export function StrategiesView() {
  const P = usePaper();
  const { L, acct, quotes, rateOf } = P;
  const F = useFormat();
  const [sel, setSel] = useState<string>(() => {
    try { const p = localStorage.getItem("quantrih_vp_pending_model"); if (p && STRATEGIES.some((s) => s.id === p)) { localStorage.removeItem("quantrih_vp_pending_model"); return p; } } catch { /* storage unavailable */ }
    return "classic-60-40";
  });
  const [custom, setCustom] = useState<W[]>(readCustom);
  const [dyn, setDyn] = useState<{ id: string; weights: W[]; info: Record<string, number> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"invest" | "rebalance">("invest");
  const [amountIn, setAmountIn] = useState("10000");
  const [q2, setQ2] = useState("");
  const [planDay, setPlanDay] = useState("5");
  const [planAmt, setPlanAmt] = useState("500");
  const [planDeposit, setPlanDeposit] = useState(true);

  useEffect(() => { try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)); } catch { /* storage unavailable */ } }, [custom]);

  const preset = STRATEGIES.find((s) => s.id === sel);
  const weights: W[] = preset ? preset.holdings : sel === "custom" ? custom.filter((w) => w.weight > 0) : dyn?.id === sel ? dyn.weights : [];
  const name = preset ? preset.name : sel === "custom" ? L("Ma stratégie", "My strategy") : sel === "momentum" ? L("Momentum 6 mois", "6-month momentum") : L("Parité de risque", "Risk parity");

  // dynamic strategies are computed from one year of real prices
  useEffect(() => {
    if (sel !== "momentum" && sel !== "invvol") return;
    let alive = true;
    setBusy(true);
    const pool = sel === "momentum" ? MOMENTUM_POOL : custom.map((w) => w.symbol);
    Promise.all(pool.map(async (s) => [s, await closes(s)] as const)).then((rows) => {
      if (!alive) return;
      const ok = rows.filter(([, c]) => c.length > 130);
      if (sel === "momentum") {
        const perf = ok.map(([s, c]) => [s, c[c.length - 1] / c[c.length - 127] - 1] as const).sort((a, b) => b[1] - a[1]);
        const cashRet = perf.find(([s]) => s === "XEON.DE")?.[1] ?? 0;
        // dual momentum: the three strongest ETFs, each replaced by money market if it does worse than cash
        const top = perf.filter(([s]) => s !== "XEON.DE").slice(0, 3).map(([s, r]) => (r > cashRet ? s : "XEON.DE"));
        const agg: Record<string, number> = {}; top.forEach((s) => { agg[s] = (agg[s] || 0) + 100 / 3; });
        setDyn({ id: sel, weights: Object.entries(agg).map(([symbol, weight]) => ({ symbol, weight: +weight.toFixed(2) })), info: Object.fromEntries(perf.map(([s, r]) => [s, r * 100])) });
      } else {
        const v = ok.map(([s, c]) => [s, vol(c)] as const).filter(([, x]) => x > 0);
        const inv = v.reduce((a, [, x]) => a + 1 / x, 0);
        setDyn({ id: sel, weights: v.map(([symbol, x]) => ({ symbol, weight: +((100 / x) / inv).toFixed(2) })), info: Object.fromEntries(v.map(([s, x]) => [s, x * 100])) });
      }
    }).finally(() => alive && setBusy(false));
    return () => { alive = false; };
  }, [sel, custom]);

  const syms = useMemo(() => Array.from(new Set([...weights.map((w) => w.symbol), ...custom.map((w) => w.symbol)])), [weights, custom]);
  useEffect(() => { P.track(syms); }, [syms.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const amount = parseFloat(amountIn.replace(/\s/g, "").replace(",", ".")) || 0;
  const plan = useMemo(() => planOrders(acct, weights, mode === "invest" ? amount : Math.max(0, amount), mode, quotes, rateOf), [acct, weights, amount, mode, quotes, rateOf]);
  const tot = plan.orders.reduce((a, o) => ({ buy: a.buy + (o.side === "buy" ? o.costs.totalEur : 0), sell: a.sell + (o.side === "sell" ? o.costs.totalEur : 0), fees: a.fees + o.costs.commission + o.costs.fxFee + o.costs.tax }), { buy: 0, sell: 0, fees: 0 });
  const totalW = weights.reduce((a, w) => a + w.weight, 0);
  const ter = weights.reduce((a, w) => a + ((BY_SYMBOL[w.symbol]?.ter ?? 0) * w.weight) / (totalW || 1), 0);
  const cashAfter = (acct.cash.EUR || 0) - tot.buy + tot.sell;

  const execute = () => {
    if (!P.requireUser() || !plan.orders.length) return;
    const res = runOrders(acct, plan.orders);
    P.setAcct(res.acct);
    P.notify(res.skipped.length ? L(`${res.done} ordres exécutés, ${res.skipped.length} ignorés faute de liquidités (${res.skipped.join(", ")}).`, `${res.done} orders filled, ${res.skipped.length} skipped for lack of cash (${res.skipped.join(", ")}).`) : L(`${res.done} ordres exécutés : ${name}.`, `${res.done} orders filled: ${name}.`), !res.skipped.length);
  };

  const addPlan = () => {
    if (!P.requireUser() || !weights.length) return;
    const p: Plan = { id: Date.now(), name, weights, amount: parseFloat(planAmt.replace(",", ".")) || 0, day: Math.min(28, Math.max(1, parseInt(planDay) || 1)), deposit: planDeposit, lastRun: null, active: true };
    if (p.amount <= 0) return;
    P.setAcct((a) => ({ ...a, plans: [...a.plans, p] }));
    P.notify(L(`Versement programmé créé : ${F.eur(p.amount, 0)} le ${p.day} de chaque mois.`, `Recurring plan created: ${F.eur(p.amount, 0)} on day ${p.day} of each month.`));
  };

  // search to add a line to the custom strategy
  const [hits, setHits] = useState<{ symbol: string; label: string }[]>([]);
  useEffect(() => {
    const q = q2.trim(); if (q.length < 2) { setHits([]); return; }
    const local = UNIVERSE.filter((i) => i.s.toLowerCase().includes(q.toLowerCase()) || i.n.toLowerCase().includes(q.toLowerCase())).slice(0, 6).map((i) => ({ symbol: i.s, label: i.n }));
    setHits(local);
    const id = setTimeout(() => fetch(`/api/stock/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => setHits([...local, ...(d.result || []).filter((h: { symbol: string }) => !local.some((l) => l.symbol === h.symbol)).slice(0, 5)])).catch(() => {}), 250);
    return () => clearTimeout(id);
  }, [q2]);

  const cards = [
    ...STRATEGIES.map((s) => ({ id: s.id, name: s.name, by: s.author, risk: s.risk, icon: null as React.ReactNode, n: s.holdings.length })),
    { id: "momentum", name: L("Momentum 6 mois", "6-month momentum"), by: L("Dynamique", "Dynamic"), risk: 4 as const, icon: <Zap size={14} />, n: 3 },
    { id: "invvol", name: L("Parité de risque", "Risk parity"), by: L("Inverse volatilité", "Inverse volatility"), risk: 3 as const, icon: <Scale size={14} />, n: custom.length },
    { id: "custom", name: L("Ma stratégie", "My strategy"), by: L("Personnalisée", "Custom"), risk: 3 as const, icon: <PenLine size={14} />, n: custom.length },
  ];
  const desc = preset ? (P.fr ? preset.fr : preset.en)
    : sel === "momentum" ? L("Chaque mois, les trois ETF les plus performants sur 6 mois parmi 11 classes d'actifs (actions US, Europe, émergents, petites capitalisations, immobilier, obligations, or, matières premières). Un ETF qui fait moins bien que le monétaire est remplacé par le monétaire (momentum absolu).", "Each month, the three best ETFs over 6 months among 11 asset classes. An ETF that does worse than money market is replaced by money market (absolute momentum).")
    : sel === "invvol" ? L("Chaque ligne de votre stratégie reçoit un poids inversement proportionnel à sa volatilité sur un an : les actifs calmes pèsent plus, chacun apporte un risque comparable.", "Each line of your strategy gets a weight inversely proportional to its one-year volatility: calm assets weigh more, each brings comparable risk.")
    : L("Composez votre allocation avec n'importe quel produit, puis investissez ou rééquilibrez en un clic.", "Build your allocation with any product, then invest or rebalance in one click.");

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      {/* strategy list */}
      <aside className={cn(k.panel, "p-2 self-start xl:sticky xl:top-4")}>
        <p className={cn("px-3 pt-2 pb-2 text-[12px] font-bold uppercase tracking-[0.08em]", k.sub)}>{L("Stratégies d'allocation", "Allocation strategies")}</p>
        <ul className="grid gap-0.5 max-h-[70vh] overflow-y-auto">
          {cards.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSel(c.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors", sel === c.id ? "bg-[var(--chip)]" : k.hover)}>
                <span className="min-w-0 flex-1">
                  <b className="flex items-center gap-1.5 text-[13.5px] truncate">{c.icon}{c.name}</b>
                  <span className={cn("text-[12px]", k.sub)}>{c.by}</span>
                </span>
                <span className="flex gap-0.5" title={L("Niveau de risque", "Risk level")}>{[1, 2, 3, 4, 5].map((i) => <span key={i} className="w-1.5 h-3.5 rounded-sm" style={{ background: i <= c.risk ? "var(--accent)" : "var(--line2)" }} />)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="grid gap-4 min-w-0">
        {/* strategy detail */}
        <motion.section key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn(k.panel, "p-5")}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] !font-bold tracking-tight">{name}</h2>
              <p className={cn("mt-1 text-[13.5px] max-w-[70ch]", k.sub)}>{desc}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
                <span className={cn("h-7 px-2.5 rounded-md inline-flex items-center font-semibold", k.chip)}>{weights.length} {L("lignes", "lines")}</span>
                {ter > 0 && <span className={cn("h-7 px-2.5 rounded-md inline-flex items-center font-semibold", k.chip)}>{L("Frais ETF moyens", "Avg ETF fees")} {F.num(ter, 2)} % / {L("an", "yr")}</span>}
                <span className={cn("h-7 px-2.5 rounded-md inline-flex items-center font-semibold", k.chip)}>{L("100 % UCITS en euros", "100% UCITS in euros")}</span>
              </div>
            </div>
            {weights.length > 0 && (
              <div className="w-[130px] h-[130px] shrink-0">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={weights} dataKey="weight" nameKey="symbol" innerRadius={40} outerRadius={62} paddingAngle={1.5} stroke="none">
                  {weights.map((w, i) => <Cell key={w.symbol} fill={CLASS_COLORS[describe(w.symbol).cls] ? shade(CLASS_COLORS[describe(w.symbol).cls], i) : "#64748B"} />)}
                </Pie></PieChart></ResponsiveContainer>
              </div>
            )}
          </div>

          {busy ? <p className={cn("mt-5 flex items-center gap-2 text-[13.5px]", k.sub)}><Loader2 size={15} className="animate-spin" />{L("Calcul sur un an de cours réels…", "Computing from one year of real prices…")}</p> : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-[13.5px]">
                <thead><tr className="border-b border-[var(--line)]">
                  {[L("Produit", "Product"), L("Poids", "Weight"), ...(sel === "momentum" ? [L("Perf. 6 mois", "6-month perf.")] : sel === "invvol" ? [L("Volatilité 1 an", "1-year volatility")] : []), L("Frais / an", "Fees / yr"), L("Dernier", "Last"), L("Détenu", "Held")].map((h, i) => (
                    <th key={i} className={cn(k.th, "py-2", i === 0 ? "text-left pr-3" : "text-right px-3")}>{h}</th>
                  ))}
                  {sel === "custom" && <th />}
                </tr></thead>
                <tbody>
                  {(sel === "custom" ? custom : weights).map((w, idx) => {
                    const inst = describe(w.symbol, { name: P.names[w.symbol] || quotes[w.symbol]?.name });
                    const q = quotes[w.symbol];
                    return (
                      <tr key={w.symbol} className="border-t border-[var(--line)]">
                        <td className="py-2 pr-3"><button onClick={() => P.openProduct(w.symbol)} className="flex items-center gap-3 text-left min-w-0"><Badge symbol={w.symbol} size={28} /><span className="min-w-0"><b className="block truncate max-w-[280px]">{inst.n}</b><span className={cn("text-[12px]", k.sub)}>{w.symbol}{inst.sec ? ` · ${inst.sec}` : ""}</span></span></button></td>
                        <td className="text-right px-3 tabular-nums font-semibold">
                          {sel === "custom"
                            ? <input value={w.weight} onChange={(e) => { const v = parseFloat(e.target.value.replace(",", ".")) || 0; setCustom((c) => c.map((x, j) => (j === idx ? { ...x, weight: v } : x))); }} inputMode="decimal" className={cn(k.input, "h-8 w-20 text-right inline-block")} />
                            : `${F.num(w.weight, w.weight % 1 ? 1 : 0)} %`}
                        </td>
                        {dyn?.id === sel && <td className="text-right px-3 tabular-nums">{dyn.info[w.symbol] != null ? `${F.num(dyn.info[w.symbol], 1)} %` : "-"}</td>}
                        <td className="text-right px-3 tabular-nums">{inst.ter != null ? `${F.num(inst.ter, 2)} %` : "-"}</td>
                        <td className="text-right px-3 tabular-nums">{q ? `${F.px(q.price)} ${q.ccy}` : "-"}</td>
                        <td className="text-right px-3 tabular-nums">{acct.positions[w.symbol] ? fmtQty(acct.positions[w.symbol].qty) : "-"}</td>
                        {sel === "custom" && <td className="text-right"><button onClick={() => setCustom((c) => c.filter((_, j) => j !== idx))} className={cn("p-1.5 rounded-md", k.sub, k.hover)} aria-label="Remove"><Trash2 size={14} /></button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sel === "custom" && (
                <div className="mt-3 grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-[13px] font-semibold", Math.abs(totalW - 100) > 0.01 ? "text-[var(--warn)]" : k.sub)}>{L("Total", "Total")} {F.num(totalW, 1)} %{Math.abs(totalW - 100) > 0.01 ? L(" (les poids sont ramenés à 100 %)", " (weights are scaled to 100%)") : ""}</span>
                    <button onClick={() => setCustom((c) => c.map((x) => ({ ...x, weight: +(100 / c.length).toFixed(2) })))} className={cn(k.btn, "h-8 ml-auto", k.chip)}>{L("Pondération égale", "Equal weight")}</button>
                    <button onClick={() => setSel("invvol")} className={cn(k.btn, "h-8", k.chip)}><Scale size={13} />{L("Parité de risque", "Risk parity")}</button>
                  </div>
                  <div className="relative">
                    <Search size={15} className={cn("absolute left-3 top-1/2 -translate-y-1/2", k.sub)} />
                    <input value={q2} onChange={(e) => setQ2(e.target.value)} placeholder={L("Ajouter un produit (nom ou symbole)", "Add a product (name or symbol)")} className={cn(k.input, "pl-9")} />
                    {hits.length > 0 && (
                      <ul className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-[var(--line2)] bg-[var(--panel)] shadow-xl overflow-hidden">
                        {hits.map((h) => (
                          <li key={h.symbol}><button onClick={() => { setCustom((c) => (c.some((x) => x.symbol === h.symbol) ? c : [...c, { symbol: h.symbol, weight: 10 }])); setQ2(""); setHits([]); }} className={cn("w-full flex items-center gap-3 px-3 py-2 text-left", k.hover)}>
                            <Badge symbol={h.symbol} size={24} /><span className="min-w-0 flex-1"><b className="text-[13px]">{h.symbol}</b><span className={cn("block text-[12px] truncate", k.sub)}>{h.label}</span></span><Plus size={14} className={k.sub} />
                          </button></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {sel === "invvol" && <p className={cn("mt-2 text-[12.5px]", k.sub)}>{L("Les lignes viennent de « Ma stratégie » : modifiez-les là pour changer l'univers.", "Lines come from \"My strategy\": edit them there to change the universe.")}</p>}
            </div>
          )}
        </motion.section>

        {/* invest / rebalance */}
        <section className={cn(k.panel, "p-5")}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <span className={cn("text-[12.5px] font-semibold", k.sub)}>{L("Action", "Action")}</span>
              <Seg value={mode} onChange={setMode} options={[{ id: "invest", label: L("Investir un montant", "Invest an amount") }, { id: "rebalance", label: L("Rééquilibrer vers la cible", "Rebalance to target") }]} />
            </div>
            <label className="grid gap-1.5">
              <span className={cn("text-[12.5px] font-semibold", k.sub)}>{mode === "invest" ? L("Montant à investir", "Amount to invest") : L("Argent frais ajouté", "New money added")}</span>
              <div className="relative w-[180px]"><input value={amountIn} onChange={(e) => setAmountIn(e.target.value)} inputMode="decimal" className={cn(k.input, "pr-8 font-semibold")} /><span className={cn("absolute right-3 top-1/2 -translate-y-1/2", k.sub)}>€</span></div>
            </label>
            <span className={cn("text-[12.5px] pb-2.5", k.sub)}>{L("Espèces disponibles", "Free cash")} <b className="text-[var(--text)]">{F.eur(acct.cash.EUR || 0)}</b></span>
            <button onClick={execute} disabled={P.signedIn && (!plan.orders.length || !P.dataOk || busy)} className={cn(k.btn, "ml-auto h-10 px-5 text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>
              {L(`Passer ${plan.orders.length} ordre${plan.orders.length > 1 ? "s" : ""}`, `Place ${plan.orders.length} order${plan.orders.length > 1 ? "s" : ""}`)}
            </button>
          </div>
          {mode === "rebalance" && <p className={cn("mt-2 text-[12.5px]", k.sub)}>{L("Vend ce qui dépasse la cible et achète ce qui manque, en tenant compte des lignes de la stratégie déjà en portefeuille. Les autres positions ne sont pas touchées.", "Sells what is above target and buys what is missing, counting the strategy's lines you already hold. Other positions are left alone.")}</p>}

          {plan.missing.length > 0 && <p className="mt-3 text-[12.5px] text-[var(--warn)]">{L("Cours en attente pour", "Waiting for quotes on")} {plan.missing.join(", ")}.</p>}
          {plan.orders.length === 0 ? <Empty>{mode === "rebalance" ? L("Le portefeuille est déjà aligné sur la cible, ou aucune ligne n'est détenue.", "The portfolio already matches the target, or no line is held.") : L("Saisissez un montant pour voir les ordres.", "Enter an amount to see the orders.")}</Empty> : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13.5px]">
                <thead><tr className="border-b border-[var(--line)]">
                  {[L("Ordre", "Order"), L("Quantité", "Quantity"), L("Cours", "Price"), L("Cible", "Target"), L("Montant", "Amount"), L("Frais", "Fees")].map((h, i) => <th key={i} className={cn(k.th, "py-2", i === 0 ? "text-left pr-3" : "text-right px-3")}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {plan.orders.map((o) => (
                    <tr key={o.symbol} className="border-t border-[var(--line)]">
                      <td className="py-2 pr-3"><span className={cn("mr-2 text-[11.5px] font-bold uppercase", o.side === "buy" ? "text-[var(--accent)]" : "text-[var(--down)]")}>{o.side === "buy" ? L("Achat", "Buy") : L("Vente", "Sell")}</span><b>{o.symbol}</b></td>
                      <td className="text-right px-3 tabular-nums">{fmtQty(o.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{F.px(o.price)} {o.inst.c}</td>
                      <td className="text-right px-3 tabular-nums">{F.eur(o.targetEur, 0)}</td>
                      <td className="text-right px-3 tabular-nums font-semibold">{F.eur(o.costs.valueEur)}</td>
                      <td className="text-right px-3 tabular-nums">{F.eur(o.costs.commission + o.costs.fxFee + o.costs.tax)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t border-[var(--line2)] font-semibold">
                  <td className="py-2.5 pr-3" colSpan={4}>{L("Espèces après exécution", "Cash after execution")}: <span className={cashAfter < 0 ? "text-[var(--down)]" : ""}>{F.eur(cashAfter)}</span></td>
                  <td className="text-right px-3 tabular-nums">{F.eur(tot.buy - tot.sell)}</td>
                  <td className="text-right px-3 tabular-nums">{F.eur(tot.fees)}</td>
                </tr></tfoot>
              </table>
              {!acct.settings.fractions && <p className={cn("mt-2 text-[12px]", k.sub)}>{L("Parts entières uniquement : un petit reliquat reste en espèces. Activez les fractions d'actions dans les paramètres pour tout investir.", "Whole shares only: a small remainder stays in cash. Turn on fractional shares in settings to invest everything.")}</p>}
            </div>
          )}
        </section>

        {/* recurring plans */}
        <section className={cn(k.panel, "p-5")}>
          <h3 className="flex items-center gap-2 text-[15px] !font-bold"><CalendarClock size={17} />{L("Versement programmé", "Recurring investment")}</h3>
          <p className={cn("mt-1 text-[13px] max-w-[75ch]", k.sub)}>{L("Chaque mois, à la date choisie, le montant est investi selon cette stratégie (au premier passage sur la page à partir de cette date). L'investissement régulier lisse le prix d'achat et retire la question du bon moment.", "Each month, on the chosen day, the amount is invested with this strategy (the first time you open the page from that day). Regular investing smooths the purchase price and removes market timing.")}</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="grid gap-1.5"><span className={cn("text-[12.5px] font-semibold", k.sub)}>{L("Montant mensuel", "Monthly amount")}</span><div className="relative w-[140px]"><input value={planAmt} onChange={(e) => setPlanAmt(e.target.value)} inputMode="decimal" className={cn(k.input, "pr-8")} /><span className={cn("absolute right-3 top-1/2 -translate-y-1/2", k.sub)}>€</span></div></label>
            <label className="grid gap-1.5"><span className={cn("text-[12.5px] font-semibold", k.sub)}>{L("Jour du mois", "Day of month")}</span><input value={planDay} onChange={(e) => setPlanDay(e.target.value)} inputMode="numeric" className={cn(k.input, "w-[90px]")} /></label>
            <label className="flex items-center gap-2 h-10 text-[13px] cursor-pointer"><input type="checkbox" checked={planDeposit} onChange={(e) => setPlanDeposit(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />{L("Déposer ce montant chaque mois (comme un virement)", "Deposit this amount each month (like a transfer)")}</label>
            <button onClick={addPlan} disabled={!weights.length} className={cn(k.btn, "ml-auto h-10", k.chip)}><Plus size={14} />{L("Programmer", "Schedule")} « {name} »</button>
          </div>
          {acct.plans.length > 0 && (
            <ul className="mt-4 grid gap-2">
              {acct.plans.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-[13px]">
                  <b>{p.name}</b>
                  <span className={k.sub}>{F.eur(p.amount, 0)} · {L("le", "day")} {p.day} · {p.deposit ? L("avec dépôt", "with deposit") : L("sur les espèces", "from cash")}</span>
                  <span className={cn("text-[12px]", k.sub)}>{p.lastRun === month() ? L("exécuté ce mois-ci", "done this month") : L("prochaine exécution", "next run")}{p.lastRun !== month() ? ` : ${new Date().getDate() >= p.day ? L("à la prochaine actualisation des cours", "at the next quote refresh") : `${p.day}/${new Date().getMonth() + 1}`}` : ""}</span>
                  <span className="ml-auto flex gap-1">
                    <button onClick={() => P.setAcct((a) => ({ ...a, plans: a.plans.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) }))} className={cn("h-7 px-2.5 rounded-md text-[12px] font-semibold", k.chip)}>{p.active ? L("Suspendre", "Pause") : L("Reprendre", "Resume")}</button>
                    <button onClick={() => P.setAcct((a) => ({ ...a, plans: a.plans.filter((x) => x.id !== p.id) }))} className={cn("p-1.5 rounded-md", k.sub, k.hover)} aria-label="Delete"><Trash2 size={14} /></button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function shade(hex: string, i: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = 1 - (i % 3) * 0.18;
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export type { Quote };
