import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface MarketCity {
  id: string;
  code: string;
  name: string;
  tz: string;
  open: [number, number];
  close: [number, number];
}

// Regular-session hours in each exchange's local time (lunch breaks ignored).
const CLOCK_CITIES: MarketCity[] = [
  { id: "nyc", code: "NYC", name: "New York (NYSE, Nasdaq)", tz: "America/New_York", open: [9, 30], close: [16, 0] },
  { id: "tor", code: "TOR", name: "Toronto (TSX)", tz: "America/Toronto", open: [9, 30], close: [16, 0] },
  { id: "sao", code: "SAO", name: "São Paulo (B3)", tz: "America/Sao_Paulo", open: [10, 0], close: [17, 55] },
  { id: "lon", code: "LDN", name: "London (LSE)", tz: "Europe/London", open: [8, 0], close: [16, 30] },
  { id: "par", code: "PAR", name: "Paris, Brussels, Amsterdam (Euronext)", tz: "Europe/Paris", open: [9, 0], close: [17, 30] },
  { id: "fra", code: "FRA", name: "Frankfurt (Xetra)", tz: "Europe/Berlin", open: [9, 0], close: [17, 30] },
  { id: "zrh", code: "ZRH", name: "Zurich (SIX)", tz: "Europe/Zurich", open: [9, 0], close: [17, 30] },
  { id: "hkg", code: "HKG", name: "Hong Kong (HKEX)", tz: "Asia/Hong_Kong", open: [9, 30], close: [16, 0] },
  { id: "tyo", code: "TYO", name: "Tokyo (TSE)", tz: "Asia/Tokyo", open: [9, 0], close: [15, 30] },
];

type ClockStatus = "open" | "pre" | "closed";

const getClockStatus = (tz: string, oH: number, oM: number, cH: number, cM: number): ClockStatus => {
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(now);
  if (day === "Sat" || day === "Sun") return "closed";

  const time = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false }).format(now);
  const [hour, minute] = time.split(":").map(Number);
  const minutes = (hour % 24) * 60 + minute;
  const openAt = oH * 60 + oM;
  const closeAt = cH * 60 + cM;

  if (minutes >= openAt && minutes < closeAt) return "open";
  if (minutes >= openAt - 60 && minutes < openAt) return "pre";
  return "closed";
};

const pad = (n: number) => String(n).padStart(2, "0");

export function MarketClock({ dark = false }: { dark?: boolean } = {}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4 lg:gap-5 font-mono text-[12px] whitespace-nowrap">
      {CLOCK_CITIES.map((c) => {
        const status = getClockStatus(c.tz, c.open[0], c.open[1], c.close[0], c.close[1]);
        const time = new Date().toLocaleTimeString("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit" });
        return (
          <div
            key={c.id}
            className="flex items-center gap-1.5"
            title={`${c.name} · ${pad(c.open[0])}:${pad(c.open[1])} to ${pad(c.close[0])}:${pad(c.close[1])} local time`}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                status === "open" ? "bg-emerald-500" : status === "pre" ? "bg-amber-400" : "bg-rose-500/70"
              )}
            />
            <span className={cn("font-bold", dark ? "text-white/55" : "text-text-3")}>{c.code}</span>
            <span className={cn("font-semibold", dark ? "text-white" : "text-text")}>{time}</span>
          </div>
        );
      })}
    </div>
  );
}
