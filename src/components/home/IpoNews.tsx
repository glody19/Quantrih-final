import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

type News = { id: string; headline: string; source: string; url: string; datetime: number; image: string | null };

// Headlines that are really about listings, not about any company that happens to mention an IPO
const IPO_WORDS = /\b(ipo|ipos|initial public offering|goes public|going public|public debut|market debut|listing|lists on|files to list|files for|priced|pricing|direct listing|spac)\b/i;

/**
 * Latest news about initial public offerings: one lead story with its photo, then a list.
 * Live from /api/market-news; the section hides itself when nothing relevant comes back.
 */
export function IpoNews({ fr, stacked = false }: { fr: boolean; stacked?: boolean }) {
  const [items, setItems] = useState<News[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(["IPO", "initial public offering", "IPO filing"].map((q) =>
      fetch(`/api/market-news?q=${encodeURIComponent(q)}`).then((r) => (r.ok ? r.json() : [])).catch(() => [])
    )).then((lists: any[]) => {
      if (!alive) return;
      const seen = new Set<string>();
      const all = lists.flat().filter((n: any) => n?.headline && n?.url && IPO_WORDS.test(n.headline) && !seen.has(n.headline) && seen.add(n.headline));
      all.sort((a: any, b: any) => (b.datetime || 0) - (a.datetime || 0));
      // the lead story should have a photo
      const lead = all.findIndex((n: any) => n.image);
      if (lead > 0) all.unshift(all.splice(lead, 1)[0]);
      setItems(all.slice(0, 7));
    });
    return () => { alive = false; };
  }, []);

  if (!items || items.length < 3) return null;
  const [first, ...all] = items;
  // stacked (beside another block): the lead story on top, then a shorter list
  const rest = stacked ? all.slice(0, 4) : all;
  const when = (t: number) => new Date(t * 1000).toLocaleDateString(fr ? "fr-BE" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className={stacked ? "grid gap-3" : "grid lg:grid-cols-[1.15fr_1fr] gap-6 items-stretch"}>
      <motion.a
        href={first.url} target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        className={`group relative rounded-[1.5rem] overflow-hidden bg-[#0B2233] ${stacked ? "min-h-[220px]" : "min-h-[320px]"} flex items-end shadow-[0_18px_50px_-36px_rgba(6,18,27,0.5)]`}
      >
        {first.image && <img src={first.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
        <span className="absolute inset-0 bg-gradient-to-t from-[#06111A] via-[#06111A]/60 to-transparent" />
        <span className="relative p-6 md:p-8 text-white">
          <span className="inline-block mb-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold uppercase tracking-[0.14em]">IPO</span>
          <span className="block text-xl md:text-2xl font-semibold leading-snug group-hover:underline decoration-white/40 underline-offset-4">{first.headline}</span>
          <span className="mt-3 block text-[13px] text-white/70">{first.source} · {when(first.datetime)}</span>
        </span>
      </motion.a>
      <ul className="grid gap-2.5 content-start">
        {rest.map((n, i) => (
          <motion.li key={n.id || n.url} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}>
            <a href={n.url} target="_blank" rel="noopener noreferrer" className="group flex gap-4 items-center rounded-2xl bg-white p-3 pr-4 shadow-[0_12px_30px_-26px_rgba(6,18,27,0.5)] hover:shadow-[0_16px_34px_-22px_rgba(6,18,27,0.45)] transition-shadow">
              <span className="w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-[#E8EFF8]">
                {n.image && <img src={n.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1B3F72]">{n.headline}</span>
                <span className="mt-1 block text-[12px] text-slate-500">{n.source} · {when(n.datetime)}</span>
              </span>
              <ArrowUpRight size={16} className="shrink-0 text-slate-400 group-hover:text-[#1B3F72]" />
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
