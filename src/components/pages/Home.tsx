import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Play, TrendingDown, TrendingUp } from "lucide-react";
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
    ctaDemo: "Voir l'outil en action",
    live: "Marchés",
    methodTitle: "Quatre outils, une seule méthode",
    methodSub: "Répartir, rejouer, protéger, projeter. Chaque étape répond à une question que tout investisseur se pose.",
    steps: [
      { verb: "Répartir", q: "Quelle part en actions, en obligations, en or ?", d: "Comparez jusqu'à six allocations côte à côte et voyez laquelle a le mieux résisté aux crises.", cta: "Comparer des allocations", id: "asset-allocation" },
      { verb: "Rejouer", q: "Qu'aurait donné mon portefeuille depuis 2000 ?", d: "Vos ETF ou actions, vos versements, vos frais. Le calcul se fait mois par mois, dividendes compris.", cta: "Lancer un backtest", id: "portfolio-backtest" },
      { verb: "Protéger", q: "Peut-on éviter les grosses baisses ?", d: "Testez des règles simples, comme la moyenne mobile sur 200 jours, qui passent en obligations quand le marché se retourne.", cta: "Tester une stratégie", id: "tactical-allocation" },
      { verb: "Projeter", q: "Mon épargne tiendra-t-elle ?", d: "10 000 scénarios pour estimer vos chances d'atteindre votre objectif, inflation et retraits compris.", cta: "Simuler mon épargne", id: "montecarlo" },
    ],
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
    ctaDemo: "See the tool in action",
    live: "Markets",
    methodTitle: "Four tools, one method",
    methodSub: "Allocate, replay, protect, project. Each step answers a question every investor asks.",
    steps: [
      { verb: "Allocate", q: "How much in stocks, bonds and gold?", d: "Compare up to six allocations side by side and see which one held up best in crises.", cta: "Compare allocations", id: "asset-allocation" },
      { verb: "Replay", q: "How would my portfolio have done since 2000?", d: "Your ETFs or stocks, your contributions, your fees. Computed month by month, dividends included.", cta: "Run a backtest", id: "portfolio-backtest" },
      { verb: "Protect", q: "Can I avoid the big drops?", d: "Test simple rules, such as the 200-day moving average, that switch to bonds when the market turns.", cta: "Test a strategy", id: "tactical-allocation" },
      { verb: "Project", q: "Will my savings last?", d: "10,000 scenarios to estimate your odds of reaching your goal, inflation and withdrawals included.", cta: "Simulate my savings", id: "montecarlo" },
    ],
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
    <div className="flex items-center gap-10 pr-10 shrink-0">
      {items.map((x) => {
        const q = quotes[x.s];
        const up = q.pct >= 0;
        return (
          <span key={x.s} className="inline-flex items-center gap-2.5 text-sm whitespace-nowrap">
            <span className="font-semibold text-white/80">{x.n}</span>
            <span className="font-mono text-white">{q.price.toLocaleString("fr-BE", { maximumFractionDigits: q.price < 10 ? 4 : 2 })}</span>
            <span className={cn("font-mono font-semibold inline-flex items-center gap-0.5", up ? "text-emerald-400" : "text-rose-400")}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {up ? "+" : ""}{q.pct.toFixed(2)} %
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="relative z-10 w-full border-y border-white/10 bg-white/[0.03] backdrop-blur-md">
      <div className="page-container flex items-center gap-5 py-3.5">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B6ABF7]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {label}
        </span>
        <div className="flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          <div className="flex w-max animate-marquee" style={{ animationDuration: "50s" }}>
            {row}
            {row}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────── method (4 tools) ───────────────────────────────
// Small schematic per step, drawn in SVG so they stay crisp at any size.
function StepVisual({ i }: { i: number }) {
  const stroke = "#B6ABF7";
  if (i === 0) {
    return (
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <circle cx="35" cy="35" r="24" fill="none" stroke="#7B6CF0" strokeWidth="11" strokeDasharray="75 151" transform="rotate(-90 35 35)" />
        <circle cx="35" cy="35" r="24" fill="none" stroke="#2DD4BF" strokeWidth="11" strokeDasharray="38 151" strokeDashoffset="-75" transform="rotate(-90 35 35)" />
        <circle cx="35" cy="35" r="24" fill="none" stroke="#E2B84F" strokeWidth="11" strokeDasharray="38 151" strokeDashoffset="-113" transform="rotate(-90 35 35)" />
        {[0, 1, 2].map((k) => <rect key={k} x="72" y={18 + k * 14} width={[38, 26, 18][k]} height="6" rx="3" fill={["#7B6CF0", "#2DD4BF", "#E2B84F"][k]} opacity="0.85" />)}
      </svg>
    );
  }
  if (i === 1) {
    return (
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <polyline points="4,60 20,52 34,55 48,40 58,48 72,30 86,34 100,18 116,10" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="4,62 24,58 44,54 64,50 84,44 104,40 116,36" fill="none" stroke="#E2B84F" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
        <circle cx="116" cy="10" r="3.5" fill={stroke} />
      </svg>
    );
  }
  if (i === 2) {
    return (
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <rect x="56" y="6" width="26" height="58" rx="4" fill="#2DD4BF" opacity="0.12" />
        <polyline points="4,40 18,30 32,34 46,22 56,26 62,48 70,58 82,40 96,30 116,18" fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="3 4" opacity="0.7" />
        <polyline points="4,40 18,30 32,34 46,22 56,26 82,26 96,20 116,10" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 70" className="w-full h-full">
      <path d="M4 50 L116 8 L116 64 Z" fill="#7B6CF0" opacity="0.18" />
      <path d="M4 50 L116 22 L116 50 Z" fill="#7B6CF0" opacity="0.25" />
      <line x1="4" y1="50" x2="116" y2="36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Method({ c, onGoPage }: { c: Copy; onGoPage: (id: string) => void }) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="page-container">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">{c.methodTitle}</h2>
          <p className="mt-5 text-lg md:text-xl text-white/65 leading-relaxed">{c.methodSub}</p>
        </div>

        <div className="relative mt-16">
          {/* connecting rail behind the step numbers */}
          <div className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-[#7B6CF0] via-[#2DD4BF] to-[#E2B84F] opacity-50" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.steps.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span className="relative z-10 flex w-12 h-12 rounded-full items-center justify-center text-lg font-bold text-white bg-[#16133A] border border-white/15 shadow-[0_0_0_6px_rgba(11,10,31,1)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => onGoPage(s.id)}
                  className="group mt-6 w-full text-left rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] hover:border-[#7B6CF0]/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-20 mb-5 rounded-2xl bg-[#0F0D2A] border border-white/5 p-3"><StepVisual i={i} /></div>
                  <p className="text-2xl font-bold text-white">{s.verb}</p>
                  <p className="mt-2 text-base font-semibold text-[#CFC8FB] leading-snug">{s.q}</p>
                  <p className="mt-3 text-[15px] text-white/60 leading-relaxed">{s.d}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                    {s.cta} <ArrowRight size={16} />
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
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
          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={() => onGoPage("portfolio-backtest")} className="group inline-flex items-center gap-2 bg-white text-[#0B0A1F] font-semibold text-base px-7 py-4 rounded-full shadow-[0_14px_40px_-12px_rgba(123,108,240,0.8)] hover:bg-white/90">
              {c.ctaStart} <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/15 text-white font-semibold text-base px-7 py-4 rounded-full hover:bg-white/10">
              <Play size={16} className="text-[#B6ABF7]" /> {c.ctaDemo}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.15 }} className="relative min-h-[380px] lg:min-h-[660px] flex items-center justify-center">
          <AtomAnimation isHovered={heroHovered} />
        </motion.div>
      </section>

      <LiveMarkets label={c.live} />

      <Method c={c} onGoPage={onGoPage} />

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
