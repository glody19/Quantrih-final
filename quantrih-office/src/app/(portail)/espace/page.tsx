import Link from "next/link";
import { Breakdown } from "@/components/app/Breakdown";
import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { getClientContext } from "@/lib/client-context";
import { CATEGORY_LABEL } from "@/lib/content";
import { getHoldings, getSteps } from "@/lib/data";
import { eur, longDate } from "@/lib/format";
import { progress } from "@/lib/onboarding";
import { summarize } from "@/lib/portfolio";

export default async function Espace() {
  const { user, relationship } = await getClientContext();
  if (!relationship) {
    return (
      <>
        <PageTitle eyebrow="Bienvenue" title={`Bonjour ${user.name.split(" ")[0]}`} />
        <Empty>Votre espace est en cours de préparation. Votre coordinateur vous contactera très prochainement.</Empty>
      </>
    );
  }
  const [rows, steps] = await Promise.all([getHoldings(relationship.id), getSteps(relationship.id)]);
  const s = summarize(rows);
  const pct = progress(steps.map((x) => x.status));
  const next = steps.find((x) => x.status !== "termine");

  return (
    <>
      <PageTitle eyebrow={relationship.name} title={`Bonjour ${user.name.split(" ")[0]}`} />

      {relationship.status === "onboarding" && (
        <Card className="mb-6 !border-gold/50 !bg-[#FBF7EF]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="eyebrow">Ouverture de votre dossier</div>
              <p className="serif mt-2 text-2xl">{pct} % terminé</p>
              {next && (
                <p className="mt-1 text-sm text-slate">
                  Prochaine étape : <strong className="text-navy">{next.title}</strong> · {next.owner === "Vous" ? "à vous" : "chez Quantrih Office"}
                </p>
              )}
              <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-line">
                <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <Link href="/espace/onboarding" className="btn btn-primary shrink-0">
              Continuer
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-sm text-slate">Patrimoine net consolidé</div>
          <div className="num serif mt-1 text-[2.8rem] leading-none md:text-[3.4rem]">{eur(s.net)}</div>
          <dl className="num mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate">Actifs</dt>
              <dd className="mt-1 font-medium">{eur(s.assets)}</dd>
            </div>
            <div>
              <dt className="text-slate">Dettes</dt>
              <dd className="mt-1 font-medium">{eur(s.debts)}</dd>
            </div>
            <div>
              <dt className="text-slate">Part liquide</dt>
              <dd className="mt-1 font-medium">{Math.round(s.liquidShare * 100)} %</dd>
            </div>
            <div>
              <dt className="text-slate">Valorisation la plus ancienne</dt>
              <dd className="mt-1 font-medium">{s.oldestValuation ? longDate(s.oldestValuation) : "—"}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Par classe d'actifs">
          {s.byCategory.length ? <Breakdown items={s.byCategory} label={(k) => CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL] ?? k} /> : <Empty>Aucun élément consolidé pour l&apos;instant.</Empty>}
        </Card>
        <Card title="Par établissement">{s.byInstitution.length ? <Breakdown items={s.byInstitution} label={(k) => k} /> : <Empty>—</Empty>}</Card>
        <Card title="Par titulaire">{s.byOwner.length ? <Breakdown items={s.byOwner} label={(k) => k} /> : <Empty>—</Empty>}</Card>
        <Card title="À savoir">
          <ul className="space-y-3 text-sm leading-relaxed text-slate">
            <li>Les montants proviennent de vos relevés, des connexions bancaires et de vos déclarations ; la source de chaque ligne est indiquée dans « Patrimoine ».</li>
            <li>Les décisions vous appartiennent : cette vue est un outil de pilotage, pas une recommandation.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
