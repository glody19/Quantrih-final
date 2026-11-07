import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Clock, TrendingUp, Loader2, CornerDownLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { AssetLogo } from "../ui/AssetLogo";

interface Suggestion {
  symbol: string;
  label: string;
  type: string;
  exchange?: string | null;
}

interface StockSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (symbol: string) => void;
  activeSymbol?: string;
  language?: string;
}

const RECENT_KEY = "quantrih.market.recentSearches";

const POPULAR: Suggestion[] = [
  { symbol: "AAPL", label: "Apple", type: "Equity", exchange: "NASDAQ" },
  { symbol: "MSFT", label: "Microsoft", type: "Equity", exchange: "NASDAQ" },
  { symbol: "NVDA", label: "NVIDIA", type: "Equity", exchange: "NASDAQ" },
  { symbol: "AMZN", label: "Amazon", type: "Equity", exchange: "NASDAQ" },
  { symbol: "MC.PA", label: "LVMH", type: "Equity", exchange: "Paris" },
  { symbol: "ASML", label: "ASML", type: "Equity", exchange: "NASDAQ" },
  { symbol: "SAP", label: "SAP", type: "Equity", exchange: "NYSE" },
  { symbol: "BTC-USD", label: "Bitcoin", type: "Crypto", exchange: "CCC" },
];

const LABELS: Record<string, Record<string, string>> = {
  en: { placeholder: "Search a stock, ETF, index or crypto (name or ticker)…", recent: "Recent", popular: "Popular", results: "Results", none: "No match found", search: "Search", clear: "Clear", hint: "to search" },
  fr: { placeholder: "Rechercher une action, un ETF, un indice ou une crypto (nom ou ticker)…", recent: "Récents", popular: "Populaires", results: "Résultats", none: "Aucun résultat", search: "Rechercher", clear: "Effacer", hint: "pour rechercher" },
  de: { placeholder: "Aktie, ETF, Index oder Krypto suchen (Name oder Ticker)…", recent: "Zuletzt", popular: "Beliebt", results: "Ergebnisse", none: "Keine Treffer", search: "Suchen", clear: "Löschen", hint: "zum Suchen" },
  nl: { placeholder: "Zoek een aandeel, ETF, index of crypto (naam of ticker)…", recent: "Recent", popular: "Populair", results: "Resultaten", none: "Geen resultaten", search: "Zoeken", clear: "Wissen", hint: "om te zoeken" },
  es: { placeholder: "Buscar una acción, ETF, índice o cripto (nombre o ticker)…", recent: "Recientes", popular: "Populares", results: "Resultados", none: "Sin resultados", search: "Buscar", clear: "Borrar", hint: "para buscar" },
};

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* storage unavailable */
  }
}

export function StockSearchBar({ value, onChange, onSelect, activeSymbol, language = "en" }: StockSearchBarProps) {
  const t = LABELS[language] || LABELS.en;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value.trim();
  const showingResults = query.length > 0 && query.toUpperCase() !== (activeSymbol || "").toUpperCase();

  // Debounced live search on the real search API
  useEffect(() => {
    if (!showingResults) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = res.ok ? await res.json() : { result: [] };
        const list: Suggestion[] = (data?.result || []).filter((r: any) => r && r.symbol).slice(0, 10);
        setResults(list);
      } catch (e: any) {
        if (e?.name !== "AbortError") setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, showingResults]);

  // "/" focuses the search, Escape closes it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const recentItems: Suggestion[] = useMemo(
    () => recent.map((s) => ({ symbol: s, label: "", type: "recent" })),
    [recent]
  );

  const items: Suggestion[] = showingResults ? results : [...recentItems, ...POPULAR.filter((p) => !recent.includes(p.symbol))];

  const choose = (symbol: string) => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    const next = [sym, ...recent.filter((r) => r !== sym)].slice(0, 6);
    setRecent(next);
    writeRecent(next);
    onChange(sym);
    onSelect(sym);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i - 1 + items.length) % items.length : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) choose(items[activeIndex].symbol);
      else if (showingResults && results[0]) choose(results[0].symbol);
      else choose(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const renderItem = (item: Suggestion, index: number) => {
    const isRecent = item.type === "recent";
    return (
      <button
        key={`${item.type}-${item.symbol}`}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(item.symbol)}
        onMouseEnter={() => setActiveIndex(index)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
          index === activeIndex ? "bg-pv-blue/10" : "hover:bg-surface-2"
        )}
      >
        {isRecent ? (
          <span className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
            <Clock size={15} className="text-text-3" />
          </span>
        ) : (
          <AssetLogo ticker={item.symbol} name={item.label} className="w-8 h-8 rounded-full border border-border shrink-0" />
        )}
        <span className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-text text-sm">{item.symbol}</span>
          {item.label && <span className="text-text-3 text-xs truncate">{item.label}</span>}
        </span>
        {!isRecent && (
          <span className="flex items-center gap-1.5 shrink-0">
            {item.exchange && (
              <span className="text-[12px] font-semibold text-text-3 bg-surface-2 border border-border px-2 py-0.5 rounded-md">{item.exchange}</span>
            )}
            <span className="text-[12px] font-semibold text-pv-blue bg-pv-blue/10 px-2 py-0.5 rounded-md">{item.type}</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      <div
        className={cn(
          "flex items-center gap-2 bg-surface border rounded-2xl shadow-sm transition-all h-14 pl-4 pr-2",
          open ? "border-pv-blue ring-4 ring-pv-blue/10" : "border-border hover:border-border-2"
        )}
      >
        {loading ? <Loader2 size={20} className="text-pv-blue animate-spin shrink-0" /> : <Search size={20} className="text-text-3 shrink-0" />}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t.placeholder}
          aria-label={t.search}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent outline-none border-none text-base font-medium text-text placeholder:text-text-4 focus:ring-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="p-1.5 rounded-lg text-text-3 hover:text-text hover:bg-surface-2"
            aria-label={t.clear}
          >
            <X size={18} />
          </button>
        )}
        <kbd className="hidden md:inline-flex items-center justify-center h-7 min-w-7 px-2 text-xs font-semibold text-text-3 bg-surface-2 border border-border rounded-md">/</kbd>
        <button
          type="button"
          onClick={() => (showingResults && results[0] ? choose(results[0].symbol) : choose(query))}
          className="h-10 px-5 rounded-xl bg-pv-blue hover:bg-pv-blue-d text-white text-sm font-semibold transition-colors shrink-0"
        >
          {t.search}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto py-2">
            {showingResults ? (
              <>
                <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-text-3">{t.results}</div>
                {!loading && results.length === 0 && <div className="px-4 py-6 text-sm text-text-3 text-center">{t.none}</div>}
                {results.map((r, i) => renderItem(r, i))}
              </>
            ) : (
              <>
                {recentItems.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-text-3">{t.recent}</div>
                    {recentItems.map((r, i) => renderItem(r, i))}
                  </>
                )}
                <div className="px-4 py-1.5 mt-1 text-xs font-bold uppercase tracking-wider text-text-3 flex items-center gap-1.5">
                  <TrendingUp size={13} /> {t.popular}
                </div>
                {POPULAR.filter((p) => !recent.includes(p.symbol)).map((p, i) => renderItem(p, recentItems.length + i))}
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-4 py-2 border-t border-border text-xs text-text-3 bg-surface-2/50">
            <CornerDownLeft size={12} /> Enter {t.hint} · ↑ ↓ · Esc
          </div>
        </div>
      )}
    </div>
  );
}
