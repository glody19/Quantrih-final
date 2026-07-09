import React, { memo, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface AdvancedChartProps {
 symbol: string;
 theme?: 'light' | 'dark';
}

const AdvancedTradingViewChartComponent = ({ symbol, theme: initialTheme = 'dark' }: AdvancedChartProps) => {
 const containerRef = useRef<HTMLDivElement>(null);
 const containerId = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);
 const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(initialTheme);

 useEffect(() => {
 if (!containerRef.current) return;

 containerRef.current.innerHTML = '';

 const createWidget = () => {
 if (typeof window !== 'undefined' && (window as any).TradingView) {
 new (window as any).TradingView.widget({
 autosize: true,
 symbol: symbol,
 interval: "D",
 timezone: "Etc/UTC",
 theme: currentTheme,
 style: "1",
 locale: "fr",
 enable_publishing: false,
 allow_symbol_change: true,
 container_id: containerId.current,
 hide_top_toolbar: false,
 hide_legend: false,
 withdateranges: true,
 save_image: false,
 hide_side_toolbar: false,
 details: true,
 hotlist: true,
 calendar: true,
 show_popup_button: true,
 studies: [
 "Volume@tv-basicstudies",
 "MASimple@tv-basicstudies"
 ]
 });
 }
 };

 if (typeof window !== 'undefined' && (window as any).TradingView) {
 createWidget();
 } else {
 const script = document.createElement('script');
 script.src = 'https://s3.tradingview.com/tv.js';
 script.async = true;
 script.onload = createWidget;
 document.head.appendChild(script);
 
 return () => {
 if (script.parentNode) script.parentNode.removeChild(script);
 };
 }
 }, [symbol, currentTheme]);

 return (
 <div className="w-full h-full border-0 rounded-none overflow-hidden relative group">
 <div id={containerId.current} ref={containerRef} className="w-full h-full absolute inset-0" />
 
 {/* Theme Toggle Button positioned on the top right to not interfere with native UI */}
 <button
 onClick={() => setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark')}
 className="absolute top-4 right-16 z-10 bg-surface/80 backdrop-blur-md border border-border/60 p-1.5 rounded-xl shadow-sm hover:bg-surface text-text transition-all opacity-0 group-hover:opacity-100"
 title="Changer le thème"
 >
 {currentTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
 </button>
 </div>
 );
};

export const AdvancedTradingViewChart = memo(AdvancedTradingViewChartComponent);
