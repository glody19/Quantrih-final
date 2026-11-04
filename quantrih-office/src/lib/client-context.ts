import "server-only";
import { cache } from "react";
import { getClientRelationships, requireClient } from "@/lib/session";

/** Client connecté et sa relation principale (sélecteur multi-relations : plus tard). */
export const getClientContext = cache(async () => {
  const user = await requireClient();
  const rels = await getClientRelationships(user.id);
  return { user, relationship: rels[0] ?? null, relationships: rels };
});
