"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { onboardingSteps } from "@/lib/db/schema";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { assertMember, requireClient } from "@/lib/session";

const CLIENT_STEPS = ONBOARDING_STEPS.filter((s) => s.owner === "Vous").map((s) => s.key) as string[];

/** Le client démarre une étape ou la transmet pour revue. Il ne peut jamais la marquer « terminée ». */
export async function clientStep(formData: FormData) {
  const user = await requireClient();
  const relationshipId = z.uuid().parse(formData.get("relationshipId"));
  const key = z.string().refine((k) => CLIENT_STEPS.includes(k)).parse(formData.get("key"));
  const status = z.enum(["en_cours", "en_revue"]).parse(formData.get("status"));
  await assertMember(user.id, relationshipId);
  await getDb()
    .update(onboardingSteps)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(onboardingSteps.relationshipId, relationshipId), eq(onboardingSteps.key, key), ne(onboardingSteps.status, "termine")));
  await audit(user.id, "onboarding.client", { relationshipId, details: { key, status } });
  revalidatePath("/espace");
  revalidatePath("/espace/onboarding");
}
