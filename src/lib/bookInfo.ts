import { useEffect, useState } from "react";
import type { Book } from "../data/books";

/**
 * Publisher facts and the publisher's description of a book, read in the visitor's browser from two free sources:
 * - Open Library (openlibrary.org), no key needed;
 * - Google Books (googleapis.com/books), works without a key within a small shared quota.
 *   Set VITE_GOOGLE_BOOKS_API_KEY in Vercel for a reliable quota of 1,000 requests a day.
 * Results are kept for the browser session. Any failure simply leaves the fields empty.
 */
export interface BookInfo {
  publisher?: string;
  pages?: number;
  published?: string;
  isbn?: string;
  description?: string;
  descriptionSource?: "Google Books" | "Open Library";
  descriptionLang?: string;
  rating?: number;
  ratingsCount?: number;
  subjects?: string[];
  openLibraryUrl?: string;
  googleBooksUrl?: string;
}

const GB_KEY = (import.meta as any).env?.VITE_GOOGLE_BOOKS_API_KEY as string | undefined;

const getJson = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};

/** Google Books descriptions are HTML: keep the paragraphs, drop the tags. */
const cleanHtml = (s: string) =>
  s.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n").trim();

const firstAuthor = (author: string) => author.split(/,|&| and | et /)[0].trim();
const surname = (author: string) => firstAuthor(author).split(/\s+/).pop() || "";

async function fromOpenLibrary(book: Book): Promise<Partial<BookInfo>> {
  const out: Partial<BookInfo> = {};
  let workKey: string | undefined;
  if (book.isbn) {
    const ed = await getJson(`https://openlibrary.org/isbn/${book.isbn}.json`).catch(() => null);
    if (ed) {
      out.publisher = ed.publishers?.[0];
      out.pages = ed.number_of_pages;
      out.published = ed.publish_date;
      workKey = ed.works?.[0]?.key;
      out.openLibraryUrl = `https://openlibrary.org${ed.key}`;
    }
  }
  if (!workKey) {
    const q = `title=${encodeURIComponent(book.title.split(":")[0])}&author=${encodeURIComponent(firstAuthor(book.author))}`;
    const s = await getJson(`https://openlibrary.org/search.json?${q}&limit=1&fields=key,first_publish_year,number_of_pages_median,publisher,isbn`).catch(() => null);
    const d = s?.docs?.[0];
    if (d) {
      workKey = d.key;
      out.pages ??= d.number_of_pages_median;
      out.publisher ??= d.publisher?.[0];
      out.isbn ??= d.isbn?.find((i: string) => i.length === 13);
      out.openLibraryUrl ??= `https://openlibrary.org${d.key}`;
    }
  }
  if (workKey) {
    const w = await getJson(`https://openlibrary.org${workKey}.json`).catch(() => null);
    const desc = typeof w?.description === "string" ? w.description : w?.description?.value;
    if (desc) { out.description = desc.replace(/\(\[source\]\[\d+\]\)[\s\S]*$/, "").replace(/-{3,}[\s\S]*$/, "").trim(); out.descriptionSource = "Open Library"; }
    out.subjects = (w?.subjects || []).slice(0, 8);
  }
  return out;
}

async function fromGoogleBooks(book: Book, lang: "fr" | "en"): Promise<Partial<BookInfo>> {
  const q = book.isbn ? `isbn:${book.isbn}` : `intitle:${book.title.split(":")[0]} inauthor:${surname(book.author)}`;
  const params = new URLSearchParams({ q, maxResults: "5", printType: "books" });
  if (book.origin === "fr" || lang === "fr") params.set("langRestrict", book.origin === "fr" ? "fr" : lang);
  if (GB_KEY) params.set("key", GB_KEY);
  let j = await getJson(`https://www.googleapis.com/books/v1/volumes?${params}`).catch(() => null);
  if (!j?.items?.length && params.has("langRestrict")) {
    params.delete("langRestrict");
    j = await getJson(`https://www.googleapis.com/books/v1/volumes?${params}`).catch(() => null);
  }
  const sn = surname(book.author).toLowerCase();
  const items = (j?.items || []).filter((it: any) => (it.volumeInfo?.authors || []).some((a: string) => a.toLowerCase().includes(sn)));
  // the edition with the longest description is usually the publisher's full text
  const best = items.sort((a: any, b: any) => (b.volumeInfo?.description?.length || 0) - (a.volumeInfo?.description?.length || 0))[0];
  const v = best?.volumeInfo;
  if (!v) return {};
  return {
    publisher: v.publisher,
    pages: v.pageCount,
    published: v.publishedDate,
    isbn: v.industryIdentifiers?.find((x: any) => x.type === "ISBN_13")?.identifier,
    description: v.description ? cleanHtml(v.description) : undefined,
    descriptionSource: v.description ? "Google Books" : undefined,
    descriptionLang: v.language,
    rating: v.averageRating,
    ratingsCount: v.ratingsCount,
    googleBooksUrl: v.infoLink,
  };
}

const cache = new Map<string, Promise<BookInfo>>();

export function loadBookInfo(book: Book, lang: "fr" | "en"): Promise<BookInfo> {
  const key = `bookinfo:${lang}:${book.title}|${book.author}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = (async () => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored) as BookInfo;
    } catch { /* storage unavailable */ }
    const [gb, ol] = await Promise.all([fromGoogleBooks(book, lang).catch(() => ({})), fromOpenLibrary(book).catch(() => ({}))]);
    const g = gb as Partial<BookInfo>, o = ol as Partial<BookInfo>;
    // Google Books usually has the publisher's text in the book's own language; Open Library fills the gaps.
    const useGoogle = !!g.description && (g.description.length >= 160 || !o.description);
    const info: BookInfo = {
      publisher: g.publisher ?? o.publisher,
      pages: g.pages || o.pages,
      published: o.published ?? g.published,
      isbn: book.isbn ?? g.isbn ?? o.isbn,
      description: useGoogle ? g.description : o.description,
      descriptionSource: useGoogle ? "Google Books" : o.description ? "Open Library" : undefined,
      descriptionLang: useGoogle ? g.descriptionLang : undefined,
      rating: g.rating,
      ratingsCount: g.ratingsCount,
      subjects: o.subjects,
      openLibraryUrl: o.openLibraryUrl,
      googleBooksUrl: g.googleBooksUrl,
    };
    try { sessionStorage.setItem(key, JSON.stringify(info)); } catch { /* ignore */ }
    return info;
  })();
  cache.set(key, p);
  return p;
}

export function useBookInfo(book: Book | undefined, lang: "fr" | "en") {
  const [info, setInfo] = useState<BookInfo | null>(null);
  useEffect(() => {
    setInfo(null);
    if (!book) return;
    let alive = true;
    loadBookInfo(book, lang).then((i) => { if (alive) setInfo(i); });
    return () => { alive = false; };
  }, [book, lang]);
  return info;
}
