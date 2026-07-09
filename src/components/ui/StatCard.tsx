import React from 'react';

export function StatCard({ label, value }: { label: string, value: string | number }) {
 return (
 <div className="bg-surface border border-border rounded-[1.5rem] p-4">
 <div className="text-text text-xs font-semibold mb-1">{label}</div>
 <div className="text-text text-xl font-bold font-mono">{value}</div>
 </div>
 );
}
