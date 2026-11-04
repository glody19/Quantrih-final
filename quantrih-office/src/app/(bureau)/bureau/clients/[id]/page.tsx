import { notFound } from "next/navigation";
import { z } from "zod";
import { deleteHolding, setStepStatus } from "@/actions/bureau";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { AddHoldingForm, ResendInvitation } from "@/components/app/BureauForms";
import { HoldingsTable } from "@/components/app/HoldingsTable";
import { getRelationshipDetail } from "@/lib/bureau-data";
import { getHoldings, getSteps } from "@/lib/data";
import { stepStatusEnum } from "@/lib/db/schema";
import { dateTime, eur } from "@/lib/format";
import { STEP_STATUS_LABEL } from "@/lib/onboarding";
import { summarize } from "@/lib/portfolio";
import { requireStaff } from "@/lib/session";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const detail = await getRelationshipDetail(id.data);
  if (!detail) notFound();
  const [steps, rows] = await Promise.all([getSteps(id.data), getHoldings(id.data)]);
  const s = summarize(rows);
  return (
    <>
      <PageTitle eyebrow={`Relation · ${detail.rel.status}`} title={detail.rel.name}>
        <div className="text-right">
          <div className="text-sm text-slate">Patrimoine net</div>
          <div className="num serif text-3xl">{eur(s.net)}</div>
        </div>
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title="Onboarding">
          <ol className="divide-y divide-line">
            {steps.map((st) => (
              <li key={st.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-sm font-medium">{st.title}</div>
                  <div className="text-xs text-slate">
                    {st.owner} · {STEP_STATUS_LABEL[st.status]}
                    {st.updatedAt && ` · ${dateTime(st.updatedAt)}`}
                  </div>
                </div>
                <form action={setStepStatus} className="flex items-center gap-2">
                  <input type="hidden" name="relationshipId" value={id.data} />
                  <input type="hidden" name="key" value={st.key} />
                  <select name="status" defaultValue={st.status} className={`field !w-auto !py-1.5 text-xs ${st.status === "en_revue" ? "!border-navy" : ""}`} aria-label={`Statut de l'étape ${st.title}`}>
                    {stepStatusEnum.enumValues.map((v) => (
                      <option key={v} value={v}>
                        {STEP_STATUS_LABEL[v]}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-ghost !px-3 !py-1.5 text-xs">OK</button>
                </form>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate">Passer l&apos;étape « Activation » à « Terminé » active la relation.</p>
        </Card>

        <Card title="Membres et accès">
          <ul className="space-y-4">
            {detail.members.map((m) => (
              <li key={m.id} className="text-sm">
                <div className="font-medium">
                  {m.name} <span className="text-xs font-normal text-slate">· {m.role}</span>
                </div>
                <div className="text-xs text-slate">{m.email}</div>
                <div className="mt-1 text-xs">
                  {!m.activated ? (
                    <span className="text-gold-dark">Invitation en attente</span>
                  ) : !m.mfa ? (
                    <span className="text-gold-dark">Mot de passe créé, double authentification à activer</span>
                  ) : (
                    <span className="text-sage">Compte actif{m.lastLoginAt && ` · dernière connexion ${dateTime(m.lastLoginAt)}`}</span>
                  )}
                </div>
                {!m.activated && (
                  <div className="mt-2">
                    <ResendInvitation userId={m.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Patrimoine consolidé" className="mt-6">
        <AddHoldingForm relationshipId={id.data} />
        <div className="mt-6">
          {rows.length ? (
            <HoldingsTable
              rows={rows}
              action={(r) => (
                <form action={deleteHolding}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs text-slate hover:text-danger" aria-label={`Supprimer ${r.label}`}>
                    Supprimer
                  </button>
                </form>
              )}
            />
          ) : (
            <Empty>Aucun élément. Ajoutez les comptes, biens et dettes à partir des relevés du client.</Empty>
          )}
        </div>
      </Card>
    </>
  );
}
