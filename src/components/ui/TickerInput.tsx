import React, { useState, useEffect, useRef } from "react";
import { ASSET_DATA } from "../../constants";
import { cn } from "../../lib/utils";

export interface TickerInputProps {
 value: string;
 onChange: (value: string) => void;
 onSelect?: (value: string) => void;
 placeholder?: string;
 className?: string;
 disabled?: boolean;
 onSubmit?: (val: string) => void;
}

function AssetIcon({ symbol }: { symbol: string }) {
 const [errorLevel, setErrorLevel] = useState(0);
 const size = 24;
 const target = symbol.toLowerCase().split('-')[0];
 
 let url = `https://eodhd.com/img/logos/US/${symbol}.png`;
 if (errorLevel === 1) {
 url = `https://logo.clearbit.com/${target}.com?size=${size}`;
 } else if (errorLevel >= 2) {
 url = `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&size=${size}&font-size=0.4`;
 }
 
 return (
 <img 
 src={url}
 alt={symbol}
 onError={() => setErrorLevel(prev => prev + 1)}
 className="w-6 h-6 rounded-full shadow-sm bg-white p-0.5 flex-shrink-0 object-contain"
 loading="lazy"
 />
 );
}

export function TickerInput({
 value,
 onChange,
 onSelect,
 placeholder = "Ticker",
 className,
 disabled,
 onSubmit
}: TickerInputProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [suggestions, setSuggestions] = useState<{ symbol: string; label: string; type: string }[]>([]);
 const [activeIndex, setActiveIndex] = useState(-1);
 const containerRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);

 // Generate lists of suggestions based on typed input or default popular assets
 useEffect(() => {
 const val = value.trim().toUpperCase();
 
 const popularAssets = [
 {symbol: 'AAPL', label: 'Apple Inc.', type: 'Equity'},
 {symbol: 'MSFT', label: 'Microsoft', type: 'Equity'},
 {symbol: 'TSLA', label: 'Tesla', type: 'Equity'},
 {symbol: 'BTCUSDT', label: 'Bitcoin USD', type: 'Crypto'},
 {symbol: 'ETHUSDT', label: 'Ethereum USD', type: 'Crypto'},
 {symbol: 'NVDA', label: 'NVIDIA Corp', type: 'Equity'}
 ];

 if (!val) {
 setSuggestions(popularAssets);
 return;
 }

 const fetchSuggestions = async () => {
 try {
 const res = await fetch(`/api/stock/search?q=${encodeURIComponent(val)}`);
 if (res.ok) {
 const data = await res.json();
 if (data && data.result) {
 const mapped = data.result.filter((r: any) => r.symbol).map((r: any) => ({
 symbol: r.symbol,
 label: r.label,
 type: r.type || 'Equity'
 }));
 
 setSuggestions(mapped.slice(0, 15));
 }
 }
 } catch (e) {}
 };

 const timeout = setTimeout(fetchSuggestions, 300);
 return () => clearTimeout(timeout);
 }, [value]);

 // Handle clicking outside to close suggestions list
 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (!isOpen) {
 if (e.key === "ArrowDown") {
 setIsOpen(true);
 setActiveIndex(0);
 e.preventDefault();
 } else if (e.key === "Enter" && onSubmit) {
 onSubmit(value);
 e.preventDefault();
 }
 return;
 }

 if (e.key === "ArrowDown") {
 setActiveIndex(prev => (prev + 1) % suggestions.length);
 e.preventDefault();
 } else if (e.key === "ArrowUp") {
 setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
 e.preventDefault();
 } else if (e.key === "Enter") {
 if (activeIndex >= 0 && activeIndex < suggestions.length) {
 const sym = suggestions[activeIndex].symbol;
 onChange(sym);
 if (onSelect) onSelect(sym);
 setIsOpen(false);
 e.preventDefault();
 } else if (suggestions.length > 0) {
 const sym = suggestions[0].symbol;
 onChange(sym);
 if (onSelect) onSelect(sym);
 setIsOpen(false);
 e.preventDefault();
 } else {
 if (onSubmit) onSubmit(value);
 setIsOpen(false);
 e.preventDefault();
 }
 } else if (e.key === "Escape") {
 setIsOpen(false);
 }
 };

 const handleItemSelect = (symbol: string) => {
 onChange(symbol);
 if (onSelect) onSelect(symbol);
 setIsOpen(false);
 // Focus back on input
 inputRef.current?.focus();
 };

 return (
 <div ref={containerRef} className="relative w-full">
 <input
 ref={inputRef}
 type="text"
 value={value}
 onChange={e => {
 onChange(e.target.value);
 setIsOpen(true);
 setActiveIndex(-1);
 }}
 onFocus={() => {
 setIsOpen(true);
 setActiveIndex(-1);
 }}
 onKeyDown={handleKeyDown}
 placeholder={placeholder}
 disabled={disabled}
 className={cn(
 "w-full bg-surface text-xs p-1.5 border border-border rounded outline-none focus:border-pv-blue transition-colors",
 className
 )}
 />

 {isOpen && suggestions.length > 0 && !disabled && (
 <div className="absolute left-0 top-full mt-1.5 w-full bg-surface-2 border border-border rounded-[1.5rem] shadow-2xl z-50 py-1 overflow-hidden animate-fade-in font-sans">
 <div className="px-2 py-1 text-xs font-semibold text-text border-b border-border/40">
 {value.trim() ? "Matching Tickers" : "Available Assets"}
 </div>
 <div className="max-h-60 overflow-y-auto no-scrollbar">
 {Object.entries(
 suggestions.reduce((acc, item) => {
 const type = item.type || "Other";
 if (!acc[type]) acc[type] = [];
 acc[type].push(item);
 return acc;
 }, {} as Record<string, typeof suggestions>)
 ).map(([type, items]) => (
 <div key={type}>
 <div className="px-3 py-1 bg-surface-3/50 text-xs font-semibold text-text sticky top-0 backdrop-blur-sm z-10">
 {type}
 </div>
 {items.map((item) => {
 const index = suggestions.findIndex(s => s.symbol === item.symbol);
 return (
 <button
 key={item.symbol}
 type="button"
 onClick={() => handleItemSelect(item.symbol)}
 onMouseEnter={() => setActiveIndex(index)}
 className={cn(
 "w-full text-left px-3 py-2 flex items-center justify-between transition-colors text-xs border-b border-border/30 last:border-0",
 index === activeIndex 
 ? "bg-pv-blue/10 text-pv-blue" 
 : "hover:bg-surface-3 text-text"
 )}
 >
 <div className="flex items-center min-w-0 gap-3">
 <AssetIcon symbol={item.symbol} />
 <div className="flex flex-col min-w-0">
 <span className="font-bold ">{item.symbol}</span>
 <span className="text-xs text-text truncate max-w-[160px]">{item.label}</span>
 </div>
 </div>
 </button>
 );
 })}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
