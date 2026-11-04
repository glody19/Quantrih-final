import type { Metadata } from "next";
import Link from "next/link";
import { findInvitation } from "@/actions/auth";
import { InvitationForm } from "@/components/auth/InvitationForm";

export const metadata: Metadata = { title: "Activer mon espace" };

export default async function Invitation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = token.length >= 20 && token.length <= 200 ? await findInvitation(token) : null;
  if (!inv) {
    return (
      <div>
        <h1 className="text-[2.2rem] leading-tight">Lien expiré ou déjà utilisé</h1>
        <p className="mt-4 text-slate">Pour votre sécurité, un lien d&apos;invitation n&apos;est valable qu&apos;une fois et pendant 72 heures. Demandez-en un nouveau à votre coordinateur.</p>
        <Link href="/connexion" className="btn btn-ghost mt-8">
          Aller à la connexion
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="eyebrow">Bienvenue</div>
      <h1 className="mt-3 text-[2.4rem] leading-tight">Bonjour {inv.name.split(" ")[0]},</h1>
      <p className="mb-8 mt-3 text-slate">
        Choisissez le mot de passe de votre espace Quantrih Office. Votre identifiant est <strong className="text-navy">{inv.email}</strong>.
      </p>
      <InvitationForm token={token} />
    </div>
  );
}
