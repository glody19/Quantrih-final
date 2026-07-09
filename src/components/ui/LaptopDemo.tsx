import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function LaptopDemo() {
  return (
    <div className="relative w-full max-w-[700px] aspect-[1.6] flex flex-col items-center justify-center perspective-[1200px]">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        animate={{ y: [-12, 12, -12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full flex flex-col items-center"
      >
        {/* Screen Bezel */}
        <div className="relative bg-slate-900 border-[8px] md:border-[12px] border-slate-800 rounded-t-2xl md:rounded-t-[1.5rem] w-[85%] aspect-[1.6] overflow-hidden shadow-2xl flex flex-col">
          {/* Camera */}
          <div className="absolute top-1 md:top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full z-50 shadow-inner"></div>
          
          {/* Screen Content - App Replica */}
          <div className="flex-1 bg-slate-50 relative overflow-hidden w-full h-full p-3 md:p-5 flex flex-col gap-3 md:gap-5">
             {/* Scrolling container */}
             <motion.div 
               animate={{ y: [0, -120, 0] }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               className="w-full flex flex-col gap-3 md:gap-5"
             >
                {/* Top Row: Two Charts */}
                <div className="flex gap-3 md:gap-5 w-full h-[120px] md:h-[160px]">
                   {/* Bar Chart Card */}
                   <div className="flex-1 bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 p-2 md:p-4 flex flex-col">
                     <div className="text-[8px] md:text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-orange-400"></div>
                        Annual Returns
                     </div>
                     <div className="flex-1 flex items-end justify-between gap-0.5 md:gap-1.5 px-1 md:px-2">
                        {[40,-10,20,30,-30,10,25,15,5,-15,20,35,10,12,-5].map((val, i) => (
                           <motion.div 
                             key={i} 
                             className={cn("w-full rounded-t-[1px] md:rounded-t-sm", val >= 0 ? "bg-blue-400" : "bg-red-400 rounded-t-none rounded-b-[1px] md:rounded-b-sm")}
                             style={{ height: `${Math.abs(val)}%`, marginBottom: val < 0 ? `-${Math.abs(val)}%` : '0' }}
                             initial={{ scaleY: 0 }}
                             animate={{ scaleY: 1 }}
                             transition={{ duration: 1, delay: i * 0.05 }}
                           />
                        ))}
                     </div>
                     <div className="w-full h-[1px] bg-slate-100 mt-2"></div>
                   </div>

                   {/* Drawdowns Card */}
                   <div className="flex-1 bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 p-2 md:p-4 flex flex-col">
                     <div className="text-[8px] md:text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-pink-400"></div>
                        Drawdowns
                     </div>
                     <div className="flex-1 relative overflow-hidden">
                       <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                         <motion.path 
                           d="M0,0 L10,-5 L20,0 L30,-20 L40,-45 L50,-15 L60,-5 L70,-10 L80,-25 L90,-5 L100,0"
                           fill="none" stroke="#ef4444" strokeWidth="1.5"
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                         />
                         <motion.path 
                           d="M0,0 L10,-2 L20,-5 L30,-10 L40,-30 L50,-5 L60,-2 L70,-8 L80,-15 L90,-2 L100,0"
                           fill="none" stroke="#eab308" strokeWidth="1.5"
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.2 }}
                         />
                         <motion.path 
                           d="M0,0 L10,0 L20,-2 L30,-5 L40,-15 L50,-2 L60,0 L70,-2 L80,-5 L90,0 L100,0"
                           fill="none" stroke="#3b82f6" strokeWidth="1.5"
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.4 }}
                         />
                       </svg>
                       {/* Zero line */}
                       <div className="absolute top-0 left-0 right-0 h-[1px] bg-slate-200"></div>
                     </div>
                   </div>
                </div>

                {/* Bottom Row: Table */}
                <div className="w-full bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 p-2 md:p-4 flex flex-col gap-2 md:gap-3">
                   <div className="text-[9px] md:text-[12px] font-bold text-slate-800 border-b border-slate-100 pb-1.5 md:pb-2">
                     Trailing Returns
                   </div>
                   <div className="flex flex-col gap-1.5 md:gap-2.5 mt-1">
                     <div className="flex justify-between text-[7px] md:text-[9px] text-slate-400 font-medium">
                       <div className="w-20 md:w-32">Portfolio</div>
                       <div className="flex-1 flex justify-between text-right">
                         <span className="w-8 md:w-12">1 Year</span>
                         <span className="w-8 md:w-12">3 Years</span>
                         <span className="w-8 md:w-12">5 Years</span>
                         <span className="w-8 md:w-12">Full</span>
                       </div>
                     </div>
                     
                     {[
                       { name: "Classic", color: "bg-blue-500", y1: "15.8%", y3: "19.6%", y5: "10.9%", full: "7.7%" },
                       { name: "Dynamic", color: "bg-yellow-500", y1: "16.6%", y3: "21.1%", y5: "12.1%", full: "8.6%" },
                       { name: "100% Equities", color: "bg-red-500", y1: "17.1%", y3: "22.2%", y5: "13.0%", full: "9.4%" },
                       { name: "Conservative", color: "bg-emerald-500", y1: "14.7%", y3: "17.2%", y5: "9.0%", full: "6.5%" },
                       { name: "Permanent", color: "bg-violet-500", y1: "30.8%", y3: "22.1%", y5: "11.8%", full: "8.0%" },
                     ].map((row, i) => (
                       <motion.div 
                         key={i} 
                         className="flex justify-between text-[7px] md:text-[10px] text-slate-700 py-0.5 md:py-1 border-b border-slate-50 last:border-0"
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                       >
                         <div className="w-20 md:w-32 flex items-center gap-1.5 md:gap-2 font-medium">
                           <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${row.color}`}></div>
                           <span className="truncate">{row.name}</span>
                         </div>
                         <div className="flex-1 flex justify-between text-right font-mono">
                           <span className="w-8 md:w-12">{row.y1}</span>
                           <span className="w-8 md:w-12">{row.y3}</span>
                           <span className="w-8 md:w-12">{row.y5}</span>
                           <span className="w-8 md:w-12 text-emerald-600 font-semibold">{row.full}</span>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                </div>
             </motion.div>
          </div>
        </div>

        {/* Laptop Base (Keyboard area) */}
        <div className="relative w-[100%] h-[16px] md:h-[22px] bg-slate-300 rounded-b-2xl md:rounded-b-[2rem] rounded-t-sm border-b-4 border-slate-400 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex justify-center z-20">
           {/* Trackpad indentation */}
           <div className="absolute top-0 w-[15%] h-[4px] md:h-[6px] bg-slate-400/50 rounded-b-md"></div>
        </div>
      </motion.div>
    </div>
  );
}
