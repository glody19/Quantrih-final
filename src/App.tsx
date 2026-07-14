import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { Footer } from "./components/layout/Footer";
import { CookieConsent } from "./components/layout/CookieConsent";
import { GoogleOneTapPrompt } from "./components/ui/GoogleOneTapPrompt";
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
import { About } from "./components/pages/About";
import { Legal } from "./components/pages/Legal";
import { cn } from "./lib/utils";
import { useTranslation } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ASSET_DATA } from "./constants";
import { Activity } from "lucide-react";
import { QuantrihLogo } from "./components/ui/Logo";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg font-sans overflow-hidden relative">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-[pulse_3s_ease-in-out_infinite] scale-[1.7] mb-12">
            <QuantrihLogo variant="sigma" size="lg" className="text-sky-400" />
          </div>
          
          {/* Innovative dotted loading */}
          <div className="relative flex justify-center items-center mt-6 h-8 w-32">
            <div className="absolute inset-0 flex justify-center items-center animate-[spin_3s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-sky-500/10 border-t-sky-400/60 border-b-blue-500/60" />
            </div>
            <div className="absolute inset-0 flex justify-center items-center animate-[spin_4s_linear_infinite_reverse]">
              <div className="w-[120%] h-[120%] rounded-full border border-indigo-500/10 border-r-indigo-400/40 border-l-sky-400/40" />
            </div>
            
            <div className="flex gap-2.5 items-center z-10">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-[ping_1.5s_infinite_-0.4s] opacity-80" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[ping_1.5s_infinite_-0.2s] opacity-80" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-[ping_1.5s_infinite] opacity-80" />
            </div>
            <div className="absolute flex gap-2.5 items-center z-20">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,1)] animate-[pulse_1.5s_infinite_-0.4s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] animate-[pulse_1.5s_infinite_-0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)] animate-[pulse_1.5s_infinite]" />
            </div>
          </div>
          
          <div className="mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-text-3 animate-pulse">
            Initialisation de l'espace
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

  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (target.classList && target.classList.contains('overflow-x-auto')) {
          if (target.scrollWidth > target.clientWidth) {
            target.scrollLeft += e.deltaY;
            e.preventDefault();
            return;
          }
        }
        target = target.parentElement;
      }
    };
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleGlobalWheel);
  }, []);

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
    <div className="min-h-screen flex flex-col font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Header
        currentPage={currentPage}
        onPageChange={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
        baseCcy={baseCcy}
        setBaseCcy={setBaseCcy}
      />
      <main className={cn("flex-1 w-full mx-auto flex flex-col", currentPage === "home" ? "pt-0" : "pt-16")}>
        <Routes>
          <Route path="/" element={<Home onGoPage={handleNavigate} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Auth onBack={() => handleNavigate("home")} />} />
          <Route path="/profile" element={<Profile onBack={() => handleNavigate("home")} />} />
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
      <GoogleOneTapPrompt />
      <CookieConsent />
    </div>
  );
}
