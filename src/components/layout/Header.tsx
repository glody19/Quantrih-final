import React, { useState } from "react";
import { ChevronDown, User, LogOut, Heart, Menu, X, Settings, TrendingUp, FileText, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/LanguageContext";
import { QuantrihLogo } from "../ui/Logo";
import { MarketClock } from "../ui/MarketClock";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
    { id: "asset-allocation", label: t("home.pages.asset_allocation.title") },
    { id: "portfolio-backtest", label: t("home.pages.portfolio_backtest.title") },
    { id: "tactical-allocation", label: t("home.pages.tactical_allocation.title") },
    { id: "montecarlo", label: t("home.pages.montecarlo.title") },
    {
      id: "fmp-group",
      label: t("nav.markets"),
      children: [
        { id: "market", label: t("nav.markets.equity") },
        { id: "etf-overview", label: t("nav.markets.etf") },
      ],
    },
    { id: "education", label: t("nav.education") },
    { id: "platforms", label: t("nav.platforms") },
  ];

  return (
    <header 
      data-theme={(currentPage === "home" || currentPage === "investor-profile" || currentPage === "profile") ? "dark" : undefined}
      className={cn(
        "z-[100] transition-all duration-300 ease-in-out w-full border-b shadow-md backdrop-blur-md",
        (currentPage === "home" || currentPage === "investor-profile" || currentPage === "profile")
          ? "absolute top-0 left-0 bg-transparent border-white/10"
          : "sticky top-0 bg-bg/90 border-border/50"
      )}
    >
      {/* Main Header Top Row: Logo + Page Nav Menu + Controls */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 md:px-8 max-w-full mx-auto text-xs lg:text-sm font-normal">
        
        {/* Left & Center: Logo + Navigation Bar */}
        <div className="flex items-center gap-3 lg:gap-6 h-full">
          <div
            onClick={() => onPageChange("home")}
            className="cursor-pointer flex items-center transition-all hover:opacity-80 px-2 h-10 lg:h-12 shrink-0"
          >
            <QuantrihLogo variant="bars" size="md" className="text-blue-600 opacity-95 hover:opacity-100 transition-transform duration-300" />
          </div>
          
          {/* Desktop Nav Bar */}
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
                          "px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-2xl text-[10px] lg:text-[11px] xl:text-[12px] font-semibold tracking-wide transition-all flex items-center gap-1 relative overflow-visible",
                          isActive 
                            ? "text-white bg-blue-600 shadow-md shadow-blue-500/20 scale-105 font-bold" 
                            : "text-text-2 hover:bg-surface-2 hover:text-text"
                        )}
                      >
                        <span className="relative z-10">{menu.label}</span>
                        <ChevronDown size={13} className="opacity-60 relative z-10" />
                        {isActive && (
                          <motion.div
                            layoutId="activeHeaderHighlight"
                            className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                      </button>
                      <div className="absolute top-[calc(100%-10px)] left-0 min-w-[220px] pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-[2rem] p-2 flex flex-col gap-1 shadow-xl">
                          {menu.children?.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onPageChange(child.id)}
                              className={`w-full text-left px-4 py-2.5 rounded-[1.5rem] text-[11px] lg:text-xs font-semibold transition-all ${
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
                        "px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-2xl text-[10px] lg:text-[11px] xl:text-[12px] font-semibold tracking-wide transition-all relative overflow-visible",
                        isActive 
                          ? "text-white bg-blue-600 shadow-md shadow-blue-500/20 scale-105 font-bold" 
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

        {/* Right Controls */}
        <div className="flex items-center gap-2 h-full ml-auto">
          <LanguageSwitcher />

          <div className="h-4 w-[1px] bg-border/50 mx-0.5 hidden sm:block" />
          
          {/* Donate */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => window.open('https://buy.stripe.com/4gM5kEdrjbS6cWpf2heIw00', '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 rounded-lg transition-all duration-300 text-[10px] font-medium tracking-wider shadow-sm"
            >
              <Heart size={10} className="fill-blue-500 text-blue-500 animate-[pulse_2s_ease-in-out_infinite]" />
              <span>{t("header.donate")}</span>
            </button>
            <div className="h-4 w-[1px] bg-border/50 mx-1" />
          </div>

          {/* User Profile / Sign In Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "pl-1 pr-2 py-1 h-8 lg:h-10 flex items-center gap-1.5 border border-transparent bg-surface hover:bg-surface-2 transition-all rounded-xl shadow-sm",
                userMenuOpen && "border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
              )}
            >
              <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] lg:text-[11px] shadow-inner overflow-hidden">
                {user ? (
                  firestorePhoto ? (
                    <img src={firestorePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (firestoreName || user.displayName || user.email)?.charAt(0) || "?"
                  )
                ) : (
                  <User size={12} className="lg:w-[14px] lg:h-[14px]" />
                )}
              </div>
              <span className="text-[10px] lg:text-[11px] font-bold text-text max-w-[60px] lg:max-w-[100px] truncate hidden sm:block">
                {user ? (firestoreName || user.displayName || user.email?.split("@")[0]) : t("header.login")}
              </span>
              <ChevronDown size={12} className={cn("text-text-3 transition-transform duration-200", userMenuOpen && "rotate-180 text-blue-500")} />
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
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="absolute right-0 top-full mt-2 w-[250px] bg-surface/95 backdrop-blur-2xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.18)] rounded-2xl p-2 flex flex-col gap-1 z-50 text-text"
                >
                  {user ? (
                    <>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-1 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 overflow-hidden">
                          {firestorePhoto ? (
                            <img src={firestorePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            (firestoreName || user.displayName || user.email)?.charAt(0).toUpperCase() || "?"
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-xs font-bold text-text truncate">
                            {firestoreName || user.displayName || user.email}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {t("header.connected")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onPageChange("profile");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-text hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-2.5"
                      >
                        <Settings size={15} className="text-blue-500 shrink-0" />
                        <span>{t("header.account_settings") || "Paramètres du compte"}</span>
                      </button>

                      <button
                        onClick={() => {
                          onPageChange("investor-profile");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-text hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-2.5"
                      >
                        <TrendingUp size={15} className="text-emerald-500 shrink-0" />
                        <span>{t("header.investor_profile") || "Profil & Stratégie Courtier"}</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200 flex items-center gap-2.5"
                      >
                        <LogOut size={15} className="text-rose-500 shrink-0" />
                        <span>{t("header.logout")}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-surface-2/80 border border-border/50 rounded-xl mb-1 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-surface-3 text-text-2 flex items-center justify-center font-bold text-xs shrink-0">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-xs font-bold text-text">
                            {t("header.welcome")}
                          </p>
                          <p className="text-[10px] text-text-3 font-medium">
                            {t("header.guest")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onPageChange("auth");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-text hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-2.5"
                      >
                        <LogIn size={15} className="text-blue-500 shrink-0" />
                        <span>{t("header.login")}</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="xl:hidden p-3.5 sm:p-2 rounded-xl text-text hover:bg-surface-2 transition-colors ml-2 max-sm:[zoom:0.7]"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden absolute top-full left-0 right-0 w-full bg-surface border-b border-border p-5 shadow-2xl z-[150] flex flex-col gap-2 max-h-[80vh] overflow-y-auto scroll-smooth rounded-b-3xl max-sm:[zoom:0.7]"
          >
            <div className="mb-3 pb-3 border-b border-border flex justify-center">
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
                      "w-full text-left px-4 py-3.5 rounded-xl text-lg sm:text-xl font-bold tracking-tight transition-all flex items-center justify-between",
                      currentPage === menu.id || isChildActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-text hover:bg-surface-2"
                    )}
                  >
                    <span>{menu.label}</span>
                    {hasChildren && (
                      <ChevronDown 
                        size={22} 
                        className={cn("transition-transform duration-200", isExpanded ? "rotate-180 text-blue-500" : "text-text-3")} 
                      />
                    )}
                  </button>
                  {hasChildren && "children" in menu && isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-3 flex flex-col gap-1.5 mt-1 bg-surface-2/60 rounded-2xl p-3 transition-all duration-300"
                    >
                      {menu.children?.map(child => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onPageChange(child.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all",
                            currentPage === child.id ? "bg-blue-600 text-white font-bold" : "text-text hover:bg-surface-2"
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
    
      {/* Bottom Sub-Header for Market Clock */}
      <div className="hidden lg:flex justify-end items-center border-t border-border/20 py-1.5 px-6">
        <MarketClock />
      </div>
    </header>
  );
}
