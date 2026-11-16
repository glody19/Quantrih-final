import React, { useEffect, useRef } from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

const MAX_ZOOM = 0.16; // the logo at the very centre is 16% larger

// Logos checked by eye and saved with the site. Platforms whose official icon is cut off, tiny or
// unreadable on a round badge are left out of this row (they stay on the platforms page).
const LOGOS: Record<string, string> = {
  beobank: "/logos/beobank.png", bnp_paribas: "/logos/bnp_paribas.jpg", bnp_fortis: "/logos/bnp_fortis.png",
  credit_agricole: "/logos/credit_agricole.png", fortuneo: "/logos/fortuneo.png", saxo: "/logos/saxo.png",
  ing: "/logos/ing.png", keytrade: "/logos/keytrade.png", mexem: "/logos/mexem.png",
  trade_republic: "/logos/trade_republic.png", bourse_direct: "/logos/bourse_direct.jpg",
};

// icons that are already a coloured square fill the tile edge to edge; the others sit on white
const FULL = new Set(["ing", "bnp_paribas", "bnp_fortis", "bourse_direct"]);

/** Small rounded square with the logo, then the name and what it offers. */
function Badge({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  const full = FULL.has(p.id);
  return (
    <div className="shrink-0 w-[190px] flex flex-col items-center text-center" title={p.name}>
      <span data-zoom className="relative flex w-20 h-20 rounded-[18px] bg-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)] items-center justify-center overflow-hidden will-change-transform">
        <img src={LOGOS[p.id]} alt={p.name} className={full ? "w-full h-full object-cover" : "w-[76%] h-[76%] object-contain"} loading="lazy" />
      </span>
      <span className="mt-4 text-[15px] font-semibold text-white">{p.name}</span>
      <span className="mt-1 text-[13px] leading-snug text-white/65 line-clamp-2 min-h-[2.6em]">{fr ? p.bestFor.fr : p.bestFor.en}</span>
    </div>
  );
}

/**
 * One row of platform logos drifting sideways (CSS animation, pauses on hover).
 * Each logo grows a little as it passes the middle of the screen, then shrinks back.
 * The loop only runs while the row is on screen.
 */
export function PlatformsMarquee({ fr }: { fr: boolean }) {
  // platforms with a clean logo, Belgian ones first (those also open to French clients come right after the Belgium-only ones)
  const rank = (p: InvestmentPlatform) => (p.markets[0] === "BE" ? (p.markets.length === 1 ? 0 : 1) : p.markets.includes("BE") ? 2 : 3);
  const list = INVESTMENT_PLATFORMS.filter((p) => LOGOS[p.id]).sort((a, b) => rank(a) - rank(b));
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
      <div className="flex w-max gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 2.3}s` }}>
        {[...list, ...list].map((p, k) => <Badge key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
