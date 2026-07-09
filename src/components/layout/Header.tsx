import React, { useState, useEffect } from "react";
import { ChevronDown, Moon, Sun, User, LogOut, Heart, Menu, X } from "lucide-react";
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

  interface MenuItem {
    id: string;
    label: string;
    children?: { id: string; label: string }[];
  }

  const menus: MenuItem[] = [
    { id: "asset-allocation", label: "Asset Allocations" },
    { id: "portfolio", label: "Portfolio Backtesting" },
    { id: "tactical-allocation", label: "Tactical Allocation" },
    { id: "montecarlo", label: "Monte Carlo" },
    { id: "fmp", label: "Markets" },
    { id: "education", label: "Education resources" },
    { id: "platforms", label: t("nav.platforms") },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full bg-bg border-b border-border">
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
            {menus.map((menu) => (
              <div key={menu.id} className="relative group h-full flex items-center">
                {menu.children ? (
                  <>
                    <button
                      className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold tracking-[0.05em] uppercase transition-all flex items-center gap-1 ${
                        menu.children.some((c) => c.id === currentPage) ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface-2 hover:text-text"
                      }`}
                    >
                      {menu.label}
                      <ChevronDown size={14} className="opacity-50" />
                    </button>
                    <div className="absolute top-[calc(100%-10px)] left-0 min-w-[240px] pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                      <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-[2rem] p-2 flex flex-col gap-1">
                        {menu.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => onPageChange(child.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-[1.5rem] text-[12px] font-semibold transition-all ${
                              currentPage === child.id ? "bg-text text-bg" : "text-text hover:bg-surface-2"
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
                    className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold tracking-[0.05em] uppercase transition-all ${
                      currentPage === menu.id ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface-2 hover:text-text"
                    }`}
                  >
                    {menu.label}
                  </button>
                )}
              </div>
            ))}
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
                <div className="w-6 h-6 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                </div>
                <span className="text-[11px] font-bold text-text max-w-[80px] truncate hidden sm:block">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <ChevronDown size={14} className="text-text-3 group-hover:text-blue-500 transition-colors" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="w-[200px] bg-surface border border-border rounded-[1.5rem] p-1.5 flex flex-col gap-0.5">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-[11px] font-bold text-text truncate">{user.displayName || user.email}</p>
                    <p className="text-[9px] text-text-3 font-medium uppercase tracking-widest mt-0.5">Connected</p>
                  </div>
                  <button onClick={() => onPageChange("profile")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-text hover:bg-surface-2 rounded-2xl transition-colors flex items-center gap-2">
                    <User size={12} /> My Profile
                  </button>
                  <button onClick={() => onPageChange("donate")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-text hover:bg-surface-2 rounded-2xl transition-colors flex items-center gap-2">
                    <Heart size={12} className="text-red-500" /> Donate
                  </button>
                  <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-red hover:bg-red/10 rounded-2xl transition-colors flex items-center gap-2">
                    <LogOut size={12} /> {t("header.signout")}
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
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-16 left-0 w-full bg-bg border-b border-border p-4 shadow-xl z-50 flex flex-col gap-2 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="mb-4 pb-4 border-b border-border flex justify-center">
            <MarketClock />
          </div>
          {menus.map((menu) => (
            <div key={menu.id} className="flex flex-col gap-1">
              <button
                onClick={() => {
                  if (!menu.children) {
                    onPageChange(menu.id);
                    setMobileMenuOpen(false);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-[0.05em] uppercase transition-all ${
                  currentPage === menu.id ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface-2 hover:text-text"
                }`}
              >
                {menu.label}
              </button>
              {menu.children && (
                <div className="pl-4 flex flex-col gap-1 mt-1">
                  {menu.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => {
                        onPageChange(child.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        currentPage === child.id ? "bg-text text-bg" : "text-text hover:bg-surface-2"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
