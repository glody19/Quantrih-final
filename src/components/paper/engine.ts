/**
 * Paper-trading engine: a euro account with cash in several currencies, broker fees, currency
 * conversion fees, Belgian stock-exchange tax (optional) and integer shares unless fractions are on.
 * Everything here is pure: the page holds the state and calls these functions.
 */
import { describe, type Instrument, type Kind } from "./universe";

export const STORE = "quantrih_paper_v3";
export const THEME_KEY = "quantrih_paper_theme";
export const FAV_KEY = "quantrih_paper_favs";
export const PENDING_MODEL = "quantrih_vp_pending_model";
export const DEFAULT_FAVS = ["VWCE.DE", "IWDA.AS", "SXR8.DE", "ASML.AS", "MC.PA", "AAPL", "NVDA", "BTC-EUR"];

export type FeeProfile = "lowcost" | "neo" | "bank" | "none";
export type OrderType = "MKT" | "LMT" | "STP";
export type Side = "buy" | "sell";

export interface Settings { fees: FeeProfile; autoFx: boolean; tob: boolean; priips: boolean; fractions: boolean }
export interface Position { qty: number; costEur: number; costLocal: number; name: string; ccy: string }
export interface Trade {
  id: number; t: number; symbol: string; name: string; side: Side; qty: number; price: number; ccy: string;
  rate: number; valueEur: number; commission: number; fxFee: number; tax: number; totalEur: number; type: OrderType | "STRAT"; realized?: number;
}
export interface Order { id: number; t: number; symbol: string; name: string; side: Side; qty: number; type: "LMT" | "STP"; price: number; ccy: string; tif: "day" | "gtc"; day: string }
export interface Move { id: number; t: number; kind: "deposit" | "buy" | "sell" | "commission" | "fx" | "tax" | "fxfee"; ccy: string; amount: number; desc: string }
export interface Plan { id: number; name: string; weights: { symbol: string; weight: number }[]; amount: number; day: number; deposit: boolean; lastRun: string | null; active: boolean }
export interface Account {
  v: 3; created: number; deposits: number; cash: Record<string, number>; positions: Record<string, Position>;
  trades: Trade[]; orders: Order[]; moves: Move[]; history: { d: string; v: number }[]; settings: Settings; plans: Plan[];
  /** conversion fees paid on manual currency exchanges, in euros */
  extraFees?: number;
}
export interface Quote { price: number; pct: number; change: number; ccy: string; name: string }

export const DEFAULT_SETTINGS: Settings = { fees: "lowcost", autoFx: true, tob: false, priips: true, fractions: false };

export const freshAccount = (start = 100_000, settings: Settings = DEFAULT_SETTINGS): Account => ({
  v: 3, created: Date.now(), deposits: start, cash: { EUR: start }, positions: {}, trades: [], orders: [],
  moves: [{ id: Date.now(), t: Date.now(), kind: "deposit", ccy: "EUR", amount: start, desc: "Dépôt initial" }], history: [], settings, plans: [],
});

export const loadAccount = (): Account => {
  try {
    const a = JSON.parse(localStorage.getItem(STORE) || "null");
    if (a && a.v === 3 && a.cash && a.positions) return { ...freshAccount(), ...a, settings: { ...DEFAULT_SETTINGS, ...a.settings } };
  } catch { /* storage unavailable */ }
  return freshAccount();
};

/** Cash currency for a trading currency: London prices are in pence. */
export const cashCcy = (ccy: string) => (ccy === "GBp" || ccy === "GBX" ? "GBP" : ccy);
export const unit = (ccy: string) => (ccy === "GBp" || ccy === "GBX" ? 0.01 : 1);
/** Yahoo pair giving units of `ccy` per euro. */
export const fxPair = (ccy: string) => (cashCcy(ccy) === "EUR" ? null : `EUR${cashCcy(ccy)}=X`);
export const today = () => new Date().toISOString().slice(0, 10);
export const month = () => new Date().toISOString().slice(0, 7);

export const FEE_PROFILES: Record<FeeProfile, { fr: string; en: string; noteFr: string; noteEn: string; fx: number }> = {
  lowcost: { fr: "Courtier en ligne low cost", en: "Low-cost online broker", noteFr: "2 € par ordre en bourse (1 € de commission + 1 € de frais de connexion), 1 € sur les ETF de la sélection, conversion de devises 0,25 %.", noteEn: "€2 per order (€1 commission + €1 handling fee), €1 on selected ETFs, currency conversion 0.25%.", fx: 0.0025 },
  neo: { fr: "Néo-courtier", en: "Neo-broker", noteFr: "1 € par ordre quel que soit le montant, conversion de devises 0,15 %.", noteEn: "€1 per order whatever the amount, currency conversion 0.15%.", fx: 0.0015 },
  bank: { fr: "Banque traditionnelle", en: "Traditional bank", noteFr: "0,50 % du montant, minimum 9,95 € (0,75 %, minimum 25 € hors Europe), conversion de devises 0,50 %.", noteEn: "0.50% of the amount, minimum €9.95 (0.75%, minimum €25 outside Europe), currency conversion 0.50%.", fx: 0.005 },
  none: { fr: "Sans frais", en: "No fees", noteFr: "Aucun frais : utile pour comparer avec un compte réel.", noteEn: "No fees at all: useful to compare with a real account.", fx: 0 },
};

/** Commission in euros for an order worth `valueEur`. */
export function commission(profile: FeeProfile, inst: Instrument, valueEur: number): number {
  const foreign = inst.r === "us" || inst.r === "em" || (inst.r === "world" && inst.c !== "EUR");
  switch (profile) {
    case "none": return 0;
    case "neo": return 1;
    case "lowcost":
      if (inst.k === "crypto") return Math.max(1, valueEur * 0.005);
      return inst.k === "etf" || inst.k === "bond" || inst.k === "commodity" ? (inst.c === "EUR" ? 1 : 2) : 2;
    case "bank":
      return foreign ? Math.max(25, valueEur * 0.0075) : Math.max(9.95, valueEur * 0.005);
  }
}

/** Belgian tax on stock-exchange transactions (TOB), simplified: 0.35% on shares, 0.12% on ETFs and bonds. */
export function tob(on: boolean, k: Kind, valueEur: number): number {
  if (!on || k === "crypto") return 0;
  return k === "stock" ? Math.min(valueEur * 0.0035, 1600) : Math.min(valueEur * 0.0012, 1300);
}

export interface Costs { valueLocal: number; valueEur: number; commission: number; fxFee: number; tax: number; totalEur: number; needCash: { ccy: string; amount: number }[] }

/** Every cost of an order, and the cash it consumes (buy) or frees (sell). */
export function costOrder(acct: Account, inst: Instrument, side: Side, qty: number, price: number, rate: number): Costs {
  const s = acct.settings;
  const valueLocal = qty * price * unit(inst.c); // in cash currency
  const valueEur = valueLocal / rate;
  const isEur = cashCcy(inst.c) === "EUR";
  const fxFee = !isEur && s.autoFx ? valueEur * FEE_PROFILES[s.fees].fx : 0;
  const com = commission(s.fees, inst, valueEur);
  const tax = tob(s.tob, inst.k, valueEur);
  const fees = com + fxFee + tax;
  const totalEur = side === "buy" ? valueEur + fees : valueEur - fees;
  const needCash = side === "buy"
    ? (isEur || s.autoFx ? [{ ccy: "EUR", amount: valueEur + fees }] : [{ ccy: cashCcy(inst.c), amount: valueLocal }, { ccy: "EUR", amount: com + tax }])
    : [{ ccy: "EUR", amount: Math.max(0, fees - (isEur || s.autoFx ? valueEur : 0)) }];
  return { valueLocal, valueEur, commission: com, fxFee, tax, totalEur, needCash };
}

export const missingCash = (acct: Account, c: Costs) => c.needCash.find((n) => (acct.cash[n.ccy] || 0) + 1e-6 < n.amount) || null;

let seq = 0;
const uid = () => Date.now() * 1000 + (seq++ % 1000);

/** Applies a filled order to the account. The caller checks cash and quantity first. */
export function fill(acct: Account, symbol: string, name: string, inst: Instrument, side: Side, qty: number, price: number, rate: number, type: Trade["type"]): Account {
  const c = costOrder(acct, inst, side, qty, price, rate);
  const s = acct.settings;
  const cc = cashCcy(inst.c);
  const isEur = cc === "EUR";
  const cash = { ...acct.cash };
  const moves: Move[] = [];
  const t = Date.now();
  const add = (ccy: string, amount: number, kind: Move["kind"], desc: string) => {
    if (Math.abs(amount) < 1e-9) return;
    cash[ccy] = (cash[ccy] || 0) + amount;
    moves.push({ id: uid(), t, kind, ccy, amount, desc });
  };
  const label = `${side === "buy" ? "Achat" : "Vente"} ${fmtQty(qty)} ${symbol} @ ${price.toFixed(price < 10 ? 4 : 2)} ${inst.c}`;
  if (isEur || s.autoFx) {
    add("EUR", side === "buy" ? -c.valueEur : c.valueEur, side, label + (isEur ? "" : ` (${cc}/EUR ${rate.toFixed(4)})`));
    if (c.fxFee) add("EUR", -c.fxFee, "fxfee", `Frais de conversion ${cc}/EUR`);
  } else {
    add(cc, side === "buy" ? -c.valueLocal : c.valueLocal, side, label);
  }
  if (c.commission) add("EUR", -c.commission, "commission", `Frais de transaction ${symbol}`);
  if (c.tax) add("EUR", -c.tax, "tax", `Taxe sur les opérations de bourse ${symbol}`);

  const positions = { ...acct.positions };
  const pos = positions[symbol] || { qty: 0, costEur: 0, costLocal: 0, name, ccy: inst.c };
  let realized: number | undefined;
  if (side === "buy") {
    positions[symbol] = { qty: pos.qty + qty, costEur: pos.costEur + c.totalEur, costLocal: pos.costLocal + qty * price, name, ccy: inst.c };
  } else {
    const frac = Math.min(1, qty / pos.qty);
    realized = c.totalEur - pos.costEur * frac;
    const left = pos.qty - qty;
    if (left <= 1e-9) delete positions[symbol];
    else positions[symbol] = { ...pos, qty: left, costEur: pos.costEur * (1 - frac), costLocal: pos.costLocal * (1 - frac) };
  }
  const trade: Trade = { id: uid(), t, symbol, name, side, qty, price, ccy: inst.c, rate, valueEur: c.valueEur, commission: c.commission, fxFee: c.fxFee, tax: c.tax, totalEur: c.totalEur, type, realized };
  return { ...acct, cash, positions, trades: [trade, ...acct.trades].slice(0, 500), moves: [...moves.reverse(), ...acct.moves].slice(0, 1500) };
}

/** Manual currency conversion between two cash balances, with the profile's conversion fee. */
export function convert(acct: Account, from: string, to: string, amountFrom: number, rates: Record<string, number>): Account | null {
  const rf = from === "EUR" ? 1 : rates[from];
  const rt = to === "EUR" ? 1 : rates[to];
  if (!rf || !rt || amountFrom <= 0 || (acct.cash[from] || 0) + 1e-6 < amountFrom) return null;
  const eur = amountFrom / rf;
  const fee = eur * FEE_PROFILES[acct.settings.fees].fx;
  const received = (eur - fee) * rt;
  const t = Date.now();
  const cash = { ...acct.cash, [from]: (acct.cash[from] || 0) - amountFrom, [to]: (acct.cash[to] || 0) + received };
  const moves: Move[] = [
    { id: uid(), t, kind: "fx", ccy: from, amount: -amountFrom, desc: `Change ${from} → ${to}` },
    { id: uid(), t, kind: "fx", ccy: to, amount: received, desc: `Change ${from} → ${to} (taux ${(rt / rf).toFixed(4)}, frais ${fee.toFixed(2)} €)` },
  ];
  if (Math.abs(cash[from]) < 1e-7) delete cash[from];
  return { ...acct, cash, extraFees: (acct.extraFees || 0) + fee, moves: [...moves.reverse(), ...acct.moves].slice(0, 1500) };
}

export function deposit(acct: Account, amount: number, desc = "Dépôt"): Account {
  const t = Date.now();
  return { ...acct, deposits: acct.deposits + amount, cash: { ...acct.cash, EUR: (acct.cash.EUR || 0) + amount }, moves: [{ id: uid(), t, kind: "deposit", ccy: "EUR", amount, desc }, ...acct.moves] };
}

export const fmtQty = (q: number) => (Math.abs(q - Math.round(q)) < 1e-9 ? String(Math.round(q)) : q.toFixed(q < 1 ? 6 : 4).replace(/0+$/, ""));

/** Quantity that a euro amount buys, rounded down to whole shares unless fractions are allowed (crypto always fractional). */
export function qtyForEur(eur: number, inst: Instrument, price: number, rate: number, fractions: boolean): number {
  const per = price * unit(inst.c) / rate;
  if (!per) return 0;
  const raw = eur / per;
  return fractions || inst.k === "crypto" ? Math.floor(raw * 1e6) / 1e6 : Math.floor(raw);
}

export interface PlannedOrder { symbol: string; inst: Instrument; side: Side; qty: number; price: number; rate: number; targetEur: number; costs: Costs }

/**
 * Orders that bring the portfolio to `weights` (in %). With `mode = "invest"` only `amount` euros of new money
 * are spread by weight; with `mode = "rebalance"` current holdings in the strategy are sold or topped up so that
 * the whole strategy sleeve plus `amount` matches the weights.
 */
export function planOrders(
  acct: Account, weights: { symbol: string; weight: number }[], amount: number, mode: "invest" | "rebalance",
  quotes: Record<string, Quote>, rateOf: (ccy: string) => number | undefined,
): { orders: PlannedOrder[]; missing: string[] } {
  const total = weights.reduce((a, w) => a + w.weight, 0) || 1;
  const missing: string[] = [];
  const valueEur = (sym: string) => {
    const p = acct.positions[sym]; const q = quotes[sym];
    if (!p || !q) return 0;
    const r = rateOf(q.ccy);
    return r ? (p.qty * q.price * unit(q.ccy)) / r : 0;
  };
  const sleeve = mode === "rebalance" ? weights.reduce((a, w) => a + valueEur(w.symbol), 0) + amount : amount;
  const orders: PlannedOrder[] = [];
  for (const w of weights) {
    const q = quotes[w.symbol];
    const rate = q ? rateOf(q.ccy) : undefined;
    if (!q || !rate) { missing.push(w.symbol); continue; }
    const inst = describe(w.symbol, { name: q.name, ccy: q.ccy });
    const target = (sleeve * w.weight) / total;
    const diff = target - (mode === "rebalance" ? valueEur(w.symbol) : 0);
    const side: Side = diff >= 0 ? "buy" : "sell";
    let qty = qtyForEur(Math.abs(diff), inst, q.price, rate, acct.settings.fractions);
    if (side === "sell") qty = Math.min(qty, acct.positions[w.symbol]?.qty || 0);
    if (qty <= 0) continue;
    orders.push({ symbol: w.symbol, inst, side, qty, price: q.price, rate, targetEur: target, costs: costOrder(acct, inst, side, qty, q.price, rate) });
  }
  // sells first so that their proceeds fund the buys
  orders.sort((a, b) => (a.side === b.side ? 0 : a.side === "sell" ? -1 : 1));
  return { orders, missing };
}
