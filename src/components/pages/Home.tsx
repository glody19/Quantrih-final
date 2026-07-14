import React, { useState, useEffect } from "react";
import { Activity, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";
import { AssetAllocationGraphic } from "../ui/AssetAllocationGraphic";
import { AtomAnimation } from "../ui/AtomAnimation";
import { LaptopDemo } from "../ui/LaptopDemo";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { HexBadgeOrbit } from "../ui/HexBadgeOrbit";
import datacenterBg from "../../assets/images/datacenter_background_1783804486565.jpg";

interface PageInfo {
  title: string;
  id: string;
  color: string;
  cta: string;
  desc: string;
  useLaptop?: boolean;
}

function FlowNode({ page, index, onGo }: { page: PageInfo, index: number, onGo: (id: string) => void }) {
  const isLeft = index % 2 === 0;

  return (
    <div className="relative w-full flex items-center justify-center min-h-[40vh] py-12 group">
      {/* Node Connection Line */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 w-full h-[2px] bg-surface-3 -translate-y-1/2 -z-10" />

      {/* Main Container */}
      <div className={cn("relative z-10 flex flex-col lg:flex-row w-full max-w-7xl mx-auto items-center gap-12 lg:gap-24", isLeft ? "lg:flex-row" : "lg:flex-row-reverse")}>
        
        {/* Text Side */}
        <div className={cn("flex-1 flex flex-col w-full px-6 lg:px-0", isLeft ? "lg:items-end text-left lg:text-right" : "lg:items-start text-left")}>
          <div className="flex items-center gap-3 mb-4">
            {!isLeft && (
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-2 border border-border shadow-inner", page.color)}>
                <span className="font-mono text-sm">{index + 1}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className={cn("text-xs font-mono font-bold tracking-wider uppercase", page.color)}>
                Phase 0{index + 1}
              </span>
              <h3 className="text-3xl font-semibold text-text tracking-tight mt-1">{page.title}</h3>
            </div>
            {isLeft && (
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-2 border border-border shadow-inner", page.color)}>
                <span className="font-mono text-sm">{index + 1}</span>
              </div>
            )}
          </div>
          
          <p className="text-text-3 text-lg leading-relaxed max-w-xl font-medium mb-8">
            {page.desc}
          </p>
          
          <button
            onClick={() => onGo(page.id)}
            className={cn(
              "group/btn relative px-8 py-4 rounded-full font-bold text-sm tracking-wide overflow-hidden transition-all duration-300",
              "border shadow-lg hover:shadow-xl hover:-translate-y-0.5",
              page.color.replace('text-', 'bg-').replace('400', '500/10'),
              page.color.replace('text-', 'border-').replace('400', '500/30'),
              page.color.replace('text-', 'hover:bg-').replace('400', '500/20')
            )}
          >
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-text">{page.cta}</span>
              <Activity className={cn("w-4 h-4 transition-transform group-hover/btn:translate-x-1", page.color)} />
            </div>
            <div className={cn("absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity blur-xl", page.color.replace('text-', 'bg-'))} />
          </button>
        </div>

        {/* Visual / Board Side */}
        <div className={cn("flex w-full lg:w-1/2 relative px-6 lg:px-0", isLeft ? "justify-center lg:justify-start lg:pl-24" : "justify-center lg:justify-end lg:pr-24")}>
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px] origin-center transition-transform hover:scale-105 duration-700 ease-out">
            
            {page.useLaptop ? (
               <div className="relative w-full transform scale-[0.85] origin-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <LaptopDemo />
               </div>
            ) : (
              <div className="w-full aspect-[16/10] sm:aspect-video rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border-t border-l border-white/10 shadow-[0_30px_100px_-20px_rgba(14,165,233,0.2)] overflow-hidden flex flex-col relative group hover:border-white/20 transition-all duration-700">
                
                {/* Subtle Grid Background inside board */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>
                <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-1/4 w-1/2 h-full bg-gradient-to-t from-blue-500/10 to-transparent blur-3xl opacity-30"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                {/* Header Bar */}
                <div className="border-b border-border-2/60 bg-surface-3/80 p-4 flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-[2rem] flex items-center justify-center shadow-inner">
                    <Activity className={cn("w-5 h-5", page.color)} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-sans font-semibold text-text tracking-tight leading-tight">{page.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", page.color.replace('text-', 'bg-'))}></div>
                      <span className="text-xs text-slate-200 font-mono">MODULE_ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Body Content / Animation */}
                <div className="flex-1 w-full relative z-10 p-5 flex flex-col justify-center">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed mb-4 text-center max-w-[80%] mx-auto">
                    {page.desc}
                  </p>
                  
                  <div className="w-full flex-1 rounded-3xl bg-slate-950/50 border border-border/80 shadow-inner flex overflow-hidden">
                    {/* Chart/UI Animation based on module index */}
                    {index === 0 && (
                      <div className="flex-1 w-full h-full p-2 flex items-center justify-center">
                  <div className="flex-1 w-full h-full p-2 flex items-center justify-center">
                    <img 
                      src="/allocation_chart.jpg" 
                      alt="Allocation" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                      </div>
                    )}

                    {index === 1 && (
                      <div className="flex-1 rounded-[2rem] bg-surface-2/50 border border-border/80 relative overflow-hidden flex items-center justify-center p-4">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                          className="w-36 h-36 relative"
                        >
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-violet-400" 
                              style={{
                                top: (20 + Math.random() * 60) + "%",
                                left: (20 + Math.random() * 60) + "%",
                                transform: "scale(" + (0.5 + Math.random()) + ")",
                                opacity: 0.4 + Math.random() * 0.6
                              }}
                            />
                          ))}
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible opacity-60">
                            <path d="M10,80 Q40,30 90,10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="4 4" />
                            <circle cx="60" cy="22" r="3" fill="#a78bfa" />
                          </svg>
                        </motion.div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="flex-1 rounded-[2rem] bg-surface-2/50 border border-border/80 relative overflow-hidden p-2">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          {[...Array(12)].map((_, i) => {
                            const startY = 40;
                            let d = "M0," + startY;
                            let y = startY;
                            for(let x=5; x<=100; x+=5) {
                              y += (Math.random() - 0.45) * ((x/10) + 1);
                              d += " L" + x + "," + Math.max(5, Math.min(95, y));
                            }
                            const isMain = i === 5;
                            return (
                              <motion.path 
                                key={i} 
                                d={d} 
                                fill="none" 
                                stroke={isMain ? "#34d399" : "rgba(16, 185, 129, 0.15)"} 
                                strokeWidth={isMain ? 2 : 1} 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
                              />
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {index === 3 && (
                      <div className="flex-1 flex gap-3">
                        <div className="flex-1 rounded-[2rem] bg-surface-2/50 border border-border/80 relative overflow-hidden p-3 flex flex-col justify-center gap-3">
                          <div className="space-y-3 w-full">
                            <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-orange-500" initial={{ width: "20%" }} animate={{ width: "80%" }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }} />
                            </div>
                            <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-orange-400" initial={{ width: "70%" }} animate={{ width: "30%" }} transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }} />
                            </div>
                            <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-amber-400" initial={{ width: "40%" }} animate={{ width: "90%" }} transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Ambient module color glow inside board */}
                <div className={cn("absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none z-0", page.color.replace('text-', 'bg-'))}></div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let i = 0;
    setDisplayedText("");
    setIsTyping(true);

    const timer = setInterval(() => {
      if (i < text.length) {
        if (isMounted) {
          setDisplayedText(text.slice(0, i + 1));
        }
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 8); // Very fast typing animation

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [text]); // Only run once per text change (on mount)

  return (
    <p className="text-slate-300 font-medium text-[9.5px] sm:text-base lg:text-lg leading-snug sm:leading-relaxed transition-all">
      {displayedText}
      {isTyping && (
        <span className="inline-block w-0.5 h-2.5 ml-0.5 bg-sky-400 animate-pulse align-middle" />
      )}
    </p>
  );
}

function ModuleCard({ p, i, onGoPage }: { p: PageInfo; i: number; onGoPage: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const isLeft = i % 2 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-slate-900 border border-slate-700/60 hover:border-slate-500 rounded-[2rem] p-4 sm:p-6 lg:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2.5 hover:scale-[1.01] shadow-[0_25px_50px_rgba(0,0,0,0.85)] overflow-hidden w-full h-[180px] sm:h-[260px] lg:h-[280px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className={cn("absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500", p.color.replace('text-', 'bg-'))} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-start overflow-hidden">
        <h4 className="text-[14px] sm:text-xl lg:text-3xl font-extrabold tracking-tight mb-1 sm:mb-3 text-blue-500 uppercase transition-all">
          {p.title}
        </h4>
        <div className="flex-1 overflow-hidden">
          <TypewriterText text={p.desc} />
        </div>
      </div>
      
      <div className="relative z-10 mt-2 sm:mt-5 pt-1 sm:pt-2 flex justify-center">
        <button 
          onClick={() => onGoPage(p.id)}
          className="px-4 sm:px-6 py-1 sm:py-2.5 bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white font-bold text-[9px] sm:text-xs rounded-full transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg"
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
      title: 'Asset Allocation', 
      id: 'asset-allocation', 
      color: 'text-blue-400',
      cta: 'Define Allocation',
      desc: 'Build your investment basket. Select your stocks, ETFs, or bonds, and instantly visualize their allocation clearly and graphically with our interactive heatmap.'
    },
    {
      title: 'Portfolio Backtesting',
      id: 'portfolio-backtest',
      color: 'text-rose-400',
      cta: 'Start Simulation',
      desc: 'Travel back in time to test your ideas. Observe how your portfolio would have performed over the past 10, 20, or 30 years to understand its real returns and historical risks.',
      useLaptop: true
    },
    { 
      title: 'Tactical Allocation', 
      id: 'tactical-allocation', 
      color: 'text-orange-400',
      cta: 'Program Rules',
      desc: 'Automatically adapt your portfolio based on market trends. Define simple rules to buy or sell automatically, to protect your savings or seize opportunities.'
    },
    { 
      title: 'Monte Carlo', 
      id: 'montecarlo', 
      color: 'text-emerald-400',
      cta: 'Simulate Future',
      desc: 'Forecast the future of your savings. Simulate thousands of future market scenarios to precisely evaluate the resilience of your financial strategy against crises and unforeseen events.'
    }
  ];

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div
        className="flex flex-col w-full min-h-[100dvh] relative overflow-hidden selection:bg-blue-500/30"
        style={{ background: 'radial-gradient(ellipse at top, #1e3a8a 0%, #0a0f1e 55%, #020617 100%)' }}>
        
        {/* Animated Full-Page Datacenter Background (seamlessly flowing from top past Atom down to Tools & Strategies) */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.14]"
          style={{ 
            backgroundImage: `url(${datacenterBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-y'
          }}
          animate={{
            scale: [1, 1.04, 1.01, 1.05, 1],
            y: [0, -12, 12, -6, 0],
            x: [0, 8, -8, 4, 0],
            filter: [
              "hue-rotate(0deg) contrast(1.1) brightness(0.7) saturate(1.2)",
              "hue-rotate(12deg) contrast(1.25) brightness(0.85) saturate(1.4)",
              "hue-rotate(-8deg) contrast(1.05) brightness(0.6) saturate(1.1)",
              "hue-rotate(0deg) contrast(1.1) brightness(0.7) saturate(1.2)"
            ]
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Global smooth vignette to blend the datacenter image perfectly across all sections and fade to deep solid black at the bottom */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 20%, transparent 30%, #0a0f1e 95%)' }} />
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-[#03060d]/60 to-[#010204]" />

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
                <h1 className="text-[18vw] sm:text-[10vw] md:text-8xl lg:text-[140px] max-w-[100vw] break-keep whitespace-nowrap font-semibold leading-[0.85] tracking-tighter shimmer-text-animate hover:scale-105 transition-transform duration-500 origin-left overflow-visible">
                  Quantrih
                </h1>
                <h2 id="hero-gradient-title" className="text-3xl lg:text-4xl font-semibold leading-none tracking-tighter mt-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}>
                  {'portfolio backtesting.'}
                </h2>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl"
              >
                <p className="text-slate-200 font-medium text-2xl md:text-3xl leading-relaxed border-l-2 border-border-2 pl-6 py-2">
                  {Array.from(t("home.hero.subtitle")).map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.03, duration: 0.1 }}
                    >
                      {char}
                    </motion.span>
                  ))}
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
              {"Why Backtest Before Investing?".split("").map((char, i) => (
                <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>{char}</motion.span>
              ))}
            </motion.h4>
            <motion.p
              initial="hidden"
              whileInView="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.003 } }
              }}
              className="text-slate-300 leading-relaxed"
            >
              {"Before you commit your capital to the markets, it is crucial to understand how your investment strategy would have performed historically. Backtesting allows you to simulate your strategy against real market data from the past, helping you identify strengths, understand risks, and refine your approach to build a more resilient portfolio. Test your ideas first, invest with confidence later.".split("").map((char, i) => (
                <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>{char}</motion.span>
              ))}
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
                {'Tools & Strategies'}
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {"Discover our 4 simplified analysis tools to design, test, and secure your investment portfolio."}
              </p>
            </motion.div>

            {/* Solid Rectangular Frame Box for the 4 modules */}
            <div className="bg-slate-800/98 border-t border-l border-slate-700/90 border-r-2 border-b-2 border-slate-900/95 p-4 sm:p-10 lg:p-12 shadow-[-10px_-20px_40px_rgba(255,255,255,0.01),0_40px_80px_rgba(0,0,0,0.9)] relative z-10 rounded-[3rem] w-full max-w-[90rem] mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full">
                {ObjectPages.map((p, i) => (
                  <ModuleCard key={i} p={p} i={i} onGoPage={onGoPage} />
                ))}
              </div>
            </div>
          </div>
        </div>

          {/* Global Interactive Navigation HexBadge Orbit map */}
          <div className="w-full pt-24 pb-20 md:pt-28 md:pb-24 lg:pt-36 lg:pb-32 relative z-20 flex flex-col items-center justify-center">
            <h3 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Quantrih</h3>
            <p className="text-slate-300 mb-12 text-center max-w-md px-6 leading-relaxed font-bold">
              {"Explore our other pages and interesting data"}
            </p>
            <HexBadgeOrbit onNavigate={onGoPage} />
          </div>

          {/* Support Section */}
          <div className="w-full px-6 lg:px-24 pt-16 pb-20 lg:pt-24 lg:pb-32 z-20">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h3 className="text-white text-lg sm:text-xl lg:text-3xl font-black tracking-widest mb-4 uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                {"Support the Evolution of Quantrih."}
              </h3>
              <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed font-extrabold mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {"This systemic architecture is designed to neutralize the entry barrier to complex quant tools. Your support enables continuous funding for financial data pipes, high-quality data acquisition for each asset class, and rigorous stress-test research."}
              </p>
              <div className="flex flex-col items-center justify-center gap-4">
                <button 
                  onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.03] text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_35px_rgba(37,99,235,0.35)] transition-all duration-300 text-sm sm:text-base lg:text-lg font-black tracking-wide text-center uppercase"
                >
                  {'Donation'}
                </button>
                <div className="text-xs sm:text-sm lg:text-base text-slate-300 font-mono mt-2">
                  Direct Inquiry Protocol: <a href="mailto:contact@quantrih.com" className="text-blue-500 hover:text-blue-400 transition-colors font-bold underline underline-offset-4">contact@quantrih.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Branding Section */}
        <div className="w-full pb-16 z-20 mt-12">
          <div className="px-6 lg:px-24 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-white/80 text-[10px] sm:text-xs font-sans tracking-wide max-w-3xl mx-auto leading-relaxed">
              {"Disclaimer: Past performance is not indicative of future results. Quantrih's tools and analyses are based exclusively on historical data from the past. Investing involves risks, including the potential loss of capital."}
            </p>
          </div>
        </div>
      </div>
    </MobileZoomWrapper>
  );
}
