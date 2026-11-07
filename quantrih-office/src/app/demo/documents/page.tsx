import { Card, PageTitle } from "@/components/app/AppShell";
import { DEMO_DOCUMENTS, DEMO_RELATIONSHIP } from "@/lib/demo-data";
import { longDate } from "@/lib/format";

export default function DemoDocuments() {
  return (
    <>
      <PageTitle eyebrow={DEMO_RELATIONSHIP} title="Documents" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title={`Coffre-fort (${DEMO_DOCUMENTS.length})`}>
          <ul className="divide-y divide-line">
            {DEMO_DOCUMENTS.map((d) => (
              <li key={d.name} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate">
                    {d.category} · déposé le {longDate(d.date)}
                  </div>
                </div>
                {d.expiry && <span className="rounded-full bg-[#FBF1DE] px-2 py-0.5 text-xs text-gold-dark">Échéance {longDate(d.expiry)}</span>}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Sécurité de vos documents">
          <ul className="space-y-3 text-sm leading-relaxed text-slate">
            <li>Chaque fichier est chiffré dès réception et conservé dans l&apos;Union européenne.</li>
            <li>Seuls vous et votre coordinateur y avez accès ; chaque consultation est enregistrée.</li>
            <li>Vous décidez quels professionnels peuvent en recevoir une copie, et pouvez retirer cet accord à tout moment.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
