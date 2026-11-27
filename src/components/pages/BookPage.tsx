import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { CATEGORIES, categoryOf, findBookBySlug, otherBooksByAuthor, authorsOf, LIBRARY } from "../../data/learning";
import { SUMMARY_TRANSLATIONS, type Book } from "../../data/books";
import { detailOf } from "../../data/bookDetails";
import { BookCard, useCover } from "../education/BookCard";
import { useBookInfo } from "../../lib/bookInfo";

const T = {
  fr: { back: "Bibliothèque", about: "De quoi parle le livre", ideas: "Idées clés", forWho: "Pour qui", find: "Trouver le livre", by: "Autres livres de", byMany: "Autres livres des auteurs", same: "Dans le même thème", notFound: "Ce livre n'est pas dans la bibliothèque.", french: "En français", published: "Première parution",
    sheet: "Fiche du livre", publisher: "Éditeur", pages: "Pages", edition: "Édition consultée", isbn: "ISBN", topic: "Thème", rating: "Note des lecteurs", reviews: "avis",
    blurb: "Présentation de l'éditeur", source: "Source", more: "Lire la suite", less: "Réduire", inEnglish: "en anglais", loading: "Chargement des informations de l'éditeur…" },
  en: { back: "Library", about: "What the book is about", ideas: "Key ideas", forWho: "Who it is for", find: "Find the book", by: "More books by", byMany: "More books by the authors", same: "On the same topic", notFound: "This book is not in the library.", french: "In French", published: "First published",
    sheet: "Book details", publisher: "Publisher", pages: "Pages", edition: "Edition shown", isbn: "ISBN", topic: "Topic", rating: "Reader rating", reviews: "reviews",
    blurb: "Publisher's description", source: "Source", more: "Read more", less: "Show less", inEnglish: "in English", loading: "Loading publisher details…" },
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
    <div className="relative w-[190px] sm:w-[240px] lg:w-full aspect-[2/3] rounded-r-lg rounded-l-sm overflow-hidden shadow-[10px_16px_36px_rgba(15,23,42,0.28)] bg-slate-100">
      {src && !drawn && (
        <img src={src} alt={book.title} referrerPolicy="no-referrer"
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) fail(); else setLoaded(true); }}
          onError={fail} className={"w-full h-full object-cover transition-opacity duration-500 " + (loaded ? "opacity-100" : "opacity-0")} />
      )}
      {drawn && (
        <div className="absolute inset-0 flex flex-col justify-between p-7 text-white" style={{ background: book.coverColor ?? "#0B3558" }}>
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
        <Link to="/education" className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-900 hover:underline"><ArrowLeft size={16} />{L.back}</Link>
      </div>
    );
  }

  const cat = categoryOf(book);
  const detail = lang === "fr" ? detailOf(book.title) : undefined;
  const short = SUMMARY_TRANSLATIONS[book.title]?.[language] ?? (lang === "fr" ? book.summaryFr : book.summary);
  const ideas = detail?.ideas ?? (lang === "fr" ? book.keyTakeawaysFr : book.keyTakeaways) ?? [];
  const tag = lang === "fr" ? book.tagFr : book.tag;
  const catName = CATEGORIES.find((c) => c.id === cat)![lang];

  const byAuthor = otherBooksByAuthor(book);
  const related = byAuthor.length ? byAuthor : LIBRARY.filter((b) => b !== book && categoryOf(b) === cat).slice(0, 12);
  const multi = authorsOf(book).length > 1;

  return (
    <div className="w-full pb-24 font-sans bg-white">
      <article className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 pt-6">
        <Link to="/education" className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />{L.back}</Link>

        <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="flex justify-center lg:block"><BigCover book={book} /></div>
            <a href={findLink(book)} target="_blank" rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 h-12 rounded-full bg-slate-900 text-white text-[15px] font-semibold hover:bg-slate-700 transition-colors">
              {L.find} <ArrowUpRight size={16} />
            </a>
            <div className="hidden lg:block"><BookSheet book={book} lang={lang} L={L} catName={catName} tag={tag} /></div>
          </aside>

          <div className="min-w-0 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {catName}{book.origin === "fr" && <> · {L.french}</>}
            </p>
            <h1 className="mt-3 text-[32px] md:text-[44px] leading-[1.08] font-bold tracking-tight text-slate-950">{book.title}</h1>
            <p className="mt-3 text-[18px] md:text-[20px] font-semibold text-slate-800">{book.author} <span className="font-medium text-slate-500">· {book.year}</span></p>
            <p className="mt-5 text-[18px] md:text-[19px] leading-relaxed text-slate-700">{short}</p>

            <section className="mt-10 pt-8 border-t border-slate-200">
              <h2 className="text-[22px] font-semibold tracking-tight text-slate-950">{L.about}</h2>
              <p className="mt-3 text-[17px] leading-[1.75] text-slate-800">{detail?.about ?? short}</p>
            </section>

            {ideas.length > 0 && (
              <section className="mt-10 pt-8 border-t border-slate-200">
                <h2 className="text-[22px] font-semibold tracking-tight text-slate-950">{L.ideas}</h2>
                <ol className="mt-4 grid gap-4">
                  {ideas.map((idea, i) => (
                    <li key={idea} className="flex gap-4 text-[17px] leading-snug text-slate-800">
                      <span className="w-7 shrink-0 text-[15px] font-semibold tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>{idea}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {detail?.forWho && (
              <section className="mt-10 pt-8 border-t border-slate-200">
                <h2 className="text-[22px] font-semibold tracking-tight text-slate-950">{L.forWho}</h2>
                <p className="mt-3 text-[17px] leading-[1.75] text-slate-800">{detail.forWho}</p>
              </section>
            )}

            <PublisherBlurb book={book} lang={lang} L={L} />
            <div className="lg:hidden mt-10"><BookSheet book={book} lang={lang} L={L} catName={catName} tag={tag} /></div>
          </div>
        </div>
      </article>

      {/* other books by the author, or on the same topic */}
      {related.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-slate-950">
            {byAuthor.length ? (multi ? L.byMany : `${L.by} ${book.author}`) : L.same}
            <span className="ml-2 text-[15px] font-medium text-slate-400 tabular-nums">{related.length}</span>
          </h2>
          <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
            {related.map((b, i) => (
              <BookCard key={b.title} book={b} index={i} find={L.find}
                summary={SUMMARY_TRANSLATIONS[b.title]?.[language] ?? (lang === "fr" ? b.summaryFr : b.summary)}
                tag={lang === "fr" ? b.tagFr : b.tag} showDrawn />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type Labels = (typeof T)["fr"] | (typeof T)["en"];

/** Publisher facts from our data, completed by Open Library and Google Books. */
function BookSheet({ book, lang, L, catName, tag }: { book: Book; lang: "fr" | "en"; L: Labels; catName: string; tag: string }) {
  const info = useBookInfo(book, lang);
  const rows: [string, React.ReactNode][] = [
    [L.published, book.year],
    [L.topic, `${catName} · ${tag}`],
  ];
  if (info?.publisher) rows.push([L.publisher, info.publisher]);
  if (info?.pages) rows.push([L.pages, info.pages]);
  if (info?.published && !info.published.startsWith(book.year)) rows.push([L.edition, info.published]);
  if (info?.isbn ?? book.isbn) rows.push([L.isbn, <span className="tabular-nums">{info?.isbn ?? book.isbn}</span>]);
  if (info?.rating && (info.ratingsCount ?? 0) >= 3) rows.push([L.rating, `${info.rating.toFixed(1)} / 5 · ${info.ratingsCount} ${L.reviews}`]);
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 p-5">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">{L.sheet}</p>
      <dl className="mt-3 grid gap-2.5 text-[14.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[104px_1fr] gap-3">
            <dt className="text-slate-500">{k}</dt><dd className="text-slate-900 font-medium min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      {(info?.openLibraryUrl || info?.googleBooksUrl) && (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
          {info.openLibraryUrl && <a href={info.openLibraryUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-slate-950 hover:underline">Open Library ↗</a>}
          {info.googleBooksUrl && <a href={info.googleBooksUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-slate-950 hover:underline">Google Books ↗</a>}
        </p>
      )}
    </div>
  );
}

/** The publisher's own text, shown under our presentation when one of the two sources has it. */
function PublisherBlurb({ book, lang, L }: { book: Book; lang: "fr" | "en"; L: Labels }) {
  const info = useBookInfo(book, lang);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [book.title]);
  const text = info?.description;
  if (!text || text.length < 120) return null;
  const long = text.length > 700;
  const english = info?.descriptionLang === "en" || (info?.descriptionSource === "Open Library" && book.origin !== "fr");
  return (
    <section className="mt-10 pt-8 border-t border-slate-200">
      <h2 className="text-[22px] font-semibold tracking-tight text-slate-950">{L.blurb}</h2>
      <p className="mt-1 text-[13.5px] text-slate-500">{L.source} : {info?.descriptionSource}{lang === "fr" && english ? ` (${L.inEnglish})` : ""}</p>
      <div className={"relative mt-3 " + (long && !open ? "max-h-[260px] overflow-hidden" : "")}>
        {text.split(/\n{2,}/).map((para, i) => <p key={i} className="mt-3 first:mt-0 text-[16px] leading-[1.75] text-slate-700 whitespace-pre-line">{para}</p>)}
        {long && !open && <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />}
      </div>
      {long && <button onClick={() => setOpen((o) => !o)} className="mt-3 text-[15px] font-semibold text-slate-900 hover:underline">{open ? L.less : L.more}</button>}
    </section>
  );
}
