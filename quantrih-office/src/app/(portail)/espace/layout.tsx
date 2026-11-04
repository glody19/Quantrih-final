import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { getClientContext } from "@/lib/client-context";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, relationship } = await getClientContext();
  const nav = [
    { href: "/espace", label: "Vue d'ensemble" },
    ...(relationship?.status === "onboarding" ? [{ href: "/espace/onboarding", label: "Mon onboarding" }] : []),
    { href: "/espace/patrimoine", label: "Patrimoine" },
    { href: "/espace/documents", label: "Documents", soon: true },
    { href: "/espace/projets", label: "Projets", soon: true },
    { href: "/espace/messages", label: "Messages", soon: true },
    { href: "/espace/honoraires", label: "Honoraires", soon: true },
    { href: "/espace/securite", label: "Sécurité" },
  ];
  return (
    <AppShell nav={nav} user={user} area="Client">
      {children}
    </AppShell>
  );
}
