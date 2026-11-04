import { Card, Empty, PageTitle } from "@/components/app/AppShell";
import { HoldingsTable } from "@/components/app/HoldingsTable";
import { getClientContext } from "@/lib/client-context";
import { getHoldings } from "@/lib/data";

export default async function Patrimoine() {
  const { relationship } = await getClientContext();
  if (!relationship) return <Empty>Aucun dossier n&apos;est encore ouvert.</Empty>;
  const rows = await getHoldings(relationship.id);
  return (
    <>
      <PageTitle eyebrow={relationship.name} title="Patrimoine" />
      <Card>{rows.length ? <HoldingsTable rows={rows} /> : <Empty>Votre inventaire sera affiché ici dès qu&apos;il aura été consolidé par votre coordinateur.</Empty>}</Card>
    </>
  );
}
