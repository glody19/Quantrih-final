import React, { useState } from "react";
import { Search, Sparkles, Plus, TrendingUp, ShieldAlert, PieChart, Layers, Check } from "lucide-react";
import { lazyPortfolios } from "../pages/lazyPortfoliosData";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";

export interface LazyPortfolioAsset {
  symbol: string;
  weight: number;
}

export interface LazyPortfolioPreset {
  name: string;
  author?: string;
  description?: string;
  category?: string;
  assets?: LazyPortfolioAsset[];
  allocations?: LazyPortfolioAsset[];
  stocks?: number;
  bonds?: number;
  comm?: number;
  y10?: number;
}

interface PresetPortfoliosSelectorProps {
  onSelectPreset: (preset: LazyPortfolioPreset) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function PresetPortfoliosSelector({
  onSelectPreset,
  disabled = false,
  className = "",
  compact = false,
}: PresetPortfoliosSelectorProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);

  const categories = [
    { id: "all", label: isEn ? "All Models" : "Tous les modèles" },
    { id: "balanced", label: isEn ? "Balanced" : "Équilibrés" },
    { id: "growth", label: isEn ? "Growth" : "Croissance" },
    { id: "defensive", label: isEn ? "Defensive" : "Défensifs" },
  ];

  const filteredPresets = lazyPortfolios.filter((preset) => {
    const matchesSearch =
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (preset.description && preset.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (preset.author && preset.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (preset.assets && preset.assets.some((a) => a.symbol.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory === "balanced") {
      return (preset.stocks || 0) >= 40 && (preset.stocks || 0) <= 70;
    }
    if (selectedCategory === "growth") {
      return (preset.stocks || 0) > 70;
    }
    if (selectedCategory === "defensive") {
      return (preset.stocks || 0) < 40;
    }

    return true;
  });

  const handleApply = (preset: LazyPortfolioPreset) => {
    if (disabled) return;
    onSelectPreset(preset);
    setAppliedPresetName(preset.name);
    setTimeout(() => {
      setAppliedPresetName(null);
    }, 2000);
  };

  return (
    <div className={cn("bg-surface border border-border rounded-3xl p-5 md:p-6 space-y-4 shadow-sm relative overflow-hidden", className)}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-text flex items-center gap-2">
            {isEn ? "Suggested Model Portfolios" : "Modèles de Portefeuilles Prédéfinis"}
            <span className="text-xs font-bold uppercase tracking-wider bg-pv-blue/10 text-pv-blue border border-pv-blue/30 px-2.5 py-0.5 rounded-full">
              {lazyPortfolios.length} {isEn ? "Presets" : "Modèles"}
            </span>
          </h3>
          <p className="text-sm text-text-3 font-medium mt-1">
            {isEn
              ? "Select a benchmark strategy to load preset asset allocations instantly"
              : "Sélectionnez une stratégie benchmark pour charger les allocations en 1 clic"}
          </p>
        </div>

        {/* Search input & category filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? "Search model..." : "Rechercher..."}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border rounded-xl text-text placeholder-text-3 focus:outline-none focus:border-pv-blue transition-colors font-medium"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap",
                  selectedCategory === cat.id
                    ? "bg-pv-blue text-white shadow-sm"
                    : "bg-surface-2 text-text-3 hover:text-text hover:bg-surface-3"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Modern Vertical Scroll Container with Zoom Cards */}
      <div className="relative group/scroll">
        {/* Top/Bottom gradient fade masks for smooth scroll visual effect */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-surface to-transparent z-10 opacity-70" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-surface to-transparent z-10 opacity-70" />

        <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1.5 pt-1 pb-2 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-pv-blue/50 scrollbar-track-transparent transition-colors">
          {filteredPresets.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-3 font-medium border border-dashed border-border rounded-2xl">
              {isEn ? "No portfolio models found matching your search." : "Aucun modèle de portefeuille ne correspond."}
            </div>
          ) : (
            filteredPresets.map((preset, idx) => {
              const assetsList = preset.assets || (preset as any).allocations || [];
              const isJustApplied = appliedPresetName === preset.name;

              return (
                <div
                  key={idx}
                  onClick={() => handleApply(preset)}
                  className={cn(
                    "group relative bg-surface-2/90 hover:bg-surface-3/95 border border-border hover:border-pv-blue/70 rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm hover:shadow-xl hover:shadow-pv-blue/10 cursor-pointer overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                    disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0",
                    isJustApplied && "border-emerald-500/80 bg-emerald-950/20"
                  )}
                >
                  {/* Subtle Zoom Backdrop Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pv-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-pv-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Left Column: Preset Info & Asset Badges */}
                  <div className="space-y-2 flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-text group-hover:text-pv-blue transition-colors flex items-center gap-1.5">
                        {preset.name}
                      </h4>
                      {preset.author && (
                        <span className="text-xs font-semibold text-text-3 bg-surface border border-border px-2.5 py-0.5 rounded-md">
                          {preset.author}
                        </span>
                      )}
                      {preset.y10 && (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <TrendingUp size={12} /> 10Y: +{preset.y10}% CAGR
                        </span>
                      )}
                    </div>

                    {preset.description && (
                      <p className="text-sm text-text-3 font-normal line-clamp-1 group-hover:line-clamp-none transition-all">
                        {preset.description}
                      </p>
                    )}

                    {/* Asset Breakdown Pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {assetsList.map((asset, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-xs font-mono font-bold bg-surface border border-border/80 px-2.5 py-1 rounded-lg text-text flex items-center gap-1.5 group-hover:border-pv-blue/40 transition-colors"
                        >
                          <span className="text-pv-blue">{asset.symbol}</span>
                          <span className="text-text-3">{asset.weight}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Asset Allocation Summary + Apply Button */}
                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-border pt-2 sm:pt-0 z-10">
                    {/* Allocation breakdown badges */}
                    {(preset.stocks !== undefined || preset.bonds !== undefined) && (
                      <div className="hidden md:flex flex-col text-right text-xs font-medium text-text-3 border-r border-border pr-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          <span className="font-bold text-text">{preset.stocks || 0}%</span> {isEn ? "Stocks" : "Actions"}
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span className="font-bold text-text">{preset.bonds || 0}%</span> {isEn ? "Bonds" : "Oblig."}
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(preset);
                      }}
                      className={cn(
                        "px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm transform group-hover:scale-105 shrink-0",
                        isJustApplied
                          ? "bg-emerald-600 text-white"
                          : "bg-pv-blue/10 text-pv-blue group-hover:bg-pv-blue group-hover:text-white border border-pv-blue/30 group-hover:border-pv-blue"
                      )}
                    >
                      {isJustApplied ? (
                        <>
                          <Check size={16} className="animate-bounce" />
                          {isEn ? "Applied!" : "Appliqué !"}
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                          {isEn ? "Apply Preset" : "Appliquer"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
