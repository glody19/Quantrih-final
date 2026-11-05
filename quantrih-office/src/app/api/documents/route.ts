import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessRelationship, getApiUser } from "@/lib/access";
import { audit } from "@/lib/audit";
import { DOCUMENT_CATEGORIES } from "@/lib/belgium";
import { getDb } from "@/lib/db";
import { documents, onboardingSteps } from "@/lib/db/schema";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, sniffMatches, storeDocument } from "@/lib/storage";

const fieldsSchema = z.object({
  relationshipId: z.uuid(),
  category: z.enum(DOCUMENT_CATEGORIES.map((c) => c.key) as [string, ...string[]]),
});

/** Dépôt d'un document : contrôle d'accès, type réel du fichier, taille, chiffrement, stockage privé. */
export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envoi illisible." }, { status: 400 });
  }
  const fields = fieldsSchema.safeParse({ relationshipId: form.get("relationshipId"), category: form.get("category") });
  const file = form.get("file");
  if (!fields.success || !(file instanceof File)) return NextResponse.json({ error: "Choisissez une catégorie et un fichier." }, { status: 400 });
  if (!(await canAccessRelationship(user, fields.data.relationshipId))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Le fichier doit faire moins de 4 Mo." }, { status: 400 });
  if (!ALLOWED_TYPES[file.type]) return NextResponse.json({ error: "Formats acceptés : PDF, JPG, PNG, HEIC, WEBP, DOCX, XLSX, CSV." }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffMatches(buf, file.type)) return NextResponse.json({ error: "Le contenu du fichier ne correspond pas à son format." }, { status: 400 });

  const stored = await storeDocument(fields.data.relationshipId, buf);
  const fileName = file.name.replace(/[^\p{L}\p{N} ._()-]/gu, "_").slice(0, 160) || `document.${ALLOWED_TYPES[file.type]}`;
  const [row] = await getDb()
    .insert(documents)
    .values({ relationshipId: fields.data.relationshipId, category: fields.data.category, fileName, contentType: file.type, size: file.size, sha256: stored.sha256, storageKey: stored.storageKey, uploadedBy: user.id })
    .returning({ id: documents.id });
  // Premier dépôt : l'étape « Documents » passe à « en cours ».
  await getDb()
    .update(onboardingSteps)
    .set({ status: "en_cours", updatedAt: new Date() })
    .where(and(eq(onboardingSteps.relationshipId, fields.data.relationshipId), eq(onboardingSteps.key, "documents"), eq(onboardingSteps.status, "a_faire")));
  await audit(user.id, "document.depose", { relationshipId: fields.data.relationshipId, target: row!.id, details: { category: fields.data.category, size: file.size } });
  return NextResponse.json({ ok: true, id: row!.id });
}
