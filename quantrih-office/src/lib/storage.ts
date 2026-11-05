import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { decryptBuffer, encryptBuffer } from "@/lib/totp";

/*
 * Stockage des documents clients.
 * Chaque fichier est chiffré par l'application (AES-256-GCM) AVANT d'être envoyé : même le prestataire de stockage
 * ne voit que des octets illisibles. En production : Vercel Blob privé (région fra1). En local : dossier .storage/.
 */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // limite d'une requête sur Vercel (4,5 Mo)
export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
};

const PURPOSE = "document";
const blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const localDir = () => path.join(process.cwd(), ".storage");

/** Vérifie la signature réelle du fichier, pas seulement son type déclaré. */
export function sniffMatches(buf: Buffer, type: string) {
  const head = buf.subarray(0, 12);
  if (type === "application/pdf") return head.subarray(0, 5).toString() === "%PDF-";
  if (type === "image/jpeg") return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (type === "image/png") return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/webp") return head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
  if (type === "image/heic") return head.subarray(4, 8).toString() === "ftyp";
  if (type.includes("openxmlformats")) return head[0] === 0x50 && head[1] === 0x4b; // archive ZIP
  if (type === "text/csv") return !buf.subarray(0, 4096).includes(0);
  return false;
}

export async function storeDocument(relationshipId: string, buf: Buffer) {
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const sealed = encryptBuffer(buf, PURPOSE);
  const key = `documents/${relationshipId}/${randomUUID()}.bin`;
  if (blobEnabled()) {
    const res = await put(key, sealed, { access: "private", contentType: "application/octet-stream", addRandomSuffix: false });
    return { storageKey: res.pathname, sha256 };
  }
  const file = path.join(localDir(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, sealed);
  return { storageKey: key, sha256 };
}

export async function readDocument(storageKey: string) {
  if (!/^documents\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.bin$/.test(storageKey)) throw new Error("Clé de stockage invalide.");
  let sealed: Buffer;
  if (blobEnabled()) {
    const res = await get(storageKey, { access: "private" });
    if (!res || res.statusCode !== 200 || !res.stream) throw new Error("Fichier indisponible.");
    sealed = Buffer.from(await new Response(res.stream).arrayBuffer());
  } else {
    sealed = await readFile(path.join(localDir(), storageKey));
  }
  return decryptBuffer(sealed, PURPOSE);
}

export async function deleteStored(storageKey: string) {
  if (blobEnabled()) await del(storageKey);
}
