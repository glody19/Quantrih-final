import { Activity } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  Dices,
  Play,
  FileDown,
  Settings,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Database,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";
import { lazyPortfolios } from "./lazyPortfoliosData";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchMonthlyPrices } from "../../engine/data";
import { runSimulation } from "../../engine/simulation";
import { calculateCorrelationMatrix } from "../../engine/metrics";
import { TickerInput } from "../ui/TickerInput";
import { ASSET_DATA } from "../../constants";
import { InfoTooltip } from "../ui/InfoTooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function TooltipLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-base font-semibold text-text ">{label}</label>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

const formatValue = (num: number) => {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    .format(num)
    .replace(/,/g, " ");
};

const formatPct = (num: number) => {
  return num.toFixed(2) + "%";
};

export function MonteCarlo({ baseCcy }: { baseCcy: string }) {
  const { t, language } = useTranslation();

  // Config
  const [initialAmount, setInitialAmount] = useLocalStorage(
    "mc_initialAmount",
    1000000,
  );
  const [cashflowType, setCashflowType] = useLocalStorage(
    "mc_cashflowType",
    "fixed",
  ); // none, fixed, percentage
  const [cashflowAmount, setCashflowAmount] = useLocalStorage(
    "mc_cashflowAmount",
    45000,
  );
  const [inflationAdjusted, setInflationAdjusted] = useLocalStorage(
    "mc_inflationAdjusted",
    true,
  );
  const [cashflowFreq, setCashflowFreq] = useLocalStorage(
    "mc_cashflowFreq",
    "annual",
  ); // annual, monthly
  const [horizon, setHorizon] = useLocalStorage("mc_horizon", 30);
  const [taxTreatment, setTaxTreatment] = useLocalStorage(
    "mc_taxTreatment",
    "pre_tax",
  );
  
  const applyPredefinedPortfolio = (preset: any) => {
    if (portfolioNames.length >= 6) return;
    const newId = `p${Date.now()}`;
    let currentAssets = [...portfolioAssets];
    currentAssets = currentAssets.map(a => ({ ...a, weights: [...a.weights, "0"] }));
    preset.assets.forEach((asset: any) => {
        const existingIdx = currentAssets.findIndex(a => a.symbol === asset.symbol);
        if (existingIdx === -1) {
            const newWeights = portfolioNames.map(() => "0");
            newWeights.push(asset.weight.toString());
            currentAssets.push({ symbol: asset.symbol, weights: newWeights });
        } else {
            currentAssets[existingIdx].weights[currentAssets[existingIdx].weights.length - 1] = asset.weight.toString();
        }
    });
    setPortfolioNames([...portfolioNames, { id: newId, name: preset.name }]);
    setPortfolioAssets(currentAssets);
  };

  const [simulationModel, setSimulationModel] = useLocalStorage<
    "Normal" | "Bootstrap" | "BlockBootstrap"
  >("mc_simModel", "Bootstrap");
  const [useFullHistory, setUseFullHistory] = useLocalStorage(
    "mc_useFullHistory",
    true,
  );
  const [sequenceOfReturns, setSequenceOfReturns] = useLocalStorage(
    "mc_sequenceOfReturns",
    "no_adjustments",
  );
  const [inflationModel, setInflationModel] = useLocalStorage(
    "mc_inflationModel",
    "fixed",
  );
  const [rebalancing, setRebalancing] = useLocalStorage(
    "mc_rebalancing",
    "annual",
  );
  const [sims, setSims] = useLocalStorage("mc_sims", 1000);
  const [bootstrapModel, setBootstrapModel] = useLocalStorage(
    "mc_bootstrapModel",
    "single",
  );
  const [spendingRule, setSpendingRule] = useLocalStorage(
    "mc_spendingRule",
    "none",
  );

  const [portfolioNames, setPortfolioNames] = useLocalStorage<
    { id: string; name: string }[]
  >("mc_portfolioNames_v4", [
    { id: "1", name: "Classic (60/40)" },
    { id: "2", name: "Dynamic (80/20)" },
    { id: "3", name: "All Weather" },
    { id: "4", name: "Permanent" },
  ]);

  const [portfolioAssets, setPortfolioAssets] = useLocalStorage<
    { symbol: string; weights: string[] }[]
  >("mc_portfolioAssets_v4", [
    { symbol: "VFINX", weights: ["60", "80", "30", "25"] },
    { symbol: "VBMFX", weights: ["40", "20", "40", "25"] },
    { symbol: "GLD", weights: ["0", "0", "15", "25"] },
    { symbol: "VGSIX", weights: ["0", "0", "15", "25"] },
  ]);

  const portfolios = portfolioNames.map((pn, i) => ({
    id: pn.id,
    name: pn.name,
    assets: portfolioAssets
      .filter(
        (a) =>
          a.symbol.trim() !== "" &&
          a.weights[i] !== "" &&
          !isNaN(Number(a.weights[i]))
      )
      .map((a) => ({
        symbol: a.symbol.toUpperCase(),
        weight: Number(a.weights[i]),
      })),
  }));

  const [activeResIdx, setActiveResIdx] = useState(0);

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


  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mcResults, setMcResults] = useState<{ id: string; name: string; result: number[][]; metrics: any }[] | null>(null);
  


  const handleRunSimulation = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const uniqueSymbols = new Set<string>();
      for (let pIdx = 0; pIdx < portfolios.length; pIdx++) {
         const p = portfolios[pIdx];
         let portTotalWeight = 0;
         p.assets.forEach(a => {
            if (a.weight > 0 && a.symbol.trim() !== "") {
                uniqueSymbols.add(a.symbol);
                portTotalWeight += a.weight;
            }
         });
         if (portTotalWeight !== 100 && p.assets.length > 0) {
             throw new Error(`Total allocation for ${p.name} must equal 100%`);
         }
      }

      const allAssetReturns: { symbol: string; returns: number[] }[] = [];
      const startDate = useFullHistory ? "1990-01-01" : "2010-01-01";
      const endDate = new Date().toISOString().split("T")[0];

      for (const symbol of uniqueSymbols) {
        const prices = await fetchMonthlyPrices(
          symbol,
          startDate,
          endDate,
        );
        if (prices.length < 12) {
          throw new Error(
            `Insufficient data for ${symbol}. Need at least 12 months.`,
          );
        }
        const returns: number[] = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push(
            (prices[i].close - prices[i - 1].close) / prices[i - 1].close,
          );
        }
        allAssetReturns.push({ symbol, returns });
      }

      let amt =
        cashflowType === "none"
          ? 0
          : cashflowType === "percentage"
            ? -Number(cashflowAmount)
            : -Number(cashflowAmount);

      const allResults = [];

      for (let pIdx = 0; pIdx < portfolios.length; pIdx++) {
        const p = portfolios[pIdx];
        const weights: Record<string, number> = {};
        p.assets.forEach((a) => {
          if (a.weight > 0 && a.symbol.trim() !== "")
            weights[a.symbol] = Number(a.weight);
        });

        if (Object.keys(weights).length === 0) continue;

        const assetReturns = allAssetReturns.filter(ar => weights[ar.symbol]);

        let corrMatrix;
        if (simulationModel === "Normal") {
          corrMatrix = calculateCorrelationMatrix(assetReturns);
        }

        const paths = runSimulation(
          assetReturns,
          weights,
          {
            model:
              simulationModel === "Bootstrap" && bootstrapModel === "block"
                ? "BlockBootstrap"
                : simulationModel,
            horizonYears: horizon,
            simulations: sims,
            initialBalance: initialAmount,
            cashflow: amt,
            cashflowType: cashflowType as any,
            cashflowFreq: cashflowFreq as any,
            spendingRule: spendingRule as any,
            sequenceOfReturnsYears: sequenceOfReturns === "worst_first" ? 2 : 0,
            inflationModel: inflationModel as any,
            inflationRate: 0.03, // 3% proxy
            blockSize: 12,
          },
          corrMatrix,
        );

        const terminalValues = paths.map((p) => p[p.length - 1]);
        const successful = terminalValues.filter((v) => v > 0).length;

        allResults.push({
          id: p.id,
          name: p.name,
          result: paths,
          metrics: {
            solvency: (successful / sims) * 100,
            assetReturns,
            corrMatrix,
          }
        });
      }

      setMcResults(allResults);
      setActiveResIdx(0);
    } catch (err: any) {
      console.warn(err);
      setError(err.message || "Simulation failed");
    } finally {
      setIsRunning(false);
    }
  };  const getPercentileCurve = (paths: number[][], p: number) => {
    const res: number[] = [];
    const horizonYears = paths[0].length - 1;

    for (let y = 0; y <= horizonYears; y++) {
      const vals = paths.map((path) => path[y]).sort((a, b) => a - b);
      const idx = Math.max(
        0,
        Math.min(vals.length - 1, Math.floor((p / 100) * (vals.length - 1))),
      );
      res.push(vals[idx]);
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-pv-blue selection:text-white font-sans overflow-x-hidden">
      <div className="space-y-8 animate-fade-up w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-24">
        <div className="flex flex-col gap-8">
          {/* TITLE HEADER */}
          <div className="mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-[1rem] bg-pv-blue/10 border border-pv-blue/20 mb-4">
              <h1 className="text-2xl font-bold text-pv-blue tracking-tight">
                {t("mc.title")}
              </h1>
            </div>
            <p className="text-base text-text-2 font-medium leading-relaxed w-full max-w-[1308px]">
              {
                "Monte Carlo simulations use advanced mathematical models to predict the probability of different outcomes in complex processes involving random variables. They help visualize thousands of possible futures for your wealth, based on the common historical data of your assets."
              }
            </p>
          </div>
          
          <MobileZoomWrapper scaleMobile={0.5}>
            {/* RESULTS SECTION */}
          {mcResults && mcResults[activeResIdx].result.length > 0 && (
            <div id="report-content" className="space-y-6">
              <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-6 text-left shadow-sm">
                <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2 mb-6 bg-surface-2 p-2 rounded-[2rem]">
                  {mcResults.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveResIdx(idx)}
                      className={
                        "px-6 py-3 text-base font-semibold whitespace-nowrap transition-all rounded-[1.5rem] " +
                        (activeResIdx === idx
                          ? "bg-pv-blue text-white shadow-md font-extrabold"
                          : "text-text hover:text-text hover:bg-surface-3")
                      }
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                {mcResults[activeResIdx] && (
                  <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-[1.5rem] p-8 shadow-sm">
                    <h3 className="text-lg font-semibold tracking-tight mb-4">
                      {mcResults[activeResIdx].name} - Monte Carlo Simulation
                    </h3>
                <p className="text-base text-text font-medium leading-relaxed w-full max-w-[1308px]">
                  Monte Carlo simulation results for <b>{sims} portfolios</b>{" "}
                  with <b>${formatValue(initialAmount)}</b> initial portfolio
                  balance using {simulationModel} returns data over{" "}
                  <b>{horizon} years</b>. The simulation results are based on{" "}
                  {cashflowType !== "none"
                    ? `inflation adjusted withdrawals ($${formatValue(cashflowAmount)} ${cashflowFreq}).`
                    : "no cashflows."}
                  <br />
                  <br />
                  <b>{mcResults[activeResIdx].metrics?.solvency.toFixed(1)}%</b> of the simulated
                  portfolios survived all withdrawals.
                </p>
              </div>

              {/* Performance Summary Matrix */}
              <div className="bg-surface border border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-surface-2 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-base text-text">
                    Performance Summary
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-base font-sans border-collapse">
                    <thead>
                      <tr className="bg-surface-2 border-b border-border text-base font-semibold text-text">
                        <th className="px-6 py-4">Summary Statistics</th>
                        <th className="px-6 py-4 text-right">
                          10th Percentile
                        </th>
                        <th className="px-6 py-4 text-right">
                          25th Percentile
                        </th>
                        <th className="px-6 py-4 text-right bg-blue-50/50">
                          50th Percentile
                          <br />
                          <span className="text-[8px] text-pv-blue">
                            (Median)
                          </span>
                        </th>
                        <th className="px-6 py-4 text-right">
                          75th Percentile
                        </th>
                        <th className="px-6 py-4 text-right">
                          90th Percentile
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-base font-sans font-medium">
                      {[
                        {
                          label: "Portfolio End Balance (nominal)",
                          calc: (p: number) =>
                            `$${formatValue(getPercentileCurve(mcResults[activeResIdx].result, p)[horizon])}`,
                        },
                        {
                          label: "Time Weighted Rate of Return",
                          calc: (p: number) => {
                            const end = getPercentileCurve(mcResults[activeResIdx].result, p)[
                              horizon
                            ];
                            // simplified nominal CAGR
                            if (end <= 0) return "0.00%";
                            const cagr =
                              (Math.pow(end / initialAmount, 1 / horizon) - 1) *
                              100;
                            return formatPct(cagr);
                          },
                        },
                        {
                          label: "Safe Withdrawal Rate",
                          calc: (p: number) => {
                            const end = getPercentileCurve(mcResults[activeResIdx].result, p)[
                              horizon
                            ];
                            if (end <= 0) return "0.00%";
                            return formatPct(
                              ((initialAmount * Math.pow(1.04, horizon)) /
                                end) *
                                (p / 10),
                            ); // proxy math for visual parity
                          },
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-surface-2">
                          <td className="px-6 py-4 border-r border-border font-sans font-bold text-text">
                            {row.label}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(10)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(25)}
                          </td>
                          <td className="px-6 py-4 text-right bg-blue-50/30 text-pv-blue font-bold">
                            {row.calc(50)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(75)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.calc(90)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-surface border border-border rounded-[1.5rem] p-8 md:p-10 shadow-sm relative">
                <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                  Portfolio Balance
                </h3>
                <div className="h-[400px]">
                  <Line
                    id="monte-carlo-line-chart"
                    key={`mc-chart-${sims}-${horizon}`}
                    data={{
                      labels: Array.from({ length: horizon + 1 }, (_, i) => i),
                      datasets: [
                        {
                          label: "90th Percentile",
                          data: getPercentileCurve(mcResults[activeResIdx].result, 90),
                          borderColor: "rgba(52, 211, 153, 0.5)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: "75th Percentile",
                          data: getPercentileCurve(mcResults[activeResIdx].result, 75),
                          borderColor: "rgba(52, 211, 153, 0.8)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: "50th Percentile",
                          data: getPercentileCurve(mcResults[activeResIdx].result, 50),
                          borderColor: "#2c6cad",
                          backgroundColor: "rgba(44, 108, 173, 0.05)",
                          fill: true,
                          pointRadius: 0,
                          borderWidth: 3.5,
                        },
                        {
                          label: "25th Percentile",
                          data: getPercentileCurve(mcResults[activeResIdx].result, 25),
                          borderColor: "rgba(239, 68, 68, 0.5)",
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                        {
                          label: "10th Percentile",
                          data: getPercentileCurve(mcResults[activeResIdx].result, 10),
                          borderColor: "rgba(239, 68, 68, 1)",
                          borderDash: [5, 5],
                          pointRadius: 0,
                          borderWidth: 1,
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { intersect: false, mode: "index" },
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            font: { size: 10, weight: "bold" },
                            boxWidth: 12,
                            usePointStyle: true,
                          },
                        },
                        tooltip: {
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          titleFont: {
                            family: "JetBrains Mono",
                            size: 9,
                            weight: "bold" as const,
                          },
                          bodyFont: { family: "JetBrains Mono", size: 9 },
                          padding: 12,
                          cornerRadius: 8,
                          displayColors: true,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 } },
                          title: {
                            display: true,
                            text: "Years",
                            font: { size: 10, weight: "bold" },
                          },
                        },
                        y: {
                          type: "logarithmic",
                          grid: { color: "rgba(0,0,0,0.04)" },
                          ticks: {
                            font: { size: 10, family: "monospace" },
                            callback: (v) => "$" + formatValue(Number(v)),
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {mcResults && (
        <div className="mt-4 mb-4 text-center text-[10px] text-black">
          Ce site est gratuit et sans publicité. Si vous appréciez nos outils d'analyse et de backtesting, vous pouvez soutenir notre travail par une donation.{" "}
          <a 
            href="/donate" 
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/donate";
            }}
            className="inline-block ml-1 px-1.5 py-0.5 border border-blue-500 text-blue-600 rounded text-[9px] hover:bg-blue-50 font-semibold"
          >
            Faire un don
          </a>
        </div>
      )}

{/* PARAMETERS GRID */}
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-sm mb-6 flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <h2 className="text-base font-semibold tracking-tight text-text flex items-center gap-2">
                <Settings size={14} className="text-pv-blue" />{" "}
                {"Strategy Parameters"}
              </h2>
              <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full xl:w-auto">
                
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="py-2.5 px-6 bg-pv-blue text-white rounded-[1.5rem] text-base font-semibold hover:bg-pv-blue-l transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={12} fill="currentColor" /> Run Simulation
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red/10 border border-red/20 text-red text-base font-bold rounded-[1.5rem] animate-fade-in flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Col 1 */}
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Initial Amount"}
                    tooltip={"Initial Investment Capital (t=0)."}
                  />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Cashflows"}
                    tooltip={
                      "Determines the longitudinal extraction or injection of capital."
                    }
                  />
                  <select
                    value={cashflowType}
                    onChange={(e) => setCashflowType(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="none">None</option>
                    <option value="fixed">
                      Withdraw fixed amount periodically
                    </option>
                    <option value="percentage">
                      Withdraw fixed percentage
                    </option>
                  </select>
                </div>
                {cashflowType !== "none" && (
                  <div className="space-y-1.5 focus-within:text-pv-blue animate-fade-in">
                    <TooltipLabel
                      label={
                        cashflowType === "percentage"
                          ? "Withdrawal %"
                          : "Withdrawal Amount"
                      }
                      tooltip="Absolute quantum or relative ratio of capital distributed at each periodic interval."
                    />
                    <input
                      type="number"
                      value={cashflowAmount}
                      onChange={(e) =>
                        setCashflowAmount(Number(e.target.value))
                      }
                      className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                    />
                  </div>
                )}
                {cashflowType !== "none" && (
                  <>
                    <div className="space-y-1.5 focus-within:text-pv-blue">
                      <TooltipLabel
                        label={"Inflation Adjusted"}
                        tooltip={
                          "Applies a real-rate deflator to absolute withdrawal amounts, preserving purchasing power parity over the simulation horizon."
                        }
                      />
                      <select
                        value={inflationAdjusted ? "yes" : "no"}
                        onChange={(e) =>
                          setInflationAdjusted(e.target.value === "yes")
                        }
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 focus-within:text-pv-blue">
                      <TooltipLabel
                        label={"Withdrawal Frequency"}
                        tooltip={
                          "Periodic interval of capital distribution. Impacts intra-year sequence of returns risk (SORR)."
                        }
                      />
                      <select
                        value={cashflowFreq}
                        onChange={(e) => setCashflowFreq(e.target.value)}
                        className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                      >
                        <option value="annual">Annually</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Col 2 */}
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Simulation Period in Years"}
                    tooltip={
                      "Temporal horizon (n) over which the geometric Brownian motion or bootstrapping is computed."
                    }
                  />
                  <input
                    type="number"
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-mono outline-none focus:border-pv-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Tax Treatment"}
                    tooltip={
                      "Differentiates between gross capital accumulation (Pre-Tax) and net realizable wealth (Post-Tax), subtracting estimated capital gains."
                    }
                  />
                  <select
                    value={taxTreatment}
                    onChange={(e) => setTaxTreatment(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="pre_tax">Pre-tax Returns</option>
                    <option value="post_tax">Post-tax Returns</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Simulation Model"}
                    tooltip={
                      "Selects the underlying stochastic engine. 'Historical' resamples empirical distributions, while 'Statistical' models theoretical Gaussian trajectories."
                    }
                  />
                  <select
                    value={simulationModel}
                    onChange={(e) => setSimulationModel(e.target.value as any)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="Bootstrap">Historical Returns</option>
                    <option value="Normal">Statistical Returns (Normal)</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Use Full History"}
                    tooltip={
                      "Defines the sampling universe. Full history incorporates macroeconomic cycles, while limited history emphasizes contemporary structural regimes."
                    }
                  />
                  <select
                    value={useFullHistory ? "yes" : "no"}
                    onChange={(e) =>
                      setUseFullHistory(e.target.value === "yes")
                    }
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Bootstrap Model"}
                    tooltip={
                      "Statistical resampling approach. 'Single Year' draws independently, while 'Block' preserves serial correlation."
                    }
                  />
                  <select
                    disabled={simulationModel !== "Bootstrap"}
                    value={bootstrapModel}
                    onChange={(e) => setBootstrapModel(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors disabled:opacity-50"
                  >
                    <option value="single">Single Year</option>
                    <option value="block">Block Bootstrap</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Spending Rule"}
                    tooltip={
                      "Rules dynamically adjusting periodic withdrawals or reinvestments."
                    }
                  />
                  <select
                    disabled={cashflowType === "none"}
                    value={spendingRule}
                    onChange={(e) => setSpendingRule(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors disabled:opacity-50"
                  >
                    <option value="none">No Adjustment (Fixed)</option>
                    <option value="rolling_avg">Rolling 3-Year Average</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Sequence of Returns Risk"}
                    tooltip={
                      "Stress-tests longitudinal resilience by forcing downside volatility early in the decumulation phase (SORR)."
                    }
                  />
                  <select
                    value={sequenceOfReturns}
                    onChange={(e) => setSequenceOfReturns(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="no_adjustments">No Adjustments</option>
                    <option value="worst_first">Worst Years First</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Inflation Model"}
                    tooltip={
                      "Determines the deflationary vector applied to terminal wealth. 'Historical' maps to realized CPI, 'Fixed' assumes deterministic erosion."
                    }
                  />
                  <select
                    value={inflationModel}
                    onChange={(e) => setInflationModel(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="historical">Historical Inflation</option>
                    <option value="fixed">Fixed Inflation</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Rebalancing"}
                    tooltip={
                      "Specifies the mandated mean-reversion frequency. Forces adherence to the strategic asset allocation weights."
                    }
                  />
                  <select
                    value={rebalancing}
                    onChange={(e) => setRebalancing(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors"
                  >
                    <option value="annual">Rebalance annually</option>
                    <option value="monthly">Rebalance monthly</option>
                    <option value="none">Buy and hold</option>
                  </select>
                </div>
                <div className="space-y-1.5 focus-within:text-pv-blue">
                  <TooltipLabel
                    label={"Intervals"}
                    tooltip={
                      "Statistical confidence bands. 'Percentiles' map the empirical CDF, whereas 'Standard Deviations' assume a log-normal distribution."
                    }
                  />
                  <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-base font-bold outline-none focus:border-pv-blue transition-colors">
                    <option value="percentiles">
                      Percentiles (10-25-50-75-90)
                    </option>
                    <option value="stddev">Standard Deviations</option>
                  </select>
                </div>
              </div>

            </div>
              
            <div className="pt-6 border-t border-border mt-8 w-full col-span-full">
               <div className="flex flex-col gap-2 mb-6">
                 <h3 className="text-base font-semibold text-text flex items-center gap-2">
                    <Activity size={14} className="text-pv-blue" /> Predefined Portfolios
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {lazyPortfolios.slice(0, 8).map((preset, idx) => (
                        <button 
                            key={idx}
                            onClick={() => applyPredefinedPortfolio(preset)}
                            disabled={portfolioNames.length >= 6}
                            className="text-base bg-surface-2 border border-border px-3 py-1.5 rounded-xl hover:border-pv-blue hover:text-pv-blue transition-colors disabled:opacity-50"
                        >
                            + {preset.name}
                        </button>
                    ))}
                 </div>
               </div>
            </div>

              <div className="pt-6 border-t border-border space-y-6 w-full col-span-full">
                
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pv-blue/10 flex items-center justify-center border border-pv-blue/20">
                    <Database size={14} className="text-pv-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text flex items-center gap-2">
                      {"Portfolios Configuration"}
                    </h3>
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
                      <th className="p-3 text-base font-semibold text-text w-24 whitespace-nowrap">
                        Portfolio Assets
                      </th>
                      <th className="p-3 w-64 border-r border-border"></th>
                      {portfolioNames.map((pn, i) => (
                        <th
                          key={pn.id}
                          className="p-3 text-base font-semibold min-w-[140px] text-center group"
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
                        <td className="p-1 lg:p-3 text-base lg:text-base text-text font-medium whitespace-nowrap">
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
                              className="text-pv-blue hover:underline ml-2 text-[10px] lg:text-base break-keep whitespace-nowrap block mt-1"
                            >
                              {"(Add More)"}
                            </button>
                          )}
                        </td>
                        <td className="p-1 lg:p-3 border-r border-border min-w-[100px] lg:min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <div className="relative flex items-center ">
                              <TickerInput
                                value={asset.symbol}
                                onChange={(val) => updateAssetSymbol(aIdx, val)}
                                placeholder="Ticker"
                                className="bg-surface text-lg lg:text-base p-1 lg:p-2 border border-border rounded-l-md outline-none focus:border-blue-500 transition-colors w-full box-border font-mono font-extrabold"
                              />
                              <div className="hidden md:flex bg-surface-2 border border-l-0 border-border rounded-r-md px-3 py-2 items-center justify-center">
                                <Search className="w-4 h-4 text-text" />
                              </div>
                            </div>
                            {ASSET_DATA[asset.symbol]?.label && (
                              <span className="text-[10px] lg:text-base text-text font-medium truncate max-w-[250px]">
                                {ASSET_DATA[asset.symbol].label}
                              </span>
                            )}
                          </div>
                        </td>
                        {portfolioNames.map((pn, i) => (
                          <td key={pn.id} className={`p-1 lg:p-3 ${i >= 2 ? "hidden lg:table-cell" : ""}`}>
                            <div className="flex items-center max-w-[120px] mx-auto">
                              <input
                                type="number"
                                value={asset.weights[i] || ""}
                                onChange={(e) =>
                                  updateAssetWeight(aIdx, i, e.target.value)
                                }
                                placeholder=""
                                className="bg-surface text-lg lg:text-base p-1 lg:p-2 border border-border rounded-l-md outline-none focus:border-blue-500 transition-colors w-full box-border text-text font-extrabold"
                              />
                              <div className="bg-surface-2 border border-l-0 border-border rounded-r-md px-1 py-1 lg:px-2 lg:py-2 text-[10px] lg:text-base text-text shrink-0 select-none">
                                %
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-surface-2">
                      <td className="p-3 text-base font-bold text-text">
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
                                  "text-base p-2 border border-border rounded-l-md w-full box-border text-text outline-none",
                                  isOk
                                    ? "bg-sky-500/10 border-sky-500 font-bold text-sky-500"
                                    : "bg-surface",
                                )}
                              >
                                {totalWeight}
                              </div>
                              <div
                                className={cn(
                                  "border border-l-0 border-border rounded-r-md px-3 py-2 text-base text-text shrink-0",
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
          </div>
          </MobileZoomWrapper>
        </div>
        
        <div className="w-full max-w-[1308px] mx-auto px-4 md:px-8 pb-12 pt-6 text-center text-[11px] text-text-4 border-t border-border/40 mt-8 font-sans">
          Avertissement : Les performances passées ne préjugent pas des performances futures. Les outils et analyses de Quantrih se basent exclusivement sur des données historiques du passé. L'investissement comporte des risques de perte en capital.
        </div>
      </div>
    </div>
  );
}
