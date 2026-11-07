import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { DEMO_USER } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Démonstration de l'espace client", robots: { index: false, follow: true } };

const NAV = [
  { href: "/demo", label: "Vue d'ensemble" },
  { href: "/demo/onboarding", label: "Mon onboarding" },
  { href: "/demo/patrimoine", label: "Patrimoine" },
  { href: "/demo/documents", label: "Documents" },
  { href: "/demo/projets", label: "Projets", soon: true },
  { href: "/demo/messages", label: "Messages", soon: true },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} user={DEMO_USER} area="Démo" demo>
      {children}
    </AppShell>
  );
}
