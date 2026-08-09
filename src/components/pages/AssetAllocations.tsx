import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  Plus,
  Trash2,
  Info,
  ArrowRight,
  BarChart3,
  LineChart,
  Save,
  FolderOpen,
  Loader2,
  Database,
  Shield,
  HelpCircle,
  Settings,
  FileDown,
  Activity,
  Play,
  Search,
  PieChart,
  Calendar,
  CheckSquare,
  Square,
  Check,
  RefreshCw,
  Cpu,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { PageHeader } from "../ui/PageHeader";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { PresetPortfoliosSelector } from "../ui/PresetPortfoliosSelector";
import { CustomSelect } from "../ui/CustomSelect";
import { ASSET_DATA, YEARS } from "../../constants";
import { computeMetrics, convertReturn } from "../../utils";
import { Metrics, BacktestResult } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestoreUtils";
import { useTranslation } from "../../contexts/LanguageContext";
import { InfoTooltip } from "../ui/InfoTooltip";
import { Disclaimer } from "../ui/Disclaimer";
import { ViewToggle } from "../ui/ViewToggle";
import { lazyPortfolios } from "./lazyPortfoliosData";
import { TickerInput } from "../ui/TickerInput";
import { CloudSaveLoad } from "../ui/CloudSaveLoad";
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
import { RollingReturnsTable } from "../ui/RollingReturnsTable";
import { EfficientFrontier } from "../ui/EfficientFrontier";
import { CorrelationMatrix } from "../ui/CorrelationMatrix";
import { downloadCSV } from "../../utils/export";
import { PortfolioAnalysisExplication } from "./PortfolioAnalysisExplication";

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
      <label className={cn("text-base font-semibold text-text ", className)}>
        {label}
      </label>
      <InfoTooltip content={<>{tooltip}</>} />
    </div>
  );
}

interface AssetAllocationsProps {
  baseCcy: string;
  onNavigate?: (page: string) => void;
}

interface AllocRow {
  ticker: string;
  weights: number[]; // weights for P1, P2...
}

import { runBacktest as engineRunBacktest } from "../../engine";

export function AssetAllocations({
  baseCcy,
  onNavigate,
}: AssetAllocationsProps) {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [startYear, setStartYear] = useLocalStorage("aa_startYear", 1993);
  const [startMonth, setStartMonth] = useLocalStorage("aa_startMonth", 1);
  const [endYear, setEndYear] = useLocalStorage("aa_endYear", 2025);
  const [endMonth, setEndMonth] = useLocalStorage("aa_endMonth", 12);
  const [initialAmount, setInitialAmount] = useLocalStorage(
    "aa_initialAmount",
    10000,
  );
  const [broker, setBroker] = useLocalStorage("aa_broker", "free");
  const [customFee, setCustomFee] = useLocalStorage("aa_customFee", 1.5);
  const [cashflowAmount, setCashflowAmount] = useLocalStorage(
    "aa_cashflowAmount",
    0,
  );
  const [cashflowFrequency, setCashflowFrequency] = useLocalStorage<
    "monthly" | "annually" | "none"
  >("aa_cashflowFrequency", "none");
  const [inflationAdjusted, setInflationAdjusted] = useLocalStorage(
    "aa_inflationAdjusted",
    false,
  );
  const [benchmarkTicker, setBenchmarkTicker] = useLocalStorage(
    "aa_benchmarkTicker",
    "",
  );
  const [rebalancing, setRebalancing] = useLocalStorage(
    "aa_rebalancing",
    "annual",
  ); // "annual", "none"
  const [rebalanceThreshold, setRebalanceThreshold] = useLocalStorage(
    "aa_rebalanceThreshold",
    0,
  ); // 0-1
  const [reinvestDividends, setReinvestDividends] = useLocalStorage(
    "aa_reinvestDividends",
    true,
  );
  const [dividendTaxRate, setDividendTaxRate] = useLocalStorage(
    "aa_dividendTaxRate",
    0,
  );
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useLocalStorage(
    "aa_capitalGainsTaxRate",
    0,
  );
  const [results, setResults] = useState<any[] | null>(null);
  const [activeResIdx, setActiveResIdx] = useState(0);
  const [activeMainView, setActiveMainView] = useState<"simulator" | "dashboard">("simulator");
  const [configsLoading, setConfigsLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [portfolioNames, setPortfolioNames] = useLocalStorage<{ id: string; name: string }[]>(
    "aa_portfolioNames_v8",
    [
      { id: "1", name: "Portfolio 1" },
      { id: "2", name: "Portfolio 2" },
      { id: "3", name: "Portfolio 3" },
    ]
  );

  const [portfolioAssets, setPortfolioAssets] = useLocalStorage<
    { symbol: string; weights: string[] }[]
  >("aa_portfolioAssets_v8", [
    { symbol: "VTI", weights: ["60", "30", "100"] },
    { symbol: "BND", weights: ["40", "0", "0"] },
    { symbol: "TLT", weights: ["0", "40", "0"] },
    { symbol: "IEF", weights: ["0", "15", "0"] },
    { symbol: "GLD", weights: ["0", "15", "0"] },
  ]);

  // Defined Asset Classes for the dropdown
  const ASSET_CLASSES = [
    {
      group: "US Equity",
      options: [
        { label: "US Stock Market", symbol: "VTI" },
        { label: "US Large Cap", symbol: "VV" },
        { label: "US Large Cap Value", symbol: "VTV" },
        { label: "US Large Cap Growth", symbol: "VUG" },
        { label: "US Mid Cap", symbol: "VO" },
        { label: "US Mid Cap Value", symbol: "VOE" },
        { label: "US Mid Cap Growth", symbol: "VOT" },
        { label: "US Small Cap", symbol: "VB" },
        { label: "US Small Cap Value", symbol: "VBR" },
        { label: "US Small Cap Growth", symbol: "VBK" },
        { label: "US Micro Cap", symbol: "IWC" },
      ],
    },
    {
      group: "International Equity",
      options: [
        { label: "Global ex-US Equity", symbol: "VXUS" },
        { label: "Developed Markets", symbol: "VEA" },
        { label: "Emerging Markets", symbol: "VWO" },
      ],
    },
    {
      group: "European Equity (USD)",
      options: [
        { label: "Vanguard FTSE Europe", symbol: "VGK" },
        { label: "iShares MSCI Eurozone", symbol: "EZU" },
        { label: "iShares Core MSCI Europe", symbol: "IEUR" },
        { label: "SPDR EURO STOXX 50", symbol: "FEZ" },
        { label: "iShares MSCI United Kingdom", symbol: "EWU" },
        { label: "iShares MSCI Germany", symbol: "EWG" },
      ],
    },
    {
      group: "European Equity (EUR)",
      options: [
        { label: "Amundi PEA MSCI Europe", symbol: "PCEU.PA" },
        { label: "Amundi Core Stoxx Europe 600", symbol: "MEUD.PA" },
        { label: "iShares Core EURO STOXX 50", symbol: "CSX5.AS" },
        { label: "Vanguard FTSE Dev Europe", symbol: "VEUR.AS" },
      ],
    },
    {
      group: "Fixed Income",
      options: [
        { label: "Total US Bond Market", symbol: "BND" },
        { label: "Long Term Treasury", symbol: "TLT" },
        { label: "Intermediate Treasury", symbol: "IEF" },
        { label: "Short Term Treasury", symbol: "SHY" },
      ],
    },
    {
      group: "Alternatives",
      options: [
        { label: "REITs", symbol: "VNQ" },
        { label: "Gold", symbol: "GLD" },
        { label: "Commodities", symbol: "PDBC" },
      ],
    },
    {
      group: "Crypto",
      options: [
        { label: "Bitcoin", symbol: "BTC-USD" },
        { label: "Ethereum", symbol: "ETH-USD" },
        { label: "Solana", symbol: "SOL-USD" },
      ],
    },
  ];

  const applyPredefinedPortfolio = (preset: any) => {
    if (portfolioNames.length >= 6) return;
    const newId = `p${Date.now()}`;
    let currentAssets = [...portfolioAssets];
    currentAssets = currentAssets.map((a) => ({
      ...a,
      weights: [...a.weights, "0"],
    }));
    preset.assets.forEach((asset: any) => {
      const existingIdx = currentAssets.findIndex(
        (a) => a.symbol === asset.symbol,
      );
      if (existingIdx === -1) {
        const newWeights = portfolioNames.map(() => "0");
        newWeights.push(asset.weight.toString());
        currentAssets.push({ symbol: asset.symbol, weights: newWeights });
      } else {
        currentAssets[existingIdx].weights[
          currentAssets[existingIdx].weights.length - 1
        ] = asset.weight.toString();
      }
    });
    setPortfolioNames([...portfolioNames, { id: newId, name: preset.name }]);
    setPortfolioAssets(currentAssets);
  };

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

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSavedConfigs();
    } else {
      setSavedConfigs([]);
    }
  }, [user]);

  const loadSavedConfigs = async () => {
    if (!user) return;
    setConfigsLoading(true);
    try {
      const q = query(collection(db, `users/${user.uid}/backtests`));
      const querySnapshot = await getDocs(q);
      const configs: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.pageId === "asset-allocation" || data.pageId === "asset_alloc") {
          configs.push({ id: docSnap.id, ...data });
        }
      });
      configs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setSavedConfigs(configs);
    } catch (e) {
      console.error("Failed to load backtests for dashboard:", e);
    } finally {
      setConfigsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainView === "dashboard" && user) {
      loadSavedConfigs();
    }
  }, [activeMainView, user]);

  const deleteConfig = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      // Optimistic UI update
      setSavedConfigs(prev => prev.filter(c => c.id !== id));
      
      await deleteDoc(doc(db, "users", user.uid, "backtests", id));
      
      // Reload just in case
      loadSavedConfigs();
    } catch (e) {
      console.error("Failed to delete config:", e);
      // Reload to revert optimistic update if failed
      loadSavedConfigs();
    }
  };

  const loadConfigIntoSimulator = (config: any) => {
    handleCloudLoad(config);
    setActiveMainView("simulator");
  };

  const renderSavedScenarios = () => {
    if (!user) {
      return (
        <div className="bg-surface border border-border rounded-[2rem] p-12 text-center max-w-2xl mx-auto my-12 shadow-sm flex flex-col items-center gap-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Database size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t("aa.act_saved_scen")}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{t("aa.act_saved_scen_desc")}</p>
          <button
            onClick={() => {
              window.location.href = "/auth";
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10"
          >{t("header.login")}</button>
        </div>
      );
    }

    if (configsLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-3">{t("aa.load_saved")}</p>
        </div>
      );
    }

    const configsWithResults = savedConfigs.filter(c => c.resultsSummary && c.resultsSummary.length > 0);

    const totalCount = savedConfigs.length;
    let bestCagr = "N/A";
    let bestCagrName = "";
    let bestSharpe = "N/A";
    let bestSharpeName = "";

    let maxCagrVal = -999;
    let maxSharpeVal = -999;

    configsWithResults.forEach(c => {
      c.resultsSummary.forEach((r: any) => {
        if (r.cagr > maxCagrVal) {
          maxCagrVal = r.cagr;
          bestCagr = `${r.cagr.toFixed(2)}%`;
          bestCagrName = `${c.name} (${r.name})`;
        }
        if (r.sharpe > maxSharpeVal) {
          maxSharpeVal = r.sharpe;
          bestSharpe = r.sharpe.toFixed(2);
          bestSharpeName = `${c.name} (${r.name})`;
        }
      });
    });

    // Handle filter for chart and side-by-side comparison matrix based on selectedCompareIds
    const comparedConfigs = selectedCompareIds.length > 0
      ? configsWithResults.filter(c => selectedCompareIds.includes(c.id))
      : configsWithResults;

    const hasChartData = comparedConfigs.length > 0;
    const chartLabels = comparedConfigs.map(c => c.name || "Unnamed");
    const chartCagrData = comparedConfigs.map(c => c.resultsSummary[0]?.cagr || 0);
    const chartDrawdownData = comparedConfigs.map(c => Math.abs(c.resultsSummary[0]?.maxDrawdown || 0));

    const comparisonChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "CAGR (Return %)",
          data: chartCagrData,
          backgroundColor: "rgba(37, 99, 235, 0.8)",
          borderColor: "rgb(37, 99, 235)",
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 24,
        },
        {
          label: "Max Drawdown (%)",
          data: chartDrawdownData,
          backgroundColor: "rgba(239, 68, 68, 0.85)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 24,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: { font: { weight: "bold" as const, size: 10, family: "Inter" } }
        },
        title: {
          display: true,
          text: t("dashboard.comparison_chart"),
          font: { size: 12, weight: "bold" as const, family: "Inter" },
          padding: 16
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(241, 245, 249, 0.8)"
          },
          ticks: { font: { family: "JetBrains Mono", size: 10 }, callback: (value: any) => `${value}%` }
        },
        x: {
          grid: {
            display: false
          },
          ticks: { font: { family: "Inter", weight: "bold" as const, size: 10 } }
        }
      }
    };

    const recommendations: any[] = [];
    if (comparedConfigs.length > 0) {
      recommendations.push({
        type: "tip",
        title: "Efficient Frontier Optimization",
        text: "Compare return (CAGR) against risk (Max Drawdown). If a scenario achieves a higher Sharpe ratio, it offers better efficiency for each unit of risk taken."
      });
      recommendations.push({
        type: "tip",
        title: "Recurring Asset Rebalancing",
        text: "Automatic monthly contributions tend to smooth historical maximum drawdowns during periods of high market volatility."
      });
    }

    // Custom Date Formatter
    const formatDate = (timestamp: any) => {
      if (!timestamp) return "N/A";
      const date = new Date(Number(timestamp));
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Calculate scaling limits for Excel data-bars
    const maxCagrLimit = Math.max(...configsWithResults.map(c => c.resultsSummary[0]?.cagr || 1), 5);
    const maxDrawdownLimit = Math.max(...configsWithResults.map(c => Math.abs(c.resultsSummary[0]?.maxDrawdown || 1)), 5);

    return (
      <div className="space-y-10 animate-fade-in font-sans">
        {/* Workspace connection state bar */}
        <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-100 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <p className="text-[13px] font-semibold text-slate-700">{t("aa.conn_work")} • <span className="font-bold text-slate-900">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSavedConfigs}
              className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              <RefreshCw size={12} className="text-slate-400 animate-spin-slow" />
              Refresh
            </button>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {t("dashboard.saved_scenarios")}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{t("aa.conf_cloud")}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
              {t("dashboard.best_cagr")}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{bestCagr}</p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-1" title={bestCagrName}>
                {bestCagrName || "No report generated"}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
              {t("dashboard.best_sharpe")}
            </p>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">{bestSharpe}</p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-1" title={bestSharpeName}>
                {bestSharpeName || "No report generated"}
              </p>
            </div>
          </div>
        </div>

        {/* Chart & AI Insights section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm lg:col-span-8 flex flex-col justify-between min-h-[380px]">
            {hasChartData ? (
              <div className="w-full h-[320px]">
                <Bar data={comparisonChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-4 my-auto">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t("aa.no_comp")}</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{t("aa.no_comp_desc")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm lg:col-span-4 flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                {t("dashboard.ai_analysis")}
              </h3>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl border text-xs leading-relaxed flex flex-col gap-1.5 bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50 transition-all">
                  <p className="font-extrabold flex items-center gap-1.5 text-slate-900">
                    💡 {rec.title}
                  </p>
                  <p className="font-medium text-[11px] text-slate-500">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADVANCED EXCEL-INSPIRED COMPARISON MATRIX */}
        {comparedConfigs.length > 1 && (
          <div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("dashboard.matrix_title")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("dashboard.matrix_desc")}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3 bg-slate-100/20 w-[240px]">{t("dashboard.parameter_metric")}</th>
                    {comparedConfigs.map(c => (
                      <th key={c.id} className="px-6 py-3 font-extrabold text-blue-600 text-center border-l border-slate-100">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Performance Rating */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-3 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.performance_score")}</td>
                    {comparedConfigs.map(c => {
                      const m = c.resultsSummary?.[0];
                      const score = m ? (m.cagr / Math.max(Math.abs(m.maxDrawdown || 1), 1)) * 5 : 0;
                      const stars = Math.min(Math.max(Math.round(score), 1), 5);
                      return (
                        <td key={c.id} className="px-6 py-3 text-center border-l border-slate-100 font-medium">
                          <div className="flex justify-center gap-0.5 text-yellow-400 text-sm">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx}>{idx < stars ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* CAGR Row with excel fill bars */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.annual_return")}</td>
                    {comparedConfigs.map(c => {
                      const cagr = c.resultsSummary?.[0]?.cagr || 0;
                      const pctWidth = `${Math.min(Math.max((cagr / maxCagrLimit) * 100, 8), 100)}%`;
                      return (
                        <td key={c.id} className="px-6 py-4 border-l border-slate-100 text-center">
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <span className="font-extrabold text-emerald-600 text-sm">{cagr.toFixed(2)}%</span>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: pctWidth }} />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Sharpe Ratio with color scales */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.sharpe_efficiency")}</td>
                    {comparedConfigs.map(c => {
                      const sharpe = c.resultsSummary?.[0]?.sharpe || 0;
                      const isGood = sharpe >= 1.0;
                      const isMedium = sharpe >= 0.5 && sharpe < 1.0;
                      return (
                        <td key={c.id} className="px-6 py-4 border-l border-slate-100 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full font-bold text-xs shadow-sm",
                            isGood ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            isMedium ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-rose-50 text-rose-700 border border-rose-200"
                          )}>
                            {sharpe.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Max Drawdown with Red Fill bars */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.max_drawdown")}</td>
                    {comparedConfigs.map(c => {
                      const mdd = Math.abs(c.resultsSummary?.[0]?.maxDrawdown || 0);
                      const pctWidth = `${Math.min(Math.max((mdd / maxDrawdownLimit) * 100, 8), 100)}%`;
                      return (
                        <td key={c.id} className="px-6 py-4 border-l border-slate-100 text-center">
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <span className="font-extrabold text-red-600 text-sm">-{mdd.toFixed(2)}%</span>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: pctWidth }} />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Portfolio assets weight allocation details */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.asset_allocation")}</td>
                    {comparedConfigs.map(c => (
                      <td key={c.id} className="px-6 py-4 border-l border-slate-100">
                        <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                          {c.portfolioAssets?.filter((a: any) => a.weights && a.weights.some((w: any) => Number(w) > 0)).slice(0, 4).map((a: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-600 font-bold text-[9px]">
                              {a.symbol}: {a.weights[0]}%
                            </span>
                          ))}
                          {c.portfolioAssets?.length > 4 && <span className="text-[9px] font-bold text-slate-400">...</span>}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Periods and contribution */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-3 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.period_contribution")}</td>
                    {comparedConfigs.map(c => (
                      <td key={c.id} className="px-6 py-3 border-l border-slate-100 text-center text-[10px] text-slate-600 font-medium">
                        <div>{c.startYear} - {c.endYear}</div>
                        {c.cashflowAmount > 0 && <div className="text-emerald-600 font-bold">+{c.cashflowAmount}$ ({c.cashflowFrequency})</div>}
                      </td>
                    ))}
                  </tr>

                  {/* Rebalancing */}
                  <tr className="hover:bg-slate-50/30">
                    <td className="px-6 py-3 font-semibold text-slate-600 bg-slate-50/20">{t("dashboard.rebalancing")}</td>
                    {comparedConfigs.map(c => (
                      <td key={c.id} className="px-6 py-3 border-l border-slate-100 text-center uppercase tracking-wide font-bold text-[9px] text-slate-500">
                        {c.rebalancing || "Annual"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPARED HIGHLIGHTS BENTO CARDS */}
        {comparedConfigs.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* CARD 1: PERFORMANCE ANALYTICS */}
            <div className="p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 rounded-[2rem] shadow-sm">
              <div className="bg-[#050508] text-white rounded-[1.8rem]  p-6 relative overflow-hidden h-full">
                {/* Double frame contour inset */}
                <div className="absolute inset-2 border border-white/[0.04] rounded-[1.5rem] pointer-events-none" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-1.5 relative z-10">{t("aa.adv_comp")}</h4>
                <div className="space-y-4 relative z-10 text-xs">
                  {(() => {
                    // Find highest and lowest CAGR
                    let highestCagr = -999;
                    let highestCagrName = "";
                    let lowestMdd = 999;
                    let lowestMddName = "";
                    
                    comparedConfigs.forEach(c => {
                      const cagr = c.resultsSummary?.[0]?.cagr || 0;
                      const mdd = Math.abs(c.resultsSummary?.[0]?.maxDrawdown || 0);
                      if (cagr > highestCagr) {
                        highestCagr = cagr;
                        highestCagrName = c.name;
                      }
                      if (mdd < lowestMdd) {
                        lowestMdd = mdd;
                        lowestMddName = c.name;
                      }
                    });

                    return (
                      <>
                        <div className="p-3.5 bg-white/5  rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">{t("aa.max_ret")}</span>
                          <p className="text-sm font-medium text-slate-200">
                            <span className="text-emerald-400 font-extrabold">{highestCagrName}</span> {t("aa.leads_ret")} <span className="text-emerald-400 font-extrabold">{highestCagr.toFixed(2)}%</span>.
                          </p>
                        </div>
                        <div className="p-3.5 bg-white/5  rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">{t("aa.risk_prot")}</span>
                          <p className="text-sm font-medium text-slate-200">
                            <span className="text-blue-400 font-extrabold">{lowestMddName}</span> {t("aa.resil_dd")} <span className="text-blue-400 font-extrabold">-{lowestMdd.toFixed(2)}%</span>.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* CARD 2: STOCHASTIC COMPARATIVE SCORE */}
            <div className="p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 rounded-[2rem] shadow-sm">
              <div className="bg-[#050508] text-white rounded-[1.8rem]  p-6 relative overflow-hidden h-full">
                <div className="absolute inset-2 border border-white/[0.04] rounded-[1.5rem] pointer-events-none" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-1.5 relative z-10">{t("aa.sharpe_alloc")}</h4>
                <div className="space-y-4 relative z-10 text-xs">
                  {(() => {
                    let highestSharpe = -999;
                    let highestSharpeName = "";
                    comparedConfigs.forEach(c => {
                      const sharpe = c.resultsSummary?.[0]?.sharpe || 0;
                      if (sharpe > highestSharpe) {
                        highestSharpe = sharpe;
                        highestSharpeName = c.name;
                      }
                    });

                    return (
                      <>
                        <div className="p-3.5 bg-white/5  rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">{t("aa.max_eff")}</span>
                          <p className="text-sm font-medium text-slate-200">
                            {t("aa.eff_port")} <span className="text-purple-400 font-extrabold">{highestSharpeName}</span> {t("aa.with_sharpe")} <span className="text-purple-400 font-extrabold">{highestSharpe.toFixed(2)}</span>.
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed px-1 mt-2">{t("aa.sharpe_note")}</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved configurations table list with interactive checkboxes */}
        <div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t("aa.act_cloud")}</h3>
              <p className="text-xs text-slate-500 mt-1">{t("aa.act_cloud_desc")}</p>
            </div>
            {selectedCompareIds.length > 0 && (
              <button
                onClick={() => setSelectedCompareIds([])}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
              >
                Reset Selection ({selectedCompareIds.length})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            {savedConfigs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">{t("aa.no_saved")}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 w-[60px] text-center">{t("aa.compare")}</th>
                    <th className="px-6 py-4">{t("aa.strat_name")}</th>
                    <th className="px-6 py-4">{t("aa.const_assets")}</th>
                    <th className="px-6 py-4">{t("aa.key_met")}</th>
                    <th className="px-6 py-4 text-right">{t("aa.date_saved")}</th>
                    <th className="px-6 py-4 text-right w-[140px]">{t("aa.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {savedConfigs.map((config) => {
                    const hasMetrics = config.resultsSummary && config.resultsSummary.length > 0;
                    const primaryMetrics = hasMetrics ? config.resultsSummary[0] : null;
                    const isChecked = selectedCompareIds.includes(config.id);

                    return (
                      <tr key={config.id} className={cn(
                        "hover:bg-slate-50/40 transition-colors",
                        isChecked ? "bg-blue-50/10" : ""
                      )}>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedCompareIds(prev =>
                                isChecked ? prev.filter(id => id !== config.id) : [...prev, config.id]
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {isChecked ? (
                              <CheckSquare size={18} className="text-blue-600 animate-scale-in" />
                            ) : (
                              <Square size={18} className="text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900 text-sm">{config.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Page: {config.pageId || "Allocation"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {config.portfolioAssets?.filter((a: any) => a.weights && a.weights.some((w: any) => Number(w) > 0)).slice(0, 3).map((a: any, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-600 font-bold text-[10px]">
                                {a.symbol} ({a.weights[0]}%)
                              </span>
                            ))}
                            {config.portfolioAssets?.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 px-1">+ {config.portfolioAssets.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {primaryMetrics ? (
                            <div className="flex gap-4">
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-400 block uppercase">CAGR</span>
                                <span className="font-bold text-emerald-600">{primaryMetrics.cagr?.toFixed(2)}%</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-400 block uppercase">SHARPE</span>
                                <span className="font-bold text-slate-700">{primaryMetrics.sharpe?.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold italic text-[10px]">{t("aa.not_calc")}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">{t("aa.saved_on")}</span>
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="font-mono text-[11px] font-bold text-slate-700 tracking-tight">
                                {formatDate(config.updatedAt || config.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => loadConfigIntoSimulator(config)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all"
                            >{t("aa.load")}</button>
                            {deleteConfirmId === config.id ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConfig(config.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                                title="Confirm deletion"
                              >{t("aa.confirm")}</button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(config.id);
                                  setTimeout(() => setDeleteConfirmId(prev => prev === config.id ? null : prev), 3000);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const loadConfigData = (data: any) => {
    setStartYear(data.startYear);
    setStartMonth(data.startMonth || 1);
    setEndYear(data.endYear);
    setEndMonth(data.endMonth || 12);
    setInitialAmount(data.initialAmount);
    setCashflowAmount(data.cashflowAmount || 0);
    setCashflowFrequency(data.cashflowFrequency || "none");
    setRebalancing(data.rebalancing || "annual");
    setReinvestDividends(
      data.reinvestDividends !== undefined ? data.reinvestDividends : true,
    );
    setDividendTaxRate(data.dividendTaxRate || 0);
    setCapitalGainsTaxRate(data.capitalGainsTaxRate || 0);
    setInflationAdjusted(data.inflationAdjusted || false);

    if (data.portfolios) {
      const ports = data.portfolios;
      const newNames = ports.map((p: any, i: number) => ({
        id: String(i + 1),
        name: p.name,
      }));
      while (newNames.length < 3) {
        newNames.push({
          id: String(newNames.length + 1),
          name: `Portfolio ${newNames.length + 1}`,
        });
      }

      const allSymbols = new Set<string>();
      ports.forEach((p: any) =>
        p.assets?.forEach((a: any) => allSymbols.add(a.symbol.toUpperCase())),
      );

      const newAssets = Array.from(allSymbols).map((sym) => {
        const weights = ["", "", ""].map((_, i) => {
          const port = ports[i];
          if (!port) return "";
          const found = port.assets?.find(
            (a: any) => a.symbol.toUpperCase() === sym,
          );
          return found ? String(found.weight) : "";
        });
        return { symbol: sym, weights };
      });
      newAssets.push({ symbol: "", weights: ["", "", ""] });

      setPortfolioNames(newNames);
      setPortfolioAssets(newAssets);
    }
  };

  const runBacktest = async () => {
    setError(null);
    setIsRunning(true);

    try {
      const colors = ["#2c6cad", "#1a467a", "#d97757", "#10b981"];
      const enginePortfolios: any[] = [];

      for (let pIdx = 0; pIdx < portfolios.length; pIdx++) {
        const p = portfolios[pIdx];
        const allocations: { symbol: string; weight: number }[] = [];
        let totalWeight = 0;

        p.assets.forEach((a) => {
          if (a.symbol && a.weight > 0) {
            allocations.push({
              symbol: a.symbol.toUpperCase(),
              weight: a.weight / 100,
            });
            totalWeight += a.weight;
          }
        });

        if (totalWeight === 0) continue;

        // Normalize weights if not 100%
        const normalizedAllocations = allocations.map((a) => ({
          symbol: a.symbol,
          weight: a.weight / (totalWeight / 100),
        }));

        enginePortfolios.push({
          id: p.id,
          name: p.name,
          allocations: normalizedAllocations,
          color: colors[pIdx % colors.length],
        });
      }

      if (benchmarkTicker) {
        enginePortfolios.push({
          id: "benchmark",
          name: `Benchmark (${benchmarkTicker})`,
          allocations: [{ symbol: benchmarkTicker, weight: 1 }],
          color: "#94a3b8",
        });
      }

      const engineOptions = {
        initialBalance: initialAmount,
        startDate: `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
        endDate: `${endYear}-${String(endMonth).padStart(2, "0")}-28`,
        rebalanceFrequency:
          rebalancing === "none" ? "none" : (rebalancing as any),
        rebalanceThreshold: rebalanceThreshold / 100,
        cashflowAmount: cashflowAmount,
        cashflowFrequency: cashflowFrequency,
        reinvestDividends: reinvestDividends,
        dividendTaxRate: dividendTaxRate / 100,
        capitalGainsTaxRate: capitalGainsTaxRate / 100,
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
    } catch (err: any) {
      console.warn(err);
      setError(err.message || "Failed to run backtest.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCloudLoad = (data: any) => {
    if (data.startYear) setStartYear(data.startYear);
    if (data.startMonth) setStartMonth(data.startMonth);
    if (data.endYear) setEndYear(data.endYear);
    if (data.endMonth) setEndMonth(data.endMonth);
    if (data.initialAmount !== undefined) setInitialAmount(data.initialAmount);
    if (data.broker) setBroker(data.broker);
    if (data.customFee !== undefined) setCustomFee(data.customFee);
    if (data.cashflowAmount !== undefined) setCashflowAmount(data.cashflowAmount);
    if (data.cashflowFrequency) setCashflowFrequency(data.cashflowFrequency);
    if (data.inflationAdjusted !== undefined) setInflationAdjusted(data.inflationAdjusted);
    if (data.benchmarkTicker) setBenchmarkTicker(data.benchmarkTicker);
    if (data.rebalancing) setRebalancing(data.rebalancing);
    if (data.rebalanceThreshold !== undefined) setRebalanceThreshold(data.rebalanceThreshold);
    if (data.reinvestDividends !== undefined) setReinvestDividends(data.reinvestDividends);
    if (data.dividendTaxRate !== undefined) setDividendTaxRate(data.dividendTaxRate);
    if (data.capitalGainsTaxRate !== undefined) setCapitalGainsTaxRate(data.capitalGainsTaxRate);
    if (data.portfolioNames) setPortfolioNames(data.portfolioNames);
    if (data.portfolioAssets) setPortfolioAssets(data.portfolioAssets);
  };

  const addPortfolio = () => {
    if (portfolioNames.length >= 6) return;
    const newId = Date.now().toString();
    setPortfolioNames([
      ...portfolioNames,
      { id: newId, name: `${t("pb.portfolio")} ${portfolioNames.length + 1}` },
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

  const addAssetRow = () => {
    
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

  return (
    <MobileZoomWrapper scaleMobile={0.4}>
      <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1600px] mx-auto px-4 md:px-12 pb-24">
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("aa.page_title")}
            badge={t("aa.badge")}
            description={t("aa.description")}
            actions={
              <ViewToggle 
                activeView={activeMainView} 
                onViewChange={(view) => setActiveMainView(view)} 
                simulatorLabel={t("common.simulator")}
                dashboardLabel={t("dashboard.saved_scenarios")}
              />
            }
          />

          {activeMainView === "dashboard" ? renderSavedScenarios() : (
            <div className="simulator-view space-y-8">
              {/* PARAMETERS HEADER - HORIZONTAL (Matched to Backtesting) */}
              <div className="bg-surface border border-border p-6 md:p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8 text-left">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <h2 className="text-base font-semibold tracking-tight text-text flex items-center gap-2">
                    <Settings size={14} className="text-pv-blue" />
                    {"Strategy Parameters"}
                  </h2>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.since")}
                  tooltip={t("aa.tt.start")}
                />
                <div className="grid grid-cols-2 gap-2">
                  <CustomSelect
                    value={startMonth}
                    onChange={(e: any) => setStartMonth(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-sm font-bold cursor-pointer"
                  >
                    <option value={1}>01 - Jan</option>
                    <option value={2}>02 - Feb</option>
                    <option value={3}>03 - Mar</option>
                    <option value={4}>04 - Apr</option>
                    <option value={5}>05 - May</option>
                    <option value={6}>06 - Jun</option>
                    <option value={7}>07 - Jul</option>
                    <option value={8}>08 - Aug</option>
                    <option value={9}>09 - Sep</option>
                    <option value={10}>10 - Oct</option>
                    <option value={11}>11 - Nov</option>
                    <option value={12}>12 - Dec</option>
                  </CustomSelect>
                  <CustomSelect
                    value={startYear}
                    onChange={(e: any) => setStartYear(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-sm font-bold cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.to")}
                  tooltip={t("aa.tt.end")}
                />
                <div className="grid grid-cols-2 gap-2">
                  <CustomSelect
                    value={endMonth}
                    onChange={(e: any) => setEndMonth(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-sm font-bold cursor-pointer"
                  >
                    <option value={1}>01 - Jan</option>
                    <option value={2}>02 - Feb</option>
                    <option value={3}>03 - Mar</option>
                    <option value={4}>04 - Apr</option>
                    <option value={5}>05 - May</option>
                    <option value={6}>06 - Jun</option>
                    <option value={7}>07 - Jul</option>
                    <option value={8}>08 - Aug</option>
                    <option value={9}>09 - Sep</option>
                    <option value={10}>10 - Oct</option>
                    <option value={11}>11 - Nov</option>
                    <option value={12}>12 - Dec</option>
                  </CustomSelect>
                  <CustomSelect
                    value={endYear}
                    onChange={(e: any) => setEndYear(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-sm font-bold cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.capital")}
                  tooltip={t("aa.tt.cap")}
                />
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("dashboard.period_contribution").split(" ")[0]}
                  tooltip={t("aa.tt.cont")}
                />
                <input
                  type="number"
                  value={cashflowAmount}
                  onChange={(e) =>
                    setCashflowAmount(parseFloat(e.target.value))
                  }
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("lazy.frequency").split(" ")[0]}
                  tooltip={t("aa.tt.freq")}
                />
                <CustomSelect
                  value={cashflowFrequency}
                  onChange={(e: any) => setCashflowFrequency(e.target.value as any)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="none">{t("aa.none")}</option>
                  <option value="monthly">{t("aa.monthly")}</option>
                  <option value="annually">{t("aa.annually")}</option>
                </CustomSelect>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.reb")}
                  tooltip={t("aa.tt.rebal")}
                />
                <CustomSelect
                  value={rebalancing}
                  onChange={(e: any) => setRebalancing(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold cursor-pointer outline-none focus:border-pv-blue transition-colors"
                >
                  <option value="annually">{t("aa.annual")}</option>
                  <option value="quarterly">{t("aa.quarterly")}</option>
                  <option value="monthly">{t("aa.monthly")}</option>
                  <option value="none">{t("aa.none")}</option>
                </CustomSelect>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.broker")}
                  tooltip={t("aa.tt.broker")}
                />
                <CustomSelect
                  value={broker}
                  onChange={(e: any) => setBroker(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors cursor-pointer"
                >
                  <option value="free">{t("aa.nofee")}</option>
                  <option value="custom">{t("aa.custom")}</option>
                </CustomSelect>
                {broker === "custom" && (
                  <div className="pt-1">
                    <label className="text-xs font-bold text-text mb-1 block">
                      {t("pb.customFee")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFee}
                      onChange={(e) => setCustomFee(Number(e.target.value))}
                      className="w-full bg-surface-2 border border-border text-text rounded-[1.5rem] px-3 py-2 text-base font-mono font-bold outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={t("pb.bench")}
                  tooltip={t("aa.tt.bench")}
                />
                <TickerInput
                  value={benchmarkTicker}
                  onChange={setBenchmarkTicker}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2 text-base font-mono font-bold transition-colors outline-none focus:border-pv-blue"
                  placeholder="e.g. SPY"
                />
              </div>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <TooltipLabel
                      label="Div Tax %"
                      tooltip={t("aa.tt.div")}
                    />
                    <input
                      type="number"
                      value={dividendTaxRate}
                      onChange={(e) =>
                        setDividendTaxRate(parseFloat(e.target.value))
                      }
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-3 py-2 text-base font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <TooltipLabel
                      label="CapG Tax %"
                      tooltip={t("aa.tt.capg")}
                    />
                    <input
                      type="number"
                      value={capitalGainsTaxRate}
                      onChange={(e) =>
                        setCapitalGainsTaxRate(parseFloat(e.target.value))
                      }
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-3 py-2 text-base font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inf"
                    checked={inflationAdjusted}
                    onChange={(e) => setInflationAdjusted(e.target.checked)}
                    className="w-4 h-4 accent-pv-blue rounded cursor-pointer"
                  />
                  <label
                    htmlFor="inf"
                    className="text-xs font-bold text-text cursor-pointer uppercase tracking-wider"
                  >{t("aa.adj_inf")}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reiv"
                    checked={reinvestDividends}
                    onChange={(e) => setReinvestDividends(e.target.checked)}
                    className="w-4 h-4 accent-pv-blue rounded cursor-pointer"
                  />
                  <label
                    htmlFor="reiv"
                    className="text-xs font-bold text-text cursor-pointer uppercase tracking-wider"
                  >{t("aa.reinv_div")}</label>
                </div>
              </div>
          </div>

          {/* Simple Clean Suggested Model Portfolios Pill Bar */}
          <div className="pt-4 border-t border-border mt-4 w-full">
            <div className="flex flex-col gap-2.5">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <Activity size={14} className="text-pv-blue" />
                {t("aa.sugg") || "Suggested Portfolios"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {lazyPortfolios.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPredefinedPortfolio(preset)}
                    disabled={portfolioNames.length >= 6}
                    className="text-xs bg-surface-2 border border-border px-3.5 py-1.5 rounded-xl hover:border-pv-blue hover:text-pv-blue transition-all transform hover:scale-105 disabled:opacity-50 font-semibold shadow-sm cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolios Sections (Independent Cards matching Backtesting) */}
          <div className="pt-6 border-t border-border space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                  <Database size={14} className="text-pv-blue" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text flex items-center gap-2">{t("aa.port_assets")}</h3>
                </div>
              </div>
              <button
                onClick={addPortfolio}
                disabled={portfolioNames.length >= 6}
                className="text-base bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-500 px-4 py-2 border border-sky-500/30 rounded-2xl font-bold hover:from-sky-500/20 hover:to-blue-500/20 transition-all shadow-sm flex items-center justify-center gap-1.5 overflow-hidden relative disabled:opacity-50"
              >
                {t("pb.add")}
              </button>
            </div>

            <div className="w-full max-w-full mx-auto overflow-x-auto bg-surface rounded-[2rem] border border-border mt-4 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[280px] lg:min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="py-2.5 px-2.5 text-xs lg:text-sm font-semibold text-text w-auto whitespace-nowrap">{t("aa.asset_class") || "Assets"}</th>
                    <th className="py-2.5 px-2.5 min-w-[320px] lg:min-w-[400px] w-80 lg:w-96 border-r border-border font-semibold text-text text-xs lg:text-sm whitespace-nowrap">Asset & Name</th>
                    {portfolioNames.map((pn, i) => (
                      <th
                        key={pn.id}
                        className="p-3.5 text-base font-semibold min-w-[140px] text-center group"
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
                              className="text-text-4 hover:text-red transition-colors p-0.5"
                              title="Remove Portfolio"
                            >
                              <Trash2 className="w-3 h-3" />
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
                      className="border-b border-border last:border-0 hover:bg-surface-2/60 transition-colors"
                    >
                      <td className="py-2 pl-2.5 pr-1 text-xs lg:text-sm text-text font-semibold whitespace-nowrap w-auto">
                        <div className="flex items-center gap-1">
                          <span>Asset {aIdx + 1}</span>
                          {portfolioAssets.length > 1 && (
                            <button
                              onClick={() => removeAssetRow(aIdx)}
                              className="text-text-4 hover:text-red transition-colors p-0.5 rounded hover:bg-red/10"
                              title="Remove Asset"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {aIdx === portfolioAssets.length - 1 && (
                          <button
                            onClick={addAssetRow}
                            className="text-pv-blue hover:underline text-[11px] font-semibold break-keep whitespace-nowrap block mt-1"
                          >+ {t("aa.add_more")}</button>
                        )}
                      </td>
                      <td className="py-2 pl-1 pr-2.5 border-r border-border min-w-[320px] lg:min-w-[420px]">
                        <div className="flex items-center gap-2 w-full">
                          <div className="relative flex items-center shadow-sm w-40 shrink-0">
                            <CustomSelect
                              value={asset.symbol}
                              onChange={(e: any) =>
                                updateAssetSymbol(aIdx, e.target.value)
                              }
                              className="bg-surface-2 text-xs px-3 py-2 border border-border rounded-[1.5rem] outline-none focus:border-pv-blue transition-colors w-full box-border font-semibold text-text cursor-pointer truncate"
                            >
                              <option value="" disabled>{t("aa.sel_asset")}</option>
                              {ASSET_CLASSES.map((group) => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.options.map((opt) => (
                                    <option key={opt.symbol} value={opt.symbol}>
                                      {opt.symbol} - {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </CustomSelect>
                          </div>
                          {asset.symbol ? (
                            <span className="text-xs text-pv-blue font-semibold truncate flex-1 leading-tight" title={ASSET_DATA[asset.symbol.toUpperCase()]?.label || ASSET_CLASSES.flatMap((g) => g.options).find((o) => o.symbol === asset.symbol)?.label || ""}>
                              {ASSET_DATA[asset.symbol.toUpperCase()]?.label ||
                                ASSET_CLASSES.flatMap((g) => g.options).find((o) => o.symbol === asset.symbol)?.label ||
                                ""}
                            </span>
                          ) : (
                            <span className="text-xs text-text-3/60 font-normal italic truncate flex-1">
                              --
                            </span>
                          )}
                        </div>
                      </td>
                      {portfolioNames.map((pn, i) => (
                        <td key={pn.id} className="p-2 lg:p-3">
                          <div className="flex items-center max-w-[130px] mx-auto shadow-sm">
                            <input
                              type="number"
                              step="any"
                              value={asset.weights[i] || ""}
                              onChange={(e) =>
                                updateAssetWeight(aIdx, i, e.target.value)
                              }
                              placeholder="0"
                              className="bg-surface text-sm p-2 lg:p-2.5 border border-border rounded-l-xl outline-none focus:border-pv-blue transition-colors w-full box-border text-text font-bold text-center"
                            />
                            <div className="bg-surface-2 border border-l-0 border-border rounded-r-xl px-2.5 py-2 lg:py-2.5 text-xs font-bold text-text-2 shrink-0 select-none">
                              %
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Totals Row */}
                  <tr className="bg-surface-2 font-bold">
                    <td className="p-3.5 text-sm lg:text-base font-bold text-text">{t("aa.totals")}</td>
                    <td className="p-3.5 border-r border-border"></td>
                    {portfolioNames.map((pn, i) => {
                      const totalWeight = portfolioAssets.reduce(
                        (sum, a) => sum + Number(a.weights[i] || 0),
                        0,
                      );
                      const isOk = Math.abs(totalWeight - 100) < 0.001;
                      const isOver = totalWeight > 100;
                      return (
                        <td key={"total-" + i} className="p-3.5">
                          <div className="flex items-center max-w-[130px] mx-auto shadow-sm">
                            <div
                              className={cn(
                                "text-sm p-2 lg:p-2.5 border border-border rounded-l-xl w-full box-border text-center font-bold outline-none transition-colors",
                                isOk
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                  : isOver
                                  ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                  : "bg-surface text-text",
                              )}
                            >
                              {Math.round(totalWeight * 100) / 100}
                            </div>
                            <div
                              className={cn(
                                "border border-l-0 border-border rounded-r-xl px-2.5 py-2 lg:py-2.5 text-xs font-bold shrink-0 transition-colors",
                                isOk
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                  : isOver
                                  ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                  : "bg-surface-2 text-text-2",
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
            {error && (
              <div className="p-3 bg-red/10 border border-red/20 text-red text-base rounded-2xl mt-2 font-medium">
                {error}
              </div>
            )}
            <div className="flex justify-between pt-4 items-center">
              <CloudSaveLoad 
                pageId="asset-allocation" 
                currentData={{
                  startYear, startMonth, endYear, endMonth, initialAmount, broker, customFee,
                  cashflowAmount, cashflowFrequency, inflationAdjusted, benchmarkTicker,
                  rebalancing, rebalanceThreshold, reinvestDividends, dividendTaxRate, capitalGainsTaxRate,
                  portfolioNames, portfolioAssets,
                  portNames: portfolioNames.map(p => p.name),
                  allocRows: portfolioAssets.map(a => ({ symbol: a.symbol, allocations: a.weights.map(w => Number(w) || 0) })),
                  resultsSummary: results ? results.map(r => ({ name: r.name, cagr: r.metrics.cagr, sharpe: r.metrics.sharpe, maxDrawdown: r.metrics.maxDrawdown })) : []
                }} 
                onLoad={handleCloudLoad}
                onListUpdate={loadSavedConfigs}
              />
              <button
                onClick={runBacktest}
                disabled={isRunning}
                className="py-3 px-8 bg-pv-blue text-white rounded-[1.5rem] text-base font-semibold hover:bg-pv-blue-l transition-colors shadow-lg shadow-pv-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
          <div id="bt-results-anchor" className="h-4"></div>
          {(!results || results.length === 0) && (
            <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8">
              <div className="h-full min-h-[500px] border border-border/30 rounded-[2rem] relative overflow-hidden bg-surface-2/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-screen transition-opacity duration-1000 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-bg/90"></div>
              </div>
            </div>
          )}

          {results && results.length > 0 &&
              <div
                id="report-content"
                className="space-y-12 pb-24 transition-all duration-700 bg-surface-2 pt-12 border-t border-border mt-12"
              >
          <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 text-base text-text font-sans">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border pb-12">
              <div className="space-y-2">
                <p className="text-text font-medium italic text-left">
                  {t("pb.simSpan")} {results[0].yearsInteger[0]} {t("pb.to")}{" "}
                  {results[0].yearsInteger[results[0].yearsInteger.length - 1]}
                </p>
                {results.some((r) => r.warnings && r.warnings.length > 0) && (
                  <div className="flex flex-col gap-1 mt-4 text-gold bg-surface-3 px-4 py-2.5 rounded-[2rem] text-base font-semibold border border-gold/50 text-left">
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
                  className="text-base font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                >
                  {t("pb.editConfig")}
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
                  className="text-base font-medium text-text hover:text-text transition-colors bg-surface border border-border hover:bg-surface-2 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 "
                >
                  {t("pb.export")}
                </button>
              </div>
            </div>

            {/* Portfolio Summaries (Charts + Metrics) */}
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-text tracking-tight">
                  {t("pb.portSummaries")}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-base font-sans border-collapse">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border">
                      <th className="px-6 py-4 text-left font-semibold text-text">{t("pb.portfolio")}</th>
                      <th className="px-4 py-4 text-center font-medium text-text">{t("pb.alloc")}</th>
                      <th className="px-4 py-4 text-center font-medium text-text">{t("pb.initialT")}</th>
                      <th className="px-4 py-4 text-center font-medium text-text">{t("pb.finalT")}</th>
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
                      <th className="px-4 py-4 text-center font-medium text-text">{t("pb.bestWorst")}</th>
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
                              <div className="text-base text-text-4">
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
                        <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                          $
                          {r.initialAmount.toLocaleString("fr-FR", {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-text tabular-nums text-base">
                          $
                          {r.endBalance.toLocaleString("fr-FR", {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-4 text-center font-semibold tabular-nums text-base",
                            r.cagr >= 0 ? "text-green" : "text-red",
                          )}
                        >
                          {r.cagr >= 0 ? "+" : ""}
                          {r.cagr.toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                          {r.stdev.toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-red tabular-nums text-base">
                          -{Math.abs(r.maxDrawdown).toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-center tabular-nums text-base font-medium text-text">
                          {r.sharpe.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-center tabular-nums text-base font-medium text-text">
                          {r.sortino.toFixed(2)}
                        </td>
                        {results.some((r) => r.metrics.alpha !== undefined) && (
                          <td
                            className={cn(
                              "px-4 py-4 text-center tabular-nums text-base font-medium",
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
                        {results.some((r) => r.metrics.beta !== undefined) && (
                          <td className="px-4 py-4 text-center text-text tabular-nums text-base">
                            {r.metrics.beta !== undefined
                              ? r.metrics.beta.toFixed(2)
                              : "-"}
                          </td>
                        )}
                        <td className="px-4 py-4 text-center tabular-nums text-base whitespace-nowrap">
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
            <div className="bg-surface border border-border rounded-3xl mb-8 overflow-hidden text-left shadow-sm">
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-2">
                <h3 className="text-base font-semibold text-text flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pv-blue animate-pulse"></span>{t("aa.chart.wealth")}</h3>
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
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-border bg-surface-2">
                  <h3 className="text-base font-semibold text-text flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>{t("aa.chart.annual")}</h3>
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
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-border bg-surface-2">
                  <h3 className="text-base font-semibold text-text flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>{t("aa.chart.drawdowns")}</h3>
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
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-text tracking-tight">{t("aa.chart.trailing")}</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-base border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("pb.portfolio")}
                      </th>
                      <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("aa.1yr")}
                      </th>
                      <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("aa.5yr")}
                      </th>
                      <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("aa.10yr")}
                      </th>
                      <th className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("aa.full_period")}
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
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-text tracking-tight">{t("aa.table.annual")}</h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-base border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-text py-3 px-4 text-base whitespace-nowrap">
                        {t("heat.year")}
                      </th>
                      {results.map((r, i) => (
                        <th
                          key={i}
                          className="text-right font-medium text-text py-3 px-4 text-base whitespace-nowrap"
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
            <div className="bg-surface border border-border rounded-3xl shadow-md mb-12 overflow-hidden border-2 border-border text-left">
              <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-surface-2">
                <h3 className="text-base font-semibold text-text ">{t("aa.table.stress")}</h3>
              </div>
              <div className="overflow-x-auto p-10">
                <table className="w-full text-base border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left font-semibold text-text py-5 px-6 text-base whitespace-nowrap">{t("aa.table.stress_period")}</th>
                      <th className="text-left font-semibold text-text py-5 px-6 text-base whitespace-nowrap">{t("aa.table.timeline")}</th>
                      {results.map((r, i) => (
                        <th
                          key={i}
                          className="text-right font-semibold text-text py-5 px-6 text-base whitespace-nowrap"
                        >
                          {r.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: t("stress.dotcom"), start: 2000, end: 2002 },
                      { name: t("stress.gfc"), start: 2008, end: 2008 },
                      { name: t("stress.covid"), start: 2020, end: 2020 },
                      { name: t("stress.inflation"), start: 2022, end: 2022 },
                    ].map((event, ei) => (
                      <tr
                        key={ei}
                        className="border-b border-border hover:bg-pv-blue/5 transition-all font-sans group"
                      >
                        <td className="py-6 px-6 font-bold text-text whitespace-nowrap text-left text-base tracking-tight">
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
                                className="py-6 px-6 text-right text-text font-bold italic text-base font-mono"
                              >
                                {t("pb.outsideScope")}
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
              <div className="flex border-b border-border flex-wrap gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem]">
                {results.map((r, idx) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveResIdx(idx)}
                    className={cn(
                      "px-6 py-3 text-base font-semibold whitespace-nowrap transition-all rounded-[1.5rem]",
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
                        <h3 className="text-base font-semibold flex items-center gap-2 text-text">
                          <Activity size={14} />{t("aa.chart.heatmap")}</h3>
                      </div>
                      <ReturnsHeatmap
                        monthlyReturns={results[activeResIdx].monthlyReturns}
                      />
                    </div>
                    <div className="w-full xl:w-1/3 shrink-0">
                      <h3 className="text-base font-semibold mb-6 flex items-center gap-2 text-text">
                        <Activity size={14} /> {t("pb.assetAllocDetails")}
                      </h3>
                      <div className="bg-surface rounded-[2rem] p-8 shadow-xl border border-border">
                        <EliteDonut
                          assets={results[activeResIdx].assets || []}
                          allocations={results[activeResIdx].alloc || {}}
                          title={t("pb.assetAllocDetails")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <PortfolioAnalysisExplication results={results} />
            <Disclaimer />
          </div>
        </div>
          }
        </div>
      )}
    </div>
  </div>
</div>
    </MobileZoomWrapper>
  );
}
