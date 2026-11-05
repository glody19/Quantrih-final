import { deleteClientDocument } from "@/actions/onboarding";
import { Card } from "@/components/app/AppShell";
import { DocumentUpload } from "@/components/onboarding/DocumentUpload";
import { DOCUMENT_CATEGORIES, requiredDocuments } from "@/lib/belgium";
import { getHoldings } from "@/lib/data";
import { dateTime } from "@/lib/format";
import { getDocuments, getEntities, getPersons } from "@/lib/onboarding-data";

const catLabel = (k: string) => DOCUMENT_CATEGORIES.find((c) => c.key === k)?.label ?? k;
const size = (n: number) => (n > 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(n / 1000))} Ko`);

export async function DocumentsStep({ relationshipId }: { relationshipId: string; userName: string }) {
  const [docs, people, companies, rows] = await Promise.all([getDocuments(relationshipId), getPersons(relationshipId), getEntities(relationshipId), getHoldings(relationshipId)]);
  const required = requiredDocuments({
    persons: people.filter((p) => p.link !== "enfant" && p.link !== "petit_enfant").length,
    maritalRegimes: people.map((p) => p.maritalRegime ?? ""),
    entities: companies.length,
    categories: [...new Set(rows.map((r) => r.category))],
  });
  const have = new Set(docs.map((d) => d.category));
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card title="Pièces demandées">
        <p className="mb-4 text-sm text-slate">Liste établie à partir de votre profil et de votre inventaire.</p>
        <ul className="space-y-3">
          {required.map((r) => (
            <li key={r.key} className="flex gap-3 text-sm">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${have.has(r.key) ? "bg-sage text-white" : "border border-line"}`} aria-hidden="true">
                {have.has(r.key) ? "✓" : ""}
              </span>
              <span>
                <span className="block font-medium">{catLabel(r.key)}</span>
                <span className="text-xs text-slate">{r.reason}</span>
                <span className="sr-only">{have.has(r.key) ? "Déposé" : "À déposer"}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-6">
        <Card title="Déposer">
          <DocumentUpload relationshipId={relationshipId} defaultCategory={required.find((r) => !have.has(r.key))?.key} />
          <p className="mt-4 text-xs leading-relaxed text-slate">Chaque fichier est chiffré dès réception et conservé dans l&apos;Union européenne. Seuls vous et votre coordinateur y avez accès ; chaque consultation est enregistrée.</p>
        </Card>
        <Card title={`Documents déposés (${docs.length})`}>
          {docs.length ? (
            <ul className="divide-y divide-line">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="block truncate font-medium underline-offset-4 hover:underline">
                      {d.fileName}
                    </a>
                    <div className="text-xs text-slate">
                      {catLabel(d.category).split(" (")[0]} · {size(d.size)} · {dateTime(d.createdAt)}
                    </div>
                  </div>
                  <form action={deleteClientDocument}>
                    <input type="hidden" name="relationshipId" value={relationshipId} />
                    <input type="hidden" name="id" value={d.id} />
                    <button className="text-xs text-slate hover:text-danger">Retirer</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate">Aucun document pour l&apos;instant.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
