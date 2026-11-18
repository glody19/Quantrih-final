import React, { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/utils";
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, readPdfUsage, setPlanPreview, type PlanId } from "../../lib/plans";
import { CARD } from "./shared";

const L = {
  fr: {
    current: "Votre formule", perMonth: "/ mois", free: "Gratuit", change: "Voir toutes les formules", usage: "Utilisation ce mois-ci",
    saved: "Analyses enregistrées", pdf: "Rapports PDF", portfolios: "Portefeuilles par backtest", years: "Durée maximale d'un backtest", compare: "Portefeuilles comparés",
    branding: "Rapports à votre marque", white: "Marque blanche", csv: "Export CSV", notes: "Notes et étiquettes", unlimited: "Illimité", full: "Historique complet", yrs: "ans",
    admin: "Aperçu administrateur", adminLead: "Voir le site comme chaque formule. Visible uniquement par les administrateurs.", payment: "Le paiement en ligne n'est pas encore ouvert : toutes les formules payantes sont annoncées sur la page Tarifs.",
  },
  en: {
    current: "Your plan", perMonth: "/ month", free: "Free", change: "See all plans", usage: "Usage this month",
    saved: "Saved analyses", pdf: "PDF reports", portfolios: "Portfolios per backtest", years: "Longest backtest", compare: "Portfolios compared",
    branding: "Reports under your brand", white: "White label", csv: "CSV export", notes: "Notes and tags", unlimited: "Unlimited", full: "Full history", yrs: "years",
    admin: "Admin preview", adminLead: "See the site as each plan does. Visible to administrators only.", payment: "Online payment is not open yet: paid plans are announced on the Pricing page.",
  },
};

export function PlanPanel({ plan, isAdmin, savedCount, uid, language, onPricing }: { plan: PlanId; isAdmin: boolean; savedCount: number; uid?: string; language: "fr" | "en"; onPricing: () => void }) {
  const l = L[language];
  const lim = PLAN_LIMITS[plan];
  const [pdf, setPdf] = useState(0);
  useEffect(() => { readPdfUsage(uid).then(setPdf); }, [uid]);
  const n = (v: number) => (Number.isFinite(v) ? String(v) : l.unlimited);

  const meter = (label: string, used: number, cap: number) => (
    <div>
      <div className="flex justify-between text-[15px]"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-900">{used} / {n(cap)}</span></div>
      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full rounded-full", Number.isFinite(cap) && used >= cap ? "bg-rose-500" : "bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]")} style={{ width: Number.isFinite(cap) ? `${Math.min(100, (used / Math.max(1, cap)) * 100)}%` : "6%" }} />
      </div>
    </div>
  );

  const rows: [string, React.ReactNode][] = [
    [l.portfolios, n(lim.maxPortfolios)],
    [l.years, Number.isFinite(lim.maxYears) ? `${lim.maxYears} ${l.yrs}` : l.full],
    [l.compare, n(lim.compareMax)],
    [l.branding, lim.branding],
    [l.white, lim.whiteLabel],
    [l.csv, lim.csv],
    [l.notes, lim.notes],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.25rem] p-6 md:p-7 text-white bg-[radial-gradient(ellipse_at_0%_0%,#14466B_0%,#0C2233_55%,#06121B_100%)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#A9C8EA]">{l.current}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[34px] leading-none font-semibold tracking-tight">{PLAN_NAMES[plan]}</p>
            <p className="mt-2 text-white/70">{PLAN_PRICES[plan].monthly ? `${PLAN_PRICES[plan].monthly} € ${l.perMonth}` : l.free}</p>
          </div>
          <button type="button" onClick={onPricing} className="h-11 px-5 rounded-full bg-white text-[#0A1E2D] text-sm font-semibold hover:bg-[#E6F0FA]">{l.change}</button>
        </div>
      </section>

      <section className={cn(CARD, "p-6 space-y-5")}>
        <h3 className="text-lg font-semibold text-slate-900">{l.usage}</h3>
        {meter(l.saved, savedCount, lim.maxSaved)}
        {meter(l.pdf, pdf, lim.pdfPerMonth)}
      </section>

      <section className={cn(CARD, "overflow-hidden")}>
        <table className="w-full text-[15px]">
          <tbody className="divide-y divide-slate-100">
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="px-6 py-3.5 text-slate-600">{k}</td>
                <td className="px-6 py-3.5 text-right font-semibold text-slate-900">{v === true ? <Check className="w-5 h-5 text-emerald-600 inline" /> : v === false ? <Minus className="w-4 h-4 text-slate-300 inline" /> : v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-sm text-slate-500">{l.payment}</p>

      {isAdmin && (
        <section className={cn(CARD, "p-6 border-dashed")}>
          <h3 className="text-lg font-semibold text-slate-900">{l.admin}</h3>
          <p className="text-sm text-slate-500 mt-1">{l.adminLead}</p>
          <div className="mt-4 flex gap-2">
            {(["free", "premium", "pro"] as PlanId[]).map((p) => (
              <button key={p} type="button" onClick={() => setPlanPreview(p === "pro" ? null : p)} className={cn("h-10 px-4 rounded-full text-sm font-semibold border", plan === p ? "bg-[#0A1E2D] text-white border-[#0A1E2D]" : "border-slate-200 text-slate-600")}>{PLAN_NAMES[p]}</button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
