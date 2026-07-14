import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const CLOCK_CITIES = [
  { id: "nyc", name: "NYC", tz: "America/New_York", open: [9, 30], close: [16, 0] },
  { id: "lon", name: "LDN", tz: "Europe/London", open: [8, 0], close: [16, 30] },
  { id: "fra", name: "FRA", tz: "Europe/Berlin", open: [9, 0], close: [17, 30] },
  { id: "jpn", name: "TYO", tz: "Asia/Tokyo", open: [9, 0], close: [15, 0] },
];

const getClockStatus = (tz: string, oH: number, oM: number, cH: number, cM: number) => {
  const now = new Date();
  
  // Check day of week first
  const dayOptions = { timeZone: tz, weekday: "short" } as const;
  const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(now);
  if (dayString === "Sat" || dayString === "Sun") {
    return "closed";
  }

  const options = { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false } as const;
  const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
  const [hour, minute] = timeString.split(":").map(Number);

  if (hour > oH || (hour === oH && minute >= oM)) {
    if (hour < cH || (hour === cH && minute < cM)) {
      return "open";
    }
  }
  if (hour === oH - 1 || (hour === oH && minute < oM)) return "pre";
  return "closed";
};

export function MarketClock() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const tick = () => {
      const nt: Record<string, string> = {};
      CLOCK_CITIES.forEach((c) => {
        nt[c.id] = new Date().toLocaleTimeString("en-GB", {
          timeZone: c.tz,
          hour: "2-digit",
          minute: "2-digit",
        });
      });
      setTimes(nt);
    };

    const timer = setInterval(tick, 60000);
    tick();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2.5 text-[10px] lg:text-[11.5px] font-mono">
      {CLOCK_CITIES.map((c) => {
        const status = getClockStatus(c.tz, c.open[0], c.open[1], c.close[0], c.close[1]);
        return (
          <div key={c.name} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                status === "open" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : 
                status === "pre" ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : 
                "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              )}
            />
            <span className="text-text-2 font-bold tracking-wider">{c.name}</span>
            <span className="text-text-3">{times[c.id] || "..."}</span>
          </div>
        );
      })}
    </div>
  );
}
