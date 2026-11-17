import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/utils";

const CARD = "rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
const isNum = (v: any): v is number => typeof v === "number" && Number.isFinite(v);

type Coin = { id: string; symbol: string; name: string; image: string | null; rank: number | null; price: number | null; marketCap: number | null; volume: number | null; ch24h: number | null; ch7d: number | null; ch30d: number | null; ch1y: number | null; spark: number[] };
type Markets = { asOf: string; coins: Coin[] };
type Stable = { name: string; symbol: string; pegType: string; mechanism: string; supply: number; price: number | null; chains: number | null };
type Stables = { asOf: string; totalUsd: number; byMechanism: Record<string, number>; assets: Stable[]; history: { date: string; usd: number }[] };

const short = (n: number, lang: "en" | "fr") => {
  const a = Math.abs(n);
  const loc = lang === "fr" ? "fr-BE" : "en-GB";
  if (a >= 1e12) return (n / 1e12).toLocaleString(loc, { maximumFractionDigits: 2 }) + (lang === "fr" ? " Bn" : " tn");
  if (a >= 1e9) return (n / 1e9).toLocaleString(loc, { maximumFractionDigits: 1 }) + (lang === "fr" ? " Md" : " bn");
  if (a >= 1e6) return (n / 1e6).toLocaleString(loc, { maximumFractionDigits: 1 }) + " M";
  return n.toLocaleString(loc, { maximumFractionDigits: 0 });
};
const price = (n: number, lang: "en" | "fr") =>
  "$" + n.toLocaleString(lang === "fr" ? "fr-BE" : "en-GB", { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 4 : 2 });
const pct = (v: number | null) => (isNum(v) ? `${v > 0 ? "+" : ""}${v.toFixed(1)}%` : "-");
const tone = (v: number | null) => (!isNum(v) ? "text-slate-300" : v >= 0 ? "text-emerald-700" : "text-[#9F1239]");

/** Number that counts up the first time it scrolls into view. */
export function CountUp({ value, format, delay = 0, className }: { value: number; format: (n: number) => string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, value, { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [seen, value, delay]);
  return <span ref={ref} className={className}>{format(v)}</span>;
}

/** Seven-day price line, drawn in plain SVG. */
function Spark({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return <span className="block h-7" />;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const d = data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * 100).toFixed(2)} ${(28 - ((v - min) / span) * 26).toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full h-7" preserveAspectRatio="none" aria-hidden>
      <motion.path d={d} fill="none" stroke={up ? "#059669" : "#BE123C"} strokeWidth="1.6" vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  );
}

function useJson<T>(url: string) {
  const [data, setData] = useState<T | null | "error">(null);
  useEffect(() => {
    let alive = true;
    fetch(url).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => alive && setData(d)).catch(() => alive && setData("error"));
    return () => { alive = false; };
  }, [url]);
  return data;
}

const L = {
  en: {
    capTitle: "Largest crypto assets", capSub: "By market capitalisation, prices in USD.", asset: "Asset", priceCol: "Price", cap: "Market cap", vol: "24h volume", d7: "7 days",
    unavailable: "Live data is not available right now.", updated: "Updated",
    totalCap: "Market cap, top 20", btcDom: "Bitcoin share of the top 20", stableTotal: "USD stablecoins in circulation",
    stTitle: "Stablecoin supply", stSub: "Total USD-pegged supply, weekly.", stByCoin: "Largest stablecoins", stMech: "By backing mechanism",
    mech: { "fiat-backed": "Fiat reserves", "crypto-backed": "Crypto collateral", algorithmic: "Algorithmic", other: "Other" } as Record<string, string>,
    supply: "Supply", peg: "Price", note: "Market data from public crypto data services, refreshed every few minutes. Stablecoin supply is quoted in the peg currency; only USD-pegged coins are summed.",
  },
  fr: {
    capTitle: "Les plus grands crypto-actifs", capSub: "Par capitalisation, prix en dollars.", asset: "Actif", priceCol: "Prix", cap: "Capitalisation", vol: "Volume 24 h", d7: "7 jours",
    unavailable: "Les données en direct ne sont pas disponibles pour le moment.", updated: "Mis à jour",
    totalCap: "Capitalisation, top 20", btcDom: "Part du bitcoin dans le top 20", stableTotal: "Stablecoins en dollars en circulation",
    stTitle: "Offre de stablecoins", stSub: "Offre totale indexée sur le dollar, par semaine.", stByCoin: "Les plus grands stablecoins", stMech: "Par mécanisme de garantie",
    mech: { "fiat-backed": "Réserves en monnaie", "crypto-backed": "Collatéral crypto", algorithmic: "Algorithmique", other: "Autre" } as Record<string, string>,
    supply: "Offre", peg: "Prix", note: "Données de marché issues de services publics de données crypto, rafraîchies toutes les quelques minutes. L'offre de stablecoins est exprimée dans la devise d'ancrage ; seuls les stablecoins en dollars sont additionnés.",
  },
};

/** Key figures, the top 20 table and the stablecoin panels. Each block hides itself if its data is missing. */
export function CryptoData({ lang, part }: { lang: "en" | "fr"; part: "markets" | "stables" }) {
  const t = L[lang];
  const markets = useJson<Markets>("/api/crypto/markets");
  const stables = useJson<Stables>("/api/crypto/stablecoins");
  const m = markets && markets !== "error" ? markets : null;
  const s = stables && stables !== "error" ? stables : null;

  const total = useMemo(() => (m ? m.coins.reduce((a, c) => a + (c.marketCap || 0), 0) : 0), [m]);
  const btc = m?.coins.find((c) => c.id === "bitcoin");

  if (part === "markets") {
    if (markets === "error") return <p className="mt-6 text-[14px] text-slate-500">{t.unavailable}</p>;
    return (
      <div className="mt-7 grid gap-6">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            [t.totalCap, m ? () => <CountUp value={total} format={(n) => "$" + short(n, lang)} /> : null],
            [t.btcDom, m && btc?.marketCap ? () => <CountUp value={(btc.marketCap! / total) * 100} format={(n) => n.toFixed(1) + "%"} delay={0.15} /> : null],
            [t.stableTotal, s ? () => <CountUp value={s.totalUsd} format={(n) => "$" + short(n, lang)} delay={0.3} /> : null],
          ].map(([label, V], i) => (
            <motion.div key={label as string} initial={{ opacity: 0, y: 18, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.12 }} className={cn(CARD, "p-5")}>
              <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label as string}</span>
              <span className="mt-2 block text-[28px] font-semibold tabular-nums text-slate-900">
                {V ? (V as () => React.ReactNode)() : <span className="mt-1 block h-7 w-32 rounded bg-slate-100 animate-pulse" />}
              </span>
            </motion.div>
          ))}
        </div>

        <div className={cn(CARD, "p-4 sm:p-5 overflow-x-auto")}>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <div>
              <h3 className="text-[17px] font-semibold text-slate-900">{t.capTitle}</h3>
              <p className="text-[12.5px] text-slate-500">{t.capSub}</p>
            </div>
            {m && <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t.updated} {new Date(m.asOf).toLocaleTimeString(lang === "fr" ? "fr-BE" : "en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
          <table className="w-full min-w-[820px] text-[13px] sm:text-[14px] border-separate border-spacing-y-[3px]">
            <thead>
              <tr className="text-[12.5px] text-slate-500">
                <th className="w-7" />
                <th className="text-left font-medium pb-1">{t.asset}</th>
                <th className="text-right font-medium pb-1 px-2">{t.priceCol}</th>
                <th className="text-right font-medium pb-1 px-2">24h</th>
                <th className="text-right font-medium pb-1 px-2">7d</th>
                <th className="text-right font-medium pb-1 px-2">30d</th>
                <th className="text-right font-medium pb-1 px-2">1Y</th>
                <th className="text-right font-medium pb-1 px-2">{t.cap}</th>
                <th className="text-right font-medium pb-1 px-2">{t.vol}</th>
                <th className="font-medium pb-1 pl-3 w-[12%]">{t.d7}</th>
              </tr>
            </thead>
            <tbody>
              {!m
                ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan={10}><div className="h-9 rounded-md bg-slate-50 animate-pulse" /></td></tr>)
                : m.coins.map((c, i) => (
                    <motion.tr key={c.id} className="h-11 hover:bg-slate-50 transition-colors" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: Math.min(i, 12) * 0.04 }}>
                      <td className="text-slate-400 tabular-nums">{c.rank ?? i + 1}</td>
                      <td className="pr-2">
                        <span className="flex items-center gap-2.5">
                          {c.image ? <img src={c.image} alt="" className="w-6 h-6 rounded-full" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /> : <span className="w-6 h-6 rounded-full bg-slate-100" />}
                          <span className="leading-tight"><b className="font-semibold text-slate-900">{c.name}</b> <span className="text-[12px] text-slate-500">{c.symbol}</span></span>
                        </span>
                      </td>
                      <td className="text-right tabular-nums px-2 font-semibold text-slate-900">{isNum(c.price) ? price(c.price, lang) : "-"}</td>
                      {[c.ch24h, c.ch7d, c.ch30d, c.ch1y].map((v, k) => <td key={k} className={cn("text-right tabular-nums px-2 font-semibold", tone(v))}>{pct(v)}</td>)}
                      <td className="text-right tabular-nums px-2 text-slate-700">{isNum(c.marketCap) ? "$" + short(c.marketCap, lang) : "-"}</td>
                      <td className="text-right tabular-nums px-2 text-slate-500">{isNum(c.volume) ? "$" + short(c.volume, lang) : "-"}</td>
                      <td className="pl-3"><Spark data={c.spark} up={(c.ch7d ?? 0) >= 0} /></td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12px] text-slate-500">{t.note}</p>
        </div>
      </div>
    );
  }

  // stablecoin part
  if (stables === "error") return <p className="mt-6 text-[14px] text-slate-500">{t.unavailable}</p>;
  const mech = s ? Object.entries(s.byMechanism).sort((a, b) => b[1] - a[1]) : [];
  const mechTotal = mech.reduce((a, [, v]) => a + v, 0) || 1;
  const MECH_COLORS = ["#1D6FA8", "#38BDF8", "#E2B84F", "#94A3B8"];
  const top = s ? s.assets.slice(0, 10) : [];
  const topMax = top[0]?.supply || 1;
  return (
    <div className="mt-7 grid xl:grid-cols-[1.35fr_1fr] gap-6">
      <div className={cn(CARD, "p-4 sm:p-5 flex flex-col")}>
        <h3 className="text-[17px] font-semibold text-slate-900">{t.stTitle}</h3>
        <p className="text-[12.5px] text-slate-500">{t.stSub}</p>
        <div className="mt-4 flex-1 min-h-[300px]">
          {s && s.history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.history} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stableArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D6FA8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1D6FA8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(d: string) => new Date(d).toLocaleDateString(lang === "fr" ? "fr-BE" : "en-GB", { month: "short", year: "2-digit" })} minTickGap={60} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => "$" + short(v, lang)} width={70} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => ["$" + short(Number(v), lang), t.supply]} labelFormatter={(d: any) => new Date(String(d)).toLocaleDateString(lang === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 12px 30px -16px rgba(6,18,27,0.45)", fontSize: 13 }} />
                <Area type="monotone" dataKey="usd" stroke="#1D6FA8" strokeWidth={2} fill="url(#stableArea)" animationDuration={1600} />
              </AreaChart>
            </ResponsiveContainer>
          ) : !s ? <div className="h-full rounded-xl bg-slate-50 animate-pulse" /> : null}
        </div>
      </div>

      <div className="grid gap-6 content-start">
        <div className={cn(CARD, "p-4 sm:p-5")}>
          <h3 className="text-[17px] font-semibold text-slate-900">{t.stMech}</h3>
          {s ? (
            <>
              <div className="mt-4 flex h-4 rounded-full overflow-hidden">
                {mech.map(([k, v], i) => (
                  <motion.span key={k} title={t.mech[k] || k} style={{ background: MECH_COLORS[i % MECH_COLORS.length] }} initial={{ width: 0 }} whileInView={{ width: `${(v / mechTotal) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.15 }} />
                ))}
              </div>
              <div className="mt-3 grid gap-1.5">
                {mech.map(([k, v], i) => (
                  <div key={k} className="flex items-center gap-2 text-[13.5px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: MECH_COLORS[i % MECH_COLORS.length] }} />
                    <span className="flex-1 text-slate-700">{t.mech[k] || k}</span>
                    <span className="tabular-nums text-slate-900 font-semibold">{((v / mechTotal) * 100).toFixed(1)}%</span>
                    <span className="w-20 text-right tabular-nums text-slate-500">${short(v, lang)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="mt-4 h-24 rounded-xl bg-slate-50 animate-pulse" />}
        </div>

        <div className={cn(CARD, "p-4 sm:p-5")}>
          <h3 className="text-[17px] font-semibold text-slate-900">{t.stByCoin}</h3>
          <div className="mt-3 grid gap-2">
            {s ? top.map((a, i) => (
              <motion.div key={a.name + a.symbol} className="flex items-center gap-3 text-[13.5px]" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <span className="w-[34%] truncate"><b className="font-semibold text-slate-900">{a.symbol}</b> <span className="text-slate-500">{a.name}</span></span>
                <span className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[#38BDF8]" initial={{ width: 0 }} whileInView={{ width: `${(a.supply / topMax) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 + i * 0.05 }} />
                </span>
                <span className="w-16 text-right tabular-nums text-slate-700">{short(a.supply, lang)}</span>
                <span className={cn("w-16 text-right tabular-nums", isNum(a.price) && Math.abs(a.price - 1) > 0.01 && a.pegType === "peggedUSD" ? "text-[#9F1239] font-semibold" : "text-slate-500")}>{isNum(a.price) ? a.price.toFixed(3) : "-"}</span>
              </motion.div>
            )) : <div className="h-40 rounded-xl bg-slate-50 animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
}
