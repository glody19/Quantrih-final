import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Desktop monitor playing the demo, with a laptop beside it. The monitor rises and straightens
 * as the section enters, the laptop slides in and opens its lid. Scroll zoom is kept gentle.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, laptopSrc, desktopAlt, laptopAlt }: { videoMp4: string; videoWebm: string; poster: string; laptopSrc: string; desktopAlt: string; laptopAlt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const stageScale = useTransform(p, [0, 0.4, 0.65, 1], [0.9, 1, 1.03, 0.96]);
  const stageY = useTransform(p, [0, 0.4], [70, 0]);
  const monitorTilt = useTransform(p, [0, 0.38], [22, 0]);
  const screenZoom = useTransform(p, [0.35, 0.65, 0.95], [1, 1.08, 1]);
  const laptopX = useTransform(p, [0.08, 0.42], [220, 0]);
  const laptopOpacity = useTransform(p, [0.08, 0.3], [0, 1]);
  const lidRotate = useTransform(p, [0.14, 0.44], [-95, 0]);
  const glow = useTransform(p, [0.2, 0.5, 0.9], [0, 1, 0.4]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [2, -2]), { stiffness: 120, damping: 18 });

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
      <motion.div style={{ scale: stageScale, y: stageY }} className="will-change-transform">
        <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="relative pb-6">
          <motion.div style={{ opacity: glow }} className="absolute left-[10%] right-[10%] -bottom-4 h-32 rounded-[50%] bg-[radial-gradient(ellipse,rgba(123,108,240,0.35),transparent_70%)] blur-2xl" />

          {/* ── Desktop monitor ── */}
          <motion.div style={{ rotateX: monitorTilt, transformOrigin: "50% 100%" }} className="relative w-[92%] md:w-[72%] mx-auto md:mx-0 md:ml-[4%]">
            <div className="relative rounded-[20px] bg-gradient-to-b from-[#E9EBEF] to-[#C9CDD4] p-[1.2%] shadow-[0_40px_80px_-35px_rgba(15,23,42,0.55)] ring-1 ring-black/10">
              <div className="relative rounded-[12px] bg-[#0E1014] p-[1.4%]">
                <div className="relative overflow-hidden rounded-[6px] bg-white aspect-[16/9] [clip-path:inset(0_round_6px)]">
                  <motion.video
                    style={{ scale: screenZoom, transformOrigin: "50% 30%" }}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={desktopAlt}
                  >
                    <source src={videoWebm} type="video/webm" />
                    <source src={videoMp4} type="video/mp4" />
                  </motion.video>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_38%)]" />
                </div>
              </div>
              {/* chin */}
              <div className="h-[22px] md:h-[30px] flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-[#AEB3BB]" /></div>
            </div>
            {/* stand */}
            <div className="mx-auto w-[16%] h-[54px] md:h-[78px] bg-gradient-to-b from-[#B9BEC6] to-[#DDE0E5] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
            <div className="mx-auto w-[28%] h-[10px] rounded-t-md rounded-b-xl bg-gradient-to-b from-[#E3E6EA] to-[#AEB3BB] shadow-[0_14px_22px_-10px_rgba(15,23,42,0.5)]" />
          </motion.div>

          {/* ── Laptop beside it ── */}
          <motion.div style={{ x: laptopX, opacity: laptopOpacity }} className="absolute right-0 bottom-6 w-[38%] hidden md:block [perspective:1200px]">
            <motion.div style={{ rotateX: lidRotate, transformOrigin: "50% 100%" }} className="relative rounded-t-[14px] bg-gradient-to-b from-[#2A2D35] to-[#121418] p-[2%] pb-[2.4%] ring-1 ring-black/50 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.6)]">
              <div className="relative overflow-hidden rounded-[4px] bg-white aspect-[16/10]">
                <img src={laptopSrc} alt={laptopAlt} className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_40%)]" />
              </div>
            </motion.div>
            <div className="relative -mx-[6%] h-[12px] rounded-b-[12px] bg-gradient-to-b from-[#E3E6EA] via-[#C8CCD3] to-[#9DA3AC] shadow-[0_22px_28px_-14px_rgba(15,23,42,0.55)]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[5px] w-[16%] rounded-b-md bg-[#AEB3BB]" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
