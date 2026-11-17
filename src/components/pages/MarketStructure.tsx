import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { OffExchangeData } from "../market/OffExchangeData";

const CARD = "rounded-[1.5rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
const NAVY = { backgroundColor: "#0A1E2D", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg,#0A1E2D 0%,#14466B 60%,#0A1E2D 100%)", backgroundSize: "56px 56px, 56px 56px, 100% 100%" };

/** Covers supplied for the reading list, served from /public/media/books. */
const COVERS: Record<string, string> = {
  "Dark Pools": "/media/books/dark-pools.jpg",
  "Flash Boys": "/media/books/flash-boys.jpg",
  "Trading and Exchanges": "/media/books/trading-and-exchanges.jpg",
};

const T = {
  en: {
    kicker: "Market structure",
    title: "Dark pools and off-exchange trading",
    lead: "Where orders are actually executed, who runs the venues, and what the public data shows.",
    nav: ["How an order travels", "Why trade in the dark", "Venues", "Data", "Rules", "Myths", "Reading"],
    flowTitle: "How an order travels",
    flowLead: "The same order can end up in three very different places. The broker decides, within its best execution duty.",
    nodes: { investor: "Investor", broker: "Broker", lit: "Exchange", litSub: "Order book visible to all", dark: "Dark pool", darkSub: "Orders hidden until executed", whole: "Wholesaler", wholeSub: "Market maker fills retail orders", tape: "Consolidated tape", tapeSub: "Every trade is reported after execution" },
    whyTitle: "Why trade in the dark",
    why: [
      ["Market impact", "A fund buying two million shares moves the price against itself if it shows the order. Hidden, it can wait for a natural counterparty."],
      ["Information leakage", "A large visible order tells the market someone is buying. Fast traders adjust their quotes before the order is filled."],
      ["Price improvement", "Most dark pools execute at the midpoint of the best public bid and offer: each side saves half the spread."],
      ["Block size", "Minimum quantity and conditional orders let institutions meet only other large orders, outside the flow of small trades."],
    ],
    whyCons: "The cost: the price is formed on the public venues. If too much volume leaves them, public quotes reflect less information. Research finds moderate dark trading harmless, and heavy dark trading harmful to price discovery.",
    typesTitle: "Who runs the venues",
    typesLead: "Selected examples by operator type. Venues merge, rename and close: the regulator's list is the reference.",
    types: [
      ["Bank-operated", "Pools run by large broker-dealers that cross client and in-house flow.", ["Goldman Sachs Sigma X", "UBS ATS", "Morgan Stanley MS Pool", "JPMorgan JPM-X"]],
      ["Agency and block", "Independent venues built for institutional block trades.", ["Liquidnet", "Instinet CBX", "Virtu POSIT"]],
      ["Exchange-operated and Europe", "Midpoint and block books run by exchange groups, under MiFID II waivers in Europe.", ["Euronext Block", "Turquoise Plato", "Cboe BIDS", "Cboe Europe dark book"]],
      ["Wholesalers", "Not dark pools in the legal sense: market makers that fill most US retail orders off exchange.", ["Citadel Securities", "Virtu Americas", "Jane Street", "G1 Execution"]],
    ],
    rulesTitle: "Rules",
    rules: [
      ["United States", "Dark pools are alternative trading systems under Regulation ATS. Each one files a public Form ATS-N describing how it works. FINRA publishes weekly volumes per venue and per stock with a delay. Brokers publish quarterly Rule 606 reports showing where they route customer orders, and who pays them for that flow."],
      ["Euronext", "Euronext runs the regulated markets of Paris, Brussels, Amsterdam, Lisbon, Dublin, Oslo and Milan. Its central order book is the lit reference for most Belgian and French stocks: dark venues trading these shares at the midpoint take their price from it. Euronext also operates Euronext Block, a venue for large institutional orders, so part of the block flow stays inside the group."],
      ["European Union", "MiFID II allows trading without pre-trade transparency only under waivers: reference price, negotiated trades, large in scale, order management facilities. A volume cap limits how much of a stock can trade dark under the reference price waiver; it was revised in the MiFIR review. Systematic internalisers execute client orders against their own book."],
    ],
    mythsTitle: "Myths and facts",
    myths: [
      ["\"Dark pool prints show what the big players are buying.\"", "A reported trade has a buyer and a seller. The print says nothing about direction, and the public data is delayed and aggregated."],
      ["\"Dark pools are illegal or unregulated.\"", "They are registered venues under the same securities laws. Several operators were fined for misleading clients about how their pool worked, which is a disclosure failure, not an unregulated market."],
      ["\"Retail orders go to dark pools.\"", "In the US most retail orders go to wholesalers, a different circuit. Whether that helps or hurts retail execution is still debated."],
      ["\"A high off-exchange share is a warning signal.\"", "Large, liquid stocks routinely trade a large share off exchange. The share alone is not a signal; changes and context matter more."],
    ],
    readTitle: "Further reading",
    books: [
      ["Dark Pools", "Scott Patterson, 2012", "How electronic and algorithmic trading reshaped the equity market."],
      ["Flash Boys", "Michael Lewis, 2014", "Speed, order routing and the creation of IEX. Widely read, widely contested."],
      ["Trading and Exchanges", "Larry Harris, 2003", "The reference textbook on market microstructure."],
      ["Broken Markets", "Sal Arnuk and Joseph Saluzzi, 2012", "A practitioners' critique of fragmentation and high frequency trading."],
    ],
    papers: [
      ["Do Dark Pools Harm Price Discovery?", "Haoxiang Zhu, Review of Financial Studies, 2014", "https://scholar.google.com/scholar?q=%22Do+Dark+Pools+Harm+Price+Discovery%22+Zhu"],
      ["Dark Trading and Price Discovery", "Carole Comerton-Forde and Tālis Putniņš, Journal of Financial Economics, 2015", "https://scholar.google.com/scholar?q=%22Dark+Trading+and+Price+Discovery%22+Comerton-Forde+Putnins"],
    ],
    links: [["FINRA OTC transparency data", "https://otctransparency.finra.org/"], ["SEC Form ATS-N filings", "https://www.sec.gov/divisions/marketreg/form-ats-n-filings.htm"]],
    find: "Find",
  },
  fr: {
    kicker: "Microstructure de marché",
    title: "Dark pools et négociation hors bourse",
    lead: "Où les ordres sont réellement exécutés, qui exploite ces plateformes et ce que montrent les données publiques.",
    nav: ["Le trajet d'un ordre", "Pourquoi négocier dans l'ombre", "Plateformes", "Données", "Règles", "Idées reçues", "Lectures"],
    flowTitle: "Le trajet d'un ordre",
    flowLead: "Un même ordre peut finir à trois endroits très différents. Le courtier décide, dans le cadre de son obligation de meilleure exécution.",
    nodes: { investor: "Investisseur", broker: "Courtier", lit: "Bourse", litSub: "Carnet d'ordres visible par tous", dark: "Dark pool", darkSub: "Ordres cachés jusqu'à l'exécution", whole: "Wholesaler", wholeSub: "Teneur de marché qui exécute les ordres particuliers", tape: "Bande consolidée", tapeSub: "Chaque transaction est déclarée après exécution" },
    whyTitle: "Pourquoi négocier dans l'ombre",
    why: [
      ["Impact de marché", "Un fonds qui achète deux millions d'actions fait monter le prix contre lui s'il affiche son ordre. Caché, il peut attendre une contrepartie naturelle."],
      ["Fuite d'information", "Un gros ordre visible signale au marché qu'un acheteur est présent. Les traders rapides ajustent leurs prix avant l'exécution."],
      ["Amélioration de prix", "La plupart des dark pools exécutent au milieu de la meilleure offre et demande publiques : chaque côté économise la moitié de la fourchette."],
      ["Taille de bloc", "Les ordres à quantité minimale et conditionnels permettent aux institutionnels de ne rencontrer que d'autres gros ordres."],
    ],
    whyCons: "Le revers : le prix se forme sur les bourses publiques. Si trop de volume les quitte, les cotations reflètent moins d'information. La recherche trouve un trading caché modéré sans effet néfaste, et un trading caché massif nuisible à la formation des prix.",
    typesTitle: "Qui exploite ces plateformes",
    typesLead: "Exemples par type d'opérateur. Les plateformes fusionnent, changent de nom et ferment : la liste du régulateur fait foi.",
    types: [
      ["Détenus par des banques", "Pools de grands courtiers qui croisent les flux de clients et les leurs.", ["Goldman Sachs Sigma X", "UBS ATS", "Morgan Stanley MS Pool", "JPMorgan JPM-X"]],
      ["Agence et blocs", "Plateformes indépendantes pensées pour les blocs institutionnels.", ["Liquidnet", "Instinet CBX", "Virtu POSIT"]],
      ["Bourses et Europe", "Carnets au prix milieu et de blocs gérés par des groupes boursiers, sous dérogations MiFID II en Europe.", ["Euronext Block", "Turquoise Plato", "Cboe BIDS", "Cboe Europe dark book"]],
      ["Wholesalers", "Pas des dark pools au sens légal : des teneurs de marché qui exécutent la plupart des ordres particuliers américains hors bourse.", ["Citadel Securities", "Virtu Americas", "Jane Street", "G1 Execution"]],
    ],
    rulesTitle: "Règles",
    rules: [
      ["États-Unis", "Les dark pools sont des systèmes de négociation alternatifs sous la Regulation ATS. Chacun dépose un formulaire public ATS-N qui décrit son fonctionnement. La FINRA publie les volumes hebdomadaires par plateforme et par action, avec un délai. Les courtiers publient chaque trimestre un rapport Rule 606 qui indique où partent les ordres de leurs clients et qui les rémunère pour ce flux."],
      ["Euronext", "Euronext exploite les marchés réglementés de Paris, Bruxelles, Amsterdam, Lisbonne, Dublin, Oslo et Milan. Son carnet central est la référence visible pour la plupart des actions belges et françaises : les plateformes cachées qui négocient ces titres au prix milieu prennent leur prix sur ce carnet. Euronext exploite aussi Euronext Block, une plateforme pour les ordres institutionnels de grande taille, ce qui garde une partie des blocs dans le groupe."],
      ["Union européenne", "MiFID II n'autorise la négociation sans transparence pré-négociation que sous dérogations : prix de référence, transactions négociées, ordres de grande taille, systèmes de gestion des ordres. Un plafond limite la part d'une action négociée sous la dérogation de prix de référence ; il a été révisé lors de la réforme MiFIR. Les internalisateurs systématiques exécutent les ordres de clients contre leur propre compte."],
    ],
    mythsTitle: "Idées reçues",
    myths: [
      ["« Les transactions dark pool montrent ce que les gros achètent. »", "Une transaction a un acheteur et un vendeur. Elle ne dit rien du sens, et les données publiques sont décalées et agrégées."],
      ["« Les dark pools sont illégaux ou non régulés. »", "Ce sont des plateformes enregistrées, soumises au même droit boursier. Plusieurs opérateurs ont été sanctionnés pour avoir trompé leurs clients sur le fonctionnement de leur pool : un défaut d'information, pas un marché sans règles."],
      ["« Les ordres des particuliers vont dans les dark pools. »", "Aux États-Unis, la plupart vont chez des wholesalers, un circuit différent. Que ce soit favorable ou non aux particuliers reste débattu."],
      ["« Une forte part hors bourse est un signal d'alerte. »", "Les grandes valeurs liquides se négocient couramment en bonne partie hors bourse. La part seule n'est pas un signal : ses variations et le contexte comptent davantage."],
    ],
    readTitle: "Pour aller plus loin",
    books: [
      ["Dark Pools", "Scott Patterson, 2012", "Comment le trading électronique et algorithmique a transformé le marché actions."],
      ["Flash Boys", "Michael Lewis, 2014", "Vitesse, routage des ordres et création d'IEX. Très lu, très contesté."],
      ["Trading and Exchanges", "Larry Harris, 2003", "Le manuel de référence sur la microstructure de marché."],
      ["Broken Markets", "Sal Arnuk et Joseph Saluzzi, 2012", "Une critique de praticiens sur la fragmentation et le trading haute fréquence."],
    ],
    papers: [
      ["Do Dark Pools Harm Price Discovery?", "Haoxiang Zhu, Review of Financial Studies, 2014", "https://scholar.google.com/scholar?q=%22Do+Dark+Pools+Harm+Price+Discovery%22+Zhu"],
      ["Dark Trading and Price Discovery", "Carole Comerton-Forde et Tālis Putniņš, Journal of Financial Economics, 2015", "https://scholar.google.com/scholar?q=%22Dark+Trading+and+Price+Discovery%22+Comerton-Forde+Putnins"],
    ],
    links: [["Données de transparence OTC de la FINRA", "https://otctransparency.finra.org/"], ["Formulaires ATS-N de la SEC", "https://www.sec.gov/divisions/marketreg/form-ats-n-filings.htm"]],
    find: "Trouver",
  },
};
type Labels = typeof T.en;

/** Section heading with the underline used everywhere on the site. */
function H({ id, children, dark = false }: { id: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div id={id} className="scroll-mt-28">
      <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className={cn("text-[24px] md:text-[30px] font-semibold tracking-tight", dark ? "!text-white" : "text-slate-900")}>{children}</motion.h2>
      <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} style={{ transformOrigin: "left" }}
        className="block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
    </div>
  );
}

/** Animated routing diagram: an order leaves the investor and splits between the three circuits. */
function Flow({ t }: { t: Labels }) {
  const n = t.nodes;
  // node centres in a 1000 x 360 box
  const P = { inv: [110, 180], brk: [320, 180], lit: [620, 60], dark: [620, 180], whole: [620, 300], tape: [900, 180] } as const;
  const paths = [
    ["M110 180 L320 180", 0],
    ["M320 180 C430 180 480 60 620 60", 1],
    ["M320 180 L620 180", 1.15],
    ["M320 180 C430 180 480 300 620 300", 1.3],
    ["M620 60 C760 60 780 180 900 180", 2.2],
    ["M620 180 L900 180", 2.35],
    ["M620 300 C760 300 780 180 900 180", 2.5],
  ] as const;
  const Node = ({ at, title, sub, tone, delay }: { at: readonly [number, number]; title: string; sub?: string; tone: string; delay: number }) => (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
      className="absolute -translate-x-1/2 -translate-y-1/2 w-[19%] min-w-[120px] text-center" style={{ left: `${at[0] / 10}%`, top: `${(at[1] / 360) * 100}%` }}>
      <span className={cn("block rounded-2xl px-3 py-2.5 text-[13px] md:text-[15px] font-semibold shadow-[0_14px_30px_-18px_rgba(0,0,0,0.6)]", tone)}>{title}</span>
      {sub && <span className="mt-1.5 block text-[11px] md:text-[12px] leading-tight text-white/65">{sub}</span>}
    </motion.div>
  );
  return (
    <div className="relative w-full aspect-[1000/400] min-h-[320px]">
      <svg viewBox="0 0 1000 360" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
        {paths.map(([d, delay], i) => (
          <g key={i}>
            <motion.path d={d} fill="none" stroke="rgba(169,200,234,0.35)" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay }} />
            {/* a pulse that keeps travelling along each route */}
            <motion.circle r="5" fill={i === 2 || i === 5 ? "#E2B84F" : "#38BDF8"} initial={{ opacity: 0 }} whileInView={{ opacity: [0, 1, 1, 0] }} viewport={{ once: true }}
              transition={{ duration: 2.4, delay: delay + 1, repeat: Infinity, repeatDelay: 1.6 }}
              style={{ offsetPath: `path("${d}")`, offsetDistance: "0%" } as React.CSSProperties}
              animate={{ offsetDistance: ["0%", "100%"] } as any} />
          </g>
        ))}
      </svg>
      <Node at={P.inv} title={n.investor} tone="bg-white text-[#0C2233]" delay={0} />
      <Node at={P.brk} title={n.broker} tone="bg-white text-[#0C2233]" delay={0.5} />
      <Node at={P.lit} title={n.lit} sub={n.litSub} tone="bg-[#38BDF8] text-[#06111A]" delay={1.2} />
      <Node at={P.dark} title={n.dark} sub={n.darkSub} tone="bg-[#06111A] text-[#E2B84F] ring-1 ring-[#E2B84F]/50" delay={1.35} />
      <Node at={P.whole} title={n.whole} sub={n.wholeSub} tone="bg-[#1D6FA8] text-white" delay={1.5} />
      <Node at={P.tape} title={n.tape} sub={n.tapeSub} tone="bg-white text-[#0C2233]" delay={2.8} />
    </div>
  );
}

export function MarketStructure() {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const t: Labels = T[lang];
  const ids = ["flow", "why", "venues", "data", "rules", "myths", "reading"];
  const [open, setOpen] = useState<number | null>(0);
  const [active, setActive] = useState("flow");

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full font-sans pb-24 -mt-4 lg:-mt-6">
      {/* ── Header with the routing diagram ── */}
      <div className="w-full" style={NAVY}>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#A9C8EA]">{t.kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-2 text-[28px] md:text-[38px] font-semibold tracking-tight !text-white">{t.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-3 max-w-3xl text-[16px] md:text-[19px] leading-relaxed text-white/75">{t.lead}</motion.p>
          <div id="flow" className="scroll-mt-28 mt-10">
            <h2 className="text-[18px] md:text-[20px] font-semibold !text-white">{t.flowTitle}</h2>
            <p className="mt-1 text-[14px] md:text-[15px] text-white/65 max-w-3xl">{t.flowLead}</p>
            <div className="mt-4 overflow-x-auto"><div className="min-w-[760px]"><Flow t={t} /></div></div>
          </div>
        </div>
      </div>

      {/* ── In-page navigation, stays visible ── */}
      <nav className="sticky top-16 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex gap-1 overflow-x-auto no-scrollbar py-2">
          {t.nav.map((label, i) => (
            <a key={ids[i]} href={`#${ids[i]}`} className={cn("shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors", active === ids[i] ? "bg-[#0C2233] text-white" : "text-slate-600 hover:text-slate-900")}>{label}</a>
          ))}
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ── Why ── */}
        <section className="mt-14">
          <H id="why">{t.whyTitle}</H>
          <motion.div className="mt-7 grid sm:grid-cols-2 xl:grid-cols-4 gap-5" initial="h" whileInView="s" viewport={{ once: true, margin: "-60px" }} variants={{ h: {}, s: { transition: { staggerChildren: 0.18 } } }}>
            {t.why.map(([h, d]) => (
              <motion.div key={h} variants={{ h: { opacity: 0, y: 26 }, s: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className={cn(CARD, "p-6")}>
                <h3 className="text-[17px] font-semibold text-[#1B3F72]">{h}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </motion.div>
            ))}
          </motion.div>
          <p className="mt-6 max-w-4xl text-[15px] leading-relaxed text-slate-600 border-l-2 border-[#E2B84F] pl-4">{t.whyCons}</p>
        </section>

        {/* ── Venues ── */}
        <section className="mt-16">
          <H id="venues">{t.typesTitle}</H>
          <p className="mt-4 text-[14px] text-slate-500">{t.typesLead}</p>
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            {t.types.map(([h, d, names], i) => (
              <motion.div key={h as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }} className={cn(CARD, "p-6")}>
                <h3 className="text-[17px] font-semibold text-slate-900">{h as string}</h3>
                <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">{d as string}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(names as string[]).map((x) => <span key={x} className="px-2.5 py-1 rounded-full bg-[#1B3F72]/[0.07] text-[12.5px] font-semibold text-[#1B3F72]">{x}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Data ── */}
        <section className="mt-16">
          <H id="data">{lang === "fr" ? "Ce que montrent les données" : "What the data shows"}</H>
          <OffExchangeData lang={lang} />
        </section>

        {/* ── Rules ── */}
        <section className="mt-16">
          <H id="rules">{t.rulesTitle}</H>
          <div className="mt-7 grid lg:grid-cols-3 gap-5">
            {t.rules.map(([h, d]) => (
              <div key={h} className={cn(CARD, "p-6")}>
                <h3 className="text-[17px] font-semibold text-slate-900">{h}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Myths ── */}
        <section className="mt-16">
          <H id="myths">{t.mythsTitle}</H>
          <div className={cn(CARD, "mt-7 p-2 sm:p-3")}>
            {t.myths.map(([q, a], i) => (
              <div key={q} className={cn("rounded-2xl transition-colors", open === i && "bg-[#F3F7FC]")}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left text-[15px] font-semibold text-slate-900">
                  {q} <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition-transform", open === i && "rotate-180 text-[#1B3F72]")} />
                </button>
                {open === i && <p className="px-4 pb-4 text-[14.5px] leading-relaxed text-slate-600">{a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Reading ── */}
        <section className="mt-16">
          <H id="reading">{t.readTitle}</H>
          <div className="mt-7 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {t.books.map(([title, by, d], i) => (
              <motion.a key={title} href={`https://openlibrary.org/search?q=${encodeURIComponent(title + " " + by.split(",")[0])}`} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(CARD, "group p-5 flex gap-4")}>
                {COVERS[title]
                  ? <img src={COVERS[title]} alt={title} loading="lazy" className="w-[72px] h-[108px] shrink-0 rounded-r-md rounded-l-sm object-cover shadow-[6px_10px_22px_rgba(6,18,27,0.3)]" />
                  : <span className="w-[72px] h-[108px] shrink-0 rounded-md bg-gradient-to-br from-[#0C2233] to-[#1D6FA8] text-white text-[10px] font-semibold p-2 leading-tight shadow-md">{title}</span>}
                <span>
                  <b className="block text-[15px] text-slate-900 group-hover:text-[#1B3F72]">{title}</b>
                  <span className="block text-[12.5px] text-slate-500">{by}</span>
                  <span className="block mt-1.5 text-[13.5px] text-slate-600 leading-snug">{d}</span>
                </span>
              </motion.a>
            ))}
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className={cn(CARD, "p-5")}>
              {t.papers.map(([title, by, url]) => (
                <a key={title} href={url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 py-2 group">
                  <span><b className="block text-[14.5px] text-slate-900 group-hover:text-[#1B3F72]">{title}</b><span className="text-[12.5px] text-slate-500">{by}</span></span>
                  <ExternalLink size={14} className="shrink-0 mt-1 text-slate-400" />
                </a>
              ))}
            </div>
            <div className={cn(CARD, "p-5")}>
              {t.links.map(([label, url]) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 py-2 text-[14.5px] font-semibold text-slate-900 hover:text-[#1B3F72]">
                  {label} <ExternalLink size={14} className="text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
