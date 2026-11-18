import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { ASSET_CLASS_META, assetClass, assetName, rememberName, type AssetClassKey } from "./assetClass";

export interface TickerOption { symbol: string; label: string; group?: string }

export interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSubmit?: (val: string) => void;
  /** A fixed list to pick from (filtered locally, no server search). */
  options?: TickerOption[];
}

type Suggestion = { symbol: string; label: string; group: string; cls: AssetClassKey };

const POPULAR = ["VTI", "SPY", "QQQ", "VXUS", "IWDA.AS", "VWCE.DE", "BND", "TLT", "IEF", "GLD", "VNQ", "BTC-USD", "AAPL", "MSFT", "NVDA"];

/** Coloured dot marking the asset class of a ticker. */
export function ClassDot({ cls, className }: { cls: AssetClassKey; className?: string }) {
  return <span className={cn("inline-block w-2.5 h-2.5 rounded-full shrink-0", className)} style={{ background: ASSET_CLASS_META[cls].color }} />;
}

/** Small label with the asset class, in its colour. */
export function ClassChip({ cls, lang }: { cls: AssetClassKey; lang: "en" | "fr" }) {
  const m = ASSET_CLASS_META[cls];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color }} />
      {lang === "fr" ? m.fr : m.en}
    </span>
  );
}

export function TickerInput({ value, onChange, onSelect, placeholder = "Ticker", className, disabled, onSubmit, options }: TickerInputProps) {
  const { language } = useTranslation();
  const lang: "en" | "fr" = language === "fr" ? "fr" : "en";
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typed = useRef(false); // true once the user types: until then a fixed list shows every option

  const toSuggestion = (symbol: string, label: string, group?: string): Suggestion => {
    rememberName(symbol, label);
    const cls = assetClass(symbol, label);
    return { symbol, label: assetName(symbol) || label || symbol, group: group || (lang === "fr" ? ASSET_CLASS_META[cls].fr : ASSET_CLASS_META[cls].en), cls };
  };

  // Suggestions: the fixed list when one is given, otherwise popular tickers or the server search
  useEffect(() => {
    const val = value.trim().toUpperCase();
    if (options) {
      const all = options.map((o) => toSuggestion(o.symbol, o.label, o.group));
      const hit = typed.current && val ? all.filter((o) => o.symbol.toUpperCase().includes(val) || o.label.toUpperCase().includes(val)) : all;
      setSuggestions(hit.length ? hit : all);
      return;
    }
    // on focus, before any typing: the popular list, with the current ticker on top
    if (!val || !typed.current) {
      const list = val && !POPULAR.includes(val) ? [val, ...POPULAR] : POPULAR;
      setSuggestions(list.map((s) => toSuggestion(s, assetName(s))));
      return;
    }
    let alive = true;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(val)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.result) setSuggestions(data.result.filter((r: any) => r.symbol).slice(0, 18).map((r: any) => toSuggestion(r.symbol, r.label)));
      } catch {
        /* keep the previous list */
      }
    }, 250);
    return () => { alive = false; clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options, lang, isOpen]);

  // The list is drawn in a layer above the page, so tables with horizontal scroll do not clip it
  const place = () => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 24, Math.max(r.width, 480));
    const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    const below = window.innerHeight - r.bottom;
    const up = below < 320 && r.top > below;
    setPos({ left, top: up ? r.top - 8 : r.bottom + 8, width, up });
  };
  useLayoutEffect(() => {
    if (!isOpen) return;
    place();
    const on = () => place();
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on, true); window.removeEventListener("resize", on); };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node;
      if (containerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pick = (symbol: string) => {
    typed.current = false;
    onChange(symbol);
    onSelect?.(symbol);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") { setIsOpen(true); setActiveIndex(0); e.preventDefault(); }
      else if (e.key === "Enter" && onSubmit) { onSubmit(value); e.preventDefault(); }
      return;
    }
    if (e.key === "ArrowDown") { setActiveIndex((p) => (p + 1) % Math.max(1, suggestions.length)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setActiveIndex((p) => (p - 1 + suggestions.length) % Math.max(1, suggestions.length)); e.preventDefault(); }
    else if (e.key === "Enter") {
      const s = suggestions[activeIndex >= 0 ? activeIndex : 0];
      if (s) pick(s.symbol); else { onSubmit?.(value); setIsOpen(false); }
      e.preventDefault();
    } else if (e.key === "Escape") setIsOpen(false);
  };

  const groups = suggestions.reduce((acc, s) => { (acc[s.group] ||= []).push(s); return acc; }, {} as Record<string, Suggestion[]>);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { typed.current = true; onChange(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
        onFocus={() => { typed.current = false; setIsOpen(true); setActiveIndex(-1); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        className={cn("w-full bg-surface text-xs p-1.5 border border-border rounded outline-none focus:border-pv-blue transition-colors uppercase placeholder:normal-case", className)}
      />

      {isOpen && pos && suggestions.length > 0 && !disabled && createPortal(
        <div
          ref={listRef}
          className="fixed z-[200] rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(6,18,27,0.45)] ring-1 ring-slate-900/5 overflow-hidden font-sans animate-fade-in"
          style={{ left: pos.left, width: pos.width, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
        >
          <div className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {value.trim() && typed.current && !options ? (lang === "fr" ? "Résultats" : "Matching tickers") : (lang === "fr" ? "Actifs proposés" : "Suggested assets")}
          </div>
          <div className="max-h-[340px] overflow-y-auto pb-2">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 py-1.5 text-[11px] font-semibold text-slate-500">{group}</div>
                {items.map((item) => {
                  const index = suggestions.indexOf(item);
                  const m = ASSET_CLASS_META[item.cls];
                  const selected = item.symbol.toUpperCase() === value.trim().toUpperCase();
                  return (
                    <button
                      key={item.symbol + group}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(item.symbol)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn("w-full text-left px-4 py-2 flex items-center gap-3 transition-colors", index === activeIndex ? "bg-[#F1F6FC]" : "hover:bg-slate-50", selected && "bg-[#EAF2FB]")}
                    >
                      <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: m.color }} />
                      <span className="w-[86px] shrink-0 text-[13px] font-bold text-slate-900 tabular-nums">{item.symbol}</span>
                      <span className="flex-1 min-w-0 text-[13px] leading-snug text-slate-700">{item.label}</span>
                      <ClassChip cls={item.cls} lang={lang} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
