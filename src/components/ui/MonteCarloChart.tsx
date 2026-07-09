import React from 'react';
import { Line } from 'react-chartjs-2';

interface MonteCarloChartProps {
 results: {
 metrics: {
 monteCarlo?: {
 percentiles: Record<number, number[]>;
 probabilities: {
 endingAboveInitial: number;
 hittingZero: number;
 };
 };
 };
 };
}

export function MonteCarloChart({ results }: MonteCarloChartProps) {
 const mc = results.metrics.monteCarlo;
 if (!mc) return null;

 const p10 = mc.percentiles[10] || [];
 const p50 = mc.percentiles[50] || [];
 const p90 = mc.percentiles[90] || [];

 const labels = Array.from({ length: p10.length }, (_, i) => i % 12 === 0 ? `Year ${i / 12}` : '');

 const data = {
 labels,
 datasets: [
 {
 label: 'Optimistic (P90)',
 data: p90,
 borderColor: 'rgba(16, 185, 129, 0.8)',
 backgroundColor: 'rgba(16, 185, 129, 0.1)',
 fill: 1,
 tension: 0.4,
 pointRadius: 0
 },
 {
 label: 'Median (P50)',
 data: p50,
 borderColor: 'rgba(30, 64, 175, 1)',
 backgroundColor: 'rgba(30, 64, 175, 0.1)',
 fill: false,
 tension: 0.4,
 pointRadius: 0
 },
 {
 label: 'Pessimistic (P10)',
 data: p10,
 borderColor: 'rgba(239, 68, 68, 0.8)',
 backgroundColor: 'rgba(239, 68, 68, 0.1)',
 fill: 1,
 tension: 0.4,
 pointRadius: 0
 }
 ]
 };

 const options = {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 6, font: { size: 9, family: 'Inter, sans-serif' } } },
 title: { display: false }
 },
 scales: {
 y: {
 beginAtZero: true,
 ticks: {
 callback: (value: any) => '$' + value.toLocaleString('fr-FR')
 }
 }
 }
 };

 return (
 <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm text-left">
 <div className="mb-6">
 <h3 className="text-sm font-semibold text-text">Monte Carlo Future Projections</h3>
 <p className="text-xs text-text mt-1">1,000 simulations based on historical volatility and return profile.</p>
 </div>
 <div className="h-[300px]">
 <Line data={data} options={options} />
 </div>
 <div className="mt-6 grid grid-cols-2 gap-4">
 <div className="p-4 bg-surface-2 rounded-[1.5rem] border border-border">
 <div className="text-xs font-semibold text-text mb-1">Ending Above Initial</div>
 <div className="text-lg font-bold text-green">{(mc.probabilities.endingAboveInitial * 100).toFixed(1)}%</div>
 </div>
 <div className="p-4 bg-surface-2 rounded-[1.5rem] border border-border">
 <div className="text-xs font-semibold text-text mb-1">Risk of Ruin (Vanguard Survival Audit)</div>
 <div className="text-lg font-bold text-red">{(mc.probabilities.hittingZero * 100).toFixed(1)}%</div>
 </div>
 </div>
 </div>
 );
}
