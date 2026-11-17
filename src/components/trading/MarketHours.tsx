import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

type Exchange = { code: string; name: string; tz: string; open: number; close: number; lunch?: [number, number] };

// Regular trading sessions in each exchange's local time, in minutes after midnight. Public holidays are not taken into account.
const EXCHANGES: Exchange[] = [
  { code: "NYSE", name: "New York", tz: "America/New_York", open: 570, close: 960 },
  { code: "LSE", name: "London", tz: "Europe/London", open: 480, close: 990 },
  { code: "ENX", name: "Euronext", tz: "Europe/Paris", open: 540, close: 1050 },
  { code: "XETR", name: "Frankfurt", tz: "Europe/Berlin", open: 540, close: 1050 },
  { code: "TSE", name: "Tokyo", tz: "Asia/Tokyo", open: 540, close: 930, lunch: [690, 750] },
  { code: "HKEX", name: "Hong Kong", tz: "Asia/Hong_Kong", open: 570, close: 960, lunch: [720, 780] },
];

const local = (tz: string, now: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "0";
  const h = Number(get("hour")) % 24, m = Number(get("minute")), s = Number(get("second"));
  return { day: get("weekday"), mins: h * 60 + m, secs: h * 3600 + m * 60 + s, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
};

/** Session state and time until the next open or close, computed from the exchange's own clock. */
function state(x: Exchange, now: Date) {
  const l = local(x.tz, now);
  const weekend = l.day === "Sat" || l.day === "Sun";
  const inLunch = x.lunch && l.mins >= x.lunch[0] && l.mins < x.lunch[1];
  const open = !weekend && l.mins >= x.open && l.mins < x.close && !inLunch;
  let target: number; // seconds of local day
  if (open) target = (x.lunch && l.mins < x.lunch[0] ? x.lunch[0] : x.close) * 60;
  else if (!weekend && inLunch) target = x.lunch![1] * 60;
  else if (!weekend && l.mins < x.open) target = x.open * 60;
  else {
    // next weekday open
    const daysAhead = l.day === "Fri" ? 3 : l.day === "Sat" ? 2 : 1;
    target = daysAhead * 86400 + x.open * 60;
  }
  const left = Math.max(0, target - l.secs);
  const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60);
  return { open, lunch: !!inLunch && !weekend, time: l.label, left: hh >= 24 ? `${Math.floor(hh / 24)}d ${hh % 24}h` : `${hh}h ${String(mm).padStart(2, "0")}m` };
}

/** Live clocks of the main exchanges, updated every second. */
export function MarketHours({ dark, fr }: { dark: boolean; fr: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
      {EXCHANGES.map((x) => {
        const s = state(x, now);
        return (
          <div key={x.code} className={cn("shrink-0 flex items-center gap-2.5 rounded-lg px-3 py-1.5", dark ? "bg-white/[0.04]" : "bg-slate-50")} title={x.name}>
            <span className={cn("w-2 h-2 rounded-full", s.open ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)] animate-pulse" : s.lunch ? "bg-amber-400" : dark ? "bg-slate-600" : "bg-slate-300")} />
            <span className="leading-tight">
              <span className={cn("block text-[12px] font-semibold", dark ? "text-white" : "text-slate-900")}>{x.name} <span className={cn("tabular-nums font-normal", dark ? "text-slate-400" : "text-slate-500")}>{s.time}</span></span>
              <span className={cn("block text-[11px] tabular-nums", s.open ? "text-emerald-600" : dark ? "text-slate-500" : "text-slate-500")}>
                {s.open ? (fr ? `Ouvert, ferme dans ${s.left}` : `Open, closes in ${s.left}`) : s.lunch ? (fr ? `Pause, reprise dans ${s.left}` : `Lunch break, resumes in ${s.left}`) : (fr ? `Fermé, ouvre dans ${s.left}` : `Closed, opens in ${s.left}`)}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
