import React, { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export interface MultiSeriesData {
 symbol: string;
 color: string;
 data: { date: string, close: number }[];
}

interface TradingViewChartProps {
 data?: any[];
 multiData?: MultiSeriesData[];
 period: string;
 type?: 'candlestick' | 'relative';
 theme?: 'dark' | 'light';
 onCrosshairMove?: (time: number | null) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, multiData, period, type = 'candlestick', theme = 'dark', onCrosshairMove }) => {
 const chartContainerRef = useRef<HTMLDivElement>(null);
 const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
 const seriesRefs = useRef<LightweightCharts.ISeriesApi<any>[]>([]);
 const crosshairCallbackRef = useRef(onCrosshairMove);

 useEffect(() => {
 crosshairCallbackRef.current = onCrosshairMove;
 }, [onCrosshairMove]);

 useEffect(() => {
 if (!chartContainerRef.current) return;

 const handleResize = () => {
 chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
 };

 const isLight = theme === 'light';

 const chart = LightweightCharts.createChart(chartContainerRef.current, {
 layout: {
 background: { type: LightweightCharts.ColorType.Solid, color: isLight ? '#ffffff' : '#131722' },
 textColor: isLight ? '#1e293b' : '#d1d4dc',
 fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
 },
 grid: {
 vertLines: { color: isLight ? '#f1f5f9' : 'rgba(42, 46, 57, 0.5)', style: LightweightCharts.LineStyle.Solid },
 horzLines: { color: isLight ? '#f1f5f9' : 'rgba(42, 46, 57, 0.5)', style: LightweightCharts.LineStyle.Solid },
 },
 rightPriceScale: {
 borderVisible: true,
 borderColor: isLight ? '#e2e8f0' : '#2b3139',
 scaleMargins: {
 top: 0.1,
 bottom: 0.25, // Leave room for volume bars
 },
 },
 timeScale: {
 borderVisible: true,
 borderColor: isLight ? '#e2e8f0' : '#2b3139',
 timeVisible: period === '1d' || period === '5d',
 secondsVisible: false,
 tickMarkFormatter: (time: any, tickMarkType: any, locale: any) => {
 const date = new Date(time * 1000);
 if (period === '1d') return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
 if (period === '5y' || period === 'max' || period === '3y') return date.toLocaleDateString(locale, { year: 'numeric' });
 return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
 },
 },
 crosshair: {
 mode: LightweightCharts.CrosshairMode.Normal,
 vertLine: {
 width: 1,
 color: isLight ? '#94a3b8' : '#758696',
 style: LightweightCharts.LineStyle.Dashed,
 labelBackgroundColor: isLight ? '#475569' : '#2B3139',
 },
 horzLine: {
 width: 1,
 color: isLight ? '#94a3b8' : '#758696',
 style: LightweightCharts.LineStyle.Dashed,
 labelBackgroundColor: isLight ? '#475569' : '#2B3139',
 },
 },
 localization: type === 'relative' ? {
 priceFormatter: (price: number) => price.toFixed(2) + '%',
 } : undefined,
 width: chartContainerRef.current.clientWidth,
 height: chartContainerRef.current.clientHeight || 450,
 });
 
 chartRef.current = chart;

 chart.subscribeCrosshairMove((param) => {
 if (param.time) {
 if (crosshairCallbackRef.current) crosshairCallbackRef.current(param.time as number);
 } else {
 if (crosshairCallbackRef.current) crosshairCallbackRef.current(null);
 }
 });

 window.addEventListener('resize', handleResize);

 return () => {
 window.removeEventListener('resize', handleResize);
 chart.remove();
 seriesRefs.current = [];
 };
 }, [period, theme]);

 useEffect(() => {
 if (!chartRef.current) return;

 // Remove existing series
 seriesRefs.current.forEach(series => chartRef.current?.removeSeries(series));
 seriesRefs.current = [];

 const isLight = theme === 'light';

 if (type === 'candlestick' && data && data.length > 0) {
 // Main candlestick series
 const series = chartRef.current.addSeries(LightweightCharts.CandlestickSeries, {
 upColor: '#10b981',
 downColor: '#ef4444',
 borderVisible: false,
 wickUpColor: '#10b981',
 wickDownColor: '#ef4444',
 });
 seriesRefs.current.push(series);

 const formattedData = data.map(item => {
 const ts = Math.floor(new Date(item.date).getTime() / 1000);
 return {
 time: ts as LightweightCharts.Time, 
 open: item.open ?? item.price ?? item.close,
 high: item.high ?? item.price ?? item.close,
 low: item.low ?? item.price ?? item.close,
 close: item.close ?? item.price,
 };
 }).filter(d => d.close != null && !Number.isNaN(d.close))
 .sort((a, b) => (a.time as number) - (b.time as number))
 .filter((v, i, a) => a.findIndex(t => t.time === v.time) === i);

 try {
 series.setData(formattedData as any);
 } catch (err) {
 console.error("Error setting chart data", err);
 }

 // Add volume bars at the bottom of the candlestick chart for completeness
 const hasVolume = data.some(item => item.volume != null && item.volume > 0);
 if (hasVolume) {
 const volumeSeries = chartRef.current.addSeries(LightweightCharts.HistogramSeries, {
 color: isLight ? '#94a3b8' : '#475569',
 priceFormat: {
 type: 'volume',
 },
 priceScaleId: '', // Show overlay
 });
 
 volumeSeries.priceScale().applyOptions({
 scaleMargins: {
 top: 0.8, // Make bars a bit smaller, less noisy
 bottom: 0,
 },
 });
 
 seriesRefs.current.push(volumeSeries);

 const volumeData = data.map(item => {
 const ts = Math.floor(new Date(item.date).getTime() / 1000);
 const isUp = (item.close ?? item.price) >= (item.open ?? item.price ?? item.close);
 return {
 time: ts as LightweightCharts.Time,
 value: item.volume ?? 0,
 color: isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
 };
 }).filter(d => d.value != null && !Number.isNaN(d.value))
 .sort((a, b) => (a.time as number) - (b.time as number))
 .filter((v, i, a) => a.findIndex(t => t.time === v.time) === i);

 try {
 volumeSeries.setData(volumeData as any);
 } catch (err) {
 console.error("Error setting volume series data", err);
 }
 }

 } else if (type === 'relative' && multiData && multiData.length > 0) {
 multiData.forEach((seriesData) => {
 const series = chartRef.current!.addSeries(LightweightCharts.AreaSeries, {
 lineColor: seriesData.color,
 topColor: seriesData.color + '66',
 bottomColor: seriesData.color + '00',
 lineWidth: 2,
 crosshairMarkerVisible: true,
 crosshairMarkerRadius: 4,
 crosshairMarkerBorderColor: '#fff',
 crosshairMarkerBackgroundColor: seriesData.color,
 });
 seriesRefs.current.push(series);

 // Sort data chronologically
 const sortedData = [...seriesData.data]
 .filter(d => d.close != null && !Number.isNaN(d.close))
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

 if (sortedData.length > 0) {
 const firstClose = sortedData[0].close;
 
 const formattedData = sortedData.map(item => {
 const ts = Math.floor(new Date(item.date).getTime() / 1000);
 return {
 time: ts as LightweightCharts.Time,
 value: ((item.close - firstClose) / firstClose) * 100
 };
 }).filter((v, i, a) => a.findIndex(t => t.time === v.time) === i);

 try {
 series.setData(formattedData as any);
 } catch (err) {
 console.error("Error setting multi-line chart data", err);
 }
 }
 });
 }

 try {
 chartRef.current.timeScale().fitContent();
 } catch(e) {}
 }, [data, multiData, type, theme]);

 return <div ref={chartContainerRef} className="w-full h-full min-h-[inherit]" />;
};
