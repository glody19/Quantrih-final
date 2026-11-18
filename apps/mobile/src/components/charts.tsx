import React, { useMemo, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { colors, font } from "@/theme";

function useWidth(initial = 300) {
  const [w, setW] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => {
    const nw = Math.round(e.nativeEvent.layout.width);
    if (nw > 0 && nw !== w) setW(nw);
  };
  return { w, onLayout };
}

function extent(arrs: number[][]) {
  let mn = Infinity, mx = -Infinity;
  arrs.forEach((a) => a.forEach((v) => { if (Number.isFinite(v)) { if (v < mn) mn = v; if (v > mx) mx = v; } }));
  if (!Number.isFinite(mn)) return [0, 1];
  if (mn === mx) return [mn - 1, mx + 1];
  return [mn, mx];
}

export interface LineSeries {
  values: number[];
  color: string;
  label?: string;
}

/**
 * Growth chart. Drag a finger across it to read the value at a date (the "scrub" of the mockups).
 * The first series gets a light fill; the others are thin comparison lines.
 */
export function LineChart({ series, dates, height = 170, format, fill = true }: {
  series: LineSeries[];
  dates?: string[];
  height?: number;
  format?: (v: number) => string;
  fill?: boolean;
}) {
  const { w, onLayout } = useWidth();
  const [idx, setIdx] = useState<number | null>(null);
  const n = series[0]?.values.length || 0;
  const [mn, mx] = useMemo(() => extent(series.map((s) => s.values)), [series]);
  const pad = 4;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * w);
  const y = (v: number) => pad + (1 - (v - mn) / (mx - mn)) * (height - pad * 2);

  const paths = useMemo(
    () => series.map((s) => s.values.map((v, i) => `${(s.values.length <= 1 ? 0 : (i / (s.values.length - 1)) * w).toFixed(1)},${y(v).toFixed(1)}`).join(" ")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, w, height, mn, mx],
  );

  const pick = (lx: number) => {
    if (n < 2) return;
    setIdx(Math.max(0, Math.min(n - 1, Math.round((lx / w) * (n - 1)))));
  };

  const shown = idx ?? n - 1;
  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, minHeight: 18, marginBottom: 4 }}>
        {dates?.[shown] ? <Text style={[font.small, { color: colors.text4 }]}>{dates[shown].slice(0, 7)}</Text> : null}
        {series.map((s, k) =>
          Number.isFinite(s.values[shown]) ? (
            <Text key={k} style={[font.small, font.num, { color: k === 0 ? colors.text : colors.text3, fontWeight: k === 0 ? "600" : "400" }]}>
              {s.label ? `${s.label} ` : ""}{format ? format(s.values[shown]) : s.values[shown].toFixed(0)}
            </Text>
          ) : null,
        )}
      </View>
      <View
        onLayout={onLayout}
        style={{ height }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
        onResponderMove={(e) => pick(e.nativeEvent.locationX)}
        onResponderRelease={() => setIdx(null)}
        onResponderTerminate={() => setIdx(null)}
      >
        <Svg width={w} height={height}>
          {[1, 2, 3].map((g) => <Line key={g} x1={0} x2={w} y1={(height * g) / 4} y2={(height * g) / 4} stroke="#F0F1F4" strokeWidth={1} />)}
          {fill && paths[0] ? <Path d={`M0,${height} L${paths[0].split(" ").join(" L")} L${w},${height} Z`} fill={series[0].color} opacity={0.06} /> : null}
          {paths.slice().reverse().map((p, rk) => {
            const k = paths.length - 1 - rk;
            return <Polyline key={k} points={p} fill="none" stroke={series[k].color} strokeWidth={k === 0 ? 1.8 : 1.3} />;
          })}
          {idx != null ? (
            <G>
              <Line x1={x(idx)} x2={x(idx)} y1={0} y2={height} stroke="#B9BDC8" strokeDasharray="3 3" />
              {series.map((s, k) => (Number.isFinite(s.values[idx]) ? <Circle key={k} cx={x(idx)} cy={y(s.values[idx])} r={3.5} fill="#fff" stroke={s.color} strokeWidth={1.5} /> : null))}
            </G>
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

/** Underwater chart: drawdowns as fractions (<= 0). */
export function DrawdownChart({ values, height = 56 }: { values: number[]; height?: number }) {
  const { w, onLayout } = useWidth();
  const mn = Math.min(-0.0001, ...values.filter(Number.isFinite));
  const n = values.length;
  const pts = values.map((v, i) => `${((i / Math.max(1, n - 1)) * w).toFixed(1)},${((v / mn) * (height - 2)).toFixed(1)}`).join(" L");
  return (
    <View onLayout={onLayout} style={{ height }}>
      <Svg width={w} height={height}>
        <Path d={`M0,0 L${pts} L${w},0 Z`} fill={colors.red} opacity={0.15} />
        <Polyline points={pts.split(" L").join(" ")} fill="none" stroke={colors.red} strokeWidth={1} />
      </Svg>
    </View>
  );
}

function arc(c: number, r: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)}`;
}

export function Donut({ values, palette, size = 110, stroke = 15 }: { values: number[]; palette: string[]; size?: number; stroke?: number }) {
  const tot = values.reduce((a, b) => a + b, 0) || 1;
  const c = size / 2;
  const r = c - stroke / 2 - 1;
  let a = -Math.PI / 2;
  const gap = values.length > 1 ? 0.025 : 0;
  return (
    <Svg width={size} height={size}>
      {values.length === 1 ? <Circle cx={c} cy={c} r={r} stroke={palette[0]} strokeWidth={stroke} fill="none" /> : null}
      {values.length > 1 &&
        values.map((v, i) => {
          const a1 = a + (v / tot) * Math.PI * 2;
          const d = arc(c, r, a, Math.max(a, a1 - gap));
          a = a1;
          return <Path key={i} d={d} stroke={palette[i % palette.length]} strokeWidth={stroke} fill="none" />;
        })}
    </Svg>
  );
}

export function Sparkline({ values, width = 64, height = 22, color = colors.navy }: { values: number[]; width?: number; height?: number; color?: string }) {
  const v = values.filter(Number.isFinite);
  if (v.length < 2) return <View style={{ width, height }} />;
  const mn = Math.min(...v), mx = Math.max(...v);
  const pts = v.map((x, i) => `${((i / (v.length - 1)) * width).toFixed(1)},${(height - 2 - ((x - mn) / (mx - mn || 1)) * (height - 4)).toFixed(1)}`).join(" ");
  return (
    <Svg width={width} height={height}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}

/** Vertical bars with labels; negative values go below the axis in red. */
export function Bars({ values, labels, height = 120, format, highlightLast = false }: {
  values: number[];
  labels: string[];
  height?: number;
  format?: (v: number) => string;
  highlightLast?: boolean;
}) {
  const { w, onLayout } = useWidth();
  const n = values.length || 1;
  const mx = Math.max(0, ...values);
  const mn = Math.min(0, ...values);
  const top = 14, bottom = 16;
  const plotH = height - top - bottom;
  const zero = top + (mx / (mx - mn || 1)) * plotH;
  const slot = w / n;
  const bw = Math.min(28, slot * 0.6);
  return (
    <View onLayout={onLayout} style={{ height }}>
      <Svg width={w} height={height}>
        <Line x1={0} x2={w} y1={zero} y2={zero} stroke={colors.border2} />
        {values.map((v, i) => {
          const h = (Math.abs(v) / (mx - mn || 1)) * plotH;
          const bx = i * slot + (slot - bw) / 2;
          const by = v >= 0 ? zero - h : zero;
          const fill = v < 0 ? colors.red : highlightLast && i === n - 1 ? "#C9D3E3" : colors.navy;
          return (
            <G key={i}>
              <Rect x={bx} y={by} width={bw} height={Math.max(1, h)} rx={2} fill={fill} opacity={v < 0 ? 0.8 : 0.88} />
              {format && n <= 12 ? (
                <SvgText x={bx + bw / 2} y={v >= 0 ? by - 3 : by + h + 10} fontSize={9} fill={colors.text3} textAnchor="middle">{format(v)}</SvgText>
              ) : null}
              {n <= 12 || i % Math.ceil(n / 8) === 0 ? (
                <SvgText x={bx + bw / 2} y={height - 3} fontSize={9} fill={colors.text4} textAnchor="middle">{labels[i]}</SvgText>
              ) : null}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

/** Position of a company within its sector, 0 (worst) to 1 (best). */
export function Gauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height: 8, backgroundColor: colors.surface, borderRadius: 4, marginTop: 6, justifyContent: "center" }}>
      <View style={{ position: "absolute", left: `${v * 100}%`, marginLeft: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.navy }} />
    </View>
  );
}
