import { cn } from "../../lib/utils";

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
    <div className="flex items-center gap-1 bg-surface-2 p-1.5 rounded-[1.5rem] border border-border/60">
      <button
        onClick={() => onViewChange("simulator")}
        className={cn(
          "px-6 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-300",
          activeView === "simulator"
            ? "bg-surface shadow-sm text-pv-blue"
            : "text-text-4 hover:text-text"
        )}
      >
        {simulatorLabel}
      </button>
      <button
        onClick={() => onViewChange("dashboard")}
        className={cn(
          "px-6 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-300",
          activeView === "dashboard"
            ? "bg-surface shadow-sm text-pv-blue"
            : "text-text-4 hover:text-text"
        )}
      >
        {dashboardLabel}
      </button>
    </div>
  );
}
