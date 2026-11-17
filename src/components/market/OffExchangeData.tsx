import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

const CARD = "rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";

type Venue = { mpid: string; name: string; shares: number; trades: number; notional: number };
type Overview = { week: string; total: { shares: number; trades: number; notional: number } | null; venues: Venue[]; history: { week: string; shares: number }[] };
type Stock = { symbol: string; name: string; week: string; total: number; venues: Venue[] };

const fmt = (n: number, lang: string) => {
  const a = Math.abs(n);
  const loc = lang === "fr" ? "fr-BE" : "en-GB";
  if (a >= 1e12) return (n / 1e12).toLocaleString(loc, { maximumFractionDigits: 2 }) + (lang === "fr" ? " Bn" : " tn");
  if (a >= 1e9) return (n / 1e9).toLocaleString(loc, { maximumFractionDigits: 1 }) + (lang === "fr" ? " Md" : " bn");
  if (a >= 1e6) return (n / 1e6).toLocaleString(loc, { maximumFractionDigits: 1 }) + " M";
  if (a >= 1e3) return (n / 1e3).toLocaleString(loc, { maximumFractionDigits: 1 }) + " k";
  return n.toLocaleString(loc);
};
const day = (d: string, lang: string) => new Date(d + "T00:00:00Z").toLocaleDateString(lang === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
// "UBSA UBS ATS" -> "UBS ATS"
const clean = (v: Venue) => (v.name || v.mpid).replace(new RegExp(`^${v.mpid}\\s+`), "");

/**
 * Weekly volumes of US alternative trading systems (dark pools), from FINRA's public OTC transparency data.
 * The data is published with a delay of a few weeks; the week shown is always stated.
 */
export function OffExchangeData({ lang }: { lang: "en" | "fr" }) {
  const fr = lang === "fr";
  const [data, setData] = useState<Overview | null | "error">(null);
  const [q, setQ] = useState("AAPL");
  const [stock, setStock] = useState<Stock | null | "error" | "loading">(null);

  useEffect(() => {
    fetch("/api/finra/ats").then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setData("error"));
  }, []);

  const lookup = (sym: string) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setStock("loading");
    fetch(`/api/finra/ats/stock?symbol=${encodeURIComponent(s)}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => setStock(d?.venues?.length ? d : "error")).catch(() => setStock("error"));
  };
  useEffect(() => { lookup("AAPL"); }, []);

  const top = useMemo(() => (data && data !== "error" ? data.venues.slice(0, 15) : []), [data]);
  const atsTotal = useMemo(() => top.length && data && data !== "error" ? data.venues.reduce((a, v) => a + v.shares, 0) : 0, [data, top]);
  const maxH = data && data !== "error" ? Math.max(1, ...data.history.map((h) => h.shares)) : 1;

  if (data === "error") {
    return <p className="mt-6 text-[14px] text-slate-500">{fr ? "Les données hebdomadaires ne sont pas disponibles pour le moment." : "Weekly data is not available right now."}</p>;
  }

  return (
    <div className="mt-7 grid gap-6">
      {/* key figures */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          [fr ? "Actions échangées en dark pool" : "Shares traded in dark pools", data ? fmt(atsTotal, lang) : ""],
          [fr ? "Nombre de plateformes actives" : "Active venues", data ? String(data.venues.length) : ""],
          [fr ? "Taille moyenne d'une transaction" : "Average trade size", data ? `${Math.round(atsTotal / Math.max(1, data.venues.reduce((a, v) => a + v.trades, 0))).toLocaleString(fr ? "fr-BE" : "en-GB")} ${fr ? "actions" : "shares"}` : ""],
        ].map(([l, v], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className={cn(CARD, "p-5")}>
            <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{l}</span>
            {v ? <span className="mt-2 block text-[28px] font-semibold tabular-nums text-slate-900">{v}</span> : <span className="mt-3 block h-7 w-32 rounded bg-slate-100 animate-pulse" />}
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.25fr_1fr] gap-6">
        {/* ranking of venues */}
        <div className={cn(CARD, "p-4 sm:p-5 overflow-x-auto")}>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="text-[17px] font-semibold text-slate-900">{fr ? "Les plus grands dark pools américains" : "Largest US dark pools"}</h3>
            {data && <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{fr ? "Semaine du" : "Week of"} {day(data.week, lang)}</span>}
          </div>
          <table className="w-full min-w-[520px] text-[13px] sm:text-[14px] border-separate border-spacing-y-[3px]">
            <thead>
              <tr className="text-[12.5px] text-slate-500">
                <th className="w-7" /><th className="text-left font-medium pb-1">{fr ? "Plateforme" : "Venue"}</th>
                <th className="text-right font-medium pb-1 px-2">{fr ? "Actions" : "Shares"}</th>
                <th className="text-right font-medium pb-1 px-2">{fr ? "Transactions" : "Trades"}</th>
                <th className="text-right font-medium pb-1 px-2">{fr ? "Montant" : "Notional"}</th>
                <th className="text-left font-medium pb-1 pl-3 w-[26%]">{fr ? "Part" : "Share"}</th>
              </tr>
            </thead>
            <tbody>
              {!data
                ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-8 rounded-md bg-slate-50 animate-pulse" /></td></tr>)
                : top.map((v, i) => {
                    const share = (v.shares / atsTotal) * 100;
                    return (
                      <motion.tr key={v.mpid} className="h-9" initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}>
                        <td className="text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="font-semibold text-slate-900 leading-tight">{clean(v)} <span className="text-[11px] font-normal text-slate-400">{v.mpid}</span></td>
                        <td className="text-right tabular-nums px-2">{fmt(v.shares, lang)}</td>
                        <td className="text-right tabular-nums px-2 text-slate-600">{fmt(v.trades, lang)}</td>
                        <td className="text-right tabular-nums px-2 text-slate-600">{v.notional ? "$" + fmt(v.notional, lang) : "-"}</td>
                        <td className="pl-3">
                          <span className="flex items-center gap-2">
                            <span className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                              <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[#1D6FA8]" initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, share * 2.5)}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 + i * 0.04 }} />
                            </span>
                            <span className="w-11 text-right tabular-nums text-[12.5px] text-slate-600">{share.toFixed(1)}%</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-6 content-start">
          {/* weekly history */}
          <div className={cn(CARD, "p-4 sm:p-5")}>
            <h3 className="text-[17px] font-semibold text-slate-900">{fr ? "Volume hebdomadaire en dark pool" : "Weekly dark pool volume"}</h3>
            <p className="text-[12.5px] text-slate-500">{fr ? "Actions échangées, toutes plateformes" : "Shares traded, all venues"}</p>
            <div className="mt-4 h-[150px] flex items-end gap-[3px]">
              {data && data.history.map((h, i) => (
                <div key={h.week} className="group relative flex-1 h-full flex items-end">
                  <motion.span className="w-full rounded-t-[3px] bg-[#38BDF8] group-hover:bg-[#1B3F72]" initial={{ height: 0 }} whileInView={{ height: `${(h.shares / maxH) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.02 }} />
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0C2233] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100">{day(h.week, lang)} · {fmt(h.shares, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* per stock lookup */}
          <div className={cn(CARD, "p-4 sm:p-5")}>
            <h3 className="text-[17px] font-semibold text-slate-900">{fr ? "Une action dans les dark pools" : "One stock in the dark pools"}</h3>
            <form onSubmit={(e) => { e.preventDefault(); lookup(q); }} className="mt-3 flex gap-2">
              <span className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="AAPL, NVDA, SPY..." className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-50 text-[14px] outline-none focus:ring-2 focus:ring-[#1B3F72]/25 uppercase" />
              </span>
              <button className="px-4 py-2 rounded-full bg-[#0C2233] text-white text-[13px] font-semibold">{fr ? "Voir" : "Show"}</button>
            </form>
            {stock === "loading" && <div className="mt-4 h-32 rounded-xl bg-slate-50 animate-pulse" />}
            {stock === "error" && <p className="mt-4 text-[13.5px] text-slate-500">{fr ? "Aucune donnée pour ce ticker. Les données couvrent les actions américaines." : "No data for this ticker. The data covers US-listed stocks."}</p>}
            {stock && typeof stock === "object" && (
              <div className="mt-4">
                <p className="text-[13.5px] text-slate-600"><b className="text-slate-900">{stock.name || stock.symbol}</b> · {fmt(stock.total, lang)} {fr ? "actions en dark pool, semaine du" : "shares in dark pools, week of"} {day(stock.week, lang)}</p>
                <div className="mt-3 grid gap-1.5">
                  {stock.venues.slice(0, 6).map((v) => (
                    <div key={v.mpid} className="flex items-center gap-3 text-[13px]">
                      <span className="w-[42%] truncate font-medium text-slate-800">{clean(v)}</span>
                      <span className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden"><span className="absolute inset-y-0 left-0 rounded-full bg-[#E2B84F]" style={{ width: `${(v.shares / stock.venues[0].shares) * 100}%` }} /></span>
                      <span className="w-14 text-right tabular-nums text-slate-600">{((v.shares / stock.total) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-[12px] text-slate-500">{fr
        ? "Systèmes de négociation alternatifs américains, actions NMS. Données publiées par la FINRA avec un délai de plusieurs semaines : la semaine affichée est la dernière disponible. Les wholesalers ne sont pas inclus."
        : "US alternative trading systems, NMS stocks. Data published by FINRA with a delay of several weeks: the week shown is the latest available. Wholesalers are not included."}</p>
    </div>
  );
}
