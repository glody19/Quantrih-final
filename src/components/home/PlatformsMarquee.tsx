import React, { useEffect, useRef } from "react";

const MAX_ZOOM = 0.16; // the logo at the very centre is 16% larger

// Logos checked by eye and saved with the site. full: the icon is already a coloured square and fills the tile.
type Item = { id: string; name: string; logo: string; full?: boolean; en: string; fr: string };

// Brokers: the large international names first, then the European ones
const BROKERS: Item[] = [
  { id: "interactive_brokers", name: "Interactive Brokers", logo: "/logos/interactive_brokers.png", full: true, en: "150+ markets, low margin rates, API access.", fr: "Plus de 150 marchés, marge à bas coût, API." },
  { id: "charles_schwab", name: "Charles Schwab", logo: "/logos/charles_schwab.png", full: true, en: "Full-service brokerage and research.", fr: "Courtage complet et recherche." },
  { id: "fidelity", name: "Fidelity", logo: "/logos/fidelity.png", full: true, en: "Brokerage, funds and retirement accounts.", fr: "Courtage, fonds et comptes retraite." },
  { id: "robinhood", name: "Robinhood", logo: "/logos/robinhood.png", full: true, en: "Commission-free stocks, ETFs and options.", fr: "Actions, ETF et options sans commission." },
  { id: "etoro", name: "eToro", logo: "/logos/etoro.png", full: true, en: "Multi-asset platform with copy trading.", fr: "Plateforme multi-actifs et copy trading." },
  { id: "webull", name: "Webull", logo: "/logos/webull.png", en: "Commission-free trading with advanced charts.", fr: "Trading sans commission, graphiques avancés." },
  { id: "tastytrade", name: "tastytrade", logo: "/logos/tastytrade.png", full: true, en: "Built for options and futures traders.", fr: "Conçu pour les options et les futures." },
  { id: "trading212", name: "Trading 212", logo: "/logos/trading212.png", full: true, en: "Commission-free stocks and ETFs, fractional shares.", fr: "Actions et ETF sans commission, fractions." },
  { id: "xtb", name: "XTB", logo: "/logos/xtb.png", full: true, en: "Stocks, ETFs and CFDs on one platform.", fr: "Actions, ETF et CFD sur une plateforme." },
  { id: "saxo", name: "Saxo", logo: "/logos/saxo.png", en: "Wide instrument range for active investors.", fr: "Large gamme d'instruments pour investisseurs actifs." },
  { id: "trade_republic", name: "Trade Republic", logo: "/logos/trade_republic.png", en: "Mobile broker with ETF savings plans.", fr: "Courtier mobile et plans d'épargne en ETF." },
  { id: "scalable_capital", name: "Scalable Capital", logo: "/logos/scalable_capital.png", full: true, en: "Broker and ETF savings plans.", fr: "Courtier et plans d'épargne en ETF." },
  { id: "ig", name: "IG", logo: "/logos/ig.png", full: true, en: "CFDs, options and share dealing.", fr: "CFD, options et actions." },
  { id: "lightyear", name: "Lightyear", logo: "/logos/lightyear.png", full: true, en: "Low-cost stocks and ETFs, multi-currency.", fr: "Actions et ETF à bas coût, multidevise." },
  { id: "mexem", name: "MEXEM", logo: "/logos/mexem.png", en: "Interactive Brokers technology with local service.", fr: "Technologie Interactive Brokers, service local." },
  { id: "bourse_direct", name: "Bourse Direct", logo: "/logos/bourse_direct.jpg", full: true, en: "Low-cost online broker.", fr: "Courtier en ligne à bas coût." },
  { id: "wealthsimple", name: "Wealthsimple", logo: "/logos/wealthsimple.png", en: "Self-directed and managed investing.", fr: "Investissement autonome ou géré." },
];

const BANKS: Item[] = [
  { id: "ing", name: "ING", logo: "/logos/ing.png", full: true, en: "Self-directed investing inside the banking app.", fr: "Investissement autonome dans l'application bancaire." },
  { id: "bnp_fortis", name: "BNP Paribas Fortis", logo: "/logos/bnp_fortis.png", full: true, en: "Funds, shares and advice in branches.", fr: "Fonds, actions et conseil en agence." },
  { id: "bnp_paribas", name: "BNP Paribas", logo: "/logos/bnp_paribas.jpg", full: true, en: "Securities accounts and managed mandates.", fr: "Comptes-titres et gestion sous mandat." },
  { id: "credit_agricole", name: "Crédit Agricole", logo: "/logos/credit_agricole.png", en: "Securities accounts with branch advisors.", fr: "Comptes-titres et conseillers en agence." },
  { id: "keytrade", name: "Keytrade Bank", logo: "/logos/keytrade.png", en: "Online bank and broker in one account.", fr: "Banque en ligne et courtier dans un seul compte." },
  { id: "beobank", name: "Beobank", logo: "/logos/beobank.png", en: "Funds, shares and pension savings.", fr: "Fonds, actions et épargne-pension." },
  { id: "fortuneo", name: "Fortuneo", logo: "/logos/fortuneo.png", en: "Online bank with a full brokerage offer.", fr: "Banque en ligne avec offre de bourse complète." },
  { id: "revolut", name: "Revolut", logo: "/logos/revolut.png", full: true, en: "Stocks and ETFs inside a multi-currency account.", fr: "Actions et ETF dans un compte multidevise." },
  { id: "n26", name: "N26", logo: "/logos/n26.png", full: true, en: "Mobile bank with stock and ETF trading.", fr: "Banque mobile avec actions et ETF." },
];

/** Small rounded square with the logo, then the name and what it offers. */
function Badge({ p, fr }: { p: Item; fr: boolean }) {
  return (
    <div className="shrink-0 w-[190px] flex flex-col items-center text-center" title={p.name}>
      <span data-zoom className="relative flex w-20 h-20 rounded-[18px] bg-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)] items-center justify-center overflow-hidden will-change-transform">
        <img src={p.logo} alt={p.name} className={p.full ? "w-full h-full object-cover" : "w-[76%] h-[76%] object-contain"} loading="lazy" />
      </span>
      <span className="mt-4 text-[15px] font-semibold text-white">{p.name}</span>
      <span className="mt-1 text-[13px] leading-snug text-white/65 line-clamp-2 min-h-[2.6em]">{fr ? p.fr : p.en}</span>
    </div>
  );
}

/**
 * One row of logos drifting sideways (CSS animation, pauses on hover).
 * Each logo grows a little as it passes the middle of the screen, then shrinks back.
 * The loop only runs while the row is on screen. kind picks brokers or banks; reverse drifts the other way.
 */
export function PlatformsMarquee({ fr, kind = "brokers", reverse = false }: { fr: boolean; kind?: "brokers" | "banks"; reverse?: boolean }) {
  const list = kind === "banks" ? [...BANKS, ...BANKS] : BROKERS;
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
      <div className="flex w-max gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${list.length * 2.6}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        {[...list, ...list].map((p, k) => <Badge key={p.id + k} p={p} fr={fr} />)}
      </div>
    </div>
  );
}
