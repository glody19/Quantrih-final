import React, { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface EfficientFrontierProps {
 results: any[];
}

export function EfficientFrontier({ results }: EfficientFrontierProps) {
 const assetsReturns = results[0]?.metrics?.assetReturns;
 
 const { frontierPoints, assetPoints, maxSharpe, minVar } = useMemo(() => {
 if (!assetsReturns) return { frontierPoints: [], assetPoints: [], maxSharpe: {x:0, y:0}, minVar: {x:0, y:0} };
 
 const tickers = assetsReturns.map((a: any) => a.symbol);
 const numAssets = tickers.length;
 if (numAssets < 2) return { frontierPoints: [], assetPoints: [] };

 // Calculate stats
 const stats = assetsReturns.map((asset: any) => {
 const rets = asset.returns;
 const mean = rets.reduce((sum: number, r: number) => sum + r, 0) / rets.length;
 const std = Math.sqrt(rets.reduce((sum: number, r: number) => sum + Math.pow(r - mean, 2), 0) / rets.length);
 return { symbol: asset.symbol, mean: mean * 12 * 100, std: std * Math.sqrt(12) * 100 }; // Annualized %
 });

 const points = [];
 const corrMatrix = results[0]?.metrics?.correlationMatrix;
 let maxSharpe = { x: 0, y: 0, sharpe: -Infinity };
 let minVar = { x: Infinity, y: 0 };
 const rf = 0.04; // Assumption for Sharpe on the plot

 for (let i = 0; i < 2000; i++) {
 let weights = tickers.map(() => Math.random());
 const sum = weights.reduce((a,b) => a+b, 0);
 weights = weights.map(w => w / sum);
 
 let pMean = 0;
 let pVar = 0;
 
 for (let j = 0; j < numAssets; j++) {
 pMean += weights[j] * stats[j].mean;
 }
 
 if (corrMatrix) {
 for (let j = 0; j < numAssets; j++) {
 for (let k = 0; k < numAssets; k++) {
 const corr = corrMatrix[tickers[j]]?.[tickers[k]] || (j === k ? 1 : 0);
 pVar += weights[j] * weights[k] * stats[j].std * stats[k].std * corr;
 }
 }
 } else {
 for (let j = 0; j < numAssets; j++) {
 pVar += Math.pow(weights[j] * stats[j].std, 2);
 }
 }
 
 const std = Math.sqrt(pVar);
 const point = { x: std, y: pMean };
 const sharpe = (pMean - rf * 100) / std;

 if (sharpe > maxSharpe.sharpe) {
 maxSharpe = { ...point, sharpe };
 }
 if (std < minVar.x) {
 minVar = point;
 }

 points.push(point);
 }

 return { 
 frontierPoints: points, 
 assetPoints: stats,
 maxSharpe,
 minVar
 };
 }, [assetsReturns, results]);

 if (!assetsReturns || !frontierPoints.length) return null;

 const data = {
 datasets: [
 {
 label: 'Random Portfolios',
 data: frontierPoints,
 backgroundColor: 'rgba(44, 108, 173, 0.08)',
 pointRadius: 1.5,
 },
 {
 label: 'Individual Assets',
 data: assetPoints.map((a: any) => ({ x: a.std, y: a.mean, symbol: a.symbol })),
 backgroundColor: '#94a3b8',
 borderWidth: 1,
 borderColor: '#475569',
 pointRadius: 6,
 pointStyle: 'circle',
 },
 {
 label: 'Max Sharpe',
 data: [maxSharpe], 
 backgroundColor: '#fbbf24',
 pointRadius: 12,
 pointStyle: 'rectRot',
 borderWidth: 2,
 borderColor: '#fff'
 },
 {
 label: 'Min Variance',
 data: [minVar],
 backgroundColor: '#10b981',
 pointRadius: 10,
 pointStyle: 'triangle',
 borderWidth: 2,
 borderColor: '#fff'
 },
 {
 label: 'Selected Portfolios',
 data: results.map(r => ({ x: r.metrics.stdev * 100, y: r.metrics.cagr * 100, name: r.name })),
 backgroundColor: results.map(r => r.color),
 pointRadius: 10,
 pointStyle: 'star',
 borderWidth: 2,
 borderColor: '#fff'
 }
 ]
 };

 const options = {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: { 
 position: 'bottom' as const,
 labels: { font: { size: 9, family: 'Inter' }, usePointStyle: true, boxWidth: 6 }
 },
 tooltip: {
 backgroundColor: 'rgba(15, 23, 42, 0.95)',
 padding: 12,
 callbacks: {
 label: (ctx: any) => {
 if (ctx.dataset.label === 'Individual Assets') {
 return `${ctx.raw.symbol}: Vol=${ctx.raw.x.toFixed(2)}%, Ret=${ctx.raw.y.toFixed(2)}%`;
 }
 if (ctx.dataset.label === 'Selected Portfolios') {
 return `${ctx.raw.name}: Vol=${ctx.raw.x.toFixed(2)}%, Ret=${ctx.raw.y.toFixed(2)}%`;
 }
 return `Theory: Vol=${ctx.raw.x.toFixed(2)}%, Ret=${ctx.raw.y.toFixed(2)}%`;
 }
 }
 }
 },
 scales: {
 x: {
 title: { display: true, text: 'Volatility (Annualized %)', font: { size: 10, family: 'Inter', weight: 'bold' as const } },
 grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] },
 ticks: { font: { size: 10, family: 'JetBrains Mono' } }
 },
 y: {
 title: { display: true, text: 'Return (Annualized %)', font: { size: 10, family: 'Inter', weight: 'bold' as const } },
 grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] },
 ticks: { font: { size: 10, family: 'JetBrains Mono' } }
 }
 }
 };

 return (
 <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm text-left">
 <div className="mb-6">
 <h3 className="text-sm font-semibold text-text">Modern Portfolio Theory Frontier</h3>
 <p className="text-xs text-text mt-1">Efficient Frontier cloud generated from thousands of random iterations.</p>
 </div>
 <div className="h-[300px]">
 <Scatter data={data} options={options} />
 </div>
 </div>
 );
}
