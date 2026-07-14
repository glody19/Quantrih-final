import React, { useState } from "react";
import { ChevronDown, Moon, Sun, User, LogOut, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/LanguageContext";
import { QuantrihLogo } from "../ui/Logo";
import { MarketClock } from "../ui/MarketClock";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface HeaderProps {
  currentPage: string;
  onPageChange: (p: string) => void;
  theme: string;
  toggleTheme: () => void;
  baseCcy: string;
  setBaseCcy: (c: string) => void;
}

export function Header({
  currentPage,
  onPageChange,
  theme,
  toggleTheme,
  baseCcy,
  setBaseCcy,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [firestorePhoto, setFirestorePhoto] = useState<string | null>(null);
  const [firestoreName, setFirestoreName] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      setFirestorePhoto(null);
      setFirestoreName(null);
      return;
    }
    const fetchUserData = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.photoURL) setFirestorePhoto(data.photoURL);
          if (data.displayName) setFirestoreName(data.displayName);
        }
      } catch (err) {
        console.error("Error fetching header user data from firestore:", err);
      }
    };
    fetchUserData();
  }, [user]);

  const toggleMobileMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  interface MenuItem {
    id: string;
    label: string;
    children?: { id: string; label: string }[];
  }

  const menus: MenuItem[] = [
    { id: "asset-allocation", label: "Asset Allocations" },
    { id: "portfolio-backtest", label: "Portfolio Backtesting" },
    { id: "tactical-allocation", label: "Tactical Allocation" },
    { id: "montecarlo", label: "Monte Carlo" },
    {
      id: "fmp-group",
      label: "Markets",
      children: [
        { id: "market", label: "Market Equity" },
        { id: "etf-overview", label: "ETF Overview" },
      ],
    },
    { id: "education", label: "Education resources" },
    { id: "platforms", label: t("nav.platforms") },
  ];

  return (
    <header 
      data-theme={currentPage === "home" ? "dark" : undefined}
      className={cn(
        "z-[100] w-full transition-all duration-300",
        currentPage === "home"
          ? "absolute top-0 left-0 right-0 bg-transparent border-b border-white/5 backdrop-blur-md"
          : "sticky top-0 bg-bg border-b border-border"
      )}
    >
      {/* Main Header */}
      <div className="h-16 lg:h-20 flex items-center justify-between px-4 md:px-8 max-w-full mx-auto">
        <div className="flex items-center gap-6 h-full">
          <div
            onClick={() => onPageChange("home")}
            className="cursor-pointer flex items-center transition-all hover:opacity-80 px-2 h-10 lg:h-12"
          >
            <QuantrihLogo variant="sigma" size="lg" className="text-sky-400 opacity-90 hover:opacity-100 transition-transform duration-300 lg:scale-125 lg:origin-left" />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 h-full">
            {menus.map((menu) => {
              const hasChildren = !!menu.children;
              const isGroupActive = hasChildren && menu.children?.some((c) => c.id === currentPage);
              const isDirectActive = !hasChildren && currentPage === menu.id;
              const isActive = isGroupActive || isDirectActive;

              return (
                <div key={menu.id} className="relative group h-full flex items-center">
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => {
                          if (menu.id === "fmp-group") onPageChange("market");
                        }}
                        className={cn(
                          "px-3 py-1.5 lg:px-4 lg:py-2 rounded-2xl text-[11px] lg:text-[13px] font-bold tracking-[0.05em] uppercase transition-all flex items-center gap-1 relative overflow-visible",
                          isActive 
                            ? "text-white bg-blue-600 shadow-md shadow-blue-500/20 scale-105" 
                            : "text-text-2 hover:bg-surface-2 hover:text-text"
                        )}
                      >
                        <span className="relative z-10">{menu.label}</span>
                        <ChevronDown size={14} className="opacity-50 relative z-10" />
                        {isActive && (
                          <motion.div
                            layoutId="activeHeaderHighlight"
                            className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                      </button>
                      <div className="absolute top-[calc(100%-10px)] left-0 min-w-[240px] pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-[2rem] p-2 flex flex-col gap-1 shadow-xl">
                          {menu.children?.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onPageChange(child.id)}
                              className={`w-full text-left px-4 py-2.5 rounded-[1.5rem] text-[12px] font-semibold transition-all ${
                                currentPage === child.id ? "bg-blue-600 text-white font-bold" : "text-text hover:bg-surface-2"
                              }`}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => onPageChange(menu.id)}
                      className={cn(
                        "px-3 py-1.5 lg:px-4 lg:py-2 rounded-2xl text-[11px] lg:text-[13px] font-bold tracking-[0.05em] uppercase transition-all relative overflow-visible",
                        isActive 
                          ? "text-white bg-blue-600 shadow-md shadow-blue-500/20 scale-105" 
                          : "text-text-2 hover:bg-surface-2 hover:text-text"
                      )}
                    >
                      <span className="relative z-10">{menu.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeHeaderHighlight"
                          className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 h-full ml-auto">
          {/* Market Clock - hidden on small screens */}
          <div className="hidden lg:flex items-center px-4">
            <MarketClock />
          </div>

          <div className="h-4 w-[1px] bg-border/50 mx-1 hidden lg:block" />
          
          {/* High-visibility Donate button in the sticky top header */}
          <button
            onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 lg:px-4 lg:py-2 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 rounded-xl transition-all duration-300 text-[10px] lg:text-xs font-bold uppercase tracking-wider h-10 lg:h-12 shadow-sm"
          >
            <Heart size={14} className="fill-blue-500 text-blue-500 animate-[pulse_2s_ease-in-out_infinite]" />
            <span>Donate</span>
          </button>

          <div className="h-4 w-[1px] bg-border/50 mx-1 hidden sm:block" />
          
          {/* User Profile / Sign In Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "pl-1.5 pr-2.5 py-1.5 h-10 lg:h-12 flex items-center gap-2 border border-transparent bg-surface hover:bg-surface-2 transition-all rounded-2xl shadow-sm",
                userMenuOpen && "border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
              )}
            >
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] lg:text-[13px] uppercase shadow-inner overflow-hidden">
                {user ? (
                  firestorePhoto ? (
                    <img src={firestorePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (firestoreName || user.displayName || user.email)?.charAt(0) || "?"
                  )
                ) : (
                  <User size={14} className="lg:w-[18px] lg:h-[18px]" />
                )}
              </div>
              <span className="text-[11px] lg:text-[13px] font-bold text-text max-w-[80px] lg:max-w-[120px] truncate hidden sm:block">
                {user ? (firestoreName || user.displayName || user.email?.split("@")[0]) : "Sign In"}
              </span>
              <ChevronDown size={14} className={cn("text-text-3 transition-transform duration-200", userMenuOpen && "rotate-180 text-blue-500")} />
            </button>

            {/* Backdrop click listener to close dropdown */}
            {userMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => setUserMenuOpen(false)}
              />
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-slate-200 shadow-xl rounded-2xl p-2 flex flex-col gap-1 z-50"
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[11px] font-bold text-slate-900 truncate">
                          {firestoreName || user.displayName || user.email}
                        </p>
                        <p className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-wider mt-0.5">
                          Connected
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onPageChange("profile");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <User size={12} className="text-slate-500" />
                        Account Settings
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-slate-900 hover:bg-rose-50 hover:text-red-600 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut size={12} className="text-rose-500" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[11px] font-bold text-slate-900">
                          Welcome
                        </p>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                          Guest
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onPageChange("auth");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-slate-900 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut size={12} className="text-blue-500 rotate-180" />
                        Login
                      </button>
                      <button
                        onClick={() => {
                          onPageChange("auth");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <User size={12} className="text-slate-500" />
                        Account Settings
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="xl:hidden p-3.5 sm:p-2 rounded-xl text-text hover:bg-surface-2 transition-colors ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} className="sm:w-[20px] sm:h-[20px]" /> : <Menu size={28} className="sm:w-[20px] sm:h-[20px]" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden absolute top-10 left-0 w-full bg-bg border-b border-border p-4 shadow-xl z-50 flex flex-col gap-2 max-h-[60vh] overflow-y-auto scroll-smooth rounded-b-3xl"
          >
            <div className="mb-4 pb-4 border-b border-border flex justify-center">
              <MarketClock />
            </div>
            {menus.map((menu) => {
              const hasChildren = "children" in menu && !!menu.children;
              const isExpanded = !!expandedMenus[menu.id];
              const isChildActive = hasChildren && "children" in menu && menu.children?.some(c => c.id === currentPage);
              
              return (
                <div key={menu.id} className="flex flex-col gap-1 border-b border-border/10 pb-2 mb-1">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleMobileMenu(menu.id);
                      } else {
                        onPageChange(menu.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-[0.05em] uppercase transition-all flex items-center justify-between",
                      currentPage === menu.id || isChildActive
                        ? "bg-surface-2 text-text"
                        : "text-text-2 hover:bg-surface-2 hover:text-text"
                    )}
                  >
                    <span>{menu.label}</span>
                    {hasChildren && (
                      <ChevronDown 
                        size={16} 
                        className={cn("transition-transform duration-200", isExpanded ? "rotate-180 text-blue-500" : "text-text-3")} 
                      />
                    )}
                  </button>
                  {hasChildren && "children" in menu && isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 flex flex-col gap-1 mt-1 bg-surface-2/40 rounded-xl p-2 transition-all duration-300"
                    >
                      {menu.children?.map(child => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onPageChange(child.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all",
                            currentPage === child.id ? "bg-text text-bg" : "text-text hover:bg-surface-2"
                          )}
                        >
                          {child.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
