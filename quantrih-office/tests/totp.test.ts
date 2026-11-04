import { beforeAll, describe, expect, it } from "vitest";
import { consumeRecoveryCode, decryptText, encryptText, newRecoveryCodes, newTotpSecret, readChallenge, signChallenge, verifyTotp } from "@/lib/totp";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-for-vitest-only-0123456789";
});

describe("double authentification", () => {
  it("chiffre et déchiffre la clé", () => {
    const s = newTotpSecret();
    expect(decryptText(encryptText(s))).toBe(s);
  });
  it("refuse un code mal formé", () => {
    expect(verifyTotp(newTotpSecret(), "abc")).toBe(false);
  });
  it("vérifie le code RFC 6238 de référence (SHA-1, T=59s)", () => {
    // Clé de test RFC 6238 : « 12345678901234567890 » en base32.
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(verifyTotp(secret, "287082", 59_000)).toBe(true);
  });
  it("les codes de secours ne servent qu'une fois", () => {
    const { codes, hashes } = newRecoveryCodes();
    const left = consumeRecoveryCode(hashes, codes[0]!);
    expect(left).toHaveLength(9);
    expect(consumeRecoveryCode(left, codes[0]!)).toBeNull();
  });
  it("le jeton d'étape est signé", () => {
    const t = signChallenge("user-1");
    expect(readChallenge(t)).toBe("user-1");
    expect(readChallenge(t.replace(/.$/, "x"))).toBeNull();
  });
});
