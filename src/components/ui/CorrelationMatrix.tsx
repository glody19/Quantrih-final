import React from 'react';
import { cn } from '../../lib/utils';

interface CorrelationMatrixProps {
 correlationMatrix: Record<string, Record<string, number>>;
 assets: string[];
}

export function CorrelationMatrix({ correlationMatrix, assets }: CorrelationMatrixProps) {
 if (!correlationMatrix || Object.keys(correlationMatrix).length === 0) {
 return (
 <div className="flex items-center justify-center h-48 bg-surface-2 rounded-[1.5rem] border border-dashed border-border text-text italic text-sm">
 Insufficient data for correlation matrix
 </div>
 );
 }

 return (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
 {assets.map((asset1, idx1) => (
 <React.Fragment key={asset1}>
 {assets.map((asset2, idx2) => {
 if (idx2 < idx1) return null; // Only show half + diagonal
 
 const corr = correlationMatrix[asset1]?.[asset2] ?? 0;
 
 return (
 <div key={asset2} className="flex flex-col items-center justify-center aspect-square rounded-2xl border border-border bg-surface-2 p-3 group hover:border-pv-blue transition-all">
 <div className="text-xs font-semibold text-text mb-2 ">{asset1} / {asset2}</div>
 <div className={cn(
 "text-base font-bold num tracking-tighter",
 corr > 0.8 ? "text-pv-blue" : corr > 0.5 ? "text-text" : corr < 0 ? "text-green" : "text-text"
 )}>
 {corr.toFixed(2)}
 </div>
 <div className="w-full h-1 mt-3 bg-border relative overflow-hidden rounded-full">
 <div 
 className={cn(
 "absolute inset-y-0 left-1/2 bg-pv-blue/60 transition-all duration-500",
 corr < 0 && "bg-green/60"
 )}
 style={{ 
 width: `${Math.abs(corr) * 50}%`,
 transform: corr < 0 ? 'translateX(-100%)' : 'none'
 }}
 ></div>
 </div>
 </div>
 );
 })}
 </React.Fragment>
 ))}
 </div>
 );
}
