import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronDown, Activity, Globe, Zap, SlidersHorizontal } from 'lucide-react';
import { europeanETFs, EuropeETF } from './europeanETFsData';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../../contexts/LanguageContext';

export function EtfScreener() {
 const { language } = useTranslation();
 const [search, setSearch] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('All');
 const [selectedDist, setSelectedDist] = useState<string>('All');
 const [minAum, setMinAum] = useState<string>('');
 const [maxFee, setMaxFee] = useState<string>('');
 const [minYtd, setMinYtd] = useState<string>('');
 const [showFilters, setShowFilters] = useState(true);
 
 const [sortField, setSortField] = useState<keyof EuropeETF>('sizeM');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

 const categories = useMemo(() => {
 const cats = new Set(europeanETFs.map(e => e.category));
 return ['All', ...Array.from(cats)].sort();
 }, []);

 const dists = useMemo(() => {
 const d = new Set(europeanETFs.map(e => e.distribution).filter(Boolean));
 return ['All', ...Array.from(d)].sort();
 }, []);

 const handleSort = (field: keyof EuropeETF) => {
 if (sortField === field) {
 setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('desc');
 }
 };

 const parseNum = (val: string) => parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;

 const filteredETFs = useMemo(() => {
 return europeanETFs.filter(etf => {
 const matchSearch = etf.name.toLowerCase().includes(search.toLowerCase()) || 
 etf.ticker.toLowerCase().includes(search.toLowerCase()) ||
 etf.isin.toLowerCase().includes(search.toLowerCase());
 const matchCat = selectedCategory === 'All' || etf.category === selectedCategory;
 const matchDist = selectedDist === 'All' || etf.distribution === selectedDist;
 
 const aum = parseNum(etf.sizeM);
 const matchMinAum = minAum === '' || aum >= parseFloat(minAum);
 
 const fee = parseNum(etf.fee);
 const matchMaxFee = maxFee === '' || fee <= parseFloat(maxFee);
 
 const ytd = parseNum(etf.ytdReturn);
 const matchMinYtd = minYtd === '' || ytd >= parseFloat(minYtd);

 return matchSearch && matchCat && matchDist && matchMinAum && matchMaxFee && matchMinYtd;
 }).sort((a, b) => {
 let aVal = a[sortField];
 let bVal = b[sortField];

 // numeric sorts
 if (sortField === 'sizeM' || sortField === 'fee' || sortField === 'ytdReturn') {
 const aNum = parseNum(aVal);
 const bNum = parseNum(bVal);
 return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
 }

 if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
 if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
 return 0;
 });
 }, [search, selectedCategory, selectedDist, sortField, sortDirection, minAum, maxFee, minYtd]);

 return (
 <div className="w-full h-full flex flex-col bg-surface-2 text-text">
 
 <div className="flex-1 overflow-hidden flex flex-col w-full mx-auto p-2 md:p-6 lg:p-8">
 <div className="mb-6 flex flex-col gap-4">
 <div className="flex flex-col lg:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text" />
 <input 
 type="text"
 placeholder={"Search by name, ticker, or ISIN..."}
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-[1.5rem] text-sm font-medium focus:ring-2 focus:ring-pv-blue/20 outline-none transition-all placeholder:text-text text-text shadow-sm"
 />
 </div>
 <button 
 onClick={() => setShowFilters(!showFilters)}
 className={cn("px-6 py-3 rounded-[1.5rem] border font-bold text-sm flex items-center gap-2 transition-all shadow-sm shrink-0", showFilters ? "bg-pv-blue border-pv-blue text-white" : "bg-white border-border text-text hover:bg-surface-2")}
 >
 <SlidersHorizontal className="w-4 h-4" />
 Filtres
 </button>
 </div>

 <AnimatePresence>
 {showFilters && (
 <motion.div 
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-5 bg-white border border-border rounded-[2rem] shadow-sm">
 
 <div className="space-y-1">
 <label className="text-xs font-bold text-text pl-1 font-mono">{'Category / Sector'}</label>
 <div className="relative">
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="appearance-none w-full pl-4 pr-10 py-2 bg-surface-2 border border-border rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-pv-blue outline-none text-text transition-all truncate"
 >
 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text pointer-events-none" />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-text pl-1 font-mono">{'Distribution Policy'}</label>
 <div className="relative">
 <select
 value={selectedDist}
 onChange={(e) => setSelectedDist(e.target.value)}
 className="appearance-none w-full pl-4 pr-10 py-2 bg-surface-2 border border-border rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-pv-blue outline-none text-text transition-all"
 >
 {dists.map(d => <option key={d} value={d}>{d}</option>)}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text pointer-events-none" />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-text pl-1 font-mono">{'Min AUM (M€)'}</label>
 <input 
 type="number"
 placeholder="e.g. 500"
 value={minAum}
 onChange={(e) => setMinAum(e.target.value)}
 className="w-full px-4 py-2 bg-surface-2 border border-border rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-pv-blue outline-none text-text transition-all placeholder:text-text"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-text pl-1 font-mono">{'Max TER Fee (%)'}</label>
 <input 
 type="number"
 placeholder="e.g. 0.20"
 step="0.01"
 value={maxFee}
 onChange={(e) => setMaxFee(e.target.value)}
 className="w-full px-4 py-2 bg-surface-2 border border-border rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-pv-blue outline-none text-text transition-all placeholder:text-text"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-text pl-1 font-mono">{'Min YTD Return (%)'}</label>
 <input 
 type="number"
 placeholder="e.g. 5.1"
 step="0.1"
 value={minYtd}
 onChange={(e) => setMinYtd(e.target.value)}
 className="w-full px-4 py-2 bg-surface-2 border border-border rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-pv-blue outline-none text-text transition-all placeholder:text-text"
 />
 </div>

 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <div className="flex-1 bg-white rounded-[2rem] border border-border/80 overflow-hidden flex flex-col shadow-sm relative">
 <div className="overflow-x-auto h-full hide-scrollbar">
 <table className="w-full text-left border-none relative">
 <thead className="bg-surface-2 border-b border-border text-sm font-semibold text-text sticky top-0 z-10 shadow-sm">
 <tr>
 <th 
 className="py-4 px-6 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors"
 onClick={() => handleSort('name')}
 >
 <div className="flex items-center gap-2">{'Fund Identity'} {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors hidden sm:table-cell" onClick={() => handleSort('category')}>
 <div className="flex items-center gap-2">{'Category'} {sortField === 'category' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('isin')}>
 <div className="flex items-center gap-2">ISIN {sortField === 'isin' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('sizeM')}>
 <div className="flex items-center justify-end gap-2">AUM (M€) {sortField === 'sizeM' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('fee')}>
 <div className="flex items-center justify-end gap-2">TER {sortField === 'fee' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('ytdReturn')}>
 <div className="flex items-center justify-end gap-2">{'YTD Return'} {sortField === 'ytdReturn' && <ArrowUpDown className="w-3 h-3 text-text" />}</div>
 </th>
 <th className="py-4 px-6 text-right whitespace-nowrap hidden lg:table-cell">{'Distribution'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-[13px]">
 {filteredETFs.map((etf, idx) => {
 const ytdValue = parseNum(etf.ytdReturn);
 const isPositive = ytdValue >= 0;
 
 return (
 <tr key={idx} className="hover:bg-surface-2 transition-colors">
 <td className="py-3 px-6 font-bold text-text bg-white/50" title={etf.name}>
 <div className="flex flex-col">
 <span className="truncate max-w-[250px] md:max-w-[400px]">{etf.name}</span>
 {etf.ticker && <span className="text-xs text-text font-bold mt-0.5 ">{etf.ticker.toUpperCase()}</span>}
 </div>
 </td>
 <td className="py-3 px-4 font-medium text-text hidden sm:table-cell">{etf.category}</td>
 <td className="py-3 px-4 font-mono text-text text-xs ">{etf.isin}</td>
 <td className="py-3 px-4 text-right font-medium text-text">{etf.sizeM ? `€${etf.sizeM}` : '-'}</td>
 <td className="py-3 px-4 text-right font-medium text-text">{etf.fee}</td>
 <td className={cn(
 "py-3 px-4 text-right font-bold whitespace-nowrap", 
 !isNaN(ytdValue) ? (isPositive ? "text-emerald-600" : "text-rose-600") : "text-text"
 )}>
 {isPositive && ytdValue > 0 ? '+' : ''}{etf.ytdReturn || '-'}
 </td>
 <td className="py-3 px-6 text-right font-medium text-text hidden lg:table-cell">{etf.distribution}</td>
 </tr>
 )})}
 
 {filteredETFs.length === 0 && (
 <tr>
 <td colSpan={7} className="py-16 text-center text-text font-medium">
 <div className="flex flex-col items-center justify-center space-y-2">
 <Zap className="w-8 h-8 text-text" />
 <p>{"No ETFs found matching your criteria."}</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 );
}
