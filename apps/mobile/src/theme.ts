/**
 * Quantrih mobile design tokens. Same palette as quantrih.com: white surfaces, near black text,
 * one navy accent kept for charts and the active tab, green and red only for gains and losses.
 */
export const colors = {
  bg: "#FFFFFF",
  surface: "#F5F6F8",
  border: "#E6E7EC",
  border2: "#D3D5DD",
  text: "#111118",
  text2: "#23232D",
  text3: "#53566A",
  text4: "#858899",
  navy: "#1B3F72",
  navyBg: "#EEF2F8",
  green: "#12A26E",
  greenBg: "#E9F6F0",
  red: "#E5484D",
  redBg: "#FDEEEE",
  benchmark: "#9AA0B0",
};

/** Shades of navy and grey for allocation donuts: no rainbow. */
export const allocationPalette = ["#1B3F72", "#4E6E9C", "#8FA6C6", "#C9D3E3", "#B9BDC8", "#6B7080", "#2E5A94", "#A9B4C8", "#DDE2EA", "#3D4250"];

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 6, md: 9, lg: 12 };

export const font = {
  title: { fontSize: 26, fontWeight: "600" as const, letterSpacing: -0.4, color: colors.text },
  h2: { fontSize: 17, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 14, color: colors.text2 },
  small: { fontSize: 12, color: colors.text3 },
  label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.8, textTransform: "uppercase" as const, color: colors.text4 },
  num: { fontVariant: ["tabular-nums" as const] },
};
