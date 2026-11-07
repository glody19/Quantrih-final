import { Card, PageTitle } from "@/components/app/AppShell";
import { DEMO_STEPS } from "@/lib/demo-data";
import { progress, STEP_STATUS_LABEL } from "@/lib/onboarding";

const TONE = { a_faire: "bg-sand text-slate", en_cours: "bg-[#FBF1DE] text-gold-dark", en_revue: "bg-[#E7EEF5] text-navy-soft", termine: "bg-[#E6EFE9] text-sage" } as const;

export default function DemoOnboarding() {
  const pct = progress(DEMO_STEPS.map((s) => s.status));
  return (
    <>
      <PageTitle eyebrow={`Ouverture du dossier · ${pct} %`} title="Mon onboarding" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-slate">
        Chaque étape s&apos;enregistre automatiquement. Quand une étape est complète, vous la transmettez : votre coordinateur la vérifie et la valide.
      </p>
      <ol className="space-y-3">
        {DEMO_STEPS.map((s, i) => (
          <li key={s.key}>
            <Card>
              <div className="flex gap-4">
                <div className={`num flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${s.status === "termine" ? "border-sage bg-sage text-white" : "border-line"}`}>
                  {s.status === "termine" ? "✓" : i + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-base font-semibold">{s.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${TONE[s.status]}`}>{STEP_STATUS_LABEL[s.status]}</span>
                    <span className="text-xs text-slate">· {s.owner === "Vous" ? "À vous" : "Chez Quantrih Office"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate">{s.description}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </>
  );
}
