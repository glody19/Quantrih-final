import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { AtomAnimation } from "../ui/AtomAnimation";
import { MarketTickers } from "../home/MarketTickers";
import { DeviceShowcase } from "../home/DeviceShowcase";
import { PerformanceHeatmap, type HeatRow } from "../home/PerformanceHeatmap";
import { PlatformsMarquee } from "../home/PlatformsMarquee";
import { TopEtfs } from "../home/TopEtfs";
import { LazyPortfolios } from "./LazyPortfolios";
import { RelativeCompare } from "../home/RelativeCompare";

// ───────────────────────────── backgrounds (hybrid by section) ─────────────────────────────
// Dark gradient with a fine white grid
const DARK_GRID: React.CSSProperties = {
  backgroundColor: "#06111A",
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(ellipse 90% 70% at 50% 0%, #123247 0%, #0A1B27 45%, #06111A 100%)",
  backgroundSize: "64px 64px, 64px 64px, 100% 100%",
};
// The same three-step gradient (dark, lighter navy, dark) on "Where to invest" and on "Support":
// both sections look identical and join without a seam; the footer continues the same dark navy.
const NAVY_TRIPLE: React.CSSProperties = {
  backgroundColor: "#0A1E2D",
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(180deg, #0A1E2D 0%, #14466B 50%, #0A1E2D 100%)",
  backgroundSize: "64px 64px, 64px 64px, 100% 100%",
};
// White with large rectangular cells
const LARGE_GRID: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  backgroundImage:
    "linear-gradient(to right, rgba(15,23,42,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.07) 1px, transparent 1px)",
  backgroundSize: "112px 112px",
  backgroundPosition: "center top",
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
/**
 * Page section that fades and rises in once when it reaches the screen.
 * No scroll-linked scaling: transforming whole sections on every scroll frame made the page stutter.
 */
function ZoomSection({ children, className, style, id }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string }) {
  return (
    <section id={id} className={className} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
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

/** Grows as it reaches the middle of the screen and shrinks as it leaves, smoothed by a spring. */
function ScrollZoom({ children, amount = 0.08 }: { children: React.ReactNode; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const scale = useTransform(smooth, [0, 0.5, 1], [1 - amount, 1 + amount / 3, 1 - amount]);
  return <motion.div ref={ref} style={{ scale }} className="will-change-transform">{children}</motion.div>;
}

/** Section title: words rise one by one, then an underline draws itself. */
function SectionTitle({ text, sub, dark = false }: { text: string; sub?: string; dark?: boolean }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 [perspective:700px]">
      <h3 className={`text-3xl md:text-5xl font-semibold tracking-tight ${dark ? "text-white" : "text-text"}`}>
        {text.split(" ").map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && " "}
            <motion.span className="inline-block" initial={{ opacity: 0, y: 40, rotateX: -80 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 110, damping: 14, delay: i * 0.1 }}>{w}</motion.span>
          </React.Fragment>
        ))}
      </h3>
      <motion.span className="block mx-auto mt-4 h-[3px] w-20 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.35 }} />
      {sub && <motion.p className={`mt-5 text-base md:text-xl leading-relaxed ${dark ? "text-white/70" : "text-text-2"}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 1.1 }}>{sub}</motion.p>}
    </div>
  );
}

/** Words drop in from the top, one after the other. */
function DropIn({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <React.Fragment key={i}>{i > 0 && " "}<motion.span
          aria-hidden
          className="inline-block"
          initial={{ y: -140, opacity: 0, rotateX: -70 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: delay + i * 0.09 }}
        >
          {w}
        </motion.span></React.Fragment>
      ))}
    </span>
  );
}

/** Letters flip up out of a blur one by one, then keep floating on their own rhythm. */
function FloatTitle({ text }: { text: string }) {
  return (
    <span aria-label={text} className="inline-flex whitespace-nowrap">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: 140, opacity: 0, rotateX: -95, filter: "blur(16px)" }}
          animate={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.15 + i * 0.085 }}
        >
          <motion.span
            className="inline-block"
            animate={{ y: [0, -14, 0], rotateZ: [0, i % 2 ? 1.4 : -1.4, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 1.4 + i * 0.17 }}
          >
            {ch}
          </motion.span>
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
  const heroTextY = useTransform(heroP, [0, 1], [0, 60]);
  const heroFade = useTransform(heroP, [0, 0.8], [1, 0]);

  const pages = [
    { title: t("home.pages.asset_allocation.title"), id: "asset-allocation", cta: t("home.pages.asset_allocation.cta"), desc: t("home.pages.asset_allocation.desc"), accent: "#3D6FB0" },
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
          <motion.div style={{ y: heroTextY, opacity: heroFade }} className="w-full lg:w-[52%] px-6 sm:px-10 lg:pl-20 lg:pr-0 z-20 [perspective:900px]">
            <h1 className="font-sans text-[22vw] sm:text-[15vw] lg:text-[clamp(150px,12.6vw,220px)] font-semibold leading-[0.9] tracking-tighter text-white [text-shadow:0_18px_70px_rgba(61,111,176,0.55)]">
              <FloatTitle text="Quantrih" />
            </h1>
            <motion.h2
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="font-sans text-4xl sm:text-5xl lg:text-[56px] font-medium leading-tight tracking-tight mt-6 text-[#A9C8EA]"
            >
              <DropIn text={t("home.hero.title2") + "."} delay={1.6} />
            </motion.h2>
            <motion.p
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 16, delay: 2.6 }}
              className="mt-8 max-w-xl text-white/80 text-xl sm:text-2xl md:text-3xl leading-relaxed border-l-2 border-white/25 pl-6 py-1"
            >
              {t("home.hero.subtitle")}
            </motion.p>
          </motion.div>
          <div className="w-[124%] -mx-[12%] lg:mx-0 lg:w-[48%] h-[58vh] sm:h-[56vh] lg:h-[68vh] relative z-10 flex items-center justify-center mt-2 lg:mt-0">
            {/* the whole atom drifts up, down, left and right; the sphere itself turns in 3D inside the canvas.
                No CSS scale or 3D tilt here: they resample the canvas and make it blurry */}
            <motion.div
              className="w-full h-full"
              animate={{ x: [0, 46, -38, 22, -14, 0], y: [0, -40, 26, 36, -22, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              <AtomAnimation isHovered={heroHovered} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Scrolling row: famous allocations YTD ── */}
      <MarketTickers fr={fr} />

      {/* ── Why backtest: explanation first, then the tablet, desktop and phone demo (white, large squares) ── */}
      <ZoomSection style={LARGE_GRID} className="relative w-full pt-24 pb-28 overflow-hidden">
        <div className="px-6">
          <SectionTitle text={t("home.why_backtest.title")} sub={t("home.why_backtest.desc")} />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-24 mt-16">
          <DeviceShowcase
            fr={fr}
            videoMp4="/media/quantrih-demo.mp4"
            videoWebm="/media/quantrih-demo.webm"
            poster="/media/quantrih-demo-poster.jpg"
            desktopAlt={fr ? "Démonstration : lancement d'un backtest Quantrih et lecture des résultats" : "Demo: running a Quantrih backtest and reading the results"}
          />
        </div>
      </ZoomSection>

      {/* ── Tools & strategies: white background, navy cards with blue titles ── */}
      <ZoomSection className="w-full py-24 lg:py-28 bg-white">
        <div className="px-6 lg:px-24">
          <SectionTitle text={t("home.tools.title")} sub={t("home.tools.subtitle")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 w-full max-w-[72rem] mx-auto">
            {pages.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 50, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <TiltCard className="group h-full rounded-[1.75rem] px-6 py-6 lg:px-8 lg:py-7 flex flex-col items-center text-center bg-[#111A30] border border-white/[0.08] shadow-[0_30px_60px_-30px_rgba(15,23,42,0.75)] hover:border-[#3B82F6]/50 transition-colors">
                  <motion.h4
                    className="text-xl lg:text-2xl font-extrabold tracking-tight uppercase font-sans text-[#3B82F6] overflow-hidden"
                    style={{ transform: "translateZ(30px)" }}
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.03, delayChildren: 0.25 + i * 0.12 }}
                  >
                    {p.title.split("").map((ch, k) => (
                      <motion.span key={k} className="inline-block whitespace-pre" variants={{ hidden: { y: "110%", opacity: 0 }, shown: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}>{ch}</motion.span>
                    ))}
                  </motion.h4>
                  <motion.p
                    className="mt-3 text-slate-200 text-sm lg:text-[15px] leading-relaxed max-w-xl"
                    style={{ transform: "translateZ(20px)" }}
                    initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.12 }}
                  >
                    {p.desc}
                  </motion.p>
                  <motion.div className="mt-auto pt-5 flex justify-center" style={{ transform: "translateZ(40px)" }} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.9 + i * 0.12 }}>
                    <button
                      onClick={() => onGoPage(p.id)}
                      className="px-7 py-2.5 rounded-full text-sm font-semibold text-slate-100 bg-[#1C2740] border border-white/10 hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all"
                    >
                      {p.cta}
                    </button>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </ZoomSection>

      {/* ── Asset classes & sectors (white) ── */}
      <ZoomSection className="relative w-full pt-20 pb-20 bg-white">
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
        <div key={region} className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 xl:grid-cols-2 gap-5">
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

        {/* Best ETFs over 6 months, 1, 3 and 5 years */}
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 mt-20">
          <SectionTitle
            text={fr ? "Les 30 meilleurs ETF sur 12 mois" : "Best 30 ETF returns · last 12 months"}
            sub={fr ? "Les ETF mondiaux les plus performants sur les 12 derniers mois, classés par rendement sur 1 an. Suivez les grands indices thématiques." : "Top performing global ETFs over the trailing 12 months, sorted by highest 1-year return. Track leading thematic indexes."}
          />
          <ScrollZoom><TopEtfs fr={fr} /></ScrollZoom>
        </div>

        {/* Lazy portfolios: who performed; a click opens the details on the Market page */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 mt-16">
          <ScrollZoom amount={0.05}><LazyPortfolios variant="home" onNavigate={onGoPage} /></ScrollZoom>
        </div>
      </ZoomSection>

      {/* ── Relative performance of the big names (white) ── */}
      <ZoomSection className="w-full pt-10 pb-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <SectionTitle
            text={fr ? "Performance relative comparée" : "Relative Performance Comparison"}
            sub={fr ? "Toutes les courbes partent de zéro le même jour : on voit d'un coup d'œil qui a le plus progressé." : "Every line starts at zero on the same day, so you can see at a glance who has gained the most."}
          />
          <RelativeCompare fr={fr} onOpen={() => onGoPage("market")} />
        </div>
      </ZoomSection>

      {/* ── Where to invest and Support: each on the same three-step navy gradient ── */}
      <ZoomSection style={NAVY_TRIPLE} className="relative w-full pt-20 lg:pt-28 pb-16 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
          <SectionTitle dark text={fr ? "Où investir : courtiers et banques" : "Where to invest: brokers and banks"} sub={fr ? "Frais, fiscalité et régulateur des plateformes accessibles en Belgique et en France." : "Fees, taxes and regulator for the platforms available in Belgium and France."} />
          <motion.div className="flex justify-center -mt-4" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 1.7 }}>
            <button onClick={() => onGoPage("platforms")} className="px-6 py-3 rounded-full text-sm font-semibold text-[#0C2233] bg-white hover:bg-white/90 inline-flex items-center gap-2">
              {fr ? "Comparer les plateformes" : "Compare platforms"} <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
        <ScrollZoom amount={0.12}><PlatformsMarquee fr={fr} /></ScrollZoom>
      </ZoomSection>

      <ZoomSection style={NAVY_TRIPLE} className="w-full px-6 lg:px-24 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <SectionTitle dark text={t("home.support.title")} sub={t("home.support.desc")} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer")}
            className="px-10 py-4 bg-white hover:bg-white/90 text-[#0C2233] rounded-full text-base font-bold tracking-wide uppercase shadow-[0_15px_30px_-12px_rgba(0,0,0,0.6)]"
          >
            {t("home.support.button")}
          </motion.button>
          <div className="text-sm text-white/60 mt-4">
            {t("home.support.inquiry")}: <a href="mailto:contact@quantrih.com" className="text-[#A9C8EA] font-semibold underline underline-offset-4">contact@quantrih.com</a>
          </div>
          <p className="text-white/45 text-xs max-w-3xl mx-auto leading-relaxed mt-14">{fr ? "Quantrih est un outil d'analyse et de formation. Rien sur ce site ne constitue un conseil en investissement. " : "Quantrih is an analysis and learning tool. Nothing on this site is investment advice. "}{t("home.disclaimer")}</p>
        </div>
      </ZoomSection>
    </div>
  );
}
