import React, { useState } from "react";
import { Activity, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";
import { AtomAnimation } from "../ui/AtomAnimation";
import { LaptopDemo } from "../ui/LaptopDemo";

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
      title: 'Monte Carlo Dynamics', 
      id: 'montecarlo', 
      color: 'text-emerald-400',
      cta: 'Simulate Future',
      desc: 'Forecast the future of your savings. Simulate thousands of future market scenarios to precisely evaluate the resilience of your financial strategy against crises and unforeseen events.'
    }
  ];

  return (
    <div
      className="flex flex-col w-full min-h-[100dvh] relative overflow-hidden selection:bg-blue-500/30"
      style={{ background: 'radial-gradient(ellipse at top, #1e3a8a 0%, #0a0f1e 55%, #020617 100%)' }}>
      
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
                className="mb-10 lg:pt-12"
              >
                <h1 className="text-[12vw] sm:text-[10vw] md:text-8xl lg:text-[160px] max-w-[100vw] break-words font-semibold leading-[0.85] tracking-tighter shimmer-text-animate hover:scale-105 transition-transform duration-500 origin-left">
                  Quantrih
                </h1>
                <h2 id="hero-gradient-title" className="text-3xl lg:text-5xl font-semibold leading-none tracking-tighter mt-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}>
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
          <div className="w-full lg:w-[55%] min-h-[40vh] lg:min-h-[75vh] relative z-10 flex items-center justify-center mt-10 lg:mt-20">
            <AtomAnimation isHovered={heroHovered} />
          </div>
        </div>

                {/* Feature Tools System Flow */}
        <div className="w-full relative py-20 lg:py-40 overflow-hidden">

          
          <div className="w-full px-6 lg:px-24 z-20 relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-16 text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 transition-colors duration-300">
                {'Tools & Strategies'}
              </h3>
              <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
                {"Discover our 4 simplified analysis tools to design, test, and secure your investment portfolio."}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 relative z-10 w-full max-w-[90rem] mx-auto px-2 md:px-4">
              {ObjectPages.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  key={i} 
                  className="group relative bg-[#0B1121] border border-slate-800/80 hover:border-slate-600 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                  <div className={cn("absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500", p.color.replace('text-', 'bg-'))} />
                  
                  <div className="relative z-10 mb-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-[#151E32] border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500", p.color.replace('text-', 'text-'))}>
                        <Activity className={cn("w-8 h-8", p.color)} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                      </div>
                    </div>
                    <h4 className="text-2xl font-extrabold tracking-tight mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {p.title}
                    </h4>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  
                  <div className="relative z-10 mt-auto pt-6">
                    <button 
                      onClick={() => onGoPage(p.id)}
                      className="w-full py-3 bg-[#1E293B] hover:bg-[#334155] text-slate-300 hover:text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {p.cta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="w-full px-6 lg:px-24 py-16 lg:py-32 z-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden transition-all duration-500">
            <div className="max-w-3xl relative z-10 text-center lg:text-left">
              <h3 className="text-white text-2xl lg:text-3xl font-medium tracking-tight mb-4">
                {"Support the Evolution of Quantrih."}
              </h3>
              <p className="text-slate-200 text-xl leading-relaxed font-normal mb-8 max-w-2xl">
                {"This systemic architecture is designed to neutralize the entry barrier to complex quant tools. Your support enables continuous funding for financial data pipes and rigorous stress-test research."}
              </p>
              <div className="text-xs text-slate-300 font-mono flex flex-col gap-1">
                <span>Direct Inquiry Protocol: <a href="mailto:contact@quantrih.com" className="text-blue-500 hover:text-blue-400 transition-colors">contact@quantrih.com</a></span>
              </div>
            </div>
            <div className="w-auto relative z-10">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: 10, currency: 'eur' })
                    });
                    const session = await res.json();
                    if (session.url) window.location.href = session.url;
                    else throw new Error(session.error || 'Unknown error');
                  } catch (e) {
                    alert("Payment Gateway Notice: Stripe configuration requires provisioning.");
                  }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all duration-300 text-sm font-bold text-center"
              >
                {'Donation'}
              </button>
            </div>
          </div>
        </div>

        {/* Professional Branding Section */}
        <div className="w-full border-t border-border/60 py-16 z-20">
          <div className="px-6 lg:px-24 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-slate-500 text-sm font-sans font-medium mt-2">
              Quantrih Engineering
            </p>
            <p className="text-slate-400 text-sm font-sans tracking-wide mt-6 max-w-2xl mx-auto">
              {"Disclaimer: Past performance is not indicative of future results. Quantrih's tools and analyses are based exclusively on historical data from the past. Investing involves risks, including the potential loss of capital."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
