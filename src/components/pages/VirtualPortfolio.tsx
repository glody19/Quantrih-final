import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { Moon, RotateCcw, Search, Sun, TriangleAlert, Wallet } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { InfoTooltip } from "../ui/InfoTooltip";
import { AdvancedTradingViewChart } from "../ui/AdvancedTradingViewChart";
import { cn } from "../../lib/utils";
import { MODEL_PORTFOLIOS } from "../../data/modelPortfolios";

const START_CASH = 100_000;
const STORE = "quantrih_vp_v1";
const PENDING_MODEL = "quantrih_vp_pending_model";
const QUICK = ["AAPL", "NVDA", "TSLA", "SPY", "VWCE.DE", "IWDA.AS", "ASML.AS", "BTC-USD", "ETH-USD"];
const COLORS = ["#6D5AE6", "#18B8A0", "#E0B341", "#F08A5D", "#4C8DFF", "#C2587C", "#A99BF5", "#7ADFCF", "#94A3B8", "#E5484D"];

interface Position { qty: number; cost: number; name: string } // cost = total paid, in USD
interface Trade { t: number; symbol: string; side: "buy" | "sell"; qty: number; price: number; value: number }
interface Account { cash: number; positions: Record<string, Position>; trades: Trade[] }
interface Quote { price: number; pct: number; ccy: string; name: string; usd: number }

const fresh = (): Account => ({ cash: START_CASH, positions: {}, trades: [] });
const load = (): Account => {
  try {
    const a = JSON.parse(localStorage.getItem(STORE) || "null");
    if (a && typeof a.cash === "number" && a.positions && Array.isArray(a.trades)) return a;
  } catch { /* corrupted or unavailable storage: start fresh */ }
  return fresh();
};
const money = (v: number, d = 2) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });
const fxSymbol = (ccy: string) => (ccy === "USD" ? null : `${ccy === "GBp" ? "GBP" : ccy}USD=X`);

const T = {
  en: {
    title: "Virtual portfolio", sub: "Practise investing with $100,000 of play money at real market prices. Nothing here is a real order.",
    net: "Portfolio value", netTip: "Cash plus the current value of everything you hold.", cash: "Cash", invested: "Invested", pnl: "Total gain or loss", pnlTip: "What your account is worth today minus the $100,000 you started with.", day: "Today",
    ticket: "Place an order", search: "Search a stock, ETF or crypto (Apple, VWCE, Bitcoin...)", buy: "Buy", sell: "Sell", amount: "Amount in $", qty: "Quantity", byAmount: "By amount", byQty: "By quantity",
    est: "Estimated quantity", cost: "Order value", after: "Cash after order", submit: "Confirm", owned: "You hold",
    errCash: "Not enough cash for this order.", errQty: "You do not hold that many.", errZero: "Enter an amount greater than zero.", errPrice: "No price available for this instrument.",
    positions: "Positions", empty: "No positions yet. Search an instrument above or load a model allocation.", sym: "Instrument", last: "Last", avg: "Avg cost", value: "Value", weight: "Weight", gain: "Gain / loss",
    allocation: "Allocation", history: "Order history", noHistory: "No orders yet.", model: "Invest in a model allocation", modelSub: "Buys every ETF of the model in the right proportions.", modelBtn: "Buy the allocation",
    reset: "Reset account", resetConfirm: "Reset the account to $100,000 and delete all positions?", delayed: "Prices delayed by about 15 minutes (Yahoo Finance). Orders fill at the last known price, even when the market is closed. For learning purposes only.",
    noData: "Live prices are unavailable right now, so trading is paused.", chart: "Chart", filled: "Order filled", light: "Light", dark: "Dark",
  },
  fr: {
    title: "Portefeuille virtuel", sub: "Entraînez-vous à investir avec 100 000 $ fictifs aux vrais cours du marché. Aucun ordre réel n'est passé.",
    net: "Valeur du portefeuille", netTip: "Vos liquidités plus la valeur actuelle de tout ce que vous détenez.", cash: "Liquidités", invested: "Investi", pnl: "Gain ou perte total", pnlTip: "Ce que vaut votre compte aujourd'hui moins les 100 000 $ de départ.", day: "Aujourd'hui",
    ticket: "Passer un ordre", search: "Chercher une action, un ETF ou une crypto (Apple, VWCE, Bitcoin...)", buy: "Acheter", sell: "Vendre", amount: "Montant en $", qty: "Quantité", byAmount: "Par montant", byQty: "Par quantité",
    est: "Quantité estimée", cost: "Valeur de l'ordre", after: "Liquidités après l'ordre", submit: "Confirmer", owned: "Vous détenez",
    errCash: "Liquidités insuffisantes pour cet ordre.", errQty: "Vous n'en détenez pas autant.", errZero: "Saisissez un montant supérieur à zéro.", errPrice: "Aucun cours disponible pour cet instrument.",
    positions: "Positions", empty: "Aucune position. Cherchez un instrument ci-dessus ou chargez une allocation modèle.", sym: "Instrument", last: "Dernier", avg: "Prix moyen", value: "Valeur", weight: "Poids", gain: "Gain / perte",
    allocation: "Répartition", history: "Historique des ordres", noHistory: "Aucun ordre pour l'instant.", model: "Investir dans une allocation modèle", modelSub: "Achète chaque ETF du modèle dans les bonnes proportions.", modelBtn: "Acheter l'allocation",
    reset: "Réinitialiser le compte", resetConfirm: "Remettre le compte à 100 000 $ et supprimer toutes les positions ?", delayed: "Cours différés d'environ 15 minutes (Yahoo Finance). Les ordres sont exécutés au dernier cours connu, même marché fermé. À but pédagogique uniquement.",
    noData: "Les cours en direct sont indisponibles pour le moment : les ordres sont suspendus.", chart: "Graphique", filled: "Ordre exécuté", light: "Clair", dark: "Sombre",
  },
};

function Num({ value, format }: { value: number; format: (v: number) => string }) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <>{format(v)}</>;
}

export function VirtualPortfolio() {
  const { language } = useTranslation();
  const t = language === "fr" ? T.fr : T.en;
  const [acct, setAcct] = useState<Account>(load);
  const [dark, setDark] = useState<boolean>(() => { try { return localStorage.getItem("quantrih_vp_theme") !== "light"; } catch { return true; } });
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [dataOk, setDataOk] = useState(true);
  const [symbol, setSymbol] = useState("AAPL");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; label: string; exchange: string | null; type: string }[]>([]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [mode, setMode] = useState<"amount" | "qty">("amount");
  const [input, setInput] = useState("1000");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [modelId, setModelId] = useState(MODEL_PORTFOLIOS[0].id);
  const [modelAmount, setModelAmount] = useState("10000");

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(acct)); } catch { /* storage unavailable */ } }, [acct]);
  useEffect(() => { try { localStorage.setItem("quantrih_vp_theme", dark ? "dark" : "light"); } catch { /* storage unavailable */ } }, [dark]);
  useEffect(() => {
    try {
      const pending = localStorage.getItem(PENDING_MODEL);
      if (pending && MODEL_PORTFOLIOS.some((m) => m.id === pending)) { setModelId(pending); localStorage.removeItem(PENDING_MODEL); document.getElementById("vp-model")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
    } catch { /* storage unavailable */ }
  }, []);

  // ── quotes (instrument prices + the currency pairs needed to express them in USD) ──
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
      out[q.symbol] = { price: q.regularMarketPrice, pct: q.regularMarketChangePercent ?? 0, ccy, name: q.shortName || q.longName || q.symbol, usd: q.regularMarketPrice * rate * (ccy === "GBp" ? 0.01 : 1) };
    });
    return out;
  }, []);

  const watched = useMemo(() => Array.from(new Set([symbol, ...Object.keys(acct.positions)])), [symbol, acct.positions]);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (document.hidden) return;
      try {
        const q = await fetchQuotes(watched);
        if (alive) { setQuotes((old) => ({ ...old, ...q })); setDataOk(true); }
      } catch { if (alive) setDataOk(false); }
    };
    run();
    const id = setInterval(run, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [watched, fetchQuotes]);

  // ── search ──
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const id = setTimeout(() => {
      fetch(`/api/stock/search?q=${encodeURIComponent(query.trim())}`).then((r) => (r.ok ? r.json() : { result: [] })).then((d) => setResults((d.result || []).slice(0, 7))).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  // ── derived account figures ──
  const rows = useMemo(() => Object.entries(acct.positions).map(([s, p]) => {
    const q = quotes[s];
    const value = q ? p.qty * q.usd : p.cost;
    return { s, ...p, q, value, gain: value - p.cost, dayGain: q ? value - value / (1 + q.pct / 100) : 0 };
  }).sort((a, b) => b.value - a.value), [acct.positions, quotes]);
  const invested = rows.reduce((a, r) => a + r.value, 0);
  const net = acct.cash + invested;
  const dayGain = rows.reduce((a, r) => a + r.dayGain, 0);

  // ── order ticket ──
  const q = quotes[symbol];
  const held = acct.positions[symbol]?.qty || 0;
  const n = parseFloat(input.replace(",", ".")) || 0;
  const orderQty = q ? (mode === "amount" ? n / q.usd : n) : 0;
  const orderValue = q ? orderQty * q.usd : 0;
  const error = !q ? t.errPrice : n <= 0 ? t.errZero : side === "buy" && orderValue > acct.cash + 1e-6 ? t.errCash : side === "sell" && orderQty > held + 1e-9 ? t.errQty : null;

  const execute = (sym: string, s: "buy" | "sell", qty: number, quote: Quote, a: Account): Account => {
    const value = qty * quote.usd;
    const pos = a.positions[sym] || { qty: 0, cost: 0, name: quote.name };
    const positions = { ...a.positions };
    if (s === "buy") positions[sym] = { qty: pos.qty + qty, cost: pos.cost + value, name: quote.name };
    else {
      const left = pos.qty - qty;
      if (left <= 1e-9) delete positions[sym]; else positions[sym] = { ...pos, qty: left, cost: pos.cost * (left / pos.qty) };
    }
    return { cash: a.cash + (s === "buy" ? -value : value), positions, trades: [{ t: Date.now(), symbol: sym, side: s, qty, price: quote.usd, value }, ...a.trades].slice(0, 200) };
  };

  const submit = () => {
    if (error || !q || !dataOk) return;
    setAcct((a) => execute(symbol, side, orderQty, q, a));
    setMsg({ ok: true, text: `${t.filled}: ${side === "buy" ? t.buy : t.sell} ${orderQty.toFixed(4)} ${symbol} @ ${money(q.usd)}` });
  };

  const buyModel = async () => {
    const model = MODEL_PORTFOLIOS.find((m) => m.id === modelId)!;
    const amount = parseFloat(modelAmount.replace(",", ".")) || 0;
    if (amount <= 0) return setMsg({ ok: false, text: t.errZero });
    if (amount > acct.cash) return setMsg({ ok: false, text: t.errCash });
    try {
      const mq = await fetchQuotes(model.holdings.map((h) => h.symbol));
      if (model.holdings.some((h) => !mq[h.symbol])) return setMsg({ ok: false, text: t.errPrice });
      setQuotes((old) => ({ ...old, ...mq }));
      setAcct((a) => model.holdings.reduce((acc, h) => execute(h.symbol, "buy", (amount * h.weight) / 100 / mq[h.symbol].usd, mq[h.symbol], acc), a));
      setMsg({ ok: true, text: `${t.filled}: ${model.name}, ${money(amount, 0)}` });
    } catch { setDataOk(false); }
  };

  const card = "rounded-3xl border border-border bg-surface p-5 md:p-6";
  const inputCls = "w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-text outline-none focus:border-pv-blue";

  return (
    <div data-theme={dark ? "dark" : undefined} className="bg-bg text-text min-h-screen -mt-6 pt-10 pb-24 transition-colors">
      <div className="page-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.title}</h1>
            <p className="mt-2 text-lg text-text-3">{t.sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark((d) => !d)} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold">
              {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? t.light : t.dark}
            </button>
            <button onClick={() => { if (window.confirm(t.resetConfirm)) { setAcct(fresh()); setMsg(null); } }} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-3 hover:text-red">
              <RotateCcw size={15} /> {t.reset}
            </button>
          </div>
        </div>

        {!dataOk && <p className="mt-5 flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm"><TriangleAlert size={16} className="text-amber-500" /> {t.noData}</p>}

        {/* Account summary */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { l: t.net, v: net, tip: t.netTip, big: true },
            { l: t.cash, v: acct.cash },
            { l: t.invested, v: invested },
            { l: t.pnl, v: net - START_CASH, tip: t.pnlTip, signed: true, pct: ((net - START_CASH) / START_CASH) * 100 },
            { l: t.day, v: dayGain, signed: true },
          ].map((c, i) => (
            <motion.div key={c.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={cn(card, c.big && "col-span-2 lg:col-span-1 bg-gradient-to-br from-pv-blue to-[#3C3199] text-white border-transparent")}>
              <span className={cn("flex items-center text-sm", c.big ? "text-white/75" : "text-text-3")}>{c.l}{c.tip && <InfoTooltip content={c.tip} />}</span>
              <b className={cn("block mt-1.5 text-lg sm:text-2xl font-mono tabular-nums tracking-tighter sm:tracking-tight", c.signed && (c.v >= 0 ? "text-green" : "text-red"))}>
                <Num value={c.v} format={(v) => (c.signed && v >= 0 ? "+" : "") + money(v)} />
              </b>
              {typeof c.pct === "number" && <span className={cn("text-sm font-mono", c.pct >= 0 ? "text-green" : "text-red")}>{c.pct >= 0 ? "+" : ""}{c.pct.toFixed(2)}%</span>}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid xl:grid-cols-[400px_1fr] gap-6 items-start">
          {/* Order ticket */}
          <div className="grid gap-6">
            <div className={card}>
              <h2 className="text-lg font-semibold mb-4">{t.ticket}</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className={cn(inputCls, "pl-10 text-sm")} />
                {results.length > 0 && (
                  <ul className="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
                    {results.map((r) => (
                      <li key={r.symbol}>
                        <button onClick={() => { setSymbol(r.symbol); setQuery(""); setResults([]); setMsg(null); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-3">
                          <span className="min-w-0"><b className="font-mono text-sm">{r.symbol}</b><span className="block text-xs text-text-3 truncate">{r.label}</span></span>
                          <span className="text-[11px] text-text-4 shrink-0">{r.exchange} · {r.type}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {QUICK.map((s) => <button key={s} onClick={() => { setSymbol(s); setMsg(null); }} className={cn("px-2.5 py-1 rounded-full text-xs font-mono border", symbol === s ? "bg-pv-blue text-white border-pv-blue" : "border-border text-text-3 hover:text-text")}>{s}</button>)}
              </div>

              <div className="mt-5 rounded-2xl bg-surface-3/60 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0"><b className="font-mono text-lg">{symbol}</b><span className="block text-xs text-text-3 truncate">{q?.name || ""}</span></span>
                  {q ? (
                    <span className="text-right"><b className="block font-mono text-xl tabular-nums"><Num value={q.price} format={(v) => v.toLocaleString("en-US", { maximumFractionDigits: q.price < 10 ? 4 : 2 })} /> <span className="text-xs text-text-4">{q.ccy}</span></b>
                      <span className={cn("text-sm font-mono", q.pct >= 0 ? "text-green" : "text-red")}>{q.pct >= 0 ? "+" : ""}{q.pct.toFixed(2)}%</span></span>
                  ) : <span className="w-24 h-8 rounded bg-surface-3 animate-pulse" />}
                </div>
                {held > 0 && <p className="mt-2 text-xs text-text-3">{t.owned}: <b className="font-mono">{held.toFixed(4)}</b></p>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["buy", "sell"] as const).map((s) => <button key={s} onClick={() => setSide(s)} className={cn("py-2.5 rounded-xl font-semibold text-sm border", side === s ? (s === "buy" ? "bg-green text-white border-green" : "bg-red text-white border-red") : "border-border text-text-3")}>{s === "buy" ? t.buy : t.sell}</button>)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {(["amount", "qty"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={cn("py-1.5 rounded-lg border", mode === m ? "border-pv-blue text-pv-blue font-semibold" : "border-border text-text-3")}>{m === "amount" ? t.byAmount : t.byQty}</button>)}
              </div>
              <label className="block mt-3 text-sm text-text-3">{mode === "amount" ? t.amount : t.qty}
                <input value={input} onChange={(e) => setInput(e.target.value)} inputMode="decimal" className={cn(inputCls, "mt-1 font-mono text-lg")} />
              </label>
              <dl className="mt-4 grid gap-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-text-3">{t.est}</dt><dd className="font-mono">{orderQty ? orderQty.toFixed(4) : "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-text-3">{t.cost}</dt><dd className="font-mono">{money(orderValue)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-3">{t.after}</dt><dd className="font-mono">{money(acct.cash + (side === "buy" ? -orderValue : orderValue))}</dd></div>
              </dl>
              {error && n > 0 && <p className="mt-3 text-sm text-red">{error}</p>}
              <button onClick={submit} disabled={!!error || !dataOk} className={cn("mt-4 w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40", side === "buy" ? "bg-green" : "bg-red")}>{t.submit} · {side === "buy" ? t.buy : t.sell}</button>
              {msg && <p className={cn("mt-3 text-sm", msg.ok ? "text-green" : "text-red")}>{msg.text}</p>}
            </div>

            <div id="vp-model" className={card}>
              <h2 className="text-lg font-semibold flex items-center gap-2"><Wallet size={18} className="text-pv-blue" /> {t.model}</h2>
              <p className="text-sm text-text-3 mt-1 mb-4">{t.modelSub}</p>
              <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={inputCls}>
                {MODEL_PORTFOLIOS.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.author})</option>)}
              </select>
              <div className="mt-3 flex h-2.5 rounded-full overflow-hidden bg-surface-3">
                {MODEL_PORTFOLIOS.find((m) => m.id === modelId)!.holdings.map((h, i) => <span key={h.symbol} title={`${h.symbol} ${h.weight}%`} style={{ width: `${h.weight}%`, background: COLORS[i % COLORS.length] }} />)}
              </div>
              <p className="mt-2 text-xs text-text-3 font-mono">{MODEL_PORTFOLIOS.find((m) => m.id === modelId)!.holdings.map((h) => `${h.symbol} ${h.weight}%`).join(" · ")}</p>
              <label className="block mt-3 text-sm text-text-3">{t.amount}<input value={modelAmount} onChange={(e) => setModelAmount(e.target.value)} inputMode="decimal" className={cn(inputCls, "mt-1 font-mono")} /></label>
              <button onClick={buyModel} disabled={!dataOk} className="mt-4 w-full py-3 rounded-xl font-semibold text-white bg-pv-blue hover:bg-pv-blue-d disabled:opacity-40">{t.modelBtn}</button>
            </div>
          </div>

          {/* Chart, positions, history */}
          <div className="grid gap-6 min-w-0">
            <div className={cn(card, "p-2 md:p-3")}>
              <div className="h-[420px] rounded-2xl overflow-hidden"><AdvancedTradingViewChart key={symbol + String(dark)} symbol={symbol.replace("-USD", "USD")} theme={dark ? "dark" : "light"} /></div>
            </div>

            <div className={card}>
              <div className="grid gap-6 items-start min-[1700px]:grid-cols-[1fr_230px]">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold mb-3">{t.positions}</h2>
                  {rows.length === 0 ? <p className="text-text-3 text-sm py-6">{t.empty}</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-sm">
                        <thead><tr className="text-text-3 text-xs uppercase tracking-wide border-b border-border">
                          <th className="text-left font-medium py-2">{t.sym}</th><th className="text-right font-medium">{t.qty}</th><th className="text-right font-medium">{t.avg}</th><th className="text-right font-medium">{t.last}</th><th className="text-right font-medium">{t.value}</th><th className="text-right font-medium">{t.weight}</th><th className="text-right font-medium">{t.gain}</th><th />
                        </tr></thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <motion.tr key={r.s} layout className="border-b border-border last:border-0 hover:bg-surface-3/50 cursor-pointer" onClick={() => setSymbol(r.s)}>
                              <td className="py-2.5"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span><b className="font-mono">{r.s}</b><span className="block text-xs text-text-3 truncate max-w-[160px]">{r.name}</span></span></span></td>
                              <td className="text-right font-mono tabular-nums">{r.qty.toFixed(r.qty < 10 ? 4 : 2)}</td>
                              <td className="text-right font-mono tabular-nums text-text-3">{money(r.cost / r.qty)}</td>
                              <td className="text-right font-mono tabular-nums">{r.q ? money(r.q.usd) : "-"}</td>
                              <td className="text-right font-mono tabular-nums font-semibold">{money(r.value)}</td>
                              <td className="text-right font-mono tabular-nums text-text-3">{((r.value / net) * 100).toFixed(1)}%</td>
                              <td className={cn("text-right font-mono tabular-nums", r.gain >= 0 ? "text-green" : "text-red")}>{r.gain >= 0 ? "+" : ""}{money(r.gain)}<span className="block text-xs">{((r.gain / r.cost) * 100).toFixed(2)}%</span></td>
                              <td className="text-right pl-2"><button onClick={(e) => { e.stopPropagation(); setSymbol(r.s); setSide("sell"); setMode("qty"); setInput(String(r.qty)); }} className="text-xs font-semibold text-red hover:underline">{t.sell}</button></td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {rows.length > 0 && (
                  <div className="w-full">
                    <h2 className="text-lg font-semibold mb-3">{t.allocation}</h2>
                    <svg viewBox="0 0 200 200" className="w-44 h-44 -rotate-90 mx-auto">
                      {(() => {
                        const R = 72, C = 2 * Math.PI * R; let acc = 0;
                        const parts = [...rows.map((r, i) => ({ v: r.value, c: COLORS[i % COLORS.length] })), { v: acct.cash, c: dark ? "#334155" : "#E6E7EC" }];
                        return parts.map((p, i) => { const len = (p.v / net) * C, off = acc; acc += len; return <motion.circle key={i} cx="100" cy="100" r={R} fill="none" stroke={p.c} strokeWidth="30" strokeDashoffset={-off} initial={{ strokeDasharray: `0 ${C}` }} animate={{ strokeDasharray: `${len} ${C - len}` }} transition={{ duration: 0.8, delay: i * 0.08 }} />; });
                      })()}
                    </svg>
                    <p className="mt-2 text-center text-xs text-text-3">{t.cash} {((acct.cash / net) * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>

            <div className={card}>
              <h2 className="text-lg font-semibold mb-3">{t.history}</h2>
              {acct.trades.length === 0 ? <p className="text-text-3 text-sm">{t.noHistory}</p> : (
                <ul className="divide-y divide-border text-sm max-h-72 overflow-y-auto">
                  {acct.trades.map((tr) => (
                    <li key={tr.t + tr.symbol} className="flex items-center justify-between gap-3 py-2">
                      <span className="flex items-center gap-2"><span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold text-white", tr.side === "buy" ? "bg-green" : "bg-red")}>{tr.side === "buy" ? t.buy : t.sell}</span><b className="font-mono">{tr.symbol}</b><span className="text-text-3 font-mono">{tr.qty.toFixed(4)} @ {money(tr.price)}</span></span>
                      <span className="text-right"><b className="font-mono">{money(tr.value)}</b><span className="block text-xs text-text-4">{new Date(tr.t).toLocaleString(language === "fr" ? "fr-BE" : "en-GB", { dateStyle: "short", timeStyle: "short" })}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-text-4 max-w-4xl">{t.delayed}</p>
      </div>
    </div>
  );
}
