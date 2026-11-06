import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BadgeCheck, BarChart3, BookOpen, Building2, Check, ChevronDown, GraduationCap, Landmark,
  LineChart, Mail, Megaphone, MousePointerClick, ShieldCheck, Sparkles, Target, Users,
} from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { cn } from "../../lib/utils";

const CONTACT_EMAIL = "contact@quantrih.com";

const T = {
  fr: {
    badge: "Partenariats Belgique et France",
    title: "Présentez votre offre aux investisseurs qui passent à l'action",
    subtitle:
      "Quantrih est utilisé par des investisseurs particuliers qui testent leurs portefeuilles avant d'investir. Courtiers, banques, néobanques et formateurs : rejoignez-les au moment exact où ils choisissent leurs outils.",
    ctaPrimary: "Recevoir la présentation",
    ctaSecondary: "Voir les offres",
    whyTitle: "Pourquoi Quantrih",
    why: [
      { t: "Une audience avec une intention claire", d: "Nos visiteurs construisent un portefeuille, comparent des frais et cherchent où investir. Ils ne sont pas là par hasard." },
      { t: "La Belgique et la France d'abord", d: "Comparatif dédié aux plateformes belges et françaises, fiscalité locale (TOB, PEA) et interface en français, néerlandais et anglais." },
      { t: "Un contexte neutre et éducatif", d: "Votre marque apparaît à côté d'outils d'analyse sérieux et de contenus pédagogiques, pas dans un fil publicitaire." },
      { t: "Une transparence totale", d: "Chaque emplacement est signalé comme partenaire. Pas de faux avis, pas de classement acheté : la confiance de nos utilisateurs protège aussi votre marque." },
    ],
    forTitle: "Pour qui",
    forWho: [
      { t: "Courtiers et néobanques", d: "Mettez en avant vos frais, votre gestion de la TOB ou votre PEA, et votre offre de bienvenue auprès d'investisseurs qui comparent." },
      { t: "Banques", d: "Valorisez votre accompagnement, vos plans d'investissement et votre épargne-pension auprès d'un public qui veut comprendre avant de signer." },
      { t: "Formateurs et éducation financière", d: "Formations en bourse, trading, investissement en actions ou ETF, coaching patrimonial : présentez vos cours à des investisseurs qui veulent progresser." },
    ],
    placementsTitle: "Les emplacements",
    placements: [
      { t: "En tête de la page Plateformes d'investissement", d: "Votre fiche enrichie en première position de l'onglet Belgique ou France, avec logo, offre et lien suivi." },
      { t: "Fiche détaillée enrichie", d: "Présentation complète : frais, fiscalité, produits, avantages, offre de bienvenue, visuels et lien vers votre site." },
      { t: "Espace Formations partenaires", d: "Vos cours et formations présentés dans la Bibliothèque, à côté des livres de référence." },
      { t: "Après un backtest", d: "Une recommandation discrète « passer à l'action » sous les résultats, là où l'investisseur est le plus décidé." },
    ],
    plansTitle: "Les offres",
    plansSub: "Sans engagement en formule mensuelle. Deux mois offerts en formule annuelle.",
    perMonth: "/ mois",
    perYear: "ou {y} € par an",
    popular: "Le plus choisi",
    plans: [
      { name: "Essentiel", price: 80, year: 800, features: ["Fiche enrichie avec logo et lien suivi", "Badge Partenaire", "Présence dans l'onglet de votre pays", "Rapport mensuel des clics"] },
      { name: "Visibilité", price: 140, year: 1400, features: ["Tout Essentiel", "Position en tête de liste", "Offre de bienvenue mise en avant", "Présence dans l'espace Formations ou Plateformes", "Rapport mensuel détaillé"] },
      { name: "Premium", price: 200, year: 2000, features: ["Tout Visibilité", "Recommandation après les backtests", "Exclusivité dans votre catégorie et votre pays", "Contenu pédagogique co-signé", "Point trimestriel de performance"] },
    ],
    reportTitle: "Ce que vous recevez chaque mois",
    report: ["Nombre d'affichages de votre fiche", "Clics vers votre site, avec lien suivi", "Pages et outils d'où viennent les clics", "Recommandations pour améliorer votre conversion"],
    complianceTitle: "Conformité et confiance",
    compliance: [
      "Emplacements toujours signalés « Partenaire »",
      "Aucune recommandation personnalisée : Quantrih est un outil d'analyse et d'éducation",
      "Contenus validés par vous, dans le respect des règles de la FSMA et de l'AMF sur la publicité financière",
      "Aucun cookie publicitaire tiers déposé chez nos visiteurs",
    ],
    stepsTitle: "Comment ça se passe",
    steps: [
      { t: "Échange de 20 minutes", d: "Nous comprenons votre offre, votre cible et vos objectifs." },
      { t: "Choix de l'offre", d: "Formule, pays, catégorie et contenus de votre fiche." },
      { t: "Mise en ligne sous 7 jours", d: "Vous validez la fiche avant publication." },
      { t: "Suivi mensuel", d: "Rapport de performance et ajustements." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Le classement des plateformes est-il influencé par les partenariats ?", a: "Non. Les informations des fiches (frais, fiscalité, régulateur) restent factuelles et identiques pour tous. Le partenariat donne de la visibilité et un emplacement signalé, jamais une meilleure note." },
      { q: "Puis-je arrêter à tout moment ?", a: "Oui, la formule mensuelle est sans engagement. La formule annuelle est payée d'avance avec deux mois offerts." },
      { q: "Proposez-vous l'exclusivité ?", a: "L'offre Premium garantit l'exclusivité dans votre catégorie (courtier, banque ou formation) et votre pays." },
      { q: "Quels pays couvrez-vous ?", a: "Nous commençons par la Belgique, puis la France. D'autres pays européens suivront." },
    ],
    formTitle: "Recevoir la présentation et les disponibilités",
    formSub: "Nous répondons sous 48 heures ouvrées.",
    name: "Nom et prénom", company: "Entreprise", email: "E-mail professionnel", type: "Vous êtes", message: "Votre message (facultatif)",
    types: ["Courtier", "Banque", "Néobanque", "Formateur ou école", "Autre"],
    send: "Envoyer la demande",
    mailSubject: "Partenariat Quantrih",
    or: "ou écrivez-nous directement à",
  },
  en: {
    badge: "Partnerships in Belgium and France",
    title: "Present your offer to investors who are ready to act",
    subtitle:
      "Quantrih is used by retail investors who test their portfolios before investing. Brokers, banks, neobanks and educators: reach them at the exact moment they choose their tools.",
    ctaPrimary: "Get the presentation",
    ctaSecondary: "See the packages",
    whyTitle: "Why Quantrih",
    why: [
      { t: "An audience with clear intent", d: "Our visitors build portfolios, compare fees and look for where to invest. They are not here by chance." },
      { t: "Belgium and France first", d: "A comparison dedicated to Belgian and French platforms, local taxes (TOB, PEA) and an interface in French, Dutch and English." },
      { t: "A neutral, educational context", d: "Your brand appears next to serious analysis tools and educational content, not in an ad feed." },
      { t: "Full transparency", d: "Every placement is labelled as a partner. No fake reviews, no paid rankings: our users' trust also protects your brand." },
    ],
    forTitle: "Who it is for",
    forWho: [
      { t: "Brokers and neobanks", d: "Highlight your fees, tax handling or PEA, and your welcome offer to investors who are comparing." },
      { t: "Banks", d: "Showcase your guidance, investment plans and pension savings to people who want to understand before signing." },
      { t: "Educators and financial education", d: "Stock market, trading, stock or ETF investing courses and wealth coaching: present your courses to investors who want to improve." },
    ],
    placementsTitle: "Placements",
    placements: [
      { t: "Top of the Investment platforms page", d: "Your enriched card first in the Belgium or France tab, with logo, offer and tracked link." },
      { t: "Enriched detailed card", d: "Full presentation: fees, taxes, products, strengths, welcome offer, visuals and link to your site." },
      { t: "Partner courses area", d: "Your courses presented in the Library, next to reference books." },
      { t: "After a backtest", d: "A discreet \"take action\" recommendation below the results, when investors are most decided." },
    ],
    plansTitle: "Packages",
    plansSub: "No commitment on the monthly plan. Two months free on the yearly plan.",
    perMonth: "/ month",
    perYear: "or €{y} per year",
    popular: "Most chosen",
    plans: [
      { name: "Essential", price: 80, year: 800, features: ["Enriched card with logo and tracked link", "Partner badge", "Listed in your country tab", "Monthly click report"] },
      { name: "Visibility", price: 140, year: 1400, features: ["Everything in Essential", "Top-of-list position", "Featured welcome offer", "Presence in the Courses or Platforms area", "Detailed monthly report"] },
      { name: "Premium", price: 200, year: 2000, features: ["Everything in Visibility", "Recommendation after backtests", "Exclusivity in your category and country", "Co-signed educational content", "Quarterly performance review"] },
    ],
    reportTitle: "What you receive every month",
    report: ["Number of card views", "Clicks to your site, with tracked link", "Pages and tools the clicks come from", "Recommendations to improve conversion"],
    complianceTitle: "Compliance and trust",
    compliance: [
      "Placements always labelled \"Partner\"",
      "No personalised advice: Quantrih is an analysis and education tool",
      "Content approved by you, in line with FSMA and AMF rules on financial advertising",
      "No third-party advertising cookies on our visitors",
    ],
    stepsTitle: "How it works",
    steps: [
      { t: "20-minute call", d: "We understand your offer, audience and goals." },
      { t: "Choose a package", d: "Plan, country, category and card content." },
      { t: "Live within 7 days", d: "You approve the card before publication." },
      { t: "Monthly follow-up", d: "Performance report and adjustments." },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "Do partnerships influence the platform rankings?", a: "No. Card information (fees, taxes, regulator) stays factual and identical for everyone. A partnership buys visibility and a labelled placement, never a better rating." },
      { q: "Can I stop at any time?", a: "Yes, the monthly plan has no commitment. The yearly plan is paid upfront with two months free." },
      { q: "Do you offer exclusivity?", a: "The Premium package guarantees exclusivity in your category (broker, bank or course) and country." },
      { q: "Which countries do you cover?", a: "We start with Belgium, then France. Other European countries will follow." },
    ],
    formTitle: "Get the presentation and availability",
    formSub: "We reply within 48 business hours.",
    name: "Full name", company: "Company", email: "Work email", type: "You are", message: "Your message (optional)",
    types: ["Broker", "Bank", "Neobank", "Educator or school", "Other"],
    send: "Send the request",
    mailSubject: "Quantrih partnership",
    or: "or email us directly at",
  },
};

const WHY_ICONS = [Target, Landmark, BookOpen, ShieldCheck];
const FOR_ICONS = [LineChart, Building2, GraduationCap];
const PLACEMENT_ICONS = [Megaphone, BadgeCheck, GraduationCap, BarChart3];

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="py-12 md:py-16 border-t border-border first:border-t-0">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text mb-8">{title}</h2>
      {children}
    </section>
  );
}

export function Partners() {
  const { language } = useTranslation();
  const c = language === "fr" ? T.fr : T.en;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", company: "", email: "", type: c.types[0], message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [`${c.name}: ${form.name}`, `${c.company}: ${form.company}`, `${c.email}: ${form.email}`, `${c.type}: ${form.type}`, "", form.message].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${c.mailSubject} : ${form.company}`)}&body=${encodeURIComponent(body)}`;
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <MobileZoomWrapper scaleMobile={0.85}>
      <div className="page-container pb-24 font-sans">
        {/* Hero */}
        <section className="relative mt-4 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#F4F2FE] via-[#FAFAF7] to-[#FBF3E2] border border-border px-6 md:px-14 py-14 md:py-20">
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-pv-blue/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-pv-blue bg-white/80 border border-pv-blue/20 px-3 py-1 rounded-full">
              <Sparkles size={12} /> {c.badge}
            </span>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-text leading-[1.08]">{c.title}</h1>
            <p className="mt-5 text-base md:text-lg text-text-3 leading-relaxed">{c.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 bg-text text-bg font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90">
                {c.ctaPrimary} <ArrowRight size={15} />
              </button>
              <button onClick={() => scrollTo("plans")} className="inline-flex items-center gap-2 bg-white border border-border font-semibold text-sm px-6 py-3 rounded-full hover:border-border-2">
                {c.ctaSecondary}
              </button>
            </div>
          </div>
        </section>

        <Section title={c.whyTitle}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.why.map((w, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <motion.div key={w.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="card">
                  <span className="w-10 h-10 rounded-2xl bg-pv-blue/10 text-pv-blue flex items-center justify-center mb-4"><Icon size={18} /></span>
                  <h3 className="font-bold text-text text-sm mb-1.5">{w.t}</h3>
                  <p className="text-xs text-text-3 leading-relaxed">{w.d}</p>
                </motion.div>
              );
            })}
          </div>
        </Section>

        <Section title={c.forTitle}>
          <div className="grid md:grid-cols-3 gap-5">
            {c.forWho.map((w, i) => {
              const Icon = FOR_ICONS[i];
              return (
                <div key={w.t} className="rounded-3xl p-6 border border-border bg-gradient-to-br from-surface to-surface-3/40">
                  <Icon size={22} className="text-pv-blue mb-4" />
                  <h3 className="font-bold text-text mb-2">{w.t}</h3>
                  <p className="text-sm text-text-3 leading-relaxed">{w.d}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title={c.placementsTitle}>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="grid sm:grid-cols-2 gap-4">
              {c.placements.map((pl, i) => {
                const Icon = PLACEMENT_ICONS[i];
                return (
                  <div key={pl.t} className="rounded-2xl border border-border bg-surface p-5">
                    <Icon size={18} className="text-gold mb-3" />
                    <h3 className="font-bold text-text text-sm mb-1">{pl.t}</h3>
                    <p className="text-xs text-text-3 leading-relaxed">{pl.d}</p>
                  </div>
                );
              })}
            </div>
            {/* Visual mock of a featured partner card */}
            <div className="relative [perspective:1200px]">
              <motion.div
                initial={{ rotateY: -14, rotateX: 6, opacity: 0 }}
                whileInView={{ rotateY: -8, rotateX: 4, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl border border-border bg-surface shadow-[0_30px_80px_-20px_rgba(91,75,219,0.35)] overflow-hidden"
              >
                <div className="h-14 bg-gradient-to-r from-[#5B4BDB] to-[#9283F2] relative">
                  <span className="absolute top-3 left-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white bg-white/20 px-2 py-0.5 rounded-full"><BadgeCheck size={11} /> Partenaire</span>
                </div>
                <div className="p-5 -mt-6 relative">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-sm font-bold text-pv-blue">VB</div>
                  <p className="mt-3 font-bold text-text">Votre plateforme</p>
                  <p className="text-xs text-text-3 mt-1">Offre de bienvenue, frais, fiscalité et lien suivi vers votre site.</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((k) => (<div key={k} className="h-12 rounded-xl bg-surface-3/70" />))}
                  </div>
                  <div className="mt-4 h-9 rounded-full bg-text text-bg text-xs font-semibold flex items-center justify-center gap-1.5">Ouvrir un compte <ArrowRight size={13} /></div>
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        <Section title={c.plansTitle} id="plans">
          <p className="text-sm text-text-3 -mt-5 mb-8">{c.plansSub}</p>
          <div className="grid md:grid-cols-3 gap-5">
            {c.plans.map((pl, i) => {
              const featured = i === 1;
              return (
                <div key={pl.name} className={cn("relative rounded-3xl p-7 flex flex-col border", featured ? "bg-[#1E1948] text-white border-transparent shadow-[0_24px_60px_-20px_rgba(30,25,72,0.6)]" : "bg-surface border-border")}>
                  {featured && <span className="absolute -top-3 left-7 text-[10px] font-bold uppercase tracking-wider bg-gold text-white px-3 py-1 rounded-full">{c.popular}</span>}
                  <h3 className={cn("font-bold", featured ? "text-white" : "text-text")}>{pl.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight">{pl.price} €</span>
                    <span className={cn("text-sm", featured ? "text-white/70" : "text-text-3")}>{c.perMonth}</span>
                  </div>
                  <p className={cn("text-xs mt-1", featured ? "text-white/60" : "text-text-4")}>{c.perYear.replace("{y}", pl.year.toLocaleString(language === "fr" ? "fr-BE" : "en-GB"))}</p>
                  <ul className="mt-6 flex flex-col gap-2.5 text-sm flex-grow">
                    {pl.features.map((f) => (
                      <li key={f} className="flex gap-2"><Check size={16} className={cn("shrink-0 mt-0.5", featured ? "text-gold" : "text-green")} /><span className={featured ? "text-white/90" : "text-text-2"}>{f}</span></li>
                    ))}
                  </ul>
                  <button onClick={() => { setForm((f) => ({ ...f, message: `${c.plansTitle} : ${pl.name}` })); scrollTo("contact"); }} className={cn("mt-7 w-full py-3 rounded-full text-sm font-semibold", featured ? "bg-white text-[#1E1948] hover:bg-white/90" : "bg-text text-bg hover:opacity-90")}>
                    {c.ctaPrimary}
                  </button>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title={c.reportTitle}>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <ul className="grid sm:grid-cols-2 gap-4">
              {c.report.map((r, i) => {
                const Icon = [Users, MousePointerClick, BarChart3, Sparkles][i];
                return (
                  <li key={r} className="rounded-2xl border border-border bg-surface p-4 flex gap-3 items-start text-sm text-text-2"><Icon size={18} className="text-pv-blue shrink-0" />{r}</li>
                );
              })}
            </ul>
            <div className="rounded-3xl border border-border bg-surface p-6">
              <h3 className="font-bold text-text mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-green" />{c.complianceTitle}</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-text-2">
                {c.compliance.map((x) => (<li key={x} className="flex gap-2"><Check size={16} className="text-green shrink-0 mt-0.5" />{x}</li>))}
              </ul>
            </div>
          </div>
        </Section>

        <Section title={c.stepsTitle}>
          <ol className="grid md:grid-cols-4 gap-5">
            {c.steps.map((s, i) => (
              <li key={s.t} className="relative rounded-3xl border border-border bg-surface p-6">
                <span className="w-8 h-8 rounded-full bg-pv-blue text-white text-sm font-bold flex items-center justify-center mb-4">{i + 1}</span>
                <h3 className="font-bold text-text text-sm mb-1">{s.t}</h3>
                <p className="text-xs text-text-3 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={c.faqTitle}>
          <div className="max-w-3xl flex flex-col gap-3">
            {c.faq.map((f, i) => (
              <div key={f.q} className="rounded-2xl border border-border bg-surface">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-sm text-text">
                  {f.q}
                  <ChevronDown size={16} className={cn("shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm text-text-3 leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title={c.formTitle} id="contact">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
            <div>
              <p className="text-sm text-text-3">{c.formSub}</p>
              <p className="text-sm text-text-3 mt-4">
                {c.or}{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(c.mailSubject)}`} className="text-pv-blue font-semibold inline-flex items-center gap-1"><Mail size={14} />{CONTACT_EMAIL}</a>
              </p>
            </div>
            <form onSubmit={submit} className="rounded-3xl border border-border bg-surface p-6 grid sm:grid-cols-2 gap-4">
              {([["name", c.name, "text"], ["company", c.company, "text"], ["email", c.email, "email"]] as const).map(([key, label, type]) => (
                <label key={key} className={cn("flex flex-col gap-1.5 text-xs font-semibold text-text-2", key === "email" && "sm:col-span-2")}>
                  {label}
                  <input required type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="px-3 py-2.5 rounded-xl border border-border bg-bg text-sm font-normal outline-none focus:border-pv-blue/60" />
                </label>
              ))}
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-2 sm:col-span-2">
                {c.type}
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2.5 rounded-xl border border-border bg-bg text-sm font-normal outline-none focus:border-pv-blue/60">
                  {c.types.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-2 sm:col-span-2">
                {c.message}
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="px-3 py-2.5 rounded-xl border border-border bg-bg text-sm font-normal outline-none focus:border-pv-blue/60 resize-y" />
              </label>
              <button type="submit" className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-pv-blue text-white font-semibold text-sm py-3 rounded-full hover:bg-pv-blue-d">
                {c.send} <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </Section>
      </div>
    </MobileZoomWrapper>
  );
}
