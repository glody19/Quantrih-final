import React, { useEffect, useState } from "react";
import { Check, Minus, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, readPdfUsage, setPlanPreview, type PlanId, type SubscriptionInfo } from "../../lib/plans";
import { billingErrorMessage, cancelSubscription, openBillingPortal, resumeSubscription } from "../../lib/billing";
import { CARD } from "./shared";

const L = {
  fr: {
    current: "Votre formule", perMonth: "/ mois", free: "Gratuit", change: "Voir toutes les formules", usage: "Utilisation ce mois-ci",
    saved: "Analyses enregistrées", pdf: "Rapports PDF", portfolios: "Portefeuilles par backtest", years: "Durée maximale d'un backtest", compare: "Portefeuilles comparés",
    branding: "Rapports à votre marque", white: "Marque blanche", csv: "Export CSV", notes: "Notes et étiquettes", unlimited: "Illimité", full: "Historique complet", yrs: "ans",
    admin: "Aperçu administrateur", adminLead: "Voir le site comme chaque formule. Visible uniquement par les administrateurs.",
    fundamentals: "Analyse fondamentale", fundCore: "Essentielle", fundFull: "Complète",
    billing: "Abonnement et facturation", monthly: "Facturé chaque mois", yearly: "Facturé chaque année", renews: "Prochain renouvellement le {d}", ends: "Accès jusqu'au {d}, puis retour au Freemium",
    pastDue: "Le dernier paiement a échoué. Mettez à jour votre carte pour garder votre formule.",
    portal: "Factures et moyen de paiement", cancel: "Annuler l'abonnement", resume: "Reprendre l'abonnement",
    confirmTitle: "Annuler votre abonnement ?", confirmLead: "Vous gardez toutes les fonctions {p} jusqu'au {d}. Aucun autre paiement ne sera prélevé. Vos analyses restent dans votre compte.",
    confirmYes: "Oui, annuler", confirmNo: "Garder mon abonnement", cancelled: "Abonnement annulé. Il reste actif jusqu'à la fin de la période payée.", resumed: "Abonnement repris.",
    freeLead: "Passez à Premium ou Pro quand vous voulez. Sans engagement, annulable à tout moment.", upgrade: "Choisir une formule",
  },
  en: {
    current: "Your plan", perMonth: "/ month", free: "Free", change: "See all plans", usage: "Usage this month",
    saved: "Saved analyses", pdf: "PDF reports", portfolios: "Portfolios per backtest", years: "Longest backtest", compare: "Portfolios compared",
    branding: "Reports under your brand", white: "White label", csv: "CSV export", notes: "Notes and tags", unlimited: "Unlimited", full: "Full history", yrs: "years",
    admin: "Admin preview", adminLead: "See the site as each plan does. Visible to administrators only.",
    fundamentals: "Fundamental analysis", fundCore: "Core", fundFull: "Complete",
    billing: "Subscription and billing", monthly: "Billed monthly", yearly: "Billed yearly", renews: "Renews on {d}", ends: "Access until {d}, then back to Freemium",
    pastDue: "The last payment failed. Update your card to keep your plan.",
    portal: "Invoices and payment method", cancel: "Cancel subscription", resume: "Resume subscription",
    confirmTitle: "Cancel your subscription?", confirmLead: "You keep every {p} feature until {d}. No further payment will be taken. Your analyses stay in your account.",
    confirmYes: "Yes, cancel", confirmNo: "Keep my subscription", cancelled: "Subscription cancelled. It stays active until the end of the paid period.", resumed: "Subscription resumed.",
    freeLead: "Move to Premium or Pro whenever you like. No commitment, cancel at any time.", upgrade: "Choose a plan",
  },
};

export function PlanPanel({ plan, subscription, isAdmin, savedCount, uid, language, onPricing }: { plan: PlanId; subscription?: SubscriptionInfo; isAdmin: boolean; savedCount: number; uid?: string; language: "fr" | "en"; onPricing: () => void }) {
  const l = L[language];
  const lim = PLAN_LIMITS[plan];
  const [pdf, setPdf] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const sub = subscription;
  const paying = !!sub && sub.plan !== "free";
  const date = (ms: number | null) => (ms ? new Intl.DateTimeFormat(language === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(ms)) : "");
  const run = async (key: string, fn: () => Promise<unknown>, ok?: string) => {
    setBusy(key); setNotice(null);
    try { await fn(); if (ok) setNotice({ ok: true, text: ok }); }
    catch (e: any) { setNotice({ ok: false, text: billingErrorMessage(e?.message || "", language) }); }
    finally { setBusy(null); }
  };
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
    [l.fundamentals, lim.fundamentals === "full" ? l.fundFull : lim.fundamentals === "core" ? l.fundCore : false],
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

      {/* Subscription and billing */}
      <section className={cn(CARD, "p-6")}>
        <h3 className="text-lg font-semibold text-slate-900">{l.billing}</h3>
        {paying ? (
          <>
            <p className="mt-2 text-[15px] text-slate-600">
              {PLAN_NAMES[sub!.plan]} · {sub!.interval === "year" ? l.yearly : l.monthly}
              {sub!.currentPeriodEnd ? <> · {(sub!.cancelAtPeriodEnd ? l.ends : l.renews).replace("{d}", date(sub!.currentPeriodEnd))}</> : null}
            </p>
            {sub!.status === "past_due" && <p className="mt-3 text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{l.pastDue}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" disabled={!!busy} onClick={() => run("portal", openBillingPortal)} className="h-10 px-4 rounded-full text-sm font-semibold border border-slate-300 text-slate-800 hover:border-slate-500 disabled:opacity-60 inline-flex items-center gap-2">
                {busy === "portal" && <Loader2 className="w-4 h-4 animate-spin" />}{l.portal}
              </button>
              {sub!.cancelAtPeriodEnd ? (
                <button type="button" disabled={!!busy} onClick={() => run("resume", resumeSubscription, l.resumed)} className="h-10 px-4 rounded-full text-sm font-semibold bg-[#0A1E2D] text-white hover:bg-[#14466B] disabled:opacity-60 inline-flex items-center gap-2">
                  {busy === "resume" && <Loader2 className="w-4 h-4 animate-spin" />}{l.resume}
                </button>
              ) : (
                <button type="button" disabled={!!busy} onClick={() => setConfirm(true)} className="h-10 px-4 rounded-full text-sm font-semibold text-slate-500 hover:text-rose-700 disabled:opacity-60">{l.cancel}</button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] text-slate-600">{l.freeLead}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={onPricing} className="h-10 px-4 rounded-full text-sm font-semibold bg-[#0A1E2D] text-white hover:bg-[#14466B]">{l.upgrade}</button>
              {sub?.hasCustomer && (
                <button type="button" disabled={!!busy} onClick={() => run("portal", openBillingPortal)} className="h-10 px-4 rounded-full text-sm font-semibold border border-slate-300 text-slate-800 hover:border-slate-500 disabled:opacity-60">{l.portal}</button>
              )}
            </div>
          </>
        )}
        {notice && <p className={cn("mt-4 text-sm rounded-lg px-3 py-2", notice.ok ? "text-emerald-800 bg-emerald-50" : "text-rose-700 bg-rose-50")}>{notice.text}</p>}
      </section>

      {confirm && paying && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" onClick={() => setConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold text-slate-900">{l.confirmTitle}</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{l.confirmLead.replace("{p}", PLAN_NAMES[sub!.plan]).replace("{d}", date(sub!.currentPeriodEnd))}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setConfirm(false)} className="h-10 px-4 rounded-full text-sm font-semibold bg-[#0A1E2D] text-white hover:bg-[#14466B]">{l.confirmNo}</button>
              <button type="button" disabled={!!busy} onClick={async () => { await run("cancel", cancelSubscription, l.cancelled); setConfirm(false); }} className="h-10 px-4 rounded-full text-sm font-semibold border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60 inline-flex items-center gap-2">
                {busy === "cancel" && <Loader2 className="w-4 h-4 animate-spin" />}{l.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

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
