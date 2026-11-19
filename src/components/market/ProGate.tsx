import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { usePlan } from "../../lib/plans";

const T = {
  en: {
    kicker: "Pro", title: "Financial statements",
    lead: "Up to 10 years of reported income statements, balance sheets and cash flows for every listed company, annual and quarterly.",
    points: ["Income statement: revenue, margins, earnings per share", "Balance sheet: assets, debt, equity", "Cash flow: operating, investing, free cash flow", "Annual and quarterly periods", "Up to 10 years of history", "Export of every table"],
    cta: "See the Pro plan", note: "Included in Pro. Cancel at any time.",
  },
  fr: {
    kicker: "Pro", title: "États financiers",
    lead: "Jusqu'à 10 ans de comptes de résultat, bilans et flux de trésorerie publiés pour chaque société cotée, annuels et trimestriels.",
    points: ["Compte de résultat : chiffre d'affaires, marges, bénéfice par action", "Bilan : actifs, dette, capitaux propres", "Flux de trésorerie : exploitation, investissement, flux libre", "Périodes annuelles et trimestrielles", "Jusqu'à 10 ans d'historique", "Export de chaque tableau"],
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
