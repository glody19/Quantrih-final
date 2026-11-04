import { Card, PageTitle } from "@/components/app/AppShell";
import { LoginHistory } from "@/components/app/LoginHistory";
import { requireStaff } from "@/lib/session";

export default async function SecuriteBureau() {
  const user = await requireStaff();
  return (
    <>
      <PageTitle eyebrow="Mon compte" title="Sécurité" />
      <Card title="Dernières connexions">
        <LoginHistory userId={user.id} />
      </Card>
    </>
  );
}
