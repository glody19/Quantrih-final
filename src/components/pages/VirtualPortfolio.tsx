import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Moon, RotateCcw, Search, Sun, TriangleAlert, Plus, X, Lock } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { MODEL_PORTFOLIOS } from "../../data/modelPortfolios";
import { PriceChart } from "../trading/PriceChart";
import { MarketHours } from "../trading/MarketHours";

const START_CASH = 100_000;
const STORE = "quantrih_vp_v2";
const OLD_STORE = "quantrih_vp_v1";
const WATCH = "quantrih_vp_watch";
const THEME = "quantrih_vp_theme2";
const PENDING_MODEL = "quantrih_vp_pending_model";
const DEFAULT_WATCH = ["AAPL", "MSFT", "NVDA", "SPY", "QQQ", "VWCE.DE", "IWDA.AS", "ASML.AS", "BTC-USD"];

interface Position { qty: number; cost: number; name: string } // cost = total paid, in USD
interface Trade { t: number; symbol: string; side: "buy" | "sell"; qty: number; price: number; value: number; type: "MKT" | "LMT" }
interface Order { id: number; t: number; symbol: string; side: "buy" | "sell"; qty: number; limit: number; name: string } // limit in USD
interface Account { cash: number; positions: Record<string, Position>; trades: Trade[]; orders: Order[] }
interface Quote { price: number; pct: number; ccy: string; name: string; usd: number; change: number }

const fresh = (): Account => ({ cash: START_CASH, positions: {}, trades: [], orders: [] });
const read = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ } };
const loadAccount = (): Account => {
  const a = read<any>(STORE, null) || read<any>(OLD_STORE, null);
  if (a && typeof a.cash === "number" && a.positions && Array.isArray(a.trades)) {
    return { cash: a.cash, positions: a.positions, trades: a.trades.map((x: any) => ({ type: "MKT", ...x })), orders: Array.isArray(a.orders) ? a.orders : [] };
  }
  return fresh();
};
const money = (v: number, d = 2) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });
const px = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: Math.abs(v) < 10 ? 3 : 2, maximumFractionDigits: Math.abs(v) < 10 ? 4 : 2 });
const fxSymbol = (ccy: string) => (ccy === "USD" ? null : `${ccy === "GBp" ? "GBP" : ccy}USD=X`);
const qfmt = (q: number) => q.toFixed(q < 10 ? 4 : 2);

const T = {
  en: {
    title: "Paper trading", sub: "$100,000 of virtual money at real market prices. No real order is ever sent.",
    net: "Net liquidation", cash: "Cash", invested: "Market value", pnl: "Unrealised P&L", day: "Daily P&L", total: "Total return",
    watch: "Watchlist", search: "Add a symbol or company", buy: "Buy", sell: "Sell", market: "Market", limit: "Limit",
    qty: "Quantity", amount: "Amount $", limitPx: "Limit price", est: "Est. value", after: "Cash after", submit: "Submit",
    owned: "Position", errCash: "Not enough cash.", errQty: "Quantity above your position.", errZero: "Enter a quantity.", errPrice: "Quote unavailable.", errLimit: "Enter a limit price.",
    positions: "Positions", orders: "Open orders", history: "Trades", empty: "No positions.", noOrders: "No open orders.", noHistory: "No trades yet.",
    sym: "Symbol", last: "Last", chg: "Chg %", avg: "Avg cost", value: "Mkt value", gain: "P&L", side: "Side", type: "Type", px: "Price", time: "Time", cancel: "Cancel",
    model: "Model allocation", modelBtn: "Buy",
    reset: "Reset", resetConfirm: "Reset the account to $100,000 and delete all positions and orders?",
    signin: "Create a free account to place orders.", signinBtn: "Create an account",
    delayed: "Quotes delayed by about 15 minutes. Market orders fill at the last known price; limit orders fill when the quote reaches the limit. Exchange hours exclude public holidays. Educational simulation only.",
    noData: "Live quotes are unavailable right now: orders are paused.", unavailable: "Quote unavailable",
    filled: "Filled", placed: "Limit order placed", light: "Light", dark: "Dark", loading: "Loading chart", fallback: "Price history unavailable here, showing the TradingView chart.",
  },
  fr: {
    title: "Trading virtuel", sub: "100 000 $ virtuels aux vrais cours du marché. Aucun ordre réel n'est jamais transmis.",
    net: "Valeur liquidative", cash: "Liquidités", invested: "Valeur de marché", pnl: "P&L latent", day: "P&L du jour", total: "Rendement total",
    watch: "Liste de suivi", search: "Ajouter un symbole ou une société", buy: "Acheter", sell: "Vendre", market: "Marché", limit: "Limite",
    qty: "Quantité", amount: "Montant $", limitPx: "Prix limite", est: "Valeur est.", after: "Liquidités après", submit: "Transmettre",
    owned: "Position", errCash: "Liquidités insuffisantes.", errQty: "Quantité supérieure à votre position.", errZero: "Saisissez une quantité.", errPrice: "Cours indisponible.", errLimit: "Saisissez un prix limite.",
    positions: "Positions", orders: "Ordres ouverts", history: "Transactions", empty: "Aucune position.", noOrders: "Aucun ordre ouvert.", noHistory: "Aucune transaction.",
    sym: "Symbole", last: "Dernier", chg: "Var. %", avg: "Prix moyen", value: "Valeur", gain: "P&L", side: "Sens", type: "Type", px: "Prix", time: "Heure", cancel: "Annuler",
    model: "Allocation modèle", modelBtn: "Acheter",
    reset: "Réinitialiser", resetConfirm: "Remettre le compte à 100 000 $ et supprimer positions et ordres ?",
    signin: "Créez un compte gratuit pour passer des ordres.", signinBtn: "Créer un compte",
    delayed: "Cours différés d'environ 15 minutes. Les ordres au marché sont exécutés au dernier cours connu ; les ordres à cours limité quand le cours atteint la limite. Les horaires des bourses ne tiennent pas compte des jours fériés. Simulation pédagogique uniquement.",
    noData: "Les cours en direct sont indisponibles : les ordres sont suspendus.", unavailable: "Cours indisponible",
    filled: "Exécuté", placed: "Ordre à cours limité placé", light: "Clair", dark: "Sombre", loading: "Chargement du graphique", fallback: "Historique indisponible ici, graphique TradingView affiché.",
  },
};

/** Number that counts from its previous value to the new one (from zero on first display). */
function Num({ value, format, delay = 0 }: { value: number; format: (v: number) => string; delay?: number }) {
  const [v, setV] = useState(0);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const first = prev.current === null;
    const c = animate(prev.current ?? 0, value, { duration: first ? 1.4 : 0.6, delay: first ? delay : 0, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value, delay]);
  return <>{format(v)}</>;
}

export function VirtualPortfolio() {
  const { language } = useTranslation();
  const fr = language === "fr";
  const t = fr ? T.fr : T.en;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [acct, setAcct] = useState<Account>(loadAccount);
  const [watch, setWatch] = useState<string[]>(() => { const w = read<string[]>(WATCH, DEFAULT_WATCH); return Array.isArray(w) && w.length ? w : DEFAULT_WATCH; });
  const [dark, setDark] = useState<boolean>(() => read<string>(THEME, "light") === "dark");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [dataOk, setDataOk] = useState(true);
  const [symbol, setSymbol] = useState(() => watch[0] || "AAPL");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; label: string; exchange: string | null; type: string }[]>([]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [otype, setOtype] = useState<"MKT" | "LMT">("MKT");
  const [mode, setMode] = useState<"qty" | "amount">("qty");
  const [input, setInput] = useState("10");
  const [limitIn, setLimitIn] = useState("");
  const [tab, setTab] = useState<"positions" | "orders" | "history">("positions");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [modelId, setModelId] = useState(MODEL_PORTFOLIOS[0].id);
  const [modelAmount, setModelAmount] = useState("10000");
  const [gate, setGate] = useState(false);

  useEffect(() => write(STORE, acct), [acct]);
  useEffect(() => write(WATCH, watch), [watch]);
  useEffect(() => write(THEME, dark ? "dark" : "light"), [dark]);
  useEffect(() => {
    try {
      const pending = localStorage.getItem(PENDING_MODEL);
      if (pending && MODEL_PORTFOLIOS.some((m) => m.id === pending)) { setModelId(pending); localStorage.removeItem(PENDING_MODEL); }
    } catch { /* storage unavailable */ }
  }, []);

  // ── quotes, converted to USD with live currency pairs ──
  const fetchQuotes = useCallback(async (symbols: string[]): Promise<Record<string, Quote>> => {
    const get = async (list: string[]) => {
      const res = await fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${encodeURIComponent(list.join(","))}`);
      if (!res.ok || res.headers.get("X-Quantrih-Data") === "demo") throw new Error("no live data");
      return (await res.json()) as any[];
    };
    const raw = await get(symbols);
    const pairs = Array.from(new Set(raw.map((q) => fxSymbol(q?.currency || "USD")).filter(Boolean))) as string[];
    const fx: Record<string, number> = {};
    if (pairs.length) (await get(pairs)).forEach((q) => { if (q?.symbol && typeof q.regularMarketPrice === "number") fx[q.symbol] = q.regularMarketPrice; });
    const out: Record<string, Quote> = {};
    raw.forEach((q) => {
      if (!q?.symbol || typeof q.regularMarketPrice !== "number") return;
      const ccy = q.currency || "USD";
      const pair = fxSymbol(ccy);
      const rate = pair ? fx[pair] : 1;
      if (!rate) return;
      out[q.symbol] = { price: q.regularMarketPrice, pct: q.regularMarketChangePercent ?? 0, change: q.regularMarketChange ?? 0, ccy, name: q.shortName || q.longName || q.symbol, usd: q.regularMarketPrice * rate * (ccy === "GBp" ? 0.01 : 1) };
    });
    return out;
  }, []);

  const tracked = useMemo(() => Array.from(new Set([symbol, ...watch, ...Object.keys(acct.positions), ...acct.orders.map((o) => o.symbol)])), [symbol, watch, acct.positions, acct.orders]);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (document.hidden) return;
      try {
        const q = await fetchQuotes(tracked);
        if (alive) { setQuotes((old) => ({ ...old, ...q })); setDataOk(Object.keys(q).length > 0); }
      } catch { if (alive) setDataOk(false); }
    };
    run();
    const id = setInterval(run, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [tracked, fetchQuotes]);

  // ── search ──
  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const id = setTimeout(() => {
      fetch(`/api/stock/search?q=${encodeURIComponent(query.trim())}`).then((r) => (r.ok ? r.json() : { result: [] })).then((d) => setResults((d.result || []).slice(0, 8))).catch(() => setResults([]));
    }, 220);
    return () => clearTimeout(id);
  }, [query]);

  // ── execution ──
  const execute = (a: Account, sym: string, s: "buy" | "sell", qty: number, priceUsd: number, name: string, type: "MKT" | "LMT"): Account => {
    const value = qty * priceUsd;
    const pos = a.positions[sym] || { qty: 0, cost: 0, name };
    const positions = { ...a.positions };
    if (s === "buy") positions[sym] = { qty: pos.qty + qty, cost: pos.cost + value, name };
    else {
      const left = pos.qty - qty;
      if (left <= 1e-9) delete positions[sym]; else positions[sym] = { ...pos, qty: left, cost: pos.cost * (left / pos.qty) };
    }
    return { ...a, cash: a.cash + (s === "buy" ? -value : value), positions, trades: [{ t: Date.now(), symbol: sym, side: s, qty, price: priceUsd, value, type }, ...a.trades].slice(0, 300) };
  };

  // limit orders fill when the live quote crosses the limit
  useEffect(() => {
    if (!acct.orders.length) return;
    setAcct((a) => {
      let next = a;
      const keep: Order[] = [];
      for (const o of a.orders) {
        const lq = quotes[o.symbol];
        const hit = lq && (o.side === "buy" ? lq.usd <= o.limit : lq.usd >= o.limit);
        const affordable = o.side === "buy" ? next.cash >= o.qty * o.limit - 1e-6 : (next.positions[o.symbol]?.qty || 0) >= o.qty - 1e-9;
        if (hit && affordable) next = execute(next, o.symbol, o.side, o.qty, o.limit, o.name, "LMT");
        else keep.push(o);
      }
      return keep.length === a.orders.length ? a : { ...next, orders: keep };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes]);

  // ── derived figures ──
  const rows = useMemo(() => Object.entries(acct.positions).map(([s, p]) => {
    const pq = quotes[s];
    const value = pq ? p.qty * pq.usd : p.cost;
    return { s, ...p, q: pq, value, gain: value - p.cost, dayGain: pq ? value - value / (1 + pq.pct / 100) : 0 };
  }).sort((a, b) => b.value - a.value), [acct.positions, quotes]);
  const invested = rows.reduce((a, r) => a + r.value, 0);
  const net = acct.cash + invested;
  const unreal = rows.reduce((a, r) => a + r.gain, 0);
  const dayGain = rows.reduce((a, r) => a + r.dayGain, 0);

  const q = quotes[symbol];
  const held = acct.positions[symbol]?.qty || 0;
  const n = parseFloat(input.replace(",", ".")) || 0;
  const lim = parseFloat(limitIn.replace(",", ".")) || 0;
  const fxRate = q && q.price ? q.usd / q.price : 1;
  const execPxUsd = otype === "LMT" ? lim * fxRate : q?.usd || 0;
  const orderQty = mode === "qty" ? n : execPxUsd ? n / execPxUsd : 0;
  const orderValue = orderQty * execPxUsd;
  const error = !q ? t.errPrice : n <= 0 ? t.errZero : otype === "LMT" && lim <= 0 ? t.errLimit
    : side === "buy" && orderValue > acct.cash + 1e-6 ? t.errCash : side === "sell" && orderQty > held + 1e-9 ? t.errQty : null;

  // orders need an account: without one, the ticket points to account creation
  const submit = () => {
    if (!user) { setGate(true); return; }
    if (error || !q || !dataOk) return;
    if (otype === "MKT") {
      setAcct((a) => execute(a, symbol, side, orderQty, q.usd, q.name, "MKT"));
      setMsg({ ok: true, text: `${t.filled}: ${side === "buy" ? t.buy : t.sell} ${qfmt(orderQty)} ${symbol} @ ${px(q.price)} ${q.ccy}` });
      setTab("positions");
    } else {
      setAcct((a) => ({ ...a, orders: [{ id: Date.now(), t: Date.now(), symbol, side, qty: orderQty, limit: execPxUsd, name: q.name }, ...a.orders] }));
      setMsg({ ok: true, text: `${t.placed}: ${side === "buy" ? t.buy : t.sell} ${qfmt(orderQty)} ${symbol} @ ${px(lim)} ${q.ccy}` });
      setTab("orders");
    }
  };

  const buyModel = async () => {
    if (!user) { setGate(true); return; }
    const model = MODEL_PORTFOLIOS.find((m) => m.id === modelId)!;
    const amount = parseFloat(modelAmount.replace(",", ".")) || 0;
    if (amount <= 0) return setMsg({ ok: false, text: t.errZero });
    if (amount > acct.cash) return setMsg({ ok: false, text: t.errCash });
    try {
      const mq = await fetchQuotes(model.holdings.map((h) => h.symbol));
      if (model.holdings.some((h) => !mq[h.symbol])) return setMsg({ ok: false, text: t.errPrice });
      setQuotes((old) => ({ ...old, ...mq }));
      setAcct((a) => model.holdings.reduce((acc, h) => execute(acc, h.symbol, "buy", (amount * h.weight) / 100 / mq[h.symbol].usd, mq[h.symbol].usd, mq[h.symbol].name, "MKT"), a));
      setMsg({ ok: true, text: `${t.filled}: ${model.name}, ${money(amount, 0)}` });
      setTab("positions");
    } catch { setDataOk(false); }
  };

  const pick = (s: string) => { setSymbol(s); setMsg(null); setLimitIn(""); };
  const addWatch = (s: string) => { setWatch((w) => (w.includes(s) ? w : [...w, s])); pick(s); setQuery(""); setResults([]); };

  // ── palette: plain white by default, navy in dark mode ──
  const c = dark
    ? { page: "bg-[#0B1622] text-slate-100", panel: "bg-[#0F1D2B]", line: "border-white/[0.07]", sub: "text-slate-400", hover: "hover:bg-white/[0.04]", input: "bg-[#0B1622] border-white/10 text-white", pill: "bg-white/[0.06] text-slate-200", on: "bg-white/[0.14] text-white" }
    : { page: "bg-white text-slate-900", panel: "bg-white", line: "border-slate-200/80", sub: "text-slate-500", hover: "hover:bg-slate-50", input: "bg-white border-slate-200 text-slate-900", pill: "bg-slate-100 text-slate-700", on: "bg-[#0C2233] text-white" };
  const up = dark ? "text-emerald-400" : "text-emerald-600", down = dark ? "text-red-400" : "text-red-600";
  const sign = (v: number) => (v >= 0 ? up : down);
  const inputCls = cn("w-full h-9 rounded-md border px-2.5 text-[13px] tabular-nums outline-none focus:border-[#2563EB]", c.input);

  const summary = [
    { l: t.net, v: net, f: (v: number) => money(v) },
    { l: t.cash, v: acct.cash, f: (v: number) => money(v) },
    { l: t.invested, v: invested, f: (v: number) => money(v) },
    { l: t.pnl, v: unreal, f: (v: number) => (v >= 0 ? "+" : "") + money(v), signed: true },
    { l: t.day, v: dayGain, f: (v: number) => (v >= 0 ? "+" : "") + money(v), signed: true },
    { l: t.total, v: ((net - START_CASH) / START_CASH) * 100, f: (v: number) => (v >= 0 ? "+" : "") + v.toFixed(2) + "%", signed: true },
  ];

  return (
    <div className={cn("min-h-screen -mt-4 lg:-mt-6 pb-16 transition-colors font-sans", c.page)}>
      {/* ── Top bar: title, live exchange clocks, theme ── */}
      <div className={cn("border-b", c.line)}>
        <div className="max-w-[1800px] mx-auto px-3 sm:px-5 pt-4 pb-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="mr-auto">
            <h1 className={cn("text-[22px] font-semibold tracking-tight", dark && "!text-white")}>{t.title}</h1>
            <p className={cn("text-[12.5px]", c.sub)}>{t.sub}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setDark((d) => !d)} className={cn("h-8 px-3 rounded-md text-[12.5px] font-semibold inline-flex items-center gap-1.5", c.pill)}>{dark ? <Sun size={14} /> : <Moon size={14} />}{dark ? t.light : t.dark}</button>
            <button onClick={() => { if (window.confirm(t.resetConfirm)) { setAcct(fresh()); setMsg(null); } }} className={cn("h-8 px-3 rounded-md text-[12.5px] font-semibold inline-flex items-center gap-1.5", c.pill)}><RotateCcw size={13} />{t.reset}</button>
          </div>
        </div>
        <div className="max-w-[1800px] mx-auto px-3 sm:px-5 pb-3"><MarketHours dark={dark} fr={fr} /></div>
        {/* account strip */}
        <div className={cn("border-t", c.line)}>
          <div className="max-w-[1800px] mx-auto px-3 sm:px-5 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2">
            {summary.map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                <span className={cn("block text-[11px] font-semibold uppercase tracking-[0.1em]", c.sub)}>{s.l}</span>
                <b className={cn("block text-[18px] font-semibold tabular-nums", s.signed && sign(s.v))}><Num value={s.v} format={s.f} delay={0.2 + i * 0.12} /></b>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {!dataOk && <p className="max-w-[1800px] mx-auto mt-3 px-3 sm:px-5 flex items-center gap-2 text-[13px] text-amber-600"><TriangleAlert size={15} /> {t.noData}</p>}

      <div className="max-w-[1800px] mx-auto px-3 sm:px-5 mt-3 grid gap-3 xl:grid-cols-[270px_minmax(0,1fr)_290px]">
        {/* ── Watchlist ── */}
        <aside className={cn("rounded-lg border", c.panel, c.line)}>
          <div className={cn("flex items-center px-3 h-10 border-b text-[13px] font-semibold", c.line)}>{t.watch}</div>
          <div className="relative px-2 pt-2">
            <Search size={14} className={cn("absolute left-4 top-[22px] -translate-y-1/2", c.sub)} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className={cn(inputCls, "pl-8")} />
            {results.length > 0 && (
              <ul className={cn("absolute z-30 left-2 right-2 mt-1 rounded-md border shadow-xl overflow-hidden", c.panel, c.line)}>
                {results.map((r) => (
                  <li key={r.symbol}>
                    <button onClick={() => addWatch(r.symbol)} className={cn("w-full flex items-center justify-between gap-2 px-3 py-2 text-left", c.hover)}>
                      <span className="min-w-0"><b className="text-[12.5px]">{r.symbol}</b><span className={cn("block text-[11px] truncate", c.sub)}>{r.label}</span></span>
                      <Plus size={13} className={c.sub} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="py-1.5 max-h-[600px] overflow-y-auto">
            {watch.map((s, i) => {
              const w = quotes[s];
              return (
                <motion.li key={s} className="group relative" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <button onClick={() => pick(s)} className={cn("w-full grid grid-cols-[1fr_auto] items-center gap-2 pl-3 pr-7 py-1.5 text-left transition-colors", c.hover, symbol === s && (dark ? "bg-white/[0.07]" : "bg-blue-50"))}>
                    <span className="min-w-0">
                      <b className="block text-[12.5px] leading-tight">{s}</b>
                      <span className={cn("block text-[11px] truncate leading-tight", c.sub)}>{w?.name || " "}</span>
                    </span>
                    <span className="text-right leading-tight">
                      {w ? (<><b className="block text-[12.5px] tabular-nums">{px(w.price)}</b><span className={cn("block text-[11px] tabular-nums", sign(w.pct))}>{w.pct >= 0 ? "+" : ""}{w.pct.toFixed(2)}%</span></>)
                        : <span className={cn("text-[11px]", c.sub)}>-</span>}
                    </span>
                  </button>
                  <button onClick={() => setWatch((l) => l.filter((x) => x !== s))} className={cn("absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity", c.sub)} aria-label="Remove"><X size={13} /></button>
                </motion.li>
              );
            })}
          </ul>
        </aside>

        {/* ── Chart ── */}
        <section className={cn("rounded-lg border min-w-0 flex flex-col", c.panel, c.line)}>
          <div className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 border-b", c.line)}>
            <b className="text-[20px] tracking-tight">{symbol}</b>
            <span className={cn("text-[13px] truncate max-w-[40ch]", c.sub)}>{q?.name || ""}</span>
            {q ? (
              <span className="ml-auto flex items-baseline gap-3">
                <b className="text-[22px] tabular-nums"><Num value={q.price} format={px} /></b>
                <span className={cn("text-[12px]", c.sub)}>{q.ccy}</span>
                <span className={cn("text-[14px] font-semibold tabular-nums", sign(q.pct))}>{q.change >= 0 ? "+" : ""}{px(q.change)} ({q.pct >= 0 ? "+" : ""}{q.pct.toFixed(2)}%)</span>
              </span>
            ) : <span className={cn("ml-auto text-[13px]", c.sub)}>{t.unavailable}</span>}
          </div>
          <div className="p-2 h-[520px] lg:h-[640px]">
            <PriceChart symbol={symbol} dark={dark} labels={{ loading: t.loading, fallback: t.fallback }} />
          </div>
        </section>

        {/* ── Order ticket ── */}
        <aside className={cn("rounded-lg border self-start", c.panel, c.line)}>
          <div className={cn("grid grid-cols-2 gap-1 p-2 border-b", c.line)}>
            {(["buy", "sell"] as const).map((s) => (
              <button key={s} onClick={() => setSide(s)} className={cn("h-8 rounded-md text-[13px] font-semibold transition-colors", side === s ? (s === "buy" ? "bg-[#2563EB] text-white" : "bg-red-600 text-white") : c.pill)}>{s === "buy" ? t.buy : t.sell}</button>
            ))}
          </div>
          <div className="p-3 grid gap-2.5 text-[13px]">
            <div className="flex justify-between"><span className={c.sub}>{t.owned} {symbol}</span><b className="tabular-nums">{held ? qfmt(held) : "0"}</b></div>
            <div className="grid grid-cols-2 gap-1">
              {(["MKT", "LMT"] as const).map((o) => <button key={o} onClick={() => setOtype(o)} className={cn("h-7 rounded-md text-[12px] font-semibold", otype === o ? c.on : c.pill)}>{o === "MKT" ? t.market : t.limit}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(["qty", "amount"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={cn("h-7 rounded-md text-[12px] font-semibold", mode === m ? c.on : c.pill)}>{m === "qty" ? t.qty : t.amount}</button>)}
            </div>
            <label className="grid gap-1"><span className={c.sub}>{mode === "qty" ? t.qty : t.amount}</span><input value={input} onChange={(e) => setInput(e.target.value)} inputMode="decimal" className={inputCls} /></label>
            {otype === "LMT" && <label className="grid gap-1"><span className={c.sub}>{t.limitPx} ({q?.ccy || "USD"})</span><input value={limitIn} onChange={(e) => setLimitIn(e.target.value)} placeholder={q ? px(q.price) : ""} inputMode="decimal" className={inputCls} /></label>}
            <div className={cn("grid gap-1 pt-2 border-t", c.line)}>
              <div className="flex justify-between"><span className={c.sub}>{t.est}</span><b className="tabular-nums">{orderValue ? money(orderValue) : "-"}</b></div>
              <div className="flex justify-between"><span className={c.sub}>{t.after}</span><span className="tabular-nums">{money(acct.cash + (side === "buy" ? -orderValue : orderValue))}</span></div>
            </div>
            {error && n > 0 && user && <p className={cn("text-[12.5px]", down)}>{error}</p>}
            <button onClick={submit} disabled={!!user && (!!error || !dataOk)}
              className={cn("h-9 rounded-md text-[13px] font-semibold text-white disabled:opacity-40 inline-flex items-center justify-center gap-1.5", side === "buy" ? "bg-[#2563EB] hover:bg-[#1D4FD8]" : "bg-red-600 hover:bg-red-700")}>
              {!user && <Lock size={13} />}{t.submit}: {side === "buy" ? t.buy : t.sell} {symbol}
            </button>
            <AnimatePresence>{msg && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("text-[12.5px]", msg.ok ? up : down)}>{msg.text}</motion.p>}</AnimatePresence>
            <AnimatePresence>
              {gate && !user && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("rounded-md p-3", dark ? "bg-white/[0.05]" : "bg-blue-50")}>
                  <p className="text-[12.5px] font-semibold">{t.signin}</p>
                  <button onClick={() => navigate("/auth?mode=signup")} className="mt-2 h-8 w-full rounded-md bg-[#2563EB] text-white text-[12.5px] font-semibold">{t.signinBtn}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={cn("p-3 border-t grid gap-2 text-[13px]", c.line)}>
            <span className="font-semibold">{t.model}</span>
            <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={inputCls}>
              {MODEL_PORTFOLIOS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <p className={cn("text-[11.5px] leading-snug", c.sub)}>{MODEL_PORTFOLIOS.find((m) => m.id === modelId)!.holdings.map((h) => `${h.symbol} ${h.weight}%`).join(" · ")}</p>
            <div className="flex gap-1.5">
              <input value={modelAmount} onChange={(e) => setModelAmount(e.target.value)} inputMode="decimal" className={inputCls} />
              <button onClick={buyModel} disabled={!!user && !dataOk} className={cn("shrink-0 h-9 px-3 rounded-md text-[12.5px] font-semibold disabled:opacity-40", c.on)}>{t.modelBtn}</button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Positions, orders, trades ── */}
      <div className="max-w-[1800px] mx-auto px-3 sm:px-5 mt-3">
        <div className={cn("rounded-lg border", c.panel, c.line)}>
          <div className={cn("flex gap-1 px-2 border-b", c.line)}>
            {([["positions", t.positions, rows.length], ["orders", t.orders, acct.orders.length], ["history", t.history, acct.trades.length]] as const).map(([id, label, count]) => (
              <button key={id} onClick={() => setTab(id)} className={cn("relative h-10 px-3 text-[13px] font-semibold", tab === id ? "" : c.sub)}>
                {label} <span className={cn("ml-1 text-[11px] tabular-nums", c.sub)}>{count}</span>
                {tab === id && <motion.span layoutId="vp-tab" className="absolute left-2 right-2 -bottom-px h-[2px] bg-[#2563EB]" />}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            {tab === "positions" && (rows.length === 0 ? <p className={cn("px-4 py-6 text-[13px]", c.sub)}>{t.empty}</p> : (
              <table className="w-full min-w-[760px] text-[13px]">
                <thead><tr className={cn("text-[11.5px] uppercase tracking-[0.06em]", c.sub)}>
                  <th className="text-left font-medium px-4 py-2">{t.sym}</th><th className="text-right font-medium px-3">{t.qty}</th><th className="text-right font-medium px-3">{t.avg}</th><th className="text-right font-medium px-3">{t.last}</th><th className="text-right font-medium px-3">{t.chg}</th><th className="text-right font-medium px-3">{t.value}</th><th className="text-right font-medium px-3">{t.gain}</th><th className="px-3" />
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.s} onClick={() => pick(r.s)} className={cn("border-t cursor-pointer", c.line, c.hover)}>
                      <td className="px-4 py-2"><b>{r.s}</b><span className={cn("block text-[11px] truncate max-w-[240px]", c.sub)}>{r.name}</span></td>
                      <td className="text-right px-3 tabular-nums">{qfmt(r.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{money(r.cost / r.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{r.q ? money(r.q.usd) : "-"}</td>
                      <td className={cn("text-right px-3 tabular-nums", r.q ? sign(r.q.pct) : c.sub)}>{r.q ? `${r.q.pct >= 0 ? "+" : ""}${r.q.pct.toFixed(2)}%` : "-"}</td>
                      <td className="text-right px-3 tabular-nums font-semibold">{money(r.value)}</td>
                      <td className={cn("text-right px-3 tabular-nums font-semibold", sign(r.gain))}><Num value={r.gain} format={(v) => (v >= 0 ? "+" : "") + money(v)} /><span className="block text-[11px] font-normal">{((r.gain / r.cost) * 100).toFixed(2)}%</span></td>
                      <td className="text-right px-3"><button onClick={(e) => { e.stopPropagation(); pick(r.s); setSide("sell"); setMode("qty"); setOtype("MKT"); setInput(String(+r.qty.toFixed(6))); }} className={cn("h-7 px-2.5 rounded-md text-[12px] font-semibold hover:bg-red-500/10", down)}>{t.sell}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
            {tab === "orders" && (acct.orders.length === 0 ? <p className={cn("px-4 py-6 text-[13px]", c.sub)}>{t.noOrders}</p> : (
              <table className="w-full min-w-[640px] text-[13px]">
                <thead><tr className={cn("text-[11.5px] uppercase tracking-[0.06em]", c.sub)}><th className="text-left font-medium px-4 py-2">{t.sym}</th><th className="text-left font-medium px-3">{t.side}</th><th className="text-right font-medium px-3">{t.qty}</th><th className="text-right font-medium px-3">{t.limitPx} (USD)</th><th className="text-right font-medium px-3">{t.last} (USD)</th><th className="px-3" /></tr></thead>
                <tbody>
                  {acct.orders.map((o) => (
                    <tr key={o.id} className={cn("border-t", c.line)}>
                      <td className="px-4 py-2 font-semibold">{o.symbol}</td>
                      <td className={cn("px-3 font-semibold", o.side === "buy" ? "text-[#2563EB]" : down)}>{o.side === "buy" ? t.buy : t.sell} LMT</td>
                      <td className="text-right px-3 tabular-nums">{qfmt(o.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{money(o.limit)}</td>
                      <td className="text-right px-3 tabular-nums">{quotes[o.symbol] ? money(quotes[o.symbol].usd) : "-"}</td>
                      <td className="text-right px-3"><button onClick={() => setAcct((a) => ({ ...a, orders: a.orders.filter((x) => x.id !== o.id) }))} className={cn("h-7 px-2.5 rounded-md text-[12px] font-semibold", c.hover, c.sub)}>{t.cancel}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
            {tab === "history" && (acct.trades.length === 0 ? <p className={cn("px-4 py-6 text-[13px]", c.sub)}>{t.noHistory}</p> : (
              <table className="w-full min-w-[640px] text-[13px]">
                <thead><tr className={cn("text-[11.5px] uppercase tracking-[0.06em]", c.sub)}><th className="text-left font-medium px-4 py-2">{t.time}</th><th className="text-left font-medium px-3">{t.sym}</th><th className="text-left font-medium px-3">{t.side}</th><th className="text-left font-medium px-3">{t.type}</th><th className="text-right font-medium px-3">{t.qty}</th><th className="text-right font-medium px-3">{t.px} (USD)</th><th className="text-right font-medium px-3">{t.value}</th></tr></thead>
                <tbody>
                  {acct.trades.slice(0, 100).map((tr, i) => (
                    <tr key={tr.t + tr.symbol + tr.side + i} className={cn("border-t", c.line)}>
                      <td className={cn("px-4 py-2 tabular-nums", c.sub)}>{new Date(tr.t).toLocaleString(fr ? "fr-BE" : "en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-3 font-semibold">{tr.symbol}</td>
                      <td className={cn("px-3 font-semibold", tr.side === "buy" ? "text-[#2563EB]" : down)}>{tr.side === "buy" ? t.buy : t.sell}</td>
                      <td className={cn("px-3", c.sub)}>{tr.type}</td>
                      <td className="text-right px-3 tabular-nums">{qfmt(tr.qty)}</td>
                      <td className="text-right px-3 tabular-nums">{money(tr.price)}</td>
                      <td className="text-right px-3 tabular-nums font-semibold">{money(tr.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
        <p className={cn("mt-4 text-[12px] max-w-4xl", c.sub)}>{t.delayed}</p>
      </div>
    </div>
  );
}
