import React, { useMemo, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Two blocks shown above the results of the backtest tools:
 * - a plain-language summary computed from the figures (no AI, no network),
 * - stress tests that replay each portfolio through well-known market crises.
 * Both use the monthly time-weighted returns, so money added or withdrawn is not counted as gain or loss.
 */
export interface InsightPortfolio {
  id?: string;
  name: string;
  color?: string;
  cagr: number; // % per year
  stdev?: number; // %
  maxDrawdown: number; // negative %
  sharpe?: number;
  dates: string[];
  monthlyReturns?: { date: string; value: number }[]; // % per month
  balances?: number[];
}

type Lang = "fr" | "en";

const CRISES: { id: string; start: string; end: string; fr: string; en: string; frNote: string; enNote: string }[] = [
  { id: "dotcom", start: "2000-09", end: "2002-09", fr: "2000 bulle internet", en: "2000 dot-com bust", frNote: "septembre 2000 à septembre 2002", enNote: "September 2000 to September 2002" },
  { id: "gfc", start: "2007-11", end: "2009-02", fr: "2008 crise financière", en: "2008 financial crisis", frNote: "novembre 2007 à février 2009", enNote: "November 2007 to February 2009" },
  { id: "euro", start: "2011-05", end: "2011-09", fr: "2011 crise de l'euro", en: "2011 euro crisis", frNote: "mai à septembre 2011", enNote: "May to September 2011" },
  { id: "covid", start: "2020-02", end: "2020-03", fr: "2020 Covid", en: "2020 Covid crash", frNote: "février et mars 2020", enNote: "February and March 2020" },
  { id: "inflation", start: "2022-01", end: "2022-09", fr: "2022 inflation et hausse des taux", en: "2022 inflation and rate hikes", frNote: "janvier à septembre 2022", enNote: "January to September 2022" },
];

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtPct = (v: number, lang: Lang, d = 1) => {
  const s = Math.abs(v).toFixed(d);
  return lang === "fr" ? `${s.replace(".", ",")} %` : `${s}%`;
};
const fmtNum = (v: number, lang: Lang, d = 2) => (lang === "fr" ? v.toFixed(d).replace(".", ",") : v.toFixed(d));
const monthLabel = (ym: string, lang: Lang) => {
  const [y, m] = ym.split("-").map(Number);
  return `${(lang === "fr" ? MONTHS_FR : MONTHS_EN)[m - 1]} ${y}`;
};

/** Month (YYYY-MM) to end-of-month index level, built from the monthly returns (or from the balances as a fallback). */
function monthlyIndex(p: InsightPortfolio): { months: string[]; level: Map<string, number>; before: Map<string, number> } {
  const months: string[] = [];
  const level = new Map<string, number>();
  const before = new Map<string, number>();
  let idx = 1;
  if (p.monthlyReturns && p.monthlyReturns.length) {
    for (const r of p.monthlyReturns) {
      const ym = r.date.substring(0, 7);
      before.set(ym, idx);
      idx *= 1 + (Number(r.value) || 0) / 100;
      months.push(ym);
      level.set(ym, idx);
    }
  } else if (p.balances && p.balances.length) {
    p.dates.forEach((d, i) => {
      const ym = d.substring(0, 7);
      const v = p.balances![i];
      if (i > 0) before.set(ym, p.balances![i - 1]);
      months.push(ym);
      level.set(ym, v);
    });
  }
  return { months, level, before };
}

interface CrisisRow {
  loss: number; // % from the level before the crisis to the lowest point inside it
  months: number; // months from the start of the crisis to the lowest point
  recovered: string | null; // first month back at the pre-crisis level
}

export function crisisFor(p: InsightPortfolio, start: string, end: string): CrisisRow | null {
  const { months, level, before } = monthlyIndex(p);
  if (!months.length || months[0] > start || months[months.length - 1] < end) return null;
  const base = before.get(start);
  if (!base) return null;
  let low = Infinity;
  let lowAt = start;
  for (const m of months) {
    if (m < start || m > end) continue;
    const v = level.get(m)!;
    if (v < low) {
      low = v;
      lowAt = m;
    }
  }
  let recovered: string | null = null;
  for (const m of months) {
    if (m <= lowAt) continue;
    if (level.get(m)! >= base) {
      recovered = m;
      break;
    }
  }
  const [sy, sm] = start.split("-").map(Number);
  const [ly, lm] = lowAt.split("-").map(Number);
  return { loss: Math.min(0, (low / base - 1) * 100), months: (ly - sy) * 12 + (lm - sm) + 1, recovered };
}

function monthsBetween(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-slate-900">{children}</strong>;

function Summary({ items, lang }: { items: InsightPortfolio[]; lang: Lang }) {
  const valid = items
    .filter((p) => Number.isFinite(p.cagr) && Number.isFinite(p.maxDrawdown) && p.dates.length > 1)
    .map((p) => ({ ...p, maxDrawdown: -Math.abs(p.maxDrawdown) }));
  if (!valid.length) return null;
  const y0 = valid[0].dates[0].substring(0, 4);
  const y1 = valid[0].dates[valid[0].dates.length - 1].substring(0, 4);
  const fr = lang === "fr";
  const period = fr ? `De ${y0} à ${y1}` : `From ${y0} to ${y1}`;

  if (valid.length === 1) {
    const p = valid[0];
    return (
      <p>
        {period}, <B>{p.name}</B> {fr ? "a rapporté" : "returned"} <B>{fmtPct(p.cagr, lang)} {fr ? "par an" : "a year"}</B>
        {fr ? ", avec une pire baisse de " : ", with a worst fall of "}<B>{fmtPct(p.maxDrawdown, lang)}</B>
        {Number.isFinite(p.stdev) ? (fr ? ` et une volatilité de ${fmtPct(p.stdev!, lang)}` : ` and a volatility of ${fmtPct(p.stdev!, lang)}`) : ""}.
        {Number.isFinite(p.sharpe) ? (fr ? ` Son ratio de Sharpe est de ${fmtNum(p.sharpe!, lang)}.` : ` Its Sharpe ratio is ${fmtNum(p.sharpe!, lang)}.`) : ""}
      </p>
    );
  }

  const byCagr = [...valid].sort((a, b) => b.cagr - a.cagr);
  const bySafety = [...valid].sort((a, b) => b.maxDrawdown - a.maxDrawdown); // closest to 0 first
  const withSharpe = valid.filter((p) => Number.isFinite(p.sharpe));
  const bySharpe = [...withSharpe].sort((a, b) => (b.sharpe as number) - (a.sharpe as number));
  const best = byCagr[0];
  const safe = bySafety[0];
  const balanced = bySharpe[0];
  const gap = best.cagr - byCagr[byCagr.length - 1].cagr;

  return (
    <p>
      {period}, <B>{best.name}</B> {fr ? "a le meilleur rendement" : "has the highest return"}, <B>{fmtPct(best.cagr, lang)} {fr ? "par an" : "a year"}</B>
      {best === safe ? (
        <>{fr ? ", et aussi la pire baisse la plus faible (" : ", and also the smallest worst fall ("}<B>{fmtPct(best.maxDrawdown, lang)}</B>{fr ? ") : il fait mieux sur les deux plans." : "): it wins on both counts."}</>
      ) : (
        <>
          {fr ? ", mais il a perdu jusqu'à " : ", but it fell as much as "}<B>{fmtPct(best.maxDrawdown, lang)}</B>.{" "}
          <B>{safe.name}</B> {fr ? "a résisté le mieux, avec une pire baisse de " : "held up best, with a worst fall of "}<B>{fmtPct(safe.maxDrawdown, lang)}</B>
          {fr ? ` pour ${fmtPct(safe.cagr, lang)} par an.` : ` for ${fmtPct(safe.cagr, lang)} a year.`}
        </>
      )}
      {balanced && balanced !== best && balanced !== safe && (
        <> {fr ? "Le meilleur compromis rendement / risque est " : "The best balance of return and risk is "}<B>{balanced.name}</B>{fr ? ` (Sharpe ${fmtNum(balanced.sharpe!, lang)}).` : ` (Sharpe ${fmtNum(balanced.sharpe!, lang)}).`}</>
      )}
      {balanced && (balanced === best || balanced === safe) && best !== safe && (
        <> {fr ? `Sur le rapport rendement / risque, c'est ${balanced.name} qui l'emporte (Sharpe ${fmtNum(balanced.sharpe!, lang)}).` : `On return per unit of risk, ${balanced.name} comes out ahead (Sharpe ${fmtNum(balanced.sharpe!, lang)}).`}</>
      )}
      {gap >= 0.5 && (
        <> {fr ? `L'écart de rendement entre le premier et le dernier est de ${fmtNum(gap, lang, 1)} point${gap >= 2 ? "s" : ""} par an.` : `The return gap between first and last is ${fmtNum(gap, lang, 1)} points a year.`}</>
      )}
    </p>
  );
}

function CrisisTests({ items, lang }: { items: InsightPortfolio[]; lang: Lang }) {
  const fr = lang === "fr";
  const available = useMemo(
    () => CRISES.filter((c) => items.some((p) => crisisFor(p, c.start, c.end))),
    [items],
  );
  const [active, setActive] = useState<string | null>(null);
  if (!available.length) return null;
  const crisis = available.find((c) => c.id === active) || available.find((c) => c.id === "gfc") || available[available.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[15px] font-semibold text-slate-900">{fr ? "Tests de crise" : "Crisis tests"}</h3>
        <span className="text-[12px] text-slate-500">{fr ? "Rendements mensuels, hors versements et retraits" : "Monthly returns, excluding contributions and withdrawals"}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3" role="tablist">
        {available.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === crisis.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "px-3 py-1 rounded-full text-[12.5px] transition-colors ring-1",
              c.id === crisis.id ? "ring-slate-800 text-slate-900 font-semibold bg-white" : "ring-slate-200 text-slate-500 hover:text-slate-900 hover:ring-slate-300 bg-white",
            )}
          >
            {fr ? c.fr : c.en}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-slate-500 mb-2">{fr ? `Période : ${crisis.frNote}.` : `Period: ${crisis.enNote}.`}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr>
              <th>{fr ? "Portefeuille" : "Portfolio"}</th>
              <th className="text-right">{fr ? "Perte max." : "Max. loss"}</th>
              <th className="text-right">{fr ? "Mois jusqu'au plus bas" : "Months to the low"}</th>
              <th className="text-right">{fr ? "Retour au niveau d'avant" : "Back to pre-crisis level"}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => {
              const r = crisisFor(p, crisis.start, crisis.end);
              return (
                <tr key={(p.id || p.name) + i}>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || "#94A3B8" }} />
                      {p.name}
                    </span>
                  </td>
                  {r ? (
                    <>
                      <td className={cn("text-right tabular-nums", r.loss < -0.05 ? "text-red" : "text-slate-700")}>{r.loss < -0.05 ? `-${fmtPct(r.loss, lang)}` : fr ? "Aucune perte" : "No loss"}</td>
                      <td className="text-right tabular-nums">{r.loss < -0.05 ? r.months : "-"}</td>
                      <td className="text-right tabular-nums">
                        {r.loss >= -0.05
                          ? "-"
                          : r.recovered
                          ? `${monthLabel(r.recovered, lang)} (${monthsBetween(crisis.start, r.recovered)} ${fr ? "mois" : "months"})`
                          : fr ? "Pas encore" : "Not yet"}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="text-right text-slate-400">{fr ? "Données trop courtes" : "Data too short"}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Summary sentence and crisis tests, placed at the top of a backtest report. */
export function ResultInsights({ portfolios, language, excludeFromRanking }: { portfolios: InsightPortfolio[]; language?: string; excludeFromRanking?: string }) {
  const lang: Lang = language === "fr" ? "fr" : "en";
  const ranked = portfolios.filter((p) => !excludeFromRanking || p.id !== excludeFromRanking);
  if (!portfolios.length) return null;
  return (
    <section className="mb-10 text-left">
      <div className="mb-8 max-w-[900px]">
        <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{lang === "fr" ? "En résumé" : "In short"}</h3>
        <div className="text-[15.5px] leading-relaxed text-slate-700">
          <Summary items={ranked} lang={lang} />
        </div>
      </div>
      <CrisisTests items={portfolios} lang={lang} />
    </section>
  );
}
