import { clientStep } from "@/actions/espace";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { getClientContext } from "@/lib/client-context";
import { getSteps } from "@/lib/data";
import { progress, STEP_STATUS_LABEL } from "@/lib/onboarding";

const TONE = { a_faire: "bg-sand text-slate", en_cours: "bg-[#FBF1DE] text-gold-dark", en_revue: "bg-[#E7EEF5] text-navy-soft", termine: "bg-[#E6EFE9] text-sage" } as const;

export default async function Onboarding() {
  const { relationship } = await getClientContext();
  if (!relationship) return <Empty>Aucun dossier n&apos;est encore ouvert.</Empty>;
  const steps = await getSteps(relationship.id);
  const pct = progress(steps.map((s) => s.status));
  return (
    <>
      <PageTitle eyebrow="Ouverture de votre dossier" title="Mon onboarding">
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm">
            <span className="text-slate">Progression</span>
            <span className="num font-semibold">{pct} %</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </PageTitle>
      <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-slate">
        Vous pouvez avancer à votre rythme : chaque étape est enregistrée. Quand une étape est complète, transmettez-la : votre coordinateur la vérifie et la valide.
      </p>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.key}>
            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className={`num flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${s.status === "termine" ? "border-sage bg-sage text-white" : "border-line"}`}>
                  {s.status === "termine" ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-base font-semibold">{s.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${TONE[s.status]}`}>{STEP_STATUS_LABEL[s.status]}</span>
                    <span className="text-xs text-slate">· {s.owner === "Vous" ? "À vous" : "Chez Quantrih Office"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate">{s.description}</p>
                </div>
                {s.owner === "Vous" && (s.status === "a_faire" || s.status === "en_cours") && (
                  <form action={clientStep} className="shrink-0">
                    <input type="hidden" name="relationshipId" value={relationship.id} />
                    <input type="hidden" name="key" value={s.key} />
                    <input type="hidden" name="status" value={s.status === "a_faire" ? "en_cours" : "en_revue"} />
                    <button className={`btn ${s.status === "a_faire" ? "btn-ghost" : "btn-primary"}`}>{s.status === "a_faire" ? "Commencer" : "Transmettre pour revue"}</button>
                  </form>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-slate">Les formulaires détaillés de chaque étape (signature électronique, vérification d&apos;identité, inventaire guidé, dépôt de documents) arrivent dans la prochaine version.</p>
    </>
  );
}
