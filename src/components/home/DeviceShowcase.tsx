import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEW = { once: true, margin: "-120px" } as const;

/** Small glass card holding one animated chart (decorative shapes, no figures). */
function VizCard({ title, className, delay, float, children }: { title: string; className: string; delay: number; float: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={VIEW}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay }}
      className={"absolute hidden lg:block z-20 " + className}
    >
      <motion.div
        animate={{ y: [0, -float, 0] }}
        transition={{ duration: 5 + float / 4, repeat: Infinity, ease: "easeInOut", delay }}
        className="rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200 shadow-[0_24px_50px_-24px_rgba(23,20,74,0.45)] p-4 w-[190px]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">{title}</p>
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Desktop display playing the demo with a laptop beside it. Both rise in with a spring,
 * the display powers on, the laptop lid opens, then everything floats gently.
 * Three small animated charts orbit the scene.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, laptopSrc, desktopAlt, laptopAlt, fr = false }: { videoMp4: string; videoWebm: string; poster: string; laptopSrc: string; desktopAlt: string; laptopAlt: string; fr?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  // gentle scroll parallax only (no big zoom)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const driftSlow = useTransform(p, [0, 1], [24, -24]);
  const driftFast = useTransform(p, [0, 1], [50, -50]);

  // cursor tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 120, damping: 18 });

  const bars = [38, 62, 30, 78, 52, 90, 66];

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="relative w-full max-w-6xl mx-auto [perspective:1800px] select-none"
    >
      <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="relative pb-10">
        {/* floor glow */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="absolute left-[6%] right-[6%] bottom-0 h-28 rounded-[50%] bg-[radial-gradient(ellipse,rgba(91,75,219,0.30),transparent_70%)] blur-2xl"
        />

        {/* ── Desktop display ── */}
        <motion.div
          initial={{ opacity: 0, y: 90, rotateX: 28, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={VIEW}
          transition={{ type: "spring", stiffness: 70, damping: 16, mass: 0.9 }}
          style={{ transformOrigin: "50% 100%" }}
          className="relative w-[94%] md:w-[70%] mx-auto md:mx-0 md:ml-[5%]"
        >
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
            <div className="relative rounded-[16px] md:rounded-[22px] bg-[#0B0C10] p-[1.3%] ring-1 ring-black/60 shadow-[0_50px_90px_-40px_rgba(15,23,42,0.7),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="absolute left-1/2 top-[0.55%] -translate-x-1/2 w-1 h-1 rounded-full bg-[#2b2e36]" />
              <div className="relative overflow-hidden rounded-[8px] md:rounded-[12px] bg-white aspect-[16/9]">
                <video className="absolute inset-0 w-full h-full object-cover object-top" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={desktopAlt}>
                  <source src={videoWebm} type="video/webm" />
                  <source src={videoMp4} type="video/mp4" />
                </video>
                {/* power-on: dark panel lifts, then a light sweep crosses the glass */}
                <motion.div initial={{ opacity: 1 }} whileInView={{ opacity: 0 }} viewport={VIEW} transition={{ duration: 0.9, delay: 0.55 }} className="pointer-events-none absolute inset-0 bg-[#0B0C10]" />
                <motion.div
                  initial={{ x: "-120%" }} whileInView={{ x: "220%" }} viewport={VIEW} transition={{ duration: 1.3, delay: 0.9, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.45),transparent)]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_35%)]" />
              </div>
            </div>
            {/* aluminium stand */}
            <div className="relative mx-auto w-[22%]">
              <div className="mx-auto w-[46%] h-[46px] md:h-[84px] bg-[linear-gradient(90deg,#B4B9C1_0%,#E8EAEE_30%,#F4F5F7_50%,#D5D8DD_75%,#A9AEB7_100%)]" />
              <div className="h-[9px] md:h-[12px] rounded-[40%_40%_10px_10px] bg-[linear-gradient(180deg,#F1F2F4_0%,#C4C8CF_60%,#9CA2AB_100%)] shadow-[0_18px_24px_-10px_rgba(15,23,42,0.55)]" />
            </div>
          </motion.div>
        </motion.div>

        {/* ── Laptop ── */}
        <motion.div
          initial={{ opacity: 0, x: 180, rotateY: -30 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={VIEW}
          transition={{ type: "spring", stiffness: 70, damping: 15, delay: 0.35 }}
          className="absolute right-0 bottom-6 w-[40%] hidden md:block [perspective:1400px] z-10"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <motion.div
              initial={{ rotateX: -92 }} whileInView={{ rotateX: 0 }} viewport={VIEW}
              transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
              style={{ transformOrigin: "50% 100%" }}
              className="relative mx-[5%] rounded-t-[14px] bg-[#0B0C10] p-[1.8%] pb-[2.2%] ring-1 ring-black/60 shadow-[0_30px_60px_-28px_rgba(15,23,42,0.7)]"
            >
              <div className="absolute left-1/2 top-[1%] -translate-x-1/2 w-[14%] h-[2.6%] rounded-b-md bg-[#0B0C10] z-10" />
              <div className="relative overflow-hidden rounded-[5px] bg-white aspect-[16/10]">
                <img src={laptopSrc} alt={laptopAlt} className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_40%)]" />
              </div>
            </motion.div>
            {/* base seen from the front: deck with keyboard well and trackpad */}
            <div className="relative h-[26px] bg-[linear-gradient(180deg,#E6E8EC_0%,#CDD1D7_55%,#A7ADB6_100%)] [clip-path:polygon(4%_0,96%_0,100%_100%,0_100%)]">
              <div className="absolute left-[12%] right-[12%] top-[3px] h-[9px] rounded-[2px] bg-[#2A2D35]/85" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[3px] w-[22%] h-[7px] rounded-[2px] bg-[#BEC3CA] ring-1 ring-black/10" />
            </div>
            <div className="mx-[1%] h-[5px] rounded-b-[10px] bg-[#8E949E] shadow-[0_20px_26px_-12px_rgba(15,23,42,0.6)]" />
          </motion.div>
        </motion.div>

        {/* ── Floating charts ── */}
        <motion.div style={{ y: driftFast }} className="absolute inset-0 pointer-events-none">
          <VizCard title={fr ? "Croissance" : "Growth"} className="-left-6 xl:-left-16 top-[6%]" delay={0.9} float={10}>
            <svg viewBox="0 0 160 60" className="w-full h-14">
              <defs><linearGradient id="dsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B4BDB" stopOpacity="0.35" /><stop offset="1" stopColor="#5B4BDB" stopOpacity="0" /></linearGradient></defs>
              <motion.path d="M0 50 L18 44 L34 47 L52 34 L70 38 L88 24 L106 28 L124 14 L142 18 L160 6 L160 60 L0 60 Z" fill="url(#dsArea)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ duration: 0.8, delay: 2 }} />
              <motion.path d="M0 50 L18 44 L34 47 L52 34 L70 38 L88 24 L106 28 L124 14 L142 18 L160 6" fill="none" stroke="#5B4BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={VIEW} transition={{ duration: 1.6, delay: 1.2, ease: "easeInOut" }} />
            </svg>
          </VizCard>
        </motion.div>
        <motion.div style={{ y: driftSlow }} className="absolute inset-0 pointer-events-none">
          <VizCard title={fr ? "Rendements annuels" : "Annual returns"} className="left-[30%] -bottom-4" delay={1.15} float={8}>
            <div className="flex items-end gap-1.5 h-14">
              {bars.map((b, i) => (
                <motion.span key={i} className="flex-1 rounded-t-sm" style={{ background: i === 2 ? "#9F1239" : "#18B8A0", transformOrigin: "bottom" }}
                  initial={{ height: 0 }} whileInView={{ height: `${b}%` }} viewport={VIEW} transition={{ duration: 0.7, delay: 1.4 + i * 0.08, ease: EASE }} />
              ))}
            </div>
          </VizCard>
          <VizCard title={fr ? "Allocation" : "Allocation"} className="-right-4 xl:-right-14 top-[2%]" delay={1.35} float={12}>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 60 60" className="w-14 h-14 -rotate-90">
                <circle cx="30" cy="30" r="22" fill="none" stroke="#EEF0F4" strokeWidth="9" />
                {[["#5B4BDB", 0.55, 0], ["#18B8A0", 0.28, 0.55], ["#E0B341", 0.17, 0.83]].map(([c, len, off], i) => {
                  const C = 2 * Math.PI * 22;
                  return <motion.circle key={i} cx="30" cy="30" r="22" fill="none" stroke={c as string} strokeWidth="9" strokeDashoffset={-(off as number) * C}
                    initial={{ strokeDasharray: `0 ${C}` }} whileInView={{ strokeDasharray: `${(len as number) * C} ${C}` }} viewport={VIEW} transition={{ duration: 0.8, delay: 1.7 + i * 0.25, ease: "easeOut" }} />;
                })}
              </svg>
              <div className="grid gap-1.5 flex-1">
                {["#5B4BDB", "#18B8A0", "#E0B341"].map((c, i) => (
                  <motion.span key={c} className="h-1.5 rounded-full" style={{ background: c, transformOrigin: "left" }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 - i * 0.25 }} viewport={VIEW} transition={{ duration: 0.6, delay: 1.9 + i * 0.2 }} />
                ))}
              </div>
            </div>
          </VizCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
