import React, { useEffect, useRef } from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

const MAX_ZOOM = 0.16; // the logo at the very centre is 16% larger

/**
 * A white 3D sphere holding the logo, docked on a soft white pill with the platform's name
 * and its main advantage.
 */
function Badge({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  const advantage = (fr ? p.highlights.fr : p.highlights.en)[0] || (fr ? p.bestFor.fr : p.bestFor.en);
  return (
    <div className="shrink-0 relative flex items-center w-[340px] h-[112px]" title={p.name}>
      <div className="absolute left-[46px] right-0 inset-y-[12px] rounded-full pl-[74px] pr-6 flex flex-col justify-center bg-white border border-slate-200/80 shadow-[0_16px_30px_-18px_rgba(15,23,42,0.35)]">
        <span className="text-[15px] font-bold text-slate-900 truncate">{p.name}</span>
        <span className="mt-1 flex items-start gap-1.5 text-[12.5px] leading-snug text-slate-600">
          <span className="mt-[3px] w-3.5 h-3.5 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-[9px] font-bold">✓</span>
          <span className="line-clamp-2">{advantage}</span>
        </span>
      </div>
      {/* white sphere: soft highlight top-left, shade bottom-right, drop shadow */}
      <span
        data-zoom
        className="relative z-10 flex w-[104px] h-[104px] rounded-full items-center justify-center text-3xl font-bold will-change-transform"
        style={{
          color: p.color,
          background: "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #F7F8FA 38%, #E6E9EF 72%, #CDD2DB 100%)",
          boxShadow: "0 16px 26px -10px rgba(15,23,42,0.45), inset -6px -9px 16px rgba(15,23,42,0.10), inset 4px 5px 10px rgba(255,255,255,0.9)",
        }}
      >
        {p.name.charAt(0)}
        <img src={`/api/logo?domain=${p.domain}&sz=128`} alt={p.name} className="absolute inset-0 m-auto w-[50px] h-[50px] object-contain rounded-lg" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </span>
    </div>
  );
}

/**
 * One row of platform logos drifting sideways (CSS animation, pauses on hover).
 * Each logo grows a little as it passes the middle of the screen, then shrinks back.
 * The loop only runs while the row is on screen.
 */
export function PlatformsMarquee({ fr }: { fr: boolean }) {
  const list = INVESTMENT_PLATFORMS;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const logos = Array.from(root.querySelectorAll<HTMLElement>("[data-zoom]"));
    let raf = 0, visible = false;
    const tick = () => {
      const mid = window.innerWidth / 2, reach = Math.max(220, window.innerWidth * 0.2);
      for (const el of logos) {
        const r = el.getBoundingClientRect();
        const k = Math.max(0, 1 - Math.abs(r.left + r.width / 2 - mid) / reach);
        const s = 1 + MAX_ZOOM * k * k * (3 - 2 * k); // smoothstep, so the growth eases in and out
        el.style.transform = `scale(${s.toFixed(3)})`;
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(root);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="overflow-hidden group py-8">
      <div className="flex w-max gap-6 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 3.6}s` }}>
        {[...list, ...list].map((p, k) => <Badge key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
