import Link from "next/link";
import { Breakdown } from "@/components/app/Breakdown";
import { Card, PageTitle } from "@/components/app/AppShell";
import { CATEGORY_LABEL } from "@/lib/content";
import { DEMO_ACTIONS, DEMO_HOLDINGS, DEMO_RELATIONSHIP, DEMO_STEPS, DEMO_USER } from "@/lib/demo-data";
import { eur, longDate } from "@/lib/format";
import { progress } from "@/lib/onboarding";
import { summarize } from "@/lib/portfolio";

export default function DemoHome() {
  const s = summarize(DEMO_HOLDINGS);
  const pct = progress(DEMO_STEPS.map((x) => x.status));
  const next = DEMO_STEPS.find((x) => x.status !== "termine");
  return (
    <>
      <PageTitle eyebrow={DEMO_RELATIONSHIP} title={`Bonjour ${DEMO_USER.name.split(" ")[0]}`} />
      <Card className="mb-6 !border-gold/50 !bg-[#FBF7EF]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="eyebrow">Ouverture de votre dossier</div>
            <p className="serif mt-2 text-2xl">{pct} % terminé</p>
            {next && (
              <p className="mt-1 text-sm text-slate">
                Prochaine étape : <strong className="text-navy">{next.title}</strong>
              </p>
            )}
            <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-line">
              <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Link href="/demo/onboarding" className="btn btn-primary shrink-0">
            Voir les étapes
          </Link>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-sm text-slate">Patrimoine net consolidé</div>
          <div className="num serif mt-1 text-[2.8rem] leading-none md:text-[3.4rem]">{eur(s.net)}</div>
          <dl className="num mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
            <div><dt className="text-slate">Actifs</dt><dd className="mt-1 font-medium">{eur(s.assets)}</dd></div>
            <div><dt className="text-slate">Dettes</dt><dd className="mt-1 font-medium">{eur(s.debts)}</dd></div>
            <div><dt className="text-slate">Part liquide</dt><dd className="mt-1 font-medium">{Math.round(s.liquidShare * 100)} %</dd></div>
            <div><dt className="text-slate">Valorisation la plus ancienne</dt><dd className="mt-1 font-medium">{s.oldestValuation ? longDate(s.oldestValuation) : "—"}</dd></div>
          </dl>
        </Card>
        <Card title="Par classe d'actifs">
          <Breakdown items={s.byCategory} label={(k) => CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL] ?? k} />
        </Card>
        <Card title="Par établissement">
          <Breakdown items={s.byInstitution} label={(k) => k} />
        </Card>
        <Card title="Par titulaire">
          <Breakdown items={s.byOwner} label={(k) => k} />
        </Card>
        <Card title="Prochaines actions">
          <ul className="space-y-3 text-sm">
            {DEMO_ACTIONS.map((a) => (
              <li key={a.what}>
                <div className="font-medium">{a.what}</div>
                <div className="text-xs text-slate">
                  {a.who} · {longDate(a.when)} · {a.status}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
