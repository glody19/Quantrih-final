import React from "react";
import { Text, View } from "react-native";
import { Bars, Donut, DrawdownChart, LineChart } from "@/components/charts";
import { Kpi, KpiRow, Label } from "@/components/ui";
import { TICKER_NAMES } from "@/lib/labels";
import { money, num, pct } from "@/lib/format";
import { allocationPalette, colors, font } from "@/theme";

export interface PortfolioData {
  alloc: Record<string, number>; // percent
  dates: string[];
  values: number[];
  drawdowns?: number[]; // fractions <= 0
  years: number[];
  annual: number[]; // fractions
  cagr: number;
  volatility: number;
  maxDrawdown: number; // positive fraction
  sharpe?: number;
  endBalance?: number;
  initial?: number;
  currency?: string;
}

export function drawdownsOf(values: number[]): number[] {
  let peak = -Infinity;
  return values.map((v) => {
    peak = Math.max(peak, v);
    return peak > 0 ? v / peak - 1 : 0;
  });
}

/** Donut, key figures, growth curve, drawdown and calendar years: the portfolio page of the site, in one column. */
export function PortfolioView({ data, compare }: { data: PortfolioData; compare?: { label: string; values: number[] } }) {
  const entries = Object.entries(data.alloc).sort((a, b) => b[1] - a[1]);
  const ccy = data.currency || "EUR";
  const lastYears = data.years.slice(-10);
  const lastAnnual = data.annual.slice(-10);
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 }}>
        <Donut values={entries.map((e) => e[1])} palette={allocationPalette} size={112} stroke={16} />
        <View style={{ flex: 1, gap: 6 }}>
          {entries.map(([sym, w], i) => (
            <View key={sym} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: allocationPalette[i % allocationPalette.length] }} />
              <Text style={[font.small, { flex: 1, color: colors.text2 }]} numberOfLines={1}>{TICKER_NAMES[sym] ? `${TICKER_NAMES[sym]}` : sym}<Text style={{ color: colors.text4 }}>{TICKER_NAMES[sym] ? `  ${sym}` : ""}</Text></Text>
              <Text style={[font.small, font.num, { fontWeight: "600", color: colors.text }]}>{num(w, w % 1 ? 1 : 0)} %</Text>
            </View>
          ))}
        </View>
      </View>

      <KpiRow>
        <Kpi label="Rend. annuel" value={pct(data.cagr)} />
        <Kpi label="Volatilité" value={pct(data.volatility)} />
        <Kpi label="Pire baisse" value={pct(-data.maxDrawdown)} tone="down" />
      </KpiRow>

      <Label>{data.initial ? `Valeur de ${money(data.initial, ccy)}` : "Valeur du portefeuille"}</Label>
      <LineChart
        series={[{ values: data.values, color: colors.navy }, ...(compare ? [{ values: compare.values, color: colors.benchmark, label: compare.label }] : [])]}
        dates={data.dates}
        format={(v) => money(v, ccy)}
      />
      {compare ? (
        <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
          <Legend color={colors.navy} label="Portefeuille" />
          <Legend color={colors.benchmark} label={compare.label} />
        </View>
      ) : null}

      <Label>Baisse depuis le dernier sommet</Label>
      <DrawdownChart values={data.drawdowns || drawdownsOf(data.values)} />

      {lastYears.length ? (
        <>
          <Label>Rendement par année</Label>
          <Bars values={lastAnnual.map((a) => a * 100)} labels={lastYears.map((y) => `'${String(y).slice(2)}`)} format={(v) => num(v, 0)} height={130} />
        </>
      ) : null}
    </View>
  );
}

export function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 12, height: 2, backgroundColor: color }} />
      <Text style={[font.small, { color: colors.text3 }]}>{label}</Text>
    </View>
  );
}
