import React from "react";
import { Doughnut } from "react-chartjs-2";
import { cn } from "../../lib/utils";

interface EliteDonutProps {
  assets: { symbol: string }[];
  allocations: Record<string, number>;
  colors?: string[];
  title?: string;
}

const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#0ea5e9", // sky-500
  "#0d9488", // teal-600
  "#10b981", // emerald-500
  "#84cc16", // lime-500
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#f43f5e", // rose-500
  "#64748b", // slate-500
];

export function EliteDonut({
  assets,
  allocations,
  colors = DEFAULT_COLORS,
  title,
}: EliteDonutProps) {
  const dataList = assets
    .map((a) => ({
      symbol: a.symbol,
      val: allocations[a.symbol.toUpperCase()] || 0,
    }))
    .filter((d) => d.val > 0);

  // sort by largest allocation first
  dataList.sort((a, b) => b.val - a.val);

  const chartData = {
    labels: dataList.map((a) => a.symbol),
    datasets: [
      {
        data: dataList.map((a) => a.val),
        backgroundColor: colors.slice(0, dataList.length),
        borderWidth: 0,
        borderColor: "transparent", // Work seamlessly across themes
        hoverOffset: 12,
      },
    ],
  };

  const chartOptions = {
    cutout: "68%",
    rotation: -90,
    circumference: 360,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We use our own custom legend
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(2) + "%";
            }
            return label;
          },
        },
      },
    },
  };

  const total = dataList.reduce((sum, item) => sum + item.val, 0);

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-sm mx-auto mt-4">
      <div className="relative w-56 h-56 md:w-64 md:h-64 shrink-0 drop-shadow-md transition-transform duration-500 hover:scale-105">
        <Doughnut data={chartData} options={chartOptions} />
        {/* Inner Ring Data / Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-black text-text-4 mb-1 uppercase tracking-[0.2em]">
            Total Alloc
          </span>
          <span className="text-4xl font-black text-text tracking-tighter leading-none drop-shadow-sm">
            {Math.round(total)}%
          </span>
        </div>
      </div>

      <div className="flex-1 w-full bg-white p-6 rounded-[2rem] border border-border shadow-md">
        <h4 className="text-[11px] font-black text-text mb-6 border-b border-border/80 pb-4 flex items-center justify-between uppercase tracking-[0.15em]">
          <span>{title || "Allocation Details"}</span>
          <span className="text-pv-blue bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-bold tracking-normal normal-case shadow-sm">
            {dataList.length} Holdings
          </span>
        </h4>
        <div className="flex flex-col gap-4">
          {dataList.map((item, idx) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-md ring-2 ring-white group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-[15px] font-bold text-text group-hover:text-pv-blue transition-colors">
                  {item.symbol}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 md:w-32 h-2.5 bg-surface-3 rounded-full overflow-hidden hidden sm:block shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: `${Math.min(100, (item.val / total) * 100)}%`,
                      backgroundColor: colors[idx % colors.length],
                    }}
                  />
                </div>
                <span className="text-sm font-black text-text tabular-nums text-right min-w-[70px] px-2.5 py-1.5 bg-surface-2 rounded-xl border border-border/60 shadow-sm group-hover:border-pv-blue/30 group-hover:shadow-md transition-all">
                  {Number(item.val).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
