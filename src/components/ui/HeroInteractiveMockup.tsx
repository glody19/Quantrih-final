import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, BarChart3, PieChart, BookOpen, LineChart, Play, Globe2, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuantrihLogo } from './Logo';

type SceneName = 'backtest' | 'factor' | 'library';
type PhaseName = 'config' | 'run' | 'view';

interface MockupState {
 scene: SceneName;
 phase: PhaseName;
 mouse: { x: number; y: number };
 clickScale: number;
}

export const HeroInteractiveMockup = () => {
 const [state, setState] = useState<MockupState>({
 scene: 'backtest',
 phase: 'config',
 mouse: { x: 400, y: 300 },
 clickScale: 1
 });

 useEffect(() => {
 let unmounted = false;
 
 const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
 const setMouse = (x: number, y: number) => {
 if (!unmounted) setState(s => ({ ...s, mouse: { x, y } }));
 };
 const click = async () => {
 if (unmounted) return;
 setState(s => ({ ...s, clickScale: 0.8 }));
 await sleep(150);
 if (!unmounted) setState(s => ({ ...s, clickScale: 1 }));
 };

 const runSequence = async () => {
 // ===== BACKTEST SCENE =====
 if (unmounted) return;
 setState(s => ({ ...s, scene: 'backtest', phase: 'config' }));
 
 // Move to parameters
 setMouse(350, 180);
 await sleep(1000);
 await click();
 
 // Move to portfolios
 setMouse(500, 320);
 await sleep(1200);
 await click();

 // Move to Analyze button
 setMouse(250, 480);
 await sleep(1000);
 await click();

 if (unmounted) return;
 setState(s => ({ ...s, phase: 'run' }));
 
 // Hover over charts
 setMouse(600, 250);
 await sleep(2000);
 setMouse(800, 150);
 await sleep(2500);

 // ===== FACTOR SCENE =====
 if (unmounted) return;
 // Move to sidebar - Factor Analysis
 setMouse(100, 220); 
 await sleep(1200);
 await click();
 
 if (unmounted) return;
 setState(s => ({ ...s, scene: 'factor', phase: 'config' }));
 
 // Move to factor model select
 setMouse(400, 250);
 await sleep(1000);
 await click();

 // Run Regression
 setMouse(250, 420);
 await sleep(1000);
 await click();

 if (unmounted) return;
 setState(s => ({ ...s, phase: 'run' }));
 
 // Move over bars
 setMouse(650, 280);
 await sleep(3500);

 // ===== LIBRARY SCENE =====
 if (unmounted) return;
 // Move to sidebar - Library
 setMouse(100, 360);
 await sleep(1000);
 await click();

 if (unmounted) return;
 setState(s => ({ ...s, scene: 'library', phase: 'view' }));
 
 // Browse videos
 setMouse(450, 300);
 await sleep(2000);
 setMouse(700, 400);
 await sleep(2000);

 // Loop back
 if (!unmounted) runSequence();
 };

 runSequence();
 return () => { unmounted = true; };
 }, []);

 return (
 <div className="w-full max-w-6xl mx-auto my-32 px-4">
 <div className="text-center mb-16">
 <motion.h2 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tighter"
 >
 Institutional Grade Architecture
 </motion.h2>
 <motion.p 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.1 }}
 className="text-text text-lg md:text-xl max-w-3xl mx-auto font-light"
 >
 Build, visualize, and benchmark your portfolios against decades of historical data. Parameterize custom models, run factor regressions, and explore endless quantitative combinations.
 </motion.p>
 </div>

 <motion.div 
 initial={{ opacity: 0, y: 40 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8, delay: 0.2 }}
 className="w-full flex justify-center"
 >
 <div className="w-full max-w-[1100px] relative">
 
 {/* PC Monitor Enclosure */}
 <div className="relative rounded-t-2xl rounded-b-lg border-x-[16px] border-t-[16px] border-b-[24px] border-slate-900 bg-slate-900 shadow-2xl aspect-[16/10] md:aspect-[16/9] overflow-hidden flex flex-col ring-1 ring-white/10 ring-inset">
 
 {/* Mac OS Header */}
 <div className="h-6 bg-slate-800 flex items-center px-4 gap-2 z-20 shrink-0 border-b border-slate-700/50">
 <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
 <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
 <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
 <div className="flex-1 text-center text-xs text-text font-mono pl-4 opacity-50">app.quantrih.com</div>
 <div className="w-12"></div>
 </div>

 {/* Browser Body */}
 <div className="flex-1 flex overflow-hidden bg-white text-text relative select-none">
 
 {/* Virtual Mouse Cursor */}
 <motion.div 
 animate={{ x: state.mouse.x, y: state.mouse.y, scale: state.clickScale }}
 transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
 className="absolute z-[100] pointer-events-none drop-shadow-xl left-0 top-0 origin-top-left"
 >
 <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg" className="text-text fill-white">
 <path d="M4 2L20 12L12 14L15 22L12 23L9 15L4 19Z" strokeWidth="1.5" stroke="currentColor" strokeLinejoin="round"/>
 </svg>
 </motion.div>

 {/* Sidebar Component */}
 <div className="w-56 bg-surface-2 border-r border-border p-4 hidden sm:flex flex-col gap-2 z-30 shrink-0">
 <div className="mb-6 mt-2 ml-1">
 <QuantrihLogo variant="sigma" size="sm" showText={false} className="text-blue-600" />
 </div>
 
 <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-default transition-colors", state.scene === 'backtest' ? "bg-blue-50 text-blue-700" : "text-text")}>
 <LineChart size={14} /> Portfolio Backtesting
 </div>
 <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-default transition-colors", state.scene === 'factor' ? "bg-blue-50 text-blue-700" : "text-text")}>
 <BarChart3 size={14} /> Factor Analysis
 </div>
 <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-default text-text">
 <Activity size={14} /> Fund Comparison
 </div>
 <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-default text-text">
 <Globe2 size={14} /> Market Dashboard
 </div>
 <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-default transition-colors", state.scene === 'library' ? "bg-blue-50 text-blue-700" : "text-text")}>
 <BookOpen size={14} /> Library & Education
 </div>
 </div>

 {/* Main Workspace */}
 <div className="flex-1 bg-white relative flex flex-col p-6 overflow-hidden">
 
 {/* ---------- SCENE: BACKTEST ---------- */}
 <AnimatePresence mode="wait">
 {state.scene === 'backtest' && (
 <motion.div key="backtest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-text">Portfolio Backtesting</h2>
 <div className="flex items-center gap-2 text-xs">
 <span className="px-2 py-1 bg-slate-100 rounded text-text">Jan 2000 - Dec 2023</span>
 </div>
 </div>

 {state.phase === 'config' && (
 <div className="flex-1 grid grid-cols-12 gap-6 relative">
 <div className="col-span-4 flex flex-col gap-4">
 <div className="text-xs font-bold text-text mb-2 border-b pb-1">Parameters</div>
 <div className="p-3 border rounded text-xs text-text bg-surface-2 flex justify-between"><span>Initial Amount</span><span className="font-mono font-bold">$10,000</span></div>
 <div className="p-3 border rounded text-xs text-text bg-surface-2 flex justify-between"><span>Cashflows</span><span className="font-mono">None</span></div>
 <div className="p-3 border rounded text-xs text-text bg-surface-2 flex justify-between"><span>Rebalancing</span><span className="font-mono">Annually</span></div>
 
 <div className="mt-auto">
 <button className="w-full bg-blue-600 text-white text-xs font-bold py-3 rounded shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
 <Play size={12} /> Analyze Portfolios
 </button>
 </div>
 </div>
 <div className="col-span-8 flex flex-col gap-4">
 <div className="text-xs font-bold text-text mb-2 border-b pb-1">Portfolios</div>
 
 {[
 { n: "Glody Capital Management", a: "60% VTI, 40% BND" },
 { n: "Way Capital", a: "30% VTI, 40% TLT, 15% IEI, 15% GLD" },
 { n: "Stan Brown Capital", a: "20% VTI, 20% SCZV, 20% LTT, 20% GLD, 20% CASH" }
 ].map((p, i) => (
 <div key={i} className="border rounded-2xl p-3 bg-white shadow-sm flex flex-col gap-2">
 <div className="text-xs font-extrabold text-text">{p.n}</div>
 <div className="text-xs text-text bg-slate-100 px-2 py-1 rounded inline-block self-start font-mono">{p.a}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {state.phase === 'run' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
 <div className="flex gap-4 mb-4">
 {[
 { n: "Glody Capital Management", c: "bg-blue-500" },
 { n: "Way Capital", c: "bg-emerald-500" },
 { n: "Stan Brown Capital", c: "bg-amber-500" }
 ].map(p => (
 <div key={p.n} className="flex items-center gap-1.5"><div className={cn("w-2 h-2 rounded-full", p.c)}/><span className="text-xs font-semibold text-text">{p.n}</span></div>
 ))}
 </div>
 
 <div className="flex-1 relative border border-border rounded-2xl p-4 bg-surface-2 overflow-hidden">
 <svg className="w-full h-full preserve-3d" viewBox="0 0 1000 300" preserveAspectRatio="none">
 {Array.from({ length: 4 }).map((_, i) => (
 <line key={i} x1="0" y1={i * 75} x2="1000" y2={i * 75} stroke="#e2e8f0" strokeWidth="1" />
 ))}
 <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d="M0 250 Q 150 240, 300 200 T 600 120 T 800 60 T 1000 40" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
 <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} d="M0 250 Q 150 250, 300 220 T 600 180 T 800 120 T 1000 90" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
 <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }} d="M0 250 Q 150 260, 300 250 T 600 210 T 800 180 T 1000 150" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
 </svg>
 
 {state.mouse.x > 300 && (
 <div className="absolute bg-white border border-border shadow-xl rounded p-2 text-xs w-48 pointer-events-none z-10" style={{ left: state.mouse.x - 250, top: state.mouse.y - 120 }}>
 <div className="font-bold border-b pb-1 mb-1 text-text">Dec 2018</div>
 <div className="flex justify-between text-blue-600 mb-0.5"><span>Glody Cap</span><span>$14,200</span></div>
 <div className="flex justify-between text-emerald-600 mb-0.5"><span>Way Cap</span><span>$11,850</span></div>
 <div className="flex justify-between text-amber-600"><span>Stan Brown</span><span>$10,920</span></div>
 </div>
 )}
 </div>
 
 <div className="grid grid-cols-4 gap-4 mt-4">
 {['Initial Balance', 'Final Balance', 'CAGR', 'Max Drawdown'].map((l, i) => (
 <div key={i} className="bg-white border rounded p-2 text-center shadow-sm">
 <div className="text-xs text-text font-bold mb-1">{l}</div>
 <div className="text-xs font-mono font-bold text-text">{i===1?"$18,450":i===2?"8.4%":i===3?"-22.1%":"$10,000"}</div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </motion.div>
 )}
 
 {/* ---------- SCENE: FACTOR ---------- */}
 {state.scene === 'factor' && (
 <motion.div key="factor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-text">Factor Regression Analysis</h2>
 </div>
 
 {state.phase === 'config' && (
 <div className="flex-1 max-w-sm flex flex-col gap-4">
 <div className="space-y-1">
 <div className="text-xs font-bold text-text ">Target Asset</div>
 <div className="p-2 border rounded text-xs bg-surface-2 font-mono">VTI (Vanguard Total Stock Market)</div>
 </div>
 <div className="space-y-1">
 <div className="text-xs font-bold text-text ">Factor Model</div>
 <div className="p-2 border rounded text-xs bg-surface-2">Fama-French 3-Factor (MKT, SMB, HML)</div>
 </div>
 <button className="mt-4 bg-blue-600 text-white text-xs font-bold py-3 rounded shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
 <BarChart3 size={12} /> Run Regression
 </button>
 </div>
 )}

 {state.phase === 'run' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
 <div className="grid grid-cols-4 gap-4">
 {[
 { f: "Alpha (α)", v: "-0.01%", t: "-0.45" },
 { f: "Market (β)", v: "1.02", t: "124.5" },
 { f: "Size (SMB)", v: "0.15", t: "12.8" },
 { f: "Value (HML)", v: "0.02", t: "1.2" }
 ].map((s, i) => (
 <div key={i} className="border rounded p-3 text-center bg-surface-2 shadow-sm">
 <div className="text-xs font-bold text-text mb-2">{s.f}</div>
 <div className="text-lg font-mono font-bold text-blue-600">{s.v}</div>
 <div className="text-xs text-text mt-1">t-stat: {s.t}</div>
 </div>
 ))}
 </div>
 
 <div className="flex-1 border rounded bg-white p-6 relative flex items-end justify-around pb-12 shadow-sm">
 {/* Mock Bar Chart */}
 <div className="w-16 h-[80%] bg-blue-500 rounded-t relative"><div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-text">MKT</div></div>
 <div className="w-16 h-[30%] bg-emerald-500 rounded-t relative"><div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-text">SMB</div></div>
 <div className="w-16 h-[5%] bg-amber-500 rounded-t relative"><div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-text">HML</div></div>
 </div>
 </motion.div>
 )}
 </motion.div>
 )}

 {/* ---------- SCENE: LIBRARY ---------- */}
 {state.scene === 'library' && (
 <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col">
 <div className="flex justify-between items-center mb-6 border-b pb-4">
 <div>
 <h2 className="text-lg font-bold text-text">Library & Education</h2>
 <p className="text-xs text-text">Curated educational content on asset allocation</p>
 </div>
 <div className="flex gap-2">
 <span className="px-3 py-1 bg-slate-100 text-text text-xs rounded-full font-bold">Books</span>
 <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-bold">Videos</span>
 <span className="px-3 py-1 bg-slate-100 text-text text-xs rounded-full font-bold">Research</span>
 </div>
 </div>

 <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <div key={i} className="border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col group cursor-pointer hover:border-blue-300">
 <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
 {/* Play Button Overlay */}
 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform shadow-lg">
 <Play fill="white" size={14} className="text-white ml-0.5" />
 </div>
 <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded shadow">14:20</div>
 </div>
 <div className="p-3">
 <div className="text-xs font-bold text-text mb-1 line-clamp-2 leading-tight">
 {i === 1 ? "Ray Dalio's All Weather" : 
 i === 2 ? "Fund Comparison Techniques" : 
 i === 3 ? "Market Dashboard Overview" : 
 "Modern Portfolio Theory"}
 </div>
 <div className="text-xs text-text">Quantrih Education</div>
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}

 </AnimatePresence>
 </div>

 </div>
 </div>

 {/* PC Stand */}
 <div className="relative flex flex-col items-center z-10 -mt-1">
 <div className="w-32 h-14 bg-gradient-to-b from-bg to-bg-2 border-x-4 border-slate-900" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }} />
 <div className="w-48 h-3 bg-slate-900 rounded-b-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border-t border-slate-800" />
 </div>

 </div>
 </motion.div>
 </div>
 );
};

