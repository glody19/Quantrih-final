import React from "react";
import { cn } from "../../lib/utils";
import { Sliders, FolderHeart } from "lucide-react";
import { motion } from "motion/react";

interface ViewToggleProps {
  activeView: string;
  onViewChange: (view: "simulator" | "dashboard") => void;
  simulatorLabel?: string;
  dashboardLabel?: string;
}

export function ViewToggle({
  activeView,
  onViewChange,
  simulatorLabel = "Simulator",
  dashboardLabel = "Saved Scenarios",
}: ViewToggleProps) {
  return (
    <div className="flex justify-center md:justify-start">
      <div className="inline-flex items-center p-1 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Simulator Button */}
        <button
          onClick={() => onViewChange("simulator")}
          className={cn(
            "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap outline-none",
            activeView === "simulator" ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          {activeView === "simulator" && (
            <motion.div
              layoutId="activeViewTogglePill"
              className="absolute inset-0 bg-white dark:bg-slate-950 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-slate-200/20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Sliders size={11} className={activeView === "simulator" ? "text-blue-500" : "text-slate-400"} />
            {simulatorLabel}
          </span>
        </button>

        {/* Dashboard/Saved Scenarios Button */}
        <button
          onClick={() => onViewChange("dashboard")}
          className={cn(
            "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap outline-none",
            activeView === "dashboard" ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          {activeView === "dashboard" && (
            <motion.div
              layoutId="activeViewTogglePill"
              className="absolute inset-0 bg-white dark:bg-slate-950 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-slate-200/20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <FolderHeart size={11} className={activeView === "dashboard" ? "text-blue-500" : "text-slate-400"} />
            {dashboardLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
