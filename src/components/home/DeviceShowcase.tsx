import React, { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { QuantrihLogo } from "../ui/Logo";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEW = { once: true, margin: "0px 0px -120px 0px" } as const; // only the bottom edge: devices that start off to the side still trigger

/** Glass reflection laid over every screen. */
const Glare = () => <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_30%,rgba(255,255,255,0)_44%)]" />;

/** Light sweep that crosses a screen once when it powers on. */
const PowerOn = ({ delay }: { delay: number }) => (
  <>
    <motion.div initial={{ opacity: 1 }} whileInView={{ opacity: 0 }} viewport={VIEW} transition={{ duration: 0.8, delay }} className="pointer-events-none absolute inset-0 bg-[#07080C] z-20" />
    <motion.div initial={{ x: "-130%" }} whileInView={{ x: "260%" }} viewport={VIEW} transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeInOut" }} className="pointer-events-none absolute inset-y-0 w-1/3 z-20 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)]" />
  </>
);

/** Demo recording, used by the display and (cropped on the results) by the tablet. */
function Demo({ mp4, webm, poster, label, position = "top" }: { mp4: string; webm: string; poster: string; label: string; position?: string }) {
  return (
    <video className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: position }} autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={label}>
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

/** Screen of the coming mobile app: a portfolio curve that keeps redrawing, a donut, the four tools and the platforms. */
function PhoneScreen({ fr }: { fr: boolean }) {
  const tools = [
    { t: "Asset Allocation", c: "#7B6CF0" },
    { t: "Backtesting", c: "#18B8A0" },
    { t: "Tactical", c: "#E0B341" },
    { t: "Monte Carlo", c: "#3B82F6" },
  ];
  const C = 2 * Math.PI * 13;
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#231E6B_0%,#0B0A24_60%)] text-white flex flex-col px-[8%] pt-[17%] pb-[5%] gap-[3.2%] text-[7px] leading-tight">
      <div className="flex items-center justify-between text-[6px] text-white/70 absolute top-[2.6%] left-[9%] right-[9%]">
        <span className="font-semibold">9:41</span>
        <span className="w-[9px] h-[5px] rounded-[1px] border border-white/70" />
      </div>
      <div className="flex items-center justify-between">
        <QuantrihLogo variant="bars" size="sm" className="text-[#B6ABF7] [&>span]:!text-white" />
        <span className="w-4 h-4 rounded-full bg-white/10" />
      </div>
      <div className="rounded-xl bg-white/[0.07] p-[7%]">
        <p className="text-white/55 uppercase tracking-wider text-[5.5px]">{fr ? "Mon portefeuille" : "My portfolio"}</p>
        <svg viewBox="0 0 100 36" className="w-full mt-1">
          <defs><linearGradient id="phArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18B8A0" stopOpacity="0.35" /><stop offset="1" stopColor="#18B8A0" stopOpacity="0" /></linearGradient></defs>
          <path d="M0 30 L12 26 L22 28 L34 19 L46 22 L58 13 L70 16 L82 8 L100 4 L100 36 L0 36 Z" fill="url(#phArea)" />
          <motion.path d="M0 30 L12 26 L22 28 L34 19 L46 22 L58 13 L70 16 L82 8 L100 4" fill="none" stroke="#18B8A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 4, times: [0, 0.55, 1], repeat: Infinity, ease: "easeInOut" }} />
        </svg>
      </div>
      <div className="flex items-center gap-[8%] rounded-xl bg-white/[0.07] p-[6%]">
        <svg viewBox="0 0 34 34" className="w-[36%] -rotate-90 shrink-0">
          <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          {([["#7B6CF0", 0.5, 0], ["#18B8A0", 0.3, 0.5], ["#E0B341", 0.2, 0.8]] as const).map(([c, len, off], i) => (
            <motion.circle key={i} cx="17" cy="17" r="13" fill="none" stroke={c} strokeWidth="6" strokeDashoffset={-off * C}
              animate={{ strokeDasharray: [`0 ${C}`, `${len * C} ${C}`, `${len * C} ${C}`] }} transition={{ duration: 5, times: [0, 0.3, 1], delay: i * 0.25, repeat: Infinity }} />
          ))}
        </svg>
        <div className="grid gap-[3px] flex-1">
          {["#7B6CF0", "#18B8A0", "#E0B341"].map((c, i) => <span key={c} className="h-[3px] rounded-full" style={{ background: c, width: `${90 - i * 25}%` }} />)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[5px]">
        {tools.map((x, i) => (
          <motion.div key={x.t} className="rounded-lg p-[6px] font-semibold" style={{ background: `${x.c}30` }}
            animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, delay: 1.5 + i * 0.6, repeat: Infinity, repeatDelay: 1.8 }}>
            <span className="block w-2 h-2 rounded-full mb-1" style={{ background: x.c }} />{x.t}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-[5px] items-center">
        <span className="text-white/55 uppercase tracking-wider text-[5.5px] mr-1">{fr ? "Plateformes" : "Platforms"}</span>
        {["#00AEEF", "#E3007E", "#FF6200", "#1E2A78"].map((c) => <span key={c} className="w-[12px] h-[12px] rounded-full bg-white flex items-center justify-center"><span className="w-[6px] h-[6px] rounded-full" style={{ background: c }} /></span>)}
      </div>
      <div className="mt-auto mx-auto w-[34%] h-[3px] rounded-full bg-white/60" />
    </div>
  );
}

/**
 * Tablet on the left, desktop display in the middle, smartphone on the right, standing side by
 * side without covering each other. They rise in one after the other, the screens power on, the
 * display and the tablet play the demo recording, the phone runs an animated app screen.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, desktopAlt, fr = false }: { videoMp4: string; videoWebm: string; poster: string; desktopAlt: string; fr?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.7 });
  const sideY = useTransform(p, [0, 1], [30, -30]);
  // the side devices start off-screen, so they follow the whole scene entering the view (not their own position)
  const sceneIn = useInView(ref, { once: true, margin: "0px 0px -120px 0px" });


  return (
    <div
      ref={ref}
      className="relative w-full max-w-[1240px] mx-auto [perspective:2000px] select-none"
    >
      <div className="relative flex items-end justify-center gap-[3%] pb-10 [perspective:1600px]">
        {/* shadow on the desk */}
        <motion.div initial={{ opacity: 0, scaleX: 0.3 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={VIEW} transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
          className="absolute left-[2%] right-[2%] bottom-2 h-20 rounded-[50%] bg-[radial-gradient(ellipse,rgba(21,18,74,0.26),transparent_70%)] blur-2xl" />

        {/* ── Tablet ── */}
        <motion.div style={{ y: sideY }} className="relative w-[21%] hidden md:block mb-[1.5%]">
          <motion.div initial={{ opacity: 0, x: -260, rotateY: 75, rotateZ: -14, scale: 0.7 }} animate={sceneIn ? { opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 } : undefined}
            transition={{ opacity: { duration: 0.4, delay: 0.9 }, default: { type: "spring", stiffness: 55, damping: 13, delay: 0.9 } }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}>
              <div className="relative rounded-[24px] p-[2.5px] bg-[linear-gradient(160deg,#F3F4F6,#A3A9B2)] shadow-[0_40px_70px_-30px_rgba(15,23,42,0.7)]">
                <div className="relative rounded-[22px] bg-[#07080C] p-[4.5%]">
                  <div className="relative overflow-hidden rounded-[13px] bg-white aspect-[3/4]">
                    <Demo mp4={videoMp4} webm={videoWebm} poster={poster} label={desktopAlt} position="0% 62%" />
                    <PowerOn delay={1.6} />
                    <Glare />
                  </div>
                  <span className="absolute left-1/2 top-[1.8%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1E2128]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Desktop display ── */}
        <div className="relative w-[92%] md:w-[54%] z-10">
          <motion.div initial={{ opacity: 0, y: 100, rotateX: 30, scale: 0.88 }} whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} viewport={VIEW}
            transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }} style={{ transformOrigin: "50% 100%" }}>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <div className="relative rounded-[18px] p-[3px] bg-[linear-gradient(180deg,#ECEEF1,#B5BAC2)] shadow-[0_60px_100px_-50px_rgba(15,23,42,0.75)]">
                <div className="relative rounded-[15px] bg-[#07080C] p-[1.1%]">
                  <div className="relative overflow-hidden rounded-[8px] bg-white aspect-[16/10]">
                    <Demo mp4={videoMp4} webm={videoWebm} poster={poster} label={desktopAlt} />
                    <PowerOn delay={0.5} />
                    <Glare />
                  </div>
                </div>
              </div>
              <div className="relative mx-auto w-[10%] h-[50px] md:h-[78px] bg-[linear-gradient(90deg,#A9AEB7_0%,#E4E6EA_35%,#F6F7F9_50%,#D3D6DB_70%,#A2A8B1_100%)]" />
              <div className="relative mx-auto w-[32%] h-[12px] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_30%,#F4F5F7,#C3C7CE_60%,#9AA0A9)] shadow-[0_14px_20px_-8px_rgba(15,23,42,0.45)]" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Smartphone: thin even bezels, titanium frame, punch-hole camera, side buttons ── */}
        <motion.div style={{ y: sideY }} className="relative w-[12.5%] hidden md:block mb-[1.5%]">
          <motion.div initial={{ opacity: 0, x: 240, y: -60, rotateY: -360, rotateZ: 18, scale: 0.6 }} animate={sceneIn ? { opacity: 1, x: 0, y: 0, rotateY: 0, rotateZ: 0, scale: 1 } : undefined}
            transition={{ opacity: { duration: 0.3, delay: 1.35 }, rotateY: { duration: 1.5, delay: 1.35, ease: [0.22, 1, 0.36, 1] }, default: { type: "spring", stiffness: 55, damping: 12, delay: 1.35 } }}>
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}>
              <div className="relative rounded-[18%/8.5%] p-[2.5px] bg-[linear-gradient(150deg,#E9EAEE_0%,#8E949D_45%,#D8DADF_70%,#7C828B_100%)] shadow-[0_40px_60px_-22px_rgba(15,23,42,0.8)]">
                <span className="absolute -right-[2.5px] top-[22%] w-[2.5px] h-[9%] rounded-r bg-[#9AA0A9]" />
                <span className="absolute -right-[2.5px] top-[34%] w-[2.5px] h-[6%] rounded-r bg-[#9AA0A9]" />
                <span className="absolute -left-[2.5px] top-[26%] w-[2.5px] h-[12%] rounded-l bg-[#9AA0A9]" />
                <div className="relative rounded-[17%/8%] bg-[#050507] p-[3.5%]">
                  <div className="relative overflow-hidden rounded-[14%/6.6%] aspect-[9/19.5]">
                    <PhoneScreen fr={fr} />
                    <span className="absolute left-1/2 top-[1.6%] -translate-x-1/2 w-[6%] aspect-square rounded-full bg-black ring-1 ring-white/10 z-10" />
                    <PowerOn delay={2.4} />
                    <Glare />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
