import { acceptEngagement } from "@/actions/onboarding";
import { Card } from "@/components/app/AppShell";
import { ActionForm, Field } from "@/components/onboarding/ActionForm";
import { WITHDRAWAL_DAYS } from "@/lib/belgium";
import { getHoldings } from "@/lib/data";
import { ENGAGEMENT_VERSION, engagementClauses } from "@/lib/engagement";
import { computeFees } from "@/lib/fees";
import { dateTime, eur, longDate, percent } from "@/lib/format";
import { getEngagement } from "@/lib/onboarding-data";

export async function EngagementStep({ relationshipId, userName }: { relationshipId: string; userName: string }) {
  const [signed, rows] = await Promise.all([getEngagement(relationshipId), getHoldings(relationshipId)]);
  const declared = rows.filter((r) => r.value > 0).reduce((a, r) => a + r.value, 0);
  const fees = computeFees(declared);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card title={`Lettre de mission · version ${ENGAGEMENT_VERSION}`}>
        <div className="max-h-[480px] space-y-5 overflow-y-auto pr-2 text-sm leading-relaxed">
          {engagementClauses().map((c) => (
            <section key={c.title}>
              <h2 className="font-sans text-sm font-semibold">{c.title}</h2>
              <p className="mt-1 text-slate">{c.text}</p>
            </section>
          ))}
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="Estimation de vos honoraires">
          {declared > 0 ? (
            <>
              <div className="text-sm text-slate">Sur la base de votre inventaire déclaré ({eur(declared)})</div>
              <div className="num serif mt-1 text-3xl">{eur(fees.net)} HTVA / an</div>
              <div className="num text-sm text-slate">
                soit {eur(fees.gross)} TVAC · taux effectif {percent(fees.effectiveRate)}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate">Votre inventaire n&apos;est pas encore complété : l&apos;honoraire sera calculé sur la valorisation consolidée, selon la grille ci-contre.</p>
          )}
          <p className="mt-3 text-xs text-slate">Montant définitif établi sur la valorisation consolidée et vérifiée, communiqué avant toute facturation.</p>
        </Card>
        {signed ? (
          <Card title="Signée">
            <p className="text-sm">
              Signée par <strong>{signed.acceptedName}</strong> le {dateTime(signed.acceptedAt)} (version {signed.version}).
            </p>
            {signed.withdrawalUntil && (
              <p className="mt-3 text-sm text-slate">
                Vous pouvez vous rétracter sans frais ni motif jusqu&apos;au {longDate(signed.withdrawalUntil)}, en nous écrivant.
              </p>
            )}
          </Card>
        ) : (
          <Card title="Signer">
            <ActionForm action={acceptEngagement} relationshipId={relationshipId} submit="Signer la lettre de mission" resetOnSuccess={false}>
              <fieldset>
                <legend className="mb-2 text-sm text-slate">Vous signez</legend>
                <div className="space-y-2 text-sm">
                  <label className="flex items-start gap-2.5">
                    <input type="radio" name="isConsumer" value="oui" defaultChecked className="mt-1 accent-[#0F1E2E]" />
                    <span>À titre privé (consommateur)</span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input type="radio" name="isConsumer" value="non" className="mt-1 accent-[#0F1E2E]" />
                    <span>Pour le compte d&apos;une société (entreprise)</span>
                  </label>
                </div>
              </fieldset>
              <label className="mt-4 flex items-start gap-2.5 text-sm">
                <input type="checkbox" name="waiveStart" className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
                <span>Je demande que la mission commence avant la fin du délai de rétractation de {WITHDRAWAL_DAYS} jours (consommateur uniquement).</span>
              </label>
              <label className="mt-3 flex items-start gap-2.5 text-sm">
                <input type="checkbox" name="read" required className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
                <span>J&apos;ai lu et j&apos;accepte la lettre de mission.</span>
              </label>
              <Field label={`Signature : saisissez « ${userName} »`} className="mt-4">
                <input name="acceptedName" required className="field" autoComplete="off" />
              </Field>
              <p className="mt-3 text-xs text-slate">Signature électronique : la date, l&apos;heure, l&apos;adresse de connexion et la version du texte sont conservées comme preuve. La signature qualifiée (itsme / Yousign) sera proposée prochainement.</p>
            </ActionForm>
          </Card>
        )}
      </div>
    </div>
  );
}
