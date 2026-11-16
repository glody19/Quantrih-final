import React, { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { QuantrihLogo } from "../ui/Logo";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEW = { once: true, margin: "0px 0px -120px 0px" } as const; // only the bottom edge: devices that start off to the side still trigger
const TABLET_IN = 0.9, PHONE_IN = 1.35, ZOOM_AT = 3.1; // seconds after the scene enters the view

/** Glass reflection laid over every screen. */
const Glare = () => <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(118deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_30%,rgba(255,255,255,0)_44%)]" />;

/** Light sweep that crosses a screen once when it powers on. */
const PowerOn = ({ delay, run }: { delay: number; run: boolean }) => (
  <>
    <motion.div initial={{ opacity: 1 }} animate={run ? { opacity: 0 } : undefined} transition={{ duration: 0.8, delay }} className="pointer-events-none absolute inset-0 bg-[#07080C] z-20" />
    <motion.div initial={{ x: "-130%" }} animate={run ? { x: "260%" } : undefined} transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeInOut" }} className="pointer-events-none absolute inset-y-0 w-1/3 z-20 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)]" />
  </>
);

/** Mini version of the site header, shared by the tablet and phone screens. */
function MiniNav({ pills = 4 }: { pills?: number }) {
  return (
    <div className="flex items-center justify-between px-[5%] py-[3%] border-b border-slate-100 bg-white">
      <QuantrihLogo variant="bars" size="sm" className="text-[#1B3F72] [&>span]:!text-slate-900 [&>span]:!text-[7px]" />
      <span className="flex gap-[3px]">
        {Array.from({ length: pills }).map((_, i) => <span key={i} className={`h-[5px] rounded-full ${i === 1 ? "w-5 bg-[#1B3F72]" : "w-3 bg-slate-200"}`} />)}
      </span>
    </div>
  );
}

/** Phone screen, styled after a stock analysis on the Market page. */
function MarketScreen({ fr, run }: { fr: boolean; run: boolean }) {
  const metrics = [["P/E", 0.55], [fr ? "Marge nette" : "Net margin", 0.72], ["ROE", 0.8], [fr ? "Dette" : "Debt", 0.35], [fr ? "Dividende" : "Dividend", 0.25], ["Beta", 0.6]] as const;
  return (
    <div className="absolute inset-0 bg-white flex flex-col text-slate-900 text-[7px] leading-tight">
      <div className="flex items-center justify-between px-[9%] pt-[3%] text-[6px] font-semibold text-slate-700"><span>9:41</span><span className="w-[9px] h-[5px] rounded-[1px] border border-slate-500" /></div>
      <div className="mt-[9%]"><MiniNav pills={2} /></div>
      <div className="px-[7%] pt-[5%] flex-1 flex flex-col gap-[3.5%]">
        <div className="h-[7%] rounded-full border border-slate-200 flex items-center px-[6%] text-[6px] text-slate-400">{fr ? "Rechercher une action..." : "Search a stock..."}</div>
        <div className="flex gap-[6%] text-[6px] font-semibold"><span className="text-[#1B3F72] border-b border-[#1B3F72] pb-[2px]">{fr ? "Analyse" : "Analysis"}</span><span className="text-slate-400">{fr ? "États financiers" : "Financials"}</span></div>
        <div className="flex items-center gap-[5%]">
          <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white text-[7px] font-bold">A</span>
          <span><b className="block text-[8px]">Apple Inc.</b><span className="text-[5.5px] text-slate-400">AAPL · NasdaqGS</span></span>
        </div>
        <div className="rounded-lg border border-slate-200 p-[5%]">
          <svg viewBox="0 0 100 40" className="w-full">
            <defs><linearGradient id="mkArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18B8A0" stopOpacity="0.3" /><stop offset="1" stopColor="#18B8A0" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 32 L10 28 L18 30 L28 22 L38 25 L48 17 L58 19 L68 12 L80 14 L90 7 L100 5 L100 40 L0 40 Z" fill="url(#mkArea)" />
            <motion.path d="M0 32 L10 28 L18 30 L28 22 L38 25 L48 17 L58 19 L68 12 L80 14 L90 7 L100 5" fill="none" stroke="#18B8A0" strokeWidth="1.8" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={run ? { pathLength: [0, 1, 1] } : undefined} transition={{ duration: 4, times: [0, 0.55, 1], delay: 2.8, repeat: Infinity }} />
          </svg>
          <div className="flex justify-between mt-1 text-[5px] text-slate-400">{["1M", "6M", "1Y", "5Y"].map((x, i) => <span key={x} className={i === 2 ? "text-[#1B3F72] font-bold" : ""}>{x}</span>)}</div>
        </div>
        <div className="grid grid-cols-2 gap-[5px]">
          {metrics.map(([label, k], i) => (
            <div key={label} className="rounded-md bg-slate-50 p-[6px]">
              <p className="text-[5.5px] text-slate-500">{label}</p>
              <div className="mt-[3px] h-[3px] rounded-full bg-slate-200 overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#1B3F72]" style={{ transformOrigin: "left" }} initial={{ scaleX: 0 }} animate={run ? { scaleX: k } : undefined} transition={{ duration: 0.8, delay: 3 + i * 0.1 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-slate-200 p-[6px]">
          <p className="text-[5.5px] text-slate-500 mb-[3px]">{fr ? "Consensus des analystes" : "Analyst consensus"}</p>
          <div className="flex h-[4px] rounded-full overflow-hidden">
            <motion.span className="bg-emerald-500" initial={{ width: 0 }} animate={run ? { width: "58%" } : undefined} transition={{ duration: 0.8, delay: 3.6 }} />
            <motion.span className="bg-slate-300" initial={{ width: 0 }} animate={run ? { width: "30%" } : undefined} transition={{ duration: 0.8, delay: 3.8 }} />
            <motion.span className="bg-[#9F1239]" initial={{ width: 0 }} animate={run ? { width: "12%" } : undefined} transition={{ duration: 0.8, delay: 4 }} />
          </div>
        </div>
        <div className="mt-auto mx-auto mb-[4%] w-[34%] h-[3px] rounded-full bg-slate-900/70" />
      </div>
    </div>
  );
}

/**
 * Tablet and desktop display (real recordings of a backtest) and smartphone
 * (stock analysis) on the right. The display rises first, the tablet
 * turns in, the phone spins in, the screens power on, then the display moves forward so the backtest
 * can be read. Everything ends flat (no lasting 3D tilt) so the screens stay sharp.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, tabletMp4, tabletWebm, tabletPoster, desktopAlt, fr = false }: { videoMp4: string; videoWebm: string; poster: string; tabletMp4: string; tabletWebm: string; tabletPoster: string; desktopAlt: string; fr?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.7 });
  const sideY = useTransform(p, [0, 1], [24, -24]);
  // the side devices start off-screen, so everything follows the whole scene entering the view
  const run = useInView(ref, { once: true, margin: "0px 0px -120px 0px" });

  return (
    <div ref={ref} className="relative w-full max-w-[1240px] mx-auto select-none">
      <div className="relative z-10 flex items-end justify-center gap-[3.5%] pb-6 [perspective:1600px]">
        {/* ── Tablet on its stand: backtest recording in the tablet layout ── */}
        <motion.div style={{ y: sideY }} className="relative w-[20%] hidden md:block z-10">
          <motion.div
            initial={{ opacity: 0, x: -260, rotateY: 75, rotateZ: -14, scale: 0.7 }}
            animate={run ? { opacity: [0, 1, 1], x: [-260, 0, -24], rotateY: [75, 0, 0], rotateZ: [-14, 0, 0], scale: [0.7, 1, 0.96] } : undefined}
            transition={{ duration: ZOOM_AT + 0.8 - TABLET_IN, times: [0, 0.55, 1], delay: TABLET_IN, ease: EASE }}
          >
            <div className="relative rounded-[22px] p-[2.5px] bg-[linear-gradient(160deg,#F5F6F8,#A3A9B2)] shadow-[0_40px_70px_-30px_rgba(15,23,42,0.7)]">
              <div className="relative rounded-[20px] bg-[#07080C] p-[4%]">
                <div className="relative overflow-hidden rounded-[12px] bg-white aspect-[3/4]">
                  {/* real recording of a backtest in the tablet layout */}
                  <video className="absolute inset-0 w-full h-full object-cover object-top" autoPlay muted loop playsInline preload="metadata" poster={tabletPoster} aria-label={desktopAlt}>
                    <source src={tabletWebm} type="video/webm" />
                    <source src={tabletMp4} type="video/mp4" />
                  </video>
                  <PowerOn delay={TABLET_IN + 0.8} run={run} />
                  <Glare />
                </div>
                <span className="absolute left-1/2 top-[1.6%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1E2128]" />
              </div>
            </div>
            {/* angled aluminium holder */}
            <div className="mx-auto -mt-[6%] w-[46%] h-[34px] bg-[linear-gradient(180deg,#D9DCE1,#AEB3BB)] [clip-path:polygon(20%_0,80%_0,100%_100%,0_100%)] -z-10 relative" />
            <div className="mx-auto w-[62%] h-[7px] rounded-[50%] bg-[linear-gradient(180deg,#F1F2F4,#9EA4AD)] shadow-[0_10px_14px_-6px_rgba(15,23,42,0.5)]" />
          </motion.div>
        </motion.div>

        {/* ── Desktop display: backtest recording, moves forward once the others have landed ── */}
        <motion.div
          className="relative w-[94%] md:w-[52%] z-20"
          style={{ transformOrigin: "50% 100%" }}
          initial={{ opacity: 0, y: 100, rotateX: 30, scale: 0.88 }}
          animate={run ? { opacity: 1, y: [100, 0, 0, -6], rotateX: [30, 0, 0, 0], scale: [0.88, 1, 1, 1.12] } : undefined}
          transition={{ opacity: { duration: 0.6 }, default: { duration: ZOOM_AT + 1.2, times: [0, 0.3, 0.72, 1], ease: EASE } }}
        >
          {/* body: aluminium edge, ultra thin black border, depth layer behind */}
          <div className="relative">
            <div className="absolute inset-0 translate-y-[6px] translate-x-[4px] rounded-[16px] bg-[linear-gradient(135deg,#C8CCD3,#8F959E)] -z-10" />
            <div className="relative rounded-[16px] p-[2.5px] bg-[linear-gradient(180deg,#F3F4F6,#B7BCC4)] shadow-[0_70px_110px_-55px_rgba(15,23,42,0.8)]">
              <div className="relative rounded-[14px] bg-[#050507] p-[0.8%]">
                <span className="absolute left-1/2 top-[0.35%] -translate-x-1/2 w-1 h-1 rounded-full bg-[#1d2027] z-10" />
                <div className="relative overflow-hidden rounded-[9px] bg-white aspect-[16/10]">
                  <video className="absolute inset-0 w-full h-full object-cover object-top" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={desktopAlt}>
                    <source src={videoWebm} type="video/webm" />
                    <source src={videoMp4} type="video/mp4" />
                  </video>
                  <PowerOn delay={0.5} run={run} />
                  <Glare />
                </div>
              </div>
            </div>
          </div>
          {/* stand: slanted aluminium arm and a thin foot */}
          <div className="relative mx-auto w-[18%] h-[48px] md:h-[74px] [perspective:400px]">
            <div className="absolute inset-x-[24%] inset-y-0 bg-[linear-gradient(90deg,#A4AAB3_0%,#E2E5E9_30%,#F7F8FA_50%,#D4D7DC_72%,#9DA3AC_100%)] [transform:rotateX(18deg)] origin-top rounded-b-[4px]" />
          </div>
          <div className="relative mx-auto w-[34%] h-[9px] rounded-[6px] bg-[linear-gradient(180deg,#F6F7F9,#BFC4CB_70%,#9AA0A9)] shadow-[0_12px_18px_-8px_rgba(15,23,42,0.45)]" />
        </motion.div>

        {/* ── Smartphone on its dock: stock analysis ── */}
        <motion.div style={{ y: sideY }} className="relative w-[11.5%] hidden md:block z-10">
          <motion.div
            initial={{ opacity: 0, x: 240, y: -60, rotateY: -360, rotateZ: 18, scale: 0.6 }}
            animate={run ? { opacity: [0, 1, 1], x: [240, 0, 24], y: [-60, 0, 0], rotateY: [-360, 0, 0], rotateZ: [18, 0, 0], scale: [0.6, 1, 0.96] } : undefined}
            transition={{ duration: ZOOM_AT + 0.8 - PHONE_IN, times: [0, 0.55, 1], delay: PHONE_IN, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[18%/8.5%] p-[2.5px] bg-[linear-gradient(150deg,#ECEDF0_0%,#8E949D_45%,#DADCE0_70%,#7C828B_100%)] shadow-[0_40px_60px_-22px_rgba(15,23,42,0.8)]">
              <span className="absolute -right-[2.5px] top-[22%] w-[2.5px] h-[9%] rounded-r bg-[#9AA0A9]" />
              <span className="absolute -right-[2.5px] top-[34%] w-[2.5px] h-[6%] rounded-r bg-[#9AA0A9]" />
              <span className="absolute -left-[2.5px] top-[26%] w-[2.5px] h-[12%] rounded-l bg-[#9AA0A9]" />
              <div className="relative rounded-[17%/8%] bg-[#050507] p-[3.5%]">
                <div className="relative overflow-hidden rounded-[14%/6.6%] aspect-[9/19.5]">
                  <MarketScreen fr={fr} run={run} />
                  <span className="absolute left-1/2 top-[1.6%] -translate-x-1/2 w-[6%] aspect-square rounded-full bg-black ring-1 ring-white/10 z-30" />
                  <PowerOn delay={PHONE_IN + 1} run={run} />
                  <Glare />
                </div>
              </div>
            </div>
            {/* dock */}
            <div className="mx-auto -mt-[4%] w-[70%] h-[14px] rounded-t-[6px] rounded-b-[50%] bg-[linear-gradient(180deg,#E6E8EC,#A7ADB6)] shadow-[0_10px_14px_-6px_rgba(15,23,42,0.5)] relative -z-10" />
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
