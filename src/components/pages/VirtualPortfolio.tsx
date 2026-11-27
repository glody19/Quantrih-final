import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Wallet, Search, PieChart as PieIcon, ListOrdered, Banknote, Settings, Moon, Sun, TriangleAlert, CheckCircle2, X, RotateCcw } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { PaperCtx, PALETTE, k, Seg, type Ctx, type View } from "../paper/ctx";
import { PortfolioView } from "../paper/PortfolioView";
import { MarketView } from "../paper/MarketView";
import { StrategiesView, runOrders } from "../paper/StrategiesView";
import { OrdersView, CashView } from "../paper/ActivityView";
import { OrderTicket } from "../paper/OrderTicket";
import { describe } from "../paper/universe";
import {
  STORE, THEME_KEY, FAV_KEY, DEFAULT_FAVS, FEE_PROFILES, loadAccount, freshAccount, fill, fxPair, cashCcy, unit, today, month, deposit, planOrders, costOrder, missingCash, fmtQty,
  type Account, type Quote, type Side, type FeeProfile, type Settings as S,
} from "../paper/engine";

const BASE_CCYS = ["USD", "GBP", "CHF", "DKK", "SEK", "NOK", "JPY", "CAD"];
const readJson = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const writeJson = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ } };

async function bulk(symbols: string[]): Promise<any[]> {
  const out: any[] = [];
  for (let i = 0; i < symbols.length; i += 40) {
    const res = await fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${encodeURIComponent(symbols.slice(i, i + 40).join(","))}`);
    if (!res.ok || res.headers.get("X-Quantrih-Data") === "demo") throw new Error("no live data");
    out.push(...((await res.json()) as any[]));
  }
  return out;
}

export function VirtualPortfolio() {
  const { language } = useTranslation();
  const fr = language === "fr";
  const L = useCallback((f: string, e: string) => (fr ? f : e), [fr]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [acct, setAcct] = useState<Account>(loadAccount);
  const [dark, setDark] = useState<boolean>(() => readJson<string>(THEME_KEY, "light") === "dark");
  const [favs, setFavs] = useState<string[]>(() => { const f = readJson<string[]>(FAV_KEY, DEFAULT_FAVS); return Array.isArray(f) ? f : DEFAULT_FAVS; });
  const [view, setView] = useState<View>(() => { try { return (sessionStorage.getItem("quantrih_paper_view") as View) || "portfolio"; } catch { return "portfolio"; } });
  const [product, setProduct] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ symbol: string; side: Side; qty?: number } | null>(null);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [dataOk, setDataOk] = useState(true);
  const [viewSyms, setViewSyms] = useState<string[]>([]);
  const [toast, setToast] = useState<{ text: string; ok: boolean; id: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gate, setGate] = useState(false);

  useEffect(() => writeJson(STORE, acct), [acct]);
  useEffect(() => writeJson(THEME_KEY, dark ? "dark" : "light"), [dark]);
  useEffect(() => writeJson(FAV_KEY, favs), [favs]);
  useEffect(() => { try { sessionStorage.setItem("quantrih_paper_view", view); } catch { /* storage unavailable */ } }, [view]);
  // a portfolio picked on the backtesting pages opens the strategies view
  useEffect(() => { try { if (localStorage.getItem("quantrih_vp_pending_model")) setView("strategies"); } catch { /* storage unavailable */ } }, []);

  const notify = useCallback((text: string, ok = true) => setToast({ text, ok, id: Date.now() }), []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 5000); return () => clearTimeout(id); }, [toast]);

  const rateOf = useCallback((ccy: string) => (cashCcy(ccy) === "EUR" ? 1 : rates[cashCcy(ccy)]), [rates]);

  /** Quotes in their own currency plus every exchange rate they need, all from the live API. */
  const fetchAll = useCallback(async (symbols: string[]) => {
    const raw = await bulk(symbols);
    const out: Record<string, Quote> = {};
    raw.forEach((q) => {
      if (!q?.symbol || typeof q.regularMarketPrice !== "number") return;
      const inst = describe(q.symbol);
      out[q.symbol] = { price: q.regularMarketPrice, pct: q.regularMarketChangePercent ?? 0, change: q.regularMarketChange ?? 0, ccy: q.currency || inst.c, name: q.longName || q.shortName || inst.n };
    });
    const ccys = new Set<string>(BASE_CCYS);
    Object.values(out).forEach((q) => ccys.add(cashCcy(q.ccy)));
    Object.keys(acct.cash).forEach((c) => ccys.add(c));
    ccys.delete("EUR");
    const pairs = Array.from(ccys).map((c) => fxPair(c)!).filter(Boolean);
    const fx: Record<string, number> = {};
    (await bulk(pairs)).forEach((q) => { if (q?.symbol && typeof q.regularMarketPrice === "number") fx[q.symbol.slice(3, 6)] = q.regularMarketPrice; });
    return { quotes: out, fx };
  }, [acct.cash]);

  const ensureQuotes = useCallback(async (symbols: string[]) => {
    const r = await fetchAll(symbols);
    setQuotes((o) => ({ ...o, ...r.quotes })); setRates((o) => ({ ...o, ...r.fx }));
    return r.quotes;
  }, [fetchAll]);

  const tracked = useMemo(() => Array.from(new Set([
    ...favs.slice(0, 30), ...Object.keys(acct.positions), ...acct.orders.map((o) => o.symbol), ...viewSyms,
    ...(product ? [product] : []), ...(ticket ? [ticket.symbol] : []), ...acct.plans.filter((p) => p.active).flatMap((p) => p.weights.map((w) => w.symbol)),
  ])), [favs, acct.positions, acct.orders, acct.plans, viewSyms, product, ticket]);
  const trackedKey = tracked.join(",");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (document.hidden || !tracked.length) return;
      try {
        const r = await fetchAll(tracked);
        if (!alive) return;
        setQuotes((o) => ({ ...o, ...r.quotes })); setRates((o) => ({ ...o, ...r.fx }));
        setDataOk(Object.keys(r.quotes).length > 0);
      } catch { if (alive) setDataOk(false); }
    };
    run();
    const id = setInterval(run, 20000);
    return () => { alive = false; clearInterval(id); };
  }, [trackedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── limit and stop orders: fill when the live price crosses, day orders expire at the end of the day ──
  useEffect(() => {
    if (!acct.orders.length) return;
    const msgs: string[] = [];
    let next = acct; let changed = false;
    const keep = [];
    for (const o of acct.orders) {
      if (o.tif === "day" && o.day !== today()) { changed = true; msgs.push(L(`Ordre journalier expiré : ${o.symbol}`, `Day order expired: ${o.symbol}`)); continue; }
      const q = quotes[o.symbol]; const rate = q ? rateOf(q.ccy) : undefined;
      if (!q || !rate) { keep.push(o); continue; }
      const hit = o.type === "LMT" ? (o.side === "buy" ? q.price <= o.price : q.price >= o.price) : (o.side === "sell" ? q.price <= o.price : q.price >= o.price);
      if (!hit) { keep.push(o); continue; }
      const px = o.type === "LMT" ? (o.side === "buy" ? Math.min(q.price, o.price) : Math.max(q.price, o.price)) : q.price;
      const inst = describe(o.symbol, { name: o.name, ccy: q.ccy });
      const ok = o.side === "buy" ? !missingCash(next, costOrder(next, inst, "buy", o.qty, px, rate)) : (next.positions[o.symbol]?.qty || 0) >= o.qty - 1e-9;
      if (!ok) { keep.push(o); continue; }
      next = fill(next, o.symbol, o.name, inst, o.side, o.qty, px, rate, o.type); changed = true;
      msgs.push(L(`Ordre exécuté : ${o.side === "buy" ? "achat" : "vente"} de ${fmtQty(o.qty)} ${o.symbol}`, `Order filled: ${o.side} ${fmtQty(o.qty)} ${o.symbol}`));
    }
    if (changed) { setAcct({ ...next, orders: keep }); notify(msgs.join(" · ")); }
  }, [quotes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── recurring plans: run once a month from the chosen day ──
  useEffect(() => {
    if (!user || !dataOk) return;
    const due = acct.plans.filter((p) => p.active && p.lastRun !== month() && new Date().getDate() >= p.day);
    if (!due.length) return;
    let next = acct; const done: string[] = [];
    for (const p of due) {
      if (p.weights.some((w) => !quotes[w.symbol] || !rateOf(quotes[w.symbol].ccy))) continue;
      if (p.deposit) next = deposit(next, p.amount, `Versement programmé : ${p.name}`);
      const r = runOrders(next, planOrders(next, p.weights, p.amount, "invest", quotes, rateOf).orders);
      next = { ...r.acct, plans: r.acct.plans.map((x) => (x.id === p.id ? { ...x, lastRun: month() } : x)) };
      done.push(p.name);
    }
    if (done.length) { setAcct(next); notify(L(`Versement programmé exécuté : ${done.join(", ")}`, `Recurring plan executed: ${done.join(", ")}`)); }
  }, [quotes, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── one point per day for the account value chart ──
  useEffect(() => {
    if (!dataOk) return;
    const ok = Object.keys(acct.positions).every((s) => quotes[s] && rateOf(quotes[s].ccy)) && Object.keys(acct.cash).every((c) => rateOf(c));
    if (!ok) return;
    const inv = Object.entries(acct.positions).reduce((a, [s, p]) => a + (p.qty * quotes[s].price * unit(quotes[s].ccy)) / rateOf(quotes[s].ccy)!, 0);
    const cash = Object.entries(acct.cash).reduce((a, [c, v]) => a + v / rateOf(c)!, 0);
    const v = +(inv + cash).toFixed(2);
    const d = today();
    const last = acct.history[acct.history.length - 1];
    if (last && last.d === d && Math.abs(last.v - v) < 0.01) return;
    setAcct((a) => ({ ...a, history: [...a.history.filter((h) => h.d !== d), { d, v }].slice(-1500) }));
  }, [quotes, rates, acct.positions, acct.cash]); // eslint-disable-line react-hooks/exhaustive-deps

  const requireUser = useCallback(() => { if (user) return true; setGate(true); return false; }, [user]);
  const names = useMemo(() => Object.fromEntries(Object.entries(acct.positions).map(([s, p]) => [s, p.name])), [acct.positions]);

  const ctx: Ctx = {
    fr, L, dark, acct, setAcct, quotes, rateOf, rates, dataOk, signedIn: !!user, requireUser,
    track: setViewSyms, ensureQuotes,
    openTicket: (symbol, side = "buy", qty) => setTicket({ symbol, side, qty }),
    openProduct: (s) => { setProduct(s); setView("market"); window.scrollTo({ top: 0, behavior: "smooth" }); },
    favs, toggleFav: (s) => setFavs((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s])),
    notify, go: (v) => { setView(v); if (v !== "market") setProduct(null); }, names,
  };

  const nav: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "portfolio", label: L("Portefeuille", "Portfolio"), icon: <Wallet size={18} /> },
    { id: "market", label: L("Recherche", "Search"), icon: <Search size={18} /> },
    { id: "strategies", label: L("Stratégies", "Strategies"), icon: <PieIcon size={18} /> },
    { id: "orders", label: L("Ordres", "Orders"), icon: <ListOrdered size={18} />, badge: acct.orders.length || undefined },
    { id: "cash", label: L("Espèces et devises", "Cash and currencies"), icon: <Banknote size={18} /> },
  ];

  // header figures
  const head = useMemo(() => {
    const inv = Object.entries(acct.positions).reduce((a, [s, p]) => { const q = quotes[s]; const r = q && rateOf(q.ccy); return a + (q && r ? (p.qty * q.price * unit(q.ccy)) / r : p.costEur); }, 0);
    const day = Object.entries(acct.positions).reduce((a, [s, p]) => { const q = quotes[s]; const r = q && rateOf(q.ccy); if (!q || !r) return a; const v = (p.qty * q.price * unit(q.ccy)) / r; return a + v - v / (1 + q.pct / 100); }, 0);
    const cash = Object.entries(acct.cash).reduce((a, [c, v]) => a + (rateOf(c) ? v / rateOf(c)! : 0), 0);
    return { total: inv + cash, cash, day, gain: inv + cash - acct.deposits };
  }, [acct, quotes, rateOf]);
  const loc = fr ? "fr-BE" : "en-IE";
  const eur = (v: number) => v.toLocaleString(loc, { style: "currency", currency: "EUR" });

  return (
    <PaperCtx.Provider value={ctx}>
      <div style={(dark ? PALETTE.dark : PALETTE.light) as React.CSSProperties} className="-mt-4 lg:-mt-6 min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors font-sans font-semibold">
        {/* ── top bar ── */}
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur">
          <div className="max-w-[1680px] mx-auto px-3 sm:px-5 h-14 flex items-center gap-4">
            <div className="flex items-baseline gap-2 mr-2 min-w-0">
              <h1 className="text-[17px] !font-extrabold tracking-tight whitespace-nowrap">{L("Trading virtuel", "Paper trading")}</h1>
              <span className="hidden sm:inline-flex h-5 px-1.5 rounded text-[10.5px] font-extrabold uppercase tracking-wider items-center bg-[var(--chip)] text-[var(--sub)]">{L("Simulation · EUR", "Simulation · EUR")}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 ml-auto text-[12.5px]">
              <span><span className={k.sub}>{L("Valeur totale", "Total value")} </span><b className="tabular-nums text-[14px]">{eur(head.total)}</b></span>
              <span><span className={k.sub}>{L("Espèces", "Cash")} </span><b className="tabular-nums text-[14px]">{eur(head.cash)}</b></span>
              <span><span className={k.sub}>{L("Jour", "Day")} </span><b className={cn("tabular-nums text-[14px]", head.day > 0 ? k.up : head.day < 0 ? k.down : "")}>{head.day > 0 ? "+" : ""}{eur(head.day)}</b></span>
              <span><span className={k.sub}>P&L </span><b className={cn("tabular-nums text-[14px]", head.gain > 0 ? k.up : head.gain < 0 ? k.down : "")}>{head.gain > 0 ? "+" : ""}{eur(head.gain)}</b></span>
            </div>
            <div className="flex items-center gap-1 ml-auto md:ml-2">
              <button onClick={() => setDark((d) => !d)} className={cn("h-9 w-9 rounded-lg inline-flex items-center justify-center", k.sub, k.hover)} aria-label={dark ? L("Mode clair", "Light mode") : L("Mode sombre", "Dark mode")} title={dark ? L("Mode clair", "Light mode") : L("Mode sombre", "Dark mode")}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button onClick={() => setSettingsOpen(true)} className={cn("h-9 w-9 rounded-lg inline-flex items-center justify-center", k.sub, k.hover)} aria-label={L("Paramètres", "Settings")} title={L("Paramètres", "Settings")}><Settings size={18} /></button>
            </div>
          </div>
          {/* mobile nav */}
          <nav className="lg:hidden flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map((n) => (
              <button key={n.id} onClick={() => ctx.go(n.id)} className={cn("shrink-0 h-9 px-3 rounded-lg inline-flex items-center gap-2 text-[13px] font-bold", view === n.id ? "bg-[var(--chip)] text-[var(--text)]" : k.sub)}>{n.icon}{n.label}</button>
            ))}
          </nav>
        </header>

        <div className="max-w-[1680px] mx-auto px-3 sm:px-5 py-4 lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-5">
          {/* ── side nav ── */}
          <nav className="hidden lg:flex flex-col gap-0.5 self-start sticky top-[72px]">
            {nav.map((n) => (
              <button key={n.id} onClick={() => ctx.go(n.id)} className={cn("relative h-11 px-3 rounded-lg flex items-center gap-3 text-[14px] font-bold transition-colors text-left",
                view === n.id ? "bg-[var(--panel)] text-[var(--text)] shadow-sm border border-[var(--line)]" : "text-[var(--sub)] hover:text-[var(--text)] hover:bg-[var(--hover)] border border-transparent")}>
                {view === n.id && <motion.span layoutId="pt-nav" className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r bg-[var(--accent)]" />}
                {n.icon}<span className="flex-1">{n.label}</span>
                {n.badge && <span className="min-w-5 h-5 px-1.5 rounded-full text-[11px] font-extrabold inline-flex items-center justify-center bg-[var(--accent)] text-white">{n.badge}</span>}
              </button>
            ))}
            <div className="mt-4 px-3 grid gap-1 text-[12px]">
              <span className={k.sub}>{L("Barème", "Fees")}</span>
              <button onClick={() => setSettingsOpen(true)} className="text-left font-bold hover:text-[var(--accent)]">{FEE_PROFILES[acct.settings.fees][fr ? "fr" : "en"]}</button>
              <span className={cn("mt-1", k.sub)}>{acct.settings.autoFx ? L("Conversion auto des devises", "Auto currency conversion") : L("Comptes en devises", "Currency accounts")}{acct.settings.tob ? L(" · TOB", " · TOB") : ""}</span>
            </div>
          </nav>

          <main className="min-w-0">
            {!dataOk && <p className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] bg-[var(--chip)] text-[var(--warn)]"><TriangleAlert size={15} />{L("Cours en direct indisponibles pour le moment : les ordres sont suspendus.", "Live quotes are unavailable right now: orders are paused.")}</p>}
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {view === "portfolio" && <PortfolioView />}
                {view === "market" && <MarketView product={product} setProduct={setProduct} />}
                {view === "strategies" && <StrategiesView />}
                {view === "orders" && <OrdersView />}
                {view === "cash" && <CashView />}
              </motion.div>
            </AnimatePresence>
            <p className={cn("mt-6 text-[12px] max-w-4xl", k.sub)}>{L("Simulation pédagogique : aucun ordre réel n'est transmis. Cours différés d'environ 15 minutes ; les ordres au marché sont exécutés au dernier cours connu, les ordres limites et stop quand le cours franchit le prix. Barèmes de frais indicatifs, inspirés des courtiers en ligne européens. Les horaires des bourses ne tiennent pas compte des jours fériés. Compte enregistré dans ce navigateur.", "Educational simulation: no real order is ever sent. Quotes delayed by about 15 minutes; market orders fill at the last known price, limit and stop orders when the price crosses. Indicative fee schedules inspired by European online brokers. Exchange hours exclude public holidays. Account saved in this browser.")}</p>
          </main>
        </div>

        <AnimatePresence>{ticket && <OrderTicket key={ticket.symbol + ticket.side} symbol={ticket.symbol} initialSide={ticket.side} initialQty={ticket.qty} onClose={() => setTicket(null)} />}</AnimatePresence>
        <AnimatePresence>{settingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}</AnimatePresence>
        <AnimatePresence>
          {gate && !user && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed z-[90] bottom-5 left-1/2 -translate-x-1/2 w-[min(92vw,420px)] rounded-xl border border-[var(--line2)] bg-[var(--panel)] shadow-2xl p-4">
              <button onClick={() => setGate(false)} className={cn("absolute right-3 top-3", k.sub)} aria-label="Close"><X size={16} /></button>
              <p className="text-[14px] font-extrabold">{L("Créez un compte gratuit pour passer des ordres", "Create a free account to place orders")}</p>
              <p className={cn("mt-1 text-[13px]", k.sub)}>{L("100 000 € virtuels, tous les marchés européens et américains, frais et change réalistes.", "€100,000 of virtual money, European and US markets, realistic fees and FX.")}</p>
              <button onClick={() => navigate("/auth?mode=signup")} className={cn(k.btn, "mt-3 w-full h-10 text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>{L("Créer un compte", "Create an account")}</button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed z-[95] bottom-5 right-5 max-w-[min(92vw,440px)] flex items-start gap-2.5 rounded-xl border border-[var(--line2)] bg-[var(--panel)] shadow-2xl px-4 py-3 text-[13.5px]">
              {toast.ok ? <CheckCircle2 size={18} className="shrink-0 text-[var(--up)]" /> : <TriangleAlert size={18} className="shrink-0 text-[var(--warn)]" />}
              <span className="flex-1">{toast.text}</span>
              <button onClick={() => setToast(null)} className={k.sub} aria-label="Close"><X size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PaperCtx.Provider>
  );
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const P = React.useContext(PaperCtx);
  const { L, acct, setAcct, fr } = P;
  const [start, setStart] = useState(100_000);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (patch: Partial<S>) => setAcct((a) => ({ ...a, settings: { ...a.settings, ...patch } }));
  const Toggle = ({ on, onChange, title, desc }: { on: boolean; onChange: (v: boolean) => void; title: string; desc: string }) => (
    <button onClick={() => onChange(!on)} className={cn("w-full flex items-start gap-3 text-left rounded-lg px-3 py-2.5", k.hover)}>
      <span className="flex-1"><b className="block text-[13.5px]">{title}</b><span className={cn("text-[12.5px]", k.sub)}>{desc}</span></span>
      <span className={cn("mt-0.5 w-10 h-6 rounded-full p-0.5 transition-colors shrink-0", on ? "bg-[var(--accent)]" : "bg-[var(--line2)]")}><span className={cn("block w-5 h-5 rounded-full bg-white shadow transition-transform", on && "translate-x-4")} /></span>
    </button>
  );
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-3" role="dialog" aria-modal="true">
      <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl border border-[var(--line2)] bg-[var(--panel)] text-[var(--text)] shadow-2xl">
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--line)]"><h2 className="text-[16px] !font-extrabold">{L("Paramètres du compte", "Account settings")}</h2><button onClick={onClose} className={k.sub} aria-label="Close"><X size={18} /></button></div>
        <div className="p-5 grid gap-5">
          <div>
            <p className={cn("text-[12px] font-extrabold uppercase tracking-[0.08em] mb-2", k.sub)}>{L("Barème de frais", "Fee schedule")}</p>
            <div className="grid gap-1.5">
              {(Object.keys(FEE_PROFILES) as FeeProfile[]).map((id) => (
                <label key={id} className={cn("flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer", acct.settings.fees === id ? "border-[var(--accent)] bg-[var(--hover)]" : "border-[var(--line)]")}>
                  <input type="radio" checked={acct.settings.fees === id} onChange={() => set({ fees: id })} className="mt-1 accent-[var(--accent)]" />
                  <span><b className="block text-[13.5px]">{FEE_PROFILES[id][fr ? "fr" : "en"]}</b><span className={cn("text-[12.5px]", k.sub)}>{FEE_PROFILES[id][fr ? "noteFr" : "noteEn"]}</span></span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-0.5 -mx-3">
            <Toggle on={acct.settings.autoFx} onChange={(v) => set({ autoFx: v })} title={L("Conversion automatique des devises", "Automatic currency conversion")} desc={L("Achats en dollars, livres, francs suisses… payés depuis vos euros. Désactivée : vous gérez des comptes en devises et convertissez vous-même.", "Purchases in dollars, pounds, Swiss francs… paid from your euros. Off: you hold currency accounts and convert yourself.")} />
            <Toggle on={acct.settings.fractions} onChange={(v) => set({ fractions: v })} title={L("Fractions d'actions", "Fractional shares")} desc={L("Désactivé, comme chez la plupart des courtiers en ligne : uniquement des parts entières (la crypto reste fractionnable).", "Off, as at most online brokers: whole shares only (crypto stays fractional).")} />
            <Toggle on={acct.settings.tob} onChange={(v) => set({ tob: v })} title={L("Taxe sur les opérations de bourse (Belgique)", "Stock exchange tax (Belgium)")} desc={L("0,35 % sur les actions, 0,12 % sur les ETF et obligations, à l'achat et à la vente (taux simplifiés ; 1,32 % pour les ETF de capitalisation enregistrés en Belgique).", "0.35% on shares, 0.12% on ETFs and bonds, on buys and sells (simplified rates; 1.32% for accumulating ETFs registered in Belgium).")} />
            <Toggle on={acct.settings.priips} onChange={(v) => set({ priips: v })} title={L("Règle PRIIPs (Union européenne)", "PRIIPs rule (European Union)")} desc={L("Bloque l'achat des fonds américains sans document d'informations clés, comme un courtier européen.", "Blocks US funds without a key information document, as a European broker does.")} />
          </div>
          <div className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-[13.5px] font-extrabold">{L("Réinitialiser le compte", "Reset the account")}</p>
            <p className={cn("text-[12.5px] mt-0.5", k.sub)}>{L("Efface positions, ordres, historique et versements programmés.", "Deletes positions, orders, history and recurring plans.")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Seg value={String(start)} onChange={(v) => setStart(+v)} size="sm" options={[10_000, 50_000, 100_000, 250_000].map((v) => ({ id: String(v), label: v.toLocaleString(fr ? "fr-BE" : "en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) }))} />
              {!confirmReset ? <button onClick={() => setConfirmReset(true)} className={cn(k.btn, "ml-auto h-8", k.chip)}><RotateCcw size={13} />{L("Réinitialiser", "Reset")}</button>
                : <button onClick={() => { setAcct(freshAccount(start, acct.settings)); setConfirmReset(false); P.notify(L("Compte réinitialisé.", "Account reset.")); onClose(); }} className={cn(k.btn, "ml-auto h-8 text-white bg-[var(--down)]")}>{L("Confirmer la réinitialisation", "Confirm reset")}</button>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
