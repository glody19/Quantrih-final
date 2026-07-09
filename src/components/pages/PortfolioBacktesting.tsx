import React, { useState, useMemo, useEffect } from "react";
import {
  Play,
  Activity,
  FolderOpen,
  TrendingDown,
  Settings,
  HelpCircle,
  FileDown,
  Info,
  Search,
  Trash2,
  BarChart3,
  Database,
} from "lucide-react";
import { Line, Doughnut, Bar, Pie } from "react-chartjs-2";
import { EliteDonut } from "../ui/EliteDonut";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { generatePDFReport } from "../../lib/pdfGenerator";
import { calculateRollingReturns } from "../../engine/metrics";
import { runMonteCarlo } from "../../engine/monte-carlo";
import { downloadCSV } from "../../utils/export";

import { ReturnsHeatmap } from "../ui/ReturnsHeatmap";
import { RollingReturnsTable } from "../ui/RollingReturnsTable";
import { CorrelationMatrix } from "../ui/CorrelationMatrix";
import { EfficientFrontier } from "../ui/EfficientFrontier";
import { TickerInput } from "../ui/TickerInput";
import { InfoTooltip } from "../ui/InfoTooltip";
import { ASSET_DATA } from "../../constants";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
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
      <label className={cn("text-xs font-semibold text-text ", className)}>
        {label}
      </label>
      <InfoTooltip content={<>{tooltip}</>} />
    </div>
  );
}

interface PortfolioResult {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  initialAmount: number;
  totalContributions?: number;
  endBalance: number;
  cagr: number;
  irr?: number;
  stdev: number;
  bestYear: number;
  worstYear: number;
  maxDrawdown: number;
  sharpe: number;
  sortino: number;
  balances: number[];
  drawdowns: number[];
  monthlyReturns: { date: string; value: number }[];
  rolling1Y?: {
    average: number;
    best: number;
    worst: number;
    count: number;
  } | null;
  rolling3Y?: {
    average: number;
    best: number;
    worst: number;
    count: number;
  } | null;
  rolling5Y?: {
    average: number;
    best: number;
    worst: number;
    count: number;
  } | null;
  rolling10Y?: {
    average: number;
    best: number;
    worst: number;
    count: number;
  } | null;
  years: number[];
  dates: string[];
  assets?: { symbol: string; returns: number[] }[];
  metrics: {
    correlationMatrix?: Record<string, Record<string, number>> | null;
    monteCarlo?: {
      paths: number[][];
      percentiles: Record<number, number[]>;
      probabilities: {
        endingAboveInitial: number;
        hittingZero: number;
      };
    } | null;
    alpha?: number;
    beta?: number;
    trackingError?: number;
    informationRatio?: number;
    upCapture?: number;
    downCapture?: number;
  };
  monteCarlo?: any; // Legacy compatibility for data flow
  holdingsHistory: Record<string, number>[];
  warnings?: string[];
  yearsInteger: number[];
  annualReturns: number[];
  color: string;
  alloc: Record<string, number>;
}

import { PortfolioAnalysisExplication } from "./PortfolioAnalysisExplication";

export function PortfolioBacktesting({
  baseCcy = "EUR",
  setBaseCcy,
}: {
  baseCcy?: string;
  setBaseCcy?: (c: string) => void;
}) {
  const { t, language } = useTranslation();
  const [portfolioNames, setPortfolioNames] = useState<
    { id: string; name: string }[]
  >([
    { id: "1", name: "Classic (60/40)" },
    { id: "2", name: "Dynamic (80/20)" },
    { id: "3", name: "100% Equities" },
    { id: "4", name: "Conservative (40/60)" },
    { id: "5", name: "Permanent (Harry Browne)" },
  ]);
  const [portfolioAssets, setPortfolioAssets] = useState<{ symbol: string; weights: string[] }[]>([
    { symbol: "VFINX", weights: ["60", "80", "100", "40", "25"] },
    { symbol: "VBMFX", weights: ["40", "20", "0", "60", "25"] },
    { symbol: "GLD", weights: ["0", "0", "0", "0", "25"] },
    { symbol: "BIL", weights: ["0", "0", "0", "0", "25"] },
    { symbol: "VGSIX", weights: ["0", "0", "0", "0", "0"] },
  ]);

  const portfolios = portfolioNames.map((pn, i) => ({
    id: pn.id,
    name: pn.name,
    assets: portfolioAssets
      .filter(
        (a) =>
          a.weights[i] && Number(a.weights[i]) > 0 && a.symbol.trim() !== "",
      )
      .map((a) => ({
        symbol: a.symbol.toUpperCase(),
        weight: Number(a.weights[i] || 0),
      })),
  }));
  const [initialAmount, setInitialAmount] = useState(10000);
  const [startMonthInput, setStartMonthInput] = useState("01");
  const [startYearInput, setStartYearInput] = useState("2000");
  const [endMonthInput, setEndMonthInput] = useState("12");
  const [endYearInput, setEndYearInput] = useState(
    new Date().getFullYear().toString(),
  );
  const [rebalancing, setRebalancing] = useState("annual");
  const [rebalancingBands, setRebalancingBands] = useState("none"); // absolute_5 / relative_25

  const [cashflowType, setCashflowType] = useState("none");
  const [cashflowAmount, setCashflowAmount] = useState(0);
  const [cashflowFreq, setCashflowFreq] = useState("monthly");
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  const [baseCurrency, setBaseCurrencyLocal] = useState(baseCcy);
  const handleCurrencyChange = (c: string) => {
    setBaseCurrencyLocal(c);
    if (setBaseCcy) setBaseCcy(c);
  };
  const [applyEUTaxes, setApplyEUTaxes] = useState(true);

  // Market Conditions
  const [broker, setBroker] = useState("free");
  const [customFee, setCustomFee] = useState(1.5);
  const [slippage, setSlippage] = useState(0.05); // 0.05%
  const [dividendHandling, setDividendHandling] = useState("reinvest"); // reinvest or distribute
  const [includeBenchmark, setIncludeBenchmark] = useState(true);
  const [benchmarkSymbol, setBenchmarkSymbol] = useState("SPY");

  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PortfolioResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeResIdx, setActiveResIdx] = useState(0);

  const exportToCSV = (result: PortfolioResult) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Balance,Drawdown%\n";

    result.dates.forEach((date, i) => {
      csvContent += `${date},${result.balances[i]},${result.drawdowns[i]}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${result.name.replace(/\s+/g, "_")}_Backtest.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addPortfolio = () => {
    if (portfolioNames.length >= 6) return;
    const newId = Date.now().toString();
    setPortfolioNames([
      ...portfolioNames,
      { id: newId, name: `Portfolio ${portfolioNames.length + 1}` },
    ]);
    setPortfolioAssets(
      portfolioAssets.map((a) => ({ ...a, weights: [...a.weights, ""] })),
    );
  };

  const removePortfolio = (idx: number) => {
    setPortfolioNames(portfolioNames.filter((_, i) => i !== idx));
    setPortfolioAssets(
      portfolioAssets.map((a) => ({
        ...a,
        weights: a.weights.filter((_, i) => i !== idx),
      })),
    );
  };

  const updatePortfolioName = (idx: number, name: string) => {
    const newNames = [...portfolioNames];
    newNames[idx].name = name;
    setPortfolioNames(newNames);
  };

  const addAsset = () => {
    setPortfolioAssets([
      ...portfolioAssets,
      { symbol: "", weights: portfolioNames.map(() => "") },
    ]);
  };

  const removeAssetRow = (idx: number) => {
    setPortfolioAssets(portfolioAssets.filter((_, i) => i !== idx));
  };

  const updateAssetSymbol = (idx: number, symbol: string) => {
    const newAssets = [...portfolioAssets];
    newAssets[idx].symbol = symbol;
    setPortfolioAssets(newAssets);
  };

  const updateAssetWeight = (
    assetIdx: number,
    portIdx: number,
    value: string,
  ) => {
    const newAssets = [...portfolioAssets];
    newAssets[assetIdx].weights[portIdx] = value;
    setPortfolioAssets(newAssets);
  };

  useEffect(() => {
    // Check for handoff from other pages
    const handoff = localStorage.getItem("quantrih_backtest_handoff");
    if (handoff) {
      try {
        const ports = JSON.parse(handoff);
        const newNames = ports.map((p: any, i: number) => ({
          id: String(i + 1),
          name: p.name,
        }));

        const allSymbols = new Set<string>();
        ports.forEach((p: any) =>
          p.assets.forEach((a: any) => allSymbols.add(a.symbol.toUpperCase())),
        );

        const newAssets = Array.from(allSymbols).map((sym) => {
          const weights = ports.map((p: any) => {
            const found = p.assets.find(
              (a: any) => a.symbol.toUpperCase() === sym,
            );
            return found ? String(found.weight) : "";
          });
          return { symbol: sym, weights };
        });

        // Add 1 empty row just in case
        newAssets.push({ symbol: "", weights: ports.map(() => "") });

        setPortfolioNames(newNames);
        setPortfolioAssets(newAssets);
        localStorage.removeItem("quantrih_backtest_handoff");
      } catch (e) {
        console.warn("Failed to parse backtest handoff:", e);
      }
    }
  }, []);

  const runBacktest = async () => {
    setError(null);
    setIsRunning(true);
    setHasRun(false);
    try {
      const { runBacktest: engineRunBacktest } = await import("../../engine");

      const activePortfolios = portfolios.filter(
        (p) => p.assets.reduce((sum, a) => sum + Number(a.weight), 0) > 0,
      );

      if (activePortfolios.length === 0) {
        throw new Error("Please configure at least one active portfolio.");
      }

      for (const portfolio of activePortfolios) {
        const totalWeight = portfolio.assets.reduce(
          (sum, a) => sum + Number(a.weight),
          0,
        );
        if (Math.abs(totalWeight - 100) > 0.1) {
          throw new Error(`Weights for ${portfolio.name} must sum to 100%.`);
        }
      }

      const enginePortfolios = activePortfolios.map((p) => ({
        id: p.id,
        name: p.name,
        allocations: p.assets.map((a) => ({
          symbol: a.symbol.toUpperCase(),
          weight: Number(a.weight) / 100,
        })),
      }));

      // Benchmarking
      if (includeBenchmark) {
        enginePortfolios.push({
          id: "benchmark",
          name: `Benchmark (${benchmarkSymbol})`,
          allocations: [{ symbol: benchmarkSymbol.toUpperCase(), weight: 1.0 }],
        });
      }

      // Parse start and end dates from inputs
      const parsedStart =
        startYearInput === "oldest"
          ? "1900-01-01"
          : `${startYearInput}-${startMonthInput}-01`;
      const parsedEnd = `${endYearInput}-${endMonthInput}-28`;

      const engineOptions = {
        initialBalance: initialAmount,
        startDate: parsedStart,
        endDate: parsedEnd,
        rebalanceFrequency:
          rebalancing === "annual"
            ? "annually"
            : rebalancing === "monthly"
              ? "monthly"
              : rebalancing === "quarterly"
                ? "quarterly"
                : ("none" as "annually" | "monthly" | "quarterly" | "none"),
        rebalanceThreshold:
          rebalancingBands === "absolute_5"
            ? 0.05
            : rebalancingBands === "absolute_10"
              ? 0.1
              : undefined,
        cashflowAmount:
          cashflowType === "none"
            ? 0
            : cashflowType === "contribute"
              ? cashflowAmount
              : -cashflowAmount,
        cashflowFrequency: cashflowFreq as "monthly" | "annually" | "none",
        inflationAdjusted,
        benchmarkId: includeBenchmark ? "benchmark" : undefined,
        transactionFeeAmount: broker === "custom" ? customFee : 0,
      };

      const res = await engineRunBacktest(enginePortfolios, engineOptions);

      const newResults: PortfolioResult[] = res.map((r, i) => {
        const isBenchmark = r.portfolioId === "benchmark";
        const port = isBenchmark
          ? { name: `Benchmark (${benchmarkSymbol})`, assets: [] }
          : portfolios.find((p) => p.id === r.portfolioId)!;
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
        if (isBenchmark) {
          alloc[benchmarkSymbol.toUpperCase()] = 100;
        } else {
          port.assets.forEach((a) => {
            if (a.symbol) {
              alloc[a.symbol.toUpperCase()] = Number(a.weight);
            }
          });
        }

        return {
          id: r.portfolioId,
          name: port.name,
          startYear: startY,
          endYear: endY,
          initialAmount: initialAmount,
          totalContributions: r.metrics.totalContributions,
          endBalance: r.metrics.endBalance,
          cagr: r.metrics.cagr * 100,
          irr: r.metrics.irr ? r.metrics.irr * 100 : undefined,
          stdev: r.metrics.volatility * 100,
          bestYear: r.metrics.bestYear * 100,
          worstYear: r.metrics.worstYear * 100,
          maxDrawdown: -r.metrics.maxDrawdown * 100, // Make drawdown negative to match old format
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

      setResults(newResults);
      setHasRun(true);
    } catch (err: any) {
      console.warn(err);
      setError(err.message || "An error occurred during backtesting.");
    } finally {
      setIsRunning(false);
    }
  };

  const chartData = useMemo(() => {
    if (results.length === 0) return { labels: [], datasets: [] };

    // Find all unique dates across all results
    const uniqueDates = new Set<string>();
    results.forEach((r) => r.dates.forEach((d) => uniqueDates.add(d)));

    // Sort chronologically
    const sortedDates = Array.from(uniqueDates).sort();

    const colors = ["#2c6cad", "#eab308", "#ef4444", "#10b981", "#8b5cf6"];

    return {
      labels: sortedDates,
      datasets: results.map((r, i) => {
        // Pad data to match global labels
        const data = sortedDates.map((dateStr) => {
          const idx = r.dates.indexOf(dateStr);
          return idx !== -1 ? r.balances[idx] : null;
        });

        return {
          label: r.name,
          data,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length],
          tension: 0.1,
          borderWidth: 2,
          spanGaps: true,
        };
      }),
    };
  }, [results]);

  const drawdownData = useMemo(() => {
    if (results.length === 0) return { labels: [], datasets: [] };

    const uniqueDates = new Set<string>();
    results.forEach((r) => r.dates.forEach((d) => uniqueDates.add(d)));
    const sortedDates = Array.from(uniqueDates).sort();

    const colors = ["#2c6cad", "#eab308", "#ef4444", "#10b981", "#8b5cf6"];
    const bgColors = [
      "rgba(44, 108, 173, 0.2)",
      "rgba(234, 179, 8, 0.2)",
      "rgba(239, 68, 68, 0.2)",
      "rgba(16, 185, 129, 0.2)",
      "rgba(139, 92, 246, 0.2)",
    ];

    return {
      labels: sortedDates,
      datasets: results.map((r, i) => {
        const data = sortedDates.map((dateStr) => {
          const idx = r.dates.indexOf(dateStr);
          return idx !== -1 ? r.drawdowns[idx] : null;
        });

        return {
          label: r.name,
          data,
          borderColor: colors[i % colors.length],
          backgroundColor: bgColors[i % bgColors.length],
          fill: true,
          borderWidth: 1,
          spanGaps: true,
        };
      }),
    };
  }, [results]);

  const formatEnNum = (num: number, minDecimals: number = 2) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace(/,/g, " ");
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-24">
        {hasRun && results.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() =>
                generatePDFReport(
                  "report-content",
                  "Portfolio_Backtest_Report",
                  setIsExporting,
                )
              }
              disabled={isExporting}
              className="flex items-center gap-2 bg-surface-3 hover:bg-pv-blue border border-border hover:border-pv-blue text-text px-5 py-2.5 rounded-[1.5rem] font-bold text-xs transition-all disabled:opacity-50 shadow-md"
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

        <div className="flex flex-col gap-8">
          {/* TITLE HEADER */}
          <div className="mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
              <h1 className="text-2xl font-bold text-pv-blue tracking-tight">
                {t("backtest.title")}
              </h1>
            </div>
            <p className="text-base text-text-2 font-medium leading-relaxed w-full max-w-[1308px]">
              {
                "Discover how your investment strategies would have performed in the past. Backtesting evaluates the robustness of a portfolio by applying your allocation rules to actual historical data. Important note: the analysis will automatically begin at the most recent year where all selected assets share common available data."
              }
            </p>
          </div>
          {/* PARAMETERS HEADER */}
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <Settings size={14} className="text-pv-blue" />
                {"Strategy Parameters"}
              </h2>
              <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full xl:w-auto">
                <label className="hidden md:inline-block text-xs font-semibold text-text ">
                  {t("mc.portfolio_name")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Backtest"
                  className="bg-surface border border-border text-text placeholder-slate-600 rounded-[1.5rem] px-4 py-2 text-xs font-bold outline-none focus:border-pv-blue w-full md:w-48 text-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: General Info */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={t("pb.capital")}
                    tooltip={
                      "Initial starting capital injected at the beginning."
                    }
                  />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={t("pb.reb")}
                    tooltip={
                      "Frequency of rebalancing to initial target weights."
                    }
                  />
                  <select
                    value={rebalancing}
                    onChange={(e) => setRebalancing(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="none">None</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annually</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={"Rebalancing Bands"}
                    tooltip={"Threshold trigger bands."}
                  />
                  <select
                    value={rebalancingBands}
                    onChange={(e) => setRebalancingBands(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    disabled={rebalancing === "none"}
                  >
                    <option value="none">None</option>
                    <option value="absolute_5">5% Absolute</option>
                    <option value="absolute_10">10% Absolute</option>
                    <option value="relative_25">25% Relative</option>
                  </select>
                </div>
              </div>

              {/* Column 2: Date Range */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={"Start Date"}
                    tooltip={"Start date of the backtest (Month & Year)."}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={startMonthInput}
                      onChange={(e) => setStartMonthInput(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option value="01">01 - Jan</option>
                      <option value="02">02 - Fév</option>
                      <option value="03">03 - Mar</option>
                      <option value="04">04 - Avr</option>
                      <option value="05">05 - Mai</option>
                      <option value="06">06 - Jun</option>
                      <option value="07">07 - Jul</option>
                      <option value="08">08 - Aoû</option>
                      <option value="09">09 - Sep</option>
                      <option value="10">10 - Oct</option>
                      <option value="11">11 - Nov</option>
                      <option value="12">12 - Déc</option>
                    </select>
                    <select
                      value={startYearInput}
                      onChange={(e) => setStartYearInput(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option value="oldest">Max</option>
                      <option value="1990">1990</option>
                      <option value="1993">1993</option>
                      <option value="1995">1995</option>
                      <option value="2000">2000</option>
                      <option value="2005">2005</option>
                      <option value="2008">2008</option>
                      <option value="2010">2010</option>
                      <option value="2015">2015</option>
                      <option value="2020">2020</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={"End Date"}
                    tooltip={"End date of the backtest (Month & Year)."}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={endMonthInput}
                      onChange={(e) => setEndMonthInput(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option value="01">01 - Jan</option>
                      <option value="02">02 - Fév</option>
                      <option value="03">03 - Mar</option>
                      <option value="04">04 - Avr</option>
                      <option value="05">05 - Mai</option>
                      <option value="06">06 - Jun</option>
                      <option value="07">07 - Jul</option>
                      <option value="08">08 - Aoû</option>
                      <option value="09">09 - Sep</option>
                      <option value="10">10 - Oct</option>
                      <option value="11">11 - Nov</option>
                      <option value="12">12 - Déc</option>
                    </select>
                    <select
                      value={endYearInput}
                      onChange={(e) => setEndYearInput(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                    >
                      <option value={new Date().getFullYear().toString()}>
                        {new Date().getFullYear()} (YTD)
                      </option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2020">2020</option>
                      <option value="2015">2015</option>
                      <option value="2010">2010</option>
                      <option value="2005">2005</option>
                      <option value="2000">2000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Column 3: Cashflows */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Cashflows"
                    tooltip={"Periodic contributions or withdrawals."}
                  />
                  <select
                    value={cashflowType}
                    onChange={(e) => setCashflowType(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="none">None</option>
                    <option value="contribute">Contribute</option>
                    <option value="withdraw">Withdraw</option>
                  </select>
                </div>
                {cashflowType !== "none" && (
                  <div className="space-y-1.5 pt-2">
                    <TooltipLabel label="Amount & Freq" tooltip="" />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={cashflowAmount}
                        onChange={(e) =>
                          setCashflowAmount(Number(e.target.value))
                        }
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner"
                      />
                      <select
                        value={cashflowFreq}
                        onChange={(e) => setCashflowFreq(e.target.value)}
                        className="w-full bg-surface border border-border text-text rounded-[1.5rem] px-2 py-2.5 text-xs font-bold outline-none focus:border-pv-blue transition-colors"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inflationAdjusted}
                        onChange={(e) => setInflationAdjusted(e.target.checked)}
                        className="w-3.5 h-3.5 accent-pv-blue"
                      />
                      <span className="text-[10px] text-text-3 font-medium">
                        Inflation Adjusted
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Column 4: Currency & Fees */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label={t("pb.currency")}
                    tooltip={"Primary currency used for calculations."}
                  />
                  <select
                    value={baseCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5 pt-2">
                  <TooltipLabel
                    label={t("pb.broker")}
                    tooltip={"Simulated broker pricing."}
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
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Dividends & Benchmarks */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text tracking-tighter">
                    {t("pb.div")}
                  </label>
                  <select
                    value={dividendHandling}
                    onChange={(e) => setDividendHandling(e.target.value)}
                    className="w-full bg-surface border border-border text-text placeholder-slate-600 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="reinvest">Reinvest All</option>
                    <option value="distribute">Distribute (Cash)</option>
                  </select>
                </div>
                <div className="space-y-2 pt-1 border-t border-border">
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <input
                      type="checkbox"
                      id="benchToggle"
                      checked={includeBenchmark}
                      onChange={(e) => setIncludeBenchmark(e.target.checked)}
                      className="w-4 h-4 accent-pv-blue rounded cursor-pointer"
                    />
                    <label
                      htmlFor="benchToggle"
                      className="text-xs font-semibold text-text cursor-pointer"
                    >
                      Compare Benchmark
                    </label>
                  </div>
                  {includeBenchmark && (
                    <TickerInput
                      value={benchmarkSymbol}
                      onChange={setBenchmarkSymbol}
                      className="w-full bg-surface border border-border text-text placeholder-slate-600 rounded-2xl px-3 py-2 text-xs font-mono outline-none focus:border-pv-blue transition-colors"
                      placeholder="e.g. SPY"
                    />
                  )}
                </div>
              </div>

              {/* Column 4: European Taxes & Slippage */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text tracking-tighter">
                    Slippage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                    className="w-full bg-surface border border-border text-text placeholder-slate-600 rounded-2xl px-3 py-2 text-xs font-mono outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-2 pt-1.5 border-t border-border">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="euTaxes"
                      checked={applyEUTaxes}
                      onChange={(e) => setApplyEUTaxes(e.target.checked)}
                      className="w-4 h-4 accent-pv-blue rounded mt-0.5 cursor-pointer"
                    />
                    <label
                      htmlFor="euTaxes"
                      className="text-xs font-semibold text-text cursor-pointer leading-tight"
                    >
                      Apply European Taxes
                      <span className="block text-text font-normal text-xs normal-case tracking-normal mt-1">
                        Simulate BE TOB & 30% div drag
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolios Row */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                    <Database size={14} className="text-pv-blue" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text flex items-center gap-2">
                      {"Portfolios Configuration"}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={addPortfolio}
                  className="text-xs bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-500 px-4 py-2 border border-sky-500/30 rounded-2xl font-bold hover:from-sky-500/20 hover:to-blue-500/20 transition-all shadow-sm flex items-center justify-center gap-1.5 overflow-hidden relative"
                >
                  {t("pb.add")}
                </button>
              </div>

              <div className="w-full overflow-x-auto bg-surface rounded-xl border border-border mt-4">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2">
                      <th className="p-3 text-sm font-semibold text-text w-24 whitespace-nowrap">
                        Portfolio Assets
                      </th>
                      <th className="p-3 w-64 border-r border-border"></th>
                      {portfolioNames.map((pn, i) => (
                        <th
                          key={pn.id}
                          className="p-3 text-sm font-semibold min-w-[140px] text-center group"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              value={pn.name}
                              onChange={(e) =>
                                updatePortfolioName(i, e.target.value)
                              }
                              className="bg-transparent border-b border-dashed border-border outline-none focus:border-pv-blue transition-colors px-1 py-0.5 text-center font-bold text-text w-full max-w-[120px] text-ellipsis"
                              placeholder={`Portfolio #${i + 1}`}
                            />
                            {portfolioNames.length > 1 && (
                              <button
                                onClick={() => removePortfolio(i)}
                                className="text-text hover:text-red transition-colors"
                                title="Remove Portfolio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioAssets.map((asset, aIdx) => (
                      <tr
                        key={aIdx}
                        className="border-b border-border last:border-0 hover:bg-surface-2"
                      >
                        <td className="p-3 text-sm text-text font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            Asset {aIdx + 1}
                            {portfolioAssets.length > 1 && (
                              <button
                                onClick={() => removeAssetRow(aIdx)}
                                className="text-text-4 hover:text-red transition-colors"
                                title="Remove Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {aIdx === portfolioAssets.length - 1 && (
                            <button
                              onClick={addAsset}
                              className="text-pv-blue hover:underline ml-2 text-xs break-keep whitespace-nowrap block mt-1"
                            >
                              {"(Add More)"}
                            </button>
                          )}
                        </td>
                        <td className="p-3 border-r border-border min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <div className="relative flex items-center ">
                              <TickerInput
                                value={asset.symbol}
                                onChange={(val) => updateAssetSymbol(aIdx, val)}
                                placeholder="Ticker"
                                className="bg-surface text-sm p-2 border border-border rounded-l-md outline-none focus:border-blue-500 transition-colors w-full box-border font-mono font-bold"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-3 py-2 flex items-center justify-center">
                                <Search className="w-4 h-4 text-text" />
                              </div>
                            </div>
                            {ASSET_DATA[asset.symbol]?.label && (
                              <span className="text-xs text-text font-medium truncate max-w-[250px]">
                                {ASSET_DATA[asset.symbol].label}
                              </span>
                            )}
                          </div>
                        </td>
                        {portfolioNames.map((pn, i) => (
                          <td key={pn.id} className="p-3">
                            <div className="flex items-center max-w-[120px] mx-auto">
                              <input
                                type="number"
                                value={asset.weights[i] || ""}
                                onChange={(e) =>
                                  updateAssetWeight(aIdx, i, e.target.value)
                                }
                                placeholder=""
                                className="bg-surface text-sm p-2 border border-border rounded-l-md outline-none focus:border-blue-500 transition-colors w-full box-border text-text font-bold"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-2 py-2 text-xs text-text shrink-0 select-none">
                                %
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-surface-2">
                      <td className="p-3 text-sm font-bold text-text">
                        {"Total"}
                      </td>
                      <td className="p-3 border-r border-border"></td>
                      {portfolioNames.map((pn, i) => {
                        const totalWeight = portfolioAssets.reduce(
                          (sum, a) => sum + Number(a.weights[i] || 0),
                          0,
                        );
                        const isOk = totalWeight === 100;
                        return (
                          <td key={"total-" + i} className="p-3">
                            <div className="flex items-center max-w-[120px] mx-auto">
                              <div
                                className={cn(
                                  "text-sm p-2 border border-border rounded-l-md w-full box-border text-text outline-none",
                                  isOk
                                    ? "bg-sky-500/10 border-sky-500 font-bold text-sky-500"
                                    : "bg-surface",
                                )}
                              >
                                {totalWeight}
                              </div>
                              <div
                                className={cn(
                                  "border border-l-0 border-border rounded-r-md px-3 py-2 text-xs text-text shrink-0",
                                  isOk
                                    ? "bg-sky-500/10 border-sky-500 font-bold text-sky-500"
                                    : "bg-surface-2",
                                )}
                              >
                                %
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red/10 border border-red/20 text-red text-xs rounded-2xl mt-2 font-medium">
                {error}
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={runBacktest}
                disabled={isRunning}
                className="py-3 px-8 bg-pv-blue text-white rounded-[1.5rem] text-sm font-semibold hover:bg-pv-blue-l transition-colors shadow-lg shadow-pv-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    {t("pb.running")}{" "}
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> {t("pb.run")}{" "}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="space-y-8">
            {!hasRun || results.length === 0 ? (
              <div className="h-full min-h-[500px] border border-border/30 rounded-[2rem] relative overflow-hidden bg-surface-2/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90"></div>
              </div>
            ) : (
              <div
                id="report-content"
                className="space-y-12 pb-24 transition-all duration-700 bg-surface-2 pt-12 border-t border-border mt-12"
              >
                <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 text-sm text-text font-sans">
                  {/* Header info */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border pb-12">
                    <div className="space-y-2">
                      <p className="text-text font-medium italic text-left">
                        {t("pb.simSpan")} {results[0].yearsInteger[0]}{" "}
                        {t("pb.to")}{" "}
                        {
                          results[0].yearsInteger[
                            results[0].yearsInteger.length - 1
                          ]
                        }
                      </p>
                      {results.some(
                        (r) => r.warnings && r.warnings.length > 0,
                      ) && (
                        <div className="flex flex-col gap-1 mt-4 text-gold bg-surface-3 px-4 py-2.5 rounded-[2rem] text-sm font-semibold border border-gold/50 text-left">
                          {results
                            .flatMap((r) => r.warnings || [])
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map((w, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
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
                        {"Edit Configuration"}
                      </button>
                      <button
                        onClick={async () => {
                          setIsExporting(true);
                          await generatePDFReport(
                            "report-content",
                            "Quantrih_Portfolio_Analysis",
                          );
                          setIsExporting(false);
                        }}
                        className="text-sm font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                      >
                        {"Export PDF"}
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
                              {"Portfolio"}
                            </th>
                            <th className="px-4 py-4 text-center font-medium text-text">
                              {t("pb.alloc")}
                            </th>
                            <th className="px-4 py-4 text-center font-medium text-text">
                              {t("pb.initialT")}
                            </th>
                            {results.some(
                              (r) =>
                                r.totalContributions !== undefined &&
                                r.totalContributions !== r.initialAmount,
                            ) && (
                              <th className="px-4 py-4 text-center font-medium text-text uppercase tracking-wider text-[10px]">
                                {"Contributions"}
                              </th>
                            )}
                            <th className="px-4 py-4 text-center font-medium text-text">
                              {"Final"}
                            </th>
                            <th className="px-4 py-4 text-center font-medium text-text">
                              CAGR
                            </th>
                            {results.some((r) => r.irr !== undefined) && (
                              <th className="px-4 py-4 text-center font-medium text-text uppercase tracking-wider text-[10px]">
                                IRR
                              </th>
                            )}
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
                            {results.some(
                              (r) => r.metrics.alpha !== undefined,
                            ) && (
                              <th className="px-4 py-4 text-center font-medium text-text">
                                Alpha
                              </th>
                            )}
                            {results.some(
                              (r) => r.metrics.beta !== undefined,
                            ) && (
                              <th className="px-4 py-4 text-center font-medium text-text">
                                Beta
                              </th>
                            )}
                            <th className="px-4 py-4 text-center font-medium text-text">
                              {"Best / Worst"}
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
                                      {t("pb.since")} {r.startYear}
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
                              {results.some(
                                (res) =>
                                  res.totalContributions !== undefined &&
                                  res.totalContributions !== res.initialAmount,
                              ) && (
                                <td className="px-4 py-4 text-center text-text-3 tabular-nums text-sm">
                                  $
                                  {(
                                    r.totalContributions || r.initialAmount
                                  ).toLocaleString("fr-FR", {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                              )}
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
                              {results.some((res) => res.irr !== undefined) && (
                                <td
                                  className={cn(
                                    "px-4 py-4 text-center font-semibold tabular-nums text-sm",
                                    r.irr !== undefined && r.irr >= 0
                                      ? "text-green"
                                      : "text-red",
                                  )}
                                >
                                  {r.irr !== undefined
                                    ? (r.irr >= 0 ? "+" : "") +
                                      r.irr.toFixed(2) +
                                      "%"
                                    : "-"}
                                </td>
                              )}
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
                                    r.worstYear >= 0
                                      ? "text-green"
                                      : "text-red",
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
                                        label +=
                                          context.parsed.y.toFixed(2) + "%";
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
                                        label +=
                                          context.parsed.y.toFixed(2) + "%";
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
                              {"1 Year"}
                            </th>
                            <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                              {"3 Years (Ann.)"}
                            </th>
                            <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                              {"5 Years (Ann.)"}
                            </th>
                            <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                              {"10 Years (Ann.)"}
                            </th>
                            <th className="text-right font-medium text-text py-3 px-4 text-xs whitespace-nowrap">
                              {"Full Period"}
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
                              {"Year"}
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
                            {
                              name: "Dotcom Tech Crash",
                              start: 2000,
                              end: 2002,
                            },
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
                              monthlyReturns={
                                results[activeResIdx].monthlyReturns
                              }
                            />
                          </div>
                          <div className="w-full xl:w-1/3 shrink-0">
                            <h3 className="text-xs font-semibold mb-6 flex items-center gap-2 text-text">
                              <Activity size={14} /> Asset Allocation
                            </h3>
                            <div className="bg-surface rounded-[2rem] p-8 shadow-xl border border-border">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
