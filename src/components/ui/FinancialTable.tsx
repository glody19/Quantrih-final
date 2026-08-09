import React from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';


export function FinancialTable({ title, data, fields }: { title: string, data: any[], fields: {key: string, label: string}[] }) {
 const isIncome = title.toLowerCase().includes('income');
 const isBalance = title.toLowerCase().includes('balance');
 const isCashFlow = title.toLowerCase().includes('cash flow');
 
 const chartData = (data || []).slice().reverse().map(d => ({
 ...d,
 Year: d.calendarYear
 }));

 const formatValue = (key: string, val: any) => {
 if (key === 'calendarYear') return val;
 if (typeof val === 'number') {
 if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + 'B';
 if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + 'M';
 if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(2) + 'K';
 const parts = val.toFixed(2).split('.');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 return parts.join('.');
 }
 return val || '-';
 };

 const handleExport = () => {
 if (!data || data.length === 0) return;
 const headers = fields.map(f => f.label).join(',');
 const rows = (data || []).map(row => 
 fields.map(f => {
 const val = row[f.key];
 return typeof val === 'number' ? val : `"${val || ''}"`;
 }).join(',')
 );
 const csvContent = [headers, ...rows].join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 const url = URL.createObjectURL(blob);
 link.setAttribute('href', url);
 link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="bg-surface border border-border rounded-[1.5rem] p-6 overflow-x-auto relative">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-lg font-bold text-text">{title}</h3>
 <button 
 onClick={handleExport}
 className="flex items-center gap-2 text-xs font-semibold text-text hover:text-pv-blue transition-colors px-3 py-1.5 rounded-2xl border border-border/50 hover:border-pv-blue/30 hover:bg-pv-blue-bg/30"
 >
 <Download size={14} />
 Export CSV
 </button>

 </div>
 
 <table className="w-full text-left border-collapse">

 <thead>
 <tr>
 {fields.map(f => (
 <th key={f.key} className="py-2 px-3 bg-surface-2 text-text font-semibold text-xs whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
 {f.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {(data || []).map((row, i) => (
 <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors">
 {fields.map(f => (
 <td key={f.key} className="py-2 px-3 text-xs font-mono text-text whitespace-nowrap">
 {formatValue(f.key, row[f.key])}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}