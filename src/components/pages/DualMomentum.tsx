import React, { useState } from "react";
import { Disclaimer } from "../ui/Disclaimer";
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
} from "recharts";
import {
  Settings,
  Info,
  Play,
  Database,
  Search,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { InfoTooltip } from "../ui/InfoTooltip";
import { TickerInput } from "../ui/TickerInput";

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

export function DualMomentum() {
  const { language, t } = useTranslation();
  const [hasRun, setHasRun] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [lookback, setLookback] = useLocalStorage("dm_lookback", 12);
  const [usEquity, setUsEquity] = useLocalStorage("dm_usEquity", "VFINX");
  const [intlEquity, setIntlEquity] = useLocalStorage("dm_intlEquity", "VGTSX");
  const [bonds, setBonds] = useLocalStorage("dm_bonds", "VBMFX");
  const [isExporting, setIsExporting] = useState(false);

  const mockPerformanceData = Array.from({ length: 120 }, (_, i) => {
    const year = 2014 + Math.floor(i / 12);
    const month = ((i % 12) + 1).toString().padStart(2, "0");
    // Strategy often outperforms by avoiding big drawdowns
    const mktRet = 1 + (Math.sin(i / 6) * 0.05 + 0.005);
    const stratRet = mktRet < 0.98 ? 1.002 : mktRet * 0.95 + 0.01;

    return {
      date: `${year}-${month}`,
      benchmark: 10000 * Math.pow(mktRet, i > 0 ? 1 : 0) * (1 + i * 0.005),
      strategy: 10000 * Math.pow(stratRet, i > 0 ? 1 : 0) * (1 + i * 0.006),
    };
  });

  return (
    <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24 font-sans">
      <div className="mt-4">
        <PageHeader
          title={t("dm.title")}
          badge={t("dm.badge")}
          icon={TrendingUp}
          description={t("dm.description")}
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
                  placeholder={t("pb.portfolio")}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[200px]"
                />
                <button
                onClick={() => setHasRun(true)}
                className="flex justify-center items-center gap-2 py-2.5 px-6 bg-pv-blue text-white rounded-[1.5rem] text-xs font-semibold hover:bg-pv-blue-l transition-colors shadow-md active:scale-95 disabled:opacity-50"
              >
                <Play size={12} fill="currentColor" /> {'Run Model'}
              </button>
              
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5 text-left">
                <TooltipLabel
                  label="US Equity Asset"
                  tooltip="L'investissement de base qui représente ton marché principal, par exemple un ETF sur le S&P 500 pour les États-Unis."
                />
                <TickerInput
                  value={usEquity}
                  onChange={setUsEquity}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                />
                
</div>

              <div className="space-y-1.5 text-left">
                <TooltipLabel
                  label="Intl Equity Asset"
                  tooltip="L'investissement qui représente le reste du monde (hors États-Unis). La stratégie va choisir l'un des deux en fonction de celui qui monte le plus vite !"
                />
                <TickerInput
                  value={intlEquity}
                  onChange={setIntlEquity}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                />
                
</div>

              <div className="space-y-1.5 text-left">
                <TooltipLabel
                  label="Safe Asset (Bonds)"
                  tooltip="L'investissement très sûr (comme des obligations d'État) où ton argent va se cacher quand la bourse mondiale est en train de s'effondrer."
                />
                <TickerInput
                  value={bonds}
                  onChange={setBonds}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                />
                
</div>

              <div className="space-y-1.5 text-left">
                <TooltipLabel
                  label="Lookback"
                  tooltip="Sur combien de mois on regarde en arrière pour voir quel investissement a eu la meilleure performance. En général, on regarde l'année passée (12 mois)."
                />
                <input
                  type="number"
                  value={lookback}
                  onChange={(e) => setLookback(parseInt(e.target.value) || 12)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-3 text-sm font-semibold outline-none focus:border-text transition-all num"
                />
                
</div>

              
              
</div>
            
</div>
          
</div>

        {hasRun ? (
          <div className="w-full space-y-6" id="report-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <TooltipLabel
                  label="CAGR"
                  tooltip="The average annual return of this dynamic strategy compared to a basic buy-and-hold option."
                />
                <div className="text-lg font-semibold num">12.4%  
</div>
                <div className="text-sm text-green font-bold mt-1">
                  vs 10.1% Benchmark
                  
</div>
                
</div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <TooltipLabel
                  label="Max Drawdown"
                  tooltip="The largest loss suffered. The goal of the Dual Momentum strategy is precisely to avoid losing everything during a major crash!"
                />
                <div className="text-lg font-semibold num text-red">-14.2%  
</div>
                <div className="text-sm text-green font-bold mt-1">
                  vs -51.0% Benchmark
                  
</div>
                
</div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <TooltipLabel
                  label="Current Signal"
                  tooltip="L'investissement que cette stratégie te conseille d'avoir en portefeuille en ce moment même."
                />
                <div className="text-lg font-semibold text-pv-blue ">
                  {usEquity}
                  
</div>
                <div className="text-sm text-text font-bold mt-1">
                  Updated EOM
                  
</div>
                
</div>
              
</div>

            <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-6 border-b border-border pb-4">
                Strategy Performance
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mockPerformanceData}
                    margin={{ top: 5, right: 0, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
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
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        paddingTop: "10px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="strategy"
                      name="Dual Momentum"
                      stroke="#2c6cad"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name={usEquity + " (Buy & Hold)"}
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
        ) : (
          <div className="lg:col-span-3 h-full min-h-[500px] border border-border/30 rounded-[2rem] relative overflow-hidden bg-surface-2/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale">  
</div>
            <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90">  
</div>
            
</div>
        )}
        
</div>
      
  <Disclaimer />
</div>
  );
}
