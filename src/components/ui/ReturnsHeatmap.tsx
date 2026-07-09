import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface ReturnsHeatmapProps {
 monthlyReturns: { date: string, value: number }[]; // value is percentage
}

export function ReturnsHeatmap({ monthlyReturns }: ReturnsHeatmapProps) {
 const { t } = useTranslation();

 const { years, heatmapData } = useMemo(() => {
 const data: Record<number, number[]> = {};
 const yrSet = new Set<number>();
 
 monthlyReturns.forEach(mr => {
 const d = new Date(mr.date);
 const year = d.getFullYear();
 const month = d.getMonth(); // 0-11
 if (!data[year]) {
 data[year] = Array(12).fill(null);
 }
 data[year][month] = mr.value;
 yrSet.add(year);
 });

 const years = Array.from(yrSet).sort((a,b)=>b-a);
 return { years, heatmapData: data };
 }, [monthlyReturns]);

 const getColor = (value: number | null) => {
 if (value === null) return 'bg-transparent';
 if (value === 0) return 'bg-bg-2 text-text';
 
 // Smooth gradient based on value
 // Max green = 10%+, max red = -10%-
 if (value > 0) {
 const alpha = Math.min(value / 10, 1) * 0.8;
 // Using a solid green hex with alpha
 return `rgba(16, 185, 129, ${alpha + 0.2})`; // emerald-500
 } else {
 const alpha = Math.min(Math.abs(value) / 10, 1) * 0.8;
 return `rgba(239, 68, 68, ${alpha + 0.2})`; // red-500
 }
 };

 const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

 return (
 <div className="w-full overflow-x-auto">
 <table className="w-full text-xs text-center border-collapse">
 <thead>
 <tr>
 <th className="p-2 border-b border-border text-left">Year</th>
 {months.map(m => <th key={m} className="p-2 border-b border-border">{m}</th>)}
 <th className="p-2 border-b border-border font-bold">YTD</th>
 </tr>
 </thead>
 <tbody>
 {years.map(year => {
 const row = heatmapData[year];
 
 // Calculate YTD
 let ytd = 1;
 let hasData = false;
 row.forEach(val => {
 if (val !== null) {
 ytd *= (1 + (val/100));
 hasData = true;
 }
 });
 const ytdPercent = hasData ? (ytd - 1) * 100 : null;

 return (
 <tr key={year}>
 <td className="p-2 border-b border-border text-left font-medium">{year}</td>
 {row.map((val, idx) => (
 <td 
 key={idx} 
 className="p-2 border-b border-border font-mono transition-colors"
 style={{ backgroundColor: getColor(val) }}
 >
 {val !== null ? <span className={(val && Math.abs(val) > 4) ? "text-white" : "text-text"}>{val > 0 ? '+' : ''}{val.toFixed(1)}%</span> : '-'}
 </td>
 ))}
 <td 
 className="p-2 border-b border-border font-mono font-bold"
 style={{ backgroundColor: getColor(ytdPercent) }}
 >
 {ytdPercent !== null ? <span className={(ytdPercent && Math.abs(ytdPercent) > 10) ? "text-white" : "text-text"}>{ytdPercent > 0 ? '+' : ''}{ytdPercent.toFixed(1)}%</span> : '-'}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 );
}
