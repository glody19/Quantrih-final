import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { Footer } from "./components/layout/Footer";
import { MarketClock } from "./components/ui/MarketClock";
import { CookieConsent } from "./components/layout/CookieConsent";
import { DemoDataBadge } from "./components/ui/DemoDataBadge";

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
import { findSeoRoute, SITE_URL } from "./seo/routes";

// Analysis tools get a plain white background and larger text (see .tool-page in index.css).
const TOOL_PAGES = new Set([
  "asset-allocation", "portfolio", "portfolio-backtest", "tactical-allocation", "montecarlo",
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
        (currentPage === "home" || currentPage === "investor-profile" || currentPage === "profile" || currentPage === "auth") ? "pt-0" : "pt-4 lg:pt-6",
        TOOL_PAGES.has(currentPage) && "tool-page"
      )}>
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
      {currentPage !== "market" && currentPage !== "auth" && <Footer onNavigate={handleNavigate} />}
      
      
      <CookieConsent />
      <DemoDataBadge />
    </div>
  );
}
