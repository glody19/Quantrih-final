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
} from "lucide-react";
import { cn } from "../../lib/utils";
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
import { generatePDFReport } from "../../lib/pdfGenerator";
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
      <label className={cn("text-xs font-semibold text-text ", className)}>
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
  const [isExporting, setIsExporting] = useState(false);

  const [portfolioNames, setPortfolioNames] = useLocalStorage<
    { id: string; name: string }[]
  >("aa_portfolioNames_v2", [
    { id: "1", name: "Classic (60/40)" },
    { id: "2", name: "Dynamic (80/20)" },
    { id: "3", name: "100% Equities" },
    { id: "4", name: "Conservative (40/60)" },
    { id: "5", name: "Permanent (Harry Browne)" },
  ]);

  const [portfolioAssets, setPortfolioAssets] = useLocalStorage<
    { symbol: string; weights: string[] }[]
  >("aa_portfolioAssets_v3", [
    { symbol: "VTI", weights: ["60", "80", "100", "40", "25"] },
    { symbol: "BND", weights: ["40", "20", "0", "40", "25"] },
    { symbol: "GLD", weights: ["0", "0", "0", "10", "25"] },
    { symbol: "SHY", weights: ["0", "0", "0", "10", "25"] },
    { symbol: "VNQ", weights: ["0", "0", "0", "0", "0"] },
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
  ];

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

  const [savedConfigs, setSavedConfigs] = useState<
    { id: string; name: string; data: any }[]
  >([]);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
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
    setIsLoadingConfigs(true);
    try {
      const q = query(collection(db, "users", user.uid, "backtests"));
      const querySnapshot = await getDocs(q);
      const configs: any[] = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, name: doc.data().name, data: doc.data() });
      });
      setSavedConfigs(configs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.LIST,
        `users/${user?.uid}/backtests`,
      );
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!user || !saveName.trim()) return;
    setIsSaving(true);
    const docId = `config-${Date.now()}`;
    const path = `users/${user.uid}/backtests/${docId}`;
    try {
      await setDoc(doc(db, "users", user.uid, "backtests", docId), {
        name: saveName.trim(),
        userId: user.uid,
        startYear,
        startMonth,
        endYear,
        endMonth,
        initialAmount,
        cashflowAmount,
        cashflowFrequency,
        rebalancing,
        reinvestDividends,
        dividendTaxRate,
        capitalGainsTaxRate,
        inflationAdjusted,
        portfolios,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSaveName("");
      await loadSavedConfigs();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/backtests/${id}`;
    try {
      await deleteDoc(doc(db, "users", user.uid, "backtests", id));
      await loadSavedConfigs();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
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
      const { runBacktest: engineRunBacktest } = await import("../../engine");

      const colors = ["#2c6cad", "#1a467a", "#d97757"];
      const enginePortfolios = [];

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
    <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-24">
        {results && (
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() =>
                results.forEach((r) =>
                  downloadCSV(
                    r.dates.map((d, idx) => ({
                      Date: d,
                      Balance: r.balances[idx].toFixed(2),
                      Drawdown: r.drawdowns[idx].toFixed(2) + "%",
                    })),
                    `portfolio_${r.name.replace(/\s+/g, "_")}_monthly`,
                  ),
                )
              }
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-[1.5rem] font-bold text-xs transition-all"
            >
              <FileDown size={16} />
              CSV
            </button>
            <button
              onClick={() =>
                generatePDFReport(
                  "report-content",
                  "Asset_Allocation_Report",
                  setIsExporting,
                )
              }
              disabled={isExporting}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-pv-blue border border-slate-700 hover:border-pv-blue text-white px-5 py-2.5 rounded-[1.5rem] font-bold text-xs transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <span className="w-4 h-4 rounded-full border-2 border-t-white/30 animate-spin border-white"></span>
              ) : (
                <FileDown size={16} />
              )}
              {isExporting ? "Génération..." : "PDF"}
            </button>
          </div>
        )}
        <div className="mb-16 mt-4">
          <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
            <h1 className="text-2xl font-bold text-pv-blue tracking-tight">
              {"Asset Allocations"}
            </h1>
          </div>
          <p className="text-base text-text-2 font-medium leading-relaxed w-full max-w-[1308px]">
            {
              "Build and compare the performance of different portfolio allocations. Evaluate the impact of diversification and identify the optimal distribution based on risk and historical returns. The analysis will automatically begin at the year of common data availability for the assets."
            }
          </p>
        </div>
        {/* PARAMETERS HEADER - HORIZONTAL (Matched to Backtesting) */}
        <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold tracking-tight text-text flex items-center gap-2">
              <Settings size={14} className="text-pv-blue" />
              {"Strategy Parameters"}
            </h2>
            <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full xl:w-auto">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving || !saveName}
                className="py-2 px-4 bg-surface-2 border border-border text-text rounded-[1.5rem] text-xs font-semibold hover:text-pv-blue transition-all disabled:opacity-30"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={12} /> Save Config
                  </span>
                )}
              </button>

              <input
                placeholder={t("mc.portfolio_name") + " (ex: 60/40 Split)"}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2 text-xs font-bold outline-none flex-1 md:w-48 focus:border-pv-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Timeline */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <TooltipLabel
                  label="Start Date"
                  tooltip="Date de début pour l'analyse des rendements (Mois & Année)."
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-xs font-bold"
                  >
                    <option value={1}>01 - Jan</option>
                    <option value={2}>02 - Fév</option>
                    <option value={3}>03 - Mar</option>
                    <option value={4}>04 - Avr</option>
                    <option value={5}>05 - Mai</option>
                    <option value={6}>06 - Jun</option>
                    <option value={7}>07 - Jul</option>
                    <option value={8}>08 - Aoû</option>
                    <option value={9}>09 - Sep</option>
                    <option value={10}>10 - Oct</option>
                    <option value={11}>11 - Nov</option>
                    <option value={12}>12 - Déc</option>
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-xs font-bold"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label="End Date"
                  tooltip="Date de fin pour l'analyse des rendements (Mois & Année)."
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-xs font-bold"
                  >
                    <option value={1}>01 - Jan</option>
                    <option value={2}>02 - Fév</option>
                    <option value={3}>03 - Mar</option>
                    <option value={4}>04 - Avr</option>
                    <option value={5}>05 - Mai</option>
                    <option value={6}>06 - Jun</option>
                    <option value={7}>07 - Jul</option>
                    <option value={8}>08 - Aoû</option>
                    <option value={9}>09 - Sep</option>
                    <option value={10}>10 - Oct</option>
                    <option value={11}>11 - Nov</option>
                    <option value={12}>12 - Déc</option>
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-2 py-2.5 text-xs font-bold"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label={`Capital (${baseCcy})`}
                  tooltip="Initial investment amount."
                />
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono"
                />
              </div>
            </div>

            {/* Column 2: Recurring */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <TooltipLabel
                  label="Contribution"
                  tooltip="Recurring deposit amount."
                />
                <input
                  type="number"
                  value={cashflowAmount}
                  onChange={(e) =>
                    setCashflowAmount(parseFloat(e.target.value))
                  }
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label="Frequency"
                  tooltip="How often deposits are made."
                />
                <select
                  value={cashflowFrequency}
                  onChange={(e) => setCashflowFrequency(e.target.value as any)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold"
                >
                  <option value="none">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            {/* Column 3: Rebalance & Benchmark */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <TooltipLabel
                  label="Rebalancing"
                  tooltip="Frequency of target weight adjustments."
                />
                <select
                  value={rebalancing}
                  onChange={(e) => setRebalancing(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold"
                >
                  <option value="annually">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <TooltipLabel
                  label={t("pb.broker")}
                  tooltip="Tarification du courtier simulée."
                />
                <select
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text rounded-[1.5rem] px-4 py-2.5 text-sm font-bold outline-none focus:border-pv-blue transition-colors"
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
                      className="w-full bg-surface-2 border border-border text-text rounded-[1.5rem] px-4 py-2.5 text-sm font-mono outline-none focus:border-pv-blue transition-colors shadow-inner"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <TooltipLabel
                  label="Benchmark"
                  tooltip="Symbol to compare performance against."
                />
                <TickerInput
                  value={benchmarkTicker}
                  onChange={setBenchmarkTicker}
                  className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-sm font-bold transition-colors"
                  placeholder="e.g. SPY"
                />
              </div>
            </div>

            {/* Column 4: Tax & Logic */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Div Tax %"
                    tooltip="Taxation on received dividends."
                  />
                  <input
                    type="number"
                    value={dividendTaxRate}
                    onChange={(e) =>
                      setDividendTaxRate(parseFloat(e.target.value))
                    }
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-3 py-2.5 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="CapG Tax %"
                    tooltip="Taxation on capital gains at exit."
                  />
                  <input
                    type="number"
                    value={capitalGainsTaxRate}
                    onChange={(e) =>
                      setCapitalGainsTaxRate(parseFloat(e.target.value))
                    }
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-3 py-2.5 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded-[1.5rem] border border-border">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <input
                    type="checkbox"
                    id="inf"
                    checked={inflationAdjusted}
                    onChange={(e) => setInflationAdjusted(e.target.checked)}
                    className="w-3 h-3 accent-pv-blue"
                  />
                  <label
                    htmlFor="inf"
                    className="text-xs font-semibold text-text cursor-pointer"
                  >
                    Adj. Inflation
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <input
                    type="checkbox"
                    id="reiv"
                    checked={reinvestDividends}
                    onChange={(e) => setReinvestDividends(e.target.checked)}
                    className="w-3 h-3 accent-pv-blue"
                  />
                  <label
                    htmlFor="reiv"
                    className="text-xs font-semibold text-text cursor-pointer"
                  >
                    Reinvest Divs
                  </label>
                </div>
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
                  <h3 className="text-xs font-semibold text-text flex items-center gap-2">
                    Portfolio Assets
                  </h3>
                </div>
              </div>
              <button
                onClick={addPortfolio}
                className="text-xs bg-pv-blue/10 text-pv-blue px-3 py-1.5 border border-pv-blue/20 rounded font-bold hover:bg-pv-blue/20 transition-colors"
              >
                {t("pb.add")}
              </button>
            </div>

            <div className="w-full overflow-x-auto bg-surface rounded-xl border border-border mt-4">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="p-3 text-sm font-semibold text-text w-24 whitespace-nowrap">
                      Asset Class
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
                      className="border-b border-surface-2 last:border-0 hover:bg-surface-2"
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
                            onClick={addAssetRow}
                            className="text-blue-600 hover:underline ml-2 text-xs break-keep whitespace-nowrap block mt-1"
                          >
                            (Add More)
                          </button>
                        )}
                      </td>
                      <td className="p-3 border-r border-surface-2 min-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <div className="relative flex items-center shadow-sm">
                            <select
                              value={asset.symbol}
                              onChange={(e) =>
                                updateAssetSymbol(aIdx, e.target.value)
                              }
                              className="bg-white text-sm p-2 border border-border rounded-xl outline-none focus:border-blue-500 transition-colors w-full box-border font-bold text-text"
                            >
                              <option value="" disabled>
                                Select Asset Class
                              </option>
                              {ASSET_CLASSES.map((group) => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.options.map((opt) => (
                                    <option key={opt.symbol} value={opt.symbol}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>
                      {portfolioNames.map((pn, i) => (
                        <td key={pn.id} className="p-3">
                          <div className="flex items-center shadow-sm max-w-[120px] mx-auto">
                            <input
                              type="number"
                              value={asset.weights[i] || ""}
                              onChange={(e) =>
                                updateAssetWeight(aIdx, i, e.target.value)
                              }
                              placeholder=""
                              className="bg-white text-sm p-2 border border-border rounded-l-md outline-none focus:border-blue-500 transition-colors w-full box-border text-text font-bold"
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
                    <td className="p-3 text-sm font-bold text-text">Total</td>
                    <td className="p-3 border-r border-surface-2"></td>
                    {portfolioNames.map((pn, i) => {
                      const totalWeight = portfolioAssets.reduce(
                        (sum, a) => sum + Number(a.weights[i] || 0),
                        0,
                      );
                      const isOk = totalWeight === 100;
                      return (
                        <td key={"total-" + i} className="p-3">
                          <div className="flex items-center shadow-sm max-w-[120px] mx-auto">
                            <div
                              className={cn(
                                "text-sm p-2 border border-border rounded-l-md w-full box-border text-text outline-none",
                                isOk
                                  ? "bg-[#dff0d8] border-[#d6e9c6]"
                                  : "bg-white",
                              )}
                            >
                              {totalWeight}
                            </div>
                            <div
                              className={cn(
                                "border border-l-0 border-border rounded-r-md px-3 py-2 text-xs text-text shrink-0",
                                isOk
                                  ? "bg-[#dff0d8] border-[#d6e9c6]"
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

      {/* Results Section */}
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
                  {results[0].yearsInteger[results[0].yearsInteger.length - 1]}
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
                  Export PDF
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
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
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
                        {results.some((r) => r.metrics.alpha !== undefined) && (
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
                        {results.some((r) => r.metrics.beta !== undefined) && (
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
            <div className="bg-surface border border-border rounded-3xl mb-8 overflow-hidden text-left shadow-sm">
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
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
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
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
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
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
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
            <div className="bg-surface border border-border rounded-[2rem] shadow-md mb-8 overflow-hidden text-left">
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
            <div className="bg-surface border border-border rounded-3xl shadow-md mb-12 overflow-hidden border-2 border-border text-left">
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
  );
}
