/** French number formatting: 12 345,6 and 7,1 %. */
const nf = (d: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

export function num(v: number | null | undefined, digits = 2): string {
  if (v == null || !Number.isFinite(v)) return "-";
  return nf(digits).format(v);
}

/** v is a fraction (0.071 → "7,1 %"). */
export function pct(v: number | null | undefined, digits = 1, signed = false): string {
  if (v == null || !Number.isFinite(v)) return "-";
  const s = nf(digits).format(v * 100);
  return `${signed && v > 0 ? "+" : ""}${s} %`;
}

/** v is already in percent (7.1 → "7,1 %"). */
export function pctRaw(v: number | null | undefined, digits = 2, signed = true): string {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${signed && v > 0 ? "+" : ""}${nf(digits).format(v)} %`;
}

export function money(v: number | null | undefined, ccy = "EUR", digits = 0): string {
  if (v == null || !Number.isFinite(v)) return "-";
  const sym = ccy === "USD" ? "$" : ccy === "GBP" ? "£" : "€";
  return `${nf(digits).format(v)} ${sym}`;
}

/** 32 700 000 000 → "32,7 Md". */
export function compact(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "-";
  const a = Math.abs(v);
  if (a >= 1e12) return `${nf(1).format(v / 1e12)} T`;
  if (a >= 1e9) return `${nf(1).format(v / 1e9)} Md`;
  if (a >= 1e6) return `${nf(1).format(v / 1e6)} M`;
  if (a >= 1e3) return `${nf(1).format(v / 1e3)} k`;
  return nf(0).format(v);
}

export function timeHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
