import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Desktop monitor + laptop, upright and front-facing, with a subtle 3D depth effect
 * that follows the mouse. Screens show real screenshots of Quantrih backtest results.
 */
export function DeviceShowcase({ desktopSrc, laptopSrc, desktopAlt, laptopAlt }: { desktopSrc: string; laptopSrc: string; desktopAlt: string; laptopAlt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative w-full max-w-6xl mx-auto [perspective:1800px] select-none">
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative pb-8">
        {/* ── Desktop monitor ── */}
        <div className="relative w-[82%] mx-auto md:mx-0 md:ml-[2%]" style={{ transform: "translateZ(0px)" }}>
          {/* bezel */}
          <div className="relative rounded-[18px] bg-gradient-to-b from-[#2A2D35] to-[#16181D] p-[1.6%] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.55),0_18px_30px_-18px_rgba(15,23,42,0.4)] ring-1 ring-black/40">
            <div className="absolute inset-x-0 top-0 h-px rounded-t-[18px] bg-white/25" />
            <div className="relative overflow-hidden rounded-[6px] bg-white aspect-[16/10]">
              <img src={desktopSrc} alt={desktopAlt} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
              {/* glass reflection */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_38%)]" />
            </div>
          </div>
          {/* chin + neck + foot */}
          <div className="mx-auto h-[26px] w-[16%] bg-gradient-to-b from-[#C9CDD4] to-[#9AA0A9]" style={{ clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)" }} />
          <div className="mx-auto h-[12px] w-[34%] rounded-[50%/100%_100%_0_0] bg-gradient-to-b from-[#D6D9DE] to-[#A9AEB6] shadow-[0_12px_18px_-8px_rgba(15,23,42,0.45)]" />
        </div>

        {/* ── Laptop ── */}
        <div className="absolute right-0 bottom-0 w-[50%] hidden md:block" style={{ transform: "translateZ(80px)" }}>
          <div className="relative rounded-t-[14px] bg-gradient-to-b from-[#2A2D35] to-[#121418] p-[2.2%] pb-[3%] ring-1 ring-black/40 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.6)]">
            <div className="absolute left-1/2 top-[0.9%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3a3d45]" />
            <div className="relative overflow-hidden rounded-[4px] bg-white aspect-[16/10]">
              <img src={laptopSrc} alt={laptopAlt} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_40%)]" />
            </div>
          </div>
          {/* base (keyboard deck seen from the front) */}
          <div className="relative -mx-[7%] h-[14px] rounded-b-[14px] bg-gradient-to-b from-[#E3E6EA] via-[#C8CCD3] to-[#9DA3AC] shadow-[0_22px_28px_-14px_rgba(15,23,42,0.55)]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[5px] w-[16%] rounded-b-md bg-[#AEB3BB]" />
          </div>
        </div>

        {/* floor shadow */}
        <div className="absolute left-[6%] right-[2%] bottom-0 h-6 rounded-[50%] bg-slate-900/15 blur-xl" style={{ transform: "translateZ(-40px)" }} />
      </motion.div>
    </div>
  );
}
