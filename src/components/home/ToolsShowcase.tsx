import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

type ToolId = "asset-allocation" | "portfolio-backtest" | "tactical-allocation" | "montecarlo" | "portfolio-optimization";

export type ShowcaseTool = { id: string; title: string; cta: string };

const META: Record<ToolId, { accent: string; tint: string; fr: { tag: string; chips: string[] }; en: { tag: string; chips: string[] } }> = {
  "asset-allocation": {
    accent: "#1B3F72", tint: "#EEF3FA",
    fr: { tag: "Pondérations par classe d'actifs, rééquilibrage et frais réels.", chips: ["Rééquilibrage", "CAGR", "Drawdown"] },
    en: { tag: "Weights by asset class, rebalancing and real costs.", chips: ["Rebalancing", "CAGR", "Drawdown"] },
  },
  "portfolio-backtest": {
    accent: "#0F766E", tint: "#ECF7F5",
    fr: { tag: "Jusqu'à 10 portefeuilles d'ETF et d'actions comparés sur tout l'historique.", chips: ["Sharpe", "Sortino", "Bêta"] },
    en: { tag: "Up to 10 portfolios of ETFs and stocks compared over the full history.", chips: ["Sharpe", "Sortino", "Beta"] },
  },
  "tactical-allocation": {
    accent: "#B45309", tint: "#FBF4EA",
    fr: { tag: "Règles de momentum et de tendance, bascule vers les actifs refuges.", chips: ["MM 200 j", "Dual momentum", "Force relative"] },
    en: { tag: "Momentum and trend rules, switch to safe-haven assets.", chips: ["200-day MA", "Dual momentum", "Relative strength"] },
  },
  montecarlo: {
    accent: "#4338CA", tint: "#EFEFFB",
    fr: { tag: "10 000 trajectoires pour mesurer la probabilité de succès d'un plan.", chips: ["Risque de séquence", "Retraits", "Inflation"] },
    en: { tag: "10,000 paths to measure the success rate of a plan.", chips: ["Sequence risk", "Withdrawals", "Inflation"] },
  },
  "portfolio-optimization": {
    accent: "#7E22CE", tint: "#F5EFFB",
    fr: { tag: "Frontière efficiente et validation hors échantillon des poids.", chips: ["Sharpe max", "Volatilité min", "Parité des risques"] },
    en: { tag: "Efficient frontier and out-of-sample validation of the weights.", chips: ["Max Sharpe", "Min volatility", "Risk parity"] },
  },
};

const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 1.6, ease: "easeInOut" as const, delay },
});

/** Small light diagram that says what each tool does. Decorative, no real figures. */
function Visual({ id, accent }: { id: ToolId; accent: string }) {
  const grid = (
    <g stroke="rgba(15,23,42,0.07)" strokeWidth="1">
      {[30, 60, 90].map((y) => <line key={y} x1="0" x2="240" y1={y} y2={y} />)}
      {[60, 120, 180].map((x) => <line key={x} y1="0" y2="120" x1={x} x2={x} />)}
    </g>
  );
  if (id === "asset-allocation") {
    const segs = [0.4, 0.25, 0.2, 0.15];
    const cols = [accent, "#5B8BC9", "#9CC0E6", "#D6E4F4"];
    const C = 2 * Math.PI * 38;
    let acc = 0;
    return (
      <svg viewBox="0 0 240 120" className="w-full h-full">
        {grid}
        <g transform="translate(70 60) rotate(-90)">
          {segs.map((v, i) => {
            const off = acc; acc += v;
            return <motion.circle key={i} r="38" fill="none" stroke={cols[i]} strokeWidth="18" strokeDasharray={`${v * C - 2} ${C}`} strokeDashoffset={-off * C}
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }} />;
          })}
        </g>
        {segs.map((v, i) => (
          <g key={i} transform={`translate(132 ${26 + i * 22})`}>
            <rect width="10" height="10" rx="2" fill={cols[i]} />
            <motion.rect x="16" y="2" height="6" rx="3" fill="rgba(15,23,42,0.12)" initial={{ width: 0 }} whileInView={{ width: 80 * v + 10 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 + i * 0.12 }} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "portfolio-backtest") {
    return (
      <svg viewBox="0 0 240 120" className="w-full h-full">
        {grid}
        <motion.path d="M0,100 L24,94 L48,96 L72,80 L96,86 L120,66 L144,70 L168,50 L192,44 L216,30 L240,18" fill="none" stroke={accent} strokeWidth="2.5" {...draw(0.1)} />
        <motion.path d="M0,100 L24,97 L48,92 L72,90 L96,88 L120,80 L144,82 L168,72 L192,66 L216,62 L240,54" fill="none" stroke="#5EAFA6" strokeWidth="2" {...draw(0.3)} />
        <motion.path d="M0,100 L24,99 L48,98 L72,95 L96,96 L120,92 L144,90 L168,88 L192,86 L216,82 L240,80" fill="none" stroke="#B9D9D4" strokeWidth="2" {...draw(0.5)} />
      </svg>
    );
  }
  if (id === "tactical-allocation") {
    return (
      <svg viewBox="0 0 240 120" className="w-full h-full">
        {grid}
        <motion.rect x="120" y="0" width="56" height="120" fill={accent} initial={{ opacity: 0 }} whileInView={{ opacity: 0.09 }} viewport={{ once: true }} transition={{ delay: 1.2, duration: 0.6 }} />
        <motion.path d="M0,80 L20,70 L40,74 L60,56 L80,50 L100,58 L120,76 L140,92 L160,84 L176,70 L200,54 L220,46 L240,36" fill="none" stroke="#0F172A" strokeWidth="2" {...draw(0.1)} />
        <motion.path d="M0,84 C60,70 100,62 130,66 S190,72 240,52" fill="none" stroke={accent} strokeWidth="2.5" strokeDasharray="5 4" {...draw(0.4)} />
        <motion.text x="148" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill={accent} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5 }}>CASH</motion.text>
      </svg>
    );
  }
  if (id === "montecarlo") {
    const paths = Array.from({ length: 14 }, (_, k) => {
      let y = 70; let d = "M0,70";
      for (let x = 20; x <= 240; x += 20) {
        y += Math.sin(k * 1.7 + x * 0.05) * 7 - (k - 6) * 0.9;
        d += ` L${x},${Math.max(6, Math.min(114, y)).toFixed(1)}`;
      }
      return d;
    });
    return (
      <svg viewBox="0 0 240 120" className="w-full h-full">
        {grid}
        {paths.map((d, k) => <motion.path key={k} d={d} fill="none" stroke={accent} strokeOpacity={k === 6 ? 1 : 0.28} strokeWidth={k === 6 ? 2.5 : 1.2} {...draw(0.05 * k)} />)}
      </svg>
    );
  }
  // portfolio-optimization: efficient frontier
  const dots = [[40, 92], [62, 80], [78, 96], [96, 70], [110, 86], [130, 62], [150, 78], [168, 58], [186, 72], [204, 66], [90, 100], [140, 92]];
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full">
      {grid}
      {dots.map(([x, y], i) => <motion.circle key={i} cx={x} cy={y} r="3.2" fill={accent} fillOpacity="0.28" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }} />)}
      <motion.path d="M34,104 C40,60 80,34 130,26 S210,18 236,16" fill="none" stroke={accent} strokeWidth="2.5" {...draw(0.6)} />
      <motion.circle cx="118" cy="28" r="6" fill="white" stroke={accent} strokeWidth="2.5" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.8, type: "spring" }} />
    </svg>
  );
}

export function ToolsShowcase({ tools, fr, onGo }: { tools: ShowcaseTool[]; fr: boolean; onGo: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 w-full max-w-[100rem] mx-auto">
      {tools.map((p, i) => {
        const m = META[p.id as ToolId];
        if (!m) return null;
        const txt = fr ? m.fr : m.en;
        // 3 + 2 on large screens: the bottom row is wider so the grid stays balanced.
        const span = i < 3 ? "lg:col-span-2" : "lg:col-span-3";
        return (
          <motion.button
            type="button"
            key={p.id}
            onClick={() => onGo(p.id)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className={`group relative text-left flex flex-col rounded-[1.6rem] bg-white overflow-hidden ring-1 ring-slate-200/80 shadow-[0_22px_50px_-34px_rgba(6,18,27,0.5)] hover:shadow-[0_34px_70px_-34px_rgba(6,18,27,0.55)] transition-shadow ${span}`}
          >
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: m.accent }} />
            <div className="relative h-44 lg:h-48 px-5 pt-6 pb-3" style={{ background: m.tint }}>
              <span className="absolute top-4 left-5 text-[12px] font-bold tracking-[0.18em]" style={{ color: m.accent }}>{String(i + 1).padStart(2, "0")}</span>
              <Visual id={p.id as ToolId} accent={m.accent} />
            </div>
            <div className="flex-1 flex flex-col px-6 pt-5 pb-6">
              <h4 className="text-[20px] lg:text-[22px] font-bold tracking-tight text-slate-950">{p.title}</h4>
              <p className="mt-2 text-[15px] leading-snug text-slate-800">{txt.tag}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {txt.chips.map((c) => (
                  <span key={c} className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: m.accent, background: m.tint }}>{c}</span>
                ))}
              </div>
              <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-950 group-hover:gap-2.5 transition-all">
                {p.cta} <ArrowRight size={15} />
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
