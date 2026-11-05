import { describe, expect, it } from "vitest";
import { formatBce, isValidBce, isValidIban, parseNiss, requiredDocuments } from "@/lib/belgium";

/** Construit un NISS valide (clé calculée) pour les tests. */
function niss(base9: string, after2000 = false) {
  const check = 97 - (Number(after2000 ? `2${base9}` : base9) % 97);
  return base9 + String(check).padStart(2, "0");
}

describe("registre national (NISS)", () => {
  it("accepte un numéro valide né au XXe siècle et en déduit la date", () => {
    expect(parseNiss(niss("850730033"))).toEqual({ valid: true, birthDate: "1985-07-30" });
  });
  it("accepte un numéro valide né après 2000", () => {
    expect(parseNiss(niss("040215123", true))).toEqual({ valid: true, birthDate: "2004-02-15" });
  });
  it("accepte les séparateurs usuels", () => {
    const n = niss("850730033");
    expect(parseNiss(`${n.slice(0, 2)}.${n.slice(2, 4)}.${n.slice(4, 6)}-${n.slice(6, 9)}.${n.slice(9)}`).valid).toBe(true);
  });
  it("refuse une clé fausse ou une longueur incorrecte", () => {
    const n = niss("850730033");
    const wrong = n.slice(0, 9) + String((Number(n.slice(9)) + 1) % 100).padStart(2, "0");
    expect(parseNiss(wrong).valid).toBe(false);
    expect(parseNiss("1234").valid).toBe(false);
  });
});

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
