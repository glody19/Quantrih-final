import React, { useState } from "react";
import { ChevronDown, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";

// Extracted from the justETF list dataset
const ETF_CATEGORIES = [
  {
    key: "momentum",
    name: "Momentum Stocks",
    etfs: [
      { name: "iShares Edge MSCI Europe Momentum Factor UCITS ETF EUR (Dist)", ter: "0.25%", ytd: "7.29%", size: "39", date: "23/02/18", dist: "Distribution", rep: "Optimized sampling", isin: "IE00BG13YJ64", ticker: "IEMD" },
      { name: "iShares Edge MSCI USA Momentum Factor UCITS ETF USD (Dist)", ter: "0.20%", ytd: "29.37%", size: "13", date: "21/02/18", dist: "Distribution", rep: "Full replication", isin: "IE00BFF5RZ82", ticker: "IUMD" }
    ]
  },
  {
    key: "lowvol",
    name: "Low Volatility / Risk Weighted Stocks",
    etfs: [
      { name: "iShares Edge MSCI Europe Minimum Volatility UCITS ETF EUR (Dist)", ter: "0.25%", ytd: "6.12%", size: "23", date: "23/02/18", dist: "Distribution", rep: "Optimized sampling", isin: "IE00BG13YK79", ticker: "MVED" },
      { name: "iShares Edge S&P 500 Minimum Volatility UCITS ETF USD (Dist)", ter: "0.20%", ytd: "6.29%", size: "126", date: "21/02/18", dist: "Distribution", rep: "Optimized sampling", isin: "IE00BD93YH54", ticker: "SPMD" }
    ]
  },
  {
    key: "quality",
    name: "Fundamental / Quality Stocks",
    etfs: [
      { name: "iShares Edge MSCI Europe Quality Factor UCITS ETF EUR (Dist)", ter: "0.25%", ytd: "4.32%", size: "29", date: "23/02/18", dist: "Distribution", rep: "Optimized sampling", isin: "IE00BG13YG34", ticker: "IEQD" },
      { name: "iShares Edge MSCI USA Quality Factor UCITS ETF USD (Dist)", ter: "0.20%", ytd: "10.63%", size: "313", date: "21/02/18", dist: "Distribution", rep: "Full replication", isin: "IE00BF2QSQ20", ticker: "IUQD" }
    ]
  },
  {
    key: "world",
    name: "World Stocks",
    etfs: [
      { name: "Amundi MSCI World Swap II UCITS ETF Dist", ter: "0.30%", ytd: "11.17%", size: "8,539", date: "26/04/06", dist: "Distribution", rep: "Swap-based", isin: "FR0010315770", ticker: "WLD" },
      { name: "iShares MSCI ACWI UCITS ETF USD (Acc)", ter: "0.20%", ytd: "12.56%", size: "28,619", date: "21/10/11", dist: "Accumulating", rep: "Optimized sampling", isin: "IE00B6R52259", ticker: "ISAC" },
      { name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating", ter: "0.19%", ytd: "12.44%", size: "40,588", date: "23/07/19", dist: "Accumulating", rep: "Optimized sampling", isin: "IE00BK5BQT80", ticker: "VWRA" }
    ]
  },
  {
    key: "us",
    name: "US Stocks",
    etfs: [
      { name: "Amundi Core S&P 500 Swap UCITS ETF EUR Dist", ter: "0.05%", ytd: "11.91%", size: "3,089", date: "26/03/10", dist: "Distribution", rep: "Swap-based", isin: "LU0496786574", ticker: "SP5" },
      { name: "iShares Core S&P 500 UCITS ETF USD (Dist)", ter: "0.07%", ytd: "11.92%", size: "18,988", date: "15/03/02", dist: "Distribution", rep: "Full replication", isin: "IE0031442068", ticker: "IUSA" },
      { name: "Vanguard S&P 500 UCITS ETF (USD) Accumulating", ter: "0.07%", ytd: "11.80%", size: "29,018", date: "14/05/19", dist: "Accumulating", rep: "Full replication", isin: "IE00BFMXXD54", ticker: "VUAA" }
    ]
  },
  {
    key: "europe",
    name: "Europe Stocks",
    etfs: [
      { name: "Amundi Core EURO STOXX 50 UCITS ETF EUR Dist", ter: "0.09%", ytd: "6.86%", size: "899", date: "29/06/10", dist: "Distribution", rep: "Full replication", isin: "LU1681047319", ticker: "CD5" },
      { name: "iShares Core MSCI Europe UCITS ETF EUR (Dist)", ter: "0.12%", ytd: "7.06%", size: "10,389", date: "06/07/07", dist: "Distribution", rep: "Optimized sampling", isin: "IE00B1YZSC51", ticker: "IMEU" }
    ]
  }
];

const lexiconLabels: Record<string, Record<string, string>> = {
  en: {
    noEtfs: "No ETFs found",
    adjustSearch: "Try adjusting your search criteria.",
    fundName: "Fund Name",
    annualFees: "Annual Fees",
    ytd: "YTD",
    inPercent: "in %",
    fundSize: "Fund Size",
    inM: "(in M €)",
    inceptionDate: "Inception Date",
    distribution: "Distribution",
    replication: "Replication",
    isin: "ISIN",
    ticker: "Ticker",
    cat_momentum: "Momentum Stocks",
    cat_lowvol: "Low Volatility / Risk Weighted Stocks",
    cat_quality: "Fundamental / Quality Stocks",
    cat_world: "World Stocks",
    cat_us: "US Stocks",
    cat_europe: "Europe Stocks"
  },
  fr: {
    noEtfs: "Aucun ETF trouvé",
    adjustSearch: "Essayez de modifier vos critères de recherche.",
    fundName: "Nom du Fonds",
    annualFees: "Frais Annuels",
    ytd: "YTD",
    inPercent: "en %",
    fundSize: "Taille du Fonds",
    inM: "(en M €)",
    inceptionDate: "Date de Création",
    distribution: "Distribution",
    replication: "Réplication",
    isin: "ISIN",
    ticker: "Ticker",
    cat_momentum: "Actions Momentum",
    cat_lowvol: "Actions Faible Volatilité / Pondérées Risque",
    cat_quality: "Actions Qualité / Fondamentaux",
    cat_world: "Actions Monde",
    cat_us: "Actions USA",
    cat_europe: "Actions Europe"
  },
  de: {
    noEtfs: "Keine ETFs gefunden",
    adjustSearch: "Versuchen Sie, Ihre Suchkriterien anzupassen.",
    fundName: "Fondsname",
    annualFees: "Jährliche Gebühren",
    ytd: "YTD",
    inPercent: "in %",
    fundSize: "Fondsgröße",
    inM: "(in Mio. €)",
    inceptionDate: "Auflagedatum",
    distribution: "Ausschüttung",
    replication: "Replizierung",
    isin: "ISIN",
    ticker: "Ticker",
    cat_momentum: "Momentum-Aktien",
    cat_lowvol: "Geringe Volatilität / Risikogewichtet",
    cat_quality: "Qualitätsaktien / Fundamentaldaten",
    cat_world: "Weltweite Aktien",
    cat_us: "US-Aktien",
    cat_europe: "Europa-Aktien"
  },
  nl: {
    noEtfs: "Geen ETF's gevonden",
    adjustSearch: "Probeer je zoekcriteria aan te passen.",
    fundName: "Fondsnaam",
    annualFees: "Jaarlijkse Kosten",
    ytd: "YTD",
    inPercent: "in %",
    fundSize: "Fondsomvang",
    inM: "(in mln €)",
    inceptionDate: "Lanceringsdatum",
    distribution: "Distributie",
    replication: "Replicatie",
    isin: "ISIN",
    ticker: "Ticker",
    cat_momentum: "Momentum Aandelen",
    cat_lowvol: "Lage Volatiliteit / Risicogewogen",
    cat_quality: "KwaliteitsAandelen / Fundamenteel",
    cat_world: "Wereldaandelen",
    cat_us: "VS Aandelen",
    cat_europe: "Europa Aandelen"
  },
  es: {
    noEtfs: "No se encontraron ETFs",
    adjustSearch: "Pruebe a ajustar sus criterios de búsqueda.",
    fundName: "Nombre del Fondo",
    annualFees: "Comisión Anual",
    ytd: "YTD",
    inPercent: "en %",
    fundSize: "Tamaño del Fondo",
    inM: "(en M €)",
    inceptionDate: "Fecha de Creación",
    distribution: "Distribución",
    replication: "Replicación",
    isin: "ISIN",
    ticker: "Ticker",
    cat_momentum: "Acciones Momentum",
    cat_lowvol: "Acciones Baja Volatilidad / Ponderadas por Riesgo",
    cat_quality: "Acciones de Calidad / Fundamentales",
    cat_world: "Acciones Globales",
    cat_us: "Acciones EE. UU.",
    cat_europe: "Acciones Europa"
  }
};

export function EtfLexicon({ language: propLanguage, search }: { language: string, search: string }) {
  const { language } = useTranslation();
  const activeLang = language || propLanguage || 'en';
  const t = lexiconLabels[activeLang] || lexiconLabels.en;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    ETF_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
  );

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const safeSearch = (search || "").toLowerCase().trim();

  // Filter based on search
  const categoriesToRender = ETF_CATEGORIES.map(cat => {
    const filteredEtfs = cat.etfs.filter(etf => 
      etf.name.toLowerCase().includes(safeSearch) || 
      etf.ticker.toLowerCase().includes(safeSearch) ||
      etf.isin.toLowerCase().includes(safeSearch)
    );
    return { ...cat, etfs: filteredEtfs };
  }).filter(cat => cat.etfs.length > 0);

  return (
    <section className="animate-fade-in bg-white rounded-[2rem] shadow-sm border border-border pb-8 overflow-hidden">
      {categoriesToRender.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <Database size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-xl font-bold text-text mb-2">{t.noEtfs}</h3>
          <p className="text-text font-medium">{t.adjustSearch}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {categoriesToRender.map((category, idx) => {
            const displayName = t[`cat_${category.key}`] || category.name;
            return (
            <div key={idx} className="w-full text-text">
              <button 
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 py-4 px-6 text-left hover:bg-surface-2 transition-colors"
              >
                <h3 className={cn("text-xl font-semibold tracking-tight transition-colors", openCategories[category.name] ? "text-amber-600" : "text-text")}>
                  {displayName}
                </h3>
                <div className={cn("text-amber-600 transition-transform duration-200", openCategories[category.name] ? "rotate-180" : "rotate-0")}>
                  <ChevronDown size={20} strokeWidth={2.5} />
                </div>
              </button>

              <AnimatePresence>
                {openCategories[category.name] && (
                  <motion.div 
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap min-w-[1000px]">
                        <thead className="text-sm font-bold text-text bg-surface-2 border-y border-surface-2">
                          <tr>
                            <th className="px-6 py-3 font-semibold">{t.fundName}</th>
                            <th className="px-4 py-3 font-semibold text-right">{t.annualFees}</th>
                            <th className="px-4 py-3 font-semibold text-right">{t.ytd}<br/><span className="lowercase text-xs font-normal">{t.inPercent}</span></th>
                            <th className="px-4 py-3 font-semibold text-right">{t.fundSize}<br/><span className="lowercase text-xs font-normal">{t.inM}</span></th>
                            <th className="px-4 py-3 font-semibold">{t.inceptionDate}</th>
                            <th className="px-4 py-3 font-semibold">{t.distribution}</th>
                            <th className="px-4 py-3 font-semibold">{t.replication}</th>
                            <th className="px-4 py-3 font-semibold">{t.isin}</th>
                            <th className="px-6 py-3 font-semibold">{t.ticker}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {category.etfs.map((etf, etfIdx) => (
                            <tr key={etfIdx} className="hover:bg-surface-2 group">
                              <td className="px-6 py-4">
                                <a href="#" className="font-medium text-text group-hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-600 underline-offset-4 transition-colors">
                                  {etf.name}
                                </a>
                              </td>
                              <td className="px-4 py-4 text-right text-text">{etf.ter}</td>
                              <td className="px-4 py-4 text-right tabular-nums text-text">{etf.ytd}</td>
                              <td className="px-4 py-4 text-right tabular-nums text-text">{etf.size}</td>
                              <td className="px-4 py-4 text-text">{etf.date}</td>
                              <td className="px-4 py-4 text-text">{etf.dist}</td>
                              <td className="px-4 py-4 text-text">{etf.rep}</td>
                              <td className="px-4 py-4 font-mono text-sm text-text">{etf.isin}</td>
                              <td className="px-6 py-4 text-text">{etf.ticker}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
