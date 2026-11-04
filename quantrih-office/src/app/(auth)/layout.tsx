import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-ivory lg:flex">
        <Logo light />
        <div>
          <p className="serif max-w-md text-[2.6rem] leading-[1.1]">Votre patrimoine, réuni en un seul endroit. Et protégé comme il se doit.</p>
          <ul className="mt-10 space-y-3 text-sm text-ivory/70">
            <li>Double authentification obligatoire</li>
            <li>Données hébergées et chiffrées dans l&apos;Union européenne</li>
            <li>Chaque consultation est tracée</li>
          </ul>
        </div>
        <p className="text-xs text-ivory/40">Quantrih Office · Louvain-la-Neuve</p>
        <svg className="pointer-events-none absolute -right-24 -top-24 opacity-10" width="420" height="420" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="15" cy="15" r="11" fill="none" stroke="#B08D57" strokeWidth="0.4" />
          <circle cx="15" cy="15" r="7" fill="none" stroke="#B08D57" strokeWidth="0.3" />
        </svg>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
      </main>
    </div>
  );
}
