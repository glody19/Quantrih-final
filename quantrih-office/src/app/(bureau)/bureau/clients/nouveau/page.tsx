import { eq } from "drizzle-orm";
import { z } from "zod";
import { Card, PageTitle } from "@/components/app/AppShell";
import { NewClientForm } from "@/components/app/BureauForms";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { requireStaff } from "@/lib/session";

export default async function NouveauClient({ searchParams }: { searchParams: Promise<{ prospect?: string }> }) {
  await requireStaff();
  const { prospect } = await searchParams;
  const id = z.uuid().safeParse(prospect);
  const [lead] = id.success ? await getDb().select().from(leads).where(eq(leads.id, id.data)).limit(1) : [];
  return (
    <>
      <PageTitle eyebrow="Relations clients" title="Nouvelle relation client" />
      <Card>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-slate">
          La relation regroupe une personne seule, un foyer ou une famille. Le titulaire reçoit un lien d&apos;invitation valable 72 heures pour créer son mot de passe et activer la double authentification. Les 8 étapes d&apos;onboarding sont créées automatiquement.
        </p>
        <NewClientForm lead={lead ? { id: lead.id, name: lead.name, email: lead.email, profile: lead.profile } : undefined} />
      </Card>
    </>
  );
}
