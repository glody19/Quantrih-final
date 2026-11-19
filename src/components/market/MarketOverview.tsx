import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { assetClasses, etfUniverse, majorIndices, megatrends } from "../pages/assetClassesData";
import { topETFs } from "../pages/etfData";

/**
 * Market overview: indices, asset classes, themes and the 20 best ETFs, every figure computed
 * live from real adjusted closes by /api/stock/returns (refreshed hourly). If the price service is
 * unreachable, the tables fall back to the figures stored on 30 June 2026 and say so.
 */

export type ReturnKey = "m1" | "m3" | "m6" | "ytd" | "y1" | "y3" | "y5" | "y10";
type Ret = Partial<Record<ReturnKey, number | null>> & { asOf?: string; last?: number };

const STATIC_DATE = "2026-06-30";
const MAX_ROWS = 20;

const L = {
  en: {
    indices: "Indices", indicesLead: "The benchmarks the market looks at first. Price return in local currency.",
    classes: "Asset classes", classesLead: "One ETF per asset class. Total return in USD, dividends reinvested.",
    themes: "Themes", themesLead: "Megatrend ETFs against the Nasdaq 100. Total return in USD.",
    etfs: "Top 20 ETFs over 12 months", etfsShort: "Ranked live on the 1-year return among 80 liquid US-listed ETFs, leveraged funds excluded.", etfsLead: "80 liquid US-listed ETFs (sectors, countries, themes, commodities, factors), ranked live on their 1-year return. Leveraged funds are excluded.",
    news: "Market news", newsLead: "The latest headlines from the financial press.",
    updated: "Updated", live: "Live data", stale: "Price service unavailable: figures as of 30 June 2026.",
    ann: "Tables: 3Y and 5Y are annualised.", ticker: "Ticker", name: "Name", noNews: "News unavailable right now.",
    open: "Click a row to open its analysis.",
  },
  fr: {
    indices: "Indices", indicesLead: "Les références que le marché regarde en premier. Variation du cours en devise locale.",
    classes: "Classes d'actifs", classesLead: "Un ETF par classe d'actifs. Rendement total en USD, dividendes réinvestis.",
    themes: "Thématiques", themesLead: "Les ETF des grandes tendances face au Nasdaq 100. Rendement total en USD.",
    etfs: "Top 20 des ETF sur 12 mois", etfsShort: "Classés en direct sur le rendement à 1 an parmi 80 ETF cotés aux États-Unis, sans levier.", etfsLead: "80 ETF cotés aux États-Unis et liquides (secteurs, pays, thèmes, matières premières, facteurs), classés en direct sur leur rendement à 1 an. Les fonds à levier sont exclus.",
    news: "Actualités", newsLead: "Les derniers titres de la presse financière.",
    updated: "Mis à jour le", live: "Données en direct", stale: "Service de prix indisponible : chiffres au 30 juin 2026.",
    ann: "Tableaux : 3Y et 5Y sont annualisés (1M = 1 mois, YTD = depuis janvier).", ticker: "Ticker", name: "Nom", noNews: "Actualités indisponibles pour le moment.",
    open: "Cliquez sur une ligne pour ouvrir son analyse.",
  },
};

const COLS: Record<ReturnKey, { en: string; fr: string }> = {
  m1: { en: "1M", fr: "1 mois" }, m3: { en: "3M", fr: "3 mois" }, m6: { en: "6M", fr: "6 mois" }, ytd: { en: "YTD", fr: "Depuis janv." },
  y1: { en: "1Y", fr: "1 an" }, y3: { en: "3Y", fr: "3 ans" }, y5: { en: "5Y", fr: "5 ans" }, y10: { en: "10Y", fr: "10 ans" },
};

const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);
const fmt = (v: any) => (isNum(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "-");
const tone = (v: any) => (!isNum(v) ? "text-slate-900" : v >= 0 ? "text-emerald-700" : "text-rose-700");

/** Fetches /api/stock/returns in chunks of 40 symbols. */
function useReturns(symbols: string[]) {
  const key = symbols.join(",");
  const [data, setData] = useState<Record<string, Ret | null>>({});
  const [state, setState] = useState<"loading" | "live" | "stale">("loading");
  useEffect(() => {
    let live = true;
    const chunks: string[][] = [];
    for (let i = 0; i < symbols.length; i += 40) chunks.push(symbols.slice(i, i + 40));
    Promise.all(chunks.map((c) =>
      fetch(`/api/stock/returns?symbols=${encodeURIComponent(c.join(","))}`)
        .then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : {}))
        .catch(() => ({})),
    )).then((parts) => {
      if (!live) return;
      const merged = Object.assign({}, ...parts) as Record<string, Ret | null>;
      const ok = Object.values(merged).filter((x) => x && isNum(x.y1) || x && isNum(x.m1)).length;
      setData(merged);
      setState(ok >= Math.max(1, Math.floor(symbols.length / 3)) ? "live" : "stale");
    });
    return () => { live = false; };
  }, [key]);
  return { data, state };
}

const latest = (data: Record<string, Ret | null>) =>
  Object.values(data).reduce<string | null>((m, x) => (x?.asOf && (!m || x.asOf > m) ? x.asOf : m), null);

function dateLabel(iso: string | null, lang: "en" | "fr") {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Section heading, same writing as the Dark Pools page ── */
function Heading({ id, title, lead, meta, compact }: { id: string; title: string; lead: string; meta?: React.ReactNode; compact?: boolean }) {
  if (compact) {
    return (
      <div id={id} className="scroll-mt-36">
        <h2 className="text-[19px] font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-[13px] leading-snug text-slate-900 min-h-[34px]">{lead}</p>
        {meta && <div className="mt-1 text-[12px] text-slate-900">{meta}</div>}
      </div>
    );
  }
  return (
    <div id={id} className="scroll-mt-36 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1.5 max-w-3xl text-[14.5px] leading-relaxed text-slate-900">{lead}</p>
      </div>
      {meta && <div className="shrink-0 text-[12.5px] text-slate-900">{meta}</div>}
    </div>
  );
}

function Freshness({ state, asOf, lang }: { state: "loading" | "live" | "stale"; asOf: string | null; lang: "en" | "fr" }) {
  const t = L[lang];
  if (state === "loading") return <span className="inline-block h-4 w-40 rounded bg-slate-100 animate-pulse" />;
  if (state === "stale") return <span className="text-amber-700">{t.stale}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {t.updated} {dateLabel(asOf, lang)}
    </span>
  );
}

/* ── Sortable performance table ── */
interface Row { ticker: string; name: string; values: Partial<Record<ReturnKey, number | null>>; highlight?: boolean }

function PerfTable({ rows, cols, defaultSort, lang, onSelect, bar }: {
  rows: Row[]; cols: ReturnKey[]; defaultSort: ReturnKey; lang: "en" | "fr"; onSelect?: (t: string) => void; bar?: ReturnKey;
}) {
  const [sort, setSort] = useState<{ k: ReturnKey | "name"; dir: 1 | -1 }>({ k: defaultSort, dir: -1 });
  const sorted = useMemo(() => {
    const r = rows.slice();
    r.sort((a, b) => {
      if (sort.k === "name") return a.name.localeCompare(b.name) * sort.dir;
      const x = a.values[sort.k], y = b.values[sort.k];
      if (!isNum(x) && !isNum(y)) return 0;
      if (!isNum(x)) return 1;
      if (!isNum(y)) return -1;
      return (x - y) * sort.dir;
    });
    return r.slice(0, MAX_ROWS);
  }, [rows, sort]);
  const maxBar = useMemo(() => (bar ? Math.max(1, ...sorted.map((r) => Math.abs(r.values[bar] ?? 0))) : 1), [sorted, bar]);
  const click = (k: ReturnKey | "name") => setSort((s) => (s.k === k ? { k, dir: (s.dir * -1) as 1 | -1 } : { k, dir: k === "name" ? 1 : -1 }));
  const Arrow = sort.dir === -1 ? ArrowDown : ArrowUp;
  const t = L[lang];

  return (
    <div className="mt-3 rounded-xl bg-white ring-1 ring-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] leading-tight">
          <thead>
            <tr className="border-b border-slate-200 text-[11.5px] text-slate-900">
              <th className="sticky left-0 z-10 bg-white text-left font-semibold pl-2.5 pr-1 py-1.5">{t.ticker}</th>
              <th className="text-left font-semibold px-1 py-1.5">
                <button type="button" onClick={() => click("name")} className="inline-flex items-center gap-1 hover:text-slate-900">
                  {t.name} {sort.k === "name" && <Arrow size={12} />}
                </button>
              </th>
              {cols.map((c) => (
                <th key={c} className={cn("text-right font-semibold px-[5px] py-1.5 whitespace-nowrap", sort.k === c && "bg-slate-50 text-slate-950")}>
                  <button type="button" onClick={() => click(c)} className="inline-flex items-center gap-0.5 hover:text-slate-950">
                    {sort.k === c && <Arrow size={11} />}{COLS[c].en}
                  </button>
                </th>
              ))}
              <th className="w-1.5" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.ticker} onClick={onSelect ? () => onSelect(r.ticker) : undefined}
                className={cn("border-b border-slate-100 last:border-0 transition-colors", onSelect && "cursor-pointer hover:bg-slate-50", r.highlight && "bg-slate-50/70")}>
                <td className="sticky left-0 z-10 bg-inherit pl-2.5 pr-1 py-1.5 font-semibold text-slate-950 whitespace-nowrap">
                  <span className="text-slate-900 tabular-nums mr-1.5 text-[10.5px]">{String(i + 1).padStart(2, "0")}</span>{r.ticker.replace(/^\^/, "")}
                </td>
                <td className="px-1 py-1.5 text-slate-950 whitespace-nowrap max-w-[150px] xl:max-w-[86px] 2xl:max-w-[150px] truncate" title={r.name}>{r.name}</td>
                {cols.map((c) => {
                  const v = r.values[c];
                  return (
                    <td key={c} className={cn("px-[5px] py-1.5 text-right tabular-nums whitespace-nowrap", tone(v), sort.k === c && "bg-slate-50/80 font-semibold")}>
                      {bar === c && isNum(v) ? (
                        <span className="inline-flex items-center justify-end gap-2">
                          <span className="hidden 2xl:block h-1.5 rounded-full bg-slate-200 w-10 overflow-hidden">
                            <span className={cn("block h-full rounded-full", v >= 0 ? "bg-emerald-600/70" : "bg-rose-600/70")} style={{ width: `${Math.min(100, (Math.abs(v) / maxBar) * 100)}%` }} />
                          </span>
                          {fmt(v)}
                        </span>
                      ) : fmt(v)}
                    </td>
                  );
                })}
                <td className="w-1.5" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Indices: compact tiles ── */
function IndexTiles({ data, lang }: { data: Record<string, Ret | null>; lang: "en" | "fr" }) {
  return (
    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5">
      {majorIndices.map((idx, i) => {
        const r = data[idx.ticker];
        return (
          <motion.div key={idx.ticker} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
            className="rounded-xl bg-white ring-1 ring-slate-200/80 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-slate-900 truncate">{idx.asset}</p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums text-slate-900">
              {isNum(r?.last) ? r!.last!.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 2 }) : <span className="inline-block h-5 w-20 rounded bg-slate-100" />}
            </p>
            <div className="mt-1.5 flex gap-3 text-[12px] tabular-nums">
              <span className="text-slate-900">{COLS.ytd[lang]} <b className={cn("font-semibold", tone(r?.ytd))}>{fmt(r?.ytd)}</b></span>
              <span className="text-slate-900">{COLS.y1[lang]} <b className={cn("font-semibold", tone(r?.y1))}>{fmt(r?.y1)}</b></span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── News: one lead story and a list ── */
function News({ items, loading, lang }: { items: any[]; loading: boolean; lang: "en" | "fr" }) {
  const list = items.filter((n) => n && (n.headline || n.summary)).slice(0, 7);
  if (loading) return <div className="mt-5 h-48 rounded-2xl bg-slate-50 animate-pulse" />;
  if (!list.length) return <p className="mt-5 text-[14px] text-slate-400">{L[lang].noNews}</p>;
  const [lead, ...rest] = list;
  return (
    <div className="mt-5 grid lg:grid-cols-5 gap-5 items-start">
      <a href={lead.url || "#"} target="_blank" rel="noopener noreferrer" className="lg:col-span-2 group rounded-2xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
        {lead.image && (
          <span className="block aspect-[16/9] bg-slate-100 overflow-hidden">
            <img src={lead.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </span>
        )}
        <span className="block p-5">
          <span className="block text-[18px] leading-snug font-semibold text-slate-900 group-hover:text-[#1B3F72]">{lead.headline || lead.summary}</span>
          <span className="mt-2 block text-[12.5px] text-slate-500">{lead.source || "Yahoo Finance"}{lead.date ? ` · ${lead.date}` : ""}</span>
        </span>
      </a>
      <div className="lg:col-span-3 rounded-2xl ring-1 ring-slate-200/80 bg-white divide-y divide-slate-100">
        {rest.map((n, i) => (
          <a key={n.id || i} href={n.url || "#"} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-slate-50">
            <span className="min-w-0">
              <span className="block text-[14.5px] leading-snug font-semibold text-slate-900 group-hover:text-[#1B3F72]">{n.headline || n.summary}</span>
              <span className="mt-1 block text-[12px] text-slate-500">{n.source || "Yahoo Finance"}{n.date ? ` · ${n.date}` : ""}</span>
            </span>
            <ExternalLink size={13} className="mt-1 shrink-0 text-slate-300 group-hover:text-slate-500" />
          </a>
        ))}
      </div>
    </div>
  );
}

export const OVERVIEW_SECTIONS = ["indices", "asset-classes", "themes", "top-etfs", "news"] as const;

export function MarketOverview({ language, news, newsLoading, onSelect }: {
  language: string; news: any[]; newsLoading: boolean; onSelect: (symbol: string) => void;
}) {
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t = L[lang];

  const idx = useReturns(majorIndices.map((x) => x.ticker));
  const cls = useReturns(assetClasses.map((x) => x.ticker));
  const thm = useReturns(megatrends.map((x) => x.ticker));
  const etf = useReturns(etfUniverse.map((x) => x.ticker));

  const SHORT: ReturnKey[] = ["m1", "ytd", "y1", "y3", "y5"];

  const rowsFrom = (list: any[], r: { data: Record<string, Ret | null>; state: string }, highlight?: (x: any) => boolean): Row[] =>
    list.map((x) => {
      const live = r.data[x.ticker];
      const values: Row["values"] = r.state === "stale" || !live
        ? (r.state === "stale" ? { m1: x.m1, m3: x.m3, m6: x.m6, y1: x.y1, y3: x.y3, y5: x.y5, y10: x.y10 } : {})
        : live;
      return { ticker: x.ticker, name: x.asset.replace(/^\[Benchmark\]\s*/, ""), values, highlight: highlight?.(x) };
    });

  const classRows = useMemo(() => rowsFrom(assetClasses, cls), [cls]);
  const themeRows = useMemo(() => rowsFrom(megatrends, thm, (x) => x.asset.startsWith("[Benchmark]")), [thm]);
  const etfRows = useMemo<Row[]>(() => {
    if (etf.state === "stale") {
      return topETFs.filter((x) => !x.symbol.includes(".")).map((x) => ({
        ticker: x.symbol, name: x.name,
        values: { m1: parseFloat(x.m1), m3: parseFloat(x.m3), m6: parseFloat(x.m6), y1: parseFloat(x.y1) },
      }));
    }
    return etfUniverse.map((x) => ({ ticker: x.ticker, name: x.asset, values: etf.data[x.ticker] || {} }));
  }, [etf]);

  const meta = (r: { data: Record<string, Ret | null>; state: "loading" | "live" | "stale" }) => <Freshness state={r.state} asOf={latest(r.data)} lang={lang} />;

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 pb-6">
      <section className="mt-12">
        <Heading id="indices" title={t.indices} lead={t.indicesLead} meta={meta(idx)} />
        <IndexTiles data={idx.data} lang={lang} />
      </section>

      {/* three compact tables side by side (two on medium screens, one on phones) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10 items-start">
        <section className="min-w-0">
          <Heading compact id="asset-classes" title={t.classes} lead={t.classesLead} meta={meta(cls)} />
          <PerfTable rows={classRows} cols={SHORT} defaultSort="y1" lang={lang} onSelect={onSelect} />
        </section>

        <section className="min-w-0">
          <Heading compact id="themes" title={t.themes} lead={t.themesLead} meta={meta(thm)} />
          <PerfTable rows={themeRows} cols={SHORT} defaultSort="y1" lang={lang} onSelect={onSelect} />
        </section>

        <section className="min-w-0">
          <Heading compact id="top-etfs" title={t.etfs} lead={t.etfsShort} meta={meta(etf)} />
          <PerfTable rows={etfRows} cols={["m1", "m6", "ytd", "y1"]} defaultSort="y1" lang={lang} onSelect={onSelect} />
        </section>
      </div>
      <p className="mt-2 text-[12px] text-slate-900">{t.ann} {t.open}</p>

      <section className="mt-14">
        <Heading id="news" title={t.news} lead={t.newsLead} />
        <News items={news} loading={newsLoading} lang={lang} />
      </section>
    </div>
  );
}
