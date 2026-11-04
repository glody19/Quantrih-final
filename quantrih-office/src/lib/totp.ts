import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

/*
 * Double authentification par code à usage unique (TOTP, RFC 6238) : codes à 6 chiffres renouvelés
 * toutes les 30 secondes, compatibles avec Google Authenticator, Microsoft Authenticator, 1Password…
 */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string) {
  const clean = s.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(randomBytes(20));

function hotp(secret: string, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const off = h[h.length - 1]! & 15;
  const bin = ((h[off]! & 127) << 24) | (h[off + 1]! << 16) | (h[off + 2]! << 8) | h[off + 3]!;
  return String(bin % 1_000_000).padStart(6, "0");
}

/** Vérifie un code, en tolérant un décalage d'horloge de 30 secondes dans chaque sens. */
export function verifyTotp(secret: string, code: string, at = Date.now()) {
  const c = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  const step = Math.floor(at / 30_000);
  return [-1, 0, 1].some((d) => {
    const expected = Buffer.from(hotp(secret, step + d));
    return timingSafeEqual(expected, Buffer.from(c));
  });
}

export function otpauthUri(secret: string, account: string) {
  const label = encodeURIComponent(`Quantrih Office:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Quantrih Office")}&algorithm=SHA1&digits=6&period=30`;
}

/* ---------- Chiffrement de la clé en base (AES-256-GCM, clé dérivée du secret de l'application) ---------- */

function key(purpose: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant.");
  return Buffer.from(hkdfSync("sha256", secret, "quantrih-office", purpose, 32));
}

export function encryptText(plain: string, purpose = "totp") {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(purpose), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), data.toString("base64")].join(".");
}

export function decryptText(box: string, purpose = "totp") {
  const [v, iv, tag, data] = box.split(".");
  if (v !== "v1" || !iv || !tag || !data) throw new Error("Format chiffré inconnu.");
  const d = createDecipheriv("aes-256-gcm", key(purpose), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
}

export function encryptBuffer(buf: Buffer, purpose: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(purpose), iv);
  const data = Buffer.concat([c.update(buf), c.final()]);
  return Buffer.concat([Buffer.from("QOB1"), iv, c.getAuthTag(), data]);
}

export function decryptBuffer(buf: Buffer, purpose: string) {
  if (buf.subarray(0, 4).toString() !== "QOB1") throw new Error("Fichier non reconnu.");
  const d = createDecipheriv("aes-256-gcm", key(purpose), buf.subarray(4, 16));
  d.setAuthTag(buf.subarray(16, 32));
  return Buffer.concat([d.update(buf.subarray(32)), d.final()]);
}

/* ---------- Codes de secours ---------- */

const hashCode = (c: string) => createHash("sha256").update(`quantrih:${c.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`).digest("hex");

/** Dix codes de secours lisibles (XXXX-XXXX), et leurs empreintes à conserver en base. */
export function newRecoveryCodes() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes = Array.from({ length: 10 }, () => {
    const b = randomBytes(8);
    const s = Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
  return { codes, hashes: codes.map(hashCode) };
}

/** Si le code de secours est valide, renvoie la liste restante (sans lui) ; sinon null. */
export function consumeRecoveryCode(hashes: string[] | null, code: string) {
  if (!hashes?.length) return null;
  const h = hashCode(code);
  return hashes.includes(h) ? hashes.filter((x) => x !== h) : null;
}

/* ---------- Jeton d'étape : mot de passe validé, en attente du code (5 minutes) ---------- */

export function signChallenge(userId: string) {
  const exp = Date.now() + 5 * 60_000;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", key("challenge")).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readChallenge(token: string) {
  const [id, exp, sig] = token.split(".");
  if (!id || !exp || !sig) return null;
  const expected = createHmac("sha256", key("challenge")).update(`${id}.${exp}`).digest("base64url");
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  if (Number(exp) < Date.now()) return null;
  return id;
}
