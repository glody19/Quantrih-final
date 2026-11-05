import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ExternalLink, Minus, Star } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { cn } from "../../lib/utils";
import { PLATFORMS } from "./platformsData";

type Platform = (typeof PLATFORMS)[number];
type Filter = "all" | "broker" | "crypto" | "neobank" | "bank" | "screener";

// Website domain and brand colour per platform: drives the logo lookup, the card accent and the "visit" link.
const BRAND: Record<string, { domain: string; color: string }> = {
  interactive_brokers: { domain: "interactivebrokers.com", color: "#D81222" },
  degiro: { domain: "degiro.com", color: "#00A3E0" },
  trade_republic: { domain: "traderepublic.com", color: "#111111" },
  scalable_capital: { domain: "scalable.capital", color: "#2E3B4E" },
  bloomberg: { domain: "bloomberg.com", color: "#000000" },
  trading212: { domain: "trading212.com", color: "#2B9BE7" },
  etoro: { domain: "etoro.com", color: "#13C636" },
  charles_schwab: { domain: "schwab.com", color: "#00A0DF" },
  fidelity: { domain: "fidelity.com", color: "#368727" },
  vanguard: { domain: "vanguard.com", color: "#96151D" },
  robinhood: { domain: "robinhood.com", color: "#00C805" },
  webull: { domain: "webull.com", color: "#0D6EFD" },
  xtb: { domain: "xtb.com", color: "#E2001A" },
  saxo_bank: { domain: "home.saxo", color: "#1E2A78" },
  boursorama: { domain: "boursobank.com", color: "#D6006D" },
  fortuneo: { domain: "fortuneo.fr", color: "#6CB33F" },
  tastytrade: { domain: "tastytrade.com", color: "#E31937" },
  wealthsimple: { domain: "wealthsimple.com", color: "#333333" },
  questrade: { domain: "questrade.com", color: "#3E8E41" },
  binance: { domain: "binance.com", color: "#F0B90B" },
  coinbase: { domain: "coinbase.com", color: "#0052FF" },
  kraken: { domain: "kraken.com", color: "#5741D9" },
  kucoin: { domain: "kucoin.com", color: "#23AF91" },
  bitstamp: { domain: "bitstamp.net", color: "#1A9A4B" },
  gemini: { domain: "gemini.com", color: "#00B8D9" },
  crypto_com: { domain: "crypto.com", color: "#103F68" },
  bybit: { domain: "bybit.com", color: "#F7A600" },
  okx: { domain: "okx.com", color: "#111111" },
  htx: { domain: "htx.com", color: "#1B5FFF" },
  plus500: { domain: "plus500.com", color: "#0A2A4A" },
  ig: { domain: "ig.com", color: "#E30613" },
  revolut: { domain: "revolut.com", color: "#191C1F" },
  n26: { domain: "n26.com", color: "#36A18B" },
  credit_agricole: { domain: "credit-agricole.fr", color: "#007461" },
  bnp_paribas: { domain: "bnpparibas.com", color: "#00915A" },
  bolero: { domain: "bolero.be", color: "#00AEEF" },
  keytrade: { domain: "keytradebank.be", color: "#E3007E" },
  mexem: { domain: "mexem.com", color: "#0B3D91" },
  lightyear: { domain: "lightyear.com", color: "#1F1F1F" },
  ing: { domain: "ing.be", color: "#FF6200" },
  kbc: { domain: "kbc.be", color: "#00AEEF" },
  belfius: { domain: "belfius.be", color: "#C30045" },
};

const FILTERS: Filter[] = ["all", "broker", "neobank", "bank", "crypto", "screener"];

function PlatformLogo({ platform }: { platform: Platform }) {
  const brand = BRAND[platform.id];
  const sources = [
    brand ? `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128` : "",
    platform.logo,
  ].filter(Boolean);
  const [index, setIndex] = useState(0);
  const initials = platform.name
    .replace(/\(.*\)/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden shrink-0">
      {index < sources.length ? (
        <img
          src={sources[index]}
          alt={platform.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setIndex((i) => i + 1)}
          className="w-8 h-8 object-contain"
        />
      ) : (
        <span
          className="text-sm font-bold text-white w-full h-full flex items-center justify-center"
          style={{ backgroundColor: brand?.color || "#5B4BDB" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

export function Platforms(_props: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () => PLATFORMS.filter((p) => filter === "all" || p.type === filter).sort((a, b) => b.rating - a.rating),
    [filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PLATFORMS.length };
    PLATFORMS.forEach((p) => (c[p.type] = (c[p.type] || 0) + 1));
    return c;
  }, []);

  return (
    <MobileZoomWrapper scaleMobile={0.8}>
      <div className="page-container pb-24 mt-6 min-h-[calc(100vh-120px)] font-sans">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-text">{t("platforms.title")}</h1>
          <p className="text-sm text-text-3 max-w-2xl">{t("platforms.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {FILTERS.filter((f) => counts[f]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                filter === f ? "bg-text text-bg border-text" : "bg-surface text-text-3 border-border hover:border-border-2"
              )}
            >
              {t(`platforms.filter.${f}`)}
              <span className="ml-1.5 opacity-60 font-mono">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {list.map((p, i) => {
            const brand = BRAND[p.id];
            const color = brand?.color || "#5B4BDB";
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="relative flex flex-col bg-surface border border-border rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(20,20,26,0.04)] hover:shadow-[0_14px_36px_rgba(20,20,26,0.08)] transition-shadow"
              >
                {/* Brand colour band */}
                <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}CC 55%, ${color}88 100%)` }}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 85% 20%, white 0, transparent 45%)" }} />
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide text-white bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {t(`platforms.type.${p.type}`)}
                  </span>
                </div>

                <div className="relative z-10 px-5 pb-5 -mt-6 flex flex-col gap-3 flex-grow">
                  <div className="flex items-end justify-between gap-3">
                    <PlatformLogo platform={p} />
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-2">
                      <Star size={12} className="fill-gold text-gold" />
                      {p.rating.toFixed(1)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text leading-tight">{p.name}</h3>
                    <p className="text-xs text-text-3 mt-1 leading-relaxed line-clamp-2">{p.bestFor}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-4">{t("platforms.fees")}</span>
                    <span className="font-semibold text-text-2 px-2 py-0.5 rounded-md bg-surface-3">{p.fees}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {p.features.slice(0, 4).map((f) => (
                      <span key={f} className="text-[10px] font-medium text-text-3 border border-border rounded-full px-2 py-0.5">
                        {f}
                      </span>
                    ))}
                  </div>

                  <ul className="flex flex-col gap-1.5 text-xs text-text-2 pt-1">
                    {p.pros.slice(0, 2).map((x) => (
                      <li key={x} className="flex gap-1.5">
                        <Check size={13} className="text-green shrink-0 mt-0.5" />
                        <span className="leading-snug">{x}</span>
                      </li>
                    ))}
                    {p.cons.slice(0, 1).map((x) => (
                      <li key={x} className="flex gap-1.5 text-text-3">
                        <Minus size={13} className="text-red shrink-0 mt-0.5" />
                        <span className="leading-snug">{x}</span>
                      </li>
                    ))}
                  </ul>

                  {brand && (
                    <a
                      href={`https://${brand.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-text-2 hover:text-pv-blue transition-colors"
                    >
                      {t("platforms.visit")}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="text-[11px] text-text-4 mt-10 max-w-3xl">{t("platforms.disclaimer")}</p>
      </div>
    </MobileZoomWrapper>
  );
}
