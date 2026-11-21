import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search, Star, TriangleAlert, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { PriceChart } from "../trading/PriceChart";
import { MarketHours } from "../trading/MarketHours";
import { usePaper, useFormat, k, sign, Badge, Empty, Seg } from "./ctx";
import { UNIVERSE, describe, type Instrument, type Kind, type Region } from "./universe";
import { cashCcy, fmtQty, unit } from "./engine";

type KindFilter = "all" | "fav" | Kind;
type RegionFilter = "all" | Region;
type Sort = "default" | "up" | "down" | "name" | "ter";

interface Hit { symbol: string; label: string; exchange: string | null; type: string }

export function MarketView({ product, setProduct }: { product: string | null; setProduct: (s: string | null) => void }) {
  const P = usePaper();
  const { L, quotes, favs } = P;
  const F = useFormat();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const [kind, setKind] = useState<KindFilter>("all");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [sort, setSort] = useState<Sort>("default");

  // free search through the quote provider (any listed stock, ETF or crypto)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setHits([]); setSearching(false); return; }
    setSearching(true);
    const id = setTimeout(() => {
      fetch(`/api/stock/search?q=${encodeURIComponent(q)}`).then((r) => (r.ok ? r.json() : { result: [] }))
        .then((d) => setHits((d.result || []).filter((h: Hit) => h.symbol && ["Equity", "ETF", "Crypto", "MUTUALFUND", "INDEX"].includes(h.type) && h.type !== "INDEX").slice(0, 15)))
        .catch(() => setHits([])).finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const list: (Instrument & { found?: boolean })[] = useMemo(() => {
    const ql = query.trim().toLowerCase();
    const curated = UNIVERSE.filter((i) => !ql || i.s.toLowerCase().includes(ql) || i.n.toLowerCase().includes(ql) || (i.sec || "").toLowerCase().includes(ql));
    const extra = hits.filter((h) => !curated.some((c) => c.s === h.symbol)).map((h) => ({ ...describe(h.symbol, { name: h.label, type: h.type, exchange: h.exchange }), found: true }));
    let all: (Instrument & { found?: boolean })[] = [...curated, ...extra];
    if (kind === "fav") all = favs.map((s) => all.find((i) => i.s === s) || describe(s, { name: P.names[s] || quotes[s]?.name }));
    else if (kind !== "all") all = all.filter((i) => i.k === kind);
    if (region !== "all") all = all.filter((i) => i.r === region);
    const pct = (s: string) => quotes[s]?.pct ?? -Infinity;
    if (sort === "up") all = [...all].sort((a, b) => pct(b.s) - pct(a.s));
    if (sort === "down") all = [...all].sort((a, b) => (quotes[a.s]?.pct ?? Infinity) - (quotes[b.s]?.pct ?? Infinity));
    if (sort === "name") all = [...all].sort((a, b) => a.n.localeCompare(b.n));
    if (sort === "ter") all = [...all].sort((a, b) => (a.ter ?? 9) - (b.ter ?? 9));
    return all;
  }, [query, hits, kind, region, sort, favs, quotes, P.names]);

  const visible = useMemo(() => list.slice(0, 80).map((i) => i.s), [list]);
  useEffect(() => { P.track(product ? [product, ...visible] : visible); }, [visible.join(","), product]); // eslint-disable-line react-hooks/exhaustive-deps

  const kinds: { id: KindFilter; label: string }[] = [
    { id: "all", label: L("Tout", "All") }, { id: "fav", label: L("Favoris", "Favourites") }, { id: "stock", label: L("Actions", "Stocks") }, { id: "etf", label: "ETF" },
    { id: "bond", label: L("Obligations", "Bonds") }, { id: "commodity", label: L("Or et matières premières", "Gold and commodities") }, { id: "crypto", label: "Crypto" },
  ];

  return (
    <div className="grid gap-4">
      {product && <ProductPanel symbol={product} onBack={() => setProduct(null)} />}

      <section className={cn(k.panel, "overflow-hidden")}>
        <div className="p-4 grid gap-3 border-b border-[var(--line)]">
          <div className="relative">
            <Search size={17} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2", k.sub)} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={L("Rechercher une action, un ETF, une obligation, une crypto, un secteur…", "Search a stock, ETF, bond, crypto, sector…")}
              className={cn(k.input, "h-12 pl-11 pr-10 text-[15px]")} />
            {query && <button onClick={() => setQuery("")} className={cn("absolute right-3 top-1/2 -translate-y-1/2", k.sub)} aria-label="Clear"><X size={16} /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((o) => (
                <button key={o.id} onClick={() => setKind(o.id)} className={cn("h-8 px-3 rounded-full text-[12.5px] font-semibold border transition-colors",
                  kind === o.id ? "bg-[var(--text)] text-[var(--panel)] border-transparent" : "border-[var(--line2)] text-[var(--sub)] hover:text-[var(--text)]")}>
                  {o.id === "fav" && <Star size={12} className="inline -mt-0.5 mr-1" />}{o.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Seg value={region} onChange={setRegion} size="sm" options={[{ id: "all", label: L("Toutes", "All") }, { id: "eu", label: "Europe" }, { id: "us", label: L("États-Unis", "US") }, { id: "world", label: L("Monde", "World") }, { id: "em", label: L("Émergents", "EM") }]} />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={cn(k.input, "h-8 w-auto text-[12.5px] font-semibold py-0")}>
                <option value="default">{L("Tri : pertinence", "Sort: relevance")}</option>
                <option value="up">{L("Plus fortes hausses", "Top gainers")}</option>
                <option value="down">{L("Plus fortes baisses", "Top losers")}</option>
                <option value="name">{L("Nom A-Z", "Name A-Z")}</option>
                <option value="ter">{L("Frais ETF les plus bas", "Lowest ETF fees")}</option>
              </select>
            </div>
          </div>
        </div>

        {list.length === 0 ? <Empty>{searching ? L("Recherche…", "Searching…") : kind === "fav" ? L("Ajoutez des favoris avec l'étoile.", "Add favourites with the star.") : L("Aucun produit ne correspond.", "No product matches.")}</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-[13.5px]">
              <thead><tr className="border-b border-[var(--line)]">
                <th className="w-10" />
                {[L("Produit", "Product"), L("Type", "Type"), L("Bourse", "Exchange"), L("Devise", "Ccy"), L("Frais / an", "Fees / yr"), L("Dernier", "Last"), L("Var. jour", "Day"), ""].map((h, i) => (
                  <th key={i} className={cn(k.th, "py-2.5", i < 4 ? "text-left px-3" : "text-right px-3")}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {list.slice(0, 80).map((i, idx) => {
                  const q = quotes[i.s];
                  const fav = favs.includes(i.s);
                  const held = P.acct.positions[i.s]?.qty || 0;
                  return (
                    <motion.tr key={i.s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx, 20) * 0.012 }}
                      className={cn("border-t border-[var(--line)] cursor-pointer", k.hover, product === i.s && "bg-[var(--hover)]")} onClick={() => { setProduct(i.s); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      <td className="pl-4"><button onClick={(e) => { e.stopPropagation(); P.toggleFav(i.s); }} aria-label="Favourite" className={cn("p-1", fav ? "text-[var(--warn)]" : k.sub)}><Star size={15} fill={fav ? "currentColor" : "none"} /></button></td>
                      <td className="px-3 py-2.5"><div className="flex items-center gap-3 min-w-0"><Badge symbol={i.s} /><div className="min-w-0"><b className="block truncate max-w-[300px]">{q?.name && i.found ? q.name : i.n}</b><span className={cn("text-[12px]", k.sub)}>{i.s}{i.sec ? ` · ${i.sec}` : ""}{held ? ` · ${L("en portefeuille", "held")} ${fmtQty(held)}` : ""}</span></div></div></td>
                      <td className="px-3"><span className={cn("inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11.5px] font-semibold", k.chip)}>{kinds.find((x) => x.id === i.k)?.label}{i.priips && <TriangleAlert size={11} className="text-[var(--warn)]" />}</span></td>
                      <td className={cn("px-3 text-[12.5px]", k.sub)}>{i.x}</td>
                      <td className={cn("px-3 text-[12.5px]", k.sub)}>{q?.ccy ? cashCcy(q.ccy) : cashCcy(i.c)}</td>
                      <td className="text-right px-3 tabular-nums">{i.ter != null ? `${F.num(i.ter, 2)} %` : <span className={k.sub}>-</span>}</td>
                      <td className="text-right px-3 tabular-nums font-semibold">{q ? F.px(q.price) : <span className={k.sub}>-</span>}</td>
                      <td className={cn("text-right px-3 tabular-nums font-semibold", q && sign(q.pct))}>{q ? F.pct(q.pct) : ""}</td>
                      <td className="text-right px-4 whitespace-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); P.openTicket(i.s, "buy"); }} className="h-7 px-3 rounded-md text-[12px] font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent2)]">{L("Acheter", "Buy")}</button>
                        {held > 0 && <button onClick={(e) => { e.stopPropagation(); P.openTicket(i.s, "sell", held); }} className={cn("ml-1 h-7 px-3 rounded-md text-[12px] font-bold text-[var(--down)]", k.hover)}>{L("Vendre", "Sell")}</button>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className={cn("px-5 py-3 border-t border-[var(--line)] text-[12px]", k.sub)}>
          {L("La liste montre une sélection de produits négociés en Europe et aux États-Unis ; la recherche trouve aussi tout autre titre coté. Les ETF UCITS en euros sont accessibles aux particuliers européens. ", "The list shows a selection of products traded in Europe and the US; search also finds any other listed security. UCITS ETFs in euros are available to European retail investors. ")}
          <TriangleAlert size={11} className="inline -mt-0.5 text-[var(--warn)]" /> {L("= fonds américain sans KID.", "= US fund without a KID.")}
        </p>
      </section>

      <section className={cn(k.panel, "p-4")}><MarketHours dark={P.dark} fr={P.fr} /></section>
    </div>
  );
}

function ProductPanel({ symbol, onBack }: { symbol: string; onBack: () => void }) {
  const P = usePaper();
  const { L, quotes, acct, rateOf } = P;
  const F = useFormat();
  const q = quotes[symbol];
  const pos = acct.positions[symbol];
  const inst = describe(symbol, { name: q?.name || P.names[symbol], ccy: q?.ccy });
  const rate = q ? rateOf(q.ccy) : undefined;
  const valueEur = pos && q && rate ? (pos.qty * q.price * unit(q.ccy)) / rate : 0;
  const fav = P.favs.includes(symbol);
  const facts: [string, React.ReactNode][] = [
    [L("Bourse", "Exchange"), inst.x],
    [L("Devise", "Currency"), cashCcy(q?.ccy || inst.c)],
    [L("Type", "Type"), { stock: L("Action", "Stock"), etf: "ETF", bond: L("ETF obligataire", "Bond ETF"), commodity: L("Or / matières premières", "Gold / commodities"), crypto: "Crypto" }[inst.k]],
    ...(inst.sec ? [[L("Secteur / indice", "Sector / index"), inst.sec] as [string, React.ReactNode]] : []),
    ...(inst.ter != null ? [[L("Frais courants", "Ongoing charges"), `${F.num(inst.ter, 2)} % / ${L("an", "yr")}`] as [string, React.ReactNode]] : []),
    ...(rate && cashCcy(q?.ccy || inst.c) !== "EUR" ? [[`EUR/${cashCcy(q!.ccy)}`, rate.toFixed(4)] as [string, React.ReactNode]] : []),
    ...(q && rate ? [[L("Cours en euros", "Price in euros"), F.eur((q.price * unit(q.ccy)) / rate)] as [string, React.ReactNode]] : []),
  ];
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn(k.panel, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-b border-[var(--line)]">
        <button onClick={onBack} className={cn("p-1.5 -ml-1 rounded-md", k.sub, k.hover)} aria-label={L("Retour", "Back")}><ArrowLeft size={18} /></button>
        <Badge symbol={symbol} size={38} />
        <div className="min-w-0">
          <b className="block text-[18px] leading-tight truncate max-w-[50ch]">{inst.n}</b>
          <span className={cn("text-[12.5px]", k.sub)}>{symbol} · {inst.x}</span>
        </div>
        <button onClick={() => P.toggleFav(symbol)} className={cn("p-1.5 rounded-md", fav ? "text-[var(--warn)]" : k.sub, k.hover)} aria-label="Favourite"><Star size={17} fill={fav ? "currentColor" : "none"} /></button>
        <div className="ml-auto flex items-center gap-4">
          {q ? (
            <div className="text-right">
              <b className="block text-[22px] tabular-nums leading-tight">{F.px(q.price)} <span className={cn("text-[13px] font-semibold", k.sub)}>{q.ccy}</span></b>
              <span className={cn("text-[13px] font-semibold tabular-nums", sign(q.pct))}>{q.change >= 0 ? "+" : ""}{F.px(q.change)} ({F.pct(q.pct)})</span>
            </div>
          ) : <span className={k.sub}>{L("Cours indisponible", "No quote")}</span>}
          <div className="flex gap-1.5">
            <button onClick={() => P.openTicket(symbol, "buy")} className={cn(k.btn, "h-10 px-5 text-white bg-[var(--accent)] hover:bg-[var(--accent2)]")}>{L("Acheter", "Buy")}</button>
            <button onClick={() => P.openTicket(symbol, "sell", pos?.qty)} disabled={!pos} className={cn(k.btn, "h-10 px-5 text-white bg-[var(--down)] hover:brightness-95")}>{L("Vendre", "Sell")}</button>
          </div>
        </div>
      </div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-3 h-[420px] lg:h-[480px] min-w-0"><PriceChart symbol={symbol} dark={P.dark} labels={{ loading: L("Chargement du graphique", "Loading chart"), fallback: L("Historique indisponible ici, graphique TradingView affiché.", "Price history unavailable here, showing the TradingView chart.") }} /></div>
        <aside className="border-t xl:border-t-0 xl:border-l border-[var(--line)] p-4 grid content-start gap-4 text-[13.5px]">
          <dl className="grid gap-2">
            {facts.map(([l, v]) => <div key={l} className="flex justify-between gap-3"><dt className={k.sub}>{l}</dt><dd className="font-semibold text-right">{v}</dd></div>)}
          </dl>
          {inst.priips && acct.settings.priips && <p className="flex gap-2 text-[12.5px] rounded-lg p-2.5 bg-[var(--chip)]"><TriangleAlert size={15} className="shrink-0 text-[var(--warn)]" />{L("Fonds américain sans KID : achat bloqué pour les particuliers européens. Vous pouvez lever cette règle dans les paramètres.", "US fund without a KID: purchase blocked for European retail investors. You can lift this rule in settings.")}</p>}
          <div className="rounded-xl border border-[var(--line)] p-3">
            <span className={cn("text-[12px] font-bold uppercase tracking-[0.08em]", k.sub)}>{L("Ma position", "My position")}</span>
            {pos ? (
              <dl className="mt-2 grid gap-1.5">
                <div className="flex justify-between"><dt className={k.sub}>{L("Quantité", "Quantity")}</dt><dd className="font-semibold tabular-nums">{fmtQty(pos.qty)}</dd></div>
                <div className="flex justify-between"><dt className={k.sub}>{L("Prix de revient", "Avg price")}</dt><dd className="font-semibold tabular-nums">{F.px(pos.costLocal / pos.qty)} {pos.ccy}</dd></div>
                <div className="flex justify-between"><dt className={k.sub}>{L("Valeur", "Value")}</dt><dd className="font-semibold tabular-nums">{F.eur(valueEur)}</dd></div>
                <div className="flex justify-between"><dt className={k.sub}>{L("P&L (frais inclus)", "P&L (after fees)")}</dt><dd className={cn("font-semibold tabular-nums", sign(valueEur - pos.costEur))}>{F.signed(valueEur - pos.costEur)}</dd></div>
              </dl>
            ) : <p className={cn("mt-1.5 text-[13px]", k.sub)}>{L("Aucune position sur ce produit.", "No position in this product.")}</p>}
          </div>
        </aside>
      </div>
    </motion.section>
  );
}
