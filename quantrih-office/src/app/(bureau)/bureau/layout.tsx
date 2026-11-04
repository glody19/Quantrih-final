import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { requireStaff } from "@/lib/session";

export const metadata: Metadata = { title: "Bureau", robots: { index: false, follow: false } };

export default async function BureauLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const nav = [
    { href: "/bureau", label: "Tableau de bord" },
    { href: "/bureau/prospects", label: "Prospects" },
    { href: "/bureau/clients", label: "Relations clients" },
    { href: "/bureau/partenaires", label: "Partenaires", soon: true },
    { href: "/bureau/facturation", label: "Facturation", soon: true },
    ...(user.role === "admin" ? [{ href: "/bureau/journal", label: "Journal d'audit" }] : []),
    { href: "/bureau/securite", label: "Sécurité" },
  ];
  return (
    <AppShell nav={nav} user={user} area="Bureau">
      {children}
    </AppShell>
  );
}
