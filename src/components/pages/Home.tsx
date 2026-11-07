import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Dices, Layers, LineChart as LineIcon, PieChart as PieIcon, Play } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";
import { AtomAnimation } from "../ui/AtomAnimation";

// ─────────────────────────────────── copy ───────────────────────────────────
const COPY = {
  fr: {
    eyebrow: "Backtest et simulation de portefeuille",
    tagline: "Testez avant d'investir.",
    lead: "Regardez comment votre portefeuille aurait traversé la bulle internet, la crise de 2008 et le Covid, puis comparez les courtiers belges et français pour le mettre en place.",
    ctaStart: "Tester mon portefeuille",
    live: "Marchés",
    methodTitle: "Quatre outils, une seule méthode",
    demoTag: "Démo",
    demoTitle: "Trois portefeuilles, un clic, des réponses nettes",
    demoText: "Vous entrez vos ETF et leurs pondérations. Quantrih rejoue chaque mois depuis 2000 et vous montre ce que vous auriez gagné, ce que vous auriez perdu au pire moment et le temps qu'il aurait fallu pour vous en remettre.",
    demoPoints: ["Rendement annualisé et volatilité", "Pire baisse et temps de récupération", "Comparaison avec un indice de référence", "Versements mensuels, frais et rééquilibrage"],
    chartsTitle: "Lire un portefeuille d'un coup d'œil",
    chartsText: "Six vues que vous retrouvez dans vos résultats. Données d'exemple.",
    charts: [
      { t: "Croissance du capital", d: "Votre portefeuille face à son indice, année après année." },
      { t: "Pertes depuis le sommet", d: "La profondeur et la durée de chaque baisse." },
      { t: "Éventail Monte Carlo", d: "Du scénario prudent au scénario favorable." },
      { t: "Allocation", d: "La répartition de votre capital." },
      { t: "Rendements annuels", d: "Les bonnes et les mauvaises années, sans moyenne qui les cache." },
      { t: "Corrélations", d: "Les actifs qui diversifient vraiment." },
    ],
    finalTitle: "Votre prochain investissement commence par un test.",
    finalText: "Aucune installation. Un compte suffit pour sauvegarder vos analyses.",
    supportTitle: "Soutenir Quantrih",
    supportText: "Quantrih est développé de façon indépendante. Les dons financent les données de marché et les nouveaux outils.",
    supportCta: "Faire un don",
    allocation: ["Actions monde", "Actions Europe", "Obligations", "Or"],
    corr: ["Actions", "Oblig.", "Or", "Immo.", "Crypto"],
  },
  en: {
    eyebrow: "Portfolio backtesting and simulation",
    tagline: "Test before you invest.",
    lead: "See how your portfolio would have handled the dot-com bubble, 2008 and Covid, then compare Belgian and French brokers to put it in place.",
    ctaStart: "Test my portfolio",
    live: "Markets",
    methodTitle: "Four tools, one method",
    demoTag: "Demo",
    demoTitle: "Three portfolios, one click, clear answers",
    demoText: "Enter your ETFs and weights. Quantrih replays every month since 2000 and shows what you would have earned, what you would have lost at the worst moment and how long recovery would have taken.",
    demoPoints: ["Annualised return and volatility", "Worst drawdown and recovery time", "Comparison with a benchmark", "Monthly contributions, fees and rebalancing"],
    chartsTitle: "Read a portfolio at a glance",
    chartsText: "Six views you will find in your results. Sample data.",
    charts: [
      { t: "Wealth growth", d: "Your portfolio against its benchmark, year after year." },
      { t: "Drawdowns", d: "Depth and length of every decline." },
      { t: "Monte Carlo fan", d: "From the cautious to the favourable scenario." },
      { t: "Allocation", d: "How your capital is split." },
      { t: "Annual returns", d: "Good and bad years, with no average hiding them." },
      { t: "Correlations", d: "The assets that truly diversify." },
    ],
    finalTitle: "Your next investment starts with a test.",
    finalText: "Nothing to install. An account is all you need to save your analyses.",
    supportTitle: "Support Quantrih",
    supportText: "Quantrih is built independently. Donations fund market data and new tools.",
    supportCta: "Donate",
    allocation: ["World stocks", "European stocks", "Bonds", "Gold"],
    corr: ["Stocks", "Bonds", "Gold", "REITs", "Crypto"],
  },
};
type Copy = typeof COPY.fr;

// ────────────────────────────── illustrative data ──────────────────────────────
// Deterministic pseudo-random series so the showcase looks the same on every visit.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function useShowcaseData() {
  return useMemo(() => {
    const r = seeded(42);
    const growth: { y: string; p: number; b: number }[] = [];
    let p = 10000, b = 10000;
    for (let i = 0; i <= 26; i++) {
      const shock = i === 8 ? -0.28 : i === 20 ? -0.13 : i === 22 ? -0.1 : 0;
      p *= 1 + 0.07 + (r() - 0.5) * 0.14 + shock * 0.7;
      b *= 1 + 0.065 + (r() - 0.5) * 0.2 + shock;
      growth.push({ y: String(2000 + i), p: Math.round(p), b: Math.round(b) });
    }
    let peak = 0;
    const dd = growth.map((g) => { peak = Math.max(peak, g.b); return { y: g.y, d: Math.round(((g.b - peak) / peak) * 1000) / 10 }; });
    const fan = Array.from({ length: 21 }, (_, i) => {
      const m = 100 * Math.pow(1.06, i);
      const spread = 1 + i * 0.045;
      return { y: i, p10: Math.round(m / spread), p50: Math.round(m), p90: Math.round(m * spread * 1.05) };
    });
    const annual = growth.slice(1).map((g, i) => ({ y: g.y.slice(2), v: Math.round(((g.p / growth[i].p) - 1) * 1000) / 10 }));
    return { growth, dd, fan, annual };
  }, []);
}

const ALLOC_VALUES = [50, 20, 20, 10];
const ALLOC_COLORS = ["#7B6CF0", "#B6ABF7", "#2DD4BF", "#E2B84F"];
const CORR = [
  [1, -0.2, 0.05, 0.7, 0.4],
  [-0.2, 1, 0.3, 0.1, -0.05],
  [0.05, 0.3, 1, 0.1, 0.15],
  [0.7, 0.1, 0.1, 1, 0.3],
  [0.4, -0.05, 0.15, 0.3, 1],
];

// ──────────────────────────────── the four tools ────────────────────────────────
const TOOL_ACCENTS = [
  { icon: PieIcon, from: "#7B6CF0", to: "#B6ABF7" },
  { icon: LineIcon, from: "#2DD4BF", to: "#7DE3D2" },
  { icon: Layers, from: "#E2B84F", to: "#F3D58C" },
  { icon: Dices, from: "#60A5FA", to: "#A5C8FB" },
];

function ToolCard({ i, title, desc, cta, onClick, wide }: { i: number; title: string; desc: string; cta: string; onClick: () => void; wide: boolean }) {
  const a = TOOL_ACCENTS[i];
  const Icon = a.icon;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative text-left rounded-[1.75rem] p-px overflow-hidden", wide ? "lg:col-span-2" : "lg:col-span-1")}
      style={{ background: `linear-gradient(140deg, ${a.from}66, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04) 70%, ${a.to}40)` }}
    >
      <div className="relative h-full rounded-[calc(1.75rem-1px)] bg-[#100E2C] p-8 md:p-10 overflow-hidden transition-colors duration-300 group-hover:bg-[#141236]">
        {/* accent glow, brighter on hover */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" style={{ background: a.from }} />
        <span className="absolute right-8 top-6 text-[7rem] leading-none font-bold text-white/[0.04] select-none">{String(i + 1).padStart(2, "0")}</span>

        <div className="relative flex h-full flex-col">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}>
            <Icon size={26} className="text-[#0B0A1F]" />
          </span>
          <h3 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h3>
          <p className={cn("mt-4 text-base md:text-[17px] text-white/65 leading-relaxed", wide ? "max-w-2xl" : "")}>{desc}</p>
          <span className="mt-auto pt-8 inline-flex items-center gap-2 text-base font-semibold" style={{ color: a.to }}>
            {cta}
            <span className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight size={15} /></span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function ToolsSection({ title, onGoPage }: { title: string; onGoPage: (id: string) => void }) {
  const { t } = useTranslation();
  const tools = [
    { id: "asset-allocation", key: "asset_allocation" },
    { id: "portfolio-backtest", key: "portfolio_backtest" },
    { id: "tactical-allocation", key: "tactical_allocation" },
    { id: "montecarlo", key: "montecarlo" },
  ];
  return (
    <section className="relative py-24 md:py-32">
      <div className="page-container">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">{title}</h2>
          <p className="mt-5 text-lg md:text-xl text-white/65 leading-relaxed">{t("home.tools.subtitle")}</p>
        </div>
        {/* bento layout: wide, narrow / narrow, wide */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <ToolCard
              key={tool.id}
              i={i}
              wide={i === 0 || i === 3}
              title={t(`home.pages.${tool.key}.title`)}
              desc={t(`home.pages.${tool.key}.desc`)}
              cta={t(`home.pages.${tool.key}.cta`)}
              onClick={() => onGoPage(tool.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────── product demo ────────────────────────────────
function ProductDemo({ c }: { c: Copy }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <section id="demo" className="relative py-24 md:py-32">
      <div className="page-container grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#CFC8FB] bg-white/10 px-3 py-1 rounded-full"><Play size={12} /> {c.demoTag}</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">{c.demoTitle}</h2>
          <p className="mt-5 text-lg text-white/65 leading-relaxed">{c.demoText}</p>
          <ul className="mt-7 grid gap-3">
            {c.demoPoints.map((x) => (
              <li key={x} className="flex items-center gap-3 text-base text-white/85"><span className="w-6 h-6 rounded-full bg-emerald-400/15 text-emerald-300 flex items-center justify-center text-xs font-bold">✓</span>{x}</li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative [perspective:1600px]">
          <motion.div style={{ rotateX, scale }} className="relative origin-bottom rounded-[1.4rem] bg-[#05040F] p-2 border border-white/10 shadow-[0_60px_120px_-30px_rgba(123,108,240,0.45)]">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-3 text-[11px] text-white/40 font-mono">quantrih.com/portfolio-backtest</span>
            </div>
            <video className="w-full rounded-xl bg-white" autoPlay muted loop playsInline preload="metadata" poster="/media/backtest-results.jpg">
              <source src="/media/backtest-demo.webm" type="video/webm" />
              <source src="/media/backtest-demo.mp4" type="video/mp4" />
            </video>
          </motion.div>

          <motion.img
            src="/media/backtest-charts.jpg"
            alt=""
            loading="lazy"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block absolute -bottom-10 -left-10 w-[44%] rounded-2xl border border-white/20 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] [transform:rotate(-4deg)]"
          />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="hidden md:flex absolute -top-6 -right-4 flex-col gap-1 rounded-2xl bg-white px-5 py-3.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-4">CAGR</span>
            <span className="text-3xl font-bold text-green font-mono">+6,77 %</span>
            <span className="text-xs text-text-3">Max drawdown <b className="text-red">-52,2 %</b></span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────── chart showcase ───────────────────────────────
function ChartCard({ title, desc, children, i }: { title: string; desc: string; children: React.ReactNode; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-white/20 transition-colors"
    >
      <div className="h-44">{children}</div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="text-[15px] text-white/55 leading-relaxed mt-1">{desc}</p>
    </motion.div>
  );
}

function ChartShowcase({ c }: { c: Copy }) {
  const d = useShowcaseData();
  const axis = { tick: { fontSize: 10, fill: "rgba(255,255,255,0.4)" }, axisLine: false, tickLine: false } as const;
  const tip = { contentStyle: { borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "#16133A", color: "#fff", fontSize: 12 } };
  const corrColor = (v: number) => (v >= 0 ? `rgba(123,108,240,${0.15 + v * 0.75})` : `rgba(248,113,113,${0.2 + -v * 0.9})`);

  return (
    <section className="py-24 md:py-32">
      <div className="page-container">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">{c.chartsTitle}</h2>
          <p className="mt-5 text-lg text-white/65">{c.chartsText}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ChartCard i={0} title={c.charts[0].t} desc={c.charts[0].d}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.growth} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7B6CF0" stopOpacity={0.5} /><stop offset="100%" stopColor="#7B6CF0" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="y" {...axis} interval={6} />
                <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="p" stroke="#B6ABF7" strokeWidth={2.5} fill="url(#gP)" name="Portefeuille" />
                <Line type="monotone" dataKey="b" stroke="#E2B84F" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Indice" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={1} title={c.charts[1].t} desc={c.charts[1].d}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.dd} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F87171" stopOpacity={0.05} /><stop offset="100%" stopColor="#F87171" stopOpacity={0.5} /></linearGradient></defs>
                <XAxis dataKey="y" {...axis} interval={6} />
                <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="d" stroke="#F87171" strokeWidth={2} fill="url(#gD)" name="Baisse" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={2} title={c.charts[2].t} desc={c.charts[2].d}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.fan} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="y" {...axis} interval={4} />
                <YAxis {...axis} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="p90" stroke="none" fill="#7B6CF0" fillOpacity={0.22} name="90 %" />
                <Area type="monotone" dataKey="p50" stroke="#B6ABF7" strokeWidth={2.5} fill="#7B6CF0" fillOpacity={0.22} name="50 %" />
                <Area type="monotone" dataKey="p10" stroke="#B6ABF7" strokeDasharray="3 3" fill="#0B0A1F" fillOpacity={1} name="10 %" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={3} title={c.charts[3].t} desc={c.charts[3].d}>
            <div className="h-full flex items-center gap-5">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={ALLOC_VALUES.map((v, k) => ({ v, k }))} dataKey="v" innerRadius="58%" outerRadius="95%" paddingAngle={3} stroke="none">
                    {ALLOC_VALUES.map((_, k) => <Cell key={k} fill={ALLOC_COLORS[k]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 grid gap-2 text-sm">
                {c.allocation.map((name, k) => (
                  <li key={name} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-white/75"><span className="w-2.5 h-2.5 rounded-full" style={{ background: ALLOC_COLORS[k] }} />{name}</span><b className="font-mono text-white">{ALLOC_VALUES[k]} %</b></li>
                ))}
              </ul>
            </div>
          </ChartCard>

          <ChartCard i={4} title={c.charts[4].t} desc={c.charts[4].d}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.annual} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="y" {...axis} interval={4} />
                <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="v" radius={[3, 3, 0, 0]} name="%">
                  {d.annual.map((a) => <Cell key={a.y} fill={a.v >= 0 ? "#34D399" : "#F87171"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={5} title={c.charts[5].t} desc={c.charts[5].d}>
            <div className="h-full grid gap-1" style={{ gridTemplateColumns: `56px repeat(${c.corr.length}, 1fr)` }}>
              <span />
              {c.corr.map((a) => <span key={a} className="text-[10px] text-white/45 text-center self-end">{a}</span>)}
              {CORR.map((row, i) => (
                <React.Fragment key={i}>
                  <span className="text-[10px] text-white/45 self-center">{c.corr[i]}</span>
                  {row.map((v, j) => (
                    <span key={j} className="rounded-md flex items-center justify-center text-[10px] font-mono font-semibold text-white" style={{ background: corrColor(v) }}>{v.toFixed(1)}</span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────── page ───────────────────────────────────
export function Home({ onGoPage }: { onGoPage: (id: string) => void }) {
  const { language, t } = useTranslation();
  const c = language === "fr" ? COPY.fr : COPY.en;
  const [heroHovered, setHeroHovered] = useState(false);

  return (
    <div className="relative w-full overflow-hidden text-white selection:bg-[#7B6CF0]/40" style={{ background: "linear-gradient(180deg, #0B0A1F 0%, #0E0C2B 40%, #0B0A1F 100%)" }}>
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[0%] w-[760px] h-[760px] rounded-full bg-[#3C3199]/45 blur-[140px]" />
        <div className="absolute top-[30%] -left-60 w-[620px] h-[620px] rounded-full bg-[#1E3A8A]/35 blur-[140px]" />
        <div className="absolute top-[65%] right-[-10%] w-[560px] h-[560px] rounded-full bg-[#4A3BC0]/25 blur-[140px]" />
        <div className="absolute inset-x-0 top-0 h-[900px] opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(180deg,black,transparent_75%)]" />
      </div>

      {/* Hero */}
      <section
        className="relative z-10 page-container pt-40 md:pt-44 pb-14 grid lg:grid-cols-[1fr_1.05fr] gap-6 items-center min-h-[90vh]"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CFC8FB] bg-white/[0.06] border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9283F2]" /> {c.eyebrow}
          </span>
          <h1 className="mt-7 text-[18vw] sm:text-[12vw] md:text-8xl lg:text-[148px] font-bold leading-[0.86] tracking-tighter text-white">
            Quantrih
          </h1>
          <p id="hero-gradient-title" className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-r from-[#B6ABF7] via-[#9283F2] to-[#E2B84F] bg-clip-text text-transparent">
            {c.tagline}
          </p>
          <p className="mt-7 max-w-xl text-lg md:text-xl text-white/70 leading-relaxed">{c.lead}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.15 }} className="relative min-h-[380px] lg:min-h-[660px] flex items-center justify-center">
          <AtomAnimation isHovered={heroHovered} />
        </motion.div>
      </section>


      <ToolsSection title={c.methodTitle} onGoPage={onGoPage} />

      <ProductDemo c={c} />

      <ChartShowcase c={c} />

      {/* Final call to action */}
      <section className="relative z-10 pb-24">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#3C3199] via-[#2A2470] to-[#16133A] px-8 md:px-16 py-16 md:py-20">
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#9283F2]/35 blur-3xl" />
            <div className="absolute -left-16 -bottom-24 w-80 h-80 rounded-full bg-[#E2B84F]/20 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">{c.finalTitle}</h2>
                <p className="mt-4 text-lg text-white/70">{c.finalText}</p>
              </div>
              <button onClick={() => onGoPage("portfolio-backtest")} className="shrink-0 inline-flex items-center gap-2 bg-white text-[#16133A] font-semibold text-base px-8 py-4 rounded-full hover:bg-white/90">
                {c.ctaStart} <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="mt-14 grid md:grid-cols-[1fr_auto] gap-6 items-center rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div>
              <h3 className="text-lg font-bold">{c.supportTitle}</h3>
              <p className="text-base text-white/60 mt-1">{c.supportText}</p>
            </div>
            <button onClick={() => window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer")} className="inline-flex items-center justify-center gap-2 border border-white/20 font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/10">
              {c.supportCta}
            </button>
          </div>

          <p className="mt-12 text-xs text-white/40 text-center max-w-3xl mx-auto leading-relaxed">{t("home.disclaimer")}</p>
        </div>
      </section>
    </div>
  );
}
