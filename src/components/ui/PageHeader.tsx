import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface PageHeaderTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  badge?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  tabs?: PageHeaderTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  tabs,
  activeTab,
  onTabChange,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-6 mb-8 text-left", className)}>
      {(title || description) && (
        <div className="flex flex-col gap-3 pb-6 border-b border-border">
          {badge && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-pv-blue">{badge}</span>}
          <h1 className="font-serif text-3xl md:text-[2.6rem] leading-tight font-semibold text-text tracking-tight">{title || ""}</h1>
          {description && (
            <p className="text-base md:text-lg text-text-3 max-w-3xl leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {((tabs && tabs.length > 0) || actions) && (
      <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
        <div className="flex-1 flex justify-center lg:justify-start">
          {/* Navigation Tabs */}
          {tabs && tabs.length > 0 && onTabChange && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <div className="flex gap-1.5 p-1 bg-surface-2 border border-border/50 rounded-2xl w-fit">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 whitespace-nowrap",
                        isActive ? "text-white" : "text-text-2 hover:text-text"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePageHeaderTab"
                          className="absolute inset-0 bg-blue-600 rounded-xl"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {tab.icon}
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="shrink-0 flex items-center justify-center lg:justify-end gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            {actions}
          </div>
        )}
      </div>
      )}
    </div>
  );
}