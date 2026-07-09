import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

interface WeightEvolutionChartProps {
 results: {
 allocHistory: Record<string, number>[];
 years: number[];
 };
}

export function WeightEvolutionChart({ results }: WeightEvolutionChartProps) {
 const { allocHistory, years } = results;
 if (!allocHistory || allocHistory.length === 0) return null;

 const assets = Object.keys(allocHistory[0]);
 const colors = [
 'rgba(30, 64, 175, 0.8)',
 'rgba(16, 185, 129, 0.8)',
 'rgba(245, 158, 11, 0.8)',
 'rgba(239, 68, 68, 0.8)',
 'rgba(139, 92, 246, 0.8)',
 'rgba(236, 72, 153, 0.8)',
 'rgba(107, 114, 128, 0.8)',
 ];

 // We take yearly snapshots for the bar chart
 const data = {
 labels: years,
 datasets: assets.map((asset, idx) => ({
 label: asset,
 data: allocHistory.map(h => (h[asset] || 0) * 100),
 backgroundColor: colors[idx % colors.length],
 borderWidth: 0,
 }))
 };

 const options = {
 responsive: true,
 maintainAspectRatio: false,
 scales: {
 x: { stacked: true },
 y: { 
 stacked: true, 
 max: 100,
 ticks: { callback: (val: any) => val + '%' }
 }
 },
 plugins: {
 legend: { position: 'bottom' as const, labels: { boxWidth: 6, font: { size: 9 } } },
 tooltip: {
 callbacks: {
 label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
 }
 }
 }
 };

 return (
 <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm text-left">
 <div className="mb-6">
 <h3 className="text-sm font-semibold text-text">Allocation Drift Over Time</h3>
 <p className="text-xs text-text mt-1">Shows how asset weights evolve without rebalancing (Market Weight drift).</p>
 </div>
 <div className="h-[300px]">
 <Bar data={data} options={options} />
 </div>
 </div>
 );
}
