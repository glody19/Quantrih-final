import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MfaSetup } from "@/components/auth/MfaSetup";
import { homeFor, requireSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Double authentification" };

export default async function DoubleAuthentification() {
  const user = await requireSignedIn();
  if (user.mfa) redirect(homeFor(user.role));
  return <MfaSetup />;
}
