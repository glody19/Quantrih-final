import "server-only";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

/** Trace une action sensible : qui, quoi, sur quelle relation, depuis quelle adresse. */
export async function audit(actorId: string | null, action: string, opts: { target?: string; relationshipId?: string; details?: Record<string, unknown> } = {}) {
  let ip: string | null = null;
  try {
    ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  } catch {
    ip = null;
  }
  await getDb().insert(auditLog).values({ actorId, action, target: opts.target, relationshipId: opts.relationshipId, details: opts.details, ip });
}
