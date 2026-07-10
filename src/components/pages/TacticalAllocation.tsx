import React, { useState } from "react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../lib/utils";
import { InfoTooltip } from "../ui/InfoTooltip";
import { Play, Settings, Activity, Database } from "lucide-react";
import { TickerInput } from "../ui/TickerInput";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { EliteDonut } from "../ui/EliteDonut";
import { ReturnsHeatmap } from "../ui/ReturnsHeatmap";
import { EfficientFrontier } from "../ui/EfficientFrontier";
import { PortfolioAnalysisExplication } from "./PortfolioAnalysisExplication";
import { runBacktest as engineRunBacktest } from "../../engine";
import { downloadCSV } from "../../utils/export";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

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
      <label className={cn("text-xs font-bold text-text ", className)}>
        {label}
      </label>
      <InfoTooltip content={<>{tooltip}</>} />
    </div>
  );
}

export function TacticalAllocation() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useLocalStorage("ta_activeTab", "seasonal");
  const [saveName, setSaveName] = useState("");

  const [results, setResults] = useState<any[] | null>(null);
  const [activeResIdx, setActiveResIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [startYear, setStartYear] = useLocalStorage("ta_startYear", 2010);
  const [endYear, setEndYear] = useLocalStorage("ta_endYear", 2025);
  const [initialAmount, setInitialAmount] = useLocalStorage(
    "ta_initialAmount",
    10000,
  );
  const [broker, setBroker] = useLocalStorage("ta_broker", "free");
  const [customFee, setCustomFee] = useLocalStorage("ta_customFee", 1.5);

  const [maPortfolioAssets, setMaPortfolioAssets] = useLocalStorage(
    "ta_maPortfolioAssets_v2", [
      { symbol: "VFINX", alloc: "60" },
      { symbol: "VBMFX", alloc: "40" },
      { symbol: "VGTSX", alloc: "0" },
      { symbol: "VGSIX", alloc: "0" },
      { symbol: "GLD", alloc: "0" },
    ],
  );
  const [adaptivePortfolioAssets, setAdaptivePortfolioAssets] = useLocalStorage(
    "ta_adaptivePortfolioAssets_v2", [
      { symbol: "VFINX", alloc: "40" },
      { symbol: "VGTSX", alloc: "20" },
      { symbol: "VBMFX", alloc: "40" },
      { symbol: "VGSIX", alloc: "0" },
      { symbol: "GLD", alloc: "0" },
    ],
  );

  const [relativeTickers, setRelativeTickers] = useLocalStorage(
    "ta_relativeTickers",
    "VFINX, VGTSX, VBMFX",
  );
  const [dualTickers, setDualTickers] = useLocalStorage(
    "ta_dualTickers",
    "VFINX, VGTSX, VBMFX",
  );
  const [adaptiveTickers, setAdaptiveTickers] = useLocalStorage(
    "ta_adaptiveTickers",
    "VFINX, VGTSX, VBMFX, CASH",
  );
  const [momLookback, setMomLookback] = useLocalStorage("ta_momLookback", 12);
  const [momTopK, setMomTopK] = useLocalStorage("ta_momTopK", 1);
  const [momSafeAsset, setMomSafeAsset] = useLocalStorage(
    "ta_momSafeAsset",
    "CASH",
  );
  const [momOutMarket, setMomOutMarket] = useLocalStorage(
    "ta_momOutMarket",
    true,
  );
  const [targetVolatility, setTargetVolatility] = useLocalStorage(
    "ta_targetVolatility",
    10,
  );
  const [pe10Equity, setPe10Equity] = useLocalStorage("ta_pe10Equity", "VFINX");
  const [pe10Bond, setPe10Bond] = useLocalStorage("ta_pe10Bond", "VBMFX");
  const [maSingleAsset, setMaSingleAsset] = useLocalStorage(
    "ta_maSingleAsset",
    "VFINX",
  );
  const [maSingleMonths, setMaSingleMonths] = useLocalStorage(
    "ta_maSingleMonths",
    10,
  );

  const updateMaPortfolioAsset = (
    index: number,
    field: "symbol" | "alloc",
    value: string,
  ) => {
    const newAssets = [...maPortfolioAssets];
    newAssets[index][field] = value;
    setMaPortfolioAssets(newAssets);
  };

  const updateAdaptiveAsset = (
    index: number,
    field: "symbol" | "alloc",
    value: string,
  ) => {
    const newAssets = [...adaptivePortfolioAssets];
    newAssets[index][field] = value;
    setAdaptivePortfolioAssets(newAssets);
  };

  const tabs = [
    { id: "seasonal", label: "Seasonal Model" },
    { id: "ma_single", label: "Moving Averages - Single Asset" },
    { id: "ma_portfolio", label: "Moving Averages - Portfolio Assets" },
    { id: "mom_relative", label: "Momentum - Relative Strength" },
    { id: "mom_dual", label: "Momentum - Dual Momentum" },
    { id: "mom_adaptive", label: "Momentum - Adaptive Allocation" },
  ];

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const initialAmount = 10000;
      let currentAssets: { symbol: string; weight: number }[] = [];
      let tacticalModel: any = null;

      if (activeTab === "ma_single") {
        currentAssets = [{ symbol: maSingleAsset, weight: 1.0 }];
        tacticalModel = {
          type: "moving_average",
          movingAverageMonths: maSingleMonths,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "ma_portfolio") {
        const total =
          maPortfolioAssets.reduce(
            (sum, a) => sum + (parseFloat(a.alloc) || 0),
            0,
          ) || 1;
        currentAssets = maPortfolioAssets.map((a) => ({
          symbol: a.symbol.toUpperCase(),
          weight: (parseFloat(a.alloc) || 0) / total,
        }));
        tacticalModel = {
          type: "moving_average",
          movingAverageMonths: 10,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "mom_relative") {
        const symbols = relativeTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s);
        currentAssets = symbols.map((s) => ({
          symbol: s,
          weight: 1 / (symbols.length || 1),
        }));
        tacticalModel = {
          type: "relative_momentum",
          lookbackMonths: momLookback,
          topK: momTopK,
        };
      } else if (activeTab === "mom_dual") {
        const symbols = dualTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s);
        currentAssets = symbols.map((s) => ({
          symbol: s,
          weight: 1 / (symbols.length || 1),
        }));
        tacticalModel = {
          type: "dual_momentum",
          lookbackMonths: momLookback,
          safeAsset: momSafeAsset,
        };
      } else if (activeTab === "mom_adaptive") {
        const total =
          adaptivePortfolioAssets.reduce(
            (sum, a) => sum + (parseFloat(a.alloc) || 0),
            0,
          ) || 1;
        currentAssets = adaptivePortfolioAssets.map((a) => ({
          symbol: a.symbol.toUpperCase(),
          weight: (parseFloat(a.alloc) || 0) / total,
        }));
        tacticalModel = {
          type: "adaptive_allocation",
          lookbackMonths: momLookback,
          volatilityMonths: 6,
        };
      } else if (activeTab === "valuation_pe10") {
        currentAssets = [
          { symbol: pe10Equity, weight: 0.6 },
          { symbol: pe10Bond, weight: 0.4 },
        ];
        tacticalModel = {
          type: "pe10",
          baselineEquity: pe10Equity,
          baselineBond: pe10Bond,
        };
      } else if (activeTab === "target_volatility") {
        currentAssets = [{ symbol: pe10Equity, weight: 1.0 }];
        tacticalModel = {
          type: "target_volatility",
          targetVolatility: targetVolatility / 100,
          safeAsset: momSafeAsset,
          lookbackMonths: momLookback,
        };
      } else {
        currentAssets = [
          { symbol: "VFINX", weight: 0.6 },
          { symbol: "VBMFX", weight: 0.4 },
        ];
      }

      const enginePortfolios = [
        {
          id: "tactical-1",
          name: "Tactical Allocation",
          allocations: currentAssets,
          tacticalModel,
        },
      ];

      const engineOptions = {
        initialBalance: initialAmount,
        startDate: `${startYear}-01-01`,
        endDate: `${endYear}-12-31`,
        rebalanceFrequency: "annually" as const,
        cashflowAmount: 0,
        cashflowFrequency: "none" as const,
        reinvestDividends: true,
        dividendTaxRate: 0,
        capitalGainsTaxRate: 0,
        transactionFeeAmount: broker === "custom" ? customFee : 0,
      };

      const res = await engineRunBacktest(enginePortfolios, engineOptions);

      const finalResults: any[] = res.map((r, i) => {
        const startY =
          r.equityCurve.length > 0
            ? parseInt(r.equityCurve[0].date.substring(0, 4))
            : new Date().getFullYear();
        const endY =
          r.equityCurve.length > 0
            ? parseInt(
                r.equityCurve[r.equityCurve.length - 1].date.substring(0, 4),
              )
            : new Date().getFullYear();

        const colors = ["#2c6cad", "#eab308", "#ef4444", "#10b981", "#8b5cf6"];
        const color = colors[i % colors.length];

        const yearsInteger = Array.from(
          new Set(r.equityCurve.map((e) => parseInt(e.date.split("-")[0]))),
        );
        const annualReturns: number[] = [];
        let prevYearValue = initialAmount;
        for (const yr of yearsInteger) {
          const yearData = r.equityCurve.filter((e) =>
            e.date.startsWith(yr.toString()),
          );
          if (yearData.length > 0) {
            const yearEndVal = yearData[yearData.length - 1].value;
            annualReturns.push((yearEndVal / prevYearValue - 1) * 100);
            prevYearValue = yearEndVal;
          }
        }

        const alloc: Record<string, number> = {};
        enginePortfolios[i].allocations.forEach((a) => {
          alloc[a.symbol] = a.weight * 100;
        });

        return {
          id: r.portfolioId || enginePortfolios[i].name,
          name: enginePortfolios[i].name,
          startYear: startY,
          endYear: endY,
          initialAmount: initialAmount,
          endBalance: r.metrics.endBalance,
          cagr: r.metrics.cagr * 100,
          stdev: r.metrics.volatility * 100,
          bestYear: r.metrics.bestYear * 100,
          worstYear: r.metrics.worstYear * 100,
          maxDrawdown: -r.metrics.maxDrawdown * 100,
          sharpe: r.metrics.sharpeRatio,
          sortino: r.metrics.sortinoRatio,
          balances: r.equityCurve.map((e) => e.value),
          drawdowns: r.metrics.drawdowns.map((d) => -d * 100),
          monthlyReturns: r.metrics.monthlyReturns || [],
          rolling1Y: r.metrics.rolling1Y,
          rolling3Y: r.metrics.rolling3Y,
          rolling5Y: r.metrics.rolling5Y,
          rolling10Y: r.metrics.rolling10Y,
          years: r.equityCurve.map((e) => {
            const yr = parseInt(e.date.substring(0, 4));
            const mo = parseInt(e.date.substring(5, 7));
            return yr + mo / 12;
          }),
          dates: r.equityCurve.map((e) => e.date),
          assets: r.assets?.map((a) => ({
            symbol: a.symbol,
            returns: a.monthlyReturns,
          })),
          metrics: {
            correlationMatrix: r.metrics.correlationMatrix,
            monteCarlo: r.metrics.monteCarlo,
            alpha: r.metrics.alpha,
            beta: r.metrics.beta,
            trackingError: r.metrics.trackingError,
            informationRatio: r.metrics.informationRatio,
            upCapture: r.metrics.upCapture,
            downCapture: r.metrics.downCapture,
          },
          holdingsHistory: r.equityCurve.map((e) => e.holdings || {}),
          warnings: r.warnings,
          yearsInteger,
          annualReturns,
          color,
          alloc,
        };
      });
      setResults(finalResults);
      setTimeout(() => {
        document
          .getElementById("bt-results-anchor")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-24">
        {/* TITLE HEADER */}
        <div className="mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
            <h1 className="text-2xl font-bold text-pv-blue tracking-tight">
              {t("ta.tit")}
            </h1>
          </div>
          <p className="text-base text-text-2 font-medium leading-relaxed w-full max-w-[1308px]">
            {
              "Tactical allocation involves actively adjusting a portfolio's composition to capitalize on short or medium-term market anomalies while maintaining an overarching strategy. Explore how different dynamic strategies can optimize returns. The backtest begins at the year of common data availability for the assets."
            }
          </p>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 text-sm md:text-base font-bold rounded-[1.5rem] transition-colors border-2",
                activeTab === tab.id
                  ? "bg-pv-blue text-white border-pv-blue"
                  : "bg-surface-2 text-text border-transparent hover:bg-surface-3 hover:text-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <MobileZoomWrapper scaleMobile={0.22}>
        <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <h2 className="text-sm font-semibold tracking-tight text-text flex items-center gap-2">
              <Settings size={14} className="text-pv-blue" />
              {"Strategy Parameters"}
            </h2>
            <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full xl:w-auto">
              <label className="hidden md:inline-block text-xs font-semibold text-text ">
                {t("mc.portfolio_name")}
              </label>
              <input
                type="text"
                placeholder={t("mc.portfolio_name") || "Portfolio Name"}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[200px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Common parameters */}
            <div className="space-y-4">
              <TooltipLabel
                label={"Time Period"}
                tooltip={
                  "Select whether the period is calculated year over year or month over month."
                }
              />
              <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                <option>Year-to-Year</option>
                <option>Month-to-Month</option>
              </select>
            </div>
            <div className="space-y-4">
              <TooltipLabel
                label={"Start Year"}
                tooltip={"Start year of the backtest."}
              />
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
              />
            </div>
            <div className="space-y-4">
              <TooltipLabel
                label={"End Year"}
                tooltip={"End year of the backtest."}
              />
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
              />
            </div>
            <div className="space-y-4">
              <TooltipLabel
                label={"Include YTD"}
                tooltip={
                  "Include the current year (Year-To-Date) in the calculations."
                }
              />
              <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="space-y-4">
              <TooltipLabel
                label={"Initial Amount"}
                tooltip={"The initial investment capital."}
              />
              <input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
                step="0.01"
                className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
              />
            </div>

            <div className="space-y-4">
              <TooltipLabel
                label={
                  <>
                    {t("pb.broker")} / {t("common.parameters")}
                  </>
                }
                tooltip={
                  "The broker platform determines the fee structure for the simulated backtest."
                }
              />
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
              >
                <option value="free">Sans Frais (0€)</option>
                <option value="custom">Autre / Personnalisé</option>
              </select>
              {broker === "custom" && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-text mb-1 block">
                    {t("pb.customFee")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customFee}
                    onChange={(e) => setCustomFee(Number(e.target.value))}
                    className="w-full bg-surface border border-border text-text rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner"
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <TooltipLabel
                label={"Cashflows"}
                tooltip={
                  "Regular contributions or withdrawals applied to the portfolio."
                }
              />
              <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                <option>None</option>
                <option>Contribute fixed amount</option>
                <option>Withdraw fixed amount</option>
              </select>
            </div>
          </div>

          {activeTab === "seasonal" && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-xs font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {"Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Out Of Market Start Month"}
                      tooltip={
                        "Month from which to exit the market (seasonal effect)."
                      }
                    />
                    <select
                      defaultValue="May"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Out Of Market End Month"}
                      tooltip={
                        "Month from which to re-enter the market (seasonal effect)."
                      }
                    />
                    <select
                      defaultValue="Oct"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Out of Market Asset"}
                      tooltip={
                        "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>Cash</option>
                      <option>BIL (1-3 Month T-Bill)</option>
                      <option>SHV (Short Term Treasuries)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Leverage Type"}
                      tooltip={
                        "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>None</option>
                      <option>Margin Factor</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Compared Allocation"}
                      tooltip={
                        "The reference allocation used for comparison (Benchmark)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Default</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Benchmark"}
                      tooltip={
                        "The benchmark index to compare overall performance."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>None</option>
                      <option>S&P 500</option>
                      <option>Vanguard 60/40</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-6 mt-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                      <Database size={14} className="text-pv-blue" />
                    </div>
                    <h3 className="text-xs font-semibold text-text flex items-center gap-2">
                      Portfolio Assets
                    </h3>
                  </div>
                </div>
                <div className="w-full overflow-x-auto bg-surface rounded-xl border border-border mt-4">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text">
                        <th className="font-semibold py-3 px-4 text-sm w-[120px]">
                          Asset
                        </th>
                        <th className="font-semibold py-3 px-4 text-sm w-[140px]">
                          {t("pb.alloc")}
                        </th>
                        <th className="font-semibold py-3 px-4 text-sm w-[60px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {maPortfolioAssets.map((asset, index) => (
                        <tr
                          key={index}
                          className="border-b border-border last:border-0 hover:bg-surface-2"
                        >
                          <td className="py-2 px-4">
                            <TickerInput
                              value={asset.symbol}
                              onChange={(val) =>
                                updateMaPortfolioAsset(index, "symbol", val)
                              }
                              placeholder="e.g. SPY"
                              className="bg-surface text-sm p-2 border border-border rounded-xl outline-none focus:border-pv-blue transition-colors w-full box-border font-mono font-bold"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex w-full box-border group">
                              <input
                                type="number"
                                step="1"
                                value={asset.alloc}
                                onChange={(e) =>
                                  updateMaPortfolioAsset(
                                    index,
                                    "alloc",
                                    e.target.value,
                                  )
                                }
                                className="bg-surface text-sm p-2 border border-border rounded-l-md outline-none focus:border-pv-blue transition-colors w-full box-border text-text font-bold"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-2 py-2 text-xs text-text shrink-0 select-none">
                                %
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <button
                              onClick={() =>
                                setMaPortfolioAssets(
                                  maPortfolioAssets.filter(
                                    (_, i) => i !== index,
                                  ),
                                )
                              }
                              className="text-text hover:text-red transition-colors p-1 rounded-xl hover:bg-surface-3"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-surface-2 border-t border-border border-dashed font-sans">
                  <button
                    onClick={() =>
                      setMaPortfolioAssets([
                        ...maPortfolioAssets,
                        { symbol: "", alloc: "" },
                      ])
                    }
                    className="text-xs font-bold text-pv-blue hover:underline"
                  >
                    + Add more assets
                  </button>
                </div>
              </div>
            </>
          )}

          {(activeTab === "ma_single" || activeTab === "ma_portfolio") && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-xs font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {"Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Out of Market Asset"}
                      tooltip={
                        "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>Cash</option>
                      <option>BIL (1-3 Month T-Bill)</option>
                      <option>SHV (Short Term Treasuries)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Buy Signal"}
                      tooltip={
                        "The condition necessary to trigger a buy signal."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Price &gt;= Moving average</option>
                      <option>Price &gt; Moving average</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Type of Moving Average"}
                      tooltip={
                        "The smoothing method (Simple or Exponential) of the moving average."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Simple Moving Average</option>
                      <option>Exponential Moving Average</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Lookback Period"}
                      tooltip={
                        "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>10 months</option>
                      <option>12 months</option>
                      <option>200 days</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Stop Loss"}
                      tooltip={
                        "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No stop-loss</option>
                      <option>Trailing stop-loss</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trading Frequency"}
                      tooltip={
                        "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Signal Asset"}
                      tooltip={
                        "The asset observed to generate market signals (may be different from the invested asset)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Same as investment</option>
                      <option>S&P 500 (SPY)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trade Execution"}
                      tooltip={
                        "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Trade at end of month price</option>
                      <option>Trade at next month open</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Leverage Type"}
                      tooltip={
                        "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>None</option>
                      <option>Margin Factor</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-6 mt-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                      <Database size={14} className="text-pv-blue" />
                    </div>
                    <h3 className="text-xs font-semibold text-text flex items-center gap-2">
                      Portfolio Assets
                    </h3>
                  </div>
                </div>
                <div className="w-full overflow-x-auto bg-surface rounded-xl border border-border mt-4">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text">
                        <th className="font-semibold py-3 px-4 text-sm w-[120px]">
                          Asset
                        </th>
                        <th className="font-semibold py-3 px-4 text-sm w-[140px]">
                          {t("pb.alloc")}
                        </th>
                        <th className="font-semibold py-3 px-4 text-sm w-[60px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {adaptivePortfolioAssets.map((asset, index) => (
                        <tr
                          key={index}
                          className="border-b border-border last:border-0 hover:bg-surface-2"
                        >
                          <td className="py-2 px-4">
                            <TickerInput
                              value={asset.symbol}
                              onChange={(val) =>
                                updateAdaptiveAsset(index, "symbol", val)
                              }
                              placeholder="e.g. SPY"
                              className="bg-surface text-sm p-2 border border-border rounded-xl outline-none focus:border-pv-blue transition-colors w-full box-border font-mono font-bold"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex w-full box-border group">
                              <input
                                type="number"
                                step="1"
                                value={asset.alloc}
                                onChange={(e) =>
                                  updateAdaptiveAsset(
                                    index,
                                    "alloc",
                                    e.target.value,
                                  )
                                }
                                className="bg-surface text-sm p-2 border border-border rounded-l-md outline-none focus:border-pv-blue transition-colors w-full box-border text-text font-bold"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-2 py-2 text-xs text-text shrink-0 select-none">
                                %
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <button
                              onClick={() =>
                                setAdaptivePortfolioAssets(
                                  adaptivePortfolioAssets.filter(
                                    (_, i) => i !== index,
                                  ),
                                )
                              }
                              className="text-text hover:text-red transition-colors p-1 rounded-xl hover:bg-surface-3"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-surface-2 border-t border-border border-dashed font-sans">
                  <button
                    onClick={() =>
                      setAdaptivePortfolioAssets([
                        ...adaptivePortfolioAssets,
                        { symbol: "", alloc: "" },
                      ])
                    }
                    className="text-xs font-bold text-pv-blue hover:underline"
                  >
                    + Add more assets
                  </button>
                </div>
              </div>
            </>
          )}

          {(activeTab === "mom_relative" || activeTab === "mom_dual") && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-xs font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {"Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <TooltipLabel
                      label={"Tickers"}
                      tooltip={"List of asset symbols (tickers) to analyze."}
                    />
                    <input
                      type="text"
                      value={relativeTickers}
                      onChange={(e) => setRelativeTickers(e.target.value)}
                      placeholder="Ticker symbols (comma separated)..."
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Single absolute momentum"}
                      tooltip={
                        "Apply a single absolute momentum filter to the entire portfolio."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Out of Market Asset"}
                      tooltip={
                        "Safe haven asset to invest in when the signal is to exit the main market."
                      }
                    />
                    <select
                      defaultValue="Cash"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option>Cash</option>
                      <option>BIL (1-3 Month T-Bill)</option>
                      <option>SHV (Short Term Treasuries)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Performance Periods"}
                      tooltip={
                        "Calculate momentum over one or more performance periods."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Single Period</option>
                      <option>Multiple Periods</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Lookback Period"}
                      tooltip={
                        "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>12 months</option>
                      <option>6 months</option>
                      <option>3 months</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Exclude Previous Month"}
                      tooltip={
                        "Excludes the most recent month in momentum calculation to avoid short-term stock market mean reversion."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Assets to hold"}
                      tooltip={
                        "The maximum number of assets to hold simultaneously in the portfolio."
                      }
                    />
                    <input
                      type="number"
                      defaultValue="1"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Allocation Weights"}
                      tooltip={
                        "The method to distribute capital (equal weight, risk parity, inverse volatility)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Equal Weight</option>
                      <option>Inverse Volatility</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Stop Loss"}
                      tooltip={
                        "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No stop-loss</option>
                      <option>Trailing stop-loss</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trading Frequency"}
                      tooltip={
                        "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Monthly</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trade Execution"}
                      tooltip={
                        "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Trade at end of month price</option>
                      <option>Trade at next month open</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Leverage Type"}
                      tooltip={
                        "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>None</option>
                      <option>Margin</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "mom_adaptive" && (
            <>
              <div className="bg-surface rounded-[2rem] shadow-sm border border-border p-6 flex flex-col gap-6 text-left mb-6">
                <h3 className="text-xs font-semibold text-text flex items-center gap-2 mb-2">
                  <Settings size={14} className="text-pv-blue" /> {"Parameters"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <TooltipLabel
                      label={"Tickers"}
                      tooltip={"List of asset symbols (tickers) to analyze."}
                    />
                    <input
                      type="text"
                      value={adaptiveTickers}
                      onChange={(e) => setAdaptiveTickers(e.target.value)}
                      placeholder="Ticker symbols (comma separated)..."
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Performance Periods"}
                      tooltip={
                        "Calculate momentum over one or more performance periods."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Single Period</option>
                      <option>Multiple Periods</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Lookback Period"}
                      tooltip={
                        "The past observation period to calculate signals (e.g. 10 months, 200 days)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>12 months</option>
                      <option>6 months</option>
                      <option>3 months</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Exclude Previous Month"}
                      tooltip={
                        "Excludes the most recent month in momentum calculation to avoid short-term stock market mean reversion."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Volatility Period"}
                      tooltip={
                        "Observation period to estimate recent historical volatility."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>1 month</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Assets to hold"}
                      tooltip={
                        "The maximum number of assets to hold simultaneously in the portfolio."
                      }
                    />
                    <input
                      type="number"
                      defaultValue="2"
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Allocation Weights"}
                      tooltip={
                        "The method to distribute capital (equal weight, risk parity, inverse volatility)."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Risk Parity</option>
                      <option>Minimum Variance</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Stop Loss"}
                      tooltip={
                        "Maximum drawdown level tolerated before automatic liquidation of a position."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>No stop-loss</option>
                      <option>Trailing stop-loss</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trading Frequency"}
                      tooltip={
                        "How often the strategy checks its signals to potentially readjust positions."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Monthly</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Trade Execution"}
                      tooltip={
                        "Determines if the trade is executed at the closing price or at the opening of the next period."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>Trade at end of month price</option>
                      <option>Trade at next month open</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <TooltipLabel
                      label={"Leverage Type"}
                      tooltip={
                        "Use of leverage or margin to increase exposure."
                      }
                    />
                    <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors">
                      <option>None</option>
                      <option>Margin</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="py-3 px-8 bg-pv-blue text-white rounded-[1.5rem] text-sm font-semibold hover:bg-pv-blue-l transition-colors shadow-lg shadow-pv-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} fill="currentColor" />{" "}
              {isRunning ? "Running..." : "Run Backtest"}
            </button>
          </div>
        </div>
        <div id="bt-results-anchor" className="h-4"></div>

        {(!results || results.length === 0) && (
          <div className="h-full min-h-[500px] border border-border/30 rounded-[2rem] relative overflow-hidden bg-surface-2/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90"></div>
          </div>
        )}

        {results && results.length > 0 && (
          <div
            id="report-content"
            className="space-y-12 pb-24 transition-all duration-700 bg-surface-2 pt-12 border-t border-border mt-12"
          >
            <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 text-sm text-text font-sans">
              {/* Header info */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border pb-12">
                <div className="space-y-2">
                  <p className="text-text font-medium italic text-left">
                    {t("pb.simSpan")} {results[0].yearsInteger[0]} {t("pb.to")}{" "}
                    {
                      results[0].yearsInteger[
                        results[0].yearsInteger.length - 1
                      ]
                    }
                  </p>
                  {results.some((r) => r.warnings && r.warnings.length > 0) && (
                    <div className="flex flex-col gap-1 mt-4 text-gold bg-surface-3 px-4 py-2.5 rounded-[2rem] text-sm font-semibold border border-gold/50 text-left">
                      {results
                        .flatMap((r) => r.warnings || [])
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((w, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-surface-3 shrink-0"></div>
                            <span>{w}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="text-sm font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                  >
                    Modifier la configuration
                  </button>
                  <button
                    onClick={() => {
                      results.forEach((r) =>
                        downloadCSV(
                          r.dates.map((d, idx) => ({
                            Date: d,
                            Balance: r.balances[idx].toFixed(2),
                            Drawdown: r.drawdowns[idx].toFixed(2) + "%",
                          })),
                          `portfolio_${r.name.replace(/\s+/g, "_")}_monthly`,
                        ),
                      );
                    }}
                    className="text-sm font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                  >
                    {t("pb.export")}
                  </button>
                </div>
              </div>

              {/* Portfolio Summaries (Charts + Metrics) */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    {t("pb.portSummaries")}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans border-collapse">
                    <thead>
                      <tr className="bg-surface-2 border-b border-border">
                        <th className="px-6 py-4 text-left font-semibold text-text">
                          Portfolio
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Allocation
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Initial
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Final
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          CAGR
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {t("pb.vol")}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          {t("pb.maxDd")}
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Sharpe
                        </th>
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Sortino
                        </th>
                        {results.some((r) => r.metrics.alpha !== undefined) && (
                          <th className="px-4 py-4 text-center font-medium text-text">
                            Alpha
                          </th>
                        )}
                        {results.some((r) => r.metrics.beta !== undefined) && (
                          <th className="px-4 py-4 text-center font-medium text-text">
                            Beta
                          </th>
                        )}
                        <th className="px-4 py-4 text-center font-medium text-text">
                          Best / Worst
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.map((r, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-surface-2/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: r.color }}
                              ></div>
                              <div>
                                <div className="font-semibold text-text">
                                  {r.name}
                                </div>
                                <div className="text-xs text-text-4">
                                  Depuis {r.startYear}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center relative max-w-[200px]">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {Object.entries(r.alloc)
                                .slice(0, 3)
                                .map(([sym, w]) => (
                                  <span
                                    key={sym}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-medium"
                                  >
                                    {sym} {String(w)}%
                                  </span>
                                ))}
                              {Object.keys(r.alloc).length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-medium">
                                  +{Object.keys(r.alloc).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-text tabular-nums text-sm">
                            $
                            {r.initialAmount.toLocaleString("fr-FR", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-text tabular-nums text-sm">
                            $
                            {r.endBalance.toLocaleString("fr-FR", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-4 text-center font-semibold tabular-nums text-sm",
                              r.cagr >= 0 ? "text-green" : "text-red",
                            )}
                          >
                            {r.cagr >= 0 ? "+" : ""}
                            {r.cagr.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center text-text tabular-nums text-sm">
                            {r.stdev.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-red tabular-nums text-sm">
                            -{Math.abs(r.maxDrawdown).toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-sm font-medium text-text">
                            {r.sharpe.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-sm font-medium text-text">
                            {r.sortino.toFixed(2)}
                          </td>
                          {results.some(
                            (r) => r.metrics.alpha !== undefined,
                          ) && (
                            <td
                              className={cn(
                                "px-4 py-4 text-center tabular-nums text-sm font-medium",
                                r.metrics.alpha !== undefined &&
                                  r.metrics.alpha >= 0
                                  ? "text-green"
                                  : "text-red",
                              )}
                            >
                              {r.metrics.alpha !== undefined
                                ? (r.metrics.alpha >= 0 ? "+" : "") +
                                  (r.metrics.alpha * 100).toFixed(2) +
                                  "%"
                                : "-"}
                            </td>
                          )}
                          {results.some(
                            (r) => r.metrics.beta !== undefined,
                          ) && (
                            <td className="px-4 py-4 text-center text-text tabular-nums text-sm">
                              {r.metrics.beta !== undefined
                                ? r.metrics.beta.toFixed(2)
                                : "-"}
                            </td>
                          )}
                          <td className="px-4 py-4 text-center tabular-nums text-sm whitespace-nowrap">
                            <span
                              className={cn(
                                "font-medium",
                                r.bestYear >= 0 ? "text-green" : "text-red",
                              )}
                            >
                              {r.bestYear >= 0 ? "+" : ""}
                              {r.bestYear.toFixed(2)}%
                            </span>
                            <span className="text-text-4 mx-1.5">/</span>
                            <span
                              className={cn(
                                "font-medium",
                                r.worstYear >= 0 ? "text-green" : "text-red",
                              )}
                            >
                              {r.worstYear > 0 ? "+" : ""}
                              {r.worstYear.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Portfolio Growth Graph */}
              <div className="bg-surface border border-border rounded-3xl mb-8 text-left shadow-sm">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-2">
                  <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pv-blue animate-pulse"></span>
                    Cumulative Wealth Growth
                  </h3>
                </div>
                <div className="p-8">
                  <div className="h-[400px]">
                    <Line
                      data={{
                        labels: results[0].dates,
                        datasets: results.map((r) => ({
                          label: r.name,
                          data: r.balances,
                          borderColor: r.color,
                          backgroundColor: r.color + "05",
                          borderWidth: 3,
                          pointRadius: 0,
                          pointHoverRadius: 5,
                          pointHoverBackgroundColor: r.color,
                          pointHoverBorderColor: "#ffffff",
                          pointHoverBorderWidth: 2,
                          tension: 0.15,
                          fill: false,
                        })),
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: "index", intersect: false },
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              usePointStyle: true,
                              pointStyle: "rectRounded",
                              boxWidth: 12,
                              boxHeight: 12,
                              padding: 24,
                              font: {
                                family: "sans-serif",
                                size: 13,
                                weight: "bold",
                              },
                              color: "#334155",
                            },
                          },
                          tooltip: {
                            backgroundColor: "#0f172a",
                            titleColor: "#94a3b8",
                            bodyColor: "#f8fafc",
                            borderColor: "#1e293b",
                            borderWidth: 1,
                            padding: 14,
                            cornerRadius: 8,
                            displayColors: true,
                            boxPadding: 6,
                            usePointStyle: true,
                            callbacks: {
                              label: (context) => {
                                let label = context.dataset.label || "";
                                if (label) label += ": ";
                                if (context.parsed.y !== null) {
                                  label += new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  }).format(context.parsed.y);
                                }
                                return label;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: {
                              font: { family: "sans-serif", size: 10 },
                              color: "#64748b",
                              maxTicksLimit: 52,
                            },
                          },
                          y: {
                            ticks: {
                              callback: (v) =>
                                "$" + Number(v).toLocaleString("fr-FR"),
                              font: { family: "sans-serif", size: 10 },
                              color: "#64748b",
                            },
                            grid: { color: "#f1f5f9" },
                            border: { display: false, dash: [4, 4] },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-12 mb-8 text-left">
                {/* Annual Returns Bar Chart */}
                <div className="bg-surface border border-border rounded-3xl shadow-sm">
                  <div className="px-8 py-6 border-b border-border bg-surface-2">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Annual Returns Comparison
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="h-[500px]">
                      <Bar
                        data={{
                          labels: results[0].yearsInteger,
                          datasets: results.map((r, i) => ({
                            label: r.name,
                            data: r.annualReturns,
                            backgroundColor: r.annualReturns.map((val) =>
                              val >= 0 ? r.color : "#e11d48",
                            ),
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: "rgba(0,0,0,0.1)",
                            barPercentage: 0.85,
                            categoryPercentage: 0.9,
                          })),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                pointStyle: "rectRounded",
                                boxWidth: 12,
                                boxHeight: 12,
                                padding: 24,
                                font: {
                                  family: "sans-serif",
                                  size: 13,
                                  weight: "bold",
                                },
                                color: "#334155",
                              },
                            },
                            tooltip: {
                              backgroundColor: "#0f172a",
                              titleColor: "#94a3b8",
                              bodyColor: "#f8fafc",
                              borderColor: "#1e293b",
                              borderWidth: 1,
                              padding: 14,
                              cornerRadius: 8,
                              displayColors: true,
                              boxPadding: 6,
                              usePointStyle: true,
                              callbacks: {
                                label: (context) => {
                                  let label = context.dataset.label || "";
                                  if (label) label += ": ";
                                  if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2) + "%";
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              border: { display: false },
                              ticks: {
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                            },
                            y: {
                              ticks: {
                                callback: (v) => v + "%",
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                              grid: { color: "#f1f5f9" },
                              border: { display: false, dash: [4, 4] },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Drawdowns Chart */}
                <div className="bg-surface border border-border rounded-3xl shadow-sm">
                  <div className="px-8 py-6 border-b border-border bg-surface-2">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      Portfolio Drawdowns
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="h-[500px]">
                      <Line
                        data={{
                          labels: results[0].dates,
                          datasets: results.map((r, dIdx) => ({
                            label: r.name,
                            data: r.drawdowns,
                            borderColor: r.color,
                            backgroundColor: r.color + "08",
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            borderWidth: 1,
                            tension: 0.15,
                          })),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: "index", intersect: false },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                pointStyle: "rectRounded",
                                boxWidth: 12,
                                boxHeight: 12,
                                padding: 24,
                                font: {
                                  family: "sans-serif",
                                  size: 13,
                                  weight: "bold",
                                },
                                color: "#334155",
                              },
                            },
                            tooltip: {
                              backgroundColor: "#0f172a",
                              titleColor: "#94a3b8",
                              bodyColor: "#f8fafc",
                              borderColor: "#1e293b",
                              borderWidth: 1,
                              padding: 14,
                              cornerRadius: 8,
                              displayColors: true,
                              boxPadding: 6,
                              usePointStyle: true,
                              callbacks: {
                                label: (context) => {
                                  let label = context.dataset.label || "";
                                  if (label) label += ": ";
                                  if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2) + "%";
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              border: { display: false },
                              ticks: {
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                                maxTicksLimit: 52,
                              },
                            },
                            y: {
                              max: 0,
                              ticks: {
                                callback: (v) => v + "%",
                                font: { family: "sans-serif", size: 10 },
                                color: "#64748b",
                              },
                              grid: { color: "#f1f5f9" },
                              border: { display: false, dash: [4, 4] },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trailing Returns Table */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    Trailing Returns
                  </h3>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-sm border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          Portfolio
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          1 Year
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          3 Years (Ann.)
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          5 Years (Ann.)
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          10 Years (Ann.)
                        </th>
                        <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          Full Period
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const calcPeriod = (yearsAgo: number) => {
                          const len = r.annualReturns.length;
                          if (len < yearsAgo) return null;
                          const sub = r.annualReturns.slice(-yearsAgo);
                          let prod = 1;
                          sub.forEach((x) => (prod *= 1 + x / 100));
                          return (Math.pow(prod, 1 / yearsAgo) - 1) * 100;
                        };
                        return (
                          <tr
                            key={i}
                            className="border-b border-border hover:bg-surface-2 transition-colors"
                          >
                            <td className="text-left py-4 px-4 font-medium flex items-center gap-3 whitespace-nowrap text-text">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0 "
                                style={{ backgroundColor: r.color }}
                              ></div>
                              {r.name}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {r.annualReturns[
                                r.annualReturns.length - 1
                              ]?.toFixed(2) || "N/A"}
                              %
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(3)?.toFixed(2) || "N/A"}
                              {calcPeriod(3) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(5)?.toFixed(2) || "N/A"}
                              {calcPeriod(5) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-medium tabular-nums">
                              {calcPeriod(10)?.toFixed(2) || "N/A"}
                              {calcPeriod(10) ? "%" : ""}
                            </td>
                            <td className="text-right py-4 px-4 whitespace-nowrap font-semibold tabular-nums text-green">
                              {r.cagr.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annual Returns Table */}
              <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 text-left">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text tracking-tight">
                    Annual Returns Detail
                  </h3>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-sm border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                          Year
                        </th>
                        {results.map((r, i) => (
                          <th
                            key={i}
                            className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap"
                          >
                            {r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...results[0].yearsInteger]
                        .reverse()
                        .map((year, yearIndex) => {
                          const actualIdx =
                            results[0].yearsInteger.length - 1 - yearIndex;
                          return (
                            <tr
                              key={actualIdx}
                              className="border-b border-border hover:bg-surface-2 transition-colors"
                            >
                              <td className="text-left py-3 px-4 font-semibold text-text">
                                {year}
                              </td>
                              {results.map((r, i) => {
                                const val = r.annualReturns[actualIdx];
                                return (
                                  <td
                                    key={i}
                                    className={`text-right py-3 px-4 whitespace-nowrap font-medium tabular-nums ${val < 0 ? "text-red" : "text-green"}`}
                                  >
                                    {val !== undefined
                                      ? (val > 0 ? "+" : "") +
                                        val.toFixed(2) +
                                        "%"
                                      : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical Stress Scenarios Table */}
              <div className="bg-surface border border-border rounded-3xl shadow-md mb-12 border-2 border-border text-left">
                <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-surface-2">
                  <h3 className="text-sm font-semibold text-text ">
                    Market Stress Audits
                  </h3>
                </div>
                <div className="overflow-x-auto p-10">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left font-semibold text-text py-5 px-6 text-xs whitespace-nowrap">
                          Stress Period
                        </th>
                        <th className="text-left font-semibold text-text py-5 px-6 text-xs whitespace-nowrap">
                          Timeline
                        </th>
                        {results.map((r, i) => (
                          <th
                            key={i}
                            className="text-right font-semibold text-text py-5 px-6 text-xs whitespace-nowrap"
                          >
                            {r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Dotcom Tech Crash", start: 2000, end: 2002 },
                        {
                          name: "Global Financial Crisis",
                          start: 2008,
                          end: 2008,
                        },
                        {
                          name: "COVID-19 Pandemic Shock",
                          start: 2020,
                          end: 2020,
                        },
                        {
                          name: "Inflation Spike & Global Tightening",
                          start: 2022,
                          end: 2022,
                        },
                      ].map((event, ei) => (
                        <tr
                          key={ei}
                          className="border-b border-border hover:bg-pv-blue/5 transition-all font-sans group"
                        >
                          <td className="py-6 px-6 font-bold text-text whitespace-nowrap text-left text-xs tracking-tight">
                            {event.name}
                          </td>
                          <td className="py-6 px-6 text-text whitespace-nowrap text-left font-mono tabular-nums">
                            {event.start === event.end
                              ? event.start
                              : `${event.start} - ${event.end}`}
                          </td>
                          {results.map((r, i) => {
                            const sub = r.annualReturns.filter(
                              (_, idx) =>
                                r.yearsInteger[idx] >= event.start &&
                                r.yearsInteger[idx] <= event.end,
                            );
                            if (!sub.length)
                              return (
                                <td
                                  key={i}
                                  className="py-6 px-6 text-right text-text font-bold italic text-xs font-mono"
                                >
                                  OUTSIDE SCOPE
                                </td>
                              );
                            let prod = 1;
                            sub.forEach((x) => (prod *= 1 + x / 100));
                            const ret = (prod - 1) * 100;
                            return (
                              <td
                                key={i}
                                className={`py-6 px-6 whitespace-nowrap font-bold text-base text-right tabular-nums tracking-tighter font-mono ${ret < 0 ? "text-red" : "text-green"}`}
                              >
                                {ret > 0 ? "+" : ""}
                                {ret.toFixed(2)}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabbed Detailed Analysis Container */}
              <div className="bg-surface border border-border rounded-3xl p-8 space-y-6 text-left">
                <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem]">
                  {results.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveResIdx(idx)}
                      className={cn(
                        "px-6 py-3 text-xs font-semibold whitespace-nowrap transition-all rounded-[1.5rem]",
                        activeResIdx === idx
                          ? "bg-pv-blue text-white shadow-md font-extrabold"
                          : "text-text hover:text-text hover:bg-surface-3",
                      )}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                {results[activeResIdx] && (
                  <div
                    key={`details-${results[activeResIdx].id}`}
                    className="space-y-12"
                  >
                    <div className="flex flex-col xl:flex-row gap-12 items-start">
                      <div className="flex-1 w-full xl:w-2/3 overflow-x-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xs font-semibold flex items-center gap-2 text-text">
                            <Activity size={14} /> Heatmap Mensuelle
                          </h3>
                        </div>
                        <ReturnsHeatmap
                          monthlyReturns={results[activeResIdx].monthlyReturns}
                        />
                      </div>
                      <div className="w-full xl:w-1/3 shrink-0">
                        <h3 className="text-xs font-semibold mb-6 flex items-center gap-2 text-text">
                          <Activity size={14} /> Asset Allocation
                        </h3>
                        <div className="bg-[#0f172a] rounded-[2rem] p-8 shadow-2xl border border-surface-3">
                          <EliteDonut
                            assets={results[activeResIdx].assets || []}
                            allocations={results[activeResIdx].alloc || {}}
                            title="Asset Allocation Details"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <PortfolioAnalysisExplication results={results} />

              <div className="mt-8 mb-4 text-center text-[10px] text-black">
                Ce site est gratuit et sans publicité. Si vous appréciez nos outils d'analyse et de backtesting, vous pouvez soutenir notre travail par une donation.{" "}
                <a 
                  href="/donate" 
                  className="inline-block ml-1 px-1.5 py-0.5 border border-blue-500 text-blue-600 rounded text-[9px] hover:bg-blue-50 font-semibold"
                >
                  Faire un don
                </a>
              </div>
            </div>
          </div>
        )}
        </MobileZoomWrapper>

        <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-12 pt-6 text-center text-[11px] text-text-4 border-t border-border/40 mt-8 font-sans">
          Avertissement : Les performances passées ne préjugent pas des performances futures. Les outils et analyses de Quantrih se basent exclusivement sur des données historiques du passé. L'investissement comporte des risques de perte en capital.
        </div>
      </div>
    </div>
  );
}
