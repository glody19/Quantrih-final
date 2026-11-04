import Link from "next/link";
import { setLeadStatus } from "@/actions/bureau";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { getLeads } from "@/lib/bureau-data";
import { PROFILES, SERVICES, WEALTH_RANGES } from "@/lib/content";
import { leadStatusEnum } from "@/lib/db/schema";
import { dateTime } from "@/lib/format";
import { requireStaff } from "@/lib/session";

const STATUS: Record<string, string> = { nouveau: "Nouveau", rdv_planifie: "RDV planifié", rdv_fait: "RDV fait", proposition: "Proposition", converti: "Converti", sans_suite: "Sans suite" };
const label = <T extends { key: string; label?: string; title?: string }>(list: readonly T[], k: string) => {
  const f = list.find((x) => x.key === k);
  return f?.label ?? f?.title ?? k;
};

export default async function Prospects() {
  await requireStaff();
  const leads = await getLeads();
  return (
    <>
      <PageTitle eyebrow="Pipeline" title="Prospects" />
      {leads.length === 0 ? (
        <Empty>Aucune demande pour l&apos;instant. Les demandes du formulaire « Rendez-vous découverte » apparaîtront ici.</Empty>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <Card key={l.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-base font-semibold">{l.name}</h2>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs">{label(WEALTH_RANGES, l.wealthRange)}</span>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs">{label(PROFILES, l.profile)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    <a href={`mailto:${l.email}`} className="underline">
                      {l.email}
                    </a>
                    {l.phone && ` · ${l.phone}`} · reçu le {dateTime(l.createdAt)}
                    {l.source && ` · via ${l.source}`}
                  </p>
                  {l.needs.length > 0 && <p className="mt-2 text-sm">Besoins : {l.needs.map((n) => label(SERVICES, n)).join(", ")}</p>}
                  {l.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-ivory p-3 text-sm text-slate">{l.message}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <form action={setLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <select name="status" defaultValue={l.status} className="field !w-auto !py-2 text-sm" aria-label="Statut">
                      {leadStatusEnum.enumValues.map((s) => (
                        <option key={s} value={s}>
                          {STATUS[s]}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-ghost !py-2">Mettre à jour</button>
                  </form>
                  {l.status !== "converti" && (
                    <Link href={`/bureau/clients/nouveau?prospect=${l.id}`} className="btn btn-primary !py-2">
                      Convertir en client
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
