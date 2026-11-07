import { Card, PageTitle } from "@/components/app/AppShell";
import { HoldingsTable } from "@/components/app/HoldingsTable";
import { DEMO_HOLDINGS, DEMO_RELATIONSHIP } from "@/lib/demo-data";

export default function DemoPatrimoine() {
  return (
    <>
      <PageTitle eyebrow={DEMO_RELATIONSHIP} title="Patrimoine" />
      <Card>
        <HoldingsTable rows={DEMO_HOLDINGS} />
        <p className="mt-4 text-xs text-slate">Chaque ligne indique sa source (relevé, connexion bancaire, expertise ou votre estimation) et sa date de valorisation.</p>
      </Card>
    </>
  );
}
