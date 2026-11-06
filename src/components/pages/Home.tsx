import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight, BarChart3, Dices, Layers, LineChart as LineChartIcon, PieChart as PieIcon, Play, Shuffle, TrendingDown, TrendingUp,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";
import { AtomAnimation } from "../ui/AtomAnimation";

// ─────────────────────────────────── copy ───────────────────────────────────
const COPY = {
  fr: {
    eyebrow: "Analyse de portefeuille pour investisseurs européens",
    lead: "Testez vos allocations sur des décennies de données, mesurez le risque et comparez les plateformes d'investissement en Belgique et en France.",
    ctaStart: "Lancer un backtest",
    ctaDemo: "Voir la démo",
    live: "Marchés en direct",
    demoTitle: "L'outil, tel que vous l'utiliserez",
    demoText: "Composez jusqu'à trois portefeuilles, lancez le backtest et obtenez en quelques secondes le rendement annualisé, la volatilité, les pertes maximales et l'évolution année par année.",
    demoPoints: ["Rendement, volatilité, Sharpe et Sortino", "Pertes maximales et durée de récupération", "Comparaison à un indice de référence", "Rééquilibrage, versements et frais"],
    chartsTitle: "Des graphiques qui racontent votre portefeuille",
    chartsText: "Chaque résultat est présenté sous la forme la plus parlante. Exemples illustratifs.",
    charts: [
      { t: "Croissance du capital", d: "Votre portefeuille face à l'indice de référence, sur toute la période." },
      { t: "Pertes depuis le sommet", d: "La profondeur et la durée de chaque baisse, pour mesurer le risque réellement vécu." },
      { t: "Éventail Monte Carlo", d: "Des milliers d'avenirs possibles, du scénario prudent au scénario favorable." },
      { t: "Allocation d'actifs", d: "La répartition de votre capital en un coup d'œil." },
      { t: "Rendements annuels", d: "Les bonnes et les mauvaises années, sans moyenne qui les cache." },
      { t: "Corrélations", d: "Les actifs qui bougent ensemble et ceux qui diversifient vraiment." },
    ],
    toolsTitle: "Quatre outils, une seule méthode",
    finalTitle: "Prêt à tester votre portefeuille ?",
    finalText: "Aucune installation. Vos portefeuilles se sauvegardent dans votre compte.",
    supportTitle: "Soutenir Quantrih",
    supportText: "Quantrih est développé de façon indépendante. Votre soutien finance les données et les nouvelles fonctionnalités.",
    supportCta: "Faire un don",
  },
  en: {
    eyebrow: "Portfolio analysis for European investors",
    lead: "Test your allocations on decades of data, measure risk and compare investment platforms in Belgium and France.",
    ctaStart: "Run a backtest",
    ctaDemo: "Watch the demo",
    live: "Live markets",
    demoTitle: "The tool, exactly as you will use it",
    demoText: "Build up to three portfolios, run the backtest and get annualised return, volatility, maximum drawdowns and year-by-year results in seconds.",
    demoPoints: ["Return, volatility, Sharpe and Sortino", "Maximum drawdowns and recovery time", "Comparison with a benchmark", "Rebalancing, contributions and fees"],
    chartsTitle: "Charts that tell your portfolio's story",
    chartsText: "Every result is shown in its most telling form. Illustrative examples.",
    charts: [
      { t: "Wealth growth", d: "Your portfolio against the benchmark over the full period." },
      { t: "Drawdowns", d: "Depth and length of every decline, to measure the risk you would really live through." },
      { t: "Monte Carlo fan", d: "Thousands of possible futures, from cautious to favourable." },
      { t: "Asset allocation", d: "How your capital is split, at a glance." },
      { t: "Annual returns", d: "Good and bad years, with no average hiding them." },
      { t: "Correlations", d: "Which assets move together and which truly diversify." },
    ],
    toolsTitle: "Four tools, one method",
    finalTitle: "Ready to test your portfolio?",
    finalText: "Nothing to install. Your portfolios are saved to your account.",
    supportTitle: "Support Quantrih",
    supportText: "Quantrih is built independently. Your support funds data and new features.",
    supportCta: "Donate",
  },
};

// ────────────────────────────── illustrative data ──────────────────────────────
// Deterministic pseudo-random series so the showcase charts look the same on every visit.
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

const ALLOCATION = [
  { name: "Actions monde", v: 50, c: "#5B4BDB" },
  { name: "Actions Europe", v: 20, c: "#9283F2" },
  { name: "Obligations", v: 20, c: "#14B8A6" },
  { name: "Or", v: 10, c: "#C9A24A" },
];
const CORR_ASSETS = ["Actions", "Oblig.", "Or", "Immo.", "Crypto"];
const CORR = [
  [1, -0.2, 0.05, 0.7, 0.4],
  [-0.2, 1, 0.3, 0.1, -0.05],
  [0.05, 0.3, 1, 0.1, 0.15],
  [0.7, 0.1, 0.1, 1, 0.3],
  [0.4, -0.05, 0.15, 0.3, 1],
];

// ────────────────────────────── live markets strip ──────────────────────────────
const LIVE_SYMBOLS: { s: string; n: string }[] = [
  { s: "^BFX", n: "BEL 20" },
  { s: "^FCHI", n: "CAC 40" },
  { s: "^STOXX50E", n: "Euro Stoxx 50" },
  { s: "^GDAXI", n: "DAX" },
  { s: "^GSPC", n: "S&P 500" },
  { s: "VWCE.DE", n: "VWCE" },
  { s: "IWDA.AS", n: "IWDA" },
  { s: "GC=F", n: "Or" },
  { s: "EURUSD=X", n: "EUR/USD" },
  { s: "BTC-USD", n: "Bitcoin" },
];

function LiveMarkets({ label }: { label: string }) {
  const [quotes, setQuotes] = useState<Record<string, { price: number; pct: number }>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/stock/bulk-quotes?quiet=1&symbols=${encodeURIComponent(LIVE_SYMBOLS.map((x) => x.s).join(","))}`);
        if (!res.ok) return;
        // Never show placeholder prices on the home page: hide the strip when the server flags demo data.
        if (res.headers.get("X-Quantrih-Data") === "demo") {
          if (alive) setQuotes({});
          return;
        }
        const data = await res.json();
        if (!alive || !Array.isArray(data)) return;
        const next: Record<string, { price: number; pct: number }> = {};
        data.forEach((q: any) => {
          const price = q.regularMarketPrice ?? q.price;
          if (q?.symbol && typeof price === "number") next[q.symbol] = { price, pct: q.regularMarketChangePercent ?? q.changesPercentage ?? 0 };
        });
        setQuotes(next);
      } catch {
        // Network issue: keep the last values.
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const items = LIVE_SYMBOLS.filter((x) => quotes[x.s]);
  if (items.length === 0) return null;

  const row = (
    <div className="flex items-center gap-8 pr-8 shrink-0">
      {items.map((x) => {
        const q = quotes[x.s];
        const up = q.pct >= 0;
        return (
          <span key={x.s} className="inline-flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="font-semibold text-text-2">{x.n}</span>
            <span className="font-mono text-text">{q.price.toLocaleString("fr-BE", { maximumFractionDigits: q.price < 10 ? 4 : 2 })}</span>
            <span className={cn("font-mono font-semibold inline-flex items-center gap-0.5", up ? "text-green" : "text-red")}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {up ? "+" : ""}{q.pct.toFixed(2)} %
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="relative z-10 w-full border-y border-border/70 bg-white/70 backdrop-blur-md">
      <div className="page-container flex items-center gap-4 py-2.5">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-pv-blue">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> {label}
        </span>
        <div className="flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          <div className="flex w-max animate-marquee" style={{ animationDuration: "45s" }}>
            {row}
            {row}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────── product demo ────────────────────────────────
function ProductDemo({ c }: { c: typeof COPY.fr }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <section id="demo" className="relative py-20 md:py-28">
      <div className="page-container grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-pv-blue bg-pv-blue/10 px-3 py-1 rounded-full"><Play size={12} /> Demo</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text leading-tight">{c.demoTitle}</h2>
          <p className="mt-4 text-text-3 leading-relaxed">{c.demoText}</p>
          <ul className="mt-6 grid gap-2.5">
            {c.demoPoints.map((x) => (
              <li key={x} className="flex items-center gap-2.5 text-sm text-text-2"><span className="w-5 h-5 rounded-full bg-green-bg text-green flex items-center justify-center text-[11px] font-bold">✓</span>{x}</li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative [perspective:1600px]">
          <motion.div style={{ rotateX, scale }} className="relative origin-bottom rounded-[1.4rem] bg-[#14141A] p-2 shadow-[0_50px_100px_-30px_rgba(30,25,72,0.55)]">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-3 text-[10px] text-white/40 font-mono">quantrih.com/portfolio-backtest</span>
            </div>
            <video className="w-full rounded-xl bg-white" autoPlay muted loop playsInline preload="metadata" poster="/media/backtest-results.jpg">
              <source src="/media/backtest-demo.webm" type="video/webm" />
              <source src="/media/backtest-demo.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Floating result cards for depth */}
          <motion.img
            src="/media/backtest-charts.jpg"
            alt=""
            loading="lazy"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block absolute -bottom-10 -left-10 w-[44%] rounded-2xl border border-border shadow-[0_30px_60px_-20px_rgba(20,20,26,0.35)] [transform:rotate(-4deg)]"
          />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="hidden md:flex absolute -top-6 -right-4 flex-col gap-1 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_20px_50px_-20px_rgba(20,20,26,0.3)]"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-4">CAGR</span>
            <span className="text-2xl font-bold text-green font-mono">+6,77 %</span>
            <span className="text-[10px] text-text-3">Max drawdown <b className="text-red">-52,2 %</b></span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────── chart showcase ───────────────────────────────
function ChartCard({ title, desc, icon: Icon, children, i }: { title: string; desc: string; icon: React.ElementType; children: React.ReactNode; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
      className="group rounded-3xl bg-white border border-border p-5 shadow-[0_6px_24px_rgba(20,20,26,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(91,75,219,0.25)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-40">{children}</div>
      <div className="mt-4 flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-xl bg-pv-blue/10 text-pv-blue flex items-center justify-center shrink-0"><Icon size={15} /></span>
        <div>
          <h3 className="text-sm font-bold text-text">{title}</h3>
          <p className="text-xs text-text-3 leading-relaxed mt-0.5">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ChartShowcase({ c }: { c: typeof COPY.fr }) {
  const d = useShowcaseData();
  const axis = { tick: { fontSize: 9, fill: "#8A8A96" }, axisLine: false, tickLine: false } as const;
  const tip = { contentStyle: { borderRadius: 12, border: "1px solid #ECEAE4", fontSize: 11 } };
  const corrColor = (v: number) => (v >= 0 ? `rgba(91,75,219,${0.12 + v * 0.75})` : `rgba(229,72,77,${0.15 + -v * 0.9})`);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-transparent via-[#F4F2FE]/60 to-transparent">
      <div className="page-container">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text leading-tight">{c.chartsTitle}</h2>
          <p className="mt-3 text-text-3">{c.chartsText}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ChartCard i={0} title={c.charts[0].t} desc={c.charts[0].d} icon={LineChartIcon}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.growth} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5B4BDB" stopOpacity={0.35} /><stop offset="100%" stopColor="#5B4BDB" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="y" {...axis} interval={6} />
                <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="p" stroke="#5B4BDB" strokeWidth={2.5} fill="url(#gP)" name="Portefeuille" />
                <Line type="monotone" dataKey="b" stroke="#C9A24A" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Indice" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={1} title={c.charts[1].t} desc={c.charts[1].d} icon={TrendingDown}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.dd} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E5484D" stopOpacity={0.05} /><stop offset="100%" stopColor="#E5484D" stopOpacity={0.45} /></linearGradient>
                </defs>
                <XAxis dataKey="y" {...axis} interval={6} />
                <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="d" stroke="#E5484D" strokeWidth={2} fill="url(#gD)" name="Baisse" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={2} title={c.charts[2].t} desc={c.charts[2].d} icon={Dices}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.fan} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="y" {...axis} interval={4} />
                <YAxis {...axis} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="p90" stroke="none" fill="#5B4BDB" fillOpacity={0.12} name="Favorable (90 %)" />
                <Area type="monotone" dataKey="p50" stroke="#5B4BDB" strokeWidth={2.5} fill="#5B4BDB" fillOpacity={0.12} name="Médian" />
                <Area type="monotone" dataKey="p10" stroke="#9283F2" strokeDasharray="3 3" fill="#FFFFFF" fillOpacity={1} name="Prudent (10 %)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={3} title={c.charts[3].t} desc={c.charts[3].d} icon={PieIcon}>
            <div className="h-full flex items-center gap-4">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={ALLOCATION} dataKey="v" innerRadius="58%" outerRadius="95%" paddingAngle={3} stroke="none">
                    {ALLOCATION.map((a) => <Cell key={a.name} fill={a.c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 grid gap-1.5 text-[11px]">
                {ALLOCATION.map((a) => (
                  <li key={a.name} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-text-2"><span className="w-2 h-2 rounded-full" style={{ background: a.c }} />{a.name}</span><b className="font-mono text-text">{a.v} %</b></li>
                ))}
              </ul>
            </div>
          </ChartCard>

          <ChartCard i={4} title={c.charts[4].t} desc={c.charts[4].d} icon={BarChart3}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.annual} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="y" {...axis} interval={4} />
                <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...tip} />
                <Bar dataKey="v" radius={[3, 3, 0, 0]} name="Rendement">
                  {d.annual.map((a) => <Cell key={a.y} fill={a.v >= 0 ? "#12A26E" : "#E5484D"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard i={5} title={c.charts[5].t} desc={c.charts[5].d} icon={Shuffle}>
            <div className="h-full grid gap-1" style={{ gridTemplateColumns: `52px repeat(${CORR_ASSETS.length}, 1fr)` }}>
              <span />
              {CORR_ASSETS.map((a) => <span key={a} className="text-[9px] text-text-4 text-center self-end">{a}</span>)}
              {CORR.map((row, i) => (
                <React.Fragment key={i}>
                  <span className="text-[9px] text-text-4 self-center">{CORR_ASSETS[i]}</span>
                  {row.map((v, j) => (
                    <span key={j} className="rounded-md flex items-center justify-center text-[9px] font-mono font-semibold" style={{ background: corrColor(v), color: Math.abs(v) > 0.5 ? "#fff" : "#26262F" }}>
                      {v.toFixed(1)}
                    </span>
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

// ─────────────────────────────────── tools ───────────────────────────────────
const TOOL_STYLE = [
  { icon: PieIcon, tint: "from-[#EEECFD] to-white", accent: "text-[#5B4BDB]" },
  { icon: LineChartIcon, tint: "from-[#E3F6EE] to-white", accent: "text-[#12A26E]" },
  { icon: Layers, tint: "from-[#FBF3E2] to-white", accent: "text-[#B08A2E]" },
  { icon: Dices, tint: "from-[#E6F4F8] to-white", accent: "text-[#0E7490]" },
];

export function Home({ onGoPage }: { onGoPage: (id: string) => void }) {
  const { language, t } = useTranslation();
  const c = language === "fr" ? COPY.fr : COPY.en;
  const [heroHovered, setHeroHovered] = useState(false);

  const tools = [
    { id: "asset-allocation", title: t("home.pages.asset_allocation.title"), desc: t("home.pages.asset_allocation.desc"), cta: t("home.pages.asset_allocation.cta") },
    { id: "portfolio-backtest", title: t("home.pages.portfolio_backtest.title"), desc: t("home.pages.portfolio_backtest.desc"), cta: t("home.pages.portfolio_backtest.cta") },
    { id: "tactical-allocation", title: t("home.pages.tactical_allocation.title"), desc: t("home.pages.tactical_allocation.desc"), cta: t("home.pages.tactical_allocation.cta") },
    { id: "montecarlo", title: t("home.pages.montecarlo.title"), desc: t("home.pages.montecarlo.desc"), cta: t("home.pages.montecarlo.cta") },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-bg selection:bg-pv-blue/20">
      {/* Soft mesh background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1100px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#F4F2FE_0%,#FAFAF7_55%,#FAFAF7_100%)]" />
        <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 right-[5%] w-[620px] h-[620px] rounded-full bg-[#9283F2]/25 blur-[120px]" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#F5D9A8]/40 blur-[120px]" />
        <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[420px] right-[30%] w-[380px] h-[380px] rounded-full bg-[#7DD3C0]/20 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#DAD7CF_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(180deg,black,transparent_80%)]" />
      </div>

      {/* Hero */}
      <section
        className="relative z-10 page-container pt-36 md:pt-40 pb-10 grid lg:grid-cols-[1fr_1.05fr] gap-6 items-center min-h-[86vh]"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-pv-blue bg-white/80 border border-pv-blue/20 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-pv-blue" /> {c.eyebrow}
          </span>
          <h1 className="mt-6 text-[17vw] sm:text-[12vw] md:text-8xl lg:text-[132px] font-bold leading-[0.86] tracking-tighter text-text">
            Quantrih
          </h1>
          <p id="hero-gradient-title" className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-[#5B4BDB] via-[#7B6CF0] to-[#C9A24A] bg-clip-text text-transparent">
            {t("home.hero.title2")}
          </p>
          <p className="mt-6 max-w-xl text-base md:text-lg text-text-3 leading-relaxed">{c.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onGoPage("portfolio-backtest")} className="group inline-flex items-center gap-2 bg-text text-bg font-semibold text-sm px-6 py-3.5 rounded-full shadow-[0_12px_30px_-10px_rgba(20,20,26,0.5)] hover:opacity-90">
              {c.ctaStart} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-2 bg-white/80 border border-border font-semibold text-sm px-6 py-3.5 rounded-full hover:border-border-2">
              <Play size={15} className="text-pv-blue" /> {c.ctaDemo}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.15 }} className="relative min-h-[380px] lg:min-h-[640px] flex items-center justify-center">
          <div className="absolute inset-[12%] rounded-full bg-white/60 blur-3xl" />
          <AtomAnimation variant="light" isHovered={heroHovered} />
        </motion.div>
      </section>

      <LiveMarkets label={c.live} />

      <ProductDemo c={c} />

      <ChartShowcase c={c} />

      {/* Tools */}
      <section className="py-20 md:py-24">
        <div className="page-container">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text mb-3">{c.toolsTitle}</h2>
          <p className="text-text-3 max-w-2xl mb-10">{t("home.tools.subtitle")}</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {tools.map((tool, i) => {
              const st = TOOL_STYLE[i];
              const Icon = st.icon;
              return (
                <motion.button
                  key={tool.id}
                  onClick={() => onGoPage(tool.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={cn("group text-left rounded-3xl border border-border bg-gradient-to-br p-7 hover:shadow-[0_20px_44px_-18px_rgba(20,20,26,0.25)] hover:-translate-y-1 transition-all duration-300", st.tint)}
                >
                  <span className={cn("w-11 h-11 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm", st.accent)}><Icon size={20} /></span>
                  <h3 className="mt-5 text-lg font-bold text-text">{tool.title}</h3>
                  <p className="mt-2 text-sm text-text-3 leading-relaxed line-clamp-3">{tool.desc}</p>
                  <span className={cn("mt-5 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all", st.accent)}>{tool.cta} <ArrowRight size={14} /></span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="pb-20">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1E1948] px-8 md:px-16 py-14 md:py-16 text-white">
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#7B6CF0]/40 blur-3xl" />
            <div className="absolute -left-16 -bottom-24 w-80 h-80 rounded-full bg-[#C9A24A]/25 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{c.finalTitle}</h2>
                <p className="mt-3 text-white/70">{c.finalText}</p>
              </div>
              <button onClick={() => onGoPage("portfolio-backtest")} className="shrink-0 inline-flex items-center gap-2 bg-white text-[#1E1948] font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/90">
                {c.ctaStart} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-14 grid md:grid-cols-[1fr_auto] gap-6 items-center rounded-3xl border border-border bg-white p-7">
            <div>
              <h3 className="font-bold text-text">{c.supportTitle}</h3>
              <p className="text-sm text-text-3 mt-1">{c.supportText}</p>
            </div>
            <button onClick={() => window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer")} className="inline-flex items-center justify-center gap-2 border border-border font-semibold text-sm px-6 py-3 rounded-full hover:border-pv-blue/50 hover:text-pv-blue">
              {c.supportCta}
            </button>
          </div>

          <p className="mt-10 text-[11px] text-text-4 text-center max-w-3xl mx-auto leading-relaxed">{t("home.disclaimer")}</p>
        </div>
      </section>
    </div>
  );
}
