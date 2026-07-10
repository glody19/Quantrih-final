import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { Footer } from "./components/layout/Footer";
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
import { FinancialModeling } from "./components/pages/FinancialModeling";
import { Platforms } from "./components/pages/Platforms";
import { EtfScreener } from "./components/pages/EtfScreener";
import { Auth } from "./components/pages/Auth";
import { Profile } from "./components/pages/Profile";
import { CryptoMarket } from "./components/pages/CryptoMarket";
import { Donate } from "./components/pages/Donate";
import { About } from "./components/pages/About";
import { Legal } from "./components/pages/Legal";
import { cn } from "./lib/utils";
import { useTranslation } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ASSET_DATA } from "./constants";
import { Activity } from "lucide-react";

export default function App() {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Retry fetch if server is still building caching data on first startup
    const loadAssets = async (retries = 5) => {
      try {
        const res = await fetch("/api/config/assets");
        if (res.status === 202) {
          // System is building the asset cache
          setTimeout(() => loadAssets(retries), 2000);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          // Mutate the global ASSET_DATA object in-place so all synchronous imports have it
          Object.keys(ASSET_DATA).forEach((k) => delete ASSET_DATA[k]);
          Object.assign(ASSET_DATA, data);
        } else if (res.status >= 500 && retries > 0) {
          console.warn(`Server returned ${res.status}, retrying...`);
          setTimeout(() => loadAssets(retries - 1), 2000);
          return;
        }
      } catch (e) {
        console.warn("Failed to load backend asset config", e);
        if (retries > 0) {
          console.warn(`Fetch failed, retrying... (${retries} retries left)`);
          setTimeout(() => loadAssets(retries - 1), 2000);
          return;
        }
      }
      setConfigLoaded(true);
    };
    loadAssets();
  }, []);

  if (!configLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text font-sans">
        <div className="flex flex-col items-center gap-4 text-pv-blue animate-pulse">
          <Activity className="w-8 h-8" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-4">
            Loading Backend Assets...
          </div>
        </div>
      </div>
    );
  }

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

  const toggleTheme = () => {};

  const handleNavigate = (page: string) => {
    if (page === "home" || page === "") {
      navigate("/");
    } else {
      navigate(`/${page}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Header
        currentPage={currentPage}
        onPageChange={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
        baseCcy={baseCcy}
        setBaseCcy={setBaseCcy}
      />
      <main className="flex-1 w-full mx-auto flex flex-col pt-24">
        <Routes>
          <Route path="/" element={<Home onGoPage={handleNavigate} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Auth onBack={() => handleNavigate("home")} />} />
          <Route path="/profile" element={<Profile onBack={() => handleNavigate("home")} />} />
          <Route path="/asset-allocation" element={<AssetAllocations baseCcy={baseCcy} onNavigate={handleNavigate} />} />
          <Route path="/portfolio" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="portfolio" />} />
          <Route path="/backtest" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="backtest" />} />
          <Route path="/portfolio-backtest" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="portfolio-backtest" />} />
          <Route path="/frontier" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="frontier" />} />
          <Route path="/optimization" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="optimization" />} />
          <Route path="/mean-variance" element={<Portfolio baseCcy={baseCcy} setBaseCcy={setBaseCcy} onNavigate={handleNavigate} initialTab="mean-variance" />} />
          <Route path="/montecarlo" element={<MonteCarlo baseCcy={baseCcy} />} />
          <Route path="/tactical-allocation" element={<TacticalAllocation />} />
          <Route path="/moving-average" element={<MovingAverage />} />
          <Route path="/dual-momentum" element={<DualMomentum />} />
          <Route path="/relative-strength" element={<RelativeStrength />} />
          <Route path="/platforms" element={<Platforms onNavigate={handleNavigate} />} />
          <Route path="/fmp" element={<FinancialModeling />} />
          <Route path="/education" element={<Education />} />
          <Route path="/donate" element={<Donate onNavigate={handleNavigate} />} />
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
      {currentPage !== "fmp" && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 p-3 bg-sky-500/10 text-sky-500 backdrop-blur-md border border-sky-500/20 rounded-full shadow-xl hover:bg-sky-500/20 transition-all z-50 hover:-translate-y-1 group"
          title="Scroll to parameters"
        >
          <svg
            className="w-5 h-5 group-hover:block hidden"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <svg
            className="w-5 h-5 group-hover:hidden block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
      {currentPage !== "fmp" && <Footer onNavigate={handleNavigate} />}
      <CookieConsent />
    </div>
  );
}
