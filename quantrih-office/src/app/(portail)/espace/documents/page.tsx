import { Empty, PageTitle } from "@/components/app/AppShell";
import { DocumentsStep } from "@/components/onboarding/steps/DocumentsStep";
import { getClientContext } from "@/lib/client-context";

export default async function Documents() {
  const { user, relationship } = await getClientContext();
  if (!relationship) return <Empty>Aucun dossier n&apos;est encore ouvert.</Empty>;
  return (
    <>
      <PageTitle eyebrow={relationship.name} title="Documents" />
      <DocumentsStep relationshipId={relationship.id} userName={user.name} />
    </>
  );
}
