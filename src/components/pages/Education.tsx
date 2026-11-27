import React, { useMemo, useState } from "react";
import { Search, ArrowUpRight, GraduationCap } from "lucide-react";
import { PARTNERS } from "../../data/partners";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { SUMMARY_TRANSLATIONS, type Book } from "../../data/books";
import { CATEGORIES, LIBRARY, BEST_SELLERS, RECENT, PAPERS, categoryOf, type CategoryId } from "../../data/learning";
import { BookCard } from "../education/BookCard";
import { PlainHead } from "../education/Viz";

type Tab = "books" | "research";

const T = {
  en: {
    title: "Library and research",
    sub: "Books and academic papers on portfolio construction, factors, trend following and risk.",
    tabs: { books: "Books", research: "Research" },
    search: "Search a title, an author or a topic",
    all: "All topics",
    headliners: "Best sellers",
    bestSub: "Stock market investing and trading classics, the most read worldwide. Click a book for its full summary.",
    kicker: "Library",
    statBooks: "books", statPapers: "papers", statTopics: "topics",
    recent: "Recent releases",
    allBooks: "All books, most read first",
    results: "Results",
    none: "Nothing matches this search.",
    paper: "Paper", published: "Published in", read: "Read", find: "Find the book",
    researchNote: "Links go to the publisher through the DOI when there is one, otherwise to the working paper or a search for the exact title.",
    french: "In French",
  },
  fr: {
    title: "Bibliothèque et recherche",
    sub: "Livres et articles académiques sur la construction de portefeuille, les facteurs, le suivi de tendance et le risque.",
    tabs: { books: "Livres", research: "Recherche" },
    search: "Rechercher un titre, un auteur ou un sujet",
    all: "Tous les sujets",
    headliners: "Best-sellers",
    bestSub: "Les classiques de l'investissement en bourse et du trading, les plus lus au monde. Cliquez sur un livre pour lire son résumé complet.",
    kicker: "Bibliothèque",
    statBooks: "livres", statPapers: "articles", statTopics: "thèmes",
    recent: "Parutions récentes",
    allBooks: "Tous les livres, les plus lus d'abord",
    results: "Résultats",
    none: "Aucun résultat pour cette recherche.",
    paper: "Article", published: "Publié dans", read: "Lire", find: "Trouver le livre",
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
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-slate-500" />{COURSES_TITLE[language] || COURSES_TITLE.en}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <a key={c.id} href={c.url} target="_blank" rel="noopener sponsored" className="relative rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 transition-colors">
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">{PARTNER_LABEL[language] || PARTNER_LABEL.en}</span>
            <p className="font-bold text-text pr-20">{c.name}</p>
            <p className="text-sm text-text-2 mt-1">{c.tagline[lang]}</p>
            {c.highlight && <p className="text-xs font-semibold text-slate-700 mt-3">{c.highlight[lang]}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}

const CARD = "rounded-2xl bg-white border border-slate-200";

/** Section title: black text, no coloured bar, no animation. */
function GroupTitle({ children, count, sub }: { children: React.ReactNode; count?: number; sub?: string }) {
  return (
    <div className="mb-7">
      <h2 className="flex items-baseline gap-3 text-[24px] md:text-[28px] font-semibold tracking-tight text-slate-900">
        {children}
        {count != null && <span className="text-[15px] font-medium text-slate-400 tabular-nums">{count}</span>}
      </h2>
      {sub && <p className="mt-2 text-[16px] text-slate-600">{sub}</p>}
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
  const counts: Record<Tab, number> = { books: books.length, research: papers.length };
  const filtering = !!q || cat !== "all";
  const catName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)![lang];

  const grid = (list: typeof LIBRARY) => (
    <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-x-8 gap-y-12">
      {list.map((b, i) => (
        <BookCard key={b.title} book={b} index={i} find={L.find} summary={summaryLabel(b, language)} tag={tagLabel(b, language)} />
      ))}
    </div>
  );

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="w-full pb-24 -mt-4 lg:-mt-6 font-sans">
        <PlainHead kicker={L.kicker} title={L.title} sub={L.sub} stats={[
          { value: LIBRARY.length, label: L.statBooks },
          { value: PAPERS.length, label: L.statPapers },
          { value: CATEGORIES.length, label: L.statTopics },
        ]} />

        <div className="max-w-[1720px] mx-auto px-5 sm:px-8 lg:px-14">
          {/* feature: market structure and dark pools */}
          <a href="/market-structure" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/market-structure"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); }}
            className="group mt-10 flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-8 py-7 hover:border-slate-400 transition-colors">
            <span>
              <span className="block text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">{lang === "fr" ? "Dossier" : "Feature"}</span>
              <span className="mt-1 block text-[22px] md:text-[25px] font-semibold text-slate-900">{lang === "fr" ? "Dark pools et microstructure de marché" : "Dark pools and market structure"}</span>
              <span className="mt-1 block text-[16px] text-slate-600">{lang === "fr" ? "Le trajet d'un ordre, les plateformes, les données hebdomadaires de la FINRA, Euronext et les règles européennes." : "How an order travels, the venues, FINRA weekly data, Euronext and the European rules."}</span>
            </span>
            <span className="shrink-0 inline-flex items-center gap-2 px-5 h-11 rounded-full border border-slate-300 text-slate-900 text-[15px] font-semibold group-hover:border-slate-900 transition-colors">{lang === "fr" ? "Lire le dossier" : "Read the feature"} →</span>
          </a>

          {/* Tabs, search, topics */}
          <div className="mt-16 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="inline-flex self-start p-1 rounded-full bg-white border border-slate-200">
                {(["books", "research"] as const).map((k) => (
                  <button key={k} onClick={() => setTab(k)} className={cn("relative px-5 sm:px-6 h-11 rounded-full text-[16px] font-semibold transition-colors whitespace-nowrap", tab === k ? "text-white" : "text-slate-600 hover:text-slate-900")}>
                    {tab === k && <span className="absolute inset-0 rounded-full bg-slate-900" />}
                    <span className="relative">{L.tabs[k]} <span className={cn("ml-1 text-[13px] tabular-nums", tab === k ? "text-white/70" : "text-slate-400")}>{counts[k]}</span></span>
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-2xl">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={L.search} value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-[50px] bg-white rounded-full text-[16px] text-slate-900 placeholder-slate-400 outline-none border border-slate-200 focus:border-slate-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => {
                const on = cat === id;
                return (
                  <button key={id} onClick={() => setCat(id as CategoryId | "all")}
                    className={cn("px-4 py-2 rounded-full text-[15px] font-semibold border transition-colors", on ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900")}>
                    {id === "all" ? L.all : catName(id as CategoryId)}
                  </button>
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
                <section>
                  <GroupTitle sub={L.bestSub}>{L.headliners}</GroupTitle>
                  {grid(BEST_SELLERS)}
                </section>
                <section>
                  <GroupTitle>{L.recent}</GroupTitle>
                  {grid(RECENT)}
                </section>
                <section>
                  <GroupTitle>{L.allBooks}</GroupTitle>
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
                    {papers.map((p) => (
                      <tr key={p.title} className="align-top hover:bg-slate-50 transition-colors">
                        <td className="pl-3 py-4 pr-3 rounded-l-xl">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:underline leading-snug">{p.title}</a>
                          <span className="block mt-0.5 text-[14.5px] text-slate-700">{p.authors}</span>
                          <span className="block mt-1.5 text-[14.5px] leading-relaxed text-slate-600 max-w-3xl">{p[lang]}</span>
                        </td>
                        <td className="px-3 py-4 text-[14.5px] text-slate-600">
                          <span className="block">{p.venue}</span>
                          <span className="mt-1 block tabular-nums text-slate-500">{p.year} · {catName(p.cat)}</span>
                        </td>
                        <td className="py-4 pr-3 text-right rounded-r-xl">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[14.5px] font-semibold text-slate-900 hover:underline">{L.read} <ArrowUpRight size={15} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13.5px] text-slate-500">{L.researchNote}</p>
            </section>
          )}

        </div>
      </div>
    </MobileZoomWrapper>
  );
}
