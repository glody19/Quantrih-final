import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEW = { once: true, margin: "-120px" } as const;

/** Glass reflection laid over every screen. */
const Glare = () => <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.04)_32%,rgba(255,255,255,0)_45%)]" />;

/** Light sweep that crosses a screen once when it powers on. */
const PowerOn = ({ delay }: { delay: number }) => (
  <>
    <motion.div initial={{ opacity: 1 }} whileInView={{ opacity: 0 }} viewport={VIEW} transition={{ duration: 0.8, delay }} className="pointer-events-none absolute inset-0 bg-[#07080C]" />
    <motion.div initial={{ x: "-130%" }} whileInView={{ x: "260%" }} viewport={VIEW} transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeInOut" }} className="pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)]" />
  </>
);

/**
 * Desktop display in the middle playing the demo, a laptop on the right and a tablet on the left.
 * They rise in one after the other with springs, the screens power on, then everything floats.
 * The scene leans towards the cursor and drifts gently with the scroll.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, laptopSrc, tabletSrc = "/media/backtest-results.jpg", desktopAlt, laptopAlt }: { videoMp4: string; videoWebm: string; poster: string; laptopSrc: string; tabletSrc?: string; desktopAlt: string; laptopAlt: string; fr?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.7 });
  const sideY = useTransform(p, [0, 1], [40, -40]);
  const centerY = useTransform(p, [0, 1], [16, -16]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 110, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 110, damping: 18 });

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
      className="relative w-full max-w-[1180px] mx-auto [perspective:2000px] select-none"
    >
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative pt-4 pb-14">
        {/* soft shadow on the desk */}
        <motion.div initial={{ opacity: 0, scaleX: 0.3 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={VIEW} transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
          className="absolute left-[4%] right-[4%] bottom-4 h-24 rounded-[50%] bg-[radial-gradient(ellipse,rgba(21,18,74,0.28),transparent_70%)] blur-2xl" />

        {/* ── Desktop display (centre, back) ── */}
        <motion.div style={{ y: centerY }} className="relative w-[90%] md:w-[66%] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 110, rotateX: 32, scale: 0.86 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            viewport={VIEW}
            transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
            style={{ transformOrigin: "50% 100%" }}
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              {/* thin aluminium frame, black glass border */}
              <div className="relative rounded-[18px] p-[3px] bg-[linear-gradient(180deg,#E9EBEF,#B9BEC6)] shadow-[0_60px_100px_-50px_rgba(15,23,42,0.75)]">
                <div className="relative rounded-[15px] bg-[#07080C] p-[1.1%]">
                  <div className="relative overflow-hidden rounded-[8px] bg-white aspect-[16/9]">
                    <video className="absolute inset-0 w-full h-full object-cover object-top" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={desktopAlt}>
                      <source src={videoWebm} type="video/webm" />
                      <source src={videoMp4} type="video/mp4" />
                    </video>
                    <PowerOn delay={0.5} />
                    <Glare />
                  </div>
                </div>
              </div>
              {/* stand: slim neck and oval foot */}
              <div className="relative mx-auto w-[9%] h-[56px] md:h-[86px] bg-[linear-gradient(90deg,#A9AEB7_0%,#E4E6EA_35%,#F6F7F9_50%,#D3D6DB_70%,#A2A8B1_100%)] rounded-b-[3px]" />
              <div className="relative mx-auto w-[30%] h-[12px] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_30%,#F4F5F7,#C3C7CE_60%,#9AA0A9)] shadow-[0_14px_20px_-8px_rgba(15,23,42,0.45)]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Tablet (left, front) ── */}
        <motion.div style={{ y: sideY }} className="absolute left-0 bottom-10 w-[22%] hidden md:block z-20">
          <motion.div
            initial={{ opacity: 0, x: -160, rotateY: 40, rotateZ: -8 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 14, rotateZ: -3 }}
            viewport={VIEW}
            transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.55 }}
          >
            <motion.div animate={{ y: [0, -12, 0], rotateZ: [0, 0.8, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}>
              <div className="relative rounded-[26px] p-[2.5px] bg-[linear-gradient(160deg,#F1F2F4,#9EA4AD)] shadow-[0_40px_70px_-30px_rgba(15,23,42,0.75)]">
                <div className="relative rounded-[24px] bg-[#07080C] p-[5%]">
                  <div className="relative overflow-hidden rounded-[12px] bg-white aspect-[3/4]">
                    <img src={tabletSrc} alt="" className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
                    <PowerOn delay={1.1} />
                    <Glare />
                  </div>
                  <span className="absolute left-1/2 top-[2%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1E2128]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Laptop (right, front) ── */}
        <motion.div style={{ y: sideY }} className="absolute right-0 bottom-8 w-[38%] hidden md:block z-20 [perspective:1400px]">
          <motion.div
            initial={{ opacity: 0, x: 170, rotateY: -36 }}
            whileInView={{ opacity: 1, x: 0, rotateY: -12 }}
            viewport={VIEW}
            transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.35 }}
          >
            <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <motion.div
                initial={{ rotateX: -95 }} whileInView={{ rotateX: 0 }} viewport={VIEW}
                transition={{ duration: 1.2, delay: 0.85, ease: EASE }}
                style={{ transformOrigin: "50% 100%" }}
                className="relative mx-[6%] rounded-t-[14px] p-[2px] bg-[linear-gradient(180deg,#D7DADF,#A4AAB3)]"
              >
                <div className="relative rounded-t-[12px] bg-[#07080C] p-[2%] pb-[2.6%]">
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 w-[13%] h-[3.2%] rounded-b-md bg-[#07080C] z-10" />
                  <div className="relative overflow-hidden rounded-[4px] bg-white aspect-[16/10]">
                    <img src={laptopSrc} alt={laptopAlt} className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
                    <PowerOn delay={1.5} />
                    <Glare />
                  </div>
                </div>
              </motion.div>
              {/* base: hinge, then a tapered aluminium deck with the thumb notch */}
              <div className="relative h-[6px] mx-[6%] bg-[#2A2D35]" />
              <div className="relative h-[16px] rounded-b-[14px] bg-[linear-gradient(180deg,#EEF0F3_0%,#CDD1D7_55%,#9AA0A9_100%)] [clip-path:polygon(0_0,100%_0,98.5%_100%,1.5%_100%)] shadow-[0_24px_30px_-14px_rgba(15,23,42,0.6)]">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 h-[5px] w-[14%] rounded-b-md bg-[#B8BDC5]" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
