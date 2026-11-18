/**
 * US-listed ETFs and their closest UCITS equivalents listed in euros (Xetra or Euronext Amsterdam),
 * for European investors who cannot buy US ETFs (PRIIPs/KID rules).
 * Every symbol below was checked against the price API on 2026-11-18.
 * Results with these ETFs are in euros, so they include the EUR/USD effect.
 */
export interface UcitsEquivalent {
  to: string;
  /** Short note when the match is approximate. */
  fr?: string;
  en?: string;
}

const SP500 = "SXR8.DE"; // iShares Core S&P 500 UCITS ETF (Acc), Xetra, EUR

export const UCITS_EQUIVALENTS: Record<string, UcitsEquivalent> = {
  SPY: { to: SP500 }, VOO: { to: SP500 }, IVV: { to: SP500 }, VFINX: { to: SP500 },
  VTI: { to: SP500, fr: "S&P 500 à la place du marché américain total", en: "S&P 500 in place of the total US market" },
  ITOT: { to: SP500, fr: "S&P 500 à la place du marché américain total", en: "S&P 500 in place of the total US market" },
  VTSMX: { to: SP500, fr: "S&P 500 à la place du marché américain total", en: "S&P 500 in place of the total US market" },
  QQQ: { to: "EQQQ.DE" }, QQQM: { to: "EQQQ.DE" },
  VT: { to: "VWCE.DE" }, ACWI: { to: "VWCE.DE" },
  URTH: { to: "IWDA.AS" },
  VWO: { to: "EMIM.AS" }, EEM: { to: "EMIM.AS" }, IEMG: { to: "EMIM.AS" }, VEIEX: { to: "EMIM.AS" },
  BND: { to: "EUNA.DE", fr: "obligations mondiales à la place des obligations américaines", en: "global bonds in place of US bonds" },
  AGG: { to: "EUNA.DE", fr: "obligations mondiales à la place des obligations américaines", en: "global bonds in place of US bonds" },
  VBMFX: { to: "EUNA.DE", fr: "obligations mondiales à la place des obligations américaines", en: "global bonds in place of US bonds" },
  TLT: { to: "IS04.DE" }, VUSTX: { to: "IS04.DE" },
  IEF: { to: "SXRM.DE" },
  GLD: { to: "4GLD.DE" }, IAU: { to: "4GLD.DE" },
  VNQ: { to: "IQQ7.DE" }, VGSIX: { to: "IQQ7.DE" },
};

/** Replace every US ETF that has a UCITS equivalent; returns the new list and what changed. */
export function toUcits<T extends { symbol: string }>(rows: T[]): { rows: T[]; swapped: { from: string; to: string; note?: UcitsEquivalent }[] } {
  const swapped: { from: string; to: string; note?: UcitsEquivalent }[] = [];
  const out = rows.map((r) => {
    const s = (r.symbol || "").trim().toUpperCase();
    const eq = UCITS_EQUIVALENTS[s];
    if (!eq) return r;
    swapped.push({ from: s, to: eq.to, note: eq });
    return { ...r, symbol: eq.to };
  });
  return { rows: out, swapped };
}

export const hasUsEtf = (rows: { symbol: string }[]) => rows.some((r) => !!UCITS_EQUIVALENTS[(r.symbol || "").trim().toUpperCase()]);
