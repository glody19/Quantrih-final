import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser, homeFor } from "@/lib/session";

export const metadata: Metadata = { title: "Connexion" };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ deconnecte?: string }> }) {
  const user = await getCurrentUser();
  if (user?.mfa) redirect(homeFor(user.role));
  const { deconnecte } = await searchParams;
  return (
    <>
      {deconnecte && (
        <p role="status" className="mb-6 rounded-lg bg-sand px-4 py-2.5 text-sm text-slate">
          Vous êtes déconnecté. À bientôt.
        </p>
      )}
      <LoginForm />
    </>
  );
}
