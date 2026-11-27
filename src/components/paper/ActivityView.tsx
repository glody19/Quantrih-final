import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { usePaper, useFormat, k, sign, Empty, Seg, Badge } from "./ctx";
import { convert, deposit, fmtQty, FEE_PROFILES } from "./engine";

/** Open orders and the trade history, with every fee shown per trade. */
export function OrdersView() {
  const P = usePaper();
  const { L, acct, quotes } = P;
  const F = useFormat();
  const [tab, setTab] = useState<"open" | "trades">(acct.orders.length ? "open" : "trades");
  const date = (t: number) => new Date(t).toLocaleString(F.loc, { dateStyle: "short", timeStyle: "short" });

  const csv = () => {
    const head = ["date", "symbole", "sens", "quantite", "cours", "devise", "taux EUR", "valeur EUR", "commission", "frais change", "taxe", "total EUR", "P&L realise"];
    const lines = acct.trades.map((t) => [new Date(t.t).toISOString(), t.symbol, t.side, t.qty, t.price, t.ccy, t.rate, t.valueEur.toFixed(2), t.commission.toFixed(2), t.fxFee.toFixed(2), t.tax.toFixed(2), t.totalEur.toFixed(2), t.realized?.toFixed(2) ?? ""].join(";"));
    const blob = new Blob([[head.join(";"), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions-quantrih.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <section className={cn(k.panel, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-[var(--line)]">
        <Seg value={tab} onChange={setTab} options={[{ id: "open", label: <>{L("Ordres en cours", "Open orders")} <span className={k.sub}>{acct.orders.length}</span></> }, { id: "trades", label: <>{L("Transactions", "Transactions")} <span className={k.sub}>{acct.trades.length}</span></> }]} />
        {tab === "trades" && acct.trades.length > 0 && <button onClick={csv} className={cn(k.btn, "ml-auto h-8", k.chip)}><Download size={14} />CSV</button>}
      </div>
      <div className="overflow-x-auto">
        {tab === "open" ? (acct.orders.length === 0 ? <Empty>{L("Aucun ordre en cours. Les ordres à cours limité et stop loss apparaissent ici jusqu'à leur exécution.", "No open orders. Limit and stop-loss orders show here until they fill.")}</Empty> : (
          <table className="w-full min-w-[820px] text-[13.5px]">
            <thead><tr className="border-b border-[var(--line)]">
              {[L("Date", "Date"), L("Produit", "Product"), L("Sens", "Side"), L("Type", "Type"), L("Quantité", "Quantity"), L("Prix", "Price"), L("Dernier", "Last"), L("Écart", "Distance"), L("Durée", "Duration"), ""].map((h, i) => <th key={i} className={cn(k.th, "py-2.5", i < 4 ? "text-left px-4" : "text-right px-3")}>{h}</th>)}
            </tr></thead>
            <tbody>
              {acct.orders.map((o) => {
                const q = quotes[o.symbol];
                const dist = q ? ((o.price - q.price) / q.price) * 100 : null;
                return (
                  <tr key={o.id} className="border-t border-[var(--line)]">
                    <td className={cn("px-4 py-2.5 tabular-nums", k.sub)}>{date(o.t)}</td>
                    <td className="px-4"><b>{o.symbol}</b><span className={cn("block text-[12px] truncate max-w-[220px]", k.sub)}>{o.name}</span></td>
                    <td className={cn("px-4 font-extrabold", o.side === "buy" ? "text-[var(--accent)]" : "text-[var(--down)]")}>{o.side === "buy" ? L("Achat", "Buy") : L("Vente", "Sell")}</td>
                    <td className="px-4">{o.type === "LMT" ? L("Limite", "Limit") : "Stop loss"}</td>
                    <td className="text-right px-3 tabular-nums">{fmtQty(o.qty)}</td>
                    <td className="text-right px-3 tabular-nums font-bold">{F.px(o.price)} {o.ccy}</td>
                    <td className="text-right px-3 tabular-nums">{q ? F.px(q.price) : "-"}</td>
                    <td className={cn("text-right px-3 tabular-nums", k.sub)}>{dist != null ? F.pct(dist) : "-"}</td>
                    <td className="text-right px-3">{o.tif === "day" ? L("Journalier", "Day") : L("Permanent", "GTC")}</td>
                    <td className="text-right px-4"><button onClick={() => P.setAcct((a) => ({ ...a, orders: a.orders.filter((x) => x.id !== o.id) }))} className={cn("h-7 px-2.5 rounded-md text-[12px] font-extrabold text-[var(--down)]", k.hover)}>{L("Annuler", "Cancel")}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )) : (acct.trades.length === 0 ? <Empty>{L("Aucune transaction pour l'instant.", "No transactions yet.")}</Empty> : (
          <table className="w-full min-w-[1080px] text-[13.5px]">
            <thead><tr className="border-b border-[var(--line)]">
              {[L("Date", "Date"), L("Produit", "Product"), L("Sens", "Side"), L("Quantité", "Quantity"), L("Cours", "Price"), L("Taux", "Rate"), L("Valeur €", "Value €"), L("Courtage", "Commission"), L("Change", "FX"), L("Taxe", "Tax"), L("Total €", "Total €"), L("P&L réalisé", "Realised P&L")].map((h, i) => <th key={i} className={cn(k.th, "py-2.5", i < 3 ? "text-left px-4" : "text-right px-3")}>{h}</th>)}
            </tr></thead>
            <tbody>
              {acct.trades.slice(0, 200).map((t) => (
                <tr key={t.id} className="border-t border-[var(--line)]">
                  <td className={cn("px-4 py-2.5 tabular-nums", k.sub)}>{date(t.t)}</td>
                  <td className="px-4"><div className="flex items-center gap-2.5"><Badge symbol={t.symbol} size={24} /><b>{t.symbol}</b>{t.type === "STRAT" && <span className={cn("text-[10.5px] font-extrabold px-1.5 py-0.5 rounded", k.chip)}>{L("STRATÉGIE", "STRATEGY")}</span>}</div></td>
                  <td className={cn("px-4 font-extrabold", t.side === "buy" ? "text-[var(--accent)]" : "text-[var(--down)]")}>{t.side === "buy" ? L("Achat", "Buy") : L("Vente", "Sell")}</td>
                  <td className="text-right px-3 tabular-nums">{fmtQty(t.qty)}</td>
                  <td className="text-right px-3 tabular-nums">{F.px(t.price)} <span className={cn("text-[11px]", k.sub)}>{t.ccy}</span></td>
                  <td className={cn("text-right px-3 tabular-nums", k.sub)}>{t.rate === 1 ? "-" : t.rate.toFixed(4)}</td>
                  <td className="text-right px-3 tabular-nums">{F.eur(t.valueEur)}</td>
                  <td className="text-right px-3 tabular-nums">{F.eur(t.commission)}</td>
                  <td className="text-right px-3 tabular-nums">{t.fxFee ? F.eur(t.fxFee) : "-"}</td>
                  <td className="text-right px-3 tabular-nums">{t.tax ? F.eur(t.tax) : "-"}</td>
                  <td className="text-right px-3 tabular-nums font-bold">{F.eur(t.side === "buy" ? -t.totalEur : t.totalEur)}</td>
                  <td className={cn("text-right px-3 tabular-nums font-bold", t.realized != null && sign(t.realized))}>{t.realized != null ? F.signed(t.realized) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </section>
  );
}

const CCYS = ["EUR", "USD", "GBP", "CHF", "DKK", "SEK", "NOK", "JPY", "CAD"];

/** Cash per currency, manual conversion, virtual deposits and the full account statement. */
export function CashView() {
  const P = usePaper();
  const { L, acct, rates } = P;
  const F = useFormat();
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amt, setAmt] = useState("1000");
  const [dep, setDep] = useState("5000");
  const [filter, setFilter] = useState<"all" | "trades" | "fees" | "fx" | "deposit">("all");

  const a = parseFloat(amt.replace(",", ".")) || 0;
  const rf = from === "EUR" ? 1 : rates[from];
  const rt = to === "EUR" ? 1 : rates[to];
  const feePct = FEE_PROFILES[acct.settings.fees].fx;
  const received = rf && rt ? (a / rf) * (1 - feePct) * rt : 0;
  const err = from === to ? L("Choisissez deux devises différentes.", "Pick two different currencies.") : !rf || !rt ? L("Taux indisponible.", "Rate unavailable.") : a <= 0 ? "" : (acct.cash[from] || 0) + 1e-6 < a ? L(`Solde ${from} insuffisant.`, `Not enough ${from}.`) : "";

  const moves = useMemo(() => acct.moves.filter((m) => filter === "all" || (filter === "trades" && (m.kind === "buy" || m.kind === "sell")) || (filter === "fees" && (m.kind === "commission" || m.kind === "fxfee" || m.kind === "tax")) || (filter === "fx" && m.kind === "fx") || (filter === "deposit" && m.kind === "deposit")), [acct.moves, filter]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(k.panel, "p-5")}>
          <h2 className="text-[15px] !font-extrabold">{L("Soldes par devise", "Balances by currency")}</h2>
          <ul className="mt-3 grid gap-2">
            {Object.entries(acct.cash).filter(([, v]) => Math.abs(v) > 0.005).map(([c, v]) => (
              <li key={c} className="flex items-center gap-3 text-[14px]"><Badge symbol={c} size={28} /><b>{c}</b><span className="ml-auto tabular-nums font-bold">{F.money(v, c)}</span>{c !== "EUR" && <span className={cn("text-[12px] tabular-nums w-24 text-right", k.sub)}>≈ {F.eur(v / (rates[c] || 1))}</span>}</li>
            ))}
          </ul>
          <p className={cn("mt-4 text-[12.5px]", k.sub)}>{acct.settings.autoFx
            ? L("Conversion automatique activée : chaque achat en devise est converti depuis vos euros et chaque vente reconvertie en euros.", "Auto conversion is on: each foreign purchase is converted from your euros and each sale converted back.")
            : L("Conversion automatique désactivée : convertissez des euros dans la devise du produit avant d'acheter ; le produit des ventes reste dans la devise.", "Auto conversion is off: convert euros into the product's currency before buying; sale proceeds stay in that currency.")}</p>
        </section>

        <section className={cn(k.panel, "p-5")}>
          <h2 className="text-[15px] !font-extrabold">{L("Change de devises", "Currency exchange")}</h2>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="grid gap-1"><span className={cn("text-[12px] font-bold", k.sub)}>{L("De", "From")}</span><select value={from} onChange={(e) => setFrom(e.target.value)} className={k.input}>{CCYS.map((c) => <option key={c}>{c}</option>)}</select></label>
            <button onClick={() => { setFrom(to); setTo(from); }} className={cn("h-10 px-2 rounded-lg", k.chip)} aria-label="Swap">⇄</button>
            <label className="grid gap-1"><span className={cn("text-[12px] font-bold", k.sub)}>{L("Vers", "To")}</span><select value={to} onChange={(e) => setTo(e.target.value)} className={k.input}>{CCYS.map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
          <label className="mt-2 grid gap-1"><span className={cn("text-[12px] font-bold", k.sub)}>{L("Montant", "Amount")} ({from})</span><input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" className={k.input} /></label>
          <div className="mt-2 text-[13px] grid gap-1">
            <div className="flex justify-between"><span className={k.sub}>{L("Taux", "Rate")} {from}/{to}</span><span className="tabular-nums">{rf && rt ? (rt / rf).toFixed(4) : "-"}</span></div>
            <div className="flex justify-between"><span className={k.sub}>{L("Frais de change", "FX fee")} ({(feePct * 100).toLocaleString(F.loc)} %)</span><span className="tabular-nums">{rf ? F.eur((a / rf) * feePct) : "-"}</span></div>
            <div className="flex justify-between font-bold"><span>{L("Vous recevez", "You receive")}</span><span className="tabular-nums">{F.money(received, to)}</span></div>
          </div>
          {err && a > 0 && <p className="mt-2 text-[12.5px] text-[var(--down)]">{err}</p>}
          <button disabled={!!err || a <= 0} onClick={() => { if (!P.requireUser()) return; const n = convert(acct, from, to, a, rates); if (n) { P.setAcct(n); P.notify(L(`Change effectué : ${F.money(a, from)} → ${F.money(received, to)}`, `Exchanged ${F.money(a, from)} → ${F.money(received, to)}`)); } }}
            className={cn(k.btn, "mt-3 w-full h-10 text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>{L("Convertir", "Convert")}</button>
        </section>

        <section className={cn(k.panel, "p-5")}>
          <h2 className="text-[15px] !font-extrabold">{L("Déposer des fonds virtuels", "Deposit virtual funds")}</h2>
          <p className={cn("mt-1 text-[12.5px]", k.sub)}>{L("Simule un virement depuis votre compte bancaire. Les dépôts sont exclus du calcul de performance.", "Simulates a bank transfer. Deposits are excluded from the performance calculation.")}</p>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1"><input value={dep} onChange={(e) => setDep(e.target.value)} inputMode="decimal" className={cn(k.input, "pr-8")} /><span className={cn("absolute right-3 top-1/2 -translate-y-1/2", k.sub)}>€</span></div>
            <button onClick={() => { if (!P.requireUser()) return; const v = parseFloat(dep.replace(",", ".")) || 0; if (v > 0 && v <= 1_000_000) { P.setAcct((x) => deposit(x, v)); P.notify(L(`Dépôt de ${F.eur(v)} effectué.`, `Deposited ${F.eur(v)}.`)); } }} className={cn(k.btn, "h-10", k.chip)}>{L("Déposer", "Deposit")}</button>
          </div>
          <div className={cn("mt-4 grid gap-1 text-[13px]")}>
            <div className="flex justify-between"><span className={k.sub}>{L("Total déposé", "Total deposited")}</span><b className="tabular-nums">{F.eur(acct.deposits)}</b></div>
            <div className="flex justify-between"><span className={k.sub}>{L("Ouverture du compte", "Account opened")}</span><span className="tabular-nums">{new Date(acct.created).toLocaleDateString(F.loc)}</span></div>
          </div>
        </section>
      </div>

      <section className={cn(k.panel, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-[var(--line)]">
          <h2 className="text-[15px] !font-extrabold mr-auto">{L("Relevé de compte", "Account statement")}</h2>
          <Seg value={filter} onChange={setFilter} size="sm" options={[{ id: "all", label: L("Tout", "All") }, { id: "trades", label: L("Achats / ventes", "Trades") }, { id: "fees", label: L("Frais et taxes", "Fees and tax") }, { id: "fx", label: L("Change", "FX") }, { id: "deposit", label: L("Dépôts", "Deposits") }]} />
        </div>
        {moves.length === 0 ? <Empty>{L("Aucun mouvement.", "No movement.")}</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead><tr className="border-b border-[var(--line)]">{[L("Date", "Date"), L("Description", "Description"), L("Devise", "Currency"), L("Montant", "Amount")].map((h, i) => <th key={i} className={cn(k.th, "py-2.5", i < 3 ? "text-left px-5" : "text-right px-5")}>{h}</th>)}</tr></thead>
              <tbody>
                {moves.slice(0, 300).map((m) => (
                  <tr key={m.id} className="border-t border-[var(--line)]">
                    <td className={cn("px-5 py-2 tabular-nums whitespace-nowrap", k.sub)}>{new Date(m.t).toLocaleString(F.loc, { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="px-5">{P.fr ? m.desc : translateDesc(m.desc)}</td>
                    <td className={cn("px-5", k.sub)}>{m.ccy}</td>
                    <td className={cn("text-right px-5 tabular-nums font-bold", sign(m.amount))}>{m.amount > 0 ? "+" : ""}{F.money(m.amount, m.ccy)}</td>
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

const translateDesc = (d: string) => d.replace(/^Achat/, "Buy").replace(/^Vente/, "Sell").replace("Frais de transaction", "Transaction fee").replace("Frais de conversion", "Conversion fee")
  .replace("Taxe sur les opérations de bourse", "Stock exchange tax").replace(/^Dépôt initial/, "Initial deposit").replace(/^Dépôt/, "Deposit").replace(/^Change/, "Exchange").replace("taux", "rate").replace("frais", "fee").replace("Versement programmé", "Recurring plan");

