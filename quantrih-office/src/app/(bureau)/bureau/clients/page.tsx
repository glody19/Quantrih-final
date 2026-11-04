import Link from "next/link";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { getRelationshipsOverview } from "@/lib/bureau-data";
import { eur } from "@/lib/format";
import { requireStaff } from "@/lib/session";

const STATUS: Record<string, string> = { onboarding: "Onboarding", actif: "Actif", suspendu: "Suspendu", clos: "Clos" };
const KIND: Record<string, string> = { personne: "Personne", foyer: "Foyer", famille: "Famille" };

export default async function Clients() {
  await requireStaff();
  const rels = await getRelationshipsOverview();
  return (
    <>
      <PageTitle eyebrow="Portefeuille" title="Relations clients">
        <Link href="/bureau/clients/nouveau" className="btn btn-primary">
          Nouvelle relation
        </Link>
      </PageTitle>
      <Card>
        {rels.length === 0 ? (
          <Empty>Aucune relation client. Créez la première depuis un prospect ou directement.</Empty>
        ) : (
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <table className="num w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate">
                  <th className="px-5 py-2 font-medium sm:px-0">Relation</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Statut</th>
                  <th className="py-2 font-medium">Onboarding</th>
                  <th className="py-2 text-right font-medium">Patrimoine net</th>
                </tr>
              </thead>
              <tbody>
                {rels.map((r) => (
                  <tr key={r.id} className="border-b border-line/60">
                    <td className="px-5 py-3 sm:px-0">
                      <Link href={`/bureau/clients/${r.id}`} className="font-medium underline-offset-4 hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="py-3 text-slate">{KIND[r.kind]}</td>
                    <td className="py-3">{STATUS[r.status]}</td>
                    <td className="py-3 text-slate">
                      {r.done}/{r.total}
                      {r.toReview > 0 && <span className="ml-2 rounded-full bg-[#E7EEF5] px-2 py-0.5 text-xs font-semibold text-navy-soft">{r.toReview} à valider</span>}
                    </td>
                    <td className="py-3 text-right">{eur(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
