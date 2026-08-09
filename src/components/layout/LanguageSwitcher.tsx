import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { cn } from "../../lib/utils";

export type LanguageCode = "en" | "fr" | "nl" | "de" | "es";

interface LanguageItem {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
  FlagComponent: React.FC<{ className?: string }>;
}

const FlagNL: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={cn("rounded-xs shadow-xs shrink-0", className)} viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#21468B" />
    <rect width="60" height="26.67" fill="#FFFFFF" />
    <rect width="60" height="13.33" fill="#AE1C28" />
  </svg>
);

const FlagFR: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={cn("rounded-xs shadow-xs shrink-0", className)} viewBox="0 0 60 40">
    <rect x="0" y="0" width="20" height="40" fill="#002395" />
    <rect x="20" y="0" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" y="0" width="20" height="40" fill="#ED2939" />
  </svg>
);

const FlagUK: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={cn("rounded-xs shadow-xs shrink-0", className)} viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#012169" />
    <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" strokeWidth="8" />
    <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
    <rect x="24" y="0" width="12" height="40" fill="#FFFFFF" />
    <rect x="0" y="14" width="60" height="12" fill="#FFFFFF" />
    <rect x="26" y="0" width="8" height="40" fill="#C8102E" />
    <rect x="0" y="16" width="60" height="8" fill="#C8102E" />
  </svg>
);

const FlagDE: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={cn("rounded-xs shadow-xs shrink-0", className)} viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#FFCC00" />
    <rect width="60" height="26.67" fill="#DD0000" />
    <rect width="60" height="13.33" fill="#000000" />
  </svg>
);

const FlagES: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={cn("rounded-xs shadow-xs shrink-0", className)} viewBox="0 0 60 40">
    <rect width="60" height="40" fill="#AA151B" />
    <rect y="10" width="60" height="20" fill="#F1BF00" />
  </svg>
);

const languages: LanguageItem[] = [
  { code: "en", label: "English", nativeLabel: "English", region: "United Kingdom", FlagComponent: FlagUK },
  { code: "fr", label: "French", nativeLabel: "Français", region: "France", FlagComponent: FlagFR },
  { code: "de", label: "German", nativeLabel: "Deutsch", region: "Deutschland", FlagComponent: FlagDE },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", region: "Nederland", FlagComponent: FlagNL },
  { code: "es", label: "Spanish", nativeLabel: "Español", region: "España", FlagComponent: FlagES },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const CurrentFlag = currentLang.FlagComponent;

  return (
    <div className="relative z-50 font-sans" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className={cn(
          "group relative flex items-center gap-2 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-2xl transition-all duration-300 border backdrop-blur-md shadow-sm",
          isOpen
            ? "bg-surface border-pv-blue/40 ring-4 ring-pv-blue/10 shadow-md scale-[1.02]"
            : "bg-surface-2/80 hover:bg-surface border-border hover:border-pv-blue/30"
        )}
      >
        <div className="relative flex items-center justify-center">
          <CurrentFlag className="w-5 h-3.5 rounded-xs shadow-xs transition-transform duration-300 group-hover:scale-110" />
        </div>

        <span className="text-xs font-black tracking-wider uppercase text-text font-mono">
          {currentLang.code}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            "text-text-3 transition-transform duration-300 ease-out",
            isOpen && "rotate-180 text-pv-blue"
          )}
        />
      </button>

      {/* Animated Dropdown Menu with Scrolling */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-72 bg-surface/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-3 flex flex-col gap-2.5 z-50 overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex flex-col gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-[11px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={12} className="text-pv-blue" />
                  Language / Taal
                </span>
              </div>
            </div>

            {/* Scrollable Language List */}
            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-pv-blue/20 hover:scrollbar-thumb-pv-blue/40">
              {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  const Flag = lang.FlagComponent;

                  return (
                    <motion.button
                      key={lang.code}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left w-full border",
                        isSelected
                          ? "bg-pv-blue/10 border-pv-blue/40 text-pv-blue shadow-xs font-bold"
                          : "bg-transparent border-transparent text-text hover:bg-surface-2 hover:border-border/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative p-1 rounded-xl bg-surface border border-border/50 group-hover:scale-105 transition-transform shadow-xs">
                          <Flag className="w-6 h-4 rounded-xs object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-none text-text group-hover:text-pv-blue transition-colors flex items-center gap-1.5">
                            {lang.nativeLabel}
                            <span className="text-[10px] uppercase font-mono font-bold text-text-4 px-1 rounded bg-surface-3">
                              {lang.code}
                            </span>
                          </span>
                          <span className="text-[10px] text-text-3 font-medium mt-0.5">
                            {lang.region}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-pv-blue text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
