import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { X, Lock, TriangleAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { UCITS_EQUIVALENTS } from "../../data/ucitsEquivalents";
import { usePaper, useFormat, k, Seg, Badge, sign } from "./ctx";
import { describe } from "./universe";
import { cashCcy, costOrder, fill, fmtQty, missingCash, qtyForEur, today, FEE_PROFILES, type Side } from "./engine";

type T = "LMT" | "MKT" | "STP";

/** Order dialog in two steps, as at an online broker: enter, then check every cost, then confirm. */
export function OrderTicket({ symbol, initialSide, initialQty, onClose }: { symbol: string; initialSide: Side; initialQty?: number; onClose: () => void }) {
  const P = usePaper();
  const { L, acct, quotes, rateOf } = P;
  const F = useFormat();
  const q = quotes[symbol];
  const inst = describe(symbol, { name: q?.name || P.names[symbol], ccy: q?.ccy });
  const rate = q ? rateOf(q.ccy) : undefined;
  const held = acct.positions[symbol]?.qty || 0;

  const [side, setSide] = useState<Side>(initialSide);
  const [type, setType] = useState<T>("MKT");
  const [tif, setTif] = useState<"day" | "gtc">("day");
  const [mode, setMode] = useState<"qty" | "eur">(initialQty ? "qty" : "qty");
  const [input, setInput] = useState(initialQty ? String(+initialQty.toFixed(6)) : "");
  const [priceIn, setPriceIn] = useState("");
  const [step, setStep] = useState<"edit" | "check">("edit");

  useEffect(() => { const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc); }, [onClose]);

  const n = parseFloat(input.replace(",", ".")) || 0;
  const lim = parseFloat(priceIn.replace(",", ".")) || 0;
  const execPx = type === "MKT" ? q?.price || 0 : lim;
  const qty = mode === "qty" ? n : q && rate && execPx ? qtyForEur(n, inst, execPx, rate, acct.settings.fractions) : 0;
  const costs = q && rate && qty > 0 && execPx > 0 ? costOrder(acct, inst, side, qty, execPx, rate) : null;
  const fractional = qty > 0 && Math.abs(qty - Math.round(qty)) > 1e-9;
  const blockedPriips = side === "buy" && acct.settings.priips && inst.priips;
  const ucits = UCITS_EQUIVALENTS[symbol.toUpperCase()];

  const error = useMemo(() => {
    if (!q || !rate) return L("Cours indisponible pour ce produit.", "No quote available for this product.");
    if (blockedPriips) return L("Pas de document d'informations clés (KID) : ce fonds américain n'est pas proposé aux particuliers dans l'Union européenne.", "No key information document (KID): this US fund is not offered to retail investors in the EU.");
    if (n <= 0) return L("Saisissez une quantité.", "Enter a quantity.");
    if (type !== "MKT" && lim <= 0) return type === "LMT" ? L("Saisissez un prix limite.", "Enter a limit price.") : L("Saisissez un prix de déclenchement.", "Enter a stop price.");
    if (qty <= 0) return L("Montant trop faible pour une part entière.", "Amount too small for one whole share.");
    if (fractional && !acct.settings.fractions && inst.k !== "crypto") return L("Fractions d'actions désactivées : saisissez un nombre entier (modifiable dans les paramètres).", "Fractional shares are off: enter a whole number (change it in settings).");
    if (side === "sell" && qty > held + 1e-9) return L(`Quantité supérieure à votre position (${fmtQty(held)}).`, `Quantity above your position (${fmtQty(held)}).`);
    if (costs) {
      const miss = missingCash(acct, costs);
      if (miss && (side === "buy" || type === "MKT")) {
        return miss.ccy === "EUR" || acct.settings.autoFx
          ? L(`Liquidités insuffisantes : il manque ${F.money(miss.amount - (acct.cash[miss.ccy] || 0), miss.ccy)}.`, `Not enough cash: ${F.money(miss.amount - (acct.cash[miss.ccy] || 0), miss.ccy)} missing.`)
          : L(`Pas assez de ${miss.ccy} : convertissez des euros dans Espèces et devises, ou activez la conversion automatique.`, `Not enough ${miss.ccy}: convert euros in Cash and currencies, or turn on automatic conversion.`);
      }
    }
    return null;
  }, [q, rate, blockedPriips, n, type, lim, qty, fractional, side, held, costs, acct, inst.k, L, F]);

  const submit = () => {
    if (!P.requireUser()) return;
    if (error || !q || !rate) return;
    if (step === "edit") { setStep("check"); return; }
    if (type === "MKT") {
      P.setAcct((a) => fill(a, symbol, inst.n, inst, side, qty, q.price, rate, "MKT"));
      P.notify(L(`Exécuté : ${side === "buy" ? "achat" : "vente"} de ${fmtQty(qty)} ${symbol} à ${F.px(q.price)} ${q.ccy}`, `Filled: ${side} ${fmtQty(qty)} ${symbol} at ${F.px(q.price)} ${q.ccy}`));
    } else {
      P.setAcct((a) => ({ ...a, orders: [{ id: Date.now(), t: Date.now(), symbol, name: inst.n, side, qty, type, price: lim, ccy: q.ccy, tif, day: today() }, ...a.orders] }));
      P.notify(L(`Ordre ${type === "LMT" ? "à cours limité" : "stop"} placé : ${fmtQty(qty)} ${symbol} à ${F.px(lim)} ${q.ccy}`, `${type === "LMT" ? "Limit" : "Stop"} order placed: ${fmtQty(qty)} ${symbol} at ${F.px(lim)} ${q.ccy}`));
    }
    onClose();
  };

  const isEur = cashCcy(inst.c) === "EUR";
  const avail = isEur || acct.settings.autoFx ? acct.cash.EUR || 0 : acct.cash[cashCcy(inst.c)] || 0;
  const availCcy = isEur || acct.settings.autoFx ? "EUR" : cashCcy(inst.c);
  const sideColor = side === "buy" ? "bg-[var(--accent)] hover:bg-[var(--accent2)]" : "bg-[var(--down)] hover:brightness-95";
  const Row = ({ l, v, strong, tone }: { l: React.ReactNode; v: React.ReactNode; strong?: boolean; tone?: string }) => (
    <div className="flex items-baseline justify-between gap-3 py-1"><span className={k.sub}>{l}</span><span className={cn("tabular-nums text-right", strong && "font-extrabold text-[15px]", tone)}>{v}</span></div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="relative w-full sm:max-w-[460px] max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[var(--panel)] border border-[var(--line2)] shadow-2xl text-[var(--text)]">
        {/* product header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[var(--line)]">
          <Badge symbol={symbol} size={40} />
          <div className="min-w-0 flex-1">
            <b className="block text-[16px] leading-tight truncate">{inst.n}</b>
            <span className={cn("text-[12.5px]", k.sub)}>{symbol} · {inst.x} · {q?.ccy || inst.c}</span>
          </div>
          <div className="text-right">
            <b className="block text-[16px] tabular-nums">{q ? F.px(q.price) : "-"}</b>
            {q && <span className={cn("text-[12.5px] font-bold tabular-nums", sign(q.pct))}>{F.pct(q.pct)}</span>}
          </div>
          <button onClick={onClose} className={cn("ml-1 -mr-1 p-1 rounded-md", k.sub, k.hover)} aria-label={L("Fermer", "Close")}><X size={18} /></button>
        </div>

        {step === "edit" ? (
          <div className="px-5 py-4 grid gap-3.5 text-[13.5px]">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--chip)]">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={cn("h-9 rounded-lg text-[14px] font-extrabold transition-colors",
                  side === s ? (s === "buy" ? "bg-[var(--accent)] text-white" : "bg-[var(--down)] text-white") : "text-[var(--sub)] hover:text-[var(--text)]")}>
                  {s === "buy" ? L("Acheter", "Buy") : L("Vendre", "Sell")}
                </button>
              ))}
            </div>

            {blockedPriips && (
              <div className="rounded-lg p-3 bg-[var(--chip)] grid gap-2">
                <p className="flex gap-2 text-[13px]"><TriangleAlert size={16} className="shrink-0 text-[var(--warn)] mt-0.5" />{L("Ce fonds américain n'a pas de KID : les courtiers européens bloquent l'achat pour les particuliers (règlement PRIIPs).", "This US fund has no KID: European brokers block the purchase for retail investors (PRIIPs rules).")}</p>
                {ucits && <button onClick={() => { onClose(); P.openTicket(ucits.to, "buy"); }} className={cn(k.btn, "justify-start px-0 h-auto text-[var(--accent)]")}>{L("Acheter l'équivalent UCITS", "Buy the UCITS equivalent")} {ucits.to} <ArrowRight size={14} /></button>}
              </div>
            )}

            <div className="grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-3">
              <span className={k.sub}>{L("Type d'ordre", "Order type")}</span>
              <Seg value={type} onChange={setType} size="sm" options={[{ id: "LMT", label: L("Limite", "Limit") }, { id: "MKT", label: L("Marché", "Market") }, { id: "STP", label: "Stop loss" }]} />
              {type !== "MKT" && (<>
                <span className={k.sub}>{type === "LMT" ? L("Prix limite", "Limit price") : L("Déclenchement", "Stop price")}</span>
                <div className="relative"><input value={priceIn} onChange={(e) => setPriceIn(e.target.value)} placeholder={q ? F.px(q.price) : ""} inputMode="decimal" className={cn(k.input, "pr-14")} /><span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[12px]", k.sub)}>{q?.ccy || inst.c}</span></div>
                <span className={k.sub}>{L("Durée", "Duration")}</span>
                <Seg value={tif} onChange={setTif} size="sm" options={[{ id: "day", label: L("Journalier", "Day") }, { id: "gtc", label: L("Permanent", "Good till cancelled") }]} />
              </>)}
              <span className={k.sub}>{mode === "qty" ? L("Quantité", "Quantity") : L("Montant", "Amount")}</span>
              <div className="grid gap-1.5">
                <div className="relative">
                  <input value={input} onChange={(e) => setInput(e.target.value)} autoFocus inputMode="decimal" placeholder="0" className={cn(k.input, "pr-[84px] text-[15px] font-bold")} />
                  <button onClick={() => { setMode(mode === "qty" ? "eur" : "qty"); setInput(""); }} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2 rounded-md text-[11.5px] font-extrabold bg-[var(--chip)] text-[var(--text)]">{mode === "qty" ? L("Parts", "Shares") : "EUR"} ⇄</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {side === "sell" && held > 0
                    ? [0.25, 0.5, 1].map((f) => <button key={f} onClick={() => { setMode("qty"); const v = held * f; setInput(String(acct.settings.fractions || inst.k === "crypto" ? +v.toFixed(6) : Math.max(1, Math.floor(v)))); }} className={cn("h-6 px-2 rounded-md text-[11.5px] font-bold", k.chip)}>{f === 1 ? L("Tout", "All") : `${f * 100} %`}</button>)
                    : [500, 1000, 5000].map((v) => <button key={v} onClick={() => { setMode("eur"); setInput(String(v)); }} className={cn("h-6 px-2 rounded-md text-[11.5px] font-bold", k.chip)}>{F.eur(v, 0)}</button>)}
                  {mode === "eur" && qty > 0 && <span className={cn("ml-auto text-[12px] self-center", k.sub)}>= {fmtQty(qty)} {L("parts", "shares")}</span>}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--panel2)] border border-[var(--line)] px-3.5 py-2.5 text-[13px]">
              <Row l={L("Disponible", "Available")} v={F.money(avail, availCcy)} />
              {side === "sell" && <Row l={L("Position", "Position")} v={`${fmtQty(held)} ${L("parts", "shares")}`} />}
              <Row l={L("Valeur estimée", "Estimated value")} v={costs ? F.money(costs.valueLocal, cashCcy(inst.c)) : "-"} />
              {costs && <Row l={L("Total estimé", "Estimated total")} v={F.eur(costs.totalEur)} strong />}
            </div>

            {error && n > 0 && P.signedIn && !blockedPriips && <p className="text-[12.5px] text-[var(--down)]">{error}</p>}
            {!P.signedIn && <p className={cn("flex items-center gap-1.5 text-[12.5px]", k.sub)}><Lock size={13} />{L("Créez un compte gratuit pour passer des ordres.", "Create a free account to place orders.")}</p>}
            <button onClick={submit} disabled={P.signedIn && (!!error || !P.dataOk)} className={cn(k.btn, "h-11 text-[14.5px] text-white", sideColor)}>
              {!P.signedIn && <Lock size={14} />}{L("Vérifier l'ordre", "Review order")}
            </button>
          </div>
        ) : costs && q && rate ? (
          <div className="px-5 py-4 grid gap-3 text-[13.5px]">
            <p className="text-[15px] font-extrabold">
              {side === "buy" ? L("Achat", "Buy") : L("Vente", "Sell")} {fmtQty(qty)} × {symbol} · {type === "MKT" ? L("au marché", "at market") : `${type === "LMT" ? L("limite", "limit") : "stop"} ${F.px(lim)} ${q.ccy}`}
              {type !== "MKT" && <span className={cn("font-semibold text-[13px]", k.sub)}> · {tif === "day" ? L("journalier", "day") : L("permanent", "GTC")}</span>}
            </p>
            <div className="rounded-xl bg-[var(--panel2)] border border-[var(--line)] px-3.5 py-2.5">
              <Row l={L("Valeur", "Value")} v={F.money(costs.valueLocal, cashCcy(inst.c))} />
              {!isEur && <Row l={L(`Taux de change EUR/${cashCcy(inst.c)}`, `EUR/${cashCcy(inst.c)} rate`)} v={rate.toFixed(4)} />}
              {!isEur && <Row l={L("Valeur en euros", "Value in euros")} v={F.eur(costs.valueEur)} />}
              <Row l={L("Frais de transaction", "Transaction fees")} v={F.eur(costs.commission)} />
              {!isEur && <Row l={acct.settings.autoFx ? L("Frais de conversion automatique", "Auto conversion fee") : L("Conversion", "Conversion")} v={acct.settings.autoFx ? `${F.eur(costs.fxFee)} (${(FEE_PROFILES[acct.settings.fees].fx * 100).toLocaleString(F.loc)} %)` : L(`débité en ${cashCcy(inst.c)}`, `paid in ${cashCcy(inst.c)}`)} />}
              {acct.settings.tob && <Row l={L("Taxe sur les opérations de bourse", "Stock exchange tax (TOB)")} v={F.eur(costs.tax)} />}
              <div className="my-1.5 border-t border-[var(--line)]" />
              <Row l={side === "buy" ? L("Total débité", "Total debited") : L("Total crédité", "Total credited")} v={F.eur(costs.totalEur)} strong />
              <Row l={L("Frais en % de l'ordre", "Fees as % of order")} v={`${(((costs.commission + costs.fxFee + costs.tax) / costs.valueEur) * 100).toLocaleString(F.loc, { maximumFractionDigits: 2 })} %`} tone={(costs.commission + costs.fxFee + costs.tax) / costs.valueEur > 0.01 ? "text-[var(--warn)]" : undefined} />
            </div>
            {(costs.commission + costs.fxFee + costs.tax) / costs.valueEur > 0.01 && <p className="text-[12.5px] text-[var(--warn)]">{L("Les frais dépassent 1 % de l'ordre : regroupez vos achats en ordres plus importants.", "Fees exceed 1% of the order: group your purchases into larger orders.")}</p>}
            {type === "MKT" && <p className={cn("text-[12px]", k.sub)}>{L("Exécution au dernier cours connu (différé d'environ 15 minutes).", "Fills at the last known price (delayed by about 15 minutes).")}</p>}
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <button onClick={() => setStep("edit")} className={cn(k.btn, "h-11", k.chip)}>{L("Modifier", "Edit")}</button>
              <button onClick={submit} className={cn(k.btn, "h-11 text-[14.5px] text-white", sideColor)}><ShieldCheck size={16} />{L("Passer l'ordre", "Place order")}</button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

