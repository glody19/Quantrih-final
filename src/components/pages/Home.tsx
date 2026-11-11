import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { AtomAnimation } from "../ui/AtomAnimation";
import { HexBadgeOrbit } from "../ui/HexBadgeOrbit";
import { AllocationsTicker } from "../home/AllocationsTicker";
import { DeviceShowcase } from "../home/DeviceShowcase";
import { PerformanceHeatmap, type HeatRow } from "../home/PerformanceHeatmap";
import { PlatformsMarquee } from "../home/PlatformsMarquee";
import { CryptoTicker } from "../home/CryptoTicker";
import { LazyPortfolios } from "./LazyPortfolios";

// ───────────────────────────── backgrounds (hybrid by section) ─────────────────────────────
// Dark gradient with a fine white grid
const DARK_GRID: React.CSSProperties = {
  backgroundColor: "#0A0920",
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(ellipse 90% 70% at 50% 0%, #1E1A5C 0%, #100E33 45%, #0A0920 100%)",
  backgroundSize: "64px 64px, 64px 64px, 100% 100%",
};
// White with large rectangular cells
const LARGE_GRID: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  backgroundImage:
    "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
  backgroundSize: "120px 64px",
};

// ─────────────────────────────────── data ───────────────────────────────────
const ASSET_CLASSES: (HeatRow & { fr: string })[] = [
  { label: "Commodities", fr: "Matières premières", symbol: "DBC" },
  { label: "Intl Developed Markets", fr: "Marchés développés hors US", symbol: "VEA" },
  { label: "REIT", fr: "Immobilier coté (REIT)", symbol: "VNQ" },
  { label: "US Stock Market", fr: "Actions américaines", symbol: "VTI" },
  { label: "Emerging Markets", fr: "Marchés émergents", symbol: "VWO" },
  { label: "Short Treasuries", fr: "Bons du Trésor courts", symbol: "SHY" },
  { label: "Total Bond Market", fr: "Obligations US (total)", symbol: "BND" },
  { label: "Intermediate Treasuries", fr: "Bons du Trésor moyens", symbol: "IEF" },
  { label: "Gold", fr: "Or", symbol: "GLD" },
  { label: "Global Bonds", fr: "Obligations internationales", symbol: "BNDX" },
  { label: "Long Treasuries", fr: "Bons du Trésor longs", symbol: "TLT" },
];
const SECTORS: (HeatRow & { fr: string })[] = [
  { label: "Energy", fr: "Énergie", symbol: "XLE" },
  { label: "Health Care", fr: "Santé", symbol: "XLV" },
  { label: "Materials", fr: "Matériaux", symbol: "XLB" },
  { label: "Consumer Staples", fr: "Consommation de base", symbol: "XLP" },
  { label: "Technology", fr: "Technologie", symbol: "XLK" },
  { label: "Financial", fr: "Finance", symbol: "XLF" },
  { label: "Real Estate", fr: "Immobilier", symbol: "XLRE" },
  { label: "Industrial", fr: "Industrie", symbol: "XLI" },
  { label: "Utilities", fr: "Services publics", symbol: "XLU" },
  { label: "Consumer Discretionary", fr: "Consommation discrétionnaire", symbol: "XLY" },
  { label: "Communication Services", fr: "Communication", symbol: "XLC" },
];

// European versions: UCITS ETFs listed in euros (Xetra / Euronext)
const ASSET_CLASSES_EU: (HeatRow & { fr: string })[] = [
  { label: "World Equities", fr: "Actions monde", symbol: "IWDA.AS" },
  { label: "European Equities", fr: "Actions Europe", symbol: "IMEU.AS" },
  { label: "Euro Stoxx 50", fr: "Euro Stoxx 50", symbol: "EXW1.DE" },
  { label: "US Equities (S&P 500)", fr: "Actions US (S&P 500)", symbol: "SXR8.DE" },
  { label: "Emerging Markets", fr: "Marchés émergents", symbol: "IS3N.DE" },
  { label: "European Real Estate", fr: "Immobilier européen", symbol: "IPRP.AS" },
  { label: "Euro Government Bonds", fr: "Obligations d'État euro", symbol: "EUNH.DE" },
  { label: "Euro Corporate Bonds", fr: "Obligations d'entreprises euro", symbol: "IEAC.AS" },
  { label: "Global Bonds (EUR hedged)", fr: "Obligations mondiales (couvertes EUR)", symbol: "EUNA.DE" },
  { label: "Gold", fr: "Or", symbol: "4GLD.DE" },
  { label: "Commodities", fr: "Matières premières", symbol: "EXXY.DE" },
];
const SECTORS_EU: (HeatRow & { fr: string })[] = [
  { label: "Energy", fr: "Énergie", symbol: "EXH1.DE" },
  { label: "Health Care", fr: "Santé", symbol: "EXV4.DE" },
  { label: "Basic Resources", fr: "Matières premières", symbol: "EXV6.DE" },
  { label: "Food & Beverage", fr: "Alimentation et boissons", symbol: "EXH3.DE" },
  { label: "Technology", fr: "Technologie", symbol: "EXV3.DE" },
  { label: "Banks", fr: "Banques", symbol: "EXV1.DE" },
  { label: "Insurance", fr: "Assurance", symbol: "EXH5.DE" },
  { label: "Real Estate", fr: "Immobilier", symbol: "EXI5.DE" },
  { label: "Industrial Goods & Services", fr: "Biens et services industriels", symbol: "EXH4.DE" },
  { label: "Utilities", fr: "Services publics", symbol: "EXH9.DE" },
  { label: "Automobiles & Parts", fr: "Automobile", symbol: "EXV5.DE" },
  { label: "Telecommunications", fr: "Télécommunications", symbol: "EXV2.DE" },
];

// ─────────────────────────────── motion helpers ───────────────────────────────
/** Section that zooms in as it enters the viewport and slightly out as it leaves. */
function ZoomSection({ children, className, style, id }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [0.97, 1, 1, 0.985]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0.5, 1, 1, 0.8]);
  return (
    <section ref={ref} id={id} className={className} style={style}>
      <motion.div style={{ scale, opacity }} className="will-change-transform">
        {children}
      </motion.div>
    </section>
  );
}

/** Card that tilts in 3D towards the cursor. */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 18 });
  return (
    <div className="[perspective:1200px] h-full">
      <motion.div
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Words drop in from the top, one after the other. */
function DropIn({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block mr-[0.25em]"
          initial={{ y: -140, opacity: 0, rotateX: -70 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: delay + i * 0.09 }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

// ─────────────────────────────────── page ───────────────────────────────────
export function Home({ onGoPage }: { onGoPage: (id: string) => void }) {
  const { language, t } = useTranslation();
  const fr = language === "fr";
  const [heroHovered, setHeroHovered] = useState(false);
  const [perf, setPerf] = useState<Record<string, any>>({});
  const [region, setRegion] = useState<"us" | "eu">(language === "fr" ? "eu" : "us");
  const assetRows = region === "eu" ? ASSET_CLASSES_EU : ASSET_CLASSES;
  const sectorRows = region === "eu" ? SECTORS_EU : SECTORS;

  useEffect(() => {
    let alive = true;
    const syms = [...ASSET_CLASSES, ...SECTORS, ...ASSET_CLASSES_EU, ...SECTORS_EU].map((r) => r.symbol).join(",");
    fetch(`/api/stock/performance?symbols=${encodeURIComponent(syms)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: any) => {
        if (alive && d && typeof d === "object") setPerf(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Hero parallax: atom grows as the page starts to scroll
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const atomScale = useTransform(heroP, [0, 1], [1, 1.06]);
  const heroTextY = useTransform(heroP, [0, 1], [0, 60]);
  const heroFade = useTransform(heroP, [0, 0.8], [1, 0]);

  const pages = [
    { title: t("home.pages.asset_allocation.title"), id: "asset-allocation", cta: t("home.pages.asset_allocation.cta"), desc: t("home.pages.asset_allocation.desc"), accent: "#7B6CF0" },
    { title: t("home.pages.portfolio_backtest.title"), id: "portfolio-backtest", cta: t("home.pages.portfolio_backtest.cta"), desc: t("home.pages.portfolio_backtest.desc"), accent: "#2DD4BF" },
    { title: t("home.pages.tactical_allocation.title"), id: "tactical-allocation", cta: t("home.pages.tactical_allocation.cta"), desc: t("home.pages.tactical_allocation.desc"), accent: "#F59E0B" },
    { title: t("home.pages.montecarlo.title"), id: "montecarlo", cta: t("home.pages.montecarlo.cta"), desc: t("home.pages.montecarlo.desc"), accent: "#60A5FA" },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden text-text">
      {/* ── Hero: original colour plate ── */}
      <div ref={heroRef} className="relative w-full min-h-[100svh] flex items-center" style={DARK_GRID}>
        <div
          className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center pt-28 pb-16 lg:py-0"
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
        >
          <motion.div style={{ y: heroTextY, opacity: heroFade }} className="w-full lg:w-[46%] px-6 sm:px-10 lg:pl-24 lg:pr-0 z-20 [perspective:800px]">
            <h1 className="font-sans text-[22vw] sm:text-[13vw] lg:text-[150px] font-semibold leading-[0.85] tracking-tighter text-white">
              <DropIn text="Quantrih" />
            </h1>
            <h2 className="font-sans text-4xl sm:text-5xl lg:text-[52px] font-medium leading-tight tracking-tight mt-5 text-[#B6ABF7]">
              <DropIn text={t("home.hero.title2") + "."} delay={0.25} />
            </h2>
            <motion.p
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 16, delay: 0.7 }}
              className="mt-8 max-w-xl text-white/80 text-xl sm:text-2xl md:text-3xl leading-relaxed border-l-2 border-white/25 pl-6 py-1"
            >
              {t("home.hero.subtitle")}
            </motion.p>
          </motion.div>
          <motion.div style={{ scale: atomScale }} className="w-full lg:w-[54%] h-[44vh] sm:h-[50vh] lg:h-[68vh] relative z-10 flex items-center justify-center mt-6 lg:mt-0">
            <div className="w-full h-full">
              <AtomAnimation isHovered={heroHovered} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Crypto prices and ten famous allocations, scrolling ── */}
      <CryptoTicker />
      <AllocationsTicker label={fr ? "Allocations · depuis le 1er janv." : "Allocations · YTD"} />

      {/* ── Why backtest: devices enter first, then the explanation, then the four tools ── */}
      <ZoomSection style={LARGE_GRID} className="w-full pt-20 pb-24">
        <div className="w-full px-4 sm:px-6 lg:px-24">
          <DeviceShowcase
            videoMp4="/media/quantrih-demo.mp4"
            videoWebm="/media/quantrih-demo.webm"
            poster="/media/quantrih-demo-poster.jpg"
            laptopSrc="/media/demo-laptop.png"
            desktopAlt={fr ? "Démonstration : lancement d'un backtest Quantrih et lecture des résultats" : "Demo: running a Quantrih backtest and reading the results"}
            laptopAlt={fr ? "Résultats d'un backtest Quantrih : pertes maximales" : "Quantrih backtest results: drawdowns"}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center px-6 mt-14"
        >
          <h3 className="text-3xl md:text-[42px] font-normal tracking-tight text-text mb-5">{t("home.why_backtest.title")}</h3>
          <p className="text-text-2 text-lg md:text-xl leading-relaxed">{t("home.why_backtest.desc")}</p>
        </motion.div>

        <div className="px-6 lg:px-24 mt-20">
          <div className="mb-10 text-center">
            <h3 className="text-2xl md:text-4xl font-normal text-text tracking-tight mb-3">{t("home.tools.title")}</h3>
            <p className="text-text-2 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{t("home.tools.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-[84rem] mx-auto">
            {pages.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <TiltCard className="group relative h-full min-h-[220px] rounded-[1.75rem] p-7 lg:p-9 flex flex-col text-white overflow-hidden shadow-[0_24px_50px_-28px_rgba(15,23,42,0.6)]">
                  <span className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${p.accent} 0%, ${p.accent}D9 40%, #15124A 120%)` }} />
                  <span className="absolute -right-4 -bottom-10 text-[140px] font-semibold leading-none text-white/10 select-none font-sans">{String(i + 1).padStart(2, "0")}</span>
                  <h4 className="relative text-xl lg:text-2xl font-semibold tracking-tight uppercase font-sans" style={{ transform: "translateZ(30px)" }}>{p.title}</h4>
                  <p className="relative mt-3 text-white/90 text-sm lg:text-base leading-relaxed max-w-xl" style={{ transform: "translateZ(20px)" }}>{p.desc}</p>
                  <div className="relative mt-auto pt-7" style={{ transform: "translateZ(40px)" }}>
                    <button
                      onClick={() => onGoPage(p.id)}
                      className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#15124A] bg-white hover:bg-white/90 transition-all inline-flex items-center gap-2"
                    >
                      {p.cta}
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </ZoomSection>

      {/* ── Asset classes & sectors (white) ── */}
      <ZoomSection className="w-full py-20 bg-white">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-white border border-border shadow-sm">
            {(["us", "eu"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`relative px-5 h-10 rounded-full text-sm font-semibold transition-colors ${region === r ? "text-white" : "text-text-2 hover:text-text"}`}
              >
                {region === r && <motion.span layoutId="regionPill" className="absolute inset-0 rounded-full bg-pv-blue" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className="relative">{r === "us" ? (fr ? "États-Unis (USD)" : "United States (USD)") : (fr ? "Europe (UCITS, EUR)" : "Europe (UCITS, EUR)")}</span>
              </button>
            ))}
          </div>
        </div>
        <div key={region} className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PerformanceHeatmap
            title={fr ? "Performance des classes d'actifs" : "Asset Class Performance"}
            firstCol={fr ? "Classe d'actifs" : "Asset Class"}
            rows={assetRows.map((r) => ({ symbol: r.symbol, label: fr ? r.fr : r.label }))}
            perf={perf}
            note={fr ? "Rendement total (dividendes réinvestis). 3Y et 5Y annualisés." : "Total return (dividends reinvested). 3Y and 5Y annualized."}
          />
          <PerformanceHeatmap
            title={fr ? "Performance des secteurs" : "Sector Performance"}
            firstCol={fr ? "Secteur" : "Sector"}
            rows={sectorRows.map((r) => ({ symbol: r.symbol, label: fr ? r.fr : r.label }))}
            perf={perf}
            note={region === "eu"
              ? (fr ? "Secteurs du STOXX Europe 600 (ETF iShares, Xetra). 3Y et 5Y annualisés." : "STOXX Europe 600 sectors (iShares ETFs, Xetra). 3Y and 5Y annualized.")
              : (fr ? "Secteurs du S&P 500 (ETF Select Sector SPDR). 3Y et 5Y annualisés." : "S&P 500 sectors (Select Sector SPDR ETFs). 3Y and 5Y annualized.")}
          />
        </div>
      </ZoomSection>

      {/* ── Lazy portfolios, short table (white) ── */}
      <ZoomSection className="w-full pb-20 pt-4 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <LazyPortfolios variant="compact" onNavigate={onGoPage} />
        </div>
      </ZoomSection>

      {/* ── Investment platforms (dark grid, white profile cards) ── */}
      <ZoomSection style={DARK_GRID} className="relative w-full py-20 lg:py-24 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h3 className="text-3xl md:text-5xl font-normal text-white tracking-tight">{fr ? "Où investir : courtiers et banques" : "Where to invest: brokers and banks"}</h3>
            <p className="mt-4 text-white/65 text-lg leading-relaxed">{fr ? "Frais, fiscalité et régulateur des plateformes accessibles en Belgique et en France." : "Fees, taxes and regulator for the platforms available in Belgium and France."}</p>
          </div>
          <button onClick={() => onGoPage("platforms")} className="shrink-0 self-start md:self-auto px-6 py-3 rounded-full text-sm font-semibold text-[#15124A] bg-white hover:bg-white/90 inline-flex items-center gap-2">
            {fr ? "Comparer les plateformes" : "Compare platforms"} <ArrowRight size={15} />
          </button>
        </div>
        <PlatformsMarquee fr={fr} />
      </ZoomSection>

      {/* ── Explore the other pages (large grid) ── */}
      <ZoomSection style={LARGE_GRID} className="w-full pt-24 pb-24">
        <div className="flex flex-col items-center">
          <h3 className="text-text text-3xl md:text-5xl font-normal tracking-tight mb-4">Quantrih</h3>
          <p className="text-text-2 mb-12 text-center max-w-md px-6 leading-relaxed text-lg">{t("home.explore_pages")}</p>
          <HexBadgeOrbit onNavigate={onGoPage} />
        </div>
      </ZoomSection>

      {/* ── Support (plain white) ── */}
      <ZoomSection className="w-full bg-white px-6 lg:px-24 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-text text-2xl lg:text-4xl font-normal tracking-tight mb-4">{t("home.support.title")}</h3>
          <p className="text-text-2 text-base lg:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">{t("home.support.desc")}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer")}
            className="px-10 py-4 bg-pv-blue hover:bg-pv-blue-d text-white rounded-full text-base font-bold tracking-wide uppercase shadow-[0_15px_30px_-12px_rgba(91,75,219,0.6)]"
          >
            {t("home.support.button")}
          </motion.button>
          <div className="text-sm text-text-3 mt-4">
            {t("home.support.inquiry")}: <a href="mailto:contact@quantrih.com" className="text-pv-blue font-semibold underline underline-offset-4">contact@quantrih.com</a>
          </div>
          <p className="text-text-3 text-xs max-w-3xl mx-auto leading-relaxed mt-14">{t("home.disclaimer")}</p>
        </div>
      </ZoomSection>
    </div>
  );
}
