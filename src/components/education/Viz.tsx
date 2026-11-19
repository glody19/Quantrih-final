import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { cn } from "../../lib/utils";

/** Colours shared by the Education and Platforms pages: navy theme, no violet. */
export const PALETTE = {
  navy: "#0B3558", blue: "#1D6FA8", sky: "#38BDF8", teal: "#14B8A6", gold: "#E2B84F", coral: "#F26D5B", green: "#22A06B", ink: "#0C2233",
};

/** Number that counts up once it enters the screen. */
export function CountUp({ value, duration = 2.2, delay = 0, decimals = 0, prefix = "", suffix = "", className }: {
  value: number; duration?: number; delay?: number; decimals?: number; prefix?: string; suffix?: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, value, duration, delay]);
  return <span ref={ref} className={cn("tabular-nums", className)}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}

/** Plain page head: white background, black bold title, no animation. Used by text pages (Education, banks and brokers). */
export function PlainHead({ kicker, title, sub, stats }: { kicker: string; title: string; sub: string; stats?: { value: number; label: string }[] }) {
  return (
    <div className="max-w-[1720px] mx-auto px-5 sm:px-8 lg:px-14 pt-10 lg:pt-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">{kicker}</p>
      <h1 className="mt-2 text-[30px] md:text-[40px] leading-[1.1] font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-3 max-w-3xl text-[17px] md:text-[18px] leading-relaxed text-slate-700">{sub}</p>
      {stats && (
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-slate-600">
          {stats.map((s) => <span key={s.label}><span className="font-bold text-slate-950 tabular-nums">{s.value}</span> {s.label}</span>)}
        </p>
      )}
    </div>
  );
}

/** Navy band with a grid, used as the head of both pages. */
export function HeroBand({ kicker, title, sub, children, art }: { kicker: string; title: string; sub: string; children?: React.ReactNode; art?: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden" style={{
      backgroundColor: "#0A1E2D",
      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px), radial-gradient(1200px 500px at 85% 20%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(900px 400px at 10% 110%, rgba(226,184,79,0.16), transparent 60%), linear-gradient(180deg,#0A1E2D 0%,#14466B 60%,#0A1E2D 100%)",
      backgroundSize: "56px 56px, 56px 56px, 100% 100%, 100% 100%, 100% 100%",
    }}>
      <div className="max-w-[1720px] mx-auto px-5 sm:px-8 lg:px-14 py-14 lg:py-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#A9C8EA]">{kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 26, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-[32px] md:text-[46px] leading-[1.08] font-semibold tracking-tight !text-white">{title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.55 }} className="mt-4 max-w-2xl text-[17px] md:text-[20px] leading-relaxed text-white/75">{sub}</motion.p>
          {children}
        </div>
        {art && (
          <motion.div initial={{ opacity: 0, scale: 0.82, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="hidden lg:block">
            {art}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Row of animated key figures inside a hero band. */
export function HeroStats({ items }: { items: { value: number; label: string; color: string; suffix?: string }[] }) {
  return (
    <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
      {items.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 24, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.8 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white/[0.07] backdrop-blur px-4 py-3.5 ring-1 ring-white/10">
          <CountUp value={s.value} delay={0.9 + i * 0.18} duration={2.4} suffix={s.suffix} className="block text-[30px] md:text-[34px] font-semibold leading-none text-white" />
          <span className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white/70">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/** Animated ring chart. */
export function Donut({ data, size = 220, thickness = 26, center }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: React.ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const total = Math.max(1, data.reduce((a, d) => a + d.value, 0));
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF3F9" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const off = acc; acc += len;
          return (
            <motion.circle key={d.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeLinecap="butt"
              strokeDasharray={`${len} ${c}`} initial={{ strokeDashoffset: -off + len, opacity: 0 }}
              animate={inView ? { strokeDashoffset: -off, opacity: 1 } : {}} transition={{ duration: 1.1, delay: 0.25 + i * 0.16, ease: [0.16, 1, 0.3, 1] }} />
          );
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}

/** Horizontal bars with counts, animated one after the other. */
export function BarList({ data, unit }: { data: { label: string; value: number; color: string }[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="grid gap-3">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex items-baseline justify-between text-[15px]">
            <span className="font-semibold text-slate-800">{d.label}</span>
            <span className="text-slate-500"><CountUp value={d.value} delay={0.3 + i * 0.12} duration={1.8} className="font-semibold text-slate-900" />{unit ? ` ${unit}` : ""}</span>
          </div>
          <div className="mt-1.5 h-3 rounded-full bg-slate-100 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${d.color}, ${d.color}CC)` }}
              initial={{ width: 0 }} whileInView={{ width: `${(d.value / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Vertical columns, e.g. a count per decade. */
export function Columns({ data, color = PALETTE.sky, height = 170 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="group flex-1 h-full flex flex-col justify-end items-center">
          <span className="mb-1 text-[13px] font-semibold text-slate-700 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</span>
          <motion.div className="w-full rounded-t-lg" style={{ background: `linear-gradient(180deg, ${color}, ${PALETTE.blue})` }}
            initial={{ height: 0 }} whileInView={{ height: `${Math.max(4, (d.value / max) * 82)}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
          <span className="mt-2 text-[12px] text-slate-500 tabular-nums">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Section title used on both pages. */
export function SectionHead({ kicker, title, color = PALETTE.sky }: { kicker?: string; title: string; color?: string }) {
  return (
    <div className="mb-7">
      {kicker && <motion.p initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color }}>{kicker}</motion.p>}
      <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-1 text-[26px] md:text-[34px] font-semibold tracking-tight text-slate-900">{title}</motion.h2>
      <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} style={{ transformOrigin: "left", background: `linear-gradient(90deg, ${PALETTE.navy}, ${color})` }} className="block mt-3 h-[3px] w-20 rounded-full" />
    </div>
  );
}

/** Library illustration: shelves of books with a rising chart line. Pure SVG. */
export function LibraryArt() {
  const books = [
    [40, 92, "#38BDF8"], [62, 110, "#E2B84F"], [86, 84, "#14B8A6"], [104, 120, "#F26D5B"], [130, 98, "#1D6FA8"], [150, 112, "#22A06B"],
    [176, 90, "#E2B84F"], [196, 116, "#38BDF8"], [222, 104, "#F26D5B"], [244, 88, "#14B8A6"], [266, 118, "#1D6FA8"], [292, 100, "#E2B84F"],
  ] as const;
  return (
    <svg viewBox="0 0 460 360" className="w-full max-w-[560px] ml-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)]" aria-hidden>
      <defs>
        <linearGradient id="shelf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A9C8EA" /><stop offset="1" stopColor="#5B8CC8" /></linearGradient>
        <linearGradient id="screen" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#0C2233" /><stop offset="1" stopColor="#14466B" /></linearGradient>
      </defs>
      {/* back panel */}
      <rect x="20" y="40" width="300" height="290" rx="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
      {[0, 1].map((row) => (
        <g key={row} transform={`translate(0 ${row * 140})`}>
          {books.map(([x, h, c], i) => (
            <motion.rect key={i} x={x} y={180 - h} width={i % 3 === 0 ? 18 : 20} height={h} rx="3" fill={c as string}
              initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 0.95 }} style={{ transformOrigin: `${x}px 180px`, transformBox: "view-box" } as any}
              transition={{ duration: 0.7, delay: 0.5 + row * 0.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }} />
          ))}
          <rect x="30" y="180" width="280" height="8" rx="4" fill="url(#shelf)" />
        </g>
      ))}
      {/* floating chart card */}
      <motion.g initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 1.2 }}>
        <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="250" y="120" width="190" height="130" rx="16" fill="url(#screen)" stroke="rgba(169,200,234,0.4)" />
          <motion.path d="M268 224 L298 206 L322 214 L350 182 L378 190 L404 154 L424 146" fill="none" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 1.6 }} />
          <motion.circle cx="424" cy="146" r="6" fill="#E2B84F" initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.6, delay: 3.1 }} />
          <rect x="268" y="134" width="60" height="7" rx="3.5" fill="rgba(255,255,255,0.35)" />
          <rect x="268" y="146" width="36" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
        </motion.g>
      </motion.g>
      {/* open book */}
      <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.5 }}>
        <path d="M150 330 Q200 300 250 322 L250 352 Q200 332 150 352 Z" fill="#F4F8FC" />
        <path d="M250 322 Q300 300 350 330 L350 352 Q300 332 250 352 Z" fill="#E3ECF6" />
        {[0, 1, 2].map((k) => <path key={k} d={`M${168 + k * 4} ${334 + k * 5} Q200 ${318 + k * 5} 236 ${330 + k * 5}`} stroke="#A9C8EA" strokeWidth="2" fill="none" />)}
      </motion.g>
    </svg>
  );
}

/** Platforms illustration: a hub connected to venues, with order pulses. Pure SVG. */
export function NetworkArt() {
  const nodes = [[70, 70, "#38BDF8"], [380, 60, "#E2B84F"], [420, 230, "#14B8A6"], [60, 260, "#F26D5B"], [230, 330, "#22A06B"], [240, 40, "#1D6FA8"]] as const;
  return (
    <svg viewBox="0 0 480 370" className="w-full max-w-[560px] ml-auto" aria-hidden>
      {nodes.map(([x, y, c], i) => (
        <g key={i}>
          <motion.line x1="240" y1="185" x2={x} y2={y} stroke="rgba(169,200,234,0.35)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.4 + i * 0.12 }} />
          <motion.circle r="5" fill={c as string} initial={{ opacity: 0 }} animate={{ cx: [240, x as number], cy: [185, y as number], opacity: [0, 1, 0] }} transition={{ duration: 2.2, delay: 1.4 + i * 0.35, repeat: Infinity, repeatDelay: 1.2 }} />
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.7 + i * 0.12 }} style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" } as any}>
            <rect x={(x as number) - 34} y={(y as number) - 24} width="68" height="48" rx="14" fill="#FFFFFF" />
            <rect x={(x as number) - 22} y={(y as number) - 10} width="44" height="7" rx="3.5" fill={c as string} />
            <rect x={(x as number) - 22} y={(y as number) + 3} width="28" height="6" rx="3" fill="#D6E2EF" />
          </motion.g>
        </g>
      ))}
      <motion.g initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "240px 185px", transformBox: "view-box" } as any}>
        <circle cx="240" cy="185" r="62" fill="rgba(56,189,248,0.12)" />
        <motion.circle cx="240" cy="185" r="62" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="2" animate={{ r: [62, 90], opacity: [0.6, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
        <circle cx="240" cy="185" r="44" fill="#0C2233" stroke="#38BDF8" strokeWidth="2" />
        <path d="M222 198 L234 184 L244 190 L260 168" stroke="#E2B84F" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}
