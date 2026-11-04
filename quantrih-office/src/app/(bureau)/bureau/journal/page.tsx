import { Card, PageTitle } from "@/components/app/AppShell";
import { getAudit } from "@/lib/bureau-data";
import { dateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export default async function Journal() {
  await requireAdmin();
  const rows = await getAudit();
  return (
    <>
      <PageTitle eyebrow="Conformité" title="Journal d'audit" />
      <Card>
        <div className="-mx-5 overflow-x-auto sm:mx-0">
          <table className="num w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate">
                <th className="px-5 py-2 font-medium sm:px-0">Date</th>
                <th className="py-2 font-medium">Action</th>
                <th className="py-2 font-medium">Par</th>
                <th className="py-2 font-medium">Relation</th>
                <th className="py-2 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line/60 align-top">
                  <td className="whitespace-nowrap px-5 py-2.5 text-slate sm:px-0">{dateTime(r.at)}</td>
                  <td className="py-2.5 font-mono text-xs">{r.action}</td>
                  <td className="py-2.5">{r.actor ?? "—"}</td>
                  <td className="py-2.5">{r.rel ?? "—"}</td>
                  <td className="py-2.5 font-mono text-xs text-slate">{r.details ? JSON.stringify(r.details) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
