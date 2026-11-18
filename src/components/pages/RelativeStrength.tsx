import { RunButton, ResultsPlaceholder } from "../ui/AllocationInputs";
import React, { useState } from "react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Settings, Play, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { InfoTooltip } from "../ui/InfoTooltip";

function TooltipLabel({
  label,
  tooltip,
  className = "",
}: {
  label: React.ReactNode;
  tooltip: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className={cn("text-xs font-semibold text-text ", className)}>
        {label}
      </label>
      <InfoTooltip content={<>{tooltip}</>} />
      
</div>
  );
}

export function RelativeStrength() {
  const { language, t } = useTranslation();
  const [hasRun, setHasRun] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [lookback, setLookback] = useLocalStorage("rs_lookback", 6);
  const [topN, setTopN] = useLocalStorage("rs_topN", 2);
  const [isExporting, setIsExporting] = useState(false);

  const mockPerformanceData = Array.from({ length: 120 }, (_, i) => {
    const year = 2014 + Math.floor(i / 12);
    const month = ((i % 12) + 1).toString().padStart(2, "0");

    const baseRet = 1 + (Math.sin(i / 12) * 0.08 + 0.01);
    const stratRet = baseRet * (1.02 + Math.random() * 0.05);

    return {
      date: `${year}-${month}`,
      benchmark: 10000 * Math.pow(baseRet, i > 0 ? 1 : 0) * (1 + i * 0.005),
      strategy: 10000 * Math.pow(stratRet, i > 0 ? 1 : 0) * (1 + i * 0.009),
    };
  });

  const rankData = [
    { asset: "QQQ", score: 18.5, color: "#2c6cad" },
    { asset: "SPY", score: 12.1, color: "#4b8dd1" },
    { asset: "GLD", score: 5.4, color: "#7baae0" },
    { asset: "EFA", score: -2.1, color: "#a6c6ec" },
    { asset: "TLT", score: -8.5, color: "#d0e1f5" },
  ];

  return (
    <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24 font-sans">
      <div className="mt-4">
        <PageHeader
          title={t("rs.title")}
          badge={t("rs.badge")}
          icon={TrendingUp}
          description={t("rs.description")}
        />
        
</div>

      <div className="flex flex-col gap-8 items-start">
        <div className="w-full space-y-6">
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <h2 className="text-sm font-semibold tracking-tight text-text flex items-center gap-2">
                <Settings size={14} className="text-pv-blue" />
                {'Strategy Parameters'}
              </h2>
              <input
                  type="text"
                  placeholder={t("mc.portfolio_name")}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[200px]"
                />
                <RunButton onClick={() => setHasRun(true)} running={false} label="Run Model" runningLabel="Run Model" />
              
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <TooltipLabel
                  label="Universe"
                  tooltip="L'ensemble des actifs (tickers) que la stratégie va classer par force relative."
                />
                <input
                  type="text"
                  defaultValue="SPY"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                />
                <input
                  type="text"
                  defaultValue="QQQ"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                />
                <input
                  type="text"
                  defaultValue="TLT"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                />
                <input
                  type="text"
                  defaultValue="GLD"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                />
                <input
                  type="text"
                  defaultValue="EFA"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                />
                <button className="w-full py-2 border border-dashed border-border text-sm font-semibold text-text rounded-[1.5rem] hover:text-text transition-colors">
                  + Add Asset
                </button>
                
</div>

              <div className="space-y-1.5 text-left pt-2">
                <TooltipLabel
                  label="Lookback Period (Months)"
                  tooltip="La période passée sur laquelle la performance est calculée pour établir le classement."
                />
                <input
                  type="number"
                  value={lookback}
                  onChange={(e) => setLookback(parseInt(e.target.value) || 6)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus:border-text transition-all num"
                />
                
</div>

              <div className="space-y-1.5 text-left">
                <TooltipLabel
                  label="Select Top N Assets"
                  tooltip="The number of top-performing assets to include in the portfolio."
                />
                <input
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value) || 2)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus:border-text transition-all num"
                />
                
</div>

              
              
</div>
            
</div>
          
</div>

        {hasRun ? (
          <div className="w-full space-y-6" id="report-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="text-xs font-semibold text-text mb-1">CAGR  
</div>
                <div className="text-lg font-semibold num text-green">
                  14.1%
                  
</div>
                <div className="text-sm text-text font-bold mt-1">
                  vs 10.4% Benchmark
                  
</div>
                
</div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="text-xs font-semibold text-text mb-1">
                  Max Drawdown
                  
</div>
                <div className="text-lg font-semibold num">-21.5%  
</div>
                <div className="text-sm text-text font-bold mt-1">
                  vs -51.0% Benchmark
                  
</div>
                
</div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="text-xs font-semibold text-text mb-1">
                  Current Holdings
                  
</div>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-surface-2 border border-border rounded-2xl text-sm font-semibold">
                    QQQ
                  </span>
                  <span className="px-3 py-1 bg-surface-2 border border-border rounded-2xl text-sm font-semibold">
                    SPY
                  </span>
                  
</div>
                
</div>
              
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">
                  Latest Momentum Rankings
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rankData}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "var(--color-text-4)" }}
                      />
                      <YAxis
                        dataKey="asset"
                        type="category"
                        tick={{
                          fontSize: 12,
                          fill: "var(--color-text)",
                          fontWeight: "bold",
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        itemStyle={{ color: "var(--color-text)" }}
                        formatter={(value: any) => [value + "%", "Score"]}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                        {rankData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index < topN
                                ? "var(--color-text)"
                                : "var(--color-border)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
</div>
                
</div>

              <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 border-b border-border pb-4">
                  Strategy Equity Curve
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockPerformanceData}
                      margin={{ top: 5, right: 0, left: 10, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--color-text-4)" }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--color-text-4)" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
                        width={45}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        itemStyle={{ color: "var(--color-text)" }}
                        formatter={(value: any) => [
                          "$" + value.toFixed(0),
                          undefined,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="strategy"
                        name="Rel Strength"
                        stroke="#2c6cad"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        name="Equal Weight"
                        stroke="var(--color-text-4)"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
</div>
                
</div>
              
</div>
            
</div>
        ) : (
          <ResultsPlaceholder className="lg:col-span-3" />
        )}
        
</div>
      
</div>
  );
}
