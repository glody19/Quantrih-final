import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
 content: string | React.ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
 return (
 <div className="group relative inline-flex items-center justify-center ml-1 focus:outline-none z-50">
 <Info size={11} className="text-slate-500 group-hover:text-blue-400 transition-colors cursor-help" />
 <div className="pointer-events-none absolute bottom-full left-1/2 z-[9999] mb-2 w-[200px] -translate-x-1/2 opacity-0 shadow-2xl transition-all duration-300 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 group-focus:opacity-100">
 {/* Glow effect */}
 <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-[1.5rem]"></div>
 {/* Tooltip Card */}
 <div className="relative rounded-[1.5rem] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-2.5 text-[10px] leading-relaxed text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-sans font-medium text-left">
 {content}
 </div>
 <div className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-slate-700/80 bg-slate-900/95 backdrop-blur-xl"></div>
 </div>
 </div>
 );
}
