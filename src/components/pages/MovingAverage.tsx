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
} from "recharts";
import { Settings, Play, Target, FileDown } from "lucide-react";
import { generatePDFReport } from "../../lib/pdfGenerator";
import { TickerInput } from "../ui/TickerInput";

export function MovingAverage() {
  const { language } = useTranslation();
  const [hasRun, setHasRun] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [assetSymbol, setAssetSymbol] = useLocalStorage(
    "ma_assetSymbol",
    "SPY",
  );
  const [movingAverageLength, setMovingAverageLength] = useLocalStorage(
    "ma_length",
    10,
  );
  const [period, setPeriod] = useLocalStorage("ma_period", "monthly");
  const [isExporting, setIsExporting] = useState(false);

  const mockPerformanceData = Array.from({ length: 120 }, (_, i) => {
    const year = 2014 + Math.floor(i / 12);
    const month = ((i % 12) + 1).toString().padStart(2, "0");

    // Simulate trend following avoiding drawdowns
    const baseRet = 1 + (Math.sin(i / 8) * 0.08 + 0.01);
    const stratRet = baseRet < 0.95 ? 1.002 : baseRet;

    return {
      date: `${year}-${month}`,
      benchmark: 10000 * Math.pow(baseRet, i > 0 ? 1 : 0) * (1 + i * 0.005),
      strategy: 10000 * Math.pow(stratRet, i > 0 ? 1 : 0) * (1 + i * 0.004),
    };
  });

  return (
    <div className="space-y-8 animate-fade-up w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-24 font-sans">
      <div className="mb-16 mt-4">
        <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
          <h1 className="text-2xl font-bold text-pv-blue tracking-tight">
            {"Moving Average"}
          </h1>
        </div>
      </div>
      {hasRun && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() =>
              generatePDFReport(
                "report-content",
                "Moving_Average_Report",
                setIsExporting,
              )
            }
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-pv-blue border border-slate-700 hover:border-pv-blue text-white px-5 py-2.5 rounded-[1.5rem] font-bold text-xs transition-all disabled:opacity-50 mt-4 md:mt-0 shadow-xl"
          >
            {isExporting ? (
              <span className="w-4 h-4 rounded-full border-2 border-t-white/30 animate-spin border-white"></span>
            ) : (
              <FileDown size={16} />
            )}
            {isExporting ? "Génération..." : "Exporter PDF"}
          </button>
        </div>
      )}

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
                  placeholder={'Portfolio Name'}
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
                <label className="text-xs font-semibold text-text block">
                  Risk Asset
                </label>
                <TickerInput
                  value={assetSymbol}
                  onChange={setAssetSymbol}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-text block">
                  Time Period
                </label>
                <div className="relative">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full appearance-none bg-surface-2 border border-border rounded-[1.5rem] px-4 py-3 text-sm font-semibold outline-none focus:border-text transition-colors"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.058 3.125 3.018-3.083c0.533-0.481 1.141-0.446 1.576 0 0.436 0.445 0.408 1.197 0 1.615l-3.791 3.874c-0.533 0.481-1.393 0.481-1.926 0l-3.834-3.916c-0.436-0.446-0.436-1.169 0-1.615z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-text block">
                  Moving Average Length
                </label>
                <input
                  type="number"
                  value={movingAverageLength}
                  onChange={(e) =>
                    setMovingAverageLength(parseInt(e.target.value) || 10)
                  }
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
                <div className="text-xs font-semibold text-text mb-1">
                  Sharpe Ratio
                </div>
                <div className="text-lg font-semibold num">0.86</div>
                <div className="text-sm text-green font-bold mt-1">
                  vs 0.54 Buy & Hold
                </div>
              </div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="text-xs font-semibold text-text mb-1">
                  Volatility
                </div>
                <div className="text-lg font-semibold num text-green">8.9%</div>
                <div className="text-sm text-green font-bold mt-1">
                  vs 15.2% Buy & Hold
                </div>
              </div>
              <div className="bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="text-xs font-semibold text-text mb-1">
                  Signal Status
                </div>
                <div className="text-lg font-semibold text-green ">RISK ON</div>
                <div className="text-sm text-text font-bold mt-1">
                  Price {">"} {movingAverageLength}{" "}
                  {period === "monthly" ? "Month" : "Day"} MA
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-6 border-b border-border pb-4">
                Equity Curve
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
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "9px",
                        fontFamily: "JetBrains Mono",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{
                        color: "#94a3b8",
                        marginBottom: "4px",
                        fontWeight: "bold",
                      }}
                      formatter={(value: number) => [
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
                      name="Timing Strategy"
                      stroke="#2c6cad"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name="Buy & Hold"
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
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90"></div>
          </div>
        )}
      </div>
    </div>
  );
}
