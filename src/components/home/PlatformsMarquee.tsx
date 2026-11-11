import React from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

/** Profile-style card: round logo, name and one line of text, on white. */
function Card({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  return (
    <div className="shrink-0 w-[230px] rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1">
      <div className="h-14" style={{ background: `linear-gradient(120deg, ${p.color}26, ${p.color}0D)` }} />
      <div className="px-5 pb-5 -mt-9 text-center">
        <span className="relative mx-auto flex w-[72px] h-[72px] rounded-full bg-white ring-4 ring-white shadow-md items-center justify-center text-2xl font-bold overflow-hidden" style={{ color: p.color }}>
          {p.name.charAt(0)}
          <img src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`} alt="" className="absolute inset-0 m-auto w-11 h-11 object-contain bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </span>
        <p className="mt-3 text-base font-semibold text-slate-900 truncate">{p.name}</p>
        <p className="mt-1 text-[13px] text-slate-500 leading-snug line-clamp-2 min-h-[2.5em]">{fr ? p.bestFor.fr : p.bestFor.en}</p>
      </div>
    </div>
  );
}

/** One row of platform cards drifting sideways; pauses on hover. */
export function PlatformsMarquee({ fr }: { fr: boolean }) {
  const list = INVESTMENT_PLATFORMS;
  return (
    <div className="overflow-hidden group py-2 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <div className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 4}s` }}>
        {[...list, ...list].map((p, k) => <Card key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
