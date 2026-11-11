import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Laptop + tablet in 3D. Both devices rise and unfold as the section scrolls into view,
 * the laptop zooms forward while its recording zooms in, then everything eases back out.
 * The whole stage also leans gently towards the cursor.
 */
export function DeviceShowcase({ videoMp4, videoWebm, poster, laptopSrc, desktopAlt, laptopAlt }: { videoMp4: string; videoWebm: string; poster: string; laptopSrc: string; desktopAlt: string; laptopAlt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll-driven choreography (0 = stage enters from the bottom, 1 = it has left at the top)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.6 });
  const stageScale = useTransform(p, [0, 0.38, 0.62, 1], [0.5, 1, 1.12, 0.82]);
  const stageY = useTransform(p, [0, 0.38, 1], [160, 0, -60]);
  const lidRotate = useTransform(p, [0.02, 0.36], [-78, 0]); // lid opens
  const laptopTilt = useTransform(p, [0, 0.38, 1], [34, 4, -6]);
  const screenZoom = useTransform(p, [0.3, 0.62, 0.9], [1, 1.28, 1.05]);
  const tabletX = useTransform(p, [0.08, 0.44], [280, 0]);
  const tabletRotY = useTransform(p, [0.08, 0.44, 1], [-70, -16, -4]);
  const tabletOpacity = useTransform(p, [0.08, 0.3], [0, 1]);
  const glow = useTransform(p, [0.2, 0.55, 0.9], [0, 1, 0.4]);

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 120, damping: 18 });

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
        <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative pb-10">
          {/* light pool under the devices */}
          <motion.div style={{ opacity: glow }} className="absolute left-[8%] right-[8%] -bottom-6 h-40 rounded-[50%] bg-[radial-gradient(ellipse,rgba(123,108,240,0.45),transparent_70%)] blur-2xl" />

          {/* ── Laptop ── */}
          <motion.div style={{ rotateX: laptopTilt, transformStyle: "preserve-3d" }} className="relative w-[86%] md:w-[74%] mx-auto md:mx-0 md:ml-[3%]">
            <motion.div style={{ rotateX: lidRotate, transformOrigin: "50% 100%" }} className="relative rounded-t-[18px] bg-gradient-to-b from-[#2A2D35] to-[#121418] p-[1.6%] pb-[2%] ring-1 ring-black/50 shadow-[0_40px_90px_-30px_rgba(23,20,74,0.7)]">
              <div className="absolute left-1/2 top-[0.7%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3a3d45]" />
              <div className="relative overflow-hidden rounded-[6px] bg-white aspect-[16/10] [clip-path:inset(0_round_6px)]">
                <motion.video
                  style={{ scale: screenZoom, transformOrigin: "50% 30%" }}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={desktopAlt}
                >
                  <source src={videoWebm} type="video/webm" />
                  <source src={videoMp4} type="video/mp4" />
                </motion.video>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_38%)]" />
              </div>
            </motion.div>
            {/* keyboard deck */}
            <div className="relative -mx-[6%] h-[16px] rounded-b-[16px] bg-gradient-to-b from-[#E3E6EA] via-[#C8CCD3] to-[#9DA3AC] shadow-[0_26px_32px_-14px_rgba(15,23,42,0.6)]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[6px] w-[15%] rounded-b-md bg-[#AEB3BB]" />
            </div>
          </motion.div>

          {/* ── Tablet ── */}
          <motion.div
            style={{ x: tabletX, rotateY: tabletRotY, opacity: tabletOpacity, translateZ: 110, transformStyle: "preserve-3d" }}
            className="absolute right-0 bottom-2 w-[30%] hidden md:block"
          >
            <div className="relative rounded-[22px] bg-gradient-to-b from-[#23262D] to-[#0E1014] p-[3.5%] ring-1 ring-black/50 shadow-[0_40px_70px_-25px_rgba(23,20,74,0.75)]">
              <div className="relative overflow-hidden rounded-[12px] bg-white aspect-[3/4]">
                <img src={laptopSrc} alt={laptopAlt} className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_40%)]" />
              </div>
              <div className="absolute left-1/2 top-[1.2%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3a3d45]" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
