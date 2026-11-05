import { saveCompliance } from "@/actions/onboarding";
import { Card } from "@/components/app/AppShell";
import { ActionForm, Checks, Field } from "@/components/onboarding/ActionForm";
import { WEALTH_ORIGINS } from "@/lib/belgium";
import { dateTime } from "@/lib/format";
import { getStepData } from "@/lib/onboarding-data";

type Compliance = { identityMethod?: string; origins?: string[]; originDetails?: string; foreignTies?: string | null; certifieLe?: string };

export async function ComplianceStep({ relationshipId }: { relationshipId: string; userName: string }) {
  const step = await getStepData(relationshipId, "identite");
  const c = (step.data.conformite ?? {}) as Compliance;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card title="Votre déclaration">
        <ActionForm action={saveCompliance} relationshipId={relationshipId} submit="Enregistrer ma déclaration" resetOnSuccess={false}>
          <fieldset>
            <legend className="mb-2 text-sm text-slate">Comment souhaitez-vous confirmer votre identité ?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["itsme", "Avec itsme", "Le plus rapide : confirmation depuis votre smartphone (disponible prochainement)."],
                ["eid", "Avec ma carte d'identité", "Déposez le recto et le verso de votre eID ou passeport à l'étape « Documents »."],
              ].map(([k, t, d]) => (
                <label key={k} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-white p-3 text-sm has-[:checked]:border-navy">
                  <input type="radio" name="identityMethod" value={k} defaultChecked={c.identityMethod ? c.identityMethod === k : k === "eid"} className="mt-1 accent-[#0F1E2E]" />
                  <span>
                    <span className="block font-medium">{t}</span>
                    <span className="text-xs text-slate">{d}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm text-slate">D&apos;où provient principalement votre patrimoine ?</legend>
            <Checks name="origins" options={WEALTH_ORIGINS} defaultValues={c.origins ?? []} />
          </fieldset>
          <Field label="Décrivez l'origine principale en quelques phrases" className="mt-5" hint="Ex. : cession en 2021 de ma société d'ingénierie, dividendes de ma holding, succession de mes parents en 2018…">
            <textarea name="originDetails" rows={4} required className="field" defaultValue={c.originDetails ?? ""} />
          </Field>
          <Field label="Liens avec d'autres pays (facultatif)" className="mt-4" hint="Comptes, biens, résidence ou activité hors de Belgique.">
            <textarea name="foreignTies" rows={2} className="field" defaultValue={c.foreignTies ?? ""} />
          </Field>
          <label className="mt-5 flex items-start gap-2.5 text-sm">
            <input type="checkbox" name="declaration" required className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
            <span>Je certifie que ces informations sont exactes et complètes, et je m&apos;engage à signaler tout changement.</span>
          </label>
        </ActionForm>
        {c.certifieLe && <p className="mt-4 text-xs text-slate">Dernière déclaration certifiée le {dateTime(c.certifieLe)}.</p>}
      </Card>
      <Card title="Pourquoi ces questions ?">
        <div className="space-y-3 text-sm leading-relaxed text-slate">
          <p>
            La loi belge du 18 septembre 2017 relative à la prévention du blanchiment de capitaux impose aux professionnels du patrimoine (banques, notaires, avocats, experts-comptables…) de connaître leurs clients et l&apos;origine des fonds.
          </p>
          <p>En réunissant ces informations une seule fois, nous vous évitons de les fournir à chacun de vos interlocuteurs : elles ne leur sont transmises qu&apos;avec votre autorisation.</p>
          <p>Le statut de personne politiquement exposée (PEP) et les liens avec les États-Unis (FATCA) se déclarent pour chaque personne, à l&apos;étape « Profil et objectifs ».</p>
        </div>
      </Card>
    </div>
  );
}
