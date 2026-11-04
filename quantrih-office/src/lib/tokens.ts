import { createHash, randomBytes } from "node:crypto";

/** Jeton d'invitation : 32 octets aléatoires ; seule l'empreinte est stockée en base. */
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const INVITATION_HOURS = 72;
