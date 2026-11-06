import React, { useMemo, useState } from "react";
import { BookOpen, Search, ExternalLink, Star, GraduationCap } from "lucide-react";
import { PARTNERS } from "../../data/partners";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { BOOKS, SUMMARY_TRANSLATIONS, type Book, type BookLevel } from "../../data/books";

type Labels = {
  search: string;
  library: string;
  books: string;
  no_books: string;
  by: string;
  consult: string;
  featured: string;
  all: string;
  all_themes: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  french: string;
};

const labels: Record<string, Labels> = {
  en: {
    search: "Search a title, an author or a theme",
    library: "The Reference Library",
    books: "books",
    no_books: "No book matches these filters.",
    by: "By",
    consult: "Find the book",
    featured: "Featured",
    all: "All levels",
    all_themes: "All themes",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    french: "French-language book",
  },
  fr: {
    search: "Rechercher un titre, un auteur ou un thème",
    library: "La Bibliothèque de Référence",
    books: "livres",
    no_books: "Aucun livre ne correspond à ces filtres.",
    by: "Par",
    consult: "Trouver le livre",
    featured: "Coup de cœur",
    all: "Tous niveaux",
    all_themes: "Tous les thèmes",
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    french: "Ouvrage francophone",
  },
  nl: {
    search: "Zoek een titel, auteur of thema",
    library: "De Referentiebibliotheek",
    books: "boeken",
    no_books: "Geen boek komt overeen met deze filters.",
    by: "Door",
    consult: "Boek zoeken",
    featured: "Aanrader",
    all: "Alle niveaus",
    all_themes: "Alle thema's",
    beginner: "Beginner",
    intermediate: "Gevorderd",
    advanced: "Expert",
    french: "Franstalig boek",
  },
  de: {
    search: "Titel, Autor oder Thema suchen",
    library: "Die Referenzbibliothek",
    books: "Bücher",
    no_books: "Kein Buch entspricht diesen Filtern.",
    by: "Von",
    consult: "Buch finden",
    featured: "Empfehlung",
    all: "Alle Stufen",
    all_themes: "Alle Themen",
    beginner: "Einsteiger",
    intermediate: "Fortgeschritten",
    advanced: "Experte",
    french: "Französischsprachiges Buch",
  },
  es: {
    search: "Buscar un título, un autor o un tema",
    library: "La Biblioteca de Referencia",
    books: "libros",
    no_books: "Ningún libro coincide con estos filtros.",
    by: "Por",
    consult: "Buscar el libro",
    featured: "Destacado",
    all: "Todos los niveles",
    all_themes: "Todos los temas",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    french: "Libro en francés",
  },
};

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

const LEVEL_STYLE: Record<BookLevel, string> = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-rose-50 text-rose-700 border-rose-200",
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

export function Education() {
  const { language } = useTranslation();
  const L = labels[language] || labels.en;
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<BookLevel | "all">("all");
  const [theme, setTheme] = useState<string>("all");

  const themes = useMemo(
    () => Array.from(new Set(BOOKS.map((b) => b.tag))).sort((a, b) => a.localeCompare(b)),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BOOKS.filter((b) => {
      if (level !== "all" && b.level !== level) return false;
      if (theme !== "all" && b.tag !== theme) return false;
      if (!q) return true;
      return [b.title, b.author, b.tag, b.tagFr, tagLabel(b, language)].some((v) => v.toLowerCase().includes(q));
    });
  }, [search, level, theme, language]);

  const levelOptions: (BookLevel | "all")[] = ["all", "beginner", "intermediate", "advanced"];

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="page-container pb-24 mt-6 min-h-[calc(100vh-80px)] font-sans">
        {/* Header and filters */}
        <div className="flex flex-col gap-5 mb-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-pv-blue/10 text-pv-blue flex items-center justify-center">
                <BookOpen size={20} />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-text">{L.library}</h1>
            </div>
            <span className="text-xs font-semibold bg-pv-blue/10 text-pv-blue px-3 py-1 rounded-full font-mono">
              {filtered.length} {L.books}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                type="text"
                placeholder={L.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-4 outline-none focus:border-pv-blue/60"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {levelOptions.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    level === lv ? "bg-text text-bg border-text" : "bg-surface text-text-3 border-border hover:border-border-2"
                  )}
                >
                  {lv === "all" ? L.all : L[lv]}
                </button>
              ))}
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-semibold text-text-2 outline-none focus:border-pv-blue/60"
            >
              <option value="all">{L.all_themes}</option>
              {themes.map((tg) => (
                <option key={tg} value={tg}>
                  {TAG_TRANSLATIONS[tg]?.[language] ?? tg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PartnerCoursesBand language={language} />

        {filtered.length === 0 ? (
          <div className="text-center text-text-3 py-20 bg-surface rounded-3xl border border-border text-sm">
            {L.no_books}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
            {filtered.map((b, i) => (
              <BookCard key={b.title} book={b} language={language} labels={L} index={i} />
            ))}
          </div>
        )}
      </div>
    </MobileZoomWrapper>
  );
}

function BookCard({ book, language, labels: L, index }: { book: Book; language: string; labels: Labels; index: number }) {
  const [imageError, setImageError] = useState(false);
  const searchLink = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
  const link = book.link === "#" || book.link.includes("amazon.") ? searchLink : book.link;
  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false` : null;
  const tag = tagLabel(book, language);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
    >
      {/* Book on its shelf */}
      <a href={link} target="_blank" rel="noopener noreferrer" className="relative flex items-end justify-center h-[190px] pb-3 [perspective:900px]">
        <div className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-18deg)_translateY(-8px)]">
          {coverUrl && !imageError ? (
            <img
              src={coverUrl}
              alt={book.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-[108px] h-[160px] rounded-r-md rounded-l-sm object-cover shadow-[6px_8px_18px_rgba(20,20,26,0.25)]"
            />
          ) : (
            <div
              className="w-[108px] h-[160px] rounded-r-md rounded-l-sm p-2.5 flex flex-col justify-between text-white shadow-[6px_8px_18px_rgba(20,20,26,0.25)] relative overflow-hidden"
              style={{ backgroundColor: book.coverColor || "#5B4BDB" }}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/25 pointer-events-none" />
              <h4 className="relative font-bold text-[11px] leading-tight line-clamp-5 pl-1">{book.title}</h4>
              <span className="relative text-[9px] font-medium opacity-90 pl-1 line-clamp-2">{book.author}</span>
            </div>
          )}
          {book.featured && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center shadow-md" title={L.featured}>
              <Star size={12} className="fill-white" />
            </span>
          )}
        </div>
        {/* Shelf ledge */}
        <div className="absolute bottom-0 -left-3 -right-3 h-3 rounded-sm bg-gradient-to-b from-[#E4DED2] to-[#CFC6B5] shadow-[0_6px_10px_-4px_rgba(20,20,26,0.25)]" />
      </a>

      {/* Book details */}
      <div className="pt-3 flex flex-col gap-1.5 flex-grow">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", LEVEL_STYLE[book.level])}>
            {L[book.level]}
          </span>
          {book.origin === "fr" && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border text-text-3" title={L.french}>
              FR
            </span>
          )}
          <span className="text-[10px] text-text-4 font-mono">{book.year}</span>
        </div>
        <h4 className="text-[13px] font-bold text-text leading-snug line-clamp-2 group-hover:text-pv-blue transition-colors">
          {book.title}
        </h4>
        <p className="text-[11px] text-text-3 leading-snug line-clamp-1">
          {L.by} {book.author}
        </p>
        <p className="text-[11px] text-text-3 leading-relaxed line-clamp-3">{summaryLabel(book, language)}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-pv-blue bg-pv-blue/8 px-2 py-0.5 rounded-full truncate">{tag}</span>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-text-3 hover:text-pv-blue inline-flex items-center gap-1 shrink-0"
            title={L.consult}
          >
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
