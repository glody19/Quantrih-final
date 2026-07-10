import React, { useState } from "react";
import { ChevronDown, Moon, Sun, User, LogOut, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/LanguageContext";
import { QuantrihLogo } from "../ui/Logo";
import { MarketClock } from "../ui/MarketClock";

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
    {
      id: "tactical-group",
      label: "Tactical Allocation",
      children: [
        { id: "tactical-allocation", label: "Overview" },
        { id: "moving-average", label: "Moving Average" },
        { id: "dual-momentum", label: "Dual Momentum" },
        { id: "relative-strength", label: "Relative Strength" },
      ],
    },
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
      <div className="h-16 flex items-center justify-between px-4 md:px-8 max-w-full mx-auto">
        <div className="flex items-center gap-6 h-full">
          <div
            onClick={() => onPageChange("home")}
            className="cursor-pointer flex items-center transition-all hover:opacity-80 px-2 h-8"
          >
            <QuantrihLogo variant="sigma" size="sm" className="text-sky-400 opacity-90 hover:opacity-100 transition-opacity" />
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
                          if (menu.id === "tactical-group") onPageChange("tactical-allocation");
                          else if (menu.id === "fmp-group") onPageChange("market");
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-2xl text-[11px] font-bold tracking-[0.05em] uppercase transition-all flex items-center gap-1 relative overflow-visible",
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
                        "px-3 py-1.5 rounded-2xl text-[11px] font-bold tracking-[0.05em] uppercase transition-all relative overflow-visible",
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
          
          {user ? (
            <div className="relative group z-50">
              <button className="pl-1.5 pr-2 py-1.5 h-9 flex items-center gap-2 hover:border-blue-500/50 bg-surface hover:bg-surface-2 transition-all rounded-2xl group-hover:shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <div className="w-6 h-6 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0) || user.email?.charAt(0) || "?"
                  )}
                </div>
                <span className="text-[11px] font-bold text-text max-w-[80px] truncate hidden sm:block">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <ChevronDown size={14} className="text-text-3 group-hover:text-blue-500 transition-colors" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="w-[200px] bg-white border border-slate-200 shadow-xl rounded-[1.5rem] p-1.5 flex flex-col gap-0.5">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Connected</p>
                  </div>
                  <button onClick={() => onPageChange("profile")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <User size={12} /> Gestion du compte
                  </button>
                  <button onClick={() => onPageChange("donate")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <Heart size={12} className="text-red-500" /> Donation
                  </button>
                  <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <LogOut size={12} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onPageChange("auth")}
              className="px-5 py-2 text-[9px] font-bold uppercase tracking-wider transition-all bg-blue-600 hover:bg-blue-500 text-white rounded-2xl whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="xl:hidden p-2 rounded-xl text-text hover:bg-surface-2 transition-colors ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="xl:hidden absolute top-16 left-0 w-full bg-bg border-b border-border p-4 shadow-xl z-50 flex flex-col gap-2 max-h-[calc(100vh-64px)] overflow-y-auto scroll-smooth rounded-b-3xl"
          >
            <div className="mb-4 pb-4 border-b border-border flex justify-center">
              <MarketClock />
            </div>
            {menus.map((menu) => {
              const hasChildren = !!menu.children;
              const isExpanded = !!expandedMenus[menu.id];
              const isChildActive = hasChildren && menu.children?.some(c => c.id === currentPage);
              
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
                  {hasChildren && isExpanded && (
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
