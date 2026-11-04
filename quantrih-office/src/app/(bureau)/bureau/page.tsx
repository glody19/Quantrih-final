import Link from "next/link";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { getCounts, getRelationshipsOverview } from "@/lib/bureau-data";
import { compactEur } from "@/lib/format";
import { requireStaff } from "@/lib/session";

export default async function Bureau() {
  const user = await requireStaff();
  const [c, rels] = await Promise.all([getCounts(), getRelationshipsOverview()]);
  const onboarding = rels.filter((r) => r.status === "onboarding");
  return (
    <>
      <PageTitle eyebrow="Bureau" title={`Bonjour ${user.name.split(" ")[0]}`}>
        <Link href="/bureau/clients/nouveau" className="btn btn-primary">
          Nouvelle relation client
        </Link>
      </PageTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Nouveaux prospects", c.newLeads, "/bureau/prospects"],
          ["Étapes à valider", c.toReview, "/bureau/clients"],
          ["Onboardings en cours", c.onboarding, "/bureau/clients"],
          ["Clients actifs", c.active, "/bureau/clients"],
        ].map(([l, n, href]) => (
          <Link key={l as string} href={href as string} className="card p-5 transition-colors hover:border-navy">
            <div className="text-sm text-slate">{l}</div>
            <div className="num serif mt-1 text-4xl">{n}</div>
          </Link>
        ))}
      </div>
      <Card title="Onboardings en cours" className="mt-6">
        {onboarding.length ? (
          <ul className="divide-y divide-line">
            {onboarding.map((r) => (
              <li key={r.id}>
                <Link href={`/bureau/clients/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-gold-dark">
                  <span className="font-medium">{r.name}</span>
                  <span className="flex items-center gap-4 text-sm text-slate">
                    {r.toReview > 0 && <span className="rounded-full bg-[#E7EEF5] px-2 py-0.5 text-xs font-semibold text-navy-soft">{r.toReview} à valider</span>}
                    <span className="num">
                      {r.done}/{r.total} étapes
                    </span>
                    <span className="num">{compactEur(r.net)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucun onboarding en cours.</Empty>
        )}
      </Card>
    </>
  );
}
