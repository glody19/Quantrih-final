import React from "react";
import { Play, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { TickerInput, ClassChip, type TickerOption } from "./TickerInput";
import { ASSET_CLASS_META, assetClass, assetName, type AssetClassKey } from "./assetClass";

/**
 * Ticker and full name of one asset row, shared by the four allocation tools.
 * The name is never cut: it wraps on two lines when needed.
 */
export function AssetPicker({ symbol, onChange, options, placeholder = "Ticker" }: { symbol: string; onChange: (v: string) => void; options?: TickerOption[]; placeholder?: string }) {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const s = symbol.trim().toUpperCase();
  const fromList = options?.find((o) => o.symbol.toUpperCase() === s)?.label;
  const name = assetName(s) || fromList || "";
  const cls = assetClass(s, fromList);
  const color = ASSET_CLASS_META[cls].color;
  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <div className="relative flex items-center w-[132px] shrink-0 rounded-md bg-slate-50 pl-2.5 pr-2 py-1.5 ring-1 ring-slate-200/70 hover:ring-slate-300 focus-within:bg-white focus-within:ring-slate-400 transition-colors">
        <span className="w-2 h-2 rounded-full shrink-0 mr-2 transition-colors" style={{ background: s ? color : "#CBD5E1" }} />
        <TickerInput
          value={symbol}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          className="!bg-transparent !border-0 !p-0 !rounded-none text-[13px] font-semibold tabular-nums text-slate-900 focus:!border-0 w-full"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </div>
      <div className="min-w-0 flex-1">
        {name ? (
          <>
            <span className="block text-[13.5px] font-medium leading-snug text-slate-800 line-clamp-2" title={name}>{name}</span>
            <span className="mt-0.5 block"><ClassChip cls={cls} lang={lang} /></span>
          </>
        ) : (
          <span className="text-[13px] text-slate-400">{s ? (lang === "fr" ? "Nom non disponible" : "Name not available") : (lang === "fr" ? "Choisissez un actif" : "Pick an asset")}</span>
        )}
      </div>
    </div>
  );
}

/** Group a list of { group, options } (as used by Asset Allocation and Monte Carlo) into picker options. */
export const toOptions = (groups: { group: string; options: { symbol: string; label: string }[] }[]): TickerOption[] =>
  groups.flatMap((g) => g.options.map((o) => ({ symbol: o.symbol, label: o.label, group: g.group })));

/**
 * Main action of the allocation tools: a quiet outlined button (white, thin grey border, dark text).
 * No gradient, no glow: the results are the star, not the button. Ctrl/Cmd + Enter also runs it.
 */
export function RunButton({ onClick, running, label, runningLabel, disabled, className }: { onClick: () => void; running: boolean; label: React.ReactNode; runningLabel: React.ReactNode; disabled?: boolean; className?: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ref.current && !ref.current.disabled) {
        e.preventDefault();
        ref.current.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={running || disabled}
      title="Ctrl + Enter"
      className={cn(
        "inline-flex items-center gap-2 h-9 rounded-lg border border-slate-300 bg-white px-3.5 text-[13px] font-medium text-slate-800",
        "hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {running ? (
        <span className="w-3 h-3 border-[1.5px] border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      ) : (
        <Play size={11} fill="currentColor" className="text-slate-700" />
      )}
      <span>{running ? runningLabel : label}</span>
    </button>
  );
}

/**
 * Shown where the report will appear before the first run: one slim, quiet line
 * instead of a large empty frame.
 */
export function ResultsPlaceholder({ className }: { className?: string }) {
  const { language } = useTranslation();
  const fr = language === "fr";
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-4", className)}>
      <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" className="shrink-0 text-slate-300">
        <polyline points="1,19 10,15 18,17 27,10 35,12 44,6 52,8 63,2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-[13px] text-slate-500 leading-snug">
        {fr
          ? "Les résultats apparaîtront ici : croissance, rendements annuels, drawdowns et ratios de risque."
          : "Results will appear here: growth, annual returns, drawdowns and risk ratios."}
      </p>
    </div>
  );
}

/** One weight cell: a compact right-aligned number field with the % sign inside. */
export function WeightInput({ value, onChange }: { value: string | number | undefined; onChange: (v: string) => void }) {
  return (
    <div className="relative w-[88px] mx-auto">
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full h-9 rounded-md border border-slate-200 bg-white pl-2 pr-6 text-right text-[13.5px] font-medium tabular-nums text-slate-900 placeholder:text-slate-300 outline-none hover:border-slate-300 focus:border-slate-500 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">%</span>
    </div>
  );
}

/** Total of one portfolio column: plain text, a small check when it is exactly 100%. */
export function WeightTotal({ total }: { total: number }) {
  const { language } = useTranslation();
  const ok = Math.abs(total - 100) < 0.001;
  const rounded = Math.round(total * 100) / 100;
  const gap = Math.round((100 - total) * 100) / 100;
  return (
    <div className="w-[88px] mx-auto text-right pr-2">
      <span className={cn("text-[13.5px] font-semibold tabular-nums", ok ? "text-slate-900" : "text-red-600")}>
        {rounded} %
      </span>
      <span className={cn("block text-[11px] leading-tight mt-0.5", ok ? "text-emerald-600" : "text-red-500")}>
        {ok
          ? (language === "fr" ? "Complet" : "Complete")
          : gap > 0
          ? (language === "fr" ? `Reste ${gap} %` : `${gap}% left`)
          : (language === "fr" ? `${-gap} % de trop` : `${-gap}% over`)}
      </span>
    </div>
  );
}

/**
 * Thin stacked bar under a portfolio name that shows its mix by asset class as you type,
 * so the allocation is readable at a glance before running anything.
 */
export function AllocationBar({ rows }: { rows: { symbol: string; weight: number }[] }) {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const byClass = new Map<AssetClassKey, number>();
  for (const r of rows) {
    const w = Number(r.weight) || 0;
    if (!r.symbol.trim() || w <= 0) continue;
    const c = assetClass(r.symbol.trim().toUpperCase());
    byClass.set(c, (byClass.get(c) || 0) + w);
  }
  const parts = [...byClass.entries()].sort((a, b) => b[1] - a[1]);
  const total = parts.reduce((s, [, w]) => s + w, 0);
  const title = parts.map(([c, w]) => `${ASSET_CLASS_META[c][lang]} ${Math.round(w)}%`).join(" · ");
  return (
    <div className="mt-1.5 h-1 w-full max-w-[110px] mx-auto rounded-full bg-slate-100 overflow-hidden flex" title={title}>
      {parts.map(([c, w]) => (
        <span key={c} style={{ width: `${(w / Math.max(100, total)) * 100}%`, background: ASSET_CLASS_META[c].color }} />
      ))}
    </div>
  );
}
