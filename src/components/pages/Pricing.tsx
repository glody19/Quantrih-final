import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Minus, ChevronDown, Sparkles, Loader2, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { usePlan, PLAN_PRICES, type PlanId } from "../../lib/plans";
import { billingErrorMessage, openBillingPortal, startCheckout, syncSubscription } from "../../lib/billing";

// Colourful page: a vivid hero, a soft tinted body and one colour per plan.
const HERO: React.CSSProperties = {
  backgroundColor: "#1E2A78",
  backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(ellipse 60% 80% at 15% 10%, rgba(14,165,233,0.55) 0%, transparent 60%), radial-gradient(ellipse 55% 75% at 90% 20%, rgba(168,85,247,0.55) 0%, transparent 60%), linear-gradient(135deg, #1E2A78 0%, #2B3FB8 45%, #0E6BA8 100%)",
  backgroundSize: "56px 56px, 56px 56px, 100% 100%, 100% 100%, 100% 100%",
};
const BODY: React.CSSProperties = { background: "linear-gradient(180deg, #EEF2FF 0%, #F0F9FF 35%, #FDF8F1 70%, #FFFFFF 100%)" };
const BAND: React.CSSProperties = {
  backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(120deg, #312E81 0%, #4338CA 40%, #0E7490 100%)",
  backgroundSize: "56px 56px, 56px 56px, 100% 100%",
};

/** One colour family per plan: frame gradient, header gradient, solid accent, soft tint. */
const PLAN_STYLE: Record<PlanId, { frame: string; head: string; accent: string; soft: string; glow: string }> = {
  free: { frame: "linear-gradient(140deg,#34D399,#0EA5E9)", head: "linear-gradient(135deg,#059669 0%,#0D9488 55%,#0284C7 100%)", accent: "#0D9488", soft: "#ECFDF5", glow: "rgba(13,148,136,0.45)" },
  premium: { frame: "linear-gradient(140deg,#60A5FA,#8B5CF6,#EC4899)", head: "linear-gradient(135deg,#2563EB 0%,#6D28D9 60%,#9333EA 100%)", accent: "#6D28D9", soft: "#F5F3FF", glow: "rgba(109,40,217,0.55)" },
  pro: { frame: "linear-gradient(140deg,#FCD34D,#F59E0B,#EA580C)", head: "linear-gradient(135deg,#0F172A 0%,#1E293B 55%,#78350F 100%)", accent: "#D97706", soft: "#FFFBEB", glow: "rgba(217,119,6,0.45)" },
};

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
      <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} style={{ transformOrigin: center ? "center" : "left" }} className={cn("block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#F59E0B]", center && "mx-auto")} />
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
    v === true ? <span className="mx-auto w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: PLAN_STYLE[id].frame }}><Check className="w-3.5 h-3.5" strokeWidth={3} /></span> :
    v === false ? <Minus className="w-4 h-4 mx-auto text-slate-300" /> :
    <span className="text-[14px] font-semibold" style={{ color: PLAN_STYLE[id].accent }}>{v}</span>;

  return (
    <div className="w-full font-sans pb-24 -mt-4 lg:-mt-6" style={BODY}>
      {/* Header band */}
      <div className="relative w-full overflow-hidden" style={HERO}>
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-36 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-white px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/25">{t.kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-4 text-[32px] md:text-[48px] leading-[1.05] font-bold tracking-tight !text-white">{t.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 max-w-2xl mx-auto text-[16px] md:text-[18px] leading-relaxed text-white/85">{t.lead}</motion.p>
          <div className="mt-7 inline-flex items-center p-1 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            {[false, true].map((y) => (
              <button key={String(y)} type="button" onClick={() => setYearly(y)} className={cn("h-10 px-5 rounded-full text-sm font-semibold transition-colors", yearly === y ? "bg-white text-[#2B3FB8] shadow" : "text-white/85 hover:text-white")}>
                {y ? t.yearly : t.monthly}
                {y && <span className={cn("ml-2 text-[11px] px-2 py-0.5 rounded-full", yearly ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900" : "bg-amber-300/25 text-amber-100")}>{t.save}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan cards: gradient frame, coloured header with the price, compact body */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 -mt-28">
        {banner && (
          <div className={cn("relative z-10 mb-5 mx-auto max-w-2xl rounded-2xl px-5 py-3.5 text-[15px] font-medium text-center shadow-lg", banner.ok ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-white text-slate-700 ring-1 ring-slate-200")}>{banner.text}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {ORDER.map((id, i) => {
            const p = t.plans[id];
            const st = PLAN_STYLE[id];
            const featured = id === "premium";
            const price = PLAN_PRICES[id];
            const isCurrent = signedIn && plan === id;
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 * i }}
                whileHover={{ y: -6 }}
                className={cn("relative rounded-[1.4rem] p-[2.5px]", featured && "md:-mt-3 md:mb-[-12px]")}
                style={{ background: st.frame, boxShadow: `0 28px 60px -28px ${st.glow}` }}>
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full text-white shadow-md whitespace-nowrap" style={{ background: st.frame }}>
                    <Sparkles className="w-3 h-3 inline -mt-0.5 mr-1" />{p.tag}
                  </span>
                )}
                <div className="h-full flex flex-col rounded-[1.25rem] bg-white overflow-hidden">
                  <div className="relative px-6 pt-6 pb-5 text-white overflow-hidden" style={{ background: st.head }}>
                    <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/10" aria-hidden />
                    <div className="absolute right-6 -bottom-16 w-28 h-28 rounded-full bg-white/10" aria-hidden />
                    <div className="relative flex items-center justify-between gap-2">
                      <h3 className="text-[21px] font-bold tracking-tight !text-white">{p.name}</h3>
                      {!featured && <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-white/20 ring-1 ring-white/30 text-white">{p.tag}</span>}
                    </div>
                    <p className="relative mt-2 text-[14px] text-white/85 leading-snug min-h-[40px]">{p.desc}</p>
                    <div className="relative mt-4 flex items-baseline gap-1.5">
                      <span className="text-[40px] leading-none font-bold tracking-tight text-white">{fmt(yearly ? price.yearly : price.monthly)}</span>
                      <span className="text-white/80 text-sm">{yearly ? t.perYear : t.perMonth}</span>
                    </div>
                    <p className="relative mt-1.5 text-[12.5px] text-white/75 min-h-[18px]">{yearly && price.yearly > 0 ? t.billedYearly.replace("{x}", fmt(Math.round((price.yearly / 12) * 100) / 100)) : ""}</p>
                  </div>
                  <div className="flex-1 flex flex-col px-6 pt-5 pb-6">
                    {isCurrent && paying ? (
                      <button type="button" onClick={() => cta(id)} disabled={!!busy}
                        className="h-11 rounded-full text-[14.5px] font-semibold transition-colors bg-white ring-2 inline-flex items-center justify-center gap-2"
                        style={{ color: st.accent, ["--tw-ring-color" as string]: st.accent } as React.CSSProperties}>
                        {busy === id && <Loader2 className="w-4 h-4 animate-spin" />}{t.manage}
                      </button>
                    ) : (
                      <button type="button" onClick={() => cta(id)} disabled={isCurrent || !!busy}
                        className={cn("h-11 rounded-full text-[14.5px] font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:cursor-default", isCurrent ? "bg-slate-100 text-slate-500" : "text-white hover:brightness-110 hover:shadow-lg")}
                        style={isCurrent ? undefined : { background: id === "pro" ? "linear-gradient(135deg,#F59E0B,#EA580C)" : st.head }}>
                        {busy === id && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isCurrent ? t.current : paying && id !== "free" ? t.switchTo.replace("{p}", p.name) : p.cta}
                      </button>
                    )}
                    <ul className="mt-5 space-y-2.5 text-[14px] text-slate-800">
                      {t.highlights[id].map((h) => (
                        <li key={h} className="flex gap-2.5 items-start">
                          <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center" style={{ background: st.soft, color: st.accent }}><Check className="w-3 h-3" strokeWidth={3} /></span>
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
        <div className="mt-8 overflow-x-auto rounded-[1.4rem] bg-white ring-1 ring-indigo-100 shadow-[0_24px_60px_-36px_rgba(67,56,202,0.45)]">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr>
                <th className="px-6 py-4 w-[46%] bg-white" />
                {ORDER.map((id) => <th key={id} className="px-4 py-4 text-center text-[15px] font-bold text-white" style={{ background: PLAN_STYLE[id].head }}>{t.plans[id].name}<span className="block text-[12px] font-medium text-white/75">{fmt(PLAN_PRICES[id].monthly)} {t.perMonth}</span></th>)}
              </tr>
            </thead>
            {t.groups.map((g, gi) => (
              <tbody key={g.title}>
                <tr><td colSpan={4} className="px-6 pt-6 pb-2">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full" style={{ color: ["#4338CA", "#0E7490", "#7C3AED", "#B45309", "#0F766E"][gi % 5], background: ["#EEF2FF", "#ECFEFF", "#F5F3FF", "#FFFBEB", "#F0FDFA"][gi % 5] }}>{g.title}</span>
                </td></tr>
                {g.rows.map((r) => (
                  <tr key={r.k} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-6 py-3 text-[14.5px] text-slate-800">{r.k}{r.soon && <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">{t.soon}</span>}</td>
                    {r.v.map((v, i) => <td key={i} className="px-4 py-3 text-center" style={i === 1 ? { background: "rgba(109,40,217,0.04)" } : undefined}>{cell(v, ORDER[i])}</td>)}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>

      {/* Reports for advisors */}
      <div className="w-full mt-20" style={BAND}>
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight !text-white">{t.proTitle}</h2>
            <span className="block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#67E8F9] to-[#FCD34D]" />
            <p className="mt-5 text-[17px] leading-relaxed text-white/85">{t.proLead}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.proPoints.map(([a, b]) => (
                <div key={a} className="rounded-2xl bg-white/10 ring-1 ring-white/20 p-4 backdrop-blur-sm">
                  <p className="font-semibold text-white">{a}</p>
                  <p className="mt-1.5 text-sm text-white/80 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Report mock-up */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="absolute -inset-6 rounded-[2rem] bg-[#38BDF8]/10 blur-2xl" aria-hidden />
            <div className="relative rounded-xl bg-white shadow-2xl overflow-hidden rotate-[-2deg]">
              <div className="h-36 bg-[#1B3F72] p-5 relative" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
                <div className="w-24 h-9 rounded-md bg-white flex items-center justify-center text-[11px] font-bold text-[#1B3F72] tracking-wider">{lang === "fr" ? "VOTRE LOGO" : "YOUR LOGO"}</div>
                <p className="mt-4 text-white font-semibold text-lg leading-tight">{lang === "fr" ? "Rapport d'analyse de portefeuille" : "Portfolio analysis report"}</p>
              </div>
              <div className="p-5 space-y-3">
                <div><p className="text-[9px] uppercase tracking-wider text-slate-400">{lang === "fr" ? "Préparé pour" : "Prepared for"}</p><p className="text-sm font-semibold text-slate-800">{lang === "fr" ? "Famille Martin" : "Martin family"}</p></div>
                <div><p className="text-[9px] uppercase tracking-wider text-slate-400">{lang === "fr" ? "Préparé par" : "Prepared by"}</p><p className="text-sm font-semibold text-slate-800">{lang === "fr" ? "Votre nom, conseiller" : "Your name, advisor"}</p></div>
                <svg viewBox="0 0 300 80" className="w-full h-20"><polyline fill="none" stroke="#1B3F72" strokeWidth="2" points="0,70 30,64 60,66 90,52 120,55 150,40 180,44 210,30 240,26 270,18 300,10" /><polyline fill="none" stroke="#0EA5E9" strokeWidth="2" points="0,70 30,67 60,62 90,60 120,58 150,50 180,52 210,46 240,40 270,38 300,32" /><polyline fill="none" stroke="#F59E0B" strokeWidth="2" points="0,70 30,68 60,69 90,63 120,66 150,60 180,58 210,57 240,52 270,50 300,48" /></svg>
                <div className="grid grid-cols-3 gap-2">{["7,8 %", "6,1 %", "4,3 %"].map((v, i) => <div key={v} className="rounded-md bg-slate-50 border-l-2 p-2" style={{ borderColor: ["#1B3F72", "#0EA5E9", "#F59E0B"][i] }}><p className="text-[13px] font-bold text-[#1B3F72]">{v}</p><p className="text-[8px] text-slate-400">TCAC</p></div>)}</div>
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
            <div key={q} className={cn("rounded-2xl bg-white px-5 ring-1 transition-shadow", open === i ? "ring-indigo-200 shadow-[0_16px_40px_-28px_rgba(67,56,202,0.6)]" : "ring-slate-200")} style={{ borderLeft: `4px solid ${["#0D9488", "#6D28D9", "#D97706", "#2563EB", "#DB2777", "#0E7490"][i % 6]}` }}>
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
