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
import { IpoNews } from "../home/IpoNews";
import { FiberBackground } from "../home/FiberBackground";
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
// White sections with a light navy tint
const TINT: React.CSSProperties = { background: "linear-gradient(180deg, #F3F7FC 0%, #EAF1F9 100%)" };
const SOFT_WHITE: React.CSSProperties = { background: "linear-gradient(180deg, #FBFCFE 0%, #F4F8FC 100%)" };
// White with large rectangular cells
const LARGE_GRID: React.CSSProperties = {
  backgroundColor: "#F5F8FC",
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



/** Section title: words rise one by one, then an underline draws itself. */
function SectionTitle({ text, sub, dark = false, align = "center" }: { text: string; sub?: string; dark?: boolean; align?: "center" | "left" }) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center mx-auto" : "text-left"} max-w-3xl mb-10 [perspective:700px]`}>
      <h3 className={`text-[26px] md:text-[34px] leading-tight font-semibold tracking-tight ${dark ? "text-white" : "text-text"}`}>
        {text.split(" ").map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && " "}
            <motion.span className="inline-block" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>{w}</motion.span>
          </React.Fragment>
        ))}
      </h3>
      <motion.span className={`block mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#1B3F72] to-[#3B82F6] ${center ? "mx-auto" : ""}`} style={{ transformOrigin: center ? "center" : "left" }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.35 }} />
      {sub && <motion.p className={`mt-4 text-[15px] md:text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-text-2"}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 1 }}>{sub}</motion.p>}
    </div>
  );
}

/** Smaller title for a column inside a section. */
function ColumnTitle({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="h-full">
      <motion.h3 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[20px] md:text-[22px] font-semibold tracking-tight text-text">{text}</motion.h3>
      {sub && <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-1.5 text-[14px] text-text-2 leading-relaxed">{sub}</motion.p>}
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
    <div className="home-page flex flex-col w-full overflow-hidden text-text">
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
          <div className="w-[124%] -mx-[12%] lg:-mr-[4%] lg:ml-0 lg:w-[54%] h-[62vh] sm:h-[60vh] lg:h-[80vh] relative z-10 mt-2 lg:mt-0">
            {/* no CSS transform here: it would resample the canvas and blur it. The drift happens inside the canvas */}
            <AtomAnimation isHovered={heroHovered} />
          </div>
        </div>
      </div>

      {/* ── Scrolling row: famous allocations YTD ── */}
      <MarketTickers fr={fr} />

      {/* ── Why backtest: the three devices on the left (large), the case for it on the right ── */}
      <ZoomSection style={LARGE_GRID} className="relative w-full py-20 lg:py-24 overflow-hidden">
        <div className="max-w-[1700px] mx-auto pl-2 pr-4 sm:pr-6 lg:pl-4 lg:pr-12 grid lg:grid-cols-[1.75fr_1fr] gap-8 lg:gap-10 items-center">
          <DeviceShowcase
            fr={fr}
            videoMp4="/media/demo-desktop.mp4"
            videoWebm="/media/demo-desktop.webm"
            poster="/media/demo-desktop-poster.jpg"
            tabletMp4="/media/demo-tablet.mp4"
            tabletWebm="/media/demo-tablet.webm"
            tabletPoster="/media/demo-tablet-poster.jpg"
            desktopAlt={fr ? "Démonstration : lancement d'un backtest Quantrih et lecture des résultats" : "Demo: running a Quantrih backtest and reading the results"}
          />
          <div>
            <SectionTitle align="left" text={t("home.why_backtest.title")} sub={fr ? "Un backtest ne prédit rien. Il chiffre ce qu'une allocation a réellement fait subir à son détenteur, et c'est la seule base sérieuse pour la dimensionner." : "A backtest predicts nothing. It puts numbers on what an allocation actually put its holder through, which is the only sound basis for sizing it."} />
            <ul className="-mt-4 grid gap-3.5">
              {(fr
                ? [
                    ["Drawdown et durée de récupération", "Un 60/40 a perdu plus de 30 % en 2008 et un portefeuille 100 % actions plus de 50 %. La question utile est la profondeur et le nombre de mois sous l'eau, pas le rendement moyen."],
                    ["Corrélations en régime de stress", "Les diversifiants ne se valent pas : en 2022, actions et obligations ont baissé ensemble. Le test montre ce qui a réellement amorti, et quand."],
                    ["Risque de séquence", "À rendement annualisé égal, l'ordre des années change le résultat dès qu'il y a des apports ou des retraits. Les périodes glissantes le mesurent."],
                    ["Coût du rééquilibrage et des frais", "Fréquence de rééquilibrage, frais courants et fiscalité déplacent le résultat net de plusieurs dixièmes de point par an."],
                    ["Discipline face à un indice", "Comparer à un indice de référence sur la même période évite de confondre bêta de marché et valeur ajoutée de l'allocation."],
                    ["Limites à garder en tête", "Biais de sélection, surajustement et historique court : un test se lit sur plusieurs cycles et se complète par une simulation de Monte Carlo."],
                  ]
                : [
                    ["Drawdown and time to recovery", "A 60/40 lost more than 30% in 2008 and an all-equity portfolio more than 50%. The useful question is depth and months under water, not the average return."],
                    ["Correlations under stress", "Diversifiers are not equal: in 2022 equities and bonds fell together. The test shows what actually cushioned the fall, and when."],
                    ["Sequence risk", "At the same annualised return, the order of the years changes the outcome as soon as there are contributions or withdrawals. Rolling periods measure it."],
                    ["Cost of rebalancing and fees", "Rebalancing frequency, ongoing charges and taxes move the net result by several tenths of a point a year."],
                    ["Discipline against a benchmark", "Comparing with a benchmark over the same period keeps market beta apart from what the allocation itself adds."],
                    ["Limits to keep in mind", "Selection bias, overfitting and short histories: read a test across several cycles and pair it with a Monte Carlo simulation."],
                  ]
              ).map(([h, d], i) => (
                <motion.li key={h} initial={{ opacity: 0, x: 36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 1.2 + i * 0.28, ease: [0.16, 1, 0.3, 1] }} className="flex gap-3">
                  <span className="mt-[9px] w-1.5 h-1.5 shrink-0 rounded-full bg-[#1B3F72]" />
                  <span className="text-[14.5px] leading-relaxed text-text-2"><b className="text-text">{h}.</b> {d}</span>
                </motion.li>
              ))}
            </ul>
            <motion.button initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 3.1, duration: 0.5 }}
              onClick={() => onGoPage("portfolio-backtest")} className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pv-blue hover:bg-pv-blue-d text-white text-sm font-semibold">
              {fr ? "Lancer un backtest" : "Run a backtest"} <ArrowRight size={15} />
            </motion.button>
          </div>
        </div>
      </ZoomSection>

      {/* ── Tools & strategies: four light cards on the fibre background ── */}
      {/* the fibre runs behind this section and the next one without a cut */}
      <div className="relative w-full overflow-hidden" style={TINT}>
      <FiberBackground light side="right" className="opacity-60" />
      <section className="relative w-full pt-20 lg:pt-24 pb-10">
        <div className="relative px-6 lg:px-16">
          <SectionTitle text={t("home.tools.title")} sub={t("home.tools.subtitle")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full max-w-[86rem] mx-auto">
            {pages.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-[1.5rem] bg-white/85 backdrop-blur-sm px-6 py-6 flex flex-col items-center text-center shadow-[0_18px_44px_-30px_rgba(6,18,27,0.45)]"
              >
                {/* each text comes in after the card: title, then description, then link */}
                <motion.h4 initial={{ opacity: 0, y: -14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }} className="text-[17px] font-bold tracking-tight uppercase text-[#1B3F72]">{p.title}</motion.h4>
                <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.75 + i * 0.1 }} className="mt-3 text-[14px] text-text-2 leading-relaxed">{p.desc}</motion.p>
                <motion.button initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }} onClick={() => onGoPage(p.id)} className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B3F72] hover:gap-2.5">
                  {p.cta} <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Asset classes & sectors ── */}
      <ZoomSection className="relative w-full pt-10 pb-16">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-white shadow-sm">
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
        <div key={region} className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
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
      </div>

      {/* ── Best 10 ETFs and lazy portfolios, side by side ── */}
      <ZoomSection className="w-full py-16" style={TINT}>
        {/* titles share one row and the two tables share the next, so both start and end on the same line */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 grid xl:grid-cols-2 gap-x-8 gap-y-4">
          <div className="min-w-0 order-1">
            <ColumnTitle
              text={fr ? "Les 10 meilleurs ETF sur 12 mois" : "Best 10 ETF returns · last 12 months"}
              sub={fr ? "Rendement total en USD, classement sur 1 an glissant." : "Total return in USD, ranked on trailing 1-year."}
            />
          </div>
          <div className="min-w-0 order-2 xl:order-3"><TopEtfs fr={fr} /></div>
          <div className="min-w-0 order-3 xl:order-2 mt-8 xl:mt-0">
            <ColumnTitle
              text="Lazy portfolios"
              sub={fr ? "Dix allocations de référence, rééquilibrage mensuel." : "Ten reference allocations, rebalanced monthly."}
            />
          </div>
          <div className="min-w-0 order-4"><LazyPortfolios variant="home" bare onNavigate={onGoPage} /></div>
        </div>
      </ZoomSection>

      {/* ── Relative performance and IPO news, side by side ── */}
      <ZoomSection className="w-full py-16" style={SOFT_WHITE}>
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 grid xl:grid-cols-[1.45fr_1fr] gap-x-8 gap-y-4">
          <div className="min-w-0 order-1">
            <ColumnTitle
              text={fr ? "Performance relative comparée" : "Relative Performance Comparison"}
            />
          </div>
          <div className="min-w-0 order-2 xl:order-3"><RelativeCompare fr={fr} onOpen={() => onGoPage("market")} /></div>
          <div className="min-w-0 order-3 xl:order-2 mt-8 xl:mt-0">
            <ColumnTitle
              text={fr ? "Actualités des introductions en bourse" : "IPO news"}
              sub={fr ? "Introductions en bourse, dépôts et prix d'offre." : "Listings, filings and pricings."}
            />
          </div>
          <div className="min-w-0 order-4"><IpoNews fr={fr} stacked /></div>
        </div>
      </ZoomSection>

      {/* ── Where to invest and Support: each on the same three-step navy gradient ── */}
      <ZoomSection style={NAVY_TRIPLE} className="relative w-full pt-20 lg:pt-28 pb-16 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
          <SectionTitle dark text={fr ? "Où investir : courtiers et banques" : "Where to invest: brokers and banks"} sub={fr ? "Les courtiers internationaux et les banques qui donnent accès aux marchés." : "The international brokers and the banks that give access to the markets."} />
          <motion.div className="flex justify-center -mt-4" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 1.7 }}>
            <button onClick={() => onGoPage("platforms")} className="px-6 py-3 rounded-full text-sm font-semibold text-[#0C2233] bg-white hover:bg-white/90 inline-flex items-center gap-2">
              {fr ? "Comparer les plateformes" : "Compare platforms"} <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#A9C8EA] mt-4">{fr ? "Courtiers" : "Brokers"}</p>
        <PlatformsMarquee fr={fr} kind="brokers" />
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#A9C8EA] mt-8">{fr ? "Banques" : "Banks"}</p>
        <PlatformsMarquee fr={fr} kind="banks" reverse />
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
        </div>
      </ZoomSection>
    </div>
  );
}
