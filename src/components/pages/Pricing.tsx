import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Minus, ChevronDown, Loader2, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { usePlan, PLAN_PRICES, type PlanId } from "../../lib/plans";
import { billingErrorMessage, openBillingPortal, startCheckout, syncSubscription } from "../../lib/billing";

// Sober page: white background, black text, one dark accent for the recommended plan.

type Cell = boolean | string;
type Row = { k: string; v: [Cell, Cell, Cell]; soon?: boolean };

const T = {
  fr: {
    kicker: "Tarifs",
    title: "Une formule pour chaque façon d'investir",
    lead: "Commencez gratuitement. Passez à Premium pour enregistrer, comparer et présenter vos analyses, ou à Pro pour travailler sans limite avec vos clients.",
    monthly: "Mensuel", yearly: "Annuel", save: "2 mois offerts",
    perMonth: "/ mois", perYear: "/ an", billedYearly: "soit {x} par mois, facturé annuellement",
    plans: {
      free: { name: "Freemium", tag: "Pour découvrir", desc: "Tous les outils de Quantrih pour tester vos premières allocations.", cta: "Créer un compte gratuit" },
      premium: { name: "Premium", tag: "Le plus choisi", desc: "Pour l'investisseur qui suit ses portefeuilles et les compare dans le temps.", cta: "Choisir Premium" },
      pro: { name: "Pro", tag: "Conseillers et cabinets", desc: "Pour présenter des analyses à vos clients, à votre marque et sans limite.", cta: "Choisir Pro" },
    },
    current: "Votre formule", manage: "Gérer mon abonnement", switchTo: "Passer à {p}",
    success: "Merci ! Votre abonnement est actif. Vos nouvelles limites s'appliquent tout de suite.", cancelled: "Paiement interrompu. Aucun montant n'a été prélevé.",
    secure: "Paiement sécurisé par Stripe. Sans engagement, annulable à tout moment.",
    highlights: {
      free: ["3 portefeuilles par backtest", "20 ans d'historique", "5 analyses enregistrées", "1 rapport PDF par mois"],
      premium: ["6 portefeuilles par backtest", "Historique complet des données", "100 analyses enregistrées et comparaison", "10 rapports PDF par mois à votre nom", "Analyse fondamentale essentielle", "Notes, étiquettes et export CSV"],
      pro: ["10 portefeuilles par backtest", "Analyses et rapports illimités", "Rapports en marque blanche à vos couleurs", "Analyse fondamentale complète", "Analyses avancées des sauvegardes", "Support prioritaire"],
    },
    compareTitle: "Comparer les formules en détail",
    groups: [
      { title: "Backtesting", rows: [
        { k: "Portefeuilles comparés dans un backtest", v: ["3", "6", "10"] },
        { k: "Durée maximale d'un backtest", v: ["20 ans", "Historique complet", "Historique complet"] },
        { k: "Allocation d'actifs, backtest, Monte Carlo", v: [true, true, true] },
        { k: "Allocation tactique, momentum, moyennes mobiles, force relative", v: [true, true, true] },
        { k: "Versements et retraits programmés (semaine, mois, trimestre, quadrimestre, année)", v: [true, true, true] },
        { k: "Frais de courtage, fiscalité des dividendes, inflation", v: [true, true, true] },
      ] },
      { title: "Sauvegarde et historique", rows: [
        { k: "Analyses enregistrées dans le compte", v: ["5", "100", "Illimité"] },
        { k: "Historique, recherche et filtres", v: [true, true, true] },
        { k: "Notes et étiquettes par client", v: [false, true, true] },
        { k: "Comparaison côte à côte", v: ["2 portefeuilles", "4 portefeuilles", "8 portefeuilles"] },
        { k: "Graphiques de croissance et tableau comparatif", v: [true, true, true] },
        { k: "Carte rendement-risque, courbes de pertes, grille des rendements annuels", v: [false, false, true] },
        { k: "Export CSV des résultats", v: [false, true, true] },
      ] },
      { title: "Analyse fondamentale", rows: [
        { k: "Fiche société : profil, cours, capitalisation, dividende", v: [true, true, true] },
        { k: "États financiers : compte de résultat, bilan, flux de trésorerie", v: [false, "5 ans", "Historique complet"], soon: true },
        { k: "Ratios clés : marges, ROE, ROIC, endettement, PER, EV/EBITDA", v: [false, true, true], soon: true },
        { k: "Valorisation : DCF, multiples historiques, comparaison aux concurrents", v: [false, false, true], soon: true },
        { k: "Score de qualité et alertes sur les publications de résultats", v: [false, false, true], soon: true },
      ] },
      { title: "Rapports PDF", rows: [
        { k: "Rapports PDF par mois", v: ["1", "10", "Illimité"] },
        { k: "Logo et nom de votre entreprise", v: [false, true, true] },
        { k: "Nom du conseiller, coordonnées et nom du client", v: [false, true, true] },
        { k: "Introduction et mentions légales personnalisées", v: [false, true, true] },
        { k: "Couleur sur mesure et aucune mention Quantrih (marque blanche)", v: [false, false, true] },
      ] },
      { title: "Service", rows: [
        { k: "Support par e-mail", v: ["Standard", "Sous 48 h", "Prioritaire, sous 24 h"] },
        { k: "Accès anticipé aux nouveaux outils", v: [false, false, true] },
        { k: "Liens de partage en lecture seule pour vos clients", v: [false, false, true], soon: true },
        { k: "Alertes de rééquilibrage par e-mail", v: [false, true, true], soon: true },
      ] },
    ] as { title: string; rows: Row[] }[],
    soon: "Bientôt",
    proTitle: "Pensé pour présenter vos analyses à vos clients",
    proLead: "Avec Premium et Pro, chaque analyse enregistrée devient un rapport prêt à envoyer : votre logo en couverture, le nom de votre cabinet et du conseiller, le nom du client, une introduction rédigée par vous, puis les graphiques et tableaux de performance.",
    proPoints: [
      ["Votre marque", "Logo, nom de l'entreprise, conseiller et coordonnées sur chaque page."],
      ["Pour chaque client", "Titre, nom du client et introduction modifiables avant chaque export."],
      ["Lisible", "Synthèse, croissance, pertes maximales, rendements annuels et composition des portefeuilles."],
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      ["Comment se passe le paiement ?", "Le paiement est traité par Stripe, par carte bancaire ou par les moyens de paiement proposés dans votre pays. Quantrih ne voit jamais vos données de carte. Une facture est envoyée à chaque prélèvement."],
      ["Puis-je annuler à tout moment ?", "Oui, en un clic depuis votre espace client, rubrique Abonnement. Vous gardez votre formule jusqu'à la fin de la période payée, puis vous revenez au Freemium. Aucun autre prélèvement n'a lieu."],
      ["Puis-je changer de formule ?", "Oui. Le passage de Premium à Pro, ou du mensuel à l'annuel, se fait depuis votre espace client. Le montant est calculé au prorata."],
      ["Que deviennent mes analyses si je reviens au Freemium ?", "Elles restent dans votre compte et visibles. Vous pourrez en enregistrer de nouvelles une fois revenu sous la limite de la formule."],
      ["Pourquoi 20 ans d'historique en Freemium ?", "Vingt ans couvrent déjà plusieurs cycles, dont 2008 et 2020. L'historique complet, jusqu'aux années 1970 pour certaines classes d'actifs, est réservé aux formules payantes."],
      ["Quantrih donne-t-il des conseils en investissement ?", "Non. Quantrih fournit des outils de simulation sur données historiques. Les performances passées ne préjugent pas des performances futures."],
    ],
    note: "Prix en euros, toutes taxes comprises lorsque la TVA s'applique.",
  },
  en: {
    kicker: "Pricing",
    title: "A plan for every way of investing",
    lead: "Start for free. Move to Premium to save, compare and present your analyses, or to Pro to work without limits with your clients.",
    monthly: "Monthly", yearly: "Yearly", save: "2 months free",
    perMonth: "/ month", perYear: "/ year", billedYearly: "{x} per month, billed yearly",
    plans: {
      free: { name: "Freemium", tag: "To get started", desc: "Every Quantrih tool to test your first allocations.", cta: "Create a free account" },
      premium: { name: "Premium", tag: "Most popular", desc: "For investors who track their portfolios and compare them over time.", cta: "Choose Premium" },
      pro: { name: "Pro", tag: "Advisors and firms", desc: "To present analyses to your clients, under your brand and without limits.", cta: "Choose Pro" },
    },
    current: "Your plan", manage: "Manage my subscription", switchTo: "Switch to {p}",
    success: "Thank you! Your subscription is active. Your new limits apply right away.", cancelled: "Payment interrupted. Nothing was charged.",
    secure: "Secure payment by Stripe. No commitment, cancel at any time.",
    highlights: {
      free: ["3 portfolios per backtest", "20 years of history", "5 saved analyses", "1 PDF report per month"],
      premium: ["6 portfolios per backtest", "Full data history", "100 saved analyses and comparison", "10 PDF reports a month under your name", "Core fundamental analysis", "Notes, tags and CSV export"],
      pro: ["10 portfolios per backtest", "Unlimited analyses and reports", "White-label reports in your colours", "Complete fundamental analysis", "Advanced analysis of saved backtests", "Priority support"],
    },
    compareTitle: "Compare plans in detail",
    groups: [
      { title: "Backtesting", rows: [
        { k: "Portfolios compared in one backtest", v: ["3", "6", "10"] },
        { k: "Longest backtest period", v: ["20 years", "Full history", "Full history"] },
        { k: "Asset allocation, backtest, Monte Carlo", v: [true, true, true] },
        { k: "Tactical allocation, momentum, moving averages, relative strength", v: [true, true, true] },
        { k: "Scheduled contributions and withdrawals (weekly to yearly)", v: [true, true, true] },
        { k: "Broker fees, dividend tax, inflation", v: [true, true, true] },
      ] },
      { title: "Saving and history", rows: [
        { k: "Saved analyses in the account", v: ["5", "100", "Unlimited"] },
        { k: "History, search and filters", v: [true, true, true] },
        { k: "Notes and client tags", v: [false, true, true] },
        { k: "Side by side comparison", v: ["2 portfolios", "4 portfolios", "8 portfolios"] },
        { k: "Growth charts and comparison table", v: [true, true, true] },
        { k: "Risk-return map, drawdown curves, annual returns grid", v: [false, false, true] },
        { k: "CSV export of results", v: [false, true, true] },
      ] },
      { title: "Fundamental analysis", rows: [
        { k: "Company page: profile, price, market cap, dividend", v: [true, true, true] },
        { k: "Financial statements: income, balance sheet, cash flow", v: [false, "5 years", "Full history"], soon: true },
        { k: "Key ratios: margins, ROE, ROIC, leverage, P/E, EV/EBITDA", v: [false, true, true], soon: true },
        { k: "Valuation: DCF, historical multiples, peer comparison", v: [false, false, true], soon: true },
        { k: "Quality score and earnings alerts", v: [false, false, true], soon: true },
      ] },
      { title: "PDF reports", rows: [
        { k: "PDF reports per month", v: ["1", "10", "Unlimited"] },
        { k: "Your company logo and name", v: [false, true, true] },
        { k: "Advisor name, contact details and client name", v: [false, true, true] },
        { k: "Custom introduction and disclaimer", v: [false, true, true] },
        { k: "Custom colour and no Quantrih mention (white label)", v: [false, false, true] },
      ] },
      { title: "Service", rows: [
        { k: "Email support", v: ["Standard", "Within 48 h", "Priority, within 24 h"] },
        { k: "Early access to new tools", v: [false, false, true] },
        { k: "Read-only share links for your clients", v: [false, false, true], soon: true },
        { k: "Rebalancing alerts by email", v: [false, true, true], soon: true },
      ] },
    ] as { title: string; rows: Row[] }[],
    soon: "Soon",
    proTitle: "Built to present your analyses to clients",
    proLead: "With Premium and Pro, every saved analysis becomes a report ready to send: your logo on the cover, your firm and advisor name, the client's name, an introduction written by you, then the performance charts and tables.",
    proPoints: [
      ["Your brand", "Logo, company name, advisor and contact details on every page."],
      ["For each client", "Title, client name and introduction editable before each export."],
      ["Readable", "Summary, growth, maximum drawdowns, annual returns and portfolio composition."],
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      ["How does payment work?", "Payment is handled by Stripe, by card or the payment methods available in your country. Quantrih never sees your card details. An invoice is sent with every charge."],
      ["Can I cancel at any time?", "Yes, in one click from your account, Subscription section. You keep your plan until the end of the paid period, then return to Freemium. No further charge is taken."],
      ["Can I change plan?", "Yes. Moving from Premium to Pro, or from monthly to yearly, is done from your account. The amount is prorated."],
      ["What happens to my analyses if I go back to Freemium?", "They stay in your account and visible. You can save new ones once you are back under the plan's limit."],
      ["Why 20 years of history on Freemium?", "Twenty years already cover several cycles, including 2008 and 2020. The full history, back to the 1970s for some asset classes, is kept for paid plans."],
      ["Does Quantrih give investment advice?", "No. Quantrih provides simulation tools on historical data. Past performance does not guarantee future results."],
    ],
    note: "Prices in euros, including VAT where it applies.",
  },
};

function H({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? "text-center" : undefined}>
      <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[24px] md:text-[30px] font-bold tracking-tight text-slate-900">{children}</motion.h2>
      <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} style={{ transformOrigin: center ? "center" : "left" }} className={cn("block mt-3 h-[2px] w-12 rounded-full bg-slate-900", center && "mx-auto")} />
    </div>
  );
}

const ORDER: PlanId[] = ["free", "premium", "pro"];

export function Pricing({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { language } = useTranslation();
  const lang: "fr" | "en" = language === "fr" ? "fr" : "en";
  const t = T[lang];
  const { plan, signedIn, subscription, loading } = usePlan();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [yearly, setYearly] = useState(params.get("interval") === "year");
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const paying = signedIn && subscription.plan !== "free";
  const [open, setOpen] = useState<number | null>(0);
  const fmt = (v: number) => new Intl.NumberFormat(lang === "fr" ? "fr-BE" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: v % 1 ? 2 : 0 }).format(v);

  const cta = async (id: PlanId) => {
    if (id === "free") { onNavigate(signedIn ? "profile" : "auth"); return; }
    const interval = yearly ? "year" : "month";
    if (!signedIn) {
      // Sign in first, then come back here and open the checkout automatically.
      try { sessionStorage.setItem("quantrih_after_auth", `/pricing?plan=${id}&interval=${interval}`); } catch { /* storage unavailable */ }
      navigate("/auth");
      return;
    }
    setBusy(id); setBanner(null);
    try {
      if (paying) await openBillingPortal();
      else await startCheckout(id, interval, lang);
    } catch (e: any) {
      setBanner({ ok: false, text: billingErrorMessage(e?.message || "", lang) });
      setBusy(null);
    }
  };

  // Return from Stripe Checkout, or arrival after sign-in with a chosen plan.
  useEffect(() => {
    const status = params.get("checkout");
    if (status === "success") {
      setBanner({ ok: true, text: t.success });
      syncSubscription(params.get("session_id")).catch(() => { /* the webhook will sync */ });
      setParams({}, { replace: true });
    } else if (status === "cancelled") {
      setBanner({ ok: false, text: t.cancelled });
      setParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const wanted = params.get("plan");
    if (!signedIn || loading || (wanted !== "premium" && wanted !== "pro")) return;
    setParams({}, { replace: true });
    if (!paying) cta(wanted);
  }, [signedIn, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const cell = (v: Cell, id: PlanId) =>
    v === true ? <Check className="w-4 h-4 mx-auto text-slate-900" strokeWidth={2.5} aria-label={id} /> :
    v === false ? <Minus className="w-4 h-4 mx-auto text-slate-300" /> :
    <span className="text-[14px] font-semibold text-slate-900">{v}</span>;

  return (
    <div className="w-full font-sans pb-24 -mt-4 lg:-mt-6 bg-white">
      {/* Header band */}
      <div className="relative w-full">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-32 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t.kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-4 text-[32px] md:text-[48px] leading-[1.05] font-bold tracking-tight text-slate-900">{t.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 max-w-2xl mx-auto text-[16px] md:text-[18px] leading-relaxed text-slate-600">{t.lead}</motion.p>
          <div className="mt-7 inline-flex items-center p-1 rounded-full bg-slate-100">
            {[false, true].map((y) => (
              <button key={String(y)} type="button" onClick={() => setYearly(y)} className={cn("h-10 px-5 rounded-full text-sm font-semibold transition-colors", yearly === y ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}>
                {y ? t.yearly : t.monthly}
                {y && <span className={cn("ml-2 text-[11px] px-2 py-0.5 rounded-full", yearly ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600")}>{t.save}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan cards: white, thin border, dark frame for the recommended plan */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 -mt-28">
        {banner && (
          <div className={cn("relative z-10 mb-5 mx-auto max-w-2xl rounded-2xl px-5 py-3.5 text-[15px] font-medium text-center shadow-lg", banner.ok ? "bg-white text-slate-900 ring-1 ring-slate-300" : "bg-white text-slate-700 ring-1 ring-slate-200")}>{banner.text}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {ORDER.map((id, i) => {
            const p = t.plans[id];
            const featured = id === "premium";
            const price = PLAN_PRICES[id];
            const isCurrent = signedIn && plan === id;
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 * i }}
                className={cn("relative rounded-2xl bg-white", featured ? "ring-2 ring-slate-900 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)]" : "ring-1 ring-slate-200")}>
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full bg-slate-900 text-white whitespace-nowrap">
                    {p.tag}
                  </span>
                )}
                <div className="h-full flex flex-col rounded-2xl overflow-hidden">
                  <div className="relative px-6 pt-7 pb-5 border-b border-slate-100">
                    <div className="relative flex items-center justify-between gap-2">
                      <h3 className="text-[21px] font-bold tracking-tight text-slate-900">{p.name}</h3>
                      {!featured && <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{p.tag}</span>}
                    </div>
                    <p className="relative mt-2 text-[14px] text-slate-600 leading-snug min-h-[40px]">{p.desc}</p>
                    <div className="relative mt-4 flex items-baseline gap-1.5">
                      <span className="text-[40px] leading-none font-bold tracking-tight text-slate-900">{fmt(yearly ? price.yearly : price.monthly)}</span>
                      <span className="text-slate-500 text-sm">{yearly ? t.perYear : t.perMonth}</span>
                    </div>
                    <p className="relative mt-1.5 text-[12.5px] text-slate-500 min-h-[18px]">{yearly && price.yearly > 0 ? t.billedYearly.replace("{x}", fmt(Math.round((price.yearly / 12) * 100) / 100)) : ""}</p>
                  </div>
                  <div className="flex-1 flex flex-col px-6 pt-5 pb-6">
                    {isCurrent && paying ? (
                      <button type="button" onClick={() => cta(id)} disabled={!!busy}
                        className="h-11 rounded-full text-[14.5px] font-semibold transition-colors bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 inline-flex items-center justify-center gap-2">
                        {busy === id && <Loader2 className="w-4 h-4 animate-spin" />}{t.manage}
                      </button>
                    ) : (
                      <button type="button" onClick={() => cta(id)} disabled={isCurrent || !!busy}
                        className={cn("h-11 rounded-full text-[14.5px] font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:cursor-default", isCurrent ? "bg-slate-100 text-slate-500" : featured ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50")}>
                        {busy === id && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isCurrent ? t.current : paying && id !== "free" ? t.switchTo.replace("{p}", p.name) : p.cta}
                      </button>
                    )}
                    <ul className="mt-5 space-y-2.5 text-[14px] text-slate-800">
                      {t.highlights[id].map((h) => (
                        <li key={h} className="flex gap-2.5 items-start">
                          <Check className="mt-0.5 w-4 h-4 shrink-0 text-slate-900" strokeWidth={2.5} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-7 text-center text-sm text-slate-600 inline-flex w-full items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t.secure} {t.note}</p>
      </div>

      {/* Detailed comparison */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 mt-20">
        <H>{t.compareTitle}</H>
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr>
                <th className="px-6 py-4 w-[46%] bg-slate-50 border-b border-slate-200" />
                {ORDER.map((id) => <th key={id} className="px-4 py-4 text-center text-[15px] font-bold text-slate-900 bg-slate-50 border-b border-slate-200">{t.plans[id].name}<span className="block text-[12px] font-medium text-slate-500">{fmt(PLAN_PRICES[id].monthly)} {t.perMonth}</span></th>)}
              </tr>
            </thead>
            {t.groups.map((g) => (
              <tbody key={g.title}>
                <tr><td colSpan={4} className="px-6 pt-6 pb-2">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-slate-500">{g.title}</span>
                </td></tr>
                {g.rows.map((r) => (
                  <tr key={r.k} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-6 py-3 text-[14.5px] text-slate-800">{r.k}{r.soon && <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{t.soon}</span>}</td>
                    {r.v.map((v, i) => <td key={i} className="px-4 py-3 text-center" style={i === 1 ? { background: "rgba(15,23,42,0.025)" } : undefined}>{cell(v, ORDER[i])}</td>)}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>

      {/* Reports for advisors */}
      <div className="w-full mt-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight text-slate-900">{t.proTitle}</h2>
            <span className="block mt-3 h-[3px] w-16 rounded-full bg-slate-900" />
            <p className="mt-5 text-[17px] leading-relaxed text-slate-600">{t.proLead}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.proPoints.map(([a, b]) => (
                <div key={a} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{a}</p>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Report mock-up */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="relative rounded-xl bg-white ring-1 ring-slate-200 shadow-xl overflow-hidden rotate-[-2deg]">
              <div className="h-36 bg-slate-900 p-5 relative">
                <div className="w-24 h-9 rounded-md bg-white flex items-center justify-center text-[11px] font-bold text-slate-900 tracking-wider">{lang === "fr" ? "VOTRE LOGO" : "YOUR LOGO"}</div>
                <p className="mt-4 text-white font-semibold text-lg leading-tight">{lang === "fr" ? "Rapport d'analyse de portefeuille" : "Portfolio analysis report"}</p>
              </div>
              <div className="p-5 space-y-3">
                <div><p className="text-[9px] uppercase tracking-wider text-slate-400">{lang === "fr" ? "Préparé pour" : "Prepared for"}</p><p className="text-sm font-semibold text-slate-800">{lang === "fr" ? "Famille Martin" : "Martin family"}</p></div>
                <div><p className="text-[9px] uppercase tracking-wider text-slate-400">{lang === "fr" ? "Préparé par" : "Prepared by"}</p><p className="text-sm font-semibold text-slate-800">{lang === "fr" ? "Votre nom, conseiller" : "Your name, advisor"}</p></div>
                <svg viewBox="0 0 300 80" className="w-full h-20"><polyline fill="none" stroke="#0F172A" strokeWidth="2" points="0,70 30,64 60,66 90,52 120,55 150,40 180,44 210,30 240,26 270,18 300,10" /><polyline fill="none" stroke="#64748B" strokeWidth="2" points="0,70 30,67 60,62 90,60 120,58 150,50 180,52 210,46 240,40 270,38 300,32" /><polyline fill="none" stroke="#CBD5E1" strokeWidth="2" points="0,70 30,68 60,69 90,63 120,66 150,60 180,58 210,57 240,52 270,50 300,48" /></svg>
                <div className="grid grid-cols-3 gap-2">{["7,8 %", "6,1 %", "4,3 %"].map((v, i) => <div key={v} className="rounded-md bg-slate-50 border-l-2 p-2" style={{ borderColor: ["#0F172A", "#64748B", "#CBD5E1"][i] }}><p className="text-[13px] font-bold text-slate-900">{v}</p><p className="text-[8px] text-slate-400">TCAC</p></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mt-24">
        <H center>{t.faqTitle}</H>
        <div className="mt-8 space-y-3">
          {t.faq.map(([q, a], i) => (
            <div key={q} className={cn("rounded-2xl bg-white px-5 ring-1 transition-shadow", open === i ? "ring-slate-300" : "ring-slate-200")}>
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
                <span className="text-[17px] font-semibold text-slate-900">{q}</span>
                <ChevronDown className={cn("w-5 h-5 text-slate-400 shrink-0 transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="pb-4 -mt-1 text-[15.5px] leading-relaxed text-slate-700">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
