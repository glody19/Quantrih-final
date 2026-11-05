import React, { useState, useEffect } from "react";
import { Activity, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";
import { AtomAnimation } from "../ui/AtomAnimation";
import { HexBadgeOrbit } from "../ui/HexBadgeOrbit";


interface PageInfo {
  title: string;
  id: string;
  color: string;
  cta: string;
  desc: string;
  useLaptop?: boolean;
}


function TypewriterText({ text }: { text: string }) {
  return (
    <p className="text-slate-300 text-[11px] sm:text-xs lg:text-sm leading-relaxed sm:leading-relaxed">
      {text}
    </p>
  );
}

function ModuleCard({ p, i, onGoPage }: { p: PageInfo; i: number; onGoPage: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white/[0.03] border border-white/10 hover:border-white/25 rounded-[2rem] p-4 sm:p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_30px_rgba(0,0,0,0.5)] overflow-hidden w-full h-full min-h-[220px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className={cn("absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500", p.color.replace('text-', 'bg-'))} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        <h4 className="text-[14px] sm:text-xl lg:text-2xl font-extrabold tracking-tight mb-2 sm:mb-3 text-blue-500 uppercase transition-all">
          {p.title}
        </h4>
        <div className="flex-1">
          <TypewriterText text={p.desc} />
        </div>
      </div>
      
      <div className="relative z-10 mt-3 sm:mt-5 pt-1 sm:pt-2 flex justify-center">
        <button 
          onClick={() => onGoPage(p.id)}
          className="px-4 sm:px-6 py-1.5 sm:py-2.5 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 hover:border-blue-500 text-slate-300 hover:text-white font-bold text-[10px] sm:text-xs rounded-full transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg"
        >
          {p.cta}
          <svg className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export function Home({ onGoPage }: { onGoPage: (id: string) => void }) {
  const { language, t } = useTranslation();
  const [heroHovered, setHeroHovered] = useState(false);

  const ObjectPages: PageInfo[] = [
    { 
      title: t("home.pages.asset_allocation.title"), 
      id: 'asset-allocation', 
      color: 'text-blue-400',
      cta: t("home.pages.asset_allocation.cta"),
      desc: t("home.pages.asset_allocation.desc")
    },
    {
      title: t("home.pages.portfolio_backtest.title"),
      id: 'portfolio-backtest',
      color: 'text-rose-400',
      cta: t("home.pages.portfolio_backtest.cta"),
      desc: t("home.pages.portfolio_backtest.desc"),
      useLaptop: true
    },
    { 
      title: t("home.pages.tactical_allocation.title"), 
      id: 'tactical-allocation', 
      color: 'text-orange-400',
      cta: t("home.pages.tactical_allocation.cta"),
      desc: t("home.pages.tactical_allocation.desc")
    },
    { 
      title: t("home.pages.montecarlo.title"), 
      id: 'montecarlo', 
      color: 'text-emerald-400',
      cta: t("home.pages.montecarlo.cta"),
      desc: t("home.pages.montecarlo.desc")
    }
  ];

  return (
    
      <div
        className="flex flex-col w-full min-h-[100dvh] relative overflow-hidden selection:bg-blue-500/30"
        style={{ background: '#050507' }}>

        {/* Soft violet glow behind the hero, fading to pure black */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 45% at 70% 18%, rgba(91,75,219,0.22) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-[1600px] flex-1 flex flex-col mx-auto">
          
          {/* Top Hero Section */}
          <div 
            className="flex-1 flex flex-col lg:flex-row w-full min-h-[75vh]"
            onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
        >
          {/* Left Text Side */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-24 z-20 pt-20 lg:pt-0">
            <div className="relative perspective-1000">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-10 pt-16 sm:pt-0 lg:pt-12"
              >
                <h1 className="text-[18vw] sm:text-[11vw] md:text-8xl lg:text-[150px] max-w-[100vw] break-keep whitespace-nowrap font-bold leading-[0.85] tracking-tighter text-white overflow-visible">
                  Quantrih
                </h1>
                <h2 id="hero-gradient-title" className="text-4xl lg:text-6xl font-semibold leading-none tracking-tighter mt-5 text-white/85">
                  {t("home.hero.title2")}
                </h2>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl"
              >
                <p className="text-white/55 font-normal text-base md:text-lg leading-relaxed border-l border-white/20 pl-5 py-1">
                  {t("home.hero.subtitle")}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Animation Side */}
          <div className="w-full lg:w-[55%] min-h-[40vh] lg:min-h-[75vh] relative z-10 flex items-center justify-center mt-10 lg:mt-32 xl:mt-40">
            <AtomAnimation isHovered={heroHovered} />
          </div>
        </div>

        {/* Why Backtest Before Investing? */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full px-6 lg:px-24 pt-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h4
              initial="hidden"
              whileInView="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.02 } }
              }}
              className="text-xl font-bold text-white mb-4"
            >
              {t("home.why_backtest.title")}
            </motion.h4>
            <motion.p
              initial="hidden"
              whileInView="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.003 } }
              }}
              className="text-slate-300 leading-relaxed"
            >
              {t("home.why_backtest.desc")}
            </motion.p>
          </div>
        </motion.div>

        {/* Feature Tools System Flow */}
        <div className="w-full relative py-20 lg:py-40 overflow-hidden bg-transparent">

          <div className="w-full px-6 lg:px-24 z-20 relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-16 text-center"
            >
              <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 transition-colors duration-300">
                {t("home.tools.title")}
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {t("home.tools.subtitle")}
              </p>
            </motion.div>

            {/* 4 modules grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-[90rem] mx-auto relative z-10">
              {ObjectPages.map((p, i) => (
                <ModuleCard key={i} p={p} i={i} onGoPage={onGoPage} />
              ))}
            </div>
          </div>
        </div>

          {/* Global Interactive Navigation HexBadge Orbit map */}
          <div className="w-full pt-24 pb-20 md:pt-28 md:pb-24 lg:pt-36 lg:pb-32 relative z-20 flex flex-col items-center justify-center">
            <h3 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Quantrih</h3>
            <p className="text-slate-300 mb-12 text-center max-w-md px-6 leading-relaxed font-bold">
              {t("home.explore_pages")}
            </p>
            <HexBadgeOrbit onNavigate={onGoPage} />
          </div>

          {/* Support Section */}
          <div className="w-full px-6 lg:px-24 pt-16 pb-20 lg:pt-24 lg:pb-32 z-20">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h3 className="text-white text-lg sm:text-xl lg:text-3xl font-black tracking-widest mb-4 uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                {t("home.support.title")}
              </h3>
              <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed font-extrabold mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {t("home.support.desc")}
              </p>
              <div className="flex flex-col items-center justify-center gap-4">
                <button 
                  onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.03] text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_35px_rgba(37,99,235,0.35)] transition-all duration-300 text-sm sm:text-base lg:text-lg font-black tracking-wide text-center uppercase"
                >
                  {t("home.support.button")}
                </button>
                <div className="text-xs sm:text-sm lg:text-base text-slate-300 font-mono mt-2">
                  {t("home.support.inquiry")}: <a href="mailto:contact@quantrih.com" className="text-blue-500 hover:text-blue-400 transition-colors font-bold underline underline-offset-4">contact@quantrih.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Branding Section */}
        <div className="w-full pb-16 z-20 mt-12 max-sm:[zoom:0.4]">
          <div className="px-6 lg:px-24 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-white/80 text-[10px] sm:text-xs font-sans tracking-wide max-w-3xl mx-auto leading-relaxed">
              {t("home.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    
  );
}
