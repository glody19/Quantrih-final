import React from "react";
import { INVESTMENT_PLATFORMS, type InvestmentPlatform } from "../../data/investmentPlatforms";

function Card({ p, fr }: { p: InvestmentPlatform; fr: boolean }) {
  return (
    <div
      className="relative shrink-0 w-[300px] md:w-[360px] h-[210px] rounded-[1.75rem] overflow-hidden p-6 flex flex-col justify-between text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-[1.04]"
      style={{ background: `linear-gradient(140deg, ${p.color} 0%, ${p.color}CC 45%, #0B0A24 130%)` }}
    >
      <span className="absolute -right-10 -bottom-14 text-[150px] font-bold leading-none text-white/10 select-none">{p.name.charAt(0)}</span>
      <div className="relative flex items-center justify-between">
        <span className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg text-lg font-bold overflow-hidden" style={{ color: p.color }}>
          {p.name.charAt(0)}
          <img src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`} alt="" className="absolute inset-0 m-auto w-9 h-9 object-contain bg-white" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2.5 py-1 rounded-full">{p.markets.join(" · ")}</span>
      </div>
      <div className="relative">
        <p className="text-2xl font-semibold tracking-tight">{p.name}</p>
        <p className="mt-1 text-sm text-white/80 leading-snug line-clamp-2">{fr ? p.bestFor.fr : p.bestFor.en}</p>
      </div>
    </div>
  );
}

/** Two rows of large platform cards drifting in opposite directions; they pause on hover. */
export function PlatformsMarquee({ fr }: { fr: boolean }) {
  const half = Math.ceil(INVESTMENT_PLATFORMS.length / 2);
  const rows = [INVESTMENT_PLATFORMS.slice(0, half), INVESTMENT_PLATFORMS.slice(half)];
  return (
    <div className="flex flex-col gap-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, i) => (
        <div key={i} className="overflow-hidden group">
          <div
            className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "70s", animationDirection: i === 1 ? "reverse" : "normal" }}
          >
            {[...row, ...row].map((p, k) => <Card key={p.id + k} p={p} fr={fr} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
