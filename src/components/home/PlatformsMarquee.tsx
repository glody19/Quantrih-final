import React, { useEffect, useRef } from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

const COUNTRY = { BE: { fr: "Belgique", en: "Belgium" }, FR: { fr: "France", en: "France" } } as const;
const MAX_ZOOM = 0.16; // the logo at the very centre is 16% larger

/** Round logo in the same frame for every platform, then its name, what it offers and its country. */
function Badge({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  return (
    <div className="shrink-0 w-[190px] flex flex-col items-center text-center" title={p.name}>
      <span data-zoom className="relative flex w-24 h-24 rounded-full bg-white ring-4 ring-white/10 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)] items-center justify-center text-3xl font-bold overflow-hidden will-change-transform" style={{ color: p.color }}>
        {p.name.charAt(0)}
        <img src={`/api/logo?domain=${p.domain}&sz=128`} alt={p.name} className="absolute inset-0 m-auto w-14 h-14 object-contain bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </span>
      <span className="mt-4 text-[15px] font-semibold text-white">{p.name}</span>
      <span className="mt-1 text-[13px] leading-snug text-white/65 line-clamp-2 min-h-[2.6em]">{fr ? p.bestFor.fr : p.bestFor.en}</span>
      <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B6ABF7]">{p.markets.map((m) => COUNTRY[m][fr ? "fr" : "en"]).join(" · ")}</span>
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
    <div ref={ref} className="overflow-hidden group py-5">
      <div className="flex w-max gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 3.6}s` }}>
        {[...list, ...list].map((p, k) => <Badge key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
