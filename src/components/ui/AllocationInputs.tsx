import React from "react";
import { Play, Search, Link2, Check } from "lucide-react";
import { buildShareUrl } from "../../lib/shareLink";
import { toUcits, hasUsEtf } from "../../data/ucitsEquivalents";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { TickerInput, ClassChip, type TickerOption } from "./TickerInput";
import { ASSET_CLASS_META, assetClass, assetName } from "./assetClass";

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
      <div className="relative flex items-center w-[148px] shrink-0 rounded-full bg-[#F3F6FA] pl-3 pr-2.5 py-1.5 ring-1 ring-transparent focus-within:ring-[#1B3F72]/35 focus-within:bg-white transition-all">
        <span className="w-2.5 h-2.5 rounded-full shrink-0 mr-2 transition-colors" style={{ background: s ? color : "#CBD5E1" }} />
        <TickerInput
          value={symbol}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          className="!bg-transparent !border-0 !p-0 !rounded-none text-[13px] font-bold text-slate-900 focus:!border-0 w-full"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </div>
      <div className="min-w-0 flex-1">
        {name ? (
          <>
            <span className="block text-[14.5px] font-semibold leading-snug text-slate-800 line-clamp-2" title={name}>{name}</span>
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

/** Main action of the allocation tools: compact navy button with a light sweep on hover. */
export function RunButton({ onClick, running, label, runningLabel, disabled, className }: { onClick: () => void; running: boolean; label: React.ReactNode; runningLabel: React.ReactNode; disabled?: boolean; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={running || disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative overflow-hidden inline-flex items-center gap-2.5 rounded-full pl-2 pr-5 py-2 text-[13px] font-semibold tracking-wide text-white",
        "bg-[linear-gradient(135deg,#0C2233_0%,#14466B_60%,#1D6FA8_100%)] shadow-[0_10px_24px_-12px_rgba(12,34,51,0.8)] hover:shadow-[0_14px_30px_-12px_rgba(29,111,168,0.75)] transition-shadow",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/15 translate-x-0 group-hover:translate-x-[420%] transition-transform duration-700" />
      <span className="relative flex w-7 h-7 items-center justify-center rounded-full bg-[#38BDF8] text-[#06111A]">
        {running ? <span className="w-3.5 h-3.5 border-2 border-[#06111A]/25 border-t-[#06111A] rounded-full animate-spin" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
      </span>
      <span className="relative">{running ? runningLabel : label}</span>
    </motion.button>
  );
}

/** Copies a link that reopens the tool with exactly the same settings. */
export function ShareLinkButton({ prefix, className }: { prefix: string; className?: string }) {
  const { language } = useTranslation();
  const fr = language === "fr";
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    const url = buildShareUrl(prefix);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(fr ? "Copiez ce lien :" : "Copy this link:", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={fr ? "Le lien rouvre cet outil avec les mêmes réglages et portefeuilles" : "The link reopens this tool with the same settings and portfolios"}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 rounded-lg px-3 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors",
        className,
      )}
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} />}
      <span>{copied ? (fr ? "Lien copié" : "Link copied") : (fr ? "Copier le lien" : "Copy link")}</span>
    </button>
  );
}

/**
 * European investor mode: one click swaps the US ETFs of the table for their UCITS equivalents
 * listed in euros, with an undo. Results are then in euros and include the currency effect.
 */
export function EuropeanSwitch<T extends { symbol: string }>({ rows, onChange, className }: { rows: T[]; onChange: (rows: T[]) => void; className?: string }) {
  const { language } = useTranslation();
  const fr = language === "fr";
  const [undo, setUndo] = React.useState<{ rows: T[]; swapped: { from: string; to: string; note?: { fr?: string; en?: string } }[] } | null>(null);
  const canSwap = hasUsEtf(rows);
  if (!canSwap && !undo) return null;
  const apply = () => {
    const res = toUcits(rows);
    if (!res.swapped.length) return;
    setUndo({ rows, swapped: res.swapped });
    onChange(res.rows);
  };
  const notes = undo ? [...new Set(undo.swapped.map((x) => (fr ? x.note?.fr : x.note?.en)).filter(Boolean) as string[])] : [];
  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      {canSwap ? (
        <button
          type="button"
          onClick={apply}
          title={fr ? "Remplace les ETF américains par leurs équivalents UCITS achetables en Europe, cotés en euros" : "Swaps US ETFs for their UCITS equivalents that European investors can buy, listed in euros"}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          {fr ? "Version européenne (UCITS, €)" : "European version (UCITS, EUR)"}
        </button>
      ) : null}
      {undo && (
        <p className="text-[12px] text-slate-500 text-right max-w-[520px] leading-snug">
          {fr
            ? `${undo.swapped.length} ETF remplacé${undo.swapped.length > 1 ? "s" : ""} par des équivalents UCITS cotés en euros (${[...new Set(undo.swapped.map((x) => x.to))].join(", ")}). Résultats en euros, effet de change compris ; l'historique commence souvent entre 2009 et 2019.`
            : `${undo.swapped.length} ETF${undo.swapped.length > 1 ? "s" : ""} swapped for UCITS equivalents listed in euros (${[...new Set(undo.swapped.map((x) => x.to))].join(", ")}). Results in euros, currency effect included; history often starts between 2009 and 2019.`}
          {notes.length ? ` ${fr ? "Approximations :" : "Approximations:"} ${notes.join(fr ? " ; " : "; ")}.` : ""}{" "}
          <button
            type="button"
            onClick={() => {
              onChange(undo.rows);
              setUndo(null);
            }}
            className="underline underline-offset-2 text-slate-700 hover:text-slate-900"
          >
            {fr ? "Annuler" : "Undo"}
          </button>
        </p>
      )}
    </div>
  );
}
