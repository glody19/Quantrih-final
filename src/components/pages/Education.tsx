import React, { useMemo, useState } from "react";
import { Search, ArrowUpRight, GraduationCap, PlayCircle, Mic, Presentation } from "lucide-react";
import { PARTNERS } from "../../data/partners";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { SUMMARY_TRANSLATIONS, type Book } from "../../data/books";
import { CATEGORIES, LIBRARY, BEST_SELLERS, RECENT, PAPERS, MEDIA, categoryOf, type CategoryId, type Media } from "../../data/learning";
import { BookCard } from "../education/BookCard";
import { HeroBand, HeroStats, Donut, Columns, BarList, CountUp, LibraryArt, PALETTE } from "../education/Viz";

type Tab = "books" | "research" | "media";

const T = {
  en: {
    title: "Library and research",
    sub: "Books, academic papers, lectures and shows on portfolio construction, factors, trend following and risk.",
    tabs: { books: "Books", research: "Research", media: "Videos and podcasts" },
    search: "Search a title, an author or a topic",
    all: "All topics",
    headliners: "Best sellers",
    bestSub: "Stock market investing and trading classics, the most read worldwide. Hover a book to turn it around.",
    kicker: "Library", glance: "The library at a glance", byTopic: "Books by topic", byDecade: "Research by decade", byKind: "Videos, podcasts and lectures", langs: "Books by language", english: "English", frenchL: "French",
    statBooks: "books", statPapers: "papers", statMedia: "videos and podcasts", statTopics: "topics",
    recent: "Recent releases",
    allBooks: "All books, most read first",
    results: "Results",
    none: "Nothing matches this search.",
    paper: "Paper", authors: "Authors", published: "Published in", read: "Read", open: "Open", find: "Find the book",
    kinds: { video: "Videos", podcast: "Podcasts", course: "Lecture series" },
    researchNote: "Links go to the publisher through the DOI when there is one, otherwise to the working paper or a search for the exact title.",
    french: "In French",
  },
  fr: {
    title: "Bibliothèque et recherche",
    sub: "Livres, articles académiques, cours et émissions sur la construction de portefeuille, les facteurs, le suivi de tendance et le risque.",
    tabs: { books: "Livres", research: "Recherche", media: "Vidéos et podcasts" },
    search: "Rechercher un titre, un auteur ou un sujet",
    all: "Tous les sujets",
    headliners: "Best-sellers",
    bestSub: "Les classiques de l'investissement en bourse et du trading, les plus lus au monde. Survolez un livre pour le retourner.",
    kicker: "Bibliothèque", glance: "La bibliothèque en un coup d'œil", byTopic: "Livres par thème", byDecade: "Recherche par décennie", byKind: "Vidéos, podcasts et cours", langs: "Livres par langue", english: "Anglais", frenchL: "Français",
    statBooks: "livres", statPapers: "articles", statMedia: "vidéos et podcasts", statTopics: "thèmes",
    recent: "Parutions récentes",
    allBooks: "Tous les livres, les plus lus d'abord",
    results: "Résultats",
    none: "Aucun résultat pour cette recherche.",
    paper: "Article", authors: "Auteurs", published: "Publié dans", read: "Lire", open: "Ouvrir", find: "Trouver le livre",
    kinds: { video: "Vidéos", podcast: "Podcasts", course: "Cours filmés" },
    researchNote: "Les liens mènent à l'éditeur par le DOI quand il existe, sinon au document de travail ou à une recherche du titre exact.",
    french: "En français",
  },
} as const;

const TAG_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Derivatives": { fr: "Produits Dérivés", nl: "Derivaten", de: "Derivate", es: "Derivados" },
  "Machine Learning": { fr: "Apprentissage Automatique", nl: "Machine Learning", de: "Maschinelles Lernen", es: "Aprendizaje Automático" },
  "Value Investing": { fr: "Investissement de Valeur", nl: "Waardebeleggen", de: "Value Investing", es: "Inversión en Valor" },
  "Quant Investing": { fr: "Gestion Quantitative", nl: "Kwantitatief Beleggen", de: "Quantitatives Investieren", es: "Inversión Cuantitativa" },
  "Behavioral Finance": { fr: "Finance Comportementale", nl: "Gedragsfinanciering", de: "Verhaltensökonomie", es: "Finanzas Conductuales" },
  "Investment Philosophy": { fr: "Philosophie d'Investissement", nl: "Beleggingsfilosofie", de: "Anlagephilosophie", es: "Filosofía de Inversión" },
  "Passive Investing": { fr: "Investissement Passif", nl: "Passief Beleggen", de: "Passives Investieren", es: "Inversión Pasiva" },
  "Personal Finance": { fr: "Finances Personnelles", nl: "Persoonlijke Financiën", de: "Persönliche Finanzen", es: "Finanzas Personales" },
  "Stock Picking": { fr: "Sélection d'Actions", nl: "Aandelenselectie", de: "Aktienauswahl", es: "Selección de Acciones" },
  "Growth Investing": { fr: "Investissement de Croissance", nl: "Groeibeleggen", de: "Wachstumsinvestieren", es: "Inversión en Crecimiento" },
  "Risk Management": { fr: "Gestion des Risques", nl: "Risicobeheer", de: "Risikomanagement", es: "Gestión de Riesgos" },
  "Trading Psychology": { fr: "Psychologie du Trading", nl: "Handelspsychologie", de: "Trading-Psychologie", es: "Psicología del Trading" },
  "Fractal Geometry": { fr: "Géométrie Fractale", nl: "Fractale Meetkunde", de: "Fraktale Geometrie", es: "Geometría Fractal" },
  "Probability": { fr: "Probabilité", nl: "Waarschijnlijkheid", de: "Wahrscheinlichkeit", es: "Probabilidad" },
  "Asset Allocation": { fr: "Allocation d'Actifs", nl: "Activa-allocatie", de: "Asset-Allokation", es: "Asignación de Activos" },
  "Financial History": { fr: "Histoire Financière", nl: "Financiële Geschiedenis", de: "Finanzgeschichte", es: "Historia Financiera" },
  "Quant Strategy": { fr: "Stratégie Quantitative", nl: "Kwantitatieve Strategie", de: "Quantitative Strategie", es: "Estrategia Cuantitativa" },
  "Trend Following": { fr: "Suivi de Tendance", nl: "Trendvolgen", de: "Trendfolge", es: "Seguimiento de Tendencia" },
  "Market Microstructure": { fr: "Microstructure du Marché", nl: "Marktmicrostructuur", de: "Marktmikrostruktur", es: "Microestructura del Mercado" },
  "Wall Street Culture": { fr: "Culture de Wall Street", nl: "Wall Street-cultuur", de: "Wall-Street-Kultur", es: "Cultura de Wall Street" },
  "Mathematical Finance": { fr: "Finance Mathématique", nl: "Financiële Wiskunde", de: "Finanzmathematik", es: "Finanzas Matemáticas" },
  "Fixed Income": { fr: "Produits de Taux", nl: "Vastrentende Waarden", de: "Anleihen", es: "Renta Fija" },
  "Corporate Finance": { fr: "Finance d'Entreprise", nl: "Bedrijfsfinanciering", de: "Unternehmensfinanzierung", es: "Finanzas Corporativas" },
  "Macroeconomics": { fr: "Macroéconomie", nl: "Macro-economie", de: "Makroökonomie", es: "Macroeconomía" },
  "Technical Analysis": { fr: "Analyse Technique", nl: "Technische Analyse", de: "Technische Analyse", es: "Análisis Técnico" },
};


const tagLabel = (book: Book, language: string) =>
  TAG_TRANSLATIONS[book.tag]?.[language] ?? (language === "fr" ? book.tagFr : book.tag);

const summaryLabel = (book: Book, language: string) =>
  SUMMARY_TRANSLATIONS[book.title]?.[language] ?? (language === "fr" ? book.summaryFr : book.summary);

const COURSES_TITLE: Record<string, string> = {
  fr: "Formations partenaires",
  en: "Partner courses",
  nl: "Partneropleidingen",
  de: "Partnerkurse",
  es: "Cursos de socios",
};
const PARTNER_LABEL: Record<string, string> = { fr: "Partenaire", en: "Partner", nl: "Partner", de: "Partner", es: "Socio" };

// Shows paying education partners only; renders nothing while there are none.
function PartnerCoursesBand({ language }: { language: string }) {
  const courses = PARTNERS.filter((p) => p.kind === "education");
  if (courses.length === 0) return null;
  const lang = language === "fr" ? "fr" : "en";
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-gold" />{COURSES_TITLE[language] || COURSES_TITLE.en}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <a key={c.id} href={c.url} target="_blank" rel="noopener sponsored" className="relative rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-[#FBF3E2] to-surface p-5 hover:border-gold transition-colors">
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-[#8A6A1F] bg-gold/15 px-2 py-0.5 rounded-full">{PARTNER_LABEL[language] || PARTNER_LABEL.en}</span>
            <p className="font-bold text-text pr-20">{c.name}</p>
            <p className="text-sm text-text-2 mt-1">{c.tagline[lang]}</p>
            {c.highlight && <p className="text-xs font-semibold text-[#8A6A1F] mt-3">{c.highlight[lang]}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}

const CARD = "rounded-[1.5rem] bg-white shadow-[0_22px_60px_-40px_rgba(6,18,27,0.45)]";
const KIND_ICON = { video: PlayCircle, podcast: Mic, course: Presentation } as const;
const KIND_COLOR = { video: PALETTE.coral, podcast: PALETTE.teal, course: PALETTE.gold } as const;
/** One colour per topic, used on chips, charts and book tags. */
const CAT_COLOR: Record<CategoryId, string> = {
  value: PALETTE.gold, index: PALETTE.sky, quant: PALETTE.teal, trading: PALETTE.coral, risk: PALETTE.blue, macro: PALETTE.green, pricing: PALETTE.navy,
};

function GroupTitle({ children, count, sub, color = PALETTE.sky }: { children: React.ReactNode; count?: number; sub?: string; color?: string }) {
  return (
    <div className="mb-7">
      <motion.h2 initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 text-[24px] md:text-[30px] font-semibold tracking-tight text-slate-900">
        <span className="w-2.5 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, ${PALETTE.navy})` }} />
        {children}
        {count != null && <span className="text-[15px] font-medium text-slate-400 tabular-nums">{count}</span>}
      </motion.h2>
      {sub && <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-2 ml-5 text-[16px] text-slate-600">{sub}</motion.p>}
    </div>
  );
}

export function Education() {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const L = T[lang];
  const [tab, setTab] = useState<Tab>("books");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");

  const q = search.trim().toLowerCase();
  const hit = (...v: (string | undefined)[]) => !q || v.some((x) => x && x.toLowerCase().includes(q));

  const books = useMemo(
    () => LIBRARY.filter((b) => (cat === "all" || categoryOf(b) === cat) && hit(b.title, b.author, b.tag, b.tagFr)),
    [q, cat]
  );
  const papers = useMemo(
    () => PAPERS.filter((p) => (cat === "all" || p.cat === cat) && hit(p.title, p.authors, p.venue, String(p.year))),
    [q, cat]
  );
  const media = useMemo(
    () => MEDIA.filter((m) => (cat === "all" || m.cat === cat) && hit(m.name, m.by, m.en, m.fr)),
    [q, cat]
  );
  const counts: Record<Tab, number> = { books: books.length, research: papers.length, media: media.length };
  const filtering = !!q || cat !== "all";
  const catName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)![lang];

  // figures for the infographics, all computed from the library itself
  const byTopic = CATEGORIES.map((c) => ({ label: c[lang], value: LIBRARY.filter((b) => categoryOf(b) === c.id).length, color: CAT_COLOR[c.id] })).filter((d) => d.value > 0);
  const decades = (() => {
    const m = new Map<number, number>();
    PAPERS.forEach((p) => { const d = Math.floor(Number(p.year) / 10) * 10; if (d) m.set(d, (m.get(d) || 0) + 1); });
    return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([d, v]) => ({ label: `${d}s`, value: v }));
  })();
  const byKind = (["video", "podcast", "course"] as const).map((k) => ({ label: L.kinds[k], value: MEDIA.filter((m) => m.kind === k).length, color: KIND_COLOR[k] }));
  const frBooks = LIBRARY.filter((b) => b.origin === "fr").length;

  const grid = (list: typeof LIBRARY) => (
    <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-x-8 gap-y-12">
      {list.map((b, i) => (
        <BookCard key={b.title} book={b} index={i} find={L.find} summary={summaryLabel(b, language)} tag={tagLabel(b, language)} tagColor={CAT_COLOR[categoryOf(b)]} />
      ))}
    </div>
  );

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="w-full pb-24 -mt-4 lg:-mt-6 font-sans">
        <HeroBand kicker={L.kicker} title={L.title} sub={L.sub} art={<LibraryArt />}>
          <HeroStats items={[
            { value: LIBRARY.length, label: L.statBooks, color: PALETTE.gold },
            { value: PAPERS.length, label: L.statPapers, color: PALETTE.sky },
            { value: MEDIA.length, label: L.statMedia, color: PALETTE.coral },
            { value: CATEGORIES.length, label: L.statTopics, color: PALETTE.teal },
          ]} />
        </HeroBand>

        <div className="max-w-[1720px] mx-auto px-5 sm:px-8 lg:px-14">
          {/* feature: market structure and dark pools */}
          <motion.a href="/market-structure" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/market-structure"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.01 }}
            className="group mt-10 flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-[1.75rem] px-8 py-7 text-white shadow-[0_24px_60px_-30px_rgba(6,18,27,0.6)] overflow-hidden relative"
            style={{ background: "linear-gradient(110deg,#0A1E2D 0%,#14466B 60%,#1D6FA8 100%)" }}>
            <span className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-[#E2B84F]/20 blur-2xl" />
            <span className="relative">
              <span className="block text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E2B84F]">{lang === "fr" ? "Dossier" : "Feature"}</span>
              <span className="mt-1 block text-[23px] md:text-[27px] font-semibold">{lang === "fr" ? "Dark pools et microstructure de marché" : "Dark pools and market structure"}</span>
              <span className="mt-1 block text-[16px] text-white/75">{lang === "fr" ? "Le trajet d'un ordre, les plateformes, les données hebdomadaires de la FINRA, Euronext et les règles européennes." : "How an order travels, the venues, FINRA weekly data, Euronext and the European rules."}</span>
            </span>
            <span className="relative shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0C2233] text-[15px] font-semibold group-hover:gap-3 transition-all">{lang === "fr" ? "Lire le dossier" : "Read the feature"} →</span>
          </motion.a>

          {/* infographics */}
          <section className="mt-14">
            <GroupTitle color={PALETTE.teal}>{L.glance}</GroupTitle>
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className={cn(CARD, "p-6")}>
                <h3 className="text-[18px] font-semibold text-slate-900">{L.byTopic}</h3>
                <div className="mt-5 flex items-center gap-6">
                  <Donut data={byTopic} size={190} thickness={24} center={<><CountUp value={LIBRARY.length} className="text-[32px] font-semibold text-slate-900" /><span className="text-[12px] uppercase tracking-[0.14em] text-slate-500">{L.statBooks}</span></>} />
                  <ul className="grid gap-1.5 text-[14px]">
                    {byTopic.map((d) => <li key={d.label} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} /><span className="text-slate-700 leading-tight">{d.label}</span><span className="ml-auto pl-2 font-semibold tabular-nums text-slate-900">{d.value}</span></li>)}
                  </ul>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className={cn(CARD, "p-6")}>
                <h3 className="text-[18px] font-semibold text-slate-900">{L.byDecade}</h3>
                <div className="mt-6"><Columns data={decades} color={PALETTE.sky} height={200} /></div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className={cn(CARD, "p-6 grid gap-7 content-start")}>
                <div><h3 className="mb-4 text-[18px] font-semibold text-slate-900">{L.byKind}</h3><BarList data={byKind} /></div>
                <div><h3 className="mb-4 text-[18px] font-semibold text-slate-900">{L.langs}</h3>
                  <BarList data={[{ label: L.english, value: LIBRARY.length - frBooks, color: PALETTE.blue }, { label: L.frenchL, value: frBooks, color: PALETTE.gold }]} /></div>
              </motion.div>
            </div>
          </section>

          {/* Tabs, search, topics */}
          <div className="mt-16 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="inline-flex self-start p-1.5 rounded-full bg-white shadow-[0_10px_30px_-18px_rgba(6,18,27,0.4)]">
                {(["books", "research", "media"] as const).map((k) => (
                  <button key={k} onClick={() => setTab(k)} className={cn("relative px-5 sm:px-6 h-12 rounded-full text-[16px] font-semibold transition-colors whitespace-nowrap", tab === k ? "text-white" : "text-slate-600 hover:text-slate-900")}>
                    {tab === k && <motion.span layoutId="eduTab" className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(110deg, ${PALETTE.navy}, ${PALETTE.blue})` }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                    <span className="relative">{L.tabs[k]} <span className={cn("ml-1 text-[13px] tabular-nums", tab === k ? "text-white/70" : "text-slate-400")}>{counts[k]}</span></span>
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-2xl">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={L.search} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-[52px] bg-white rounded-full text-[16px] text-slate-900 placeholder-slate-400 outline-none shadow-[0_10px_30px_-18px_rgba(6,18,27,0.4)] focus:ring-2 focus:ring-[#38BDF8]/40" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id, i) => {
                const on = cat === id;
                const color = id === "all" ? PALETTE.ink : CAT_COLOR[id as CategoryId];
                return (
                  <motion.button key={id} onClick={() => setCat(id as CategoryId | "all")} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold transition-all", on ? "text-white shadow-md" : "bg-white text-slate-700 hover:text-slate-900 shadow-sm")}
                    style={on ? { background: color } : undefined}>
                    {id !== "all" && <span className="w-2.5 h-2.5 rounded-full" style={{ background: on ? "#fff" : color }} />}
                    {id === "all" ? L.all : catName(id as CategoryId)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-10"><PartnerCoursesBand language={language} /></div>

          {counts[tab] === 0 && <p className={cn(CARD, "text-center text-slate-500 py-16 text-[16px]")}>{L.none}</p>}

          {/* ── Books ── */}
          {tab === "books" && books.length > 0 && (
            filtering ? (
              <section>
                <GroupTitle count={books.length}>{L.results}</GroupTitle>
                {grid(books)}
              </section>
            ) : (
              <div className="grid gap-20">
                <section className="relative rounded-[2rem] px-6 sm:px-10 py-10" style={{ background: "linear-gradient(135deg, #FFF8E8 0%, #F3F7FC 55%, #E8F4FC 100%)" }}>
                  <GroupTitle color={PALETTE.gold} sub={L.bestSub}>{L.headliners}</GroupTitle>
                  {grid(BEST_SELLERS)}
                </section>
                <section>
                  <GroupTitle color={PALETTE.coral}>{L.recent}</GroupTitle>
                  {grid(RECENT)}
                </section>
                <section>
                  <GroupTitle color={PALETTE.sky}>{L.allBooks}</GroupTitle>
                  {grid(books.filter((b) => !BEST_SELLERS.includes(b) && !b.recent))}
                </section>
              </div>
            )
          )}

          {/* ── Research ── */}
          {tab === "research" && papers.length > 0 && (
            <section>
              <div className={cn(CARD, "overflow-x-auto p-4 sm:p-6")}>
                <table className="w-full min-w-[760px] text-[16px] border-separate border-spacing-y-[4px]">
                  <thead>
                    <tr className="text-[14px] text-slate-500">
                      <th className="text-left font-medium pl-3 pb-2">{L.paper}</th>
                      <th className="text-left font-medium pb-2 px-3 w-[24%]">{L.published}</th>
                      <th className="pb-2 w-[80px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {papers.map((p, i) => (
                      <motion.tr key={p.title} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: Math.min(i, 10) * 0.04 }} className="align-top hover:bg-[#F3F7FC] transition-colors">
                        <td className="pl-3 py-4 pr-3 rounded-l-xl" style={{ boxShadow: `inset 4px 0 0 ${CAT_COLOR[p.cat]}` }}>
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-[#1D6FA8] leading-snug">{p.title}</a>
                          <span className="block mt-0.5 text-[14.5px] text-[#1B3F72]">{p.authors}</span>
                          <span className="block mt-1.5 text-[14.5px] leading-relaxed text-slate-600 max-w-3xl">{p[lang]}</span>
                        </td>
                        <td className="px-3 py-4 text-[14.5px] text-slate-600">
                          <span className="block">{p.venue}</span>
                          <span className="mt-1 inline-flex items-center gap-1.5 tabular-nums text-slate-500"><span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[p.cat] }} />{p.year} · {catName(p.cat)}</span>
                        </td>
                        <td className="py-4 pr-3 text-right rounded-r-xl">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[14.5px] font-semibold text-[#1D6FA8] hover:underline">{L.read} <ArrowUpRight size={15} /></a>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13.5px] text-slate-500">{L.researchNote}</p>
            </section>
          )}

          {/* ── Videos, podcasts, lectures ── */}
          {tab === "media" && media.length > 0 && (
            <div className="grid gap-14">
              {(["video", "podcast", "course"] as const).map((kind) => {
                const list = media.filter((m) => m.kind === kind);
                if (!list.length) return null;
                return (
                  <section key={kind}>
                    <GroupTitle count={list.length} color={KIND_COLOR[kind]}>{L.kinds[kind]}</GroupTitle>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {list.map((m, i) => <MediaCard key={m.name} m={m} lang={lang} index={i} open={L.open} topic={catName(m.cat)} topicColor={CAT_COLOR[m.cat]} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileZoomWrapper>
  );
}

function MediaCard({ m, lang, index, open, topic, topicColor }: { m: Media; lang: "en" | "fr"; index: number; open: string; topic: string; topicColor: string }) {
  const Icon = KIND_ICON[m.kind];
  const color = KIND_COLOR[m.kind];
  return (
    <motion.a href={m.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={cn(CARD, "group relative flex flex-col p-6 overflow-hidden")}>
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${PALETTE.blue})` }} />
      <div className="flex items-start gap-4">
        <span className="w-12 h-12 shrink-0 rounded-2xl text-white flex items-center justify-center shadow-md" style={{ background: `linear-gradient(140deg, ${color}, ${PALETTE.navy})` }}><Icon size={21} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-slate-900 leading-snug group-hover:text-[#1D6FA8]">{m.name}</p>
          <p className="text-[14.5px] text-[#1B3F72]">{m.by}</p>
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 rounded px-2 py-0.5">{m.lang}</span>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{m[lang]}</p>
      <div className="mt-auto pt-5 flex items-center justify-between text-[14.5px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-600"><span className="w-2 h-2 rounded-full" style={{ background: topicColor }} />{topic}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-[#1D6FA8]">{open} <ArrowUpRight size={15} /></span>
      </div>
    </motion.a>
  );
}
