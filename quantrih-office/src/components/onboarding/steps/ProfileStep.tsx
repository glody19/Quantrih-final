import { addEntity, addPerson, deleteEntity, deletePerson, saveObjectives } from "@/actions/onboarding";
import { Card, Empty } from "@/components/app/AppShell";
import { ActionForm, Checks, Field, Select } from "@/components/onboarding/ActionForm";
import { COUNTRIES, countryLabel, ENTITY_ROLES, LEGAL_FORMS, MARITAL_REGIMES, OBJECTIVES, PERSON_LINKS } from "@/lib/belgium";
import { longDate } from "@/lib/format";
import { getEntities, getPersons, getStepData } from "@/lib/onboarding-data";

const label = (list: readonly { key: string; label: string }[], k: string | null) => list.find((x) => x.key === k)?.label ?? k ?? "—";

export async function ProfileStep({ relationshipId }: { relationshipId: string; userName: string }) {
  const [people, companies, step] = await Promise.all([getPersons(relationshipId), getEntities(relationshipId), getStepData(relationshipId, "profil")]);
  const obj = (step.data.objectifs ?? {}) as { objectives?: string[]; horizon?: string; priorities?: string | null; constraints?: string | null };
  return (
    <div className="space-y-6">
      <Card title="1. Les personnes">
        <p className="mb-5 text-sm text-slate">Vous-même et les membres de la famille concernés par la mission (conjoint, enfants…).</p>
        {people.length ? (
          <ul className="mb-6 divide-y divide-line rounded-xl border border-line bg-white">
            {people.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {p.firstName} {p.lastName} <span className="font-normal text-slate">· {label(PERSON_LINKS, p.link)}</span>
                    {p.pep && <span className="ml-2 rounded-full bg-[#FBF1DE] px-2 py-0.5 text-xs text-gold-dark">PEP</span>}
                  </div>
                  <div className="text-xs text-slate">
                    {p.birthDate ? `Né(e) le ${longDate(p.birthDate)} · ` : ""}
                    Résidence fiscale : {countryLabel(p.taxResidence)} · {label(MARITAL_REGIMES, p.maritalRegime)}
                  </div>
                </div>
                <form action={deletePerson}>
                  <input type="hidden" name="relationshipId" value={relationshipId} />
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-xs text-slate hover:text-danger">Retirer</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mb-6">
            <Empty>Commencez par vous ajouter vous-même.</Empty>
          </div>
        )}
        <details className="rounded-xl border border-line p-4" open={!people.length}>
          <summary className="cursor-pointer text-sm font-semibold">Ajouter une personne</summary>
          <ActionForm action={addPerson} relationshipId={relationshipId} submit="Ajouter la personne" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom">
                <input name="firstName" required className="field" autoComplete="given-name" />
              </Field>
              <Field label="Nom">
                <input name="lastName" required className="field" autoComplete="family-name" />
              </Field>
              <Field label="Lien">
                <Select name="link" options={PERSON_LINKS} defaultValue={people.length ? "conjoint" : "titulaire"} />
              </Field>
              <Field label="Date de naissance">
                <input name="birthDate" type="date" className="field" />
              </Field>
              <Field label="Situation familiale">
                <Select name="maritalRegime" options={MARITAL_REGIMES} />
              </Field>
              <Field label="Nationalité">
                <Select name="nationality" options={COUNTRIES} defaultValue="BE" />
              </Field>
              <Field label="Résidence fiscale">
                <Select name="taxResidence" options={COUNTRIES} defaultValue="BE" />
              </Field>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <label className="flex items-start gap-2.5">
                <input type="checkbox" name="pep" className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
                <span>
                  Personne politiquement exposée (PEP) : exerce ou a exercé, au cours des 12 derniers mois, une fonction publique importante (ministre, parlementaire, magistrat de haut rang, dirigeant d&apos;entreprise publique…), ou en est un proche.
                </span>
              </label>
              <label className="flex items-start gap-2.5">
                <input type="checkbox" name="usPerson" className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
                <span>Citoyen(ne) ou résident(e) fiscal(e) des États-Unis (FATCA).</span>
              </label>
            </div>
          </ActionForm>
        </details>
      </Card>

      <Card title="2. Les sociétés et structures">
        <p className="mb-5 text-sm text-slate">Holdings, sociétés de management, sociétés immobilières, fondations… en Belgique ou à l&apos;étranger. Passez cette partie si vous n&apos;en détenez pas.</p>
        {companies.length > 0 && (
          <ul className="mb-6 divide-y divide-line rounded-xl border border-line bg-white">
            {companies.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {c.name} <span className="font-normal text-slate">· {label(LEGAL_FORMS, c.legalForm).split(" — ")[0]}</span>
                  </div>
                  <div className="text-xs text-slate">
                    {label(ENTITY_ROLES, c.role)} · {countryLabel(c.country)}
                    {c.bceNumber ? ` · BCE ${c.bceNumber}` : ""}
                    {c.ownership ? ` · ${c.ownership}` : ""}
                  </div>
                </div>
                <form action={deleteEntity}>
                  <input type="hidden" name="relationshipId" value={relationshipId} />
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs text-slate hover:text-danger">Retirer</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">Ajouter une société ou une structure</summary>
          <ActionForm action={addEntity} relationshipId={relationshipId} submit="Ajouter la société" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dénomination">
                <input name="name" required className="field" />
              </Field>
              <Field label="Forme juridique">
                <Select name="legalForm" options={LEGAL_FORMS} />
              </Field>
              <Field label="Pays du siège">
                <Select name="country" options={COUNTRIES} defaultValue="BE" />
              </Field>
              <Field label="Numéro d'entreprise (BCE)" hint="Obligatoire pour une société belge : 0123.456.789">
                <input name="bceNumber" inputMode="numeric" placeholder="0123.456.789" className="field num" />
              </Field>
              <Field label="Rôle">
                <Select name="role" options={ENTITY_ROLES} />
              </Field>
              <Field label="Détention (facultatif)" hint="Ex. : 100 % par Claire Dupont ; 60/40 avec mon associé">
                <input name="ownership" className="field" />
              </Field>
            </div>
          </ActionForm>
        </details>
      </Card>

      <Card title="3. Vos objectifs">
        <ActionForm action={saveObjectives} relationshipId={relationshipId} submit="Enregistrer mes objectifs" resetOnSuccess={false}>
          <fieldset>
            <legend className="mb-2 text-sm text-slate">Ce qui compte le plus pour vous</legend>
            <Checks name="objectives" options={OBJECTIVES} defaultValues={obj.objectives ?? []} />
          </fieldset>
          <Field label="Horizon de votre projet patrimonial" className="mt-5">
            <Select
              name="horizon"
              defaultValue={obj.horizon ?? "10_20"}
              options={[
                { key: "moins_5", label: "Moins de 5 ans" },
                { key: "5_10", label: "5 à 10 ans" },
                { key: "10_20", label: "10 à 20 ans" },
                { key: "plus_20", label: "Plus de 20 ans" },
                { key: "generations", label: "Plusieurs générations" },
              ]}
            />
          </Field>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Vos priorités pour les 12 prochains mois">
              <textarea name="priorities" rows={4} className="field" defaultValue={obj.priorities ?? ""} />
            </Field>
            <Field label="Contraintes ou inquiétudes (facultatif)">
              <textarea name="constraints" rows={4} className="field" defaultValue={obj.constraints ?? ""} placeholder="Ex. : besoin de liquidités, enfant à l'étranger, entreprise à céder…" />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
