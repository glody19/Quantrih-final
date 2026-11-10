import React from "react";
import { motion } from "motion/react";

/**
 * Small animated illustrations for the four tool cards. Everything is clipped inside the
 * frame (overflow hidden) and loops gently. Purely decorative: no market figures shown.
 */
export function ToolIllustration({ kind, accent }: { kind: 0 | 1 | 2 | 3; accent: string }) {
  return (
    <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10" aria-hidden>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 20px" }} />
      {kind === 0 && <AllocationArt accent={accent} />}
      {kind === 1 && <BacktestArt accent={accent} />}
      {kind === 2 && <TacticalArt accent={accent} />}
      {kind === 3 && <MonteCarloArt accent={accent} />}
    </div>
  );
}

const loop = { repeat: Infinity, repeatType: "loop" as const };

function AllocationArt({ accent }: { accent: string }) {
  const segs = [
    { v: 0.4, c: accent },
    { v: 0.25, c: "#B6ABF7" },
    { v: 0.2, c: "#2DD4BF" },
    { v: 0.15, c: "#E2B84F" },
  ];
  const C = 2 * Math.PI * 34;
  let acc = 0;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 px-6">
      <motion.svg viewBox="0 0 100 100" className="h-[78%] shrink-0" animate={{ rotate: 360 }} transition={{ ...loop, duration: 18, ease: "linear" }}>
        {segs.map((s, i) => {
          const off = acc;
          acc += s.v;
          return (
            <motion.circle
              key={i}
              cx="50" cy="50" r="34" fill="none" stroke={s.c} strokeWidth="14"
              strokeDasharray={`${s.v * C - 2} ${C}`}
              strokeDashoffset={-off * C}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ ...loop, duration: 2.4, delay: i * 0.3 }}
            />
          );
        })}
      </motion.svg>
      <div className="grid grid-cols-4 gap-1.5 w-[38%]">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[4px]"
            style={{ background: i % 3 === 0 ? accent : i % 3 === 1 ? "#2DD4BF" : "#B6ABF7" }}
            animate={{ opacity: [0.25, 0.9, 0.25] }}
            transition={{ ...loop, duration: 2.6, delay: (i % 7) * 0.22 }}
          />
        ))}
      </div>
    </div>
  );
}

function BacktestArt({ accent }: { accent: string }) {
  const d = "M6,70 C20,66 26,58 36,60 C46,62 50,40 60,44 C68,47 72,30 82,32 C92,34 98,18 114,14";
  const d2 = "M6,72 C20,70 28,66 36,68 C46,70 52,58 60,60 C70,62 76,52 84,54 C94,56 100,44 114,42";
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="bt-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={d2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeDasharray="3 3"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ ...loop, duration: 4, times: [0, 0.6, 1] }} />
      <motion.path d={`${d} L114,80 L6,80 Z`} fill="url(#bt-fill)" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ ...loop, duration: 4, times: [0, 0.6, 0.9, 1] }} />
      <motion.path d={d} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ ...loop, duration: 4, times: [0, 0.6, 1] }} />
      <motion.circle r="2.6" fill="#fff" style={{ offsetPath: `path("${d}")` } as any}
        initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: ["0%", "100%", "100%"] }} transition={{ ...loop, duration: 4, times: [0, 0.6, 1] }} />
    </svg>
  );
}

function TacticalArt({ accent }: { accent: string }) {
  const price = "M4,40 L14,34 L22,38 L30,26 L40,30 L48,22 L56,34 L64,46 L72,52 L80,44 L88,36 L96,30 L104,24 L116,18";
  const ma = "M4,42 C24,36 40,28 56,30 C66,32 74,44 84,42 C96,38 106,28 116,24";
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 120 70" preserveAspectRatio="none" className="absolute inset-x-0 top-2 w-full h-[70%]">
        <motion.path d={ma} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeDasharray="4 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ ...loop, duration: 4.5, times: [0, 0.7, 1] }} />
        <motion.path d={price} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ ...loop, duration: 4.5, times: [0, 0.7, 1] }} />
      </svg>
      <div className="absolute inset-x-4 bottom-3 flex gap-2">
        <motion.span className="flex-1 h-6 rounded-md text-[10px] font-bold flex items-center justify-center text-[#0B0A24]" style={{ background: accent }}
          animate={{ opacity: [1, 1, 0.25, 0.25, 1] }} transition={{ ...loop, duration: 4.5, times: [0, 0.45, 0.5, 0.95, 1] }}>
          EQUITIES
        </motion.span>
        <motion.span className="flex-1 h-6 rounded-md text-[10px] font-bold flex items-center justify-center text-[#0B0A24] bg-[#B6ABF7]"
          animate={{ opacity: [0.25, 0.25, 1, 1, 0.25] }} transition={{ ...loop, duration: 4.5, times: [0, 0.45, 0.5, 0.95, 1] }}>
          BONDS
        </motion.span>
      </div>
    </div>
  );
}

function MonteCarloArt({ accent }: { accent: string }) {
  const paths = Array.from({ length: 14 }, (_, i) => {
    const end = 8 + i * 4.6;
    const mid = 40 + (i - 7) * 1.8;
    return `M6,40 C30,${40 + (i % 2 ? 4 : -4)} 60,${mid} 114,${end}`;
  });
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="mc-cone" x1="0" x2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.05" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <motion.path d="M6,40 L114,6 L114,74 Z" fill="url(#mc-cone)" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ ...loop, duration: 3.6 }} />
      {paths.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke={i === 7 ? "#fff" : accent} strokeOpacity={i === 7 ? 0.9 : 0.55} strokeWidth={i === 7 ? 1.8 : 1}
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ ...loop, duration: 3.6, delay: i * 0.06, times: [0, 0.55, 0.9, 1] }} />
      ))}
      <circle cx="6" cy="40" r="2.6" fill="#fff" />
    </svg>
  );
}
