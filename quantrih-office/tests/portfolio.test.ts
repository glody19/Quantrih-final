import { describe, expect, it } from "vitest";
import { summarize, type HoldingRow } from "@/lib/portfolio";

const row = (p: Partial<HoldingRow>): HoldingRow => ({ id: Math.random().toString(), label: "x", category: "titres", institution: null, owner: null, value: 0, valuedAt: "2026-10-01", source: "releve", ...p });

describe("summarize", () => {
  it("calcule le net, les dettes et la part liquide", () => {
    const s = summarize([
      row({ category: "titres", value: 600, institution: "A" }),
      row({ category: "immobilier", value: 400, valuedAt: "2026-01-15" }),
      row({ category: "autres", value: -100 }),
    ]);
    expect(s.assets).toBe(1000);
    expect(s.debts).toBe(-100);
    expect(s.net).toBe(900);
    expect(s.liquidShare).toBeCloseTo(0.6);
    expect(s.oldestValuation).toBe("2026-01-15");
    expect(s.byInstitution[0]).toMatchObject({ key: "A", value: 600 });
    expect(s.byInstitution[1]).toMatchObject({ key: "Détention directe" });
  });
  it("gère un patrimoine vide", () => {
    const s = summarize([]);
    expect(s.net).toBe(0);
    expect(s.liquidShare).toBe(0);
  });
});
