import Link from "next/link";
import { notFound } from "next/navigation";
import { clientStep } from "@/actions/espace";
import { Empty } from "@/components/app/AppShell";
import { AuthorizationsStep } from "@/components/onboarding/steps/AuthorizationsStep";
import { ComplianceStep } from "@/components/onboarding/steps/ComplianceStep";
import { DocumentsStep } from "@/components/onboarding/steps/DocumentsStep";
import { EngagementStep } from "@/components/onboarding/steps/EngagementStep";
import { InventoryStep } from "@/components/onboarding/steps/InventoryStep";
import { ProfileStep } from "@/components/onboarding/steps/ProfileStep";
import { getClientContext } from "@/lib/client-context";
import { getSteps } from "@/lib/data";
import { ONBOARDING_STEPS, STEP_STATUS_LABEL } from "@/lib/onboarding";

const VIEWS = {
  lettre_mission: EngagementStep,
  identite: ComplianceStep,
  profil: ProfileStep,
  patrimoine: InventoryStep,
  documents: DocumentsStep,
  autorisations: AuthorizationsStep,
} as const;

export default async function StepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const View = VIEWS[step as keyof typeof VIEWS];
  if (!View) notFound();
  const { user, relationship } = await getClientContext();
  if (!relationship) return <Empty>Aucun dossier n&apos;est encore ouvert.</Empty>;
  const steps = await getSteps(relationship.id);
  const index = ONBOARDING_STEPS.findIndex((s) => s.key === step);
  const current = steps[index]!;
  const clientSteps = steps.filter((s) => s.key in VIEWS);
  const pos = clientSteps.findIndex((s) => s.key === step);
  const prev = clientSteps[pos - 1];
  const next = clientSteps[pos + 1];
  const locked = current.status === "en_revue" || current.status === "termine";

  return (
    <>
      <nav className="mb-6 text-sm text-slate" aria-label="Fil d'Ariane">
        <Link href="/espace/onboarding" className="hover:text-navy">
          Mon onboarding
        </Link>{" "}
        / Étape {index + 1}
      </nav>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">
            Étape {index + 1} sur {ONBOARDING_STEPS.length} · {STEP_STATUS_LABEL[current.status]}
          </div>
          <h1 className="mt-2 text-[2.2rem] leading-tight md:text-[2.6rem]">{current.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">{current.description}</p>
        </div>
      </div>

      {locked && current.key !== "lettre_mission" && (
        <p className="mb-6 rounded-lg bg-[#E7EEF5] px-4 py-3 text-sm text-navy-soft">
          {current.status === "en_revue" ? "Cette étape est en cours de vérification par votre coordinateur. Vous pouvez encore la consulter et la compléter." : "Cette étape a été validée."}
        </p>
      )}

      <View relationshipId={relationship.id} userName={user.name} />

      <div className="mt-10 flex flex-col-reverse justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          {prev && (
            <Link href={`/espace/onboarding/${prev.key}`} className="btn btn-ghost">
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link href={`/espace/onboarding/${next.key}`} className="btn btn-ghost">
              {next.title} →
            </Link>
          )}
        </div>
        {current.key !== "lettre_mission" && current.status === "en_cours" && (
          <form action={clientStep}>
            <input type="hidden" name="relationshipId" value={relationship.id} />
            <input type="hidden" name="key" value={current.key} />
            <input type="hidden" name="status" value="en_revue" />
            <button className="btn btn-gold">Étape complète : transmettre pour revue</button>
          </form>
        )}
      </div>
    </>
  );
}
