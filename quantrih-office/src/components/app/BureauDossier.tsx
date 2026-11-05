import { Card, Empty } from "@/components/app/AppShell";
import { countryLabel, DOCUMENT_CATEGORIES, ENTITY_ROLES, LEGAL_FORMS, MARITAL_REGIMES, maskNiss, OBJECTIVES, PARTNER_CATEGORIES, PERSON_LINKS, SHARE_SCOPES, WEALTH_ORIGINS } from "@/lib/belgium";
import { dateTime, eur, longDate } from "@/lib/format";
import { getConsents, getDocuments, getEngagement, getEntities, getPersons, getStepData } from "@/lib/onboarding-data";

const L = (list: readonly { key: string; label: string }[], k: string | null | undefined) => list.find((x) => x.key === k)?.label ?? k ?? "—";

/** Vue du dossier d'onboarding pour le coordinateur (lecture seule). */
export async function BureauDossier({ relationshipId }: { relationshipId: string }) {
  const [people, companies, docs, cons, eng, profil, ident] = await Promise.all([
    getPersons(relationshipId),
    getEntities(relationshipId),
    getDocuments(relationshipId),
    getConsents(relationshipId),
    getEngagement(relationshipId),
    getStepData(relationshipId, "profil"),
    getStepData(relationshipId, "identite"),
  ]);
  const obj = (profil.data.objectifs ?? null) as { objectives: string[]; horizon: string; priorities: string | null; constraints: string | null } | null;
  const kyc = (ident.data.conformite ?? null) as { identityMethod: string; origins: string[]; originDetails: string; foreignTies: string | null; certifieLe: string } | null;
  const flags = [
    ...people.filter((p) => p.pep).map((p) => `${p.firstName} ${p.lastName} : PEP`),
    ...people.filter((p) => p.usPerson).map((p) => `${p.firstName} ${p.lastName} : US person (FATCA)`),
    ...people.filter((p) => p.taxResidence !== "BE").map((p) => `${p.firstName} ${p.lastName} : résidence fiscale ${countryLabel(p.taxResidence)}`),
    ...companies.filter((c) => c.country !== "BE").map((c) => `${c.name} : structure étrangère (${countryLabel(c.country)})`),
  ];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card title="Personnes et sociétés">
        {flags.length > 0 && (
          <ul className="mb-4 space-y-1 rounded-lg bg-[#FBF1DE] p-3 text-xs text-gold-dark">
            {flags.map((f) => (
              <li key={f}>⚑ {f} — vigilance renforcée</li>
            ))}
          </ul>
        )}
        {people.length || companies.length ? (
          <ul className="space-y-2 text-sm">
            {people.map((p) => (
              <li key={p.id}>
                <strong>
                  {p.firstName} {p.lastName}
                </strong>{" "}
                · {L(PERSON_LINKS, p.link)}
                <div className="text-xs text-slate">
                  {p.birthDate ? longDate(p.birthDate) : "date de naissance non renseignée"} · {p.nissLast4 ? `RN ${maskNiss(p.nissLast4)}` : "RN non communiqué"} · {countryLabel(p.nationality)} · {L(MARITAL_REGIMES, p.maritalRegime)}
                </div>
              </li>
            ))}
            {companies.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> · {L(LEGAL_FORMS, c.legalForm).split(" — ")[0]} · {L(ENTITY_ROLES, c.role)}
                <div className="text-xs text-slate">
                  {countryLabel(c.country)}
                  {c.bceNumber ? ` · BCE ${c.bceNumber}` : ""}
                  {c.ownership ? ` · ${c.ownership}` : ""}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Non renseigné.</Empty>
        )}
      </Card>

      <Card title="Objectifs et conformité">
        {obj ? (
          <div className="text-sm">
            <div>{obj.objectives.map((o) => L(OBJECTIVES, o)).join(" · ")}</div>
            <div className="text-xs text-slate">Horizon : {obj.horizon.replace("_", " à ").replace("moins à 5", "moins de 5")} ans</div>
            {obj.priorities && <p className="mt-2 whitespace-pre-line text-slate">{obj.priorities}</p>}
            {obj.constraints && <p className="mt-1 whitespace-pre-line text-slate">Contraintes : {obj.constraints}</p>}
          </div>
        ) : (
          <p className="text-sm text-slate">Objectifs non renseignés.</p>
        )}
        <div className="mt-4 border-t border-line pt-4 text-sm">
          {kyc ? (
            <>
              <div>Origine : {kyc.origins.map((o) => L(WEALTH_ORIGINS, o)).join(", ")}</div>
              <p className="mt-1 whitespace-pre-line text-slate">{kyc.originDetails}</p>
              {kyc.foreignTies && <p className="mt-1 text-slate">Liens étrangers : {kyc.foreignTies}</p>}
              <div className="mt-1 text-xs text-slate">
                Identification : {kyc.identityMethod === "itsme" ? "itsme" : "pièce d'identité"} · certifié le {dateTime(kyc.certifieLe)}
              </div>
            </>
          ) : (
            <p className="text-slate">Déclaration de conformité non remplie.</p>
          )}
        </div>
      </Card>

      <Card title={`Documents (${docs.length})`}>
        {docs.length ? (
          <ul className="divide-y divide-line text-sm">
            {docs.map((d) => (
              <li key={d.id} className="py-2">
                <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="font-medium underline-offset-4 hover:underline">
                  {d.fileName}
                </a>
                <div className="text-xs text-slate">
                  {L(DOCUMENT_CATEGORIES, d.category).split(" (")[0]} · {dateTime(d.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucun document.</Empty>
        )}
      </Card>

      <Card title="Lettre de mission et autorisations">
        {eng ? (
          <p className="text-sm">
            Signée par <strong>{eng.acceptedName}</strong> le {dateTime(eng.acceptedAt)} · {eng.version} · {eng.isConsumer ? "consommateur" : "entreprise"}
            <span className="block text-xs text-slate">
              Base déclarée {eur(Number(eng.declaredWealth))} · honoraire estimé {eur(Number(eng.annualFeeNet))} HTVA
              {eng.withdrawalUntil ? ` · rétractation possible jusqu'au ${longDate(eng.withdrawalUntil)}${eng.waivedWithdrawalStart ? " (démarrage anticipé demandé)" : ""}` : ""}
              {eng.ip ? ` · IP ${eng.ip}` : ""}
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate">Lettre de mission non signée.</p>
        )}
        <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {cons.length ? (
            cons.map((c) => (
              <li key={c.id} className={c.revokedAt ? "text-slate line-through" : ""}>
                {c.partnerName} <span className="text-xs text-slate">· {L(PARTNER_CATEGORIES, c.partnerCategory)}</span>
                <div className="text-xs text-slate">
                  {c.scopes.map((s) => L(SHARE_SCOPES, s)).join(", ")} · {c.revokedAt ? `révoquée le ${longDate(c.revokedAt)}` : `depuis le ${longDate(c.grantedAt)}`}
                </div>
              </li>
            ))
          ) : (
            <li className="text-slate">Aucune autorisation de partage.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
