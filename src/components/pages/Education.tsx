import React, { useMemo, useState } from "react";
import { Search, ArrowUpRight, GraduationCap, PlayCircle, Mic, Presentation } from "lucide-react";
import { PARTNERS } from "../../data/partners";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { SUMMARY_TRANSLATIONS, type Book } from "../../data/books";
import { CATEGORIES, LIBRARY, HEADLINERS, RECENT, PAPERS, MEDIA, categoryOf, type CategoryId, type Media } from "../../data/learning";

type Tab = "books" | "research" | "media";

const T = {
  en: {
    title: "Library and research",
    sub: "Books, academic papers, lectures and shows on portfolio construction, factors, trend following and risk.",
    tabs: { books: "Books", research: "Research", media: "Videos and podcasts" },
    search: "Search a title, an author or a topic",
    all: "All topics",
    headliners: "The references",
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
    headliners: "Les références",
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

const CARD = "rounded-[1.25rem] bg-white shadow-[0_18px_50px_-36px_rgba(6,18,27,0.35)]";
const KIND_ICON = { video: PlayCircle, podcast: Mic, course: Presentation } as const;

function GroupTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 className="mb-5 flex items-baseline gap-3 text-[20px] md:text-[22px] font-semibold tracking-tight text-text">
      {children}
      {count != null && <span className="text-[13px] font-medium text-text-3 tabular-nums">{count}</span>}
    </h2>
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

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="page-container pb-24 mt-6 min-h-[calc(100vh-80px)] font-sans">
        <header className="max-w-3xl">
          <h1 className="text-[26px] md:text-[34px] leading-tight font-semibold tracking-tight text-text">{L.title}</h1>
          <span className="block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" />
          <p className="mt-4 text-[15px] md:text-[17px] leading-relaxed text-text-2">{L.sub}</p>
        </header>

        {/* feature: market structure and dark pools */}
        <a href="/market-structure" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/market-structure"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); }}
          className="group mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[1.5rem] px-6 py-5 text-white shadow-[0_18px_50px_-30px_rgba(6,18,27,0.6)]"
          style={{ background: "linear-gradient(110deg,#0A1E2D 0%,#14466B 70%,#1D6FA8 100%)" }}>
          <span>
            <span className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#A9C8EA]">{lang === "fr" ? "Dossier" : "Feature"}</span>
            <span className="mt-1 block text-[20px] md:text-[22px] font-semibold">{lang === "fr" ? "Dark pools et microstructure de marché" : "Dark pools and market structure"}</span>
            <span className="mt-1 block text-[14px] text-white/70">{lang === "fr" ? "Le trajet d'un ordre, les plateformes, les données hebdomadaires de la FINRA, Euronext et les règles européennes." : "How an order travels, the venues, FINRA weekly data, Euronext and the European rules."}</span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0C2233] text-[14px] font-semibold group-hover:gap-3 transition-all">{lang === "fr" ? "Lire le dossier" : "Read the feature"} →</span>
        </a>

        {/* Tabs, search, topics */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="inline-flex self-start p-1 rounded-full bg-white shadow-sm">
              {(["books", "research", "media"] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={cn("relative px-4 sm:px-5 h-10 rounded-full text-sm font-semibold transition-colors whitespace-nowrap", tab === k ? "text-white" : "text-text-2 hover:text-text")}>
                  {tab === k && <motion.span layoutId="eduTab" className="absolute inset-0 rounded-full bg-pv-blue" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                  <span className="relative">{L.tabs[k]} <span className={cn("ml-1 text-xs tabular-nums", tab === k ? "text-white/70" : "text-text-4")}>{counts[k]}</span></span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" placeholder={L.search} value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 h-11 bg-white rounded-full text-sm text-text placeholder-text-4 outline-none shadow-sm focus:ring-2 focus:ring-pv-blue/30" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => (
              <button key={id} onClick={() => setCat(id as CategoryId | "all")}
                className={cn("px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors", cat === id ? "bg-[#0C2233] text-white" : "bg-white text-text-2 hover:text-text shadow-sm")}>
                {id === "all" ? L.all : catName(id as CategoryId)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10"><PartnerCoursesBand language={language} /></div>

        {counts[tab] === 0 && <p className={cn(CARD, "text-center text-text-3 py-16 text-sm")}>{L.none}</p>}

        {/* ── Books ── */}
        {tab === "books" && books.length > 0 && (
          filtering ? (
            <section>
              <GroupTitle count={books.length}>{L.results}</GroupTitle>
              <BookGrid books={books} language={language} find={L.find} french={L.french} />
            </section>
          ) : (
            <div className="grid gap-14">
              <section>
                <GroupTitle>{L.headliners}</GroupTitle>
                <BookGrid books={HEADLINERS} language={language} find={L.find} french={L.french} />
              </section>
              <section>
                <GroupTitle>{L.recent}</GroupTitle>
                <BookGrid books={RECENT} language={language} find={L.find} french={L.french} />
              </section>
              <section>
                <GroupTitle count={books.length}>{L.allBooks}</GroupTitle>
                <BookGrid books={books.filter((b) => !HEADLINERS.includes(b) && !b.recent)} language={language} find={L.find} french={L.french} />
              </section>
            </div>
          )
        )}

        {/* ── Research ── */}
        {tab === "research" && papers.length > 0 && (
          <section>
            <div className={cn(CARD, "overflow-x-auto p-3 sm:p-5")}>
              <table className="w-full min-w-[720px] text-[14px] border-separate border-spacing-y-[3px]">
                <thead>
                  <tr className="text-[13px] text-slate-500">
                    <th className="text-left font-medium pl-2 pb-2">{L.paper}</th>
                    <th className="text-left font-medium pb-2 px-3 w-[24%]">{L.published}</th>
                    <th className="pb-2 w-[70px]" />
                  </tr>
                </thead>
                <tbody>
                  {papers.map((p, i) => (
                    <motion.tr key={p.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.03 }} className="align-top hover:bg-surface-3/50 transition-colors">
                      <td className="pl-2 py-3 pr-3">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-text hover:text-pv-blue leading-snug">{p.title}</a>
                        <span className="block mt-0.5 text-[13px] text-[#1B3F72]">{p.authors}</span>
                        <span className="block mt-1.5 text-[13px] leading-relaxed text-text-2 max-w-3xl">{p[lang]}</span>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-text-2">
                        <span className="block">{p.venue}</span>
                        <span className="block tabular-nums text-text-3">{p.year} · {catName(p.cat)}</span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-pv-blue hover:underline">{L.read} <ArrowUpRight size={14} /></a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-slate-500">{L.researchNote}</p>
          </section>
        )}

        {/* ── Videos, podcasts, lectures ── */}
        {tab === "media" && media.length > 0 && (
          <div className="grid gap-12">
            {(["video", "podcast", "course"] as const).map((kind) => {
              const list = media.filter((m) => m.kind === kind);
              if (!list.length) return null;
              return (
                <section key={kind}>
                  <GroupTitle count={list.length}>{L.kinds[kind]}</GroupTitle>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {list.map((m, i) => <MediaCard key={m.name} m={m} lang={lang} index={i} open={L.open} topic={catName(m.cat)} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </MobileZoomWrapper>
  );
}

function MediaCard({ m, lang, index, open, topic }: { m: Media; lang: "en" | "fr"; index: number; open: string; topic: string }) {
  const Icon = KIND_ICON[m.kind];
  return (
    <motion.a href={m.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
      className={cn(CARD, "group flex flex-col p-5 hover:shadow-[0_22px_50px_-30px_rgba(6,18,27,0.45)] transition-shadow")}>
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-[#0C2233] text-white flex items-center justify-center"><Icon size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-text leading-snug group-hover:text-pv-blue">{m.name}</p>
          <p className="text-[13px] text-[#1B3F72]">{m.by}</p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-3 bg-surface-3 rounded px-1.5 py-0.5">{m.lang}</span>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-text-2">{m[lang]}</p>
      <div className="mt-auto pt-4 flex items-center justify-between text-[13px]">
        <span className="text-text-3">{topic}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-pv-blue">{open} <ArrowUpRight size={14} /></span>
      </div>
    </motion.a>
  );
}

function BookGrid({ books, language, find, french }: { books: Book[]; language: string; find: string; french: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-9">
      {books.map((b, i) => <BookCard key={b.title} book={b} language={language} find={find} french={french} index={i} />)}
    </div>
  );
}

function BookCard({ book, language, find, french, index }: { book: Book; language: string; find: string; french: string; index: number }) {
  const [imageError, setImageError] = useState(false);
  const searchLink = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
  const link = book.link === "#" || book.link.includes("amazon.") ? searchLink : book.link;
  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false` : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
    >
      <a href={link} target="_blank" rel="noopener noreferrer" className="relative flex items-end justify-center h-[176px] [perspective:900px]">
        <div className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-18deg)_translateY(-8px)]">
          {coverUrl && !imageError ? (
            <img src={coverUrl} alt={book.title} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageError(true)}
              className="w-[108px] h-[160px] rounded-r-md rounded-l-sm object-cover shadow-[6px_8px_18px_rgba(20,20,26,0.25)]" />
          ) : (
            <div className="w-[108px] h-[160px] rounded-r-md rounded-l-sm p-2.5 flex flex-col justify-between text-white shadow-[6px_8px_18px_rgba(20,20,26,0.25)] relative overflow-hidden"
              style={{ backgroundColor: book.coverColor && !/^#(4338ca|6d28d9|7c3aed|5b21b6|4c1d95|6366f1|8b5cf6|a855f7|9333ea|7e22ce)$/i.test(book.coverColor) ? book.coverColor : "#1B3F72" }}>
              <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/25 pointer-events-none" />
              <h4 className="relative font-bold text-[11px] leading-tight line-clamp-5 pl-1">{book.title}</h4>
              <span className="relative text-[9px] font-medium opacity-90 pl-1 line-clamp-2">{book.author}</span>
            </div>
          )}
        </div>
      </a>

      <div className="pt-3 flex flex-col gap-1 flex-grow">
        <h4 className="text-[13px] font-semibold text-text leading-snug line-clamp-2 group-hover:text-pv-blue transition-colors">{book.title}</h4>
        <p className="text-[12px] text-[#1B3F72] leading-snug line-clamp-1">{book.author} · <span className="tabular-nums text-text-3">{book.year}</span>{book.origin === "fr" && <span className="text-text-3" title={french}> · FR</span>}</p>
        <p className="text-[12px] text-text-2 leading-relaxed line-clamp-4">{summaryLabel(book, language)}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-[12px]">
          <span className="text-text-3 truncate">{tagLabel(book, language)}</span>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-pv-blue hover:underline shrink-0">{find} <ArrowUpRight size={12} /></a>
        </div>
      </div>
    </motion.article>
  );
}
