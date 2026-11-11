import { useEffect, useState } from "react";
import { MODEL_PORTFOLIOS, type ModelPortfolio } from "../data/modelPortfolios";

export interface ModelStats {
  asOf: string;
  /** Total return over 1 year, annualised return over 2, 3 and 5 years (percent). */
  y1: number | null; y2: number | null; y3: number | null; y5: number | null;
  /** Annualised volatility and worst peak-to-trough fall over the last 5 years (percent). */
  vol: number | null; maxDd: number | null;
  /** Growth of 100 over the available window, one point per month. */
  growth: { m: string; v: number }[];
}

type Series = Record<string, [string, number][]>;

function compute(p: ModelPortfolio, data: Series): ModelStats | null {
  const maps = p.holdings.map((h) => new Map(data[h.symbol] || []));
  if (maps.some((m) => m.size < 14)) return null;
  // months present for every holding
  const months = Array.from(maps[0].keys()).filter((m) => maps.every((x) => x.has(m))).sort();
  if (months.length < 14) return null;
  const total = p.holdings.reduce((s, h) => s + h.weight, 0);
  // monthly rebalancing: portfolio return = weighted sum of each holding's monthly return
  const rets: number[] = [];
  for (let i = 1; i < months.length; i++) {
    let r = 0;
    p.holdings.forEach((h, k) => { r += (h.weight / total) * (maps[k].get(months[i])! / maps[k].get(months[i - 1])! - 1); });
    rets.push(r);
  }
  const window = (n: number) => (rets.length >= n ? rets.slice(-n).reduce((a, r) => a * (1 + r), 1) : null);
  const ann = (n: number) => { const g = window(n); return g === null ? null : (Math.pow(g, 12 / n) - 1) * 100; };
  const last = rets.slice(-60);
  const mean = last.reduce((a, b) => a + b, 0) / last.length;
  const vol = Math.sqrt(last.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, last.length - 1)) * Math.sqrt(12) * 100;
  let v = 100, peak = 100, maxDd = 0;
  const growth = [{ m: months[months.length - last.length - 1], v: 100 }];
  last.forEach((r, i) => {
    v *= 1 + r; peak = Math.max(peak, v); maxDd = Math.min(maxDd, v / peak - 1);
    growth.push({ m: months[months.length - last.length + i], v: Math.round(v * 100) / 100 });
  });
  const g1 = window(12);
  return { asOf: months[months.length - 1], y1: g1 === null ? null : (g1 - 1) * 100, y2: ann(24), y3: ann(36), y5: ann(60), vol, maxDd: maxDd * 100, growth };
}

/** Live statistics for every model portfolio, recomputed from monthly total-return data on each visit. */
export function useModelPerformance() {
  const [stats, setStats] = useState<Record<string, ModelStats | null>>({});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    const symbols = Array.from(new Set(MODEL_PORTFOLIOS.flatMap((p) => p.holdings.map((h) => h.symbol))));
    fetch(`/api/stock/monthly-adj?years=6&symbols=${encodeURIComponent(symbols.join(","))}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Series) => {
        if (!alive) return;
        const out: Record<string, ModelStats | null> = {};
        MODEL_PORTFOLIOS.forEach((p) => { out[p.id] = compute(p, data); });
        setStats(out);
        setState(Object.values(out).some(Boolean) ? "ready" : "error");
      })
      .catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, []);

  return { stats, state };
}
