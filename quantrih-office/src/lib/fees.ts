/**
 * Calcul des honoraires de coordination par tranches marginales : chaque taux s'applique
 * uniquement à la part du patrimoine comprise dans sa tranche (comme un barème d'impôt).
 * La grille est paramétrable (table `settings`, clé `fee_grid`) ; ces valeurs sont celles par défaut.
 */

export type FeeBracket = { upTo: number | null; rate: number };
export type FeeGrid = { brackets: FeeBracket[]; vatRate: number; minimumFee: number };

export const DEFAULT_FEE_GRID: FeeGrid = {
  brackets: [
    { upTo: 5_000_000, rate: 0.0095 },
    { upTo: 10_000_000, rate: 0.0075 },
    { upTo: null, rate: 0.0065 },
  ],
  vatRate: 0.21,
  minimumFee: 0,
};

export type FeeLine = { from: number; to: number; rate: number; fee: number };
export type FeeResult = { lines: FeeLine[]; net: number; vat: number; gross: number; effectiveRate: number; minimumApplied: boolean };

export function computeFees(wealth: number, grid: FeeGrid = DEFAULT_FEE_GRID): FeeResult {
  const amount = Math.max(0, Number.isFinite(wealth) ? wealth : 0);
  const lines: FeeLine[] = [];
  let lower = 0;
  for (const b of grid.brackets) {
    const upper = b.upTo ?? Infinity;
    if (amount <= lower) break;
    const slice = Math.min(amount, upper) - lower;
    lines.push({ from: lower, to: Math.min(amount, upper), rate: b.rate, fee: round(slice * b.rate) });
    lower = upper;
  }
  let net = round(lines.reduce((s, l) => s + l.fee, 0));
  const minimumApplied = amount > 0 && net < grid.minimumFee;
  if (minimumApplied) net = grid.minimumFee;
  const vat = round(net * grid.vatRate);
  return { lines, net, vat, gross: round(net + vat), effectiveRate: amount ? net / amount : 0, minimumApplied };
}

const round = (n: number) => Math.round(n * 100) / 100;
