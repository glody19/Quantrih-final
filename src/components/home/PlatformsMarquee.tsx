import React from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

const COUNTRY = { BE: { fr: "Belgique", en: "Belgium" }, FR: { fr: "France", en: "France" } } as const;

/** Round logo in the same frame for every platform, with its country underneath. */
function Badge({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  return (
    <div className="shrink-0 w-[124px] flex flex-col items-center gap-3" title={p.name}>
      <span className="relative flex w-24 h-24 rounded-full bg-white ring-1 ring-white/40 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)] items-center justify-center text-3xl font-bold overflow-hidden transition-transform duration-300 hover:scale-110" style={{ color: p.color }}>
        {p.name.charAt(0)}
        <img src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`} alt={p.name} className="absolute inset-0 m-auto w-14 h-14 object-contain bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </span>
      <span className="text-xs font-medium tracking-wide text-white/70">{p.markets.map((m) => COUNTRY[m][fr ? "fr" : "en"]).join(" · ")}</span>
    </div>
  );
}

/** One row of platform logos drifting sideways; pauses on hover. */
export function PlatformsMarquee({ fr }: { fr: boolean }) {
  const list = INVESTMENT_PLATFORMS;
  return (
    <div className="overflow-hidden group py-3">
      <div className="flex w-max gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 3}s` }}>
        {[...list, ...list].map((p, k) => <Badge key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
