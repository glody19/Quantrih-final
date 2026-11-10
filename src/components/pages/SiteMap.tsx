import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { SEO_ROUTES, SEO_SECTIONS } from "../../seo/routes";

/** Human-readable sitemap: every indexable page grouped by section (mirrors sitemap.xml). */
export function SiteMap({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-24">
        <div className="pb-6 border-b border-border">
          <h1 className="text-3xl md:text-[2.6rem] leading-tight font-semibold tracking-tight text-text">{lang === "fr" ? "Plan du site" : "Sitemap"}</h1>
          <p className="text-base md:text-lg text-text-3 mt-2">
            {lang === "fr" ? "Toutes les pages de Quantrih, classées par rubrique." : "Every Quantrih page, organised by section."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-10">
          {SEO_SECTIONS.map((sec, si) => {
            const items = SEO_ROUTES.filter((r) => r.indexable && r.section === sec.id);
            if (!items.length) return null;
            return (
              <motion.section
                key={sec.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: si * 0.05 }}
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-pv-blue mb-3">{sec[lang]}</h2>
                <ul className="divide-y divide-border border-y border-border">
                  {items.map((r) => (
                    <li key={r.path}>
                      <a
                        href={r.path}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(r.path === "/" ? "home" : r.path.slice(1));
                        }}
                        className="group flex items-start justify-between gap-4 py-4"
                      >
                        <span>
                          <span className="block text-lg font-medium text-text group-hover:text-pv-blue transition-colors">{r[lang].h1}</span>
                          <span className="block text-sm text-text-3 mt-0.5 leading-relaxed">{r[lang].description}</span>
                        </span>
                        <ArrowRight size={18} className="shrink-0 mt-1.5 text-text-4 group-hover:text-pv-blue group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
