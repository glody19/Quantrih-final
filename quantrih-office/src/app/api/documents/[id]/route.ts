import { eq } from "drizzle-orm";
import { canAccessRelationship, getApiUser } from "@/lib/access";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { readDocument } from "@/lib/storage";

/** Téléchargement : contrôle d'accès, déchiffrement, et chaque consultation est tracée. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return new Response("Non authentifié.", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Introuvable.", { status: 404 });
  const [doc] = await getDb().select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc || !(await canAccessRelationship(user, doc.relationshipId))) return new Response("Introuvable.", { status: 404 });

  const data = await readDocument(doc.storageKey);
  await audit(user.id, "document.consulte", { relationshipId: doc.relationshipId, target: doc.id });
  const inline = /^(application\/pdf|image\/(jpeg|png|webp))$/.test(doc.contentType);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Length": String(data.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; object-src 'self'",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
