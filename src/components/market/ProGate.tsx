import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { usePlan } from "../../lib/plans";

const T = {
  en: {
    kicker: "Pro", title: "Fundamental analysis",
    lead: "Valuation, profitability, growth, balance sheet strength and 10 years of financial statements for every listed company, in one place.",
    points: ["Valuation ratios against the sector (P/E, EV/EBITDA, P/B, PEG)", "Margins, ROE, ROIC and their trend", "Debt, liquidity and cash flow coverage", "Dividend history and payout", "Analyst consensus and peers", "Income statement, balance sheet and cash flow, annual and quarterly"],
    cta: "See the Pro plan", note: "Included in Pro. Cancel at any time.",
  },
  fr: {
    kicker: "Pro", title: "Analyse fondamentale",
    lead: "Valorisation, rentabilité, croissance, solidité du bilan et 10 ans d'états financiers pour chaque société cotée, au même endroit.",
    points: ["Ratios de valorisation face au secteur (PER, VE/EBITDA, cours/valeur comptable, PEG)", "Marges, ROE, ROIC et leur évolution", "Dette, liquidité et couverture par les flux de trésorerie", "Historique et taux de distribution du dividende", "Consensus des analystes et sociétés comparables", "Compte de résultat, bilan et flux de trésorerie, annuels et trimestriels"],
    cta: "Voir la formule Pro", note: "Inclus dans Pro. Résiliable à tout moment.",
  },
};

/**
 * Shows its children to Pro members (and admins). Other visitors see a blurred preview and
 * what the Pro plan adds. Limits are applied in the browser until Stripe writes the plan server side.
 */
export function ProGate({ children, language, symbol }: { children: React.ReactNode; language: string; symbol?: string }) {
  const { plan, loading } = usePlan();
  const navigate = useNavigate();
  const t = language === "fr" ? T.fr : T.en;
  if (plan === "pro") return <>{children}</>;
  if (loading) return <div className="h-64 rounded-2xl bg-slate-50 animate-pulse" />;
  return (
    <div className="relative rounded-2xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
      <div aria-hidden className="pointer-events-none select-none max-h-[460px] overflow-hidden blur-[6px] opacity-60">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/85 to-white" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_24px_60px_-30px_rgba(6,18,27,0.35)] p-6 md:p-7">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500"><Lock size={12} /> {t.kicker}</p>
          <h3 className="mt-1.5 text-[22px] font-semibold tracking-tight text-slate-900">{t.title}{symbol ? ` · ${symbol}` : ""}</h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{t.lead}</p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-5 gap-y-2">
            {t.points.map((p) => (
              <li key={p} className="flex gap-2 text-[13.5px] text-slate-700"><Check size={15} className="mt-0.5 shrink-0 text-slate-400" />{p}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => navigate("/pricing")} className="h-10 px-5 rounded-full bg-slate-900 text-white text-[14px] font-semibold hover:bg-slate-700 transition-colors">{t.cta}</button>
            <span className="text-[12.5px] text-slate-500">{t.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
