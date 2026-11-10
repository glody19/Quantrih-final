import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { AtomAnimation } from "../ui/AtomAnimation";
import { HexBadgeOrbit } from "../ui/HexBadgeOrbit";
import { AllocationsTicker } from "../home/AllocationsTicker";
import { DeviceShowcase } from "../home/DeviceShowcase";

// White background with a fine square grid ("petits carreaux")
const GRID_BG: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  backgroundImage:
    "linear-gradient(to right, rgba(15,23,42,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.055) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

interface PageInfo {
  title: string;
  id: string;
  cta: string;
  desc: string;
}

function ModuleCard({ p, i, onGoPage }: { p: PageInfo; i: number; onGoPage: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
      className="group relative bg-white border border-border hover:border-pv-blue/40 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_40px_-16px_rgba(15,23,42,0.18)] w-full h-full min-h-[220px]"
    >
      <div className="flex-1 flex flex-col">
        <h4 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight mb-3 text-pv-blue uppercase font-sans">{p.title}</h4>
        <p className="text-text-2 text-sm lg:text-base leading-relaxed">{p.desc}</p>
      </div>
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => onGoPage(p.id)}
          className="px-6 py-2.5 bg-surface-2 hover:bg-pv-blue hover:text-white border border-border hover:border-pv-blue text-text font-bold text-sm rounded-full transition-all duration-300 inline-flex items-center gap-2"
        >
          {p.cta}
          <ArrowRight size={15} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        </button>
      </div>
    </motion.div>
  );
}

export function Home({ onGoPage }: { onGoPage: (id: string) => void }) {
  const { language, t } = useTranslation();
  const [heroHovered, setHeroHovered] = useState(false);
  const fr = language === "fr";

  const pages: PageInfo[] = [
    { title: t("home.pages.asset_allocation.title"), id: "asset-allocation", cta: t("home.pages.asset_allocation.cta"), desc: t("home.pages.asset_allocation.desc") },
    { title: t("home.pages.portfolio_backtest.title"), id: "portfolio-backtest", cta: t("home.pages.portfolio_backtest.cta"), desc: t("home.pages.portfolio_backtest.desc") },
    { title: t("home.pages.tactical_allocation.title"), id: "tactical-allocation", cta: t("home.pages.tactical_allocation.cta"), desc: t("home.pages.tactical_allocation.desc") },
    { title: t("home.pages.montecarlo.title"), id: "montecarlo", cta: t("home.pages.montecarlo.cta"), desc: t("home.pages.montecarlo.desc") },
  ];

  return (
    <div className="flex flex-col w-full min-h-[100dvh] relative overflow-hidden text-text" style={GRID_BG}>
      <div className="relative z-10 w-full max-w-[1600px] flex-1 flex flex-col mx-auto">
        {/* Hero */}
        <div
          className="flex flex-col lg:flex-row w-full min-h-[70vh]"
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
        >
          <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-24 z-20 pt-16 lg:pt-0">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-10">
              <h1 className="font-sans text-[18vw] sm:text-[10vw] md:text-8xl lg:text-[140px] whitespace-nowrap font-semibold leading-[0.85] tracking-tighter text-text">Quantrih</h1>
              <h2 className="font-sans text-3xl lg:text-4xl font-semibold leading-none tracking-tighter mt-4 text-pv-blue">{t("home.hero.title2") + "."}</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="max-w-xl">
              <p className="text-text-2 font-medium text-2xl md:text-3xl leading-relaxed border-l-2 border-border-2 pl-6 py-2">{t("home.hero.subtitle")}</p>
            </motion.div>
          </div>
          <div className="w-full lg:w-[55%] min-h-[40vh] lg:min-h-[70vh] relative z-10 flex items-center justify-center">
            <AtomAnimation isHovered={heroHovered} variant="light" />
          </div>
        </div>
      </div>

      {/* Ten famous allocations, year-to-date (real prices) */}
      <div className="relative z-10 w-full mt-4">
        <AllocationsTicker label={fr ? "Allocations · depuis le 1er janv." : "Allocations · YTD"} />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] flex-1 flex flex-col mx-auto">
        {/* Why backtest */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-full px-6 lg:px-24 pt-24">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-text mb-4">{t("home.why_backtest.title")}</h3>
            <p className="text-text-2 text-lg leading-relaxed">{t("home.why_backtest.desc")}</p>
          </div>
        </motion.div>

        {/* Demo: desktop + laptop showing real backtest results */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="w-full px-6 lg:px-24 pt-16">
          <DeviceShowcase
            desktopSrc="/media/demo-desktop.png"
            laptopSrc="/media/demo-laptop.png"
            desktopAlt={fr ? "Résultats d'un backtest Quantrih : synthèse et croissance du portefeuille" : "Quantrih backtest results: summary and portfolio growth"}
            laptopAlt={fr ? "Résultats d'un backtest Quantrih : pertes maximales" : "Quantrih backtest results: drawdowns"}
          />
        </motion.div>

        {/* Tools & strategies */}
        <div className="w-full py-24 lg:py-32 px-6 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="mb-14 text-center">
            <h3 className="text-3xl md:text-5xl font-semibold text-text tracking-tight mb-4">{t("home.tools.title")}</h3>
            <p className="text-text-2 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{t("home.tools.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full max-w-[90rem] mx-auto">
            {pages.map((p, i) => (
              <ModuleCard key={p.id} p={p} i={i} onGoPage={onGoPage} />
            ))}
          </div>
        </div>

        {/* Explore the other pages */}
        <div className="w-full pt-8 pb-24 flex flex-col items-center justify-center">
          <h3 className="text-text text-3xl md:text-4xl font-semibold tracking-tight mb-4">Quantrih</h3>
          <p className="text-text-2 mb-12 text-center max-w-md px-6 leading-relaxed font-semibold">{t("home.explore_pages")}</p>
          <HexBadgeOrbit onNavigate={onGoPage} />
        </div>

        {/* Support */}
        <div className="w-full px-6 lg:px-24 pt-8 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-text text-xl lg:text-3xl font-semibold tracking-tight mb-4">{t("home.support.title")}</h3>
            <p className="text-text-2 text-base lg:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">{t("home.support.desc")}</p>
            <button
              onClick={() => window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer")}
              className="px-10 py-4 bg-pv-blue hover:bg-pv-blue-d text-white rounded-full transition-all duration-300 text-base font-bold tracking-wide uppercase"
            >
              {t("home.support.button")}
            </button>
            <div className="text-sm text-text-3 mt-4">
              {t("home.support.inquiry")}: <a href="mailto:contact@quantrih.com" className="text-pv-blue font-semibold underline underline-offset-4">contact@quantrih.com</a>
            </div>
          </div>
        </div>

        <div className="w-full pb-14 px-6 lg:px-24">
          <p className="text-text-3 text-xs max-w-3xl mx-auto leading-relaxed text-center">{t("home.disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
