import { addClientHolding, deleteClientHolding } from "@/actions/onboarding";
import { Card, Empty } from "@/components/app/AppShell";
import { ActionForm, Field } from "@/components/onboarding/ActionForm";
import { CATEGORY_LABEL } from "@/lib/content";
import { getHoldings } from "@/lib/data";
import { eur } from "@/lib/format";
import { getEntities, getPersons } from "@/lib/onboarding-data";
import { summarize } from "@/lib/portfolio";

/** Aide à la saisie : exemples concrets du marché belge pour chaque catégorie. */
const GUIDE: { key: keyof typeof CATEGORY_LABEL; examples: string }[] = [
  { key: "liquidites", examples: "Comptes à vue, comptes d'épargne réglementés, comptes à terme" },
  { key: "titres", examples: "Comptes-titres, mandats de gestion, fonds, actions, obligations" },
  { key: "assurance_vie", examples: "Branche 21, branche 23, branche 26, branche 44" },
  { key: "pension", examples: "Épargne-pension, épargne à long terme, EIP, PLCI, assurance groupe" },
  { key: "immobilier", examples: "Résidence principale, secondes résidences, biens de rapport, terrains" },
  { key: "participations", examples: "Parts de votre société, holding, participations minoritaires" },
  { key: "private_equity", examples: "Fonds de private equity, investissements dans des start-up" },
  { key: "actifs_passion", examples: "Art, voitures de collection, vins, bijoux" },
  { key: "dettes", examples: "Crédits hypothécaires, crédits d'investissement, comptes courants d'associé" },
];

export async function InventoryStep({ relationshipId }: { relationshipId: string; userName: string }) {
  const [rows, people, companies] = await Promise.all([getHoldings(relationshipId), getPersons(relationshipId), getEntities(relationshipId)]);
  const s = summarize(rows);
  const owners = [...people.map((p) => `${p.firstName} ${p.lastName}`), ...companies.map((c) => c.name)];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Actifs déclarés", eur(s.assets)],
          ["Dettes", eur(s.debts)],
          ["Patrimoine net", eur(s.net)],
        ].map(([l, v]) => (
          <div key={l} className="card p-5">
            <div className="text-sm text-slate">{l}</div>
            <div className="num serif mt-1 text-3xl">{v}</div>
          </div>
        ))}
      </div>

      <Card title="Ajouter un élément">
        <p className="mb-4 text-sm text-slate">Une estimation suffit : votre coordinateur remplacera ensuite vos montants par les valeurs des relevés. Rien n&apos;est communiqué à un tiers sans votre accord.</p>
        <ActionForm action={addClientHolding} relationshipId={relationshipId} submit="Ajouter">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie">
              <select name="category" className="field">
                {GUIDE.map((g) => (
                  <option key={g.key} value={g.key}>
                    {CATEGORY_LABEL[g.key]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" hint="Ex. : Compte-titres, Appartement à Uccle, Branche 23">
              <input name="label" required className="field" />
            </Field>
            <Field label="Montant estimé (€)" hint="Pour une dette : le capital restant dû, sans signe moins.">
              <input name="value" required inputMode="decimal" placeholder="250 000" className="field num" />
            </Field>
            <Field label="Banque, assureur ou établissement (facultatif)">
              <input name="institution" className="field" placeholder="Ex. : BNP Paribas Fortis, Belfius, AG Insurance…" />
            </Field>
            <Field label="Titulaire (facultatif)" className="sm:col-span-2">
              <input name="owner" className="field" list="owners" placeholder="Personne ou société" />
              <datalist id="owners">
                {owners.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
          </div>
        </ActionForm>
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer text-slate">Que mettre dans chaque catégorie ?</summary>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {GUIDE.map((g) => (
              <div key={g.key} className="rounded-lg bg-ivory p-3">
                <dt className="font-medium">{CATEGORY_LABEL[g.key]}</dt>
                <dd className="text-xs text-slate">{g.examples}</dd>
              </div>
            ))}
          </dl>
        </details>
      </Card>

      <Card title="Votre inventaire">
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{r.label}</div>
                  <div className="text-xs text-slate">
                    {CATEGORY_LABEL[r.category]}
                    {r.institution ? ` · ${r.institution}` : ""}
                    {r.owner ? ` · ${r.owner}` : ""} · {r.source === "declaratif" ? "votre estimation" : "valeur vérifiée"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`num font-medium ${r.value < 0 ? "text-danger" : ""}`}>{eur(r.value)}</span>
                  {r.source === "declaratif" && (
                    <form action={deleteClientHolding}>
                      <input type="hidden" name="relationshipId" value={relationshipId} />
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-slate hover:text-danger">Retirer</button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Votre inventaire est vide. Ajoutez vos comptes, biens et contrats un par un.</Empty>
        )}
      </Card>
    </div>
  );
}
