import React, { useState } from "react";
import { 
 Building2, Activity, ShieldCheck, Server, Smartphone, CheckCircle2,
 Lock, Search, ArrowRight, Plus, Star, Info, DollarSign, Globe,
 Wallet, Coins, LineChart, ChevronRight, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { PLATFORMS } from "./platformsData";
import { EtfScreener } from "./EtfScreener";
import { cn } from "../../lib/utils";

export function Platforms({ onNavigate }: { onNavigate?: (page: string) => void }) {
 const { language } = useTranslation();
 const [activeTab, setActiveTab] = useState<'platforms' | 'screener'>('platforms');
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const displayedPlatforms = activeTab === 'platforms' ? PLATFORMS.filter(p => p.type !== 'screener') : [];
 
 // Set first item as selected by default when switching tabs
 React.useEffect(() => {
 if (activeTab === 'platforms' && displayedPlatforms.length > 0 && !selectedId) {
 setSelectedId(displayedPlatforms[0].id);
 }
 }, [activeTab, displayedPlatforms, selectedId]);

 const selectedPlatform = PLATFORMS.find(p => p.id === selectedId) || displayedPlatforms[0];

 return (
 <div className="w-full mx-auto px-4 md:px-8 py-8 lg:py-12 relative min-h-[calc(100vh-80px)] font-sans">
 {/* Background Decor */}
 <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-pv-blue/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
 <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

 {/* Tabs */}
 <div className="flex justify-center mb-10 relative z-10 w-full animate-fade-in">
 <div className="bg-surface-2 p-1.5 rounded-[2rem] flex border border-border/60 overflow-x-auto overflow-y-hidden max-w-full shadow-sm hide-scrollbar">
 <button 
 onClick={() => { setActiveTab('platforms'); setSelectedId(null); }}
 className={cn("px-6 md:px-10 py-3.5 text-xs md:text-sm font-bold transition-all flex items-center gap-2.5 rounded-[1.5rem] whitespace-nowrap", activeTab === 'platforms' ? 'bg-white text-pv-blue shadow-md shadow-pv-blue/5 border border-pv-blue/10 scale-100' : 'text-text hover:text-text hover:bg-surface')}
 >
 <Building2 size={18} /> {'Platforms & Banks'}
 </button>
 <button 
 onClick={() => setActiveTab('screener')}
 className={cn("px-6 md:px-10 py-3.5 text-xs md:text-sm font-bold transition-all flex items-center gap-2.5 rounded-[1.5rem] whitespace-nowrap", activeTab === 'screener' ? 'bg-white text-pv-blue shadow-md shadow-pv-blue/5 border border-pv-blue/10 scale-100' : 'text-text hover:text-text hover:bg-surface')}
 >
 <LineChart size={18} /> {'Market Screener'}
 </button>
 </div>
 </div>
 {/* Master/Detail View (Only if not purely screener without platforms) */}
 {!(activeTab === 'screener') && (
 <div className="flex flex-col lg:flex-row gap-8 relative z-10 items-start w-full animate-fade-in h-[calc(100vh-220px)] min-h-[700px] mb-10">
 
 {/* Left Master List */}
 <div className="w-full lg:w-[400px] shrink-0 h-full overflow-y-auto pr-2 pb-10 hide-scrollbar flex flex-col gap-3">
 {displayedPlatforms.map(platform => {
 const isSelected = selectedId === platform.id;
 return (
 <motion.div 
 key={platform.id}
 onClick={() => setSelectedId(platform.id)}
 className={cn(
 "relative p-5 rounded-[2rem] cursor-pointer transition-all duration-300 border backdrop-blur-sm group origin-left",
 isSelected 
 ? "bg-white border-pv-blue/30 shadow-[0_8px_30px_rgba(37,99,235,0.06)] scale-[1.02] z-10" 
 : "bg-surface-2/80 border-border/50 hover:bg-surface hover:border-border hover:shadow-sm"
 )}
 >
 {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-pv-blue rounded-r-full" />}
 <div className="flex items-center gap-4">
 <div className="flex-1 min-w-0">
 <h3 className={cn("text-base font-semibold truncate transition-colors", isSelected ? "text-pv-blue" : "text-text")}>{platform.name}</h3>
 <div className="flex items-center gap-3 mt-1.5 opacity-80">
 <span className="text-sm font-bold text-text truncate">{platform.type === 'crypto' ? 'Crypto' : platform.type === 'bank' ? 'Banque' : platform.type === 'neobank' ? 'NeoBanque' : 'Courtier'}</span>
 <span className="text-sm font-bold text-pv-blue truncate">{platform.fees}</span>
 </div>
 </div>
 </div>
 </motion.div>
 )})}
 </div>

 {/* Right Detail Pane */}
 <div className="flex-1 h-full w-full hidden lg:block overflow-hidden relative rounded-3xl bg-white border border-border/80 shadow-[0_10px_40px_rgba(0,0,0,0.03)] selection:bg-pv-blue/10 selection:text-pv-blue">
 <AnimatePresence mode="wait">
 {selectedPlatform && (
 <motion.div 
 key={selectedPlatform.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
 className="absolute inset-0 overflow-y-auto hide-scrollbar"
 >
 {/* Header Section */}
 <div className="p-10 border-b border-border/40 relative overflow-hidden bg-gradient-to-br from-surface to-surface-2/50">
 <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
 <h2 className="text-4xl md:text-5xl font-semibold text-text tracking-tight">{selectedPlatform.name}</h2>
 </div>
 <p className="text-lg text-text font-medium mb-6 leading-relaxed max-w-2xl">
 {selectedPlatform.bestFor}
 </p>
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-2 border border-border text-text rounded-[1.5rem] text-sm font-bold tracking-wide">
 <DollarSign size={16} className="text-emerald-500"/> {selectedPlatform.fees}
 </div>
 </div>
 </div>
 </div>
 </div>
 
 {/* Content Section */}
 <div className="p-10 space-y-12">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {/* Pros */}
 <div>
 <h4 className="text-xs font-semibold text-text mb-6 flex items-center gap-2">
 <div className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={14} strokeWidth={3}/></div>
 {'Main Advantages'}
 </h4>
 <ul className="space-y-4">
 {selectedPlatform.pros.map((pro: string, idx: number) => (
 <li key={idx} className="flex items-start gap-3.5 text-text font-medium text-[15px] leading-relaxed">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
 {pro}
 </li>
 ))}
 </ul>
 </div>
 
 {/* Cons */}
 <div>
 <h4 className="text-xs font-semibold text-text mb-6 flex items-center gap-2">
 <div className="w-6 h-6 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><Info size={14} strokeWidth={3}/></div>
 {"Fees & Attention"}
 </h4>
 <ul className="space-y-4">
 {selectedPlatform.cons.map((con: string, idx: number) => (
 <li key={idx} className="flex items-start gap-3.5 text-text font-medium text-[15px] leading-relaxed">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
 {con}
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Interactive Brokers Highlight */}
 {selectedPlatform.id === 'interactive_brokers' && (
 <div className="p-8 rounded-[2rem] bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 relative overflow-hidden shadow-sm">
 <h4 className="text-sm font-semibold text-red-600 mb-6 flex items-center gap-3">
 <Globe size={20} className="text-red-500"/>
 {'Fee Details'}
 </h4>
 <p className="text-text leading-relaxed font-medium mb-4 max-w-3xl text-[15px]">
 {'Tiered or Fixed pricing. Very low general fees on US exchanges ($0.005 per share) and European exchanges (0.05% of trade value).'}
 </p>
 </div>
 )}

 {/* Trade Republic Highlight */}
 {selectedPlatform.id === 'trade_republic' && (
 <div className="p-8 rounded-[2rem] bg-gradient-to-r from-zinc-800 to-black text-white relative overflow-hidden shadow-2xl">
 <h4 className="text-sm font-semibold text-zinc-300 mb-6 flex items-center gap-3">
 <Wallet size={20} className="text-zinc-400"/>
 {'Simplified Fees'}
 </h4>
 <p className="text-zinc-300 leading-relaxed font-medium mb-4 max-w-3xl text-[15px]">
 {'1€ flat fee per external transaction. ETF automated savings plans are completely free (0€).'}
 </p>
 </div>
 )}

 {/* Scalable Capital Highlight */}
 {selectedPlatform.id === 'scalable_capital' && (
 <div className="p-8 rounded-[2rem] bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 relative overflow-hidden shadow-sm">
 <h4 className="text-sm font-semibold text-teal-600 mb-6 flex items-center gap-3">
 <Server size={20} className="text-teal-500"/>
 {'Flat-Rate Details'}
 </h4>
 <p className="text-text leading-relaxed font-medium mb-4 max-w-3xl text-[15px]">
 {'Prime membership (2.99€/month) for zero-commission trading (spread applies). Without Prime, trades are fixed at 0.99€.'}
 </p>
 </div>
 )}

 {/* Empty Space for scrolling */}
 <div className="h-10"></div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 )}

 {/* Screeners UI (Only on Screener Tab) */}
 {activeTab === 'screener' && (
 <div className="relative z-10 w-full animate-fade-in flex flex-col h-[800px] min-h-[800px] mt-4 border border-border/60 rounded-3xl overflow-hidden shadow-2xl">
 <EtfScreener />
 </div>
 )}
 </div>
 );
}
