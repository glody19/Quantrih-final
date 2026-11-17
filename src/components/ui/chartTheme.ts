/** Shared look of the result charts of the allocation tools. */
export const CHART_FONT = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";

const rgba = (color: string, a: number) => {
  const h = color.replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(h)) return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  return color;
};

/** Vertical gradient under a line: strong near the line, fading away from it. invert puts the strong end at the bottom. */
export const areaGradient = (color: string, strength = 0.16, invert = false) => (context: any) => {
  const { chart } = context;
  const area = chart?.chartArea;
  if (!area) return rgba(color, strength / 2);
  const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
  g.addColorStop(0, rgba(color, invert ? 0 : strength));
  g.addColorStop(1, rgba(color, invert ? strength : 0));
  return g;
};

export const TOOLTIP = {
  backgroundColor: "#0C2233",
  titleColor: "#A9C8EA",
  bodyColor: "#F8FAFC",
  borderColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 10,
  boxPadding: 6,
  usePointStyle: true,
  titleFont: { family: CHART_FONT, size: 12, weight: 600 },
  bodyFont: { family: CHART_FONT, size: 12.5 },
};
