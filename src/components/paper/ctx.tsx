import React, { createContext, useContext } from "react";
import { cn } from "../../lib/utils";
import type { Account, Quote, Side } from "./engine";

export interface Ctx {
  fr: boolean;
  L: (fr: string, en: string) => string;
  dark: boolean;
  acct: Account;
  setAcct: React.Dispatch<React.SetStateAction<Account>>;
  quotes: Record<string, Quote>;
  /** units of a cash currency per euro */
  rateOf: (ccy: string) => number | undefined;
  rates: Record<string, number>;
  dataOk: boolean;
  signedIn: boolean;
  requireUser: () => boolean;
  track: (symbols: string[]) => void;
  ensureQuotes: (symbols: string[]) => Promise<Record<string, Quote>>;
  openTicket: (symbol: string, side?: Side, qty?: number) => void;
  openProduct: (symbol: string) => void;
  favs: string[];
  toggleFav: (s: string) => void;
  notify: (text: string, ok?: boolean) => void;
  go: (view: View) => void;
  names: Record<string, string>;
}

export type View = "portfolio" | "market" | "strategies" | "orders" | "cash";

export const PaperCtx = createContext<Ctx>(null as unknown as Ctx);
export const usePaper = () => useContext(PaperCtx);

export const PALETTE = {
  dark: {
    "--bg": "#0A0D12", "--panel": "#11151C", "--panel2": "#171C25", "--line": "rgba(255,255,255,0.07)", "--line2": "rgba(255,255,255,0.13)",
    "--text": "#E8EDF4", "--sub": "#8A94A6", "--accent": "#3D9BFF", "--accent2": "#1F7AE0", "--up": "#2BD47D", "--down": "#FF5C6A",
    "--hover": "rgba(255,255,255,0.035)", "--chip": "rgba(255,255,255,0.06)", "--warn": "#F5B544",
  },
  light: {
    "--bg": "#F4F6F9", "--panel": "#FFFFFF", "--panel2": "#F8FAFC", "--line": "#E6E9EE", "--line2": "#D3D9E1",
    "--text": "#0E1726", "--sub": "#5E6B7E", "--accent": "#0B6BDB", "--accent2": "#0957B3", "--up": "#0B9A56", "--down": "#D92D3F",
    "--hover": "#F3F6FA", "--chip": "#EDF1F6", "--warn": "#B7791F",
  },
} as const;

// Shared class names, all driven by the CSS variables above
export const k = {
  panel: "bg-[var(--panel)] border border-[var(--line)] rounded-xl",
  sub: "text-[var(--sub)]",
  line: "border-[var(--line)]",
  hover: "hover:bg-[var(--hover)]",
  chip: "bg-[var(--chip)] text-[var(--text)]",
  input: "w-full h-10 rounded-lg border border-[var(--line2)] bg-[var(--panel2)] px-3 text-[14px] tabular-nums text-[var(--text)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--sub)]",
  th: "text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--sub)]",
  up: "text-[var(--up)]",
  down: "text-[var(--down)]",
  btn: "h-9 px-3.5 rounded-lg text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
};
export const sign = (v: number) => (v > 1e-9 ? k.up : v < -1e-9 ? k.down : "");

export function Seg<T extends string>({ value, options, onChange, size = "md" }: { value: T; options: { id: NoInfer<T>; label: React.ReactNode }[]; onChange: (v: NoInfer<T>) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-[var(--chip)]">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-md font-semibold transition-colors whitespace-nowrap", size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]",
            value === o.id ? "bg-[var(--panel)] text-[var(--text)] shadow-sm" : "text-[var(--sub)] hover:text-[var(--text)]")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function useFormat() {
  const { fr } = usePaper();
  const loc = fr ? "fr-BE" : "en-IE";
  const eur = (v: number, d = 2) => (Number.isFinite(v) ? v : 0).toLocaleString(loc, { style: "currency", currency: "EUR", minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (v: number, ccy: string, d = 2) => {
    const c = ccy === "GBp" ? "GBP" : ccy;
    try { return (ccy === "GBp" ? v / 100 : v).toLocaleString(loc, { style: "currency", currency: c, minimumFractionDigits: d, maximumFractionDigits: d }); }
    catch { return `${v.toFixed(d)} ${ccy}`; }
  };
  const num = (v: number, d = 2) => v.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });
  const px = (v: number) => v.toLocaleString(loc, { minimumFractionDigits: Math.abs(v) < 10 ? 3 : 2, maximumFractionDigits: Math.abs(v) < 10 ? 4 : 2 });
  const pct = (v: number, d = 2) => `${v > 0 ? "+" : ""}${v.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d })} %`.replace(" %", fr ? " %" : "%");
  const signed = (v: number, d = 2) => `${v > 0 ? "+" : ""}${eur(v, d)}`;
  return { eur, money, num, px, pct, signed, loc };
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={cn("px-5 py-10 text-center text-[13.5px]", k.sub)}>{children}</p>;
}

/** Product logo: first letters on a tinted disc, colour derived from the symbol. */
export function Badge({ symbol, size = 30 }: { symbol: string; size?: number }) {
  let h = 0; for (const ch of symbol) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const label = symbol.replace(/[-.].*$/, "").slice(0, 4);
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-lg font-bold tracking-tight"
      style={{ width: size, height: size, fontSize: size * (label.length > 3 ? 0.27 : 0.33), background: `hsla(${h},70%,55%,0.16)`, color: `hsl(${h},70%,${62}%)` }}>
      {label}
    </span>
  );
}
