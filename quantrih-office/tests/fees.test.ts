import { describe, expect, it } from "vitest";
import { computeFees, DEFAULT_FEE_GRID } from "@/lib/fees";

describe("computeFees (tranches marginales)", () => {
  it("3 M€ : tout dans la première tranche", () => {
    const r = computeFees(3_000_000);
    expect(r.net).toBe(28_500);
    expect(r.lines).toHaveLength(1);
  });
  it("10 M€ : 47 500 + 37 500", () => {
    const r = computeFees(10_000_000);
    expect(r.net).toBe(85_000);
    expect(r.effectiveRate).toBeCloseTo(0.0085);
  });
  it("20 M€ : 85 000 + 65 000, TVA 21 %", () => {
    const r = computeFees(20_000_000);
    expect(r.net).toBe(150_000);
    expect(r.vat).toBe(31_500);
    expect(r.gross).toBe(181_500);
  });
  it("applique le minimum annuel si défini", () => {
    const r = computeFees(500_000, { ...DEFAULT_FEE_GRID, minimumFee: 15_000 });
    expect(r.net).toBe(15_000);
    expect(r.minimumApplied).toBe(true);
  });
  it("0 ou valeur invalide : aucun honoraire", () => {
    expect(computeFees(0).net).toBe(0);
    expect(computeFees(Number.NaN).net).toBe(0);
  });
});
