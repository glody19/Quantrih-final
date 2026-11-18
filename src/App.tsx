import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { Footer } from "./components/layout/Footer";
import { CookieConsent } from "./components/layout/CookieConsent";

import { Home } from "./components/pages/Home";
// Every page except Home is loaded on demand, so the home page only downloads its own code.
const AssetAllocations = lazy(() => import("./components/pages/AssetAllocations").then((m) => ({ default: m.AssetAllocations })));
const MonteCarlo = lazy(() => import("./components/pages/MonteCarlo").then((m) => ({ default: m.MonteCarlo })));
const Portfolio = lazy(() => import("./components/pages/Portfolio").then((m) => ({ default: m.Portfolio })));
const PortfolioOptimization = lazy(() => import("./components/pages/PortfolioOptimization").then((m) => ({ default: m.PortfolioOptimization })));
const TacticalAllocation = lazy(() => import("./components/pages/TacticalAllocation").then((m) => ({ default: m.TacticalAllocation })));
const MovingAverage = lazy(() => import("./components/pages/MovingAverage").then((m) => ({ default: m.MovingAverage })));
const DualMomentum = lazy(() => import("./components/pages/DualMomentum").then((m) => ({ default: m.DualMomentum })));
const RelativeStrength = lazy(() => import("./components/pages/RelativeStrength").then((m) => ({ default: m.RelativeStrength })));
const Education = lazy(() => import("./components/pages/Education").then((m) => ({ default: m.Education })));
const Market = lazy(() => import("./components/pages/Market").then((m) => ({ default: m.Market })));
const SiteMap = lazy(() => import("./components/pages/SiteMap").then((m) => ({ default: m.SiteMap })));
const Platforms = lazy(() => import("./components/pages/Platforms").then((m) => ({ default: m.Platforms })));
const VirtualPortfolio = lazy(() => import("./components/pages/VirtualPortfolio").then((m) => ({ default: m.VirtualPortfolio })));
const CryptoMarkets = lazy(() => import("./components/pages/CryptoMarkets").then((m) => ({ default: m.CryptoMarkets })));
const MarketStructure = lazy(() => import("./components/pages/MarketStructure").then((m) => ({ default: m.MarketStructure })));
const EtfScreener = lazy(() => import("./components/pages/EtfScreener").then((m) => ({ default: m.EtfScreener })));
const Auth = lazy(() => import("./components/pages/Auth").then((m) => ({ default: m.Auth })));
const Profile = lazy(() => import("./components/pages/Profile").then((m) => ({ default: m.Profile })));
const InvestorProfilePage = lazy(() => import("./components/pages/InvestorProfilePage").then((m) => ({ default: m.InvestorProfilePage })));
const About = lazy(() => import("./components/pages/About").then((m) => ({ default: m.About })));
const Legal = lazy(() => import("./components/pages/Legal").then((m) => ({ default: m.Legal })));
import { cn } from "./lib/utils";
import { MotionConfig } from "motion/react";
import { loadPrefs, type Preferences } from "./lib/preferences";
import { useTranslation } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ASSET_DATA } from "./constants";
import { Activity } from "lucide-react";
import { QuantrihLogo } from "./components/ui/Logo";
import { findSeoRoute, SITE_URL } from "./seo/routes";

// Analysis tools get a plain white background and larger text (see .tool-page in index.css).
const TOOL_PAGES = new Set([
  "asset-allocation", "portfolio", "portfolio-backtest", "tactical-allocation", "montecarlo", "portfolio-optimization",
  "moving-average", "dual-momentum", "relative-strength", "market", "etf-overview",
]);

export default function App() {
  useEffect(() => {
    // Attempt to load live asset config from server, but don't block render
    const loadAssets = async () => {
      try {
        const res = await fetch("/api/config/assets");
        // 202 means the server has not built the asset data yet: keep the bundled defaults.
        if (res.status === 200) {
          const data = await res.json();
          if (data && typeof data === "object" && !data.waitingForBuild && Object.keys(data).length > 0) {
            Object.keys(ASSET_DATA).forEach((k) => delete ASSET_DATA[k]);
            Object.assign(ASSET_DATA, data);
          }
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
  const [baseCcy, setBaseCcy] = useState<string>(() => loadPrefs().baseCcy);
  const [motionPref, setMotionPref] = useState(() => loadPrefs().motion);
  // Settings page changes apply at once
  useEffect(() => {
    const on = (e: Event) => { const p = (e as CustomEvent<Preferences>).detail; setBaseCcy(p.baseCcy); setMotionPref(p.motion); };
    window.addEventListener("quantrih-prefs", on);
    return () => window.removeEventListener("quantrih-prefs", on);
  }, []);
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
    // English metadata for English visitors, French for every other language (main markets: Belgium, France).
    const route = findSeoRoute(location.pathname);
    const meta = language === "fr" ? route.fr : route.en;
    const canonical = SITE_URL + (route.path === "/" ? "/" : route.path);

    document.title = meta.title;
    document.documentElement.lang = language;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);
    setMeta('link[rel="canonical"]', "href", canonical);

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", route.indexable ? "index, follow" : "noindex, follow");
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
    // "system" follows the device's reduce-motion setting; the settings page can force it on or off
    <MotionConfig reducedMotion={motionPref === "reduced" ? "always" : motionPref === "full" ? "never" : "user"}>
    <div className="relative min-h-screen flex flex-col font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {currentPage !== "auth" && <Header
        currentPage={currentPage}
        onPageChange={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
        baseCcy={baseCcy}
        setBaseCcy={setBaseCcy}
      />}
      <main className={cn(
        "flex-1 w-full mx-auto flex flex-col",
        currentPage === "auth" || currentPage === "home" ? "pt-0" : "pt-4 lg:pt-6",
        TOOL_PAGES.has(currentPage) && "tool-page",
        currentPage === "market" && "market-page",
        currentPage === "auth" && "no-zoom"
      )}>
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><span className="w-8 h-8 rounded-full border-2 border-pv-blue/20 border-t-pv-blue animate-spin" /></div>}>
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
          <Route path="/portfolio-optimization" element={<PortfolioOptimization baseCcy={baseCcy} />} />
          <Route path="/tactical-allocation" element={<TacticalAllocation />} />
          <Route path="/moving-average" element={<MovingAverage />} />
          <Route path="/dual-momentum" element={<DualMomentum />} />
          <Route path="/relative-strength" element={<RelativeStrength />} />
          <Route path="/platforms" element={<Platforms onNavigate={handleNavigate} />} />
          <Route path="/market" element={<Market />} />
          <Route path="/etf-overview" element={<EtfScreener />} />
          <Route path="/market-structure" element={<MarketStructure />} />
          <Route path="/crypto" element={<CryptoMarkets />} />
          <Route path="/lazy-portfolios" element={<Navigate to="/market#lazy-portfolios" replace />} />
          <Route path="/virtual-portfolio" element={<VirtualPortfolio />} />
          <Route path="/education" element={<Education />} />
          <Route path="/donate" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/cookies" element={<Legal page="cookies" />} />
          <Route path="/sitemap" element={<SiteMap onNavigate={handleNavigate} />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="*" element={<Home onGoPage={handleNavigate} />} />
        </Routes>
        </Suspense>
      </main>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={(page) => {
          handleNavigate(page);
          setIsCommandOpen(false);
        }}
      />
      {currentPage !== "market" && currentPage !== "auth" && <Footer onNavigate={handleNavigate} />}
      
      
      <CookieConsent />
    </div>
    </MotionConfig>
  );
}
