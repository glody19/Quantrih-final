import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/utils";
import { usePaper, useFormat, k, sign, Badge, Empty, Seg } from "./ctx";
import { describe, CLASS_COLORS, type AssetClass, type Kind } from "./universe";
import { cashCcy, fmtQty, unit } from "./engine";

export interface Row {
  s: string; name: string; qty: number; ccy: string; price?: number; pct?: number; valueLocal: number; valueEur: number;
  costEur: number; avgLocal: number; gain: number; gainPct: number; day: number; kind: Kind; cls: AssetClass; region: string; x: string;
}

/** Positions valued in euros at live prices and live exchange rates. */
export function usePositions() {
  const { acct, quotes, rateOf } = usePaper();
  return useMemo(() => {
    const rows: Row[] = Object.entries(acct.positions).map(([s, p]) => {
      const q = quotes[s];
      const inst = describe(s, { name: p.name, ccy: p.ccy });
      const rate = rateOf(q?.ccy || p.ccy);
      const valueLocal = q ? p.qty * q.price * unit(q.ccy) : 0;
      const valueEur = q && rate ? valueLocal / rate : p.costEur;
      const day = q && rate ? valueEur - valueEur / (1 + q.pct / 100) : 0;
      return { s, name: p.name, qty: p.qty, ccy: q?.ccy || p.ccy, price: q?.price, pct: q?.pct, valueLocal, valueEur, costEur: p.costEur, avgLocal: p.costLocal / p.qty,
        gain: valueEur - p.costEur, gainPct: ((valueEur - p.costEur) / p.costEur) * 100, day, kind: inst.k, cls: inst.cls, region: inst.r, x: inst.x };
    }).sort((a, b) => b.valueEur - a.valueEur);
    const cashEur = Object.entries(acct.cash).reduce((a, [c, v]) => { const r = c === "EUR" ? 1 : rateOf(c); return a + (r ? v / r : 0); }, 0);
    const invested = rows.reduce((a, r) => a + r.valueEur, 0);
    const total = invested + cashEur;
    return {
      rows, cashEur, invested, total,
      unreal: rows.reduce((a, r) => a + r.gain, 0),
      day: rows.reduce((a, r) => a + r.day, 0),
      fees: acct.trades.reduce((a, t) => a + t.commission + t.fxFee + t.tax, 0) + (acct.extraFees || 0),
      realized: acct.trades.reduce((a, t) => a + (t.realized || 0), 0),
      totalGain: total - acct.deposits,
    };
  }, [acct, quotes, rateOf]);
}

const KIND_LABEL: Record<Kind, [string, string]> = { stock: ["Actions", "Stocks"], etf: ["ETF", "ETFs"], bond: ["Obligations", "Bonds"], commodity: ["Or et matières premières", "Gold and commodities"], crypto: ["Crypto", "Crypto"] };
const CLASS_LABEL: Record<AssetClass, [string, string]> = { equity: ["Actions", "Equities"], bond: ["Obligations", "Bonds"], gold: ["Or", "Gold"], commodity: ["Matières premières", "Commodities"], realestate: ["Immobilier", "Real estate"], cash: ["Liquidités", "Cash"], crypto: ["Crypto", "Crypto"] };
const REGION_LABEL: Record<string, [string, string]> = { eu: ["Europe", "Europe"], us: ["États-Unis", "United States"], world: ["Monde", "World"], em: ["Émergents", "Emerging"] };

export function PortfolioView() {
  const P = usePaper();
  const { L, acct, fr } = P;
  const F = useFormat();
  const pf = usePositions();
  const [split, setSplit] = useState<"cls" | "ccy" | "region">("cls");
  const [range, setRange] = useState<"1M" | "3M" | "1Y" | "ALL">("ALL");

  const hist = useMemo(() => {
    const days = { "1M": 31, "3M": 92, "1Y": 366, ALL: 1e6 }[range];
    const from = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const pts = acct.history.filter((h) => h.d >= from);
    const start = new Date(acct.created).toISOString().slice(0, 10);
    const base = pts.length && pts[0].d > start && range === "ALL" ? [{ d: start, v: acct.deposits }] : [];
    return [...base, ...pts];
  }, [acct.history, acct.created, acct.deposits, range]);

  const slices = useMemo(() => {
    const m = new Map<string, { label: string; v: number; color: string }>();
    const add = (key: string, label: string, v: number, color: string) => { const o = m.get(key); if (o) o.v += v; else m.set(key, { label, v, color }); };
    const pal = ["#3B82F6", "#14B8A6", "#EAB308", "#A855F7", "#F97316", "#EC4899", "#64748B", "#22C55E"];
    pf.rows.forEach((r) => {
      if (split === "cls") add(r.cls, CLASS_LABEL[r.cls][fr ? 0 : 1], r.valueEur, CLASS_COLORS[r.cls]);
      else if (split === "ccy") add(cashCcy(r.ccy), cashCcy(r.ccy), r.valueEur, "");
      else add(r.region, REGION_LABEL[r.region]?.[fr ? 0 : 1] || r.region, r.valueEur, "");
    });
    if (pf.cashEur > 0.01) add("cash-pos", L("Espèces", "Cash"), pf.cashEur, "#94A3B8");
    return Array.from(m.values()).sort((a, b) => b.v - a.v).map((s, i) => ({ ...s, color: s.color || pal[i % pal.length] }));
  }, [pf, split, fr, L]);

  const groups = useMemo(() => {
    const g = new Map<Kind, Row[]>();
    pf.rows.forEach((r) => g.set(r.kind, [...(g.get(r.kind) || []), r]));
    return Array.from(g.entries());
  }, [pf.rows]);

  const ret = acct.deposits ? (pf.totalGain / acct.deposits) * 100 : 0;
  const stats = [
    { l: L("Valeur totale du compte", "Total account value"), v: F.eur(pf.total), big: true },
    { l: L("Espèces disponibles", "Free cash"), v: F.eur(pf.cashEur) },
    { l: L("P&L du jour", "Today's P&L"), v: F.signed(pf.day), tone: sign(pf.day) },
    { l: L("P&L total", "Total P&L"), v: `${F.signed(pf.totalGain)}`, sub: F.pct(ret), tone: sign(pf.totalGain) },
    { l: L("P&L réalisé", "Realised P&L"), v: F.signed(pf.realized), tone: sign(pf.realized) },
    { l: L("Frais payés", "Fees paid"), v: F.eur(pf.fees) },
  ];

  return (
    <div className="grid gap-4">
      {/* summary */}
      <div className={cn(k.panel, "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-[var(--line)]")}>
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cn("px-5 py-4", i > 0 && "xl:border-l border-[var(--line)]")}>
            <span className={cn("block text-[12px] font-semibold", k.sub)}>{s.l}</span>
            <b className={cn("block tabular-nums mt-0.5", s.big ? "text-[24px] tracking-tight" : "text-[18px]", s.tone)}>{s.v}</b>
            {s.sub && <span className={cn("text-[12.5px] font-semibold tabular-nums", s.tone)}>{s.sub}</span>}
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* value over time */}
        <section className={cn(k.panel, "p-4")}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-[15px] !font-bold">{L("Évolution du compte", "Account value")}</h2>
            <Seg value={range} onChange={setRange} size="sm" options={[{ id: "1M", label: "1M" }, { id: "3M", label: "3M" }, { id: "1Y", label: L("1A", "1Y") }, { id: "ALL", label: L("Tout", "All") }]} />
          </div>
          {hist.length < 2 ? <Empty>{L("La courbe se construit jour après jour : revenez demain pour voir l'évolution de votre compte.", "The curve builds day by day: come back tomorrow to see your account's progress.")}</Empty> : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hist} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <defs><linearGradient id="pt-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="d" tick={{ fill: "var(--sub)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={40} tickFormatter={(d) => new Date(d).toLocaleDateString(F.loc, { day: "numeric", month: "short" })} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--sub)", fontSize: 11 }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => F.eur(v, 0)} />
                  <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--line2)", borderRadius: 10, color: "var(--text)", fontSize: 12.5 }} formatter={(v: number) => [F.eur(v), L("Valeur", "Value")]} labelFormatter={(d) => new Date(d).toLocaleDateString(F.loc, { dateStyle: "medium" })} />
                  <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} fill="url(#pt-area)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* breakdown */}
        <section className={cn(k.panel, "p-4")}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-[15px] !font-bold">{L("Répartition", "Breakdown")}</h2>
            <Seg value={split} onChange={setSplit} size="sm" options={[{ id: "cls", label: L("Classe", "Class") }, { id: "ccy", label: L("Devise", "Currency") }, { id: "region", label: L("Région", "Region") }]} />
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center gap-3">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={slices} dataKey="v" innerRadius={44} outerRadius={66} paddingAngle={1.5} stroke="none" isAnimationActive>
                  {slices.map((s) => <Cell key={s.label} fill={s.color} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid gap-1.5 text-[13px]">
              {slices.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="truncate">{s.label}</span>
                  <b className="ml-auto tabular-nums">{F.num((s.v / (pf.total || 1)) * 100, 1)} %</b>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* positions */}
      <section className={cn(k.panel, "overflow-hidden")}>
        <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--line)]">
          <h2 className="text-[15px] !font-bold">{L("Positions", "Positions")} <span className={cn("ml-1 text-[12.5px]", k.sub)}>{pf.rows.length}</span></h2>
          <button onClick={() => P.go("market")} className={cn(k.btn, "h-8 text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>{L("Rechercher un produit", "Find a product")}</button>
        </div>
        {pf.rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[15px] font-semibold">{L("Votre portefeuille est vide.", "Your portfolio is empty.")}</p>
            <p className={cn("mt-1 text-[13.5px]", k.sub)}>{L("Achetez un produit depuis la recherche, ou investissez d'un coup selon une stratégie d'allocation.", "Buy a product from search, or invest at once with an allocation strategy.")}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => P.go("market")} className={cn(k.btn, k.chip)}>{L("Rechercher", "Search")}</button>
              <button onClick={() => P.go("strategies")} className={cn(k.btn, "text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>{L("Choisir une stratégie", "Pick a strategy")}</button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[13.5px]">
              <thead><tr className="border-b border-[var(--line)]">
                {[L("Produit", "Product"), L("Quantité", "Quantity"), L("Cours", "Price"), L("Var. jour", "Day"), L("Prix de revient", "Avg price"), L("Valeur", "Value"), L("Valeur en €", "Value in €"), L("P&L", "P&L"), L("Poids", "Weight"), ""].map((h, i) => (
                  <th key={i} className={cn(k.th, "py-2.5", i === 0 ? "text-left px-5" : "text-right px-3")}>{h}</th>
                ))}
              </tr></thead>
              {groups.map(([kind, rows]) => (
                <tbody key={kind}>
                  <tr><td colSpan={10} className={cn("px-5 pt-3 pb-1 text-[11.5px] font-bold uppercase tracking-[0.08em]", k.sub)}>{KIND_LABEL[kind][fr ? 0 : 1]}</td></tr>
                  {rows.map((r) => (
                    <tr key={r.s} className={cn("border-t border-[var(--line)] cursor-pointer", k.hover)} onClick={() => P.openProduct(r.s)}>
                      <td className="px-5 py-2.5"><div className="flex items-center gap-3 min-w-0"><Badge symbol={r.s} /><div className="min-w-0"><b className="block truncate max-w-[260px]">{r.name}</b><span className={cn("text-[12px]", k.sub)}>{r.s} · {r.x}</span></div></div></td>
                      <td className="text-right px-3 tabular-nums">{fmtQty(r.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{r.price != null ? <>{F.px(r.price)} <span className={cn("text-[11px]", k.sub)}>{r.ccy}</span></> : "-"}</td>
                      <td className={cn("text-right px-3 tabular-nums font-semibold", sign(r.pct || 0))}>{r.pct != null ? F.pct(r.pct) : "-"}</td>
                      <td className="text-right px-3 tabular-nums">{F.px(r.avgLocal)}</td>
                      <td className="text-right px-3 tabular-nums">{F.money(r.valueLocal, cashCcy(r.ccy))}</td>
                      <td className="text-right px-3 tabular-nums font-semibold">{F.eur(r.valueEur)}</td>
                      <td className={cn("text-right px-3 tabular-nums font-semibold", sign(r.gain))}>{F.signed(r.gain)}<span className="block text-[11.5px]">{F.pct(r.gainPct)}</span></td>
                      <td className="text-right px-3 tabular-nums">{F.num((r.valueEur / (pf.total || 1)) * 100, 1)} %</td>
                      <td className="text-right px-4 whitespace-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); P.openTicket(r.s, "buy"); }} className={cn("h-7 px-2.5 rounded-md text-[12px] font-bold text-[var(--accent)]", k.hover)}>{L("Acheter", "Buy")}</button>
                        <button onClick={(e) => { e.stopPropagation(); P.openTicket(r.s, "sell", r.qty); }} className={cn("h-7 px-2.5 rounded-md text-[12px] font-bold text-[var(--down)]", k.hover)}>{L("Vendre", "Sell")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
              <tbody>
                <tr><td colSpan={10} className={cn("px-5 pt-3 pb-1 text-[11.5px] font-bold uppercase tracking-[0.08em]", k.sub)}>{L("Espèces", "Cash")}</td></tr>
                {Object.entries(acct.cash).filter(([, v]) => Math.abs(v) > 0.005).map(([c, v]) => (
                  <tr key={c} className="border-t border-[var(--line)]">
                    <td className="px-5 py-2.5"><div className="flex items-center gap-3"><Badge symbol={c} /><b>{L("Espèces", "Cash")} {c}</b></div></td>
                    <td colSpan={4} />
                    <td className="text-right px-3 tabular-nums">{F.money(v, c)}</td>
                    <td className="text-right px-3 tabular-nums font-semibold">{F.eur(c === "EUR" ? v : v / (P.rateOf(c) || 1))}</td>
                    <td />
                    <td className="text-right px-3 tabular-nums">{F.num(((c === "EUR" ? v : v / (P.rateOf(c) || 1)) / (pf.total || 1)) * 100, 1)} %</td>
                    <td className="text-right px-4"><button onClick={() => P.go("cash")} className={cn("h-7 px-2.5 rounded-md text-[12px] font-bold", k.sub, k.hover)}>{L("Convertir", "Convert")}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
