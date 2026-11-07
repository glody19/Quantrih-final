import { describe, expect, it } from "vitest";
import { formatBce, isValidBce, isValidIban, requiredDocuments } from "@/lib/belgium";

describe("numéro d'entreprise BCE", () => {
  it("valide un numéro connu (SPF Finances : 0308.357.159)", () => {
    expect(isValidBce("0308.357.159")).toBe(true);
    expect(formatBce("0308357159")).toBe("0308.357.159");
  });
  it("refuse une clé fausse", () => {
    expect(isValidBce("0308.357.158")).toBe(false);
    expect(isValidBce("2308357159")).toBe(false);
  });
});

describe("IBAN", () => {
  it("valide un IBAN belge d'exemple", () => {
    expect(isValidIban("BE68 5390 0754 7034")).toBe(true);
  });
  it("refuse un IBAN altéré ou de mauvaise longueur", () => {
    expect(isValidIban("BE68 5390 0754 7035")).toBe(false);
    expect(isValidIban("BE68 5390 0754 703")).toBe(false);
  });
});

describe("pièces demandées", () => {
  it("adapte la liste à la situation", () => {
    const base = requiredDocuments({ persons: 1, maritalRegimes: ["celibataire"], entities: 0, categories: [] }).map((d) => d.key);
    expect(base).toEqual(["identite", "fiscal", "releve"]);
    const full = requiredDocuments({ persons: 2, maritalRegimes: ["separation_acquets"], entities: 1, categories: ["immobilier", "pension", "dettes"] }).map((d) => d.key);
    expect(full).toEqual(["identite", "fiscal", "releve", "famille", "societe", "immobilier", "assurance", "credit"]);
  });
});
