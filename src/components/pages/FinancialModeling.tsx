import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, FileDown, Printer, FileText, Search, TrendingUp, DollarSign, Activity, BarChart2, Info, Sparkles, Newspaper, Filter, ChevronRight, Database, Presentation, Maximize2, Minimize2, Trash2, Plus, X, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TradingViewChart } from '../ui/TradingViewChart';
import { AdvancedTradingViewChart } from '../ui/AdvancedTradingViewChart';
import { cn } from '../../lib/utils';
import { PageHeader } from '../ui/PageHeader';
import { FMP_RATIOS } from '../../data/fmpRatios';
import { useFinancialData } from '../../hooks/useFinancialData';
import { StatCard } from '../ui/StatCard';
import { TickerInput } from '../ui/TickerInput';
import { AssetLogo } from '../ui/AssetLogo';
import { FinancialTable } from '../ui/FinancialTable';
import { InfoTooltip } from '../ui/InfoTooltip';
import { ASSET_DATA } from '../../constants';
import { EtfScreener } from './EtfScreener';
import { useTranslation } from '../../contexts/LanguageContext';
import { MobileZoomWrapper } from '../ui/MobileZoomWrapper';

import { topETFs } from './etfData';
import { assetClasses, majorIndices, megatrends } from './assetClassesData';
import { lazyPortfolios } from './lazyPortfoliosData';

const MARQUEE_SYMBOLS = [
 "GOOGL", "AMZN", "META", "TSLA", "AAPL", "NVDA", "MSFT", "IBKR", "SPCX",
 "BTC-USD", "ETH-USD", "^GSPC", "^DJI", "^IXIC", "^RUT", "BRK-B", "LLY", "AVGO",
 "JPM", "V", "WMT", "UNH", "MA", "PG", "JNJ", "HD", "ORCL", "COST", "BAC", "CVX",
 "NVO", "ASML", "SAP",
 "MC.PA", "OR.PA", "TTE.PA", "SAN.PA", "AIR.PA", "SU.PA", "BNP.PA", "RMS.PA", "AI.PA", "CS.PA",
 "SHEL.L", "AZN.L", "HSBA.L", "ULVR.L", "BP.L", "GSK.L", "BATS.L", "DGE.L", "RIO.L", "RELX.L"
];

const PRESTIGE_NEWS = [
 {
 title: "Global Markets Rally as Fed Signals Potential Rate Cuts",
 source: "Bloomberg",
 date: "2 Hours Ago",
 summary: "Equities surged across major indices today as the Federal Reserve hinted at easing monetary policy in the upcoming quarter, providing relief to global macro sectors.",
 image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
 url: "https://www.bloomberg.com/markets"
 },
 {
 title: "BlackRock's iShares ETF Triggers New Institutional Wave",
 source: "BlackRock",
 date: "4 Hours Ago",
 summary: "A massive influx of institutional capital into BlackRock's flagship ETF suggests a structural shift in how pension funds approach digital asset allocations.",
 image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
 url: "https://www.blackrock.com/us/individual/insights"
 },
 {
 title: "European Sovereign Debt Faces Unprecedented Pressure",
 source: "Financial Times",
 date: "5 Hours Ago",
 summary: "Bond yields hit historic highs in several Eurozone nations amid concerns over sovereign balance sheets and persistent core inflation metrics.",
 image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
 url: "https://www.ft.com/markets"
 },
 {
 title: "Tech Giants Propel Nasdaq to Historic Valuations",
 source: "Nasdaq",
 date: "6 Hours Ago",
 summary: "Driven by advancements in artificial intelligence hardware, major tech components of the Nasdaq-100 lifted the index past critical psychological resistance levels.",
 image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
 url: "https://www.nasdaq.com/news-and-insights"
 },
 {
 title: "Commodities Supercycle: Oil and Gold Hit Multi-Year Highs",
 source: "Wall Street Journal",
 date: "8 Hours Ago",
 summary: "Energy and precious metals are riding a wave of supply chain disruptions and geopolitical premiums, establishing what analysts term a new supercycle.",
 image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
 url: "https://www.wsj.com/finance"
 },
 {
 title: "Vanguard Shifts Focus Towards Emerging Market Value",
 source: "Vanguard",
 date: "12 Hours Ago",
 summary: "The passive investing giant is quietly revamping its core emerging markets strategy, placing heavier emphasis on undervalued equities in Latin America.",
 image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800",
 url: "https://investor.vanguard.com/investor-resources-education/news"
 }
];

function TickerItem({ item, tickerPrices, formatCryptoPrice, onClick }: { item: any, tickerPrices: any, formatCryptoPrice: (p: number) => string, onClick?: () => void }) {
  const q = tickerPrices[item.id] || item;
  const currentPrice = q.price;

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 px-6 h-full transition-colors cursor-pointer bg-white hover:bg-surface-2"
    >
      <span className="text-sm font-medium text-text">{item.symbol}</span>
      <span className="text-sm font-mono font-bold">
        <BlinkingPriceText 
          price={currentPrice} 
          formattedText={item.id.includes('usdt') ? formatCryptoPrice(currentPrice) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
        />
      </span>
    </div>
  );
}

function PriceCell({ price, animate }: { price: number, animate?: boolean }) {
  const [blink, setBlink] = useState('');
  const prevPrice = useRef(price);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!animate) return;
    if (price > prevPrice.current && prevPrice.current !== 0) {
      setBlink('');
      timeoutId = setTimeout(() => setBlink('flash-green-strong'), 10);
    } else if (price < prevPrice.current && prevPrice.current !== 0) {
      setBlink('');
      timeoutId = setTimeout(() => setBlink('flash-red-strong'), 10);
    }
    prevPrice.current = price;
    return () => clearTimeout(timeoutId);
  }, [price, animate]);

  return (
    <td className="px-2 py-1.5 text-right font-mono font-medium text-text">
      <span className={cn("inline-block border border-border/80 px-2 py-0.5 rounded-[6px] bg-slate-50/60 font-mono font-bold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-500", blink)}>
        ${price != null ? price.toFixed(2) : "0.00"}
      </span>
    </td>
  );
}

function BlinkingPriceText({ price, className, formattedText }: { price: number, className?: string, formattedText?: string }) {
  const [blink, setBlink] = useState('');
  const prevPrice = useRef(price);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (price !== prevPrice.current && prevPrice.current !== 0) {
      const isUp = price > prevPrice.current;
      setBlink('');
      timeoutId = setTimeout(() => {
        setBlink(isUp ? 'text-emerald-500' : 'text-rose-500');
        setTimeout(() => setBlink(''), 1000);
      }, 10);
    }
    prevPrice.current = price;
    return () => clearTimeout(timeoutId);
  }, [price]);

  const text = formattedText || (price != null ? price.toFixed(2) : "0.00");
  const mainPart = text.slice(0, -3);
  const lastPart = text.slice(-3);

  return (
    <span className={cn("inline-block font-mono font-bold text-sm transition-all", className)}>
      <span>{mainPart}</span>
      <span className={cn("transition-colors duration-500", blink)}>{lastPart}</span>
    </span>
  );
}

function MarqueeItem({ symbol, data, onClick, isCrypto }: { symbol: string, data: any, onClick: () => void, isCrypto?: boolean }) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef<number | null>(null);

  useEffect(() => {
    if (data && typeof data.price === 'number') {
      if (prevPrice.current !== null && Math.abs(data.price - prevPrice.current) > 0.0001) {
        setFlash(data.price > prevPrice.current ? 'up' : 'down');
        const timer = setTimeout(() => setFlash(null), 1000);
        prevPrice.current = data.price;
        return () => clearTimeout(timer);
      }
      prevPrice.current = data.price;
    }
  }, [data?.price]);

  const price = data?.price;
  const change = data?.changesPercentage || data?.change || 0;
  const isUp = change >= 0;

  return (
    <div 
      className={cn(
        "flex items-center h-full gap-4 px-8 border-r border-slate-800/50 whitespace-nowrap group hover:bg-white/5 transition-colors cursor-pointer",
        flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''
      )} 
      onClick={onClick}
    >
      <span className={cn(
        "font-bold text-xs tracking-tight transition-colors duration-300", 
        isCrypto ? "text-blue-400" : "text-slate-400 group-hover:text-white"
      )}>
        {symbol}
      </span>
      
      {price != null ? (
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-mono text-xs font-bold transition-colors duration-500",
            flash === 'up' ? 'text-green-400' : flash === 'down' ? 'text-red-400' : 'text-white'
          )}>
            ${price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-500 border",
            isUp 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20',
            flash === 'up' && 'bg-green-500/30 scale-105 shadow-[0_0_10px_rgba(34,197,94,0.3)]',
            flash === 'down' && 'bg-red-500/30 scale-105 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
          )}>
            {isUp ? <TrendingUp size={10} className="stroke-[3]" /> : <Activity size={10} className="rotate-180 stroke-[3]" />}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        </div>
      ) : (
        <span className="text-slate-600 text-[10px] animate-pulse">Loading...</span>
      )}
    </div>
  );
}

const assetManagementNews = [
 {
 title: "BlackRock expand its active ETF lineup amid rising demand",
 source: "CNBC",
 timestamp: "2 hours ago",
 summary: "The world's largest asset manager is aggressively rolling out new active ETFs, aiming to capture institutional rotation out of mutual funds and into more tax-efficient, transparent structures as fixed income yields stabilize.",
 image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Why the 60/40 portfolio is evolving in 2026",
 source: "Bloomberg",
 timestamp: "4 hours ago",
 summary: "Leading portfolio managers are increasingly advising private wealth clients to allocate towards alternative assets and private credit, fundamentally shifting the traditional 60/40 model to 50/30/20 to hedge against macroeconomic volatility.",
 image: "https://images.unsplash.com/photo-1590283603385-18ffb118b625?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Global sovereign wealth funds shift to private credit",
 source: "Financial Times",
 timestamp: "5 hours ago",
 summary: "Sovereign wealth funds from the Middle East and Asia are systematically deploying billions into direct lending and private credit markets, bypassing traditional syndicated loans and taking advantage of regulatory constraints on global banks.",
 image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Vanguard outlines new focus for emerging markets",
 source: "CNBC",
 timestamp: "12 hours ago",
 summary: "The passive investing giant is quietly revamping its core emerging markets strategy, placing heavier emphasis on India and Latin America, signaling a structural pivot that could influence trillions in benchmark-tracking capital.",
 image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a1?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 }
];

const etfManagementNews = [
 {
 title: "Technology Select Sector SPDR Fund hits historic AUM milestone",
 source: "Wall Street Journal",
 timestamp: "1 hour ago",
 summary: "Driven by continuous investments in semiconductor and AI companies, XLK has reached a record assets under management level, reflecting persistent institutional bullishness in the tech sector.",
 image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Crypto ETFs see massive capital inflows post regulatory clarity",
 source: "Bloomberg",
 timestamp: "3 hours ago",
 summary: "Bitcoin and Ethereum ETFs are experiencing unprecedented volume as new regulatory frameworks globally authorize broader inclusion of crypto assets in retirement portfolios.",
 image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Gold ETFs surge as investors hedge against inflation",
 source: "Financial Times",
 timestamp: "6 hours ago",
 summary: "Physical gold-backed ETFs saw their largest weekly inflow in two years as geopolitical tensions and lingering inflationary pressures drive a flight to safe-haven assets.",
 image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 },
 {
 title: "Dividend aristocrat ETFs outperform broader markets",
 source: "CNBC",
 timestamp: "8 hours ago",
 summary: "High-yield dividend ETFs have unexpectedly outpaced major indices this quarter, as investors prioritize cash flow and corporate stability over high-beta growth stocks.",
 image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=1200",
 url: "#"
 }
];

const labels: Record<string, Record<string, string>> = {
  en: {
    marketTerminals: "Market Terminals",
    liveMarket: "Live Market",
    terminalDescription: "A real-time institutional-grade terminal to analyze US equities, track key performance ratios, and benchmark active portfolios.",
    searchPlaceholder: "Search...",
    go: "Go",
    backToOverview: "Back to Market Overview",
    strategy: "Strategy",
    annualizedReturn30y: "30Y Annualized Return",
    basedOnHistorical: "Based on historical data",
    assetAllocation: "Asset Allocation",
    equitiesStocks: "Equities (Stocks)",
    fixedIncomeBonds: "Fixed Income (Bonds)",
    cashEquivalents: "Cash & Equivalents",
    tickerNotLoaded: "Data not found or ticker not supported. Please check the symbol.",
    loading: "Loading...",
    watchlist: "Watchlist",
    addTicker: "Add Ticker",
    alreadyInWatchlist: "Already in watchlist",
    addToWatchlistError: "Please enter a valid ticker.",
    news: "Financial News",
    stocks: "Stocks",
    crypto: "Crypto",
    usMarket: "US Market",
    europeanMarket: "European Market",
    marketClosed: "Market Closed",
    marketOpen: "Market Open",
    price: "Price",
    change: "Change",
    volume: "Volume",
    prevClose: "Prev Close",
    open: "Open",
    high: "High",
    low: "Low",
    mktCap: "Market Cap",
    peRatio: "P/E Ratio",
    divYield: "Div Yield",
    beta: "Beta",
    ratios: "Ratios",
    mustHaveRatios: "Core Financial Ratios",
    advancedRatios: "Advanced Metrics & Valuation Models",
    searchRatiosPlaceholder: "Filter advanced ratios...",
    allCategories: "All Categories",
    noData: "No data available.",
    financialStatements: "Financial Statements",
    incomeStatement: "Income Statement",
    balanceSheet: "Balance Sheet",
    cashFlow: "Cash Flow",
    chart: "Interactive Chart",
    indicators: "Indicators",
    fullscreen: "Fullscreen",
    minimize: "Minimize",
    compareAssets: "Compare Assets",
    lazyPortfolios: "Lazy Portfolios Benchmark",
    prestigeNews: "Prestige News Feed",
    interactiveTerminals: "Interactive Terminals",
    etfScreener: "European ETF Screener",
    activeLineup: "Active Lineup",
    portfolioEvolution: "Portfolio Evolution",
    sovereignWealth: "Sovereign Wealth",
    emergingMarkets: "Emerging Markets",
    semiconductorMilestone: "Semiconductor Milestone",
    cryptoInflows: "Crypto Inflows",
    goldHedging: "Gold Hedging",
    dividendAristocrats: "Dividend Aristocrats"
  },
  fr: {
    marketTerminals: "Terminaux de Marché",
    liveMarket: "Marché en Direct",
    terminalDescription: "Un terminal temps réel de qualité institutionnelle pour analyser les actions américaines, suivre les ratios de performance clés et comparer les portefeuilles actifs.",
    searchPlaceholder: "Rechercher...",
    go: "Go",
    backToOverview: "Retour à l'Aperçu du Marché",
    strategy: "Stratégie",
    annualizedReturn30y: "Rendement Annualisé 30 Ans",
    basedOnHistorical: "Basé sur les données historiques",
    assetAllocation: "Allocation d'Actifs",
    equitiesStocks: "Actions",
    fixedIncomeBonds: "Obligations (Produits de Taux)",
    cashEquivalents: "Liquidités & Équivalents",
    tickerNotLoaded: "Données non trouvées ou ticker non supporté. Veuillez vérifier le symbole.",
    loading: "Chargement...",
    watchlist: "Liste de Surveillance",
    addTicker: "Ajouter",
    alreadyInWatchlist: "Déjà dans la liste de surveillance",
    addToWatchlistError: "Veuillez entrer un symbole valide.",
    news: "Actualités Financières",
    stocks: "Actions",
    crypto: "Crypto",
    usMarket: "Marché US",
    europeanMarket: "Marché Européen",
    marketClosed: "Marché Fermé",
    marketOpen: "Marché Ouvert",
    price: "Prix",
    change: "Variation",
    volume: "Volume",
    prevClose: "Clôture Préc.",
    open: "Ouverture",
    high: "Plus Haut",
    low: "Plus Bas",
    mktCap: "Cap. Boursière",
    peRatio: "Ratio P/E",
    divYield: "Rend. Dividende",
    beta: "Bêta",
    ratios: "Ratios",
    mustHaveRatios: "Ratios Financiers Essentiels",
    advancedRatios: "Mesures Avancées & Modèles d'Évaluation",
    searchRatiosPlaceholder: "Filtrer les ratios avancés...",
    allCategories: "Toutes les Catégories",
    noData: "Aucune donnée disponible.",
    financialStatements: "États Financiers",
    incomeStatement: "Compte de Résultat",
    balanceSheet: "Bilan",
    cashFlow: "Flux de Trésorerie",
    chart: "Graphique Interactif",
    indicators: "Indicateurs",
    fullscreen: "Plein Écran",
    minimize: "Réduire",
    compareAssets: "Comparer des Actifs",
    lazyPortfolios: "Benchmark de Portefeuilles Passifs",
    prestigeNews: "Fil d'Actualités Prestige",
    interactiveTerminals: "Terminaux Interactifs",
    etfScreener: "Screener ETF Européens",
    activeLineup: "Gamme Active",
    portfolioEvolution: "Évolution du Portefeuille",
    sovereignWealth: "Fonds Souverains",
    emergingMarkets: "Marchés Émergents",
    semiconductorMilestone: "Jalon des Semi-conducteurs",
    cryptoInflows: "Flux Crypto",
    goldHedging: "Couverture Or",
    dividendAristocrats: "Aristocrates du Dividende"
  },
  de: {
    marketTerminals: "Marktterminals",
    liveMarket: "Live-Markt",
    terminalDescription: "Ein Echtzeit-Terminal in institutioneller Qualität zur Analyse von US-Aktien, zur Verfolgung wichtiger Kennzahlen und zum Benchmarking aktiver Portfolios.",
    searchPlaceholder: "Suchen...",
    go: "Go",
    backToOverview: "Zurück zur Marktübersicht",
    strategy: "Strategie",
    annualizedReturn30y: "30-jährige Rendite (An.)",
    basedOnHistorical: "Basierend auf historischen Daten",
    assetAllocation: "Asset-Allokation",
    equitiesStocks: "Aktien",
    fixedIncomeBonds: "Anleihen (Rententitel)",
    cashEquivalents: "Bargeld & Äquivalente",
    tickerNotLoaded: "Daten nicht gefunden oder Ticker nicht unterstützt. Bitte überprüfen Sie das Symbol.",
    loading: "Laden...",
    watchlist: "Beobachtungsliste",
    addTicker: "Hinzufügen",
    alreadyInWatchlist: "Bereits in der Beobachtungsliste",
    addToWatchlistError: "Bitte geben Sie einen gültigen Ticker ein.",
    news: "Finanznachrichten",
    stocks: "Aktien",
    crypto: "Krypto",
    usMarket: "US-Markt",
    europeanMarket: "Europäischer Markt",
    marketClosed: "Markt Geschlossen",
    marketOpen: "Markt Offen",
    price: "Preis",
    change: "Veränderung",
    volume: "Volumen",
    prevClose: "Vorheriger Schluss",
    open: "Eröffnung",
    high: "Höchststand",
    low: "Tiefststand",
    mktCap: "Marktkapitalisierung",
    peRatio: "KGV (P/E)",
    divYield: "Dividendenrendite",
    beta: "Beta",
    ratios: "Kennzahlen",
    mustHaveRatios: "Wesentliche Finanzkennzahlen",
    advancedRatios: "Erweiterte Kennzahlen & Bewertungsmodelle",
    searchRatiosPlaceholder: "Erweiterte Kennzahlen filtern...",
    allCategories: "Alle Kategorien",
    noData: "Keine Daten verfügbar.",
    financialStatements: "Finanzberichte",
    incomeStatement: "Ergebnisrechnung",
    balanceSheet: "Bilanz",
    cashFlow: "Cashflow",
    chart: "Interaktiver Chart",
    indicators: "Indikatoren",
    fullscreen: "Vollbild",
    minimize: "Verkleinern",
    compareAssets: "Anlagewerte vergleichen",
    lazyPortfolios: "Lazy Portfolios Benchmark",
    prestigeNews: "Prestige-Newsfeed",
    interactiveTerminals: "Interaktive Terminals",
    etfScreener: "Europäischer ETF-Screener",
    activeLineup: "Aktives Lineup",
    portfolioEvolution: "Portfolio-Entwicklung",
    sovereignWealth: "Staatsfonds",
    emergingMarkets: "Schwellenländer",
    semiconductorMilestone: "Halbleiter-Meilenstein",
    cryptoInflows: "Krypto-Zuflüsse",
    goldHedging: "Gold-Hedging",
    dividendAristocrats: "Dividendenaristokraten"
  },
  nl: {
    marketTerminals: "Marktterminals",
    liveMarket: "Live Markt",
    terminalDescription: "Een real-time terminal van institutionele kwaliteit om Amerikaanse aandelen te analyseren, belangrijke prestatieratio's te volgen en actieve portefeuilles te benchmarken.",
    searchPlaceholder: "Zoeken...",
    go: "Go",
    backToOverview: "Terug naar Marktoverzicht",
    strategy: "Stratégie",
    annualizedReturn30y: "30-jarig geannualiseerd rendement",
    basedOnHistorical: "Gebaseerd op historische gegevens",
    assetAllocation: "Asset Allocatie",
    equitiesStocks: "Aandelen",
    fixedIncomeBonds: "Obligaties (Vastrentend)",
    cashEquivalents: "Cash & Equivalenten",
    tickerNotLoaded: "Gegevens niet gevonden of ticker niet ondersteund. Controleer het symbool.",
    loading: "Laden...",
    watchlist: "Volglijst",
    addTicker: "Toevoegen",
    alreadyInWatchlist: "Al in volglijst",
    addToWatchlistError: "Voer een geldige ticker in.",
    news: "Financieel Nieuws",
    stocks: "Aandelen",
    crypto: "Crypto",
    usMarket: "Amerikaanse Markt",
    europeanMarket: "Europese Markt",
    marketClosed: "Markt Gesloten",
    marketOpen: "Markt Open",
    price: "Prijs",
    change: "Verandering",
    volume: "Volume",
    prevClose: "Vorige Slot",
    open: "Open",
    high: "Hoog",
    low: "Laag",
    mktCap: "Marktkapitalisatie",
    peRatio: "K/W-verhouding (P/E)",
    divYield: "Dividendrendement",
    beta: "Bèta",
    ratios: "Ratio's",
    mustHaveRatios: "Essentiële Financiële Ratio's",
    advancedRatios: "Geavanceerde statistieken & waarderingsmodellen",
    searchRatiosPlaceholder: "Filter geavanceerde ratio's...",
    allCategories: "Alle Categorieën",
    noData: "Geen gegevens beschikbaar.",
    financialStatements: "Financiële Rapporten",
    incomeStatement: "Resultatenrekening",
    balanceSheet: "Balans",
    cashFlow: "Kasstroom",
    chart: "Interactieve Grafiek",
    indicators: "Indicatoren",
    fullscreen: "Volledig Scherm",
    minimize: "Minimaliseren",
    compareAssets: "Activa Vergelijken",
    lazyPortfolios: "Lazy Portfolios Benchmark",
    prestigeNews: "Prestige Nieuwsfeed",
    interactiveTerminals: "Interactieve Terminals",
    etfScreener: "Europese ETF-screener",
    activeLineup: "Actieve Line-up",
    portfolioEvolution: "Portfolio-evolutie",
    sovereignWealth: "Staatsfondsen",
    emergingMarkets: "Opkomende Markten",
    semiconductorMilestone: "Mijlpaal in de halfgeleiderindustrie",
    cryptoInflows: "Crypto-instroom",
    goldHedging: "Goud-hedging",
    dividendAristocrats: "Dividend aristocraten"
  },
  es: {
    marketTerminals: "Terminales de Mercado",
    liveMarket: "Mercado en Vivo",
    terminalDescription: "Una terminal en tiempo real de calidad institucional para analizar acciones estadounidenses, realizar un seguimiento de los ratios de rendimiento clave y comparar carteras activas.",
    searchPlaceholder: "Buscar...",
    go: "Ir",
    backToOverview: "Volver a la vista general del mercado",
    strategy: "Estrategia",
    annualizedReturn30y: "Rendimiento anualizado a 30 años",
    basedOnHistorical: "Basado en datos históricos",
    assetAllocation: "Asignación de Activos",
    equitiesStocks: "Acciones",
    fixedIncomeBonds: "Renta Fija (Bonos)",
    cashEquivalents: "Efectivo y Equivalentes",
    tickerNotLoaded: "Datos no encontrados o ticker no compatible. Por favor, verifique el símbolo.",
    loading: "Cargando...",
    watchlist: "Lista de Seguimiento",
    addTicker: "Añadir",
    alreadyInWatchlist: "Ya está en la lista de seguimiento",
    addToWatchlistError: "Por favor, introduzca un ticker válido.",
    news: "Noticias Financieras",
    stocks: "Acciones",
    crypto: "Cripto",
    usMarket: "Mercado de EE. UU.",
    europeanMarket: "Mercado Europeo",
    marketClosed: "Mercado Cerrado",
    marketOpen: "Mercado Abierto",
    price: "Precio",
    change: "Cambio",
    volume: "Volumen",
    prevClose: "Cierre Anterior",
    open: "Apertura",
    high: "Máximo",
    low: "Mínimo",
    mktCap: "Cap. de Mercado",
    peRatio: "Relación P/E",
    divYield: "Rend. de Dividendo",
    beta: "Beta",
    ratios: "Ratios",
    mustHaveRatios: "Ratios Financieros Esenciales",
    advancedRatios: "Métricas Avanzadas y Modelos de Valoración",
    searchRatiosPlaceholder: "Filtrar ratios avanzados...",
    allCategories: "Todas las Categorías",
    noData: "No hay datos disponibles.",
    financialStatements: "Estados Financieros",
    incomeStatement: "Estado de Resultados",
    balanceSheet: "Balance General",
    cashFlow: "Flujo de Caja",
    chart: "Gráfico Interactivo",
    indicators: "Indicadores",
    fullscreen: "Pantalla Completa",
    minimize: "Minimizar",
    compareAssets: "Comparar Activos",
    lazyPortfolios: "Benchmark de Carteras Pasivas",
    prestigeNews: "Feed de Noticias de Prestigio",
    interactiveTerminals: "Terminales Interactivos",
    etfScreener: "Screener de ETF Europeos",
    activeLineup: "Gama Activa",
    portfolioEvolution: "Evolución de Cartera",
    sovereignWealth: "Fondos Soberanos",
    emergingMarkets: "Mercados Emergentes",
    semiconductorMilestone: "Hito en Semiconductores",
    cryptoInflows: "Flujos de Cripto",
    goldHedging: "Cobertura en Oro",
    dividendAristocrats: "Aristócratas del Dividendo"
  }
};

const watchlistHistoryCache: Record<string, any[]> = {};

export function FinancialModeling() {
  const { language } = useTranslation();
  const currentLabels = labels[language] || labels["en"];
 const isMarketClosedVal = useMemo(() => {
 const now = new Date();
 try {
 const nyTimeStr = now.toLocaleString('en-US', { timeZone: "America/New_York" });
 const nyDate = new Date(nyTimeStr);
 const day = nyDate.getDay(); // 0 is Sunday, 6 is Saturday
 if (day === 0 || day === 6) return true;
 const hours = nyDate.getHours();
 const minutes = nyDate.getMinutes();
 const timeInMinutes = hours * 60 + minutes;
 const marketOpen = 9 * 60 + 30; // 9:30 AM
 const marketClose = 16 * 60; // 4:00 PM
 return timeInMinutes < marketOpen || timeInMinutes >= marketClose;
 } catch (e) {
 const day = now.getDay();
 return day === 0 || day === 6;
 }
 }, []);

 const defaultInitialSymbol = useMemo(() => {
 const params = new URLSearchParams(window.location.search);
 const sym = params.get('symbol');
 if (sym) return sym.toUpperCase();
 return 'NVDA';
 }, []);

 const [searchInput, setSearchInput] = useState('');
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const comparisonSectionRef = useRef<HTMLDivElement>(null);
  const macroTrendsSectionRef = useRef<HTMLDivElement>(null);
  const lazyPortfoliosSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
 const [activeTab, setActiveTab] = useState('income');
 const [advancedSearch, setAdvancedSearch] = useState('');
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [selectedLazyPortfolio, setSelectedLazyPortfolio] = useState<any | null>(null);
 
 const [suggestions, setSuggestions] = useState<any[]>([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

 
 const [chartPeriod, setChartPeriod] = useState<{label: string, range: string, interval: string}>({label: '1Y', range: '1y', interval: '1d'});
 const [isChartExpanded, setIsChartExpanded] = useState(false);
 const [cryptoLiveEnabled, setCryptoLiveEnabled] = useState(true);

 const [selectedTradingViewSymbol, setSelectedTradingViewSymbol] = useState<string | null>(null);
 const isWeekend = () => {
    const d = new Date();
    const dayOptions = { timeZone: "America/New_York", weekday: "short" } as const;
    const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(d);
    return dayString === "Sat" || dayString === "Sun";
};

const isUSMarketOpen = () => {
    const d = new Date();
    const dayOptions = { timeZone: "America/New_York", weekday: "short" } as const;
    const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(d);
    if (dayString === "Sat" || dayString === "Sun") return false;

    const timeOptions = { timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: false } as const;
    const timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(d);
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = hours * 100 + minutes;
    
    // Check holidays
    const dateOptions = { timeZone: "America/New_York", month: "2-digit", day: "2-digit" } as const;
    const md = new Intl.DateTimeFormat("en-US", dateOptions).format(d).replace("/", "-");
    const holidays = [
        "01-01", "01-15", "01-20", "02-19", "02-17", "03-29", "04-18",
        "05-27", "05-26", "06-19", "07-04", "09-02", "09-01", "11-28",
        "11-27", "12-25"
    ];
    if (holidays.includes(md)) return false;

    return time >= 930 && time <= 1600;
};

const isEuropeanMarketOpen = () => {
    const d = new Date();
    const dayOptions = { timeZone: "Europe/London", weekday: "short" } as const;
    const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(d);
    if (dayString === "Sat" || dayString === "Sun") return false;

    const timeOptions = { timeZone: "Europe/London", hour: "numeric", minute: "numeric", hour12: false } as const;
    const timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(d);
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = hours * 100 + minutes;

    return time >= 800 && time <= 1630;
};
  const [marqueeMode, setMarqueeMode] = useState<'stocks' | 'crypto'>(isUSMarketOpen() ? 'stocks' : 'crypto');

  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA', 'GOOG', 'META', 'TSLA', 'MSFT', 'AMZN', 'BTC-USD', 'ETH-USD', 'COIN']);

  const visibleWatchlist = useMemo(() => {
    return watchlist;
  }, [watchlist]);

  const [newWatchlistInput, setNewWatchlistInput] = useState('');
  const [watchlistAddError, setWatchlistAddError] = useState<string | null>(null);

  const handleAddToWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    const symbolToAdd = newWatchlistInput.trim().toUpperCase();
    if (!symbolToAdd) return;

    if (watchlist.includes(symbolToAdd)) {
      setWatchlistAddError('Already in watchlist');
      return;
    }

    setWatchlist(prev => [...prev, symbolToAdd]);
    setNewWatchlistInput('');
    setWatchlistAddError(null);
  };

  const handleRemoveFromWatchlist = (ticker: string) => {
    setWatchlist(prev => prev.filter(sym => sym !== ticker));
  };

  const visibleMarqueeSymbols = useMemo(() => {
    return MARQUEE_SYMBOLS;
  }, []);
 const watchlistColors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6', '#f43f5e', '#84cc16'];
 const getWatchlistColor = (index: number) => {
 return watchlistColors[index % watchlistColors.length];
 };
 
 const [marketNews, setMarketNews] = useState<any[]>([]);
 const [marketNewsLoading, setMarketNewsLoading] = useState(false);

 useEffect(() => {
 setMarketNewsLoading(true);
 fetch('/api/market-news?q=finance')
  .then(r => { const ct = r.headers.get("content-type"); if (r.ok && ct && ct.includes("application/json")) return r.json(); return []; })
 .then(d => {
 if (Array.isArray(d)) {
 setMarketNews(d);
 }
 })
 .catch(e => {
   if (import.meta.env.DEV) console.warn("Market news fetch error:", e);
 })
 .finally(() => setMarketNewsLoading(false));
 }, []);

 const [newCompareInput, setNewCompareInput] = useState('');
 const [addCompareError, setAddCompareError] = useState<string | null>(null);

 const [watchlistData, setWatchlistData] = useState<any[]>([]);
 const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, any>>({});

 const [watchlistLoading, setWatchlistLoading] = useState(false);

 // Unified Live WebSocket prices
 const [tickerPrices, setTickerPrices] = useState<Record<string, {
 price: number,
 change: number,
 changesPercentage: number,
 marketCap?: number,
 trailingAnnualDividendYield?: number,
 trailingAnnualDividendRate?: number,
 firstTradeDateMilliseconds?: any
 }>>({});

 const persistentPrices = useRef<Record<string, any>>({});
 
 useEffect(() => {
  if (visibleMarqueeSymbols.length === 0) return;
  const abortController = new AbortController();
  
  const fetchMarquee = () => {
    fetch(`/api/stock/bulk-quotes?symbols=${visibleMarqueeSymbols.join(',')}`, {
      signal: abortController.signal
    })
    .then(r => { const ct = r.headers.get("content-type"); if (r.ok && ct && ct.includes("application/json")) return r.json(); return []; })
    .then(data => {
      if (Array.isArray(data)) {
        const initialPrices: Record<string, any> = {};
        data.forEach(item => {
          initialPrices[item.symbol] = {
            price: item.regularMarketPrice || item.regularMarketPreviousClose,
            change: item.regularMarketChange,
            changesPercentage: item.regularMarketChangePercent,
            marketCap: item.marketCap
          };
        });
        setTickerPrices(prev => {
          let hasChanges = false;
          const next = { ...prev };
          Object.keys(initialPrices).forEach(sym => {
            if (!next[sym] || next[sym].price !== initialPrices[sym].price) {
              next[sym] = initialPrices[sym];
              hasChanges = true;
            }
          });
          return hasChanges ? next : prev;
        });
      }
    })
    .catch(e => {
      if (e.name !== 'AbortError' && import.meta.env.DEV) {
        console.warn("Marquee fetch error - silenced for production:", e.message);
      }
    });
  };

  fetchMarquee();
  const intervalId = setInterval(fetchMarquee, 20000);

  return () => {
    clearInterval(intervalId);
    abortController.abort();
  };
 }, [visibleMarqueeSymbols]);

 useEffect(() => {
  if (visibleWatchlist.length === 0) return;
  fetch(`/api/stock/bulk-quotes?symbols=${visibleWatchlist.join(',')}`)
  .then(r => {
  const contentType = r.headers.get("content-type");
  if (r.ok && contentType && contentType.includes("application/json")) {
  return r.json();
  }
  return [];
  })
  .then(d => {
  const quotesMap: Record<string, any> = {};
  if (Array.isArray(d)) {
  d.forEach(q => {
  if (q && q.symbol) quotesMap[q.symbol] = q;
  });
  } else if (d && d.symbol) {
  quotesMap[d.symbol] = d; 
  }
  setWatchlistQuotes(quotesMap);
  });
 }, [visibleWatchlist]);

 // Unused watchlistProfiles fetcher removed to drastically improve page loading speed

 const {
 symbol: activeSymbol,
 loading,
 error,
 profile,
 quote,
 income,
 balance,
 cashFlow,
 history,
 ratios,
 finnhubNews,
 finnhubPeers,
 finnhubRecommendation,
 finnhubInsiderSentiment,
 finnhubNewsSentiment,
 finnhubMarketNews,
 fetchStockData,
 fetchChartHistory,
 fetchFinancials
 } = useFinancialData(defaultInitialSymbol);

 const [financialsType, setFinancialsType] = useState<'annual' | 'quarterly'>('annual');

 const slicedIncome = useMemo(() => [...(income || [])].slice(0, 5).reverse(), [income]);
 const slicedBalance = useMemo(() => [...(balance || [])].slice(0, 5).reverse(), [balance]);
 const slicedCashFlow = useMemo(() => [...(cashFlow || [])].slice(0, 5).reverse(), [cashFlow]);

 useEffect(() => {
 if (activeSymbol) {
 fetchFinancials(activeSymbol, financialsType);
 }
 }, [financialsType, activeSymbol, fetchFinancials]);

 const [liveQuotePrice, setLiveQuotePrice] = useState<number | null>(null);
 const [liveQuoteChangePct, setLiveQuoteChangePct] = useState<number | null>(null);
 const [liveQuoteChange, setLiveQuoteChange] = useState<number | null>(null);

 // Synchronize activeSymbol details with Real-time WebSocket packages
 useEffect(() => {
 if (activeSymbol && tickerPrices[activeSymbol]) {
 const item = tickerPrices[activeSymbol];
 if (typeof item.price === 'number') setLiveQuotePrice(item.price);
 if (typeof item.changesPercentage === 'number') setLiveQuoteChangePct(item.changesPercentage);
 if (typeof item.change === 'number') setLiveQuoteChange(item.change);
 } else {
 setLiveQuotePrice(null);
 setLiveQuoteChangePct(null);
 setLiveQuoteChange(null);
 }
 }, [activeSymbol, tickerPrices]);

 // Establish persistent Real-time WebSocket connection to backend
 const wsRef = useRef<WebSocket | null>(null);

 useEffect(() => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/ws`;
  let reconnectTimeout: NodeJS.Timeout;

  const connect = () => {
   if (wsRef.current?.readyState === WebSocket.OPEN) return;
   const ws = new WebSocket(wsUrl);
   wsRef.current = ws;
   ws.onopen = () => {
    const allSymbols = Array.from(new Set([activeSymbol, ...visibleWatchlist, ...visibleMarqueeSymbols].filter(Boolean)));
    if (ws.readyState === WebSocket.OPEN) {
     ws.send(JSON.stringify({ type: "subscribe", symbols: allSymbols }));
    }
   };
   ws.onmessage = (event) => {
    try {
     const payload = JSON.parse(event.data);
     if (payload.type === "price-update" && Array.isArray(payload.data)) {
      setTickerPrices(prev => {
       let hasChanges = false;
       const next = { ...prev };
       payload.data.forEach((item: any) => {
        if (!item || !item.symbol) return;
        const sym = item.symbol.toUpperCase();
        const existing = next[sym];
        const newPrice = item.price || item.regularMarketPrice || item.regularMarketPreviousClose;
        if (typeof newPrice === "number" && (!existing || existing.price !== newPrice)) {
         hasChanges = true;
         next[sym] = { ...existing, ...item, price: newPrice, symbol: sym };
        }
       });
       return hasChanges ? next : prev;
      });
     }
    } catch (e) {}
   };
   ws.onclose = () => { reconnectTimeout = setTimeout(connect, 5000); };
  };
  connect();
  return () => {
   if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
   clearTimeout(reconnectTimeout);
  };
 }, []);

 useEffect(() => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
   const allSymbols = Array.from(new Set([activeSymbol, ...visibleWatchlist, ...visibleMarqueeSymbols].filter(Boolean)));
   wsRef.current.send(JSON.stringify({ type: "subscribe", symbols: allSymbols }));
  }
 }, [activeSymbol, visibleWatchlist, visibleMarqueeSymbols]);

 // Trigger chart fetch when period or watchlist changes
 useEffect(() => {
 if (activeSymbol) {
 fetchChartHistory(activeSymbol, chartPeriod.range, chartPeriod.interval);
 }
 
 const fetchWatchlist = async () => {
 if (visibleWatchlist.length === 0) {
 setWatchlistData([]);
 return;
 }
 setWatchlistLoading(true);
 try {
 const comparisonInterval = chartPeriod.range === '5d' ? '1d' : chartPeriod.interval;
 const promises = visibleWatchlist.map(async (sym) => {
   const cacheKey = `${sym}-${chartPeriod.range}-${comparisonInterval}`;
   if (watchlistHistoryCache[cacheKey]) {
     return watchlistHistoryCache[cacheKey];
   }
   try {
     const r = await fetch(`/api/stock/history/${sym}?range=${chartPeriod.range}&interval=${comparisonInterval}`);
     const contentType = r.headers.get("content-type");
     if (r.ok && contentType && contentType.includes("application/json")) {
       const data = await r.json();
       if (Array.isArray(data)) {
         watchlistHistoryCache[cacheKey] = data;
         return data;
       }
     }
   } catch (err) {
     console.warn(`History fetch failed for ${sym}`, err);
   }
   return [];
 });
 const results = await Promise.allSettled(promises);
 
 const newMultiData: any[] = [];
 visibleWatchlist.forEach((sym, idx) => {
 const res = results[idx];
 if (res.status === 'fulfilled' && Array.isArray(res.value)) {
 newMultiData.push({
 symbol: sym,
 color: watchlistColors[idx % watchlistColors.length],
 data: res.value.map(d => ({ date: d.date, close: d.close }))
 });
 }
 });
 setWatchlistData(newMultiData);
 } catch(e) {}
 setWatchlistLoading(false);
 };
 fetchWatchlist();
 }, [activeSymbol, chartPeriod, fetchChartHistory, visibleWatchlist]);

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const sym = params.get('symbol');
 const tab = params.get('tab');
 if (sym) {
 setSearchInput(sym);
 fetchStockData(sym);
 }
 if (tab) {
 setActiveTab(tab);
 }
 }, [fetchStockData]);

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 let changed = false;
 
 if (activeSymbol && params.get('symbol') !== activeSymbol) {
 params.set('symbol', activeSymbol);
 changed = true;
 }
 if (activeTab && params.get('tab') !== activeTab) {
 params.set('tab', activeTab);
 changed = true;
 }

 if (changed) {
 const newUrl = `${window.location.pathname}?${params.toString()}`;
 window.history.replaceState({}, '', newUrl);
 }
 }, [activeSymbol, activeTab]);

 

 useEffect(() => {
 setSelectedSuggestionIndex(-1);
 const val = searchInput.trim().toLowerCase();
 
 if (val.length === 0) {
 setSuggestions([]);
 setShowSuggestions(false);
 return;
 }

 const fetchSuggestions = async () => {
 try {
 const res = await fetch(`/api/stock/search?q=${encodeURIComponent(searchInput)}`);
 const contentType = res.headers.get("content-type");
 if (res.ok && contentType && contentType.includes("application/json")) {
 const data = await res.json();
 const results = data.result ? data.result : [];
 setSuggestions(results.slice(0, 8)); // increased to 8 items
 if (document.activeElement && document.activeElement.tagName === 'INPUT') {
 setShowSuggestions(true);
 }
 }
 } catch(e) {}
 };
 
 const timeout = setTimeout(() => {
 if (searchInput.trim().toLowerCase() !== activeSymbol.toLowerCase()) {
 fetchSuggestions();
 }
 }, 250);
 return () => clearTimeout(timeout);
 }, [searchInput, activeSymbol]);

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault();
 if (searchInput.trim()) {
 setShowSuggestions(false);
 fetchStockData(searchInput.trim().toUpperCase());
 }
 };

 const handleSelectSuggestion = (sym: string) => {
 setSearchInput(sym);
 setShowSuggestions(false);
 setSelectedSuggestionIndex(-1);
 fetchStockData(sym);
 };

 const formatNumber = (num: number) => {
 if (num === undefined || num === null || Number.isNaN(num)) return "N/A";
 if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B";
 if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M";
 
 // Format thousands with space and . for decimals
 const parts = num.toFixed(2).split('.');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 return parts.join('.');
 };

 const formatAggregate = (num: number) => {
 if (num === undefined || num === null || Number.isNaN(num)) return "N/A";
 if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B";
 if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M";
 if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + "K";
 const parts = num.toFixed(2).split('.');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 return parts.join('.');
 };

 const formatRatio = (val: number, unit: string) => {
 if (val === undefined || val === null || Number.isNaN(val)) return "N/A";
 if (unit === "%") return (val * 100).toFixed(2) + "%";
 if (unit === "x" || unit === "score") return val.toFixed(2);
 if (unit === "days") return Math.round(val).toString() + " days";
 if (unit === "USD") return "$" + val.toFixed(2);
 return val.toString();
 };

 const formatWatchlistDivYield = (val: number) => {
   if (val === undefined || val === null || Number.isNaN(val)) return "---";
   
   // Standard Yahoo Finance trailingAnnualDividendYield is a decimal fraction (e.g., 0.015 for 1.5%).
   // However, UK/LSE assets and some ETFs can return percentage values or suffer from 100x/10000x inflation due to GBX (pence) pricing.
   let pct = val * 100;
   
   if (pct >= 10000) {
     pct = pct / 10000;
   } else if (pct >= 100) {
     pct = pct / 100;
   }
   
   if (pct > 50) {
     pct = pct / 10;
   }
   
   return pct.toFixed(2) + "%";
 };

 const mustHaveRatios = FMP_RATIOS.filter(r => r.is_must_have);
 const advancedRatiosItems = FMP_RATIOS.filter(r => !r.is_must_have && r.label.toLowerCase().includes(advancedSearch.toLowerCase()));

 // Groups for Advanced Ratios
 const advancedGrouped = advancedRatiosItems.reduce((acc, ratio) => {
 if (!acc[ratio.category]) acc[ratio.category] = [];
 acc[ratio.category].push(ratio);
 return acc;
 }, {} as Record<string, typeof FMP_RATIOS>);

 const [cryptos, setCryptos] = useState([
 { id: "btcusdt", name: "Bitcoin", symbol: "BTC", price: 0, change: 0, prevPrice: 0 },
 { id: "ethusdt", name: "Ethereum", symbol: "ETH", price: 0, change: 0, prevPrice: 0 },
 { id: "solusdt", name: "Solana", symbol: "SOL", price: 0, change: 0, prevPrice: 0 },
 { id: "bnbusdt", name: "BNB", symbol: "BNB", price: 0, change: 0, prevPrice: 0 },
 { id: "xrpusdt", name: "Ripple", symbol: "XRP", price: 0, change: 0, prevPrice: 0 },
 { id: "adausdt", name: "Cardano", symbol: "ADA", price: 0, change: 0, prevPrice: 0 },
 { id: "dogeusdt", name: "Dogecoin", symbol: "DOGE", price: 0, change: 0, prevPrice: 0 },
 { id: "avaxusdt", name: "Avalanche", symbol: "AVAX", price: 0, change: 0, prevPrice: 0 },
 { id: "dotusdt", name: "Polkadot", symbol: "DOT", price: 0, change: 0, prevPrice: 0 },
 { id: "linkusdt", name: "Chainlink", symbol: "LINK", price: 0, change: 0, prevPrice: 0 },
 { id: "ltcusdt", name: "Litecoin", symbol: "LTC", price: 0, change: 0, prevPrice: 0 },
 { id: "uniusdt", name: "Uniswap", symbol: "UNI", price: 0, change: 0, prevPrice: 0 },
 { id: "atomusdt", name: "Cosmos", symbol: "ATOM", price: 0, change: 0, prevPrice: 0 },
 { id: "trxusdt", name: "TRON", symbol: "TRX", price: 0, change: 0, prevPrice: 0 },
 { id: "xlmusdt", name: "Stellar", symbol: "XLM", price: 0, change: 0, prevPrice: 0 },
 { id: "nearusdt", name: "NEAR", symbol: "NEAR", price: 0, change: 0, prevPrice: 0 },
 { id: "bchusdt", name: "Bitcoin Cash", symbol: "BCH", price: 0, change: 0, prevPrice: 0 },
 { id: "hbarusdt", name: "Hedera", symbol: "HBAR", price: 0, change: 0, prevPrice: 0 },
 { id: "aptusdt", name: "Aptos", symbol: "APT", price: 0, change: 0, prevPrice: 0 },
 { id: "icpusdt", name: "Internet Computer", symbol: "ICP", price: 0, change: 0, prevPrice: 0 }
 ]);

 const [markets, setMarkets] = useState([
 { id: "GOOGL", name: "Alphabet", symbol: "GOOGL", price: 0, change: 0, prevPrice: 0 },
 { id: "AMZN", name: "Amazon", symbol: "AMZN", price: 0, change: 0, prevPrice: 0 },
 { id: "META", name: "Meta", symbol: "META", price: 0, change: 0, prevPrice: 0 },
 { id: "TSLA", name: "Tesla", symbol: "TSLA", price: 0, change: 0, prevPrice: 0 },
 { id: "AAPL", name: "Apple", symbol: "AAPL", price: 0, change: 0, prevPrice: 0 },
 { id: "NVDA", name: "NVIDIA", symbol: "NVDA", price: 0, change: 0, prevPrice: 0 },
 { id: "MSFT", name: "Microsoft", symbol: "MSFT", price: 0, change: 0, prevPrice: 0 },
 { id: "IBKR", name: "Interactive Brokers", symbol: "IBKR", price: 0, change: 0, prevPrice: 0 },
 { id: "SPCX", name: "SpaceX (ETF)", symbol: "SPCX", price: 0, change: 0, prevPrice: 0 },
 { id: "BRK.B", name: "Berkshire", symbol: "BRK.B", price: 0, change: 0, prevPrice: 0 },
 { id: "LLY", name: "Eli Lilly", symbol: "LLY", price: 0, change: 0, prevPrice: 0 },
 { id: "AVGO", name: "Broadcom", symbol: "AVGO", price: 0, change: 0, prevPrice: 0 },
 { id: "NVO", name: "Novo Nordisk", symbol: "NVO", price: 0, change: 0, prevPrice: 0 },
 { id: "ASML", name: "ASML", symbol: "ASML", price: 0, change: 0, prevPrice: 0 },
 { id: "LVMUY", name: "LVMH", symbol: "LVMUY", price: 0, change: 0, prevPrice: 0 },
 { id: "SHEL", name: "Shell", symbol: "SHEL", price: 0, change: 0, prevPrice: 0 },
 { id: "AZN", name: "AstraZeneca", symbol: "AZN", price: 0, change: 0, prevPrice: 0 },
 { id: "SAP", name: "SAP", symbol: "SAP", price: 0, change: 0, prevPrice: 0 },
 { id: "HSBC", name: "HSBC", symbol: "HSBC", price: 0, change: 0, prevPrice: 0 },
 { id: "JPM", name: "JPMorgan", symbol: "JPM", price: 0, change: 0, prevPrice: 0 }
 ]);

 useEffect(() => {
 Object.entries(tickerPrices).forEach(([sym, data]) => {
 if (data && data.price) {
 persistentPrices.current[sym] = data;
 }
 });
 }, [tickerPrices]);

 useEffect(() => {
 markets.forEach(m => {
 if (m.price && !persistentPrices.current[m.id]) {
 persistentPrices.current[m.id] = { price: m.price, change: m.change, changesPercentage: 0 };
 }
 });
 cryptos.forEach(c => {
 if (c.price && !persistentPrices.current[c.id]) {
 persistentPrices.current[c.id] = { price: c.price, change: c.change, changesPercentage: 0 };
 }
 });
 }, [markets, cryptos]);

 const [bandType, setBandType] = useState<'crypto' | 'markets'>(isMarketClosedVal ? 'crypto' : 'markets');
 const [isExporting, setIsExporting] = useState(false);
 const [hoveredTime, setHoveredTime] = useState<number | null>(null);
 
 const [marketPageUrl, setMarketPageUrl] = useState<'stocks' | 'etfs'>('stocks');

 const parsedWatchlistData = useMemo(() => {
 return watchlistData.map(series => ({
 symbol: series.symbol,
 data: series.data.map((d: any) => ({
 ts: Math.floor(new Date(d.date).getTime() / 1000),
 close: d.close
 }))
 }));
 }, [watchlistData]);

 const activeDataPoints = useMemo(() => {
 if (!hoveredTime || !parsedWatchlistData || parsedWatchlistData.length === 0) return null;
 const result: Record<string, number> = {};
 
 parsedWatchlistData.forEach(series => {
 // Find closest point within a day
 const point = series.data.find((d: any) => Math.abs(d.ts - hoveredTime) < 86400);
 if (point) {
 result[series.symbol] = point.close;
 }
 });
 return result;
 }, [hoveredTime, parsedWatchlistData]);

 const movers = visibleWatchlist.map((sym, index) => {
 const q = watchlistQuotes[sym] || {};
 const wsData = tickerPrices[sym];
 const historySeries = watchlistData.find(d => d.symbol === sym);
 
 let basePrice = 0;
 let currentPrice = wsData?.price !== undefined ? wsData.price : (q.regularMarketPrice || 0);
 let periodChangePct = wsData?.changesPercentage !== undefined ? wsData.changesPercentage : 0;
 
 if (historySeries && historySeries.data.length > 0) {
 const data = [...historySeries.data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 basePrice = data[0].close;
 if (wsData?.price === undefined) {
 currentPrice = q.regularMarketPrice || data[data.length - 1].close;
 }
 }

 if (wsData?.changesPercentage !== undefined) {
 periodChangePct = wsData.changesPercentage;
 } else if (basePrice > 0) {
 periodChangePct = ((currentPrice - basePrice) / basePrice) * 100;
 }

 let displayPrice = currentPrice;
 let displayChangePct = periodChangePct;

 if (hoveredTime && activeDataPoints && activeDataPoints[sym] !== undefined) {
 // Display hovered price directly
 displayPrice = activeDataPoints[sym];
 if (basePrice > 0) {
 // Or calculate from basePrice, which is what the relative graph plots
 displayChangePct = ((displayPrice - basePrice) / basePrice) * 100;
 }
 }

 // Dividend Data
 const dividendRate = wsData?.trailingAnnualDividendRate !== undefined ? wsData.trailingAnnualDividendRate : q.trailingAnnualDividendRate;
 const dividendYield = wsData?.trailingAnnualDividendYield !== undefined ? wsData.trailingAnnualDividendYield : q.trailingAnnualDividendYield;
 
 // IPO Date
 const firstTradeDate = wsData?.firstTradeDateMilliseconds !== undefined ? wsData.firstTradeDateMilliseconds : q.firstTradeDateMilliseconds;

 return {
 ticker: sym,
 name: sym === 'SPCX' ? 'SpaceX' : (q.shortName || q.longName || sym),
 price: displayPrice,
 periodChangePct: displayChangePct,
 index,
 marketCap: wsData?.marketCap !== undefined ? wsData.marketCap : (q.marketCap || 0),
 dividendRate,
 dividendYield,
 firstTradeDate
 };
 }).sort((a,b) => b.marketCap - a.marketCap);

 const handleMoverClick = (ticker: string) => {
 setSearchInput(ticker);
 fetchStockData(ticker);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 
 const params = new URLSearchParams(window.location.search);
 params.set('tickers', watchlist.join(','));
 params.set('focus', ticker);
 const newUrl = `${window.location.pathname}?${params.toString()}`;
 window.history.pushState({}, '', newUrl);
 };

 useEffect(() => {
  // 1. Real-time Crypto Data (Binance WebSocket) using single multiplexed stream
  const cryptoSymbols = [
   "btcusdt", "ethusdt", "solusdt", "bnbusdt", "xrpusdt", 
   "adausdt", "dogeusdt", "avaxusdt", "dotusdt", 
   "linkusdt", "ltcusdt", "uniusdt", "atomusdt", 
   "trxusdt", "xlmusdt", "nearusdt", "bchusdt", "hbarusdt", 
   "aptusdt", "icpusdt"
  ];
  
  const fetchInitialCryptos = async () => {
    try {
      const formattedSymbols = cryptoSymbols.map(s => `"${s.toUpperCase()}"`).join(',');
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${formattedSymbols}]`);
      if (!res.ok) throw new Error('Binance fetch failed');
      const arr = await res.json();
      if (Array.isArray(arr)) {
        setCryptos(prev => {
          return prev.map(c => {
            const found = arr.find(item => item.symbol.toLowerCase() === c.id);
            if (found) {
              return {
                ...c,
                price: parseFloat(found.lastPrice),
                change: parseFloat(found.priceChangePercent)
              };
            }
            return c;
          });
        });
        
        const symbolMap = {
          'btcusdt': 'BTC-USD',
          'ethusdt': 'ETH-USD'
        };
        setTickerPrices(prev => {
          const next = { ...prev };
          let changed = false;
          arr.forEach(item => {
            const id = item.symbol.toLowerCase();
            const mappedSym = symbolMap[id];
            if (mappedSym) {
              next[mappedSym] = {
                price: parseFloat(item.lastPrice),
                changesPercentage: parseFloat(item.priceChangePercent),
                change: parseFloat(item.priceChange)
              };
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    } catch (err) {
      console.warn("Error fetching initial cryptos", err);
    }
  };
  
  fetchInitialCryptos();
  
  const cryptoUpdates = new Map();
  
  const flushInterval = setInterval(() => {
   if (cryptoUpdates.size === 0) return;
   
   const symbolMap = {
    'btcusdt': 'BTC-USD',
    'ethusdt': 'ETH-USD'
   };
   
   let hasTickerUpdates = false;
   const newTickerPrices = {};
   
   setCryptos(prev => {
    let changed = false;
    const next = prev.map(c => {
     const update = cryptoUpdates.get(c.id);
     if (update && update.c) {
      const newPrice = parseFloat(update.c);
      if (newPrice !== c.price) {
       changed = true;
       return {
        ...c,
        prevPrice: c.price,
        price: newPrice,
        change: parseFloat(update.P)
       };
      }
     }
     return c;
    });
    return changed ? next : prev;
   });
   
   cryptoUpdates.forEach((update, id) => {
    const mappedSym = symbolMap[id];
    if (mappedSym) {
     hasTickerUpdates = true;
     newTickerPrices[mappedSym] = {
      price: parseFloat(update.c),
      changesPercentage: parseFloat(update.P)
     };
    }
   });
   
   if (hasTickerUpdates) {
    setTickerPrices(prev => {
     const next = { ...prev } as any;
     let changed = false;
     Object.entries(newTickerPrices).forEach(([sym, data]: [string, any]) => {
      const existing = next[sym];
      if (!existing || existing.price !== data.price) {
       next[sym] = { ...(existing || { change: 0, changesPercentage: 0 }), ...data };
       changed = true;
      }
     });
     return changed ? next : prev;
    });
   }
   
   cryptoUpdates.clear();
  }, 1000);

  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/!ticker@arr`);
  ws.onmessage = (event) => {
   const dataArr = JSON.parse(event.data);
   if (Array.isArray(dataArr)) {
    dataArr.forEach(data => {
     const id = data.s.toLowerCase();
     if (cryptoSymbols.includes(id)) {
      cryptoUpdates.set(id, data);
     }
    });
   }
  };
  ws.onerror = (e) => {
   console.warn("Binance WS error", e);
  };
  
  return () => {
   clearInterval(flushInterval);
   ws.close();
  };
 }, []);
 useEffect(() => {
  // 2. Market Indices Polling (since we don't have a reliable free WS for everything)
  const abortController = new AbortController();
  
  const fetchMarkets = async () => {
  try {
  const symbols = 'AAPL,MSFT,NVDA,GOOGL,AMZN,META,TSLA,BRK-B,LLY,AVGO,NVO,ASML,LVMUY,SHEL,AZN,SAP,HSBC,JPM';
  const res = await fetch(`/api/stock/bulk-quotes?symbols=${symbols}`, { 
  signal: abortController.signal,
  headers: { 'Cache-Control': 'no-cache' }
  });
  
  if (!res.ok) return;
  
  const contentType = res.headers.get("content-type");
  if(contentType && contentType.includes("application/json")) {
  const data = await res.json();
  if(Array.isArray(data)) {
  setMarkets(prev => prev.map(m => {
  const mappedId = m.id.replace('.', '-');
  const quote = data.find((q: any) => q.symbol === mappedId || q.symbol === m.id);
  if (quote) {
  return {
  ...m,
  prevPrice: m.price,
  price: quote.price || quote.regularMarketPrice || m.price,
  change: quote.changesPercentage || quote.regularMarketChangePercent || m.change
  };
  }
  return m;
  }));
  }
  }
  } catch (e: any) {
  if (e.name !== 'AbortError' && import.meta.env.DEV) {
  console.warn("Market fetch error - silenced for production:", e.message);
  }
  }
  };
  
  fetchMarkets();
  const marketInterval = setInterval(fetchMarkets, 15000);
 
  return () => {
  clearInterval(marketInterval);
  abortController.abort();
  };
 }, []);

 const formatCryptoPrice = (price: number | undefined | null) => {
 if (!price || price === 0) return "";
 return price < 10 ? price.toFixed(3) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 };

 return (
    <MobileZoomWrapper scaleMobile={0.65}>
    <div className="w-full flex-1 flex flex-col min-h-0 bg-bg">
 {/* Premium Top Navigation Tabs */}
 <div className="w-full bg-surface border-b border-border sticky top-0 z-40 shrink-0">
 <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex gap-3 overflow-x-auto no-scrollbar items-center">
 <button 
 onClick={() => setMarketPageUrl('stocks')} 
 className={cn("px-4 h-9 flex items-center gap-1 md:gap-1.5 text-[13px] font-medium transition-all rounded-xl shrink-0 border", 
 marketPageUrl === 'stocks' 
 ? "bg-text text-bg border-text shadow-md" 
 : "text-text bg-transparent border-transparent hover:bg-surface-2 hover:text-text")}
 >
 <Activity size={14} className={marketPageUrl === 'stocks' ? "text-bg" : "text-text"} />
 Equities
 </button>
 <button 
 onClick={() => setMarketPageUrl('etfs')} 
 className={cn("px-4 h-9 flex items-center gap-1 md:gap-1.5 text-[13px] font-medium transition-all rounded-xl shrink-0 border", 
 marketPageUrl === 'etfs' 
 ? "bg-text text-bg border-text shadow-md" 
 : "text-text bg-transparent border-transparent hover:bg-surface-2 hover:text-text")}
 >
 <PieChart size={14} className={marketPageUrl === 'etfs' ? "text-bg" : "text-text"} />
 ETF Overview
 </button>
 </div>
 </div>

 {marketPageUrl === 'etfs' && <div className="flex-1 w-full min-h-0 flex flex-col"><EtfScreener /></div>}
 
  {marketPageUrl === 'stocks' && (
  <div className="flex-1 min-h-0 overflow-auto">
  {/* ULTRA COMPACT SEARCH BAR */}
  <div ref={searchSectionRef} className="w-full px-4 md:px-8 mt-4 mb-6 max-w-[2400px] xl:px-12 mx-auto flex justify-start">
    <div className="relative z-50 w-full max-w-[280px] group transition-all duration-300">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/20 via-blue-500/5 to-transparent blur-sm opacity-30 transition-opacity duration-300 group-focus-within:opacity-50"></div>
      <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/60 dark:border-white/10 rounded-full shadow-sm p-0.5 transition-all duration-300 focus-within:shadow focus-within:border-sky-400/40 hover:border-sky-400/20">
        <div className="pl-3 pr-1 text-text-4 group-focus-within:text-sky-500 transition-colors">
          <Search size={14} strokeWidth={2} />
        </div>
        <TickerInput 
          value={searchInput}
          onChange={setSearchInput}
          onSelect={(sym) => {
            setSearchInput(sym);
            fetchStockData(sym);
          }}
          onSubmit={(sym) => {
            setSearchInput(sym);
            fetchStockData(sym);
          }}
          placeholder={currentLabels.searchPlaceholder}
          className="w-full bg-transparent border-none pl-1 pr-2 py-1.5 text-[14px] md:text-[12px] font-medium outline-none text-text placeholder:text-text-4/60 rounded-full focus:ring-0 shadow-none !ring-0 focus:!border-transparent"
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (searchInput.trim()) {
              fetchStockData(searchInput.trim().toUpperCase());
            }
          }}
          className="mr-0.5 shrink-0 bg-surface-2 hover:bg-sky-50 text-text hover:text-sky-600 px-3 py-1 rounded-full font-medium transition-all text-[10px] border border-border/80"
        >
          {currentLabels.go}
        </button>
      </div>
    </div>
  </div>

  {selectedLazyPortfolio ? (
  <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 pb-12 pt-4">

  
  <button 
  onClick={() => setSelectedLazyPortfolio(null)}
 className="mb-8 flex items-center gap-2 text-text hover:text-pv-blue transition-colors text-sm font-bold bg-white px-5 py-2.5 rounded-[1.5rem] border border-border shadow-sm w-fit"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
 {currentLabels.backToOverview}
 </button>

 <div className="bg-white rounded-[2rem] border border-border/80 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
 <div className="p-8 md:p-12 border-b border-border/60 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pv-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
 <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
 <div className="flex-1">
 <div className="text-pv-blue font-bold text-sm mb-3">{selectedLazyPortfolio.author} {currentLabels.strategy}</div>
 <p className="text-text font-medium text-sm leading-relaxed max-w-3xl">
 {selectedLazyPortfolio.description}
 </p>
 </div>
 <div className="flex flex-col gap-4 min-w-[240px] shrink-0">
 <div className="bg-white rounded-[2rem] p-6 border border-border/60 shadow-sm relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
 <div className="text-xs md:text-sm font-semibold text-text mb-1">{currentLabels.annualizedReturn30y}</div>
 <div className="text-5xl font-semibold text-emerald-600 relative z-10">
 {selectedLazyPortfolio.y30 != null ? selectedLazyPortfolio.y30.toFixed(2) : "-"}<span className="text-2xl text-emerald-600/50 ml-1">%</span>
 </div>
 <div className="mt-3 flex items-center gap-1 md:gap-1.5 text-sm font-bold text-text">
 <TrendingUp size={14} className="text-emerald-500" /> {currentLabels.basedOnHistorical}
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 bg-white relative">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[80%] bg-border/40 hidden lg:block" />
 <div>
 <h3 className="text-xl font-semibold text-text mb-8 flex items-center gap-2">
 <PieChart className="text-pv-blue" size={20} /> {currentLabels.assetAllocation}
 </h3>
 <div className="space-y-7">
 <div className="flex flex-col gap-2.5">
 <div className="flex justify-between items-center text-sm font-bold">
 <span className="text-blue-700 text-sm">{currentLabels.equitiesStocks}</span>
 <span className="text-text bg-blue-50 px-2 py-0.5 rounded font-semibold text-sm">{selectedLazyPortfolio.stocks}%</span>
 </div>
 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${selectedLazyPortfolio.stocks}%` }}></div>
 </div>
 </div>
 <div className="flex flex-col gap-2.5">
 <div className="flex justify-between items-center text-sm font-bold">
 <span className="text-text text-sm">{currentLabels.fixedIncomeBonds}</span>
 <span className="text-text bg-slate-100 px-2 py-0.5 rounded font-semibold text-sm">{selectedLazyPortfolio.bonds}%</span>
 </div>
 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full" style={{ width: `${selectedLazyPortfolio.bonds}%` }}></div>
 </div>
 </div>
 <div className="flex flex-col gap-2.5">
 <div className="flex justify-between items-center text-sm font-bold">
 <span className="text-amber-600 text-sm">{language === 'fr' ? 'Matières Premières & Actifs Réels' : language === 'de' ? 'Rohstoffe & Sachwerte' : language === 'nl' ? 'Grondstoffen & Reële Activa' : language === 'es' ? 'Materias Primas y Activos Reales' : 'Commodities & Real Assets'}</span>
 <span className="text-text bg-amber-50 px-2 py-0.5 rounded font-semibold text-sm">{selectedLazyPortfolio.comm}%</span>
 </div>
 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${selectedLazyPortfolio.comm}%` }}></div>
 </div>
 </div>
 </div>
 
 <div className="mt-12 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
 <h4 className="text-sm font-medium text-blue-900 mb-3">{language === 'fr' ? 'Analyse & Aperçu du Portefeuille' : language === 'de' ? 'Portfolio-Analyse & Einblicke' : language === 'nl' ? 'Portfolio-analyse & Inzicht' : language === 'es' ? 'Análisis y Perspectiva de Cartera' : 'Portfolio Analytics & Insight'}</h4>
 <p className="text-blue-800/80 text-[13px] leading-relaxed font-medium">
 {language === 'fr' ? 'Cette répartition d\'allocation est spécifiquement modélisée pour atteindre ses performances historiques sans nécessiter d\'ajustements tactiques. La stratégie repose sur un calendrier de rééquilibrage strict et objectif, généralement exécuté chaque année ou semestre, pour garantir que les pondérations ne s\'écartent jamais de l\'allocation cible.' : language === 'de' ? 'Diese Allokationsaufteilung ist speziell darauf ausgelegt, ihre historische Performance zu erzielen, ohne dass taktische Anpassungen erforderlich sind. Die Strategie basiert auf einem strikten, emotionslosen Rebalancing-Zeitplan – der in der Regel jährlich oder halbjährlich durchgeführt wird – um sicherzustellen, dass die Gewichtungen nie zu weit von der Kern-Zielallokation abweichen.' : language === 'nl' ? 'Deze allocatiespreiding is specifiek gemodelleerd om de historische prestaties te behalen zonder dat tactische aanpassingen nodig zijn. De strategie gedijt bij een strikt, emotieloos herbalanceringsschema - meestal jaarlijks of halfjaarlijks uitgevoerd - om ervoor te zorgen dat de wegingen nooit te ver afwijken van de doelallocatie.' : language === 'es' ? 'Esta distribución de asignación está diseñada específicamente para lograr su historial de rendimiento sin requerir ajustes tácticos. La estrategia prospera con un calendario de reequilibrio estricto y objetivo, que generalmente se realiza de forma anual o semestral, para garantizar que las ponderaciones nunca se desvíen demasiado de la asignación objetivo.' : 'This allocation spread is specifically modeled to achieve its stated historical track record without requiring tactical timing adjustments. The strategy thrives on a strict, emotionless rebalancing schedule—typically executed annually or semi-annually—to ensure weightings never drift too far from the target core allocation.'}
 </p>
 </div>
 </div>

 <div>
 <h3 className="text-xl font-semibold text-text mb-8 flex items-center gap-2">
 <BarChart2 className="text-pv-blue" size={20} /> {language === 'fr' ? 'Rendements Historiques par Horizon' : language === 'de' ? 'Historische Renditen nach Zeithorizont' : language === 'nl' ? 'Historische Rendementen per Horizon' : language === 'es' ? 'Rendimientos Históricos por Horizonte' : 'Historical Horizon Returns'}
 </h3>
 <div className="overflow-hidden border border-border/60 rounded-[2rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
 <table className="w-full text-left">
 <thead className="bg-[#f8f9fa] border-b border-border/80 text-sm font-semibold text-text ">
 <tr>
 <th className="py-3.5 px-6">{language === 'fr' ? 'Horizon Temporel' : language === 'de' ? 'Zeithorizont' : language === 'nl' ? 'Tijdshorizon' : language === 'es' ? 'Horizonte Temporal' : 'Time Horizon'}</th>
 <th className="py-3.5 px-6 text-right">{language === 'fr' ? 'Rendement Ann.' : language === 'de' ? 'Ann. Rendite' : language === 'nl' ? 'Geann. Rendement' : language === 'es' ? 'Rend. Anual' : 'Ann. Return'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-[13px] font-medium">
 <tr className="bg-white hover:bg-surface-2 transition-colors">
 <td className="py-3.5 px-6 text-text">{language === 'fr' ? 'Sur 1 An (Glissant)' : language === 'de' ? '1 Jahr rollierend' : language === 'nl' ? '1 Jaar voortschrijdend' : language === 'es' ? '1 Año móvil' : '1 Year Trailing'}</td>
 <td className="py-3.5 px-6 text-right font-bold text-text">{selectedLazyPortfolio.y1 != null ? selectedLazyPortfolio.y1.toFixed(2) : "-"}%</td>
 </tr>
 <tr className="bg-surface-2/30 hover:bg-surface-2/80 transition-colors">
 <td className="py-3.5 px-6 text-text">{language === 'fr' ? '5 Ans (Moyen Terme)' : language === 'de' ? '5 Jahre (Mittelfristig)' : language === 'nl' ? '5 Jaar (Middellange Termijn)' : language === 'es' ? '5 Años (Medio Plazo)' : '5 Years (Mid-Term)'}</td>
 <td className="py-3.5 px-6 text-right font-bold text-text">{selectedLazyPortfolio.y5 != null ? selectedLazyPortfolio.y5.toFixed(2) : "-"}%</td>
 </tr>
 <tr className="bg-white hover:bg-surface-2 transition-colors">
 <td className="py-3.5 px-6 text-text">{language === 'fr' ? '10 Ans (Cœur)' : language === 'de' ? '10 Jahre (Kern)' : language === 'nl' ? '10 Jaar (Kern)' : language === 'es' ? '10 Años (Núcleo)' : '10 Years (Core)'}</td>
 <td className="py-3.5 px-6 text-right font-bold text-text">{selectedLazyPortfolio.y10 != null ? selectedLazyPortfolio.y10.toFixed(2) : "-"}%</td>
 </tr>
 <tr className="bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors border-t border-emerald-100/50">
 <td className="py-4 px-6 font-bold text-emerald-800">{language === 'fr' ? '30 Ans (Conviction Long Terme)' : language === 'de' ? '30 Jahre (Langfristige Überzeugung)' : language === 'nl' ? '30 Jaar (Lange Termijn Overtuiging)' : language === 'es' ? '30 Años (Convicción a Largo Plazo)' : '30 Years (Long Term Conviction)'}</td>
 <td className="py-4 px-6 text-right font-semibold text-emerald-600 text-sm">{selectedLazyPortfolio.y30 != null ? selectedLazyPortfolio.y30.toFixed(2) : "-"}%</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="mt-10">
 <h4 className="text-sm font-medium text-text mb-5">{language === 'fr' ? 'Considérations de Mise en Œuvre' : language === 'de' ? 'Hinweise zur Umsetzung' : language === 'nl' ? 'Overwegingen bij Implementatie' : language === 'es' ? 'Consideraciones de Implementación' : 'Implementation Considerations'}</h4>
 <ul className="space-y-4 text-[13px] font-medium text-text">
 <li className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-slate-100 text-text flex items-center justify-center shrink-0 mt-0.5"><span className="text-sm font-bold">1</span></div>
 <span className="pt-0.5">{language === 'fr' ? 'Privilégiez les ETF ou fonds indiciels à très bas coût de fournisseurs comme Vanguard, State Street ou iShares pour minimiser l\'impact des frais sur plusieurs décennies.' : language === 'de' ? 'Bevorzugen Sie extrem kostengünstige Index-ETFs oder Investmentfonds von Anbietern wie Vanguard, State Street oder iShares, um den Gebühreneffekt über Jahrzehnte hinweg zu minimieren.' : language === 'nl' ? 'Geef de voorkeur aan ultra-goedkope index-ETF\'s of beleggingsfondsen van aanbieders zoals Vanguard, State Street of iShares om de invloed van vergoedingen over decennia te minimaliseren.' : language === 'es' ? 'Priorice los ETF indexados o fondos mutuos de muy bajo costo de proveedores como Vanguard, State Street o iShares para minimizar el impacto de las comisiones durante décadas.' : 'Prioritize ultra-low-cost index ETFs or mutual funds from providers like Vanguard, State Street, or iShares to minimize fee drag over decades.'}</span>
 </li>
 <li className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-slate-100 text-text flex items-center justify-center shrink-0 mt-0.5"><span className="text-sm font-bold">2</span></div>
 <span className="pt-0.5">{language === 'fr' ? `Rééquilibrez strictement une fois par an pour maintenir les allocations cibles (ex. exactement ${selectedLazyPortfolio.stocks}% d'actions). Ne rééquilibrez pas en fonction des fluctuations du marché.` : language === 'de' ? `Führen Sie das Rebalancing strikt einmal pro Jahr durch, um die Zielallokationen beizubehalten (z. B. genau ${selectedLazyPortfolio.stocks}% Aktien). Machen Sie das Rebalancing nicht von Marktschwankungen abhängig.` : language === 'nl' ? `Herbalanceer strikt één keer per jaar om de doelallocaties te behouden (bijv. exact ${selectedLazyPortfolio.stocks}% aandelen). Herbalanceer niet op basis van marktschommelingen.` : language === 'es' ? `Reequilibre estrictamente una vez al año para mantener las asignaciones objetivo (por ejemplo, exactamente el ${selectedLazyPortfolio.stocks}% de acciones). No reequilibre en función de las fluctuaciones del mercado.` : `Rebalance strictly once per year to maintain target allocations (e.g. exactly ${selectedLazyPortfolio.stocks}% equities). Do not rebalance based on market fluctuations.`}</span>
 </li>
 <li className="flex gap-4 items-start">
 <div className="w-6 h-6 rounded-full bg-slate-100 text-text flex items-center justify-center shrink-0 mt-0.5"><span className="text-sm font-bold">3</span></div>
 <span className="pt-0.5">{language === 'fr' ? 'Évitez de modifier, de remplacer ou d\'essayer d\'anticiper le marché en fonction de l\'actualité macroéconomique à court terme. La force de cette stratégie réside dans sa cohérence absolue dans le temps.' : language === 'de' ? 'Vermeiden Sie es, die Strategie basierend auf kurzfristigen makroökonomischen Nachrichten anzupassen, zu ersetzen oder den Markt zu timen. Die Stärke dieser Strategie liegt in ihrer absoluten Beständigkeit im Laufe der Zeit.' : language === 'nl' ? 'Vermijd aanpassingen, vervangingen of het timen van de markt op basis van macro-economisch nieuws op de korte termijn. De kracht van deze strategie is de absolute consistentie in de loop van de tijd.' : language === 'es' ? 'Evite realizar ajustes, sustituciones o intentar anticiparse al mercado basándose en noticias macroeconómicas a corto plazo. El poder de esta estrategia radica en su coherencia absoluta a lo largo del tiempo.' : 'Avoid tweaking, substituting, or timing the market based on short-term macroeconomic news. The power of this strategy is its absolute consistency over time.'}</span>
 </li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 pb-12 pt-4">

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[1.5rem] mb-8">
 {error}
 </div>
 )}

 {loading && !quote && (
 <div className="space-y-8 animate-pulse">
 <div className="bg-surface border border-border rounded-[2rem] p-6 h-32"></div>
 <div className="flex gap-2 border-b border-border overflow-x-auto no-scrollbar pb-2">
 {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-24 bg-surface rounded"></div>)}
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-surface rounded-[1.5rem] border border-border"></div>)}
 </div>
 </div>
 )}

 {!loading && !error && quote && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-8"
 >
 {/* Header Profile */}
 <div className="bg-surface/60 backdrop-blur-xl border border-border/60 rounded-[1.25rem] p-5 flex flex-col overflow-hidden relative shadow-sm group">
 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pv-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-pv-blue/10 transition-colors duration-1000" />
 <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pv-blue/20 to-transparent"></div>
 
 <div className="flex flex-col xl:flex-row xl:items-start justify-between relative z-10 w-full gap-10">
 
 <div className="flex flex-col gap-6 flex-1">
 <div className="flex flex-col sm:flex-row sm:items-center gap-6">
 {quote && (
  <AssetLogo ticker={quote.symbol} name={quote.name} className="w-12 h-12 rounded-full shadow-sm border border-border" />
 )}
 <div className="flex flex-col gap-2">
 <div className="flex flex-wrap items-baseline gap-3">
 <h2 className="text-4xl font-semibold text-text tracking-tight">
 {quote.name ? quote.name.replace(/ - NMS/g, '').replace(/ NMS/i, '').replace(/, Inc./gi, '') : quote.symbol}
 </h2>
 </div>
 
 <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-text mt-1">
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-transparent px-0 py-0">
 Action {quote.quoteType === 'EQUITY' ? '' : `(${quote.quoteType})`}
 </span>
 <span className="px-1">•</span>
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-transparent px-0 py-0">
 🇺🇸 États-Unis
 </span>
 <span className="px-1">•</span>
 {quote.fullExchangeName && (
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-transparent px-0 py-0">
 {quote.fullExchangeName.replace(/NasdaqGS/gi, 'NASDAQ').replace(/NMS/gi, 'NASDAQ')}
 </span>
 )}
 
 </div>
 {/* New Horizontal Stats directly under Title */}
 <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text mt-1">
 {profile?.industry && (
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-transparent px-0 py-0">
 {profile.industry}
 </span>
 )}
 {quote.marketCap && (
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-surface-2 px-2 py-1 rounded">
 Cap: {formatAggregate(quote.marketCap)}
 </span>
 )}
 {profile?.dividendYield && (
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-surface-2 px-2 py-1 rounded">
 Div Yield: {formatWatchlistDivYield(profile.dividendYield)}
 </span>
 )}
 {quote.regularMarketVolume && (
 <span className="flex items-center gap-1 md:gap-1.5 text-text bg-surface-2 px-2 py-1 rounded">
 Vol: {formatNumber(quote.regularMarketVolume)}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Price & Performance Block */}
 <div className="flex flex-col items-start xl:items-end gap-2 pt-2 bg-surface-2/40 xl:bg-transparent rounded-[2rem] xl:rounded-none p-6 xl:p-0 border border-border/50 xl:border-transparent">
 <div className="flex flex-col gap-0.5">
 <span className="text-sm font-bold text-text bg-transparent">
 {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
 </span>
 <span className="text-2xl font-semibold font-mono text-text tracking-tighter leading-none flex items-baseline">
 <span className="text-lg mr-1">$</span>
 <BlinkingPriceText price={liveQuotePrice !== null ? liveQuotePrice : (quote.price || 0)} />
 </span>
 </div>
 
 <div className={cn(
 "text-base font-mono font-bold flex items-center gap-2 mt-2 px-3 py-1.5 rounded-2xl border",
 (quote.change || 0) >= 0 ? "text-text bg-emerald-50 border-emerald-100" : "text-text bg-rose-50 border-rose-100"
 )}>
 {(quote.change || 0) >= 0 ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
 {(quote.change || 0) >= 0 ? '+' : ''}{quote.change?.toFixed(2)} 
 <span className="opacity-70 ml-1">({(quote.change || 0) >= 0 ? '+' : ''}{quote.changesPercentage?.toFixed(2)}%)</span>
 </div>
 
 <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-border/50 w-full xl:justify-end">
 <div className="flex flex-col xl:items-end gap-1">
 <span className="text-sm font-medium text-text">Varia. 5j</span>
 <span className={cn(
 "text-sm font-mono font-bold px-2 py-0.5 rounded",
 history && history.length >= 5 
 ? (quote.price - history[history.length - 5].close >= 0 ? "text-text bg-emerald-50" : "text-text bg-rose-50") 
 : "text-text bg-surface-3"
 )}>
 {history && history.length >= 5 ? (
 `${quote.price - history[history.length - 5].close >= 0 ? '+' : ''}${((quote.price - history[history.length - 5].close) / history[history.length - 5].close * 100).toFixed(2)}%`
 ) : '-'}
 </span>
 </div>
 <div className="flex flex-col xl:items-end gap-1">
 <span className="text-sm font-medium text-text">Varia. 1 janv</span>
 <span className={cn(
 "text-sm font-mono font-bold px-2 py-0.5 rounded",
 (() => {
   const item = history && history.find(h => h && h.date && new Date(h.date).getFullYear() === new Date().getFullYear());
   if (!item || quote.price == null || item.close == null) return "text-text bg-surface-3";
   return (quote.price - item.close >= 0 ? "text-text bg-emerald-50" : "text-text bg-rose-50");
 })()
 )}>
 {(() => {
   const item = history && history.find(h => h && h.date && new Date(h.date).getFullYear() === new Date().getFullYear());
   if (!item || quote.price == null || item.close == null) return "-";
   const diff = quote.price - item.close;
   const pct = (diff / item.close) * 100;
   return `${diff >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
 })()}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content which is always visible */}
 <div className="space-y-8">
 
 {/* Full Width Presentation Description */}
 {profile?.description && (
 <div className="w-full">
 <h3 className="text-sm font-medium text-text mb-2">Présentation de {quote.symbol}</h3>
 <p className="text-sm text-text font-medium text-justify w-full">
 {profile.description}
 </p>
 </div>
 )}
 {/* Specific Company Chart & Stats Layout */}
 <div className="w-full">
 {/* Specific Company Graph */}
 <div className="w-full bg-surface border border-border rounded-[2rem] p-6 flex flex-col h-[700px] xl:h-[850px] shadow-sm">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 border-b border-border/30 pb-4 shrink-0">
 <div>
 <h3 className="text-sm font-bold flex items-center gap-2 relative inline-flex pb-1"><TrendingUp className="text-pv-blue" size={16} /><span className="bg-gradient-to-r from-text to-text-3 bg-clip-text text-transparent">{quote.symbol} Technical Analysis</span></h3>
 </div>
 </div>

 <div className="flex-1 w-full relative bg-white border border-border/60 rounded-[1.5rem] overflow-hidden group">
 <AdvancedTradingViewChart 
 symbol={quote.symbol}
 theme="dark" 
 />
 </div>
 </div>
 </div>
 </div>

 {/* Navigation Tabs (Moved Below Chart and Watchlist Table) */}
 {(income.length > 0 || balance.length > 0 || cashFlow.length > 0 || ratios) && (
 <>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-2 mt-12">
 <div className="flex gap-2 overflow-x-auto no-scrollbar">
 {[
 { id: 'income', label: 'Income Statement' },
 { id: 'balance', label: 'Balance Sheet' },
 { id: 'cash', label: 'Cash Flow' }
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap",
 activeTab === tab.id 
 ? "border-pv-blue text-pv-blue" 
 : "border-transparent text-text hover:text-text hover:border-text-4"
 )}
 >
 {tab.label}
 </button>
 ))}
 </div>
 {['income', 'balance', 'cash'].includes(activeTab) && (
 <div className="flex bg-surface-2 p-1 rounded-2xl border border-border shrink-0 self-start sm:self-auto">
 <button 
 onClick={() => setFinancialsType('annual')}
 className={cn("px-3 py-1 text-sm font-bold rounded-xl transition-colors", financialsType === 'annual' ? "bg-white text-pv-blue shadow-sm" : "text-text hover:text-text")}
 >Annual</button>
 <button 
 onClick={() => setFinancialsType('quarterly')}
 className={cn("px-3 py-1 text-sm font-bold rounded-xl transition-colors", financialsType === 'quarterly' ? "bg-white text-pv-blue shadow-sm" : "text-text hover:text-text")}
 >Quarterly</button>
 </div>
 )}
 </div>

 {/* Tab Contents */}
 <div id="report-content" className="min-h-[400px] bg-background mt-6">
 {activeTab === 'income' && (
 income.length > 0 ? (
 <div className="flex flex-col xl:flex-row gap-8 items-start">
 <div className="w-full xl:w-1/3 bg-white border border-border/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[1.5rem] p-6 h-[500px] shrink-0">
 <div className="mb-6 flex items-center justify-between">
 <h3 className="text-lg font-semibold text-text tracking-tight">Income Analysis</h3>
 <span className="text-sm font-bold text-text ">{financialsType === 'annual' ? 'Annual' : 'Quarter'}</span>
 </div>
 <ResponsiveContainer width="100%" height={380}>
 <BarChart data={slicedIncome} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} barGap={6} barCategoryGap="25%">
 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
 <XAxis dataKey="calendarYear" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748B' }} dy={10} />
 <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => formatAggregate(value)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} dx={-10} />
 <Tooltip formatter={(value: any) => formatAggregate(Number(value))} cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 500, padding: '12px' }} itemStyle={{ paddingTop: '4px' }} />
 <Legend iconType="circle" wrapperStyle={{ paddingTop: "24px", fontSize: "12px", fontWeight: "500", color: '#475569' }} verticalAlign="bottom" height={40} />
 <Bar dataKey="revenue" fill="#0EA5E9" name="Revenue" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="grossProfit" fill="#3B82F6" name="Gross Profit" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="operatingIncome" fill="#6366F1" name="Operating" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="netIncome" fill="#10B981" name="Net Income" barSize={16} radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="w-full xl:w-2/3">
 <FinancialTable 
 title={"Income Statement (" + (financialsType === 'annual' ? 'Annual' : 'Quarterly') + ")"}
 data={income.slice(0, 5)}
 fields={[
 { key: 'calendarYear', label: 'Year' },
 { key: 'revenue', label: 'Revenue' },
 { key: 'grossProfit', label: 'Gross Profit' },
 { key: 'operatingIncome', label: 'Operating Income' },
 { key: 'netIncome', label: 'Net Income' },
 { key: 'eps', label: 'EPS' },
 ]}
 />
 </div>
 </div>
 ) : (
 <div className="p-12 text-center text-text-3 font-medium bg-white rounded-[1.5rem] border border-border/80 shadow-sm">
 Aucun compte de résultat disponible pour ce symbole.
 </div>
 )
 )}

 {activeTab === 'balance' && (
 balance.length > 0 ? (
 <div className="flex flex-col xl:flex-row gap-8 items-start">
 <div className="w-full xl:w-1/3 bg-white border border-border/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[1.5rem] p-6 h-[500px] shrink-0">
 <div className="mb-6 flex items-center justify-between">
 <h3 className="text-lg font-semibold text-text tracking-tight">Balance Sheet Analysis</h3>
 <span className="text-sm font-bold text-text ">{financialsType === 'annual' ? 'Annual' : 'Quarter'}</span>
 </div>
 <ResponsiveContainer width="100%" height={380}>
 <BarChart data={slicedBalance} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} barGap={6} barCategoryGap="25%">
 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
 <XAxis dataKey="calendarYear" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748B' }} dy={10} />
 <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => formatAggregate(value)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} dx={-10} />
 <Tooltip formatter={(value: any) => formatAggregate(Number(value))} cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 500, padding: '12px' }} itemStyle={{ paddingTop: '4px' }} />
 <Legend iconType="circle" wrapperStyle={{ paddingTop: "24px", fontSize: "12px", fontWeight: "500", color: '#475569' }} verticalAlign="bottom" height={40} />
 <Bar dataKey="totalAssets" fill="#0EA5E9" name="Total Assets" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="totalLiabilities" fill="#F43F5E" name="Liabilities" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="totalDebt" fill="#F59E0B" name="Total Debt" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="totalStockholdersEquity" fill="#10B981" name="Equity" barSize={16} radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="w-full xl:w-2/3">
 <FinancialTable 
 title={"Balance Sheet (" + (financialsType === 'annual' ? 'Annual' : 'Quarterly') + ")"}
 data={balance.slice(0, 5)}
 fields={[
 { key: 'calendarYear', label: 'Year' },
 { key: 'totalAssets', label: 'Total Assets' },
 { key: 'totalLiabilities', label: 'Total Liabilities' },
 { key: 'totalStockholdersEquity', label: 'Stockholders Eq' },
 { key: 'cashAndCashEquivalents', label: 'Cash & Eq' },
 { key: 'totalDebt', label: 'Total Debt' },
 ]}
 />
 </div>
 </div>
 ) : (
 <div className="p-12 text-center text-text-3 font-medium bg-white rounded-[1.5rem] border border-border/80 shadow-sm">
 Aucun bilan comptable disponible pour ce symbole.
 </div>
 )
 )}

 {activeTab === 'cash' && (
 cashFlow.length > 0 ? (
 <div className="flex flex-col xl:flex-row gap-8 items-start">
 <div className="w-full xl:w-1/3 bg-white border border-border/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[1.5rem] p-6 h-[500px] shrink-0">
 <div className="mb-6 flex items-center justify-between">
 <h3 className="text-lg font-semibold text-text tracking-tight">Cash Flow Analysis</h3>
 <span className="text-sm font-bold text-text ">{financialsType === 'annual' ? 'Annual' : 'Quarter'}</span>
 </div>
 <ResponsiveContainer width="100%" height={380}>
 <BarChart data={slicedCashFlow} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} barGap={6} barCategoryGap="25%">
 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
 <XAxis dataKey="calendarYear" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748B' }} dy={10} />
 <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => formatAggregate(value)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} dx={-10} />
 <Tooltip formatter={(value: any) => formatAggregate(Number(value))} cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 500, padding: '12px' }} itemStyle={{ paddingTop: '4px' }} />
 <Legend iconType="circle" wrapperStyle={{ paddingTop: "24px", fontSize: "12px", fontWeight: "500", color: '#475569' }} verticalAlign="bottom" height={40} />
 <Bar dataKey="operatingCashFlow" fill="#0EA5E9" name="Operating CF" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="capitalExpenditure" fill="#F59E0B" name="CapEx" barSize={16} radius={[4, 4, 0, 0]} />
 <Bar dataKey="freeCashFlow" fill="#10B981" name="Free CF" barSize={16} radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="w-full xl:w-2/3">
 <FinancialTable 
 title={"Cash Flow Statement (" + (financialsType === 'annual' ? 'Annual' : 'Quarterly') + ")"}
 data={cashFlow.slice(0, 5)}
 fields={[
 { key: 'calendarYear', label: 'Year' },
 { key: 'operatingCashFlow', label: 'Operating CF' },
 { key: 'capitalExpenditure', label: 'CapEx' },
 { key: 'freeCashFlow', label: 'Free Cash Flow' },
 { key: 'dividendsPaid', label: 'Dividends' },
 { key: 'netChangeInCash', label: 'Change in Cash' },
 ]}
 />
 </div>
 </div>
 ) : (
 <div className="p-12 text-center text-text-3 font-medium bg-white rounded-[1.5rem] border border-border/80 shadow-sm">
 Aucun flux de trésorerie disponible pour ce symbole.
 </div>
 )
 )}
 </div>
 </>
 )}

{/* WATCHLIST COMPARISON SECTION */}
 <div ref={comparisonSectionRef} className="mt-6 space-y-3 border-t border-border/80 pt-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <h3 className="text-xs font-semibold flex items-center gap-2 relative inline-flex pb-1">
 <Activity className="text-pv-blue" size={18} />
 <span className="bg-gradient-to-r from-text to-text-3 bg-clip-text text-transparent">Relative Performance Comparison</span>
 <div className="absolute bottom-0 left-0 h-[2px] w-12 bg-gradient-to-r from-pv-blue to-transparent"></div>
 </h3>
 </div>

 <div className="flex flex-col gap-4">
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
 <div className="xl:col-span-7 flex flex-col gap-0">
 <div className="bg-surface border border-border rounded-2xl p-2.5 pb-1 flex flex-col h-[320px] xl:h-[400px] relative shadow-sm group transition-all duration-300 hover:shadow-md hover:border-pv-blue/20">
 <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-pv-blue/[0.01] pointer-events-none rounded-2xl"></div>
 <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-2 mt-1 ml-1 z-10 relative shadow-inner">
 {[
 { label: '5D', range: '5d', interval: '1d' },
 { label: '3M', range: '3mo', interval: '1d' },
 { label: '6M', range: '6mo', interval: '1d' },
 { label: '1Y', range: '1y', interval: '1d' },
 { label: '5Y', range: '5y', interval: '1d' },
 { label: 'MAX', range: 'max', interval: '1d' }
 ].map((p) => (
 <button
 key={p.label}
 onClick={() => setChartPeriod(p)}
 className={cn(
 "px-2 py-0.5 rounded-md text-xs font-semibold font-mono transition-all",
 chartPeriod.label === p.label ? "bg-white text-pv-blue shadow shadow-black/5 ring-1 ring-black/5" : "text-text hover:text-text hover:bg-black/5"
 )}
 >
 {p.label}
 </button>
 ))}
 </div>

 {watchlistData.length === 0 && !watchlistLoading && (
 <div className="absolute inset-0 flex items-center justify-center text-text font-mono text-sm">
 Aucune donnée de comparaison historique
 </div>
 )}
 {watchlistData.length > 0 ? (
 <div className="group flex-1 w-full relative transition-all duration-300 bg-white border border-border/60 rounded-[1.5rem] overflow-hidden">
 <div className="w-full h-full relative">
 <TradingViewChart 
 multiData={watchlistData} 
 period={chartPeriod.range} 
 type="relative" 
 theme="light"
 onCrosshairMove={setHoveredTime} 
 />
 </div>
 </div>
 ) : (
 <div className="absolute inset-0 flex items-center justify-center bg-white text-text">
 Aucune donnée de comparaison historique
 </div>
 )}
</div>

{/* Watchlist Table Header & Add Ticker Form */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 mb-2.5">
  <span className="text-[10px] font-bold uppercase text-text-3 tracking-wider">Watchlist Assets</span>
  
  {/* Add Ticker to Watchlist Form */}
  <form onSubmit={handleAddToWatchlist} className="flex items-center gap-2 z-10">
    <div className="relative">
      <input 
        type="text" 
        value={newWatchlistInput} 
        onChange={(e) => {
          setNewWatchlistInput(e.target.value.toUpperCase());
          setWatchlistAddError(null);
        }}
        placeholder="Add Ticker (e.g., TSLA)" 
        className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-surface text-text placeholder-text-3 focus:outline-none focus:ring-1 focus:ring-pv-blue/50 w-36 transition-all"
      />
      {watchlistAddError && (
        <span className="absolute -bottom-3.5 left-0 text-[8px] text-red font-medium whitespace-nowrap">{watchlistAddError}</span>
      )}
    </div>
    <button 
      type="submit" 
      className="flex items-center gap-1 text-[11px] font-semibold bg-pv-blue hover:bg-pv-blue/90 text-white px-2 py-1 rounded-lg transition-all shadow-sm"
    >
      <Plus size={10} />
      <span>Add</span>
    </button>
  </form>
</div>

{/* Watchlist Table */}
<div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-surface-2 border-b border-border/80 text-[10px] uppercase font-bold text-text-3 tracking-wider">
        <tr>
          <th className="px-3 py-1.5 rounded-tl-xl">Asset</th>
          <th className="px-3 py-1.5 text-right">Price</th>
          <th className="px-3 py-1.5 text-right">Change</th>
          <th className="px-3 py-1.5 text-right hidden sm:table-cell">Market Cap</th>
          <th className="px-3 py-1.5 text-right hidden md:table-cell">Div Yield</th>
          <th className="px-3 py-1.5 text-center rounded-tr-xl w-14">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {movers.map((m) => (
          <tr key={m.ticker} onClick={() => handleMoverClick(m.ticker)} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
            <td className="px-3 py-1">
              <div className="flex items-center gap-2">
                <AssetLogo ticker={m.ticker} name={m.name} className="w-8 h-8 rounded-full border border-border/50" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-text flex items-center gap-1.5">
                    {m.ticker}
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: watchlistColors[m.index % watchlistColors.length] }} />
                  </span>
                  <span className="text-[10px] text-text-3 truncate max-w-[100px] sm:max-w-[150px]">{m.name}</span>
                </div>
              </div>
            </td>
            <td className="px-3 py-1 text-right font-mono text-xs font-semibold text-text">
              {m.price ? "$" + m.price.toFixed(2) : "---"}
            </td>
            <td className="px-3 py-1 text-right font-mono text-xs font-semibold">
              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", m.periodChangePct >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red")}>
                {m.periodChangePct > 0 ? '+' : ''}{m.periodChangePct.toFixed(2)}%
              </span>
            </td>
            <td className="px-3 py-1 text-right font-mono text-xs text-text-2 hidden sm:table-cell">
              {m.marketCap ? formatAggregate(m.marketCap) : "---"}
            </td>
            <td className="px-3 py-1 text-right font-mono text-xs text-text-2 hidden md:table-cell">
              {m.dividendYield ? formatWatchlistDivYield(m.dividendYield) : "---"}
            </td>
            <td className="px-3 py-1 text-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWatchlist(m.ticker);
                }}
                className="text-text-3 hover:text-red p-1 rounded-md transition-colors inline-flex items-center justify-center hover:bg-red/10"
                title="Supprimer de la liste"
              >
                <Trash2 size={12} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
</div> {/* closes xl:col-span-7 */}

{/* Market News Column */}
  <div className="xl:col-span-5 flex flex-col items-stretch h-[600px] xl:h-[850px] max-h-[850px]">
 <div className="bg-gradient-to-b from-white to-slate-50/50 border flex flex-col border-border/80 rounded-[24px] p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full overflow-hidden relative group/news transition-all duration-300">
 {/* Decorative glow */}
 <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pv-blue/[0.04] blur-[80px] rounded-full pointer-events-none"></div>

 <div className="p-8 pb-6 border-b border-border/60 relative z-10 flex-shrink-0 flex justify-between items-center bg-white/80 backdrop-blur-xl">
 <div>
 <h3 className="text-xl font-bold text-text tracking-tight flex items-center gap-3">
 Market News
 </h3>
 <p className="text-text text-sm font-bold mt-1">Global Financial Insights</p>
 </div>
 <div className="flex items-center gap-2">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pv-blue opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-pv-blue"></span>
 </span>
 <span className="text-sm font-medium text-pv-blue">Live</span>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto px-4 py-2 relative z-10 custom-scrollbar">
 {marketNewsLoading ? (
 <div className="absolute inset-0 flex items-center justify-center text-text font-mono text-sm font-bold animate-pulse">
  
 </div>
 ) : (
 <div className="space-y-0">
 {(marketNews.length > 0 ? marketNews : PRESTIGE_NEWS).map((n, idx) => (
 <a 
 key={idx}
 href={n.url || '#'}
 target="_blank" 
 rel="noopener noreferrer"
 className="group block py-6 border-b border-border/40 last:border-0 hover:bg-black/[0.02] transition-all duration-300 px-4 rounded-[1.5rem] relative overflow-hidden"
 >
 <div className="flex flex-col gap-3 relative z-10">
 <h4 className="text-[15px] leading-[1.6] font-semibold text-text group-hover:text-pv-blue transition-colors">
 {n.headline || n.summary}
 </h4>
 <div className="flex justify-start items-center text-sm font-bold mt-1 gap-3">
 <span className="text-text">
 {n.source?.toUpperCase() || 'FINANCE INC.'}
 </span>
 <span className="text-border">•</span>
 <span className="text-text">{n.date || 'LATEST'}</span>
 </div>
 </div>
 </a>
 ))}
 </div>
 )}
 </div>
  </div>
 </div>
 </div>
 </div>
 </div>

 {/* TABLES SECTION: ASSET CLASSES & ETFs */}
 <div ref={macroTrendsSectionRef} className="mt-8 mb-8 w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
 
 {/* ASSET CLASSES COLUMN (LEFT) */}
 <div className="xl:col-span-7 flex flex-col gap-12 w-full">
 
 {/* ASSET CLASSES TABLE */}
 <div className="w-full">
 <div className="mb-6 flex flex-col border-b border-border/80 pb-4 gap-2">
 <div className="flex items-center gap-2">
 <BarChart2 size={24} className="text-pv-blue" />
 <h3 className="text-2xl font-bold text-text tracking-tight uppercase">
 ASSET CLASSES - USD CURRENCY
 </h3>
 </div>
 <p className="text-sm font-semibold text-pv-blue tracking-wide uppercase mt-1">
 Return - Risk - Drawdown
 </p>
 </div>
 
 <div className="flex flex-col gap-3 mb-6 text-sm text-text leading-relaxed bg-[#f8f9fa] p-4 rounded-[1.5rem] border border-border/60">
 <p className="font-bold text-text flex items-center gap-2">
 <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
 Last Update as of 30 June 2026
 </p>
 </div>

 <div className="w-full bg-white rounded-[2rem] border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
 <div className="overflow-x-auto scrollbar-thin">
 <table className="w-full min-w-[1000px] text-left border-none relative">
 <thead className="bg-[#f8f9fa] border-b border-border/80 text-xs font-semibold text-text uppercase tracking-normal md:tracking-wider">
 <tr>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap">Ticker</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap ">USD • ETF</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1M</th>
  <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">6M</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1Y</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">5Y</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">10Y</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">20Y</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-right whitespace-nowrap">30Y▾</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-xs md:text-sm">
 {assetClasses.map((item, idx) => {
 const checkInf = (val: number, target: number) => val < target;
 return (
 <tr key={idx} className="hover:bg-pv-blue/5 transition-colors group">
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-bold text-text bg-white/50 transition-colors flex items-center gap-1 md:gap-1.5">
 {item.ticker}
 </td>
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-semibold text-text whitespace-nowrap" title={item.asset}>{item.asset}</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m1 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.m1 >= 0 ? "+" : ""}{item.m1 != null ? item.m1.toFixed(2) : "-"}%</td>
  <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m6 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.m6 >= 0 ? "+" : ""}{item.m6 != null ? item.m6.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-semibold whitespace-nowrap", checkInf(item.y1, 3.69) ? "text-rose-700 bg-rose-50/50 px-1 rounded border border-rose-100" : (item.y1 >= 0 ? "text-emerald-600" : "text-rose-600"))}>{item.y1 != null ? item.y1.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-semibold whitespace-nowrap", checkInf(item.y5, 4.37) ? "text-rose-700 bg-rose-50/50 px-1 rounded border border-rose-100" : (item.y5 >= 0 ? "text-emerald-600" : "text-rose-600"))}>{item.y5 != null ? item.y5.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-semibold whitespace-nowrap", checkInf(item.y10, 3.33) ? "text-rose-700 bg-rose-50/50 px-1 rounded border border-rose-100" : (item.y10 >= 0 ? "text-emerald-600" : "text-rose-600"))}>{item.y10 != null ? item.y10.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-semibold whitespace-nowrap", checkInf(item.y20, 2.90) ? "text-rose-700 bg-rose-50/50 px-1 rounded border border-rose-100" : (item.y20 >= 0 ? "text-emerald-600" : "text-rose-600"))}>{item.y20 != null ? item.y20.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0.5 md:py-2 md:px-2.5 text-right font-bold whitespace-nowrap bg-emerald-50/10", checkInf(item.y30, 2.55) ? "text-rose-700 bg-rose-50/50 px-1 rounded border border-rose-100" : (item.y30 >= 0 ? "text-emerald-700" : "text-rose-700"))}>{item.y30 != null ? item.y30.toFixed(2) : "-"}%</td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 
 {/* INDICES TABLE */}
 <div className="w-full">
 <div className="mb-6 flex flex-col border-b border-border/80 pb-4">
 <h3 className="text-xl font-semibold text-text tracking-tight flex items-center gap-2">
 <BarChart2 size={20} className="text-pv-blue" />
 Major Global Indices
 </h3>
 <p className="text-sm text-text/60 mt-1">
 Track the most referenced equity benchmark indices reflecting global macroeconomic stability and corporate health. Performance figures are native to local currencies.
 </p>
 </div>
 
 <div className="w-full bg-white rounded-[2rem] border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
 <div className="overflow-x-auto scrollbar-thin">
 <table className="w-full min-w-[800px] text-left border-none relative">
 <thead className="bg-[#f8f9fa] border-b border-border/80 text-xs font-semibold text-text uppercase tracking-normal md:tracking-wider">
 <tr>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap">Ticker</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap ">Index ▾</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1M</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">6M</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1Y</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">5Y</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-right whitespace-nowrap">10Y</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-xs md:text-sm">
 {majorIndices.map((item, idx) => {
 return (
 <tr key={idx} className="hover:bg-pv-blue/5 transition-colors group">
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-bold text-text bg-white/50 transition-colors flex items-center gap-1 md:gap-1.5">
 {item.ticker}
 </td>
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-medium text-text whitespace-nowrap" title={item.asset}>{item.asset}</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m1 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.m1 >= 0 ? "+" : ""}{item.m1 != null ? item.m1.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m6 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.m6 >= 0 ? "+" : ""}{item.m6 != null ? item.m6.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.y1 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.y1 != null ? item.y1.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.y5 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.y5 != null ? item.y5.toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0.5 md:py-2 md:px-2.5 text-right font-medium whitespace-nowrap", item.y10 >= 0 ? "text-emerald-600" : "text-rose-600")}>{item.y10 != null ? item.y10.toFixed(2) : "-"}%</td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* MEGATRENDS TABLE */}
 <div className="w-full">
 <div className="mb-6 flex flex-col border-b border-border/80 pb-4 gap-2">
 <div className="flex items-center gap-2">
 <BarChart2 size={24} className="text-[#635BFF]" />
 <h3 className="text-2xl font-bold text-text tracking-tight uppercase">
 MEGATRENDS - USD CURRENCY
 </h3>
 </div>
 <p className="text-sm font-semibold text-pv-blue tracking-wide uppercase mt-1">
 Return - Risk - Drawdown
 </p>
 </div>

 <div className="flex flex-col gap-2 mb-6 text-sm text-text leading-relaxed bg-[#f8f9fa] p-4 rounded-[1.5rem] border border-border/60">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <p className="font-bold text-text flex items-center gap-2">
 <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
 Last Update as of 30 June 2026
 </p>
 <div className="text-xs font-semibold text-[#635BFF] flex items-center gap-1 md:gap-1.5">
 <span>Filters:</span>
 <span className="bg-[#635BFF]/10 text-[#635BFF] px-2.5 py-0.5 rounded-md">Return (%) - Jun 30, 2026</span>
 </div>
 </div>
 </div>

 <div className="w-full bg-white rounded-[2rem] border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
 <div className="overflow-x-auto scrollbar-thin">
 <table className="w-full min-w-[800px] text-left border-none relative">
 <thead className="bg-[#f8f9fa] border-b border-border/80 text-xs font-semibold text-text uppercase tracking-normal md:tracking-wider">
 <tr>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap">Ticker</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap ">USD • ETF</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1M</th>
  <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">6M</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1Y▾</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">5Y</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-right whitespace-nowrap">10Y</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-xs md:text-sm">
 {megatrends.map((item, idx) => {
 return (
 <tr key={idx} className="hover:bg-pv-blue/5 transition-colors group">
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-bold text-text bg-white/50 transition-colors">
 {item.ticker}
 </td>
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-semibold text-text whitespace-nowrap" title={item.asset}>
 {item.asset}
 </td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m1 >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {item.m1 >= 0 ? "+" : ""}{item.m1 != null ? item.m1.toFixed(2) : "-"}%
 </td>
  <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.m6 >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {item.m6 >= 0 ? "+" : ""}{item.m6 != null ? item.m6.toFixed(2) : "-"}%
 </td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-bold whitespace-nowrap bg-emerald-50/10", item.y1 >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {item.y1 >= 0 ? "+" : ""}{item.y1 != null ? item.y1.toFixed(2) : "-"}%
 </td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", item.y5 >= 0 ? "text-[#635BFF]" : "text-rose-600")}>
 {item.y5 != null ? `${item.y5 >= 0 ? "+" : ""}${item.y5 != null ? item.y5.toFixed(2) : "-"}%` : "-"}
 </td>
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 text-right font-medium whitespace-nowrap text-text/80">
 {item.y10 != null ? `${item.y10 >= 0 ? "+" : ""}${item.y10 != null ? item.y10.toFixed(2) : "-"}%` : "-"}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 
 </div>
 
 {/* ETFs COLUMN (RIGHT) */}
 <div className="xl:col-span-5 flex flex-col gap-8 w-full">
 
 {/* BEST ETFs TABLE */}
 <div className="w-full">
 <div className="mb-6 flex flex-col border-b border-border/80 pb-4">
 <h3 className="text-xl font-semibold text-text tracking-tight flex items-center gap-2">
 <BarChart2 size={20} className="text-pv-blue" />
 BEST 100 ETF RETURNS - LAST 12 MONTHS
 </h3>
 <p className="text-sm text-text/60 mt-1">
 Top performing global ETFs over the trailing 12 months, sorted by highest 1-Year return. Track leading thematic indexes. Last Update: 30 June 2026.
 </p>
 </div>
 
 <div className="w-full bg-white rounded-[2rem] border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
 <div className="overflow-x-auto scrollbar-thin">
 <table className="w-full min-w-[550px] text-left border-none relative">
 <thead className="bg-[#f8f9fa] border-b border-border/80 text-xs font-semibold text-text uppercase tracking-normal md:tracking-wider">
 <tr>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left whitespace-nowrap">Ticker</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-left ">ETF</th>
 <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">1M</th>
  <th className="py-0 px-0 md:py-2.5 md:px-1.5 text-right whitespace-nowrap">6M</th>
 <th className="py-0 px-0.5 md:py-2.5 md:px-2.5 text-right whitespace-nowrap text-text">1Y ▾</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40 text-xs md:text-sm">
 {topETFs.map((etf, idx) => (
 <tr key={idx} className="hover:bg-pv-blue/5 transition-colors group">
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-bold text-text bg-white/50 transition-colors flex items-center gap-1 md:gap-1.5">
 {etf.symbol}
 </td>
 <td className="py-0 px-0.5 md:py-2 md:px-2.5 font-medium text-text whitespace-nowrap" title={etf.name}>{etf.name}</td>
 <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", parseFloat(etf.m1) >= 0 ? "text-emerald-600" : "text-rose-600")}>{parseFloat(etf.m1) >= 0 ? "+" : ""}{etf.m1 != null ? parseFloat(etf.m1).toFixed(2) : "-"}%</td>
  <td className={cn("py-0 px-0 md:py-2 md:px-1.5 text-right font-medium whitespace-nowrap", parseFloat(etf.m6) >= 0 ? "text-emerald-600" : "text-rose-600")}>{parseFloat(etf.m6) >= 0 ? "+" : ""}{etf.m6 != null ? parseFloat(etf.m6).toFixed(2) : "-"}%</td>
 <td className={cn("py-0 px-0.5 md:py-2 md:px-2.5 text-right font-bold whitespace-nowrap bg-emerald-50/10", parseFloat(etf.y1) >= 0 ? "text-emerald-700" : "text-rose-700")}>{etf.y1 != null ? parseFloat(etf.y1).toFixed(2) : "-"}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 
 </div>
 
 </div>

 {/* LAZY PORTFOLIOS SECTION */}
 <div ref={lazyPortfoliosSectionRef} className="mt-16 mb-24 px-4 sm:px-8 xl:px-12 w-full max-w-[2400px] mx-auto">
   <div className="mb-6 flex flex-col items-start border-b border-border/60 pb-4">
     <h4 className="text-2xl font-bold text-text flex items-center gap-2 mb-2">
       Lazy Portfolios
     </h4>
     <p className="text-[14px] font-medium text-text max-w-5xl leading-[1.6]">
       A <strong className="text-text font-bold">Lazy Portfolio</strong> is a diversified collection of assets designed to perform consistently across various market conditions while requiring minimal maintenance. Composed primarily of low-cost ETFs or index funds, these strategies rely on a passive "buy-and-hold" approach, allowing investors to achieve steady, long-term growth without the need for active market timing, stock picking, or complex rebalancing.
     </p>
     <div className="text-xs font-bold text-text/60 mt-2 flex items-center gap-2">
       <span>Consolidated returns as of 30 June 2026</span>
     </div>
   </div>

   <div className="w-full bg-white rounded-[1.5rem] border border-border shadow-sm overflow-hidden transform transition-all duration-300 relative">
     <div className="overflow-x-auto relative z-10 scrollbar-thin">
       <table className="w-full min-w-[950px] text-left border-none relative">
         <thead className="bg-[#f8f9fa] border-b border-border/80 text-sm font-semibold text-text leading-none">
           <tr>
             <th className="py-3 px-4 text-left whitespace-nowrap">Portfolio</th>
             <th className="py-3 px-4 text-center whitespace-nowrap border-l border-border" colSpan={3}>Allocation</th>
             <th className="py-3 px-4 text-center whitespace-nowrap border-l border-border" colSpan={4}>Annualized Returns</th>
           </tr>
           <tr className="bg-white border-b border-border text-xs text-text/80 uppercase tracking-normal md:tracking-wider">
             <th className="py-2 px-4 text-left font-semibold">Author & Strategy</th>
             <th className="py-0 px-0.5 md:py-2 md:px-3 text-center border-l border-border font-semibold">STOCKS</th>
             <th className="py-0 px-0.5 md:py-2 md:px-3 text-center font-semibold">BONDS</th>
             <th className="py-0 px-0.5 md:py-2 md:px-3 text-center font-semibold">COMM</th>
             <th className="py-2 px-4 text-right border-l border-border font-semibold">1Y</th>
             <th className="py-2 px-4 text-right font-semibold">5Y</th>
             <th className="py-2 px-4 text-right font-semibold">10Y</th>
             <th className="py-2 px-4 text-right font-semibold">30Y▾</th>
           </tr>
         </thead>
         <tbody className="divide-y divide-slate-100 text-sm">
           {lazyPortfolios.map((item, idx) => {
             return (
               <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                 <td className="py-3.5 px-4 min-w-[260px] md:min-w-[340px]">
                   <div className="flex flex-col">
                     <div className="font-bold text-text text-sm transition-colors leading-tight">{item.name}</div>
                     <div className="text-xs text-text/60 font-medium leading-tight mt-1">{item.author}</div>
                   </div>
                 </td>
                 <td className="py-3.5 px-3 text-center border-l border-slate-50">
                   <span className="inline-flex items-center justify-center min-w-[32px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs">{item.stocks}%</span>
                 </td>
                 <td className="py-3.5 px-3 text-center">
                   <span className="inline-flex items-center justify-center min-w-[32px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs">{item.bonds}%</span>
                 </td>
                 <td className="py-3.5 px-3 text-center">
                   <span className="inline-flex items-center justify-center min-w-[32px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-xs">{item.comm}%</span>
                 </td>
                 <td className="py-3.5 px-4 text-right border-l border-slate-50 font-bold text-text">{item.y1 != null ? item.y1.toFixed(2) : "-"}%</td>
                 <td className="py-3.5 px-4 text-right font-bold text-text">{item.y5 != null ? item.y5.toFixed(2) : "-"}%</td>
                 <td className="py-3.5 px-4 text-right font-bold text-text">{item.y10 != null ? item.y10.toFixed(2) : "-"}%</td>
                 <td className="py-3.5 px-4 text-right font-bold text-emerald-600 bg-emerald-50/10">{item.y30 != null ? item.y30.toFixed(2) : "-"}%</td>
               </tr>
             )
           })}
         </tbody>
       </table>
     </div>
     
     <div className="p-4 bg-surface-2 border-t border-border">
       <p className="text-sm font-medium text-text leading-relaxed">
         The metrics refer to investments in USD and are calculated on the hypothesis of:<br/>
         • a yearly rebalancing of the portfolios (at the beginning of the year)<br/>
         • the reinvestment of dividends
       </p>
     </div>
   </div>
 </div>


 </motion.div>
 )}
 </div>
 )}
 </div>
 )}

 {/* Fullscreen TradingView Modal */}
 {selectedTradingViewSymbol && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-3/95 backdrop-blur-md p-4 md:p-8 animate-fade-in shadow-[0_4px_60px_rgba(0,0,0,0.1)]">
 <div className="w-full h-full relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-border">
 <button 
 onClick={() => setSelectedTradingViewSymbol(null)}
 className="absolute top-4 right-4 z-[110] bg-black/5 hover:bg-red-500 hover:text-white text-text p-2 rounded-2xl transition-colors border border-border/80 shadow-sm"
 >
 <X size={24} />
 </button>
 <div className="w-full h-full pt-16 pb-4 px-4">
 <AdvancedTradingViewChart 
 symbol={selectedTradingViewSymbol.toLowerCase().includes('usdt') ? selectedTradingViewSymbol.replace(/usdt/i, 'USD').toUpperCase() : selectedTradingViewSymbol.toUpperCase()} 
 theme="dark"
 />
 </div>
 </div>
 </div>
 )}

 {/* Live Marquee Ticker */}
 <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] flex items-stretch overflow-hidden z-[100] border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] h-12">
 <div className="flex items-center px-4 bg-[#0a0a0a] border-r border-slate-800 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.2)] shrink-0 gap-2">
 <button 
 onClick={() => setMarqueeMode('stocks')}
 className={cn("text-xs font-bold uppercase tracking-normal md:tracking-wider px-3 py-1.5 rounded-md transition-all flex items-center gap-1 md:gap-1.5", marqueeMode === 'stocks' ? "bg-slate-800 text-yellow-500 border border-slate-700" : "text-slate-400 hover:text-white hover:bg-slate-800")}
 >
 <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", marqueeMode === 'stocks' ? "bg-yellow-500" : "bg-slate-600")} /> Global
 </button>
 <button 
 onClick={() => setMarqueeMode('crypto')}
 className={cn("text-xs font-bold uppercase tracking-normal md:tracking-wider px-3 py-1.5 rounded-md transition-all flex items-center gap-1 md:gap-1.5", marqueeMode === 'crypto' ? "bg-slate-800 text-emerald-500 border border-slate-700" : "text-slate-400 hover:text-white hover:bg-slate-800")}
 >
 <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", marqueeMode === 'crypto' ? "bg-emerald-500" : "bg-slate-600")} /> Crypto
 </button>
 </div>
 <div className="flex flex-1 overflow-hidden relative">
 <div className="flex w-max animate-marquee" style={{ animationDuration: marqueeMode === 'crypto' ? '60s' : '120s' }}>
  {marqueeMode === 'stocks' ? (
  [...visibleMarqueeSymbols, ...visibleMarqueeSymbols].map((sym, idx) => {
  const liveData = tickerPrices[sym] || tickerPrices[sym.toUpperCase()] || tickerPrices[sym.toLowerCase()];
  const data = (liveData && typeof liveData.price === "number") ? liveData : persistentPrices.current[sym];
  return (
    <MarqueeItem 
      key={`stock-${sym}-${idx}`}
      symbol={sym} 
      data={data} 
      onClick={() => fetchStockData(sym)} 
    />
  );
  })
  ) : (
  [...cryptos.slice(0, 30), ...cryptos.slice(0, 30)].map((c, idx) => {
  return (
    <MarqueeItem 
      key={`crypto-${c.id}-${idx}`}
      symbol={c.symbol} 
      data={c} 
      onClick={() => setSelectedTradingViewSymbol(c.symbol)} 
      isCrypto 
    />
  );
  })
  )}
 </div>
 </div>
 </div>

 </div>
  </MobileZoomWrapper>
 );
}