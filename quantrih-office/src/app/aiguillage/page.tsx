import { redirect } from "next/navigation";
import { getCurrentUser, homeFor, MFA_SETUP } from "@/lib/session";

/** Après la connexion : chacun vers son espace, ou vers l'activation obligatoire de la double authentification. */
export default async function Aiguillage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  redirect(user.mfa ? homeFor(user.role) : MFA_SETUP);
}
