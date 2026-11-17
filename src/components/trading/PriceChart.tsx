import React, { useEffect, useRef, useState } from "react";
import * as LW from "lightweight-charts";
import { cn } from "../../lib/utils";
import { AdvancedTradingViewChart } from "../ui/AdvancedTradingViewChart";

/** Range buttons: our history endpoint takes a range and an interval. */
export const RANGES = [
  { id: "1D", range: "1d", interval: "5m" },
  { id: "5D", range: "5d", interval: "15m" },
  { id: "1M", range: "1mo", interval: "1h" },
  { id: "6M", range: "6mo", interval: "1d" },
  { id: "1Y", range: "1y", interval: "1d" },
  { id: "5Y", range: "5y", interval: "1wk" },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

type Bar = { date: string; open: number; high: number; low: number; close: number; volume?: number };

/**
 * Large candlestick chart with volume, drawn with lightweight-charts from our own price history.
 * When our history is unavailable for a symbol, it falls back to the TradingView widget (also real data).
 */
export function PriceChart({ symbol, dark, labels }: { symbol: string; dark: boolean; labels: { loading: string; fallback: string } }) {
  const box = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<RangeId>("6M");
  const [bars, setBars] = useState<Bar[] | null | "error">(null);
  const [kind, setKind] = useState<"candles" | "line">("candles");

  useEffect(() => {
    let alive = true;
    setBars(null);
    const r = RANGES.find((x) => x.id === range)!;
    fetch(`/api/stock/history/${encodeURIComponent(symbol)}?range=${r.range}&interval=${r.interval}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: Bar[]) => {
        if (!alive) return;
        const clean = (Array.isArray(d) ? d : []).filter((b) => [b.open, b.high, b.low, b.close].every((v) => typeof v === "number" && Number.isFinite(v)));
        setBars(clean.length > 1 ? clean : "error");
      })
      .catch(() => alive && setBars("error"));
    return () => { alive = false; };
  }, [symbol, range]);

  useEffect(() => {
    if (!box.current || !Array.isArray(bars)) return;
    const intraday = range === "1D" || range === "5D" || range === "1M";
    const fg = dark ? "#C9D4E3" : "#334155";
    const grid = dark ? "rgba(148,163,184,0.08)" : "rgba(15,23,42,0.06)";
    const chart = LW.createChart(box.current, {
      autoSize: true,
      layout: { background: { type: LW.ColorType.Solid, color: "transparent" }, textColor: fg, fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, attributionLogo: false },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: intraday, secondsVisible: false },
      crosshair: { mode: LW.CrosshairMode.Normal },
    });
    // dedupe and order by time, as the library requires strictly increasing timestamps
    const seen = new Set<number>();
    const rows = bars
      .map((b) => ({ ...b, t: Math.floor(new Date(b.date).getTime() / 1000) }))
      .filter((b) => Number.isFinite(b.t) && !seen.has(b.t) && seen.add(b.t))
      .sort((a, b) => a.t - b.t);
    const time = (t: number) => t as LW.UTCTimestamp;
    if (kind === "candles") {
      const s = chart.addSeries(LW.CandlestickSeries, { upColor: "#16A34A", downColor: "#DC2626", wickUpColor: "#16A34A", wickDownColor: "#DC2626", borderVisible: false });
      s.setData(rows.map((b) => ({ time: time(b.t), open: b.open, high: b.high, low: b.low, close: b.close })));
    } else {
      const s = chart.addSeries(LW.AreaSeries, { lineColor: "#2563EB", topColor: "rgba(37,99,235,0.28)", bottomColor: "rgba(37,99,235,0)", lineWidth: 2 });
      s.setData(rows.map((b) => ({ time: time(b.t), value: b.close })));
    }
    if (rows.some((b) => b.volume)) {
      const v = chart.addSeries(LW.HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "vol" });
      v.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      v.setData(rows.map((b) => ({ time: time(b.t), value: b.volume || 0, color: b.close >= b.open ? "rgba(22,163,74,0.35)" : "rgba(220,38,38,0.35)" })));
    }
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [bars, dark, kind, range]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-1 pb-2">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} className={cn("h-7 px-2.5 rounded-md text-[12px] font-semibold transition-colors", range === r.id ? (dark ? "bg-white/10 text-white" : "bg-[#0C2233] text-white") : (dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"))}>{r.id}</button>
        ))}
        <span className={cn("mx-2 h-4 w-px", dark ? "bg-white/10" : "bg-slate-200")} />
        {(["candles", "line"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("h-7 px-2.5 rounded-md text-[12px] font-semibold", kind === k ? (dark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900") : (dark ? "text-slate-400" : "text-slate-500"))}>
            {k === "candles" ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-label="Candles"><path d="M3 1v12M11 1v12" stroke="currentColor" /><rect x="1.5" y="4" width="3" height="5" fill="currentColor" /><rect x="9.5" y="3" width="3" height="7" fill="none" stroke="currentColor" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-label="Line"><path d="M1 11 L5 6 L8 8 L13 2" stroke="currentColor" fill="none" strokeWidth="1.6" /></svg>
            )}
          </button>
        ))}
      </div>
      <div className="relative flex-1 min-h-0">
        {bars === "error" ? (
          <div className="absolute inset-0 flex flex-col">
            <p className={cn("text-[12px] px-1 pb-1", dark ? "text-slate-400" : "text-slate-500")}>{labels.fallback}</p>
            <div className="flex-1 rounded-lg overflow-hidden"><AdvancedTradingViewChart key={symbol + String(dark)} symbol={symbol.replace("-USD", "USD")} theme={dark ? "dark" : "light"} /></div>
          </div>
        ) : (
          <>
            <div ref={box} className="absolute inset-0" />
            {bars === null && <div className={cn("absolute inset-0 flex items-center justify-center text-[13px]", dark ? "text-slate-400" : "text-slate-500")}>{labels.loading}</div>}
          </>
        )}
      </div>
    </div>
  );
}
