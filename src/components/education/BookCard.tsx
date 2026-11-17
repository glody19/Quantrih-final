import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Book } from "../../data/books";

/**
 * Real cover only. Order of attempts: the cover registered for the book's ISBN on Open Library,
 * then the cover of the first Open Library edition matching the title and the author's surname.
 * If neither exists, the book is not shown at all (no drawn placeholder).
 */
const searchCache = new Map<string, Promise<string | null>>();
let running = 0;
const queue: (() => void)[] = [];
const slot = () => new Promise<void>((res) => { if (running < 4) { running++; res(); } else queue.push(() => { running++; res(); }); });
const release = () => { running--; const next = queue.shift(); if (next) next(); };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const surname = (author: string) => norm(author.split(/,|&| and | et /)[0].trim().split(/\s+/).pop() || "");

function searchCover(book: Book): Promise<string | null> {
  const key = `${book.title}|${book.author}`;
  const hit = searchCache.get(key);
  if (hit) return hit;
  const p = (async () => {
    try {
      const stored = sessionStorage.getItem("cover:" + key);
      if (stored !== null) return stored || null;
    } catch { /* storage unavailable */ }
    await slot();
    try {
      const title = book.title.split(":")[0];
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(book.author.split(/,|&| and | et /)[0])}&limit=5&fields=cover_i,author_name,title`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const j = await r.json();
      const sn = surname(book.author);
      const doc = (j.docs || []).find((d: any) => d.cover_i && (d.author_name || []).some((a: string) => norm(a).includes(sn)));
      const src = doc ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : "";
      try { sessionStorage.setItem("cover:" + key, src); } catch { /* ignore */ }
      return src || null;
    } catch {
      return null;
    } finally {
      release();
    }
  })();
  searchCache.set(key, p);
  return p;
}

type CoverState = { src: string | null; stage: "isbn" | "search" | "none" };

function useCover(book: Book) {
  const [state, setState] = useState<CoverState>(() =>
    book.isbn ? { src: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`, stage: "isbn" } : { src: null, stage: "search" }
  );
  useEffect(() => {
    if (state.stage !== "search" || state.src) return;
    let alive = true;
    searchCover(book).then((src) => { if (alive) setState(src ? { src, stage: "search" } : { src: null, stage: "none" }); });
    return () => { alive = false; };
  }, [state.stage, state.src, book]);
  const fail = () => setState((s) => (s.stage === "isbn" ? { src: null, stage: "search" } : { src: null, stage: "none" }));
  return { ...state, fail };
}

export function BookCard({ book, summary, tag, tagColor, find, index }: {
  book: Book; summary: string; tag: string; tagColor: string; find: string; index: number;
}) {
  const { src, stage, fail } = useCover(book);
  const [loaded, setLoaded] = useState(false);
  const link = book.link === "#" || book.link.includes("amazon.")
    ? `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`
    : book.link;

  if (stage === "none") return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={loaded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={loaded ? "group flex flex-col" : "group flex flex-col pointer-events-none"}
      style={loaded ? undefined : { position: "absolute", width: 1, height: 1, overflow: "hidden" }}
    >
      <a href={link} target="_blank" rel="noopener noreferrer" title={summary} className="relative mx-auto w-[148px] h-[222px]">
        {/* static cover: no page turn on hover, only a gentle lift */}
        <div className="absolute inset-0 rounded-r-md rounded-l-sm overflow-hidden shadow-[8px_12px_26px_rgba(6,18,27,0.32)] bg-slate-100 transition-transform duration-300 group-hover:-translate-y-1">
          {src && (
            <img src={src} alt={book.title} loading="lazy" referrerPolicy="no-referrer"
              onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) fail(); else setLoaded(true); }}
              onError={fail} className="w-full h-full object-cover" />
          )}
          <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
          <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        </div>
      </a>
      <div className="pt-4 flex flex-col gap-1 flex-grow">
        <h4 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1D6FA8] transition-colors">{book.title}</h4>
        <p className="text-[13.5px] text-[#1B3F72] line-clamp-1">{book.author} · <span className="tabular-nums text-slate-500">{book.year}</span>{book.origin === "fr" && <span className="text-slate-500"> · FR</span>}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5 truncate font-medium text-slate-600"><span className="w-2 h-2 shrink-0 rounded-full" style={{ background: tagColor }} />{tag}</span>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-[#1D6FA8] hover:underline shrink-0">{find} <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </motion.article>
  );
}
