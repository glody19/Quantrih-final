import { colors } from "@/theme";
import type { SeriesView } from "./backtest";

const SERIES_COLORS = [colors.navy, "#4E6E9C", "#8FA6C6", "#2E5A94", "#6B7080", "#A9B4C8", "#3D4250", "#C9D3E3", "#5B6B85", "#B9BDC8"];

/** Portfolios in shades of navy, the benchmark in grey. */
export function seriesColor(s: SeriesView, i: number) {
  return s.isBenchmark ? colors.benchmark : SERIES_COLORS[i % SERIES_COLORS.length];
}
