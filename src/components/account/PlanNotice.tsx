import React from "react";
import { Lock } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";

/** Small notice shown in a tool when the plan limited the run. */
export function PlanNotice({ messages }: { messages: string[] }) {
  const { language } = useTranslation();
  if (!messages.length) return null;
  return (
    <div className="mt-2 p-3 rounded-2xl border border-[#1B3F72]/20 bg-[#1B3F72]/[0.05] text-[15px] text-[#14466B] flex flex-wrap items-center gap-x-3 gap-y-1">
      <Lock className="w-4 h-4 shrink-0" />
      <span className="flex-1 min-w-[200px]">{messages.join(" ")}</span>
      <a href="/pricing" className="font-semibold underline underline-offset-4">{language === "fr" ? "Voir les tarifs" : "See pricing"}</a>
    </div>
  );
}

export function planMessages(language: string, opts: { clampedTo?: string; maxYears?: number; dropped?: number; maxPortfolios?: number }) {
  const fr = language === "fr";
  const out: string[] = [];
  if (opts.clampedTo) out.push(fr ? `Formule Freemium : backtest limité à ${opts.maxYears} ans, il commence en ${opts.clampedTo.slice(0, 7)}.` : `Freemium plan: backtests are limited to ${opts.maxYears} years, this one starts in ${opts.clampedTo.slice(0, 7)}.`);
  if (opts.dropped) out.push(fr ? `Votre formule compare ${opts.maxPortfolios} portefeuilles au plus : ${opts.dropped} n'${opts.dropped > 1 ? "ont" : "a"} pas été calculé${opts.dropped > 1 ? "s" : ""}.` : `Your plan compares up to ${opts.maxPortfolios} portfolios: ${opts.dropped} ${opts.dropped > 1 ? "were" : "was"} not run.`);
  return out;
}
