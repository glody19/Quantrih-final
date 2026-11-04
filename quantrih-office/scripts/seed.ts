/**
 * Crée (ou met à jour) le compte administrateur à partir de ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 * Avec SEED_DEMO=1, ajoute une relation de démonstration « Famille Exemple » avec un patrimoine fictif.
 * À la première connexion, l'activation de la double authentification est exigée.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { ONBOARDING_STEPS } from "../src/lib/onboarding";

const { users, relationships, memberships, onboardingSteps, holdings } = schema;

async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!url || !email || !password) throw new Error("DATABASE_URL, ADMIN_EMAIL et ADMIN_PASSWORD sont requis.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD doit contenir au moins 12 caractères.");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle({ client, schema });
  const hash = await bcrypt.hash(password, 12);
  const name = process.env.ADMIN_NAME ?? "Administrateur";
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const admin = existing
    ? (await db.update(users).set({ role: "admin", active: true, passwordHash: hash }).where(eq(users.id, existing.id)).returning())[0]!
    : (await db.insert(users).values({ email, name, role: "admin", passwordHash: hash }).returning())[0]!;
  console.log(`Administrateur prêt : ${admin.email}`);

  if (process.env.SEED_DEMO === "1") {
    const demoEmail = "demo.client@quantrih-office.be";
    const [already] = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
    if (!already) {
      const [rel] = await db.insert(relationships).values({ name: "Famille Exemple", kind: "famille", advisorId: admin.id }).returning();
      const [u] = await db.insert(users).values({ email: demoEmail, name: "Claire Exemple", role: "client", passwordHash: hash }).returning();
      await db.insert(memberships).values({ userId: u!.id, relationshipId: rel!.id, role: "titulaire" });
      await db.insert(onboardingSteps).values(
        ONBOARDING_STEPS.map((s, i) => ({ relationshipId: rel!.id, key: s.key, status: (i < 2 ? "termine" : i === 2 ? "en_cours" : "a_faire") as "termine" | "en_cours" | "a_faire" })),
      );
      const d = new Date().toISOString().slice(0, 10);
      await db.insert(holdings).values([
        { relationshipId: rel!.id, label: "Compte-titres", category: "titres", institution: "Banque A", owner: "Claire Exemple", value: "2450000.00", valuedAt: d, source: "releve" },
        { relationshipId: rel!.id, label: "Mandat de gestion", category: "titres", institution: "Banque B", owner: "Exemple Holding SRL", value: "1380000.00", valuedAt: d, source: "releve" },
        { relationshipId: rel!.id, label: "Comptes courants et épargne", category: "liquidites", institution: "Banque A", owner: "Claire Exemple", value: "420000.00", valuedAt: d, source: "agregation" },
        { relationshipId: rel!.id, label: "Assurance-vie branche 23", category: "assurance_vie", institution: "Assureur C", owner: "Claire Exemple", value: "650000.00", valuedAt: d, source: "releve" },
        { relationshipId: rel!.id, label: "Résidence principale, Louvain-la-Neuve", category: "immobilier", owner: "Claire Exemple", value: "1150000.00", valuedAt: d, source: "expertise" },
        { relationshipId: rel!.id, label: "Immeuble de rapport, Bruxelles", category: "immobilier", owner: "Exemple Holding SRL", value: "980000.00", valuedAt: d, source: "declaratif" },
        { relationshipId: rel!.id, label: "Participation Exemple Industries", category: "participations", owner: "Exemple Holding SRL", value: "1600000.00", valuedAt: d, source: "declaratif" },
        { relationshipId: rel!.id, label: "Crédit hypothécaire", category: "autres", institution: "Banque A", owner: "Exemple Holding SRL", value: "-520000.00", valuedAt: d, source: "releve" },
      ]);
      console.log(`Démo créée : ${demoEmail} (même mot de passe que l'administrateur)`);
    }
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
