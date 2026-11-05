import { grantConsent, revokeConsent } from "@/actions/onboarding";
import { Card, Empty } from "@/components/app/AppShell";
import { ActionForm, Checks, Field, Select } from "@/components/onboarding/ActionForm";
import { PARTNER_CATEGORIES, SHARE_SCOPES } from "@/lib/belgium";
import { longDate } from "@/lib/format";
import { getConsents } from "@/lib/onboarding-data";

const cat = (k: string) => PARTNER_CATEGORIES.find((c) => c.key === k)?.label ?? k;
const scope = (k: string) => SHARE_SCOPES.find((c) => c.key === k)?.label ?? k;

export async function AuthorizationsStep({ relationshipId }: { relationshipId: string; userName: string }) {
  const rows = await getConsents(relationshipId);
  const active = rows.filter((r) => !r.revokedAt);
  const revoked = rows.filter((r) => r.revokedAt);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <Card title="Vos autorisations actives">
          {active.length ? (
            <ul className="divide-y divide-line">
              {active.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <div className="font-medium">{r.partnerName}</div>
                    <div className="text-xs text-slate">{cat(r.partnerCategory)}</div>
                    <div className="mt-1 text-xs">{r.scopes.map(scope).join(" · ")}</div>
                    <div className="text-xs text-slate">Depuis le {longDate(r.grantedAt)}</div>
                  </div>
                  <form action={revokeConsent}>
                    <input type="hidden" name="relationshipId" value={relationshipId} />
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-ghost !px-3 !py-1.5 text-xs">Révoquer</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Aucune autorisation. Sans votre accord, nous n&apos;échangeons aucune information avec un tiers.</Empty>
          )}
          {revoked.length > 0 && (
            <details className="mt-4 text-sm text-slate">
              <summary className="cursor-pointer">Autorisations révoquées ({revoked.length})</summary>
              <ul className="mt-2 space-y-1 text-xs">
                {revoked.map((r) => (
                  <li key={r.id}>
                    {r.partnerName} — révoquée le {longDate(r.revokedAt!)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>
        <Card title="Autoriser un professionnel">
          <ActionForm action={grantConsent} relationshipId={relationshipId} submit="Donner mon autorisation">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type de professionnel">
                <Select name="partnerCategory" options={PARTNER_CATEGORIES} />
              </Field>
              <Field label="Nom" hint="Établissement, cabinet ou personne">
                <input name="partnerName" required className="field" placeholder="Ex. : Étude notariale Dupont, Wavre" />
              </Field>
            </div>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm text-slate">Informations que nous pouvons partager</legend>
              <Checks name="scopes" options={SHARE_SCOPES} />
            </fieldset>
          </ActionForm>
        </Card>
      </div>
      <Card title="Vos droits">
        <div className="space-y-3 text-sm leading-relaxed text-slate">
          <p>Vous décidez, professionnel par professionnel, quelles informations peuvent être échangées. Vous pouvez révoquer une autorisation à tout moment : elle cesse immédiatement de s&apos;appliquer.</p>
          <p>Ajoutez ici vos interlocuteurs actuels (votre banque, votre notaire, votre comptable). Les partenaires que nous vous proposerons ensuite seront soumis à la même règle.</p>
          <p>Ces autorisations sont conservées comme preuve de votre consentement (RGPD, art. 7). Vous pouvez aussi exercer vos droits d&apos;accès, de rectification et d&apos;effacement auprès de nous, ou introduire une réclamation auprès de l&apos;Autorité de protection des données.</p>
        </div>
      </Card>
    </div>
  );
}
