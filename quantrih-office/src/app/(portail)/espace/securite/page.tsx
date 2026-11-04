import { Card, PageTitle } from "@/components/app/AppShell";
import { LoginHistory } from "@/components/app/LoginHistory";
import { requireClient } from "@/lib/session";

export default async function Securite() {
  const user = await requireClient();
  return (
    <>
      <PageTitle eyebrow="Mon compte" title="Sécurité" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Protection du compte">
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-3">
              <span>Double authentification</span>
              <span className="font-semibold text-sage">Active</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Identifiant</span>
              <span className="text-slate">{user.email}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Blocage automatique</span>
              <span className="text-slate">après 5 échecs</span>
            </li>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-slate">Une connexion que vous ne reconnaissez pas ? Contactez immédiatement votre coordinateur : il peut fermer toutes les sessions ouvertes.</p>
        </Card>
        <Card title="Dernières connexions">
          <LoginHistory userId={user.id} />
        </Card>
      </div>
    </>
  );
}
