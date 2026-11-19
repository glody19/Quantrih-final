import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { CATEGORIES, categoryOf, findBookBySlug, otherBooksByAuthor, authorsOf, LIBRARY, type CategoryId } from "../../data/learning";
import { SUMMARY_TRANSLATIONS, type Book } from "../../data/books";
import { detailOf } from "../../data/bookDetails";
import { BookCard, useCover } from "../education/BookCard";
import { PALETTE } from "../education/Viz";

const CAT_COLOR: Record<CategoryId, string> = {
  value: PALETTE.gold, index: PALETTE.sky, quant: PALETTE.teal, trading: PALETTE.coral, risk: PALETTE.blue, macro: PALETTE.green, pricing: PALETTE.navy,
};

const T = {
  fr: { back: "Bibliothèque", about: "De quoi parle le livre", ideas: "Idées clés", find: "Trouver le livre", by: "Autres livres de", byMany: "Autres livres des auteurs", same: "Dans le même thème", notFound: "Ce livre n'est pas dans la bibliothèque.", french: "En français", published: "Parution" },
  en: { back: "Library", about: "What the book is about", ideas: "Key ideas", find: "Find the book", by: "More books by", byMany: "More books by the authors", same: "On the same topic", notFound: "This book is not in the library.", french: "In French", published: "Published" },
} as const;

const findLink = (b: Book) =>
  b.link === "#" || b.link.includes("amazon.") ? `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${b.title} ${b.author}`)}` : b.link;

/** Large cover. Falls back to a typographic cover when no real one exists. */
function BigCover({ book }: { book: Book }) {
  const { src, stage, fail } = useCover(book);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [book.title]);
  const drawn = stage === "none";
  return (
    <div className="relative w-[230px] sm:w-[280px] lg:w-[340px] aspect-[2/3] rounded-r-lg rounded-l-sm overflow-hidden shadow-[18px_28px_60px_rgba(0,0,0,0.45)] bg-white/10">
      {src && !drawn && (
        <img src={src} alt={book.title} referrerPolicy="no-referrer"
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) fail(); else setLoaded(true); }}
          onError={fail} className={"w-full h-full object-cover transition-opacity duration-500 " + (loaded ? "opacity-100" : "opacity-0")} />
      )}
      {drawn && (
        <div className="absolute inset-0 flex flex-col justify-between p-7 text-white" style={{ background: `linear-gradient(160deg, ${book.coverColor ?? PALETTE.navy}, #06121B)` }}>
          <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">{book.author}</span>
          <span className="text-[30px] leading-[1.1] font-bold">{book.title}</span>
          <span className="text-[14px] font-semibold text-white/70">{book.year}</span>
        </div>
      )}
      <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 to-transparent" />
    </div>
  );
}

export function BookPage() {
  const { slug = "" } = useParams();
  const { language } = useTranslation();
  const lang: "fr" | "en" = language === "fr" ? "fr" : "en";
  const L = T[lang];
  const book = findBookBySlug(slug);

  useEffect(() => {
    if (!book) return;
    // after the app has set the route's default title
    const id = setTimeout(() => { document.title = `${book.title} · ${book.author} | Quantrih`; }, 0);
    return () => clearTimeout(id);
  }, [book, lang]);

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <p className="text-[18px] text-slate-700">{L.notFound}</p>
        <Link to="/education" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1D6FA8] hover:underline"><ArrowLeft size={16} />{L.back}</Link>
      </div>
    );
  }

  const cat = categoryOf(book);
  const accent = CAT_COLOR[cat];
  const base = book.coverColor ?? PALETTE.navy;
  const detail = lang === "fr" ? detailOf(book.title) : undefined;
  const short = SUMMARY_TRANSLATIONS[book.title]?.[language] ?? (lang === "fr" ? book.summaryFr : book.summary);
  const ideas = detail?.ideas ?? (lang === "fr" ? book.keyTakeawaysFr : book.keyTakeaways) ?? [];
  const tag = lang === "fr" ? book.tagFr : book.tag;
  const catName = CATEGORIES.find((c) => c.id === cat)![lang];

  const byAuthor = otherBooksByAuthor(book);
  const related = byAuthor.length ? byAuthor : LIBRARY.filter((b) => b !== book && categoryOf(b) === cat).slice(0, 12);
  const multi = authorsOf(book).length > 1;

  return (
    <div className="w-full pb-24 -mt-4 lg:-mt-6 font-sans">
      {/* coloured head: cover on the left, summary on the right */}
      <section className="relative overflow-hidden text-white"
        style={{ background: `radial-gradient(900px 500px at 85% 10%, ${accent}55, transparent 60%), linear-gradient(135deg, ${base} 0%, #0A1E2D 100%)` }}>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-14 pt-8 pb-14 lg:pb-20">
          <Link to="/education" className="inline-flex items-center gap-2 text-[15px] font-semibold text-white/80 hover:text-white"><ArrowLeft size={16} />{L.back}</Link>
          <div className="mt-8 grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-start">
            <div className="flex justify-center lg:justify-start"><BigCover book={book} /></div>
            <div className="max-w-3xl">
              <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/80">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><span className="w-2 h-2 rounded-full" style={{ background: accent }} />{catName}</span>
                <span className="rounded-full bg-white/15 px-3 py-1">{tag}</span>
                {book.origin === "fr" && <span className="rounded-full bg-white/15 px-3 py-1">{L.french}</span>}
              </p>
              <h1 className="mt-4 text-[32px] md:text-[44px] leading-[1.08] font-bold tracking-tight !text-white">{book.title}</h1>
              <p className="mt-3 text-[18px] md:text-[20px] font-semibold text-white/90">{book.author} <span className="font-medium text-white/60">· {L.published} {book.year}</span></p>

              <h2 className="mt-8 text-[13px] font-bold uppercase tracking-[0.18em] !text-white/70">{L.about}</h2>
              <p className="mt-2 text-[17px] md:text-[18px] leading-relaxed text-white/90">{detail?.about ?? short}</p>

              {ideas.length > 0 && (
                <>
                  <h2 className="mt-8 text-[13px] font-bold uppercase tracking-[0.18em] !text-white/70">{L.ideas}</h2>
                  <ul className="mt-3 grid gap-2.5">
                    {ideas.map((idea) => (
                      <li key={idea} className="flex gap-3 text-[16px] md:text-[17px] leading-snug text-white/90">
                        <span className="mt-[7px] w-2 h-2 shrink-0 rounded-full" style={{ background: accent }} />{idea}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <a href={findLink(book)} target="_blank" rel="noopener noreferrer"
                className="mt-9 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-[#0A1E2D] text-[15px] font-semibold hover:bg-white/90 transition-colors">
                {L.find} <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* other books by the author, or on the same topic */}
      {related.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-14 pt-14">
          <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-slate-950">
            {byAuthor.length ? (multi ? L.byMany : `${L.by} ${book.author}`) : L.same}
            <span className="ml-2 text-[15px] font-medium text-slate-400 tabular-nums">{related.length}</span>
          </h2>
          <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
            {related.map((b, i) => (
              <BookCard key={b.title} book={b} index={i} find={L.find}
                summary={SUMMARY_TRANSLATIONS[b.title]?.[language] ?? (lang === "fr" ? b.summaryFr : b.summary)}
                tag={lang === "fr" ? b.tagFr : b.tag} tagColor={CAT_COLOR[categoryOf(b)]} showDrawn />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
