import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { Footer } from "./components/layout/Footer";
import { MarketClock } from "./components/ui/MarketClock";
import { CookieConsent } from "./components/layout/CookieConsent";

import { Home } from "./components/pages/Home";
import { AssetAllocations } from "./components/pages/AssetAllocations";
import { MonteCarlo } from "./components/pages/MonteCarlo";
import { Portfolio } from "./components/pages/Portfolio";
import { TacticalAllocation } from "./components/pages/TacticalAllocation";
import { MovingAverage } from "./components/pages/MovingAverage";
import { DualMomentum } from "./components/pages/DualMomentum";
import { RelativeStrength } from "./components/pages/RelativeStrength";
import { Education } from "./components/pages/Education";
import { FinancialModeling as MarketEquity } from "./components/pages/FinancialModeling";
import { Platforms } from "./components/pages/Platforms";
import { EtfScreener } from "./components/pages/EtfScreener";
import { Auth } from "./components/pages/Auth";
import { Profile } from "./components/pages/Profile";
import { InvestorProfilePage } from "./components/pages/InvestorProfilePage";
import { About } from "./components/pages/About";
import { Legal } from "./components/pages/Legal";
import { cn } from "./lib/utils";
import { useTranslation } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ASSET_DATA } from "./constants";
import { Activity } from "lucide-react";
import { QuantrihLogo } from "./components/ui/Logo";

export default function App() {
  useEffect(() => {
    // Attempt to load live asset config from server, but don't block render
    const loadAssets = async () => {
      try {
        const res = await fetch("/api/config/assets");
        if (res.ok) {
          const data = await res.json();
          Object.keys(ASSET_DATA).forEach((k) => delete ASSET_DATA[k]);
          Object.assign(ASSET_DATA, data);
        }
      } catch (e) {
        console.warn("Failed to load backend asset config", e);
      }
    };
    loadAssets();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { language, t } = useTranslation();
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname === "/" ? "home" : location.pathname.substring(1);

  const [theme, setTheme] = useState("light");
  const [baseCcy, setBaseCcy] = useState("EUR");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    const isEn = language === "en";
    let title = "Quantrih | Portfolio Backtesting & Investment Strategies";
    let desc = "Quantrih provides advanced portfolio backtesting tools. Test your investment strategies against historical market data before committing capital.";

    switch (location.pathname) {
      case "/":
      case "/home":
        title = isEn 
          ? "Quantrih | Portfolio Backtesting & Investment Strategies" 
          : "Quantrih | Backtest de Portefeuille & Stratégies d'Investissement";
        desc = isEn
          ? "Quantrih provides advanced portfolio backtesting tools. Test your investment strategies against historical market data."
          : "Quantrih propose des outils avancés de backtesting de portefeuille. Testez vos stratégies d'investissement.";
        break;
      case "/auth":
        title = isEn ? "Sign In | Quantrih" : "Connexion | Quantrih";
        desc = isEn ? "Sign in to access your saved investment portfolios and strategy audits on Quantrih." : "Connectez-vous pour accéder à vos portefeuilles et analyses de stratégies.";
        break;
      case "/profile":
        title = isEn ? "My Account | Quantrih" : "Mon Compte | Quantrih";
        desc = isEn ? "Manage your Quantrih account settings, preferences, and security." : "Gérez vos paramètres de compte, préférences et sécurité Quantrih.";
        break;
      case "/investor-profile":
        title = isEn ? "Investor Profile & Suitability | Quantrih" : "Profil Investisseur & Qualification | Quantrih";
        desc = isEn 
          ? "Establish your investor suitability profile, broker strategy qualification, risk tolerance and career suitability." 
          : "Établissez votre profil d'investisseur, qualification stratégique courtier, tolérance au risque et situation financière.";
        break;
      case "/asset-allocation":
        title = isEn ? "Asset Allocation Tool | Quantrih" : "Allocation d'Actifs | Quantrih";
        desc = isEn
          ? "Construct, weigh, and analyze the distribution of your assets. Visualize geographic and asset class exposure."
          : "Construisez, pondérez et analysez la répartition de vos actifs. Visualisez vos expositions géographiques et sectorielles.";
        break;
      case "/portfolio":
      case "/portfolio-backtest":
        title = isEn ? "Portfolio Backtesting Engine | Quantrih" : "Backtest de Portefeuille | Quantrih";
        desc = isEn
          ? "Test historical portfolio allocations against major financial crises. Analyze risk, CAGR, and drawdowns."
          : "Testez les allocations historiques de portefeuilles face aux crises financières majeures. Analysez le CAGR et le Max Drawdown.";
        break;
      case "/montecarlo":
        title = isEn ? "Monte Carlo Future Forecasts | Quantrih" : "Simulation de Monte Carlo | Quantrih";
        desc = isEn
          ? "Model future wealth with 10,000 stochastic paths. Evaluate probability of success for your financial goals."
          : "Modélisez l'évolution future de votre capital via 10 000 chemins stochastiques. Évaluez la probabilité de succès.";
        break;
      case "/tactical-allocation":
        title = isEn ? "Tactical Allocation & Trend Following | Quantrih" : "Allocation Tactique | Quantrih";
        desc = isEn
          ? "Run trend-following strategies using Simple Moving Average, Dual Momentum, and Relative Strength rules."
          : "Exécutez des stratégies de suivi de tendance basées sur les moyennes mobiles, le Dual Momentum et la Force Relative.";
        break;
      case "/platforms":
        title = isEn ? "Broker Platforms & Partnerships | Quantrih" : "Plateformes d'Investissement | Quantrih";
        desc = isEn
          ? "Discover top-tier regulated brokers, investment platforms, and exclusive premium course offerings."
          : "Découvrez des courtiers régulés de premier plan, des plateformes d'investissement et des offres exclusives.";
        break;
      case "/market":
        title = isEn ? "Market Equity Terminal | Quantrih" : "Terminal Action & Marché | Quantrih";
        desc = isEn
          ? "Explore live and historical financial charts, key financial ratios, valuation multiples, and stock market analysis."
          : "Explorez les graphiques financiers en direct et historiques, les ratios financiers, les multiples et analyses.";
        break;
      case "/etf-overview":
        title = isEn ? "ETF Screener & Directory | Quantrih" : "Screener & Aperçu ETF | Quantrih";
        desc = isEn
          ? "Screener for UCITS ETFs. Analyze TER, replication method, fund size, and detailed components."
          : "Screener complet d'ETF UCITS. Analysez les frais (TER), le mode de réplication, l'encours et les composants.";
        break;
      case "/education":
        title = isEn ? "Financial Education Lexicon | Quantrih" : "Lexique & Éducation Financière | Quantrih";
        desc = isEn
          ? "Learn quantitative terms, Sharpe ratio, Sortino, drawdowns, beta, alpha, and factor investing definitions."
          : "Apprenez les termes quantitatifs, ratio de Sharpe, de Sortino, drawdowns, bêta, alpha et investissement factoriel.";
        break;
      case "/about":
        title = isEn ? "About Quantrih | Quantrih" : "À Propos de Quantrih | Quantrih";
        desc = isEn ? "Learn about Quantrih's mission, professional-grade portfolio models, and pricing neutralization." : "Découvrez la mission de Quantrih, nos modèles professionnels et notre neutralisation des barrières d'entrée.";
        break;
      case "/cookies":
        title = isEn ? "Cookies Policy | Quantrih" : "Politique de Cookies | Quantrih";
        break;
      case "/privacy":
        title = isEn ? "Privacy Policy | Quantrih" : "Politique de Confidentialité | Quantrih";
        break;
      default:
        break;
    }

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", desc);
  }, [location.pathname, language]);

  

  const toggleTheme = () => {};

  const handleNavigate = (page: string) => {
    if (page === "donate") {
      window.open("https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00", "_blank", "noopener,noreferrer");
      return;
    }
    if (page === "home" || page === "") {
      navigate("/");
    } else {
      navigate(`/${page}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Header
        currentPage={currentPage}
        onPageChange={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
        baseCcy={baseCcy}
        setBaseCcy={setBaseCcy}
      />
      <main className={cn("flex-1 w-full mx-auto flex flex-col", (currentPage === "home" || currentPage === "investor-profile" || currentPage === "profile") ? "pt-0" : "pt-24 lg:pt-28")}>
        <Routes>
          <Route path="/" element={<Home onGoPage={handleNavigate} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Auth onBack={() => handleNavigate("home")} />} />
          <Route path="/profile" element={<Profile onBack={() => handleNavigate("home")} />} />
          <Route path="/investor-profile" element={<InvestorProfilePage onBack={() => handleNavigate("home")} />} />
          <Route path="/asset-allocation" element={<AssetAllocations baseCcy={baseCcy} onNavigate={handleNavigate} />} />
          <Route path="/portfolio" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="portfolio" />} />
          <Route path="/portfolio-backtest" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="portfolio-backtest" />} />
          <Route path="/montecarlo" element={<MonteCarlo baseCcy={baseCcy} />} />
          <Route path="/tactical-allocation" element={<TacticalAllocation />} />
          <Route path="/moving-average" element={<MovingAverage />} />
          <Route path="/dual-momentum" element={<DualMomentum />} />
          <Route path="/relative-strength" element={<RelativeStrength />} />
          <Route path="/platforms" element={<Platforms onNavigate={handleNavigate} />} />
          <Route path="/market" element={<MarketEquity />} />
          <Route path="/etf-overview" element={<EtfScreener />} />
          <Route path="/education" element={<Education />} />
          <Route path="/donate" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/cookies" element={<Legal page="cookies" />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="*" element={<Home onGoPage={handleNavigate} />} />
        </Routes>
      </main>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={(page) => {
          handleNavigate(page);
          setIsCommandOpen(false);
        }}
      />
      {currentPage !== "market" && <Footer onNavigate={handleNavigate} />}
      
      
      <CookieConsent />
    </div>
  );
}
