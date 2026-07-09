import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface RollingReturnsTableProps {
 results: any[];
}

export function RollingReturnsTable({ results }: RollingReturnsTableProps) {
 const { t } = useTranslation();
 
 const periods = [
 { key: 'rolling1Y', label: '1 Year' },
 { key: 'rolling3Y', label: '3 Years' },
 { key: 'rolling5Y', label: '5 Years' },
 { key: 'rolling10Y', label: '10 Years' },
 ];

 return (
 <div className="bg-surface border border-border rounded-[2rem] overflow-hidden shadow-sm text-left">
 <div className="px-8 py-6 border-b border-border bg-surface-2">
 <h3 className="text-sm font-semibold text-text">Rolling Returns Analysis</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full border-collapse">
 <thead>
 <tr className="text-xs font-semibold text-text border-b border-border text-left">
 <th className="px-8 py-5">Period</th>
 <th className="px-8 py-5">Metric</th>
 {results.map((r, i) => (
 <th key={i} className="px-8 py-5 text-right">{r.name}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {periods.map((period) => (
 <React.Fragment key={period.key}>
 <tr className="bg-surface">
 <td rowSpan={3} className="px-8 py-4 text-sm font-bold text-text tracking-tight align-top border-r border-border/50 w-32">{period.label}</td>
 <td className="px-8 py-3 text-xs font-semibold text-text ">Average</td>
 {results.map((r, i) => {
 const stats = r.metrics[period.key];
 return (
 <td key={i} className="px-8 py-3 text-right text-sm font-bold text-text italic">
 {stats ? `${(stats.average * 100).toFixed(2)}%` : '—'}
 </td>
 );
 })}
 </tr>
 <tr className="bg-surface">
 <td className="px-8 py-3 text-xs font-semibold text-text ">Best</td>
 {results.map((r, i) => {
 const stats = r.metrics[period.key];
 return (
 <td key={i} className="px-8 py-3 text-right text-sm font-medium text-green italic">
 {stats ? `${(stats.best * 100).toFixed(2)}%` : '—'}
 </td>
 );
 })}
 </tr>
 <tr className="bg-surface">
 <td className="px-8 py-3 text-xs font-semibold text-text border-b-0">Worst</td>
 {results.map((r, i) => {
 const stats = r.metrics[period.key];
 return (
 <td key={i} className="px-8 py-3 text-right text-sm font-medium text-red italic">
 {stats ? `${(stats.worst * 100).toFixed(2)}%` : '—'}
 </td>
 );
 })}
 </tr>
 </React.Fragment>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
