"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/approche", label: "Notre approche" },
  { href: "/services", label: "Services" },
  { href: "/pour-qui", label: "Pour qui" },
  { href: "/honoraires", label: "Honoraires" },
  { href: "/a-propos", label: "À propos" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`text-[0.9rem] transition-colors hover:text-gold-dark ${path === n.href ? "text-gold-dark" : "text-navy/80"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/connexion" className="text-[0.9rem] text-navy/80 hover:text-navy">
            Espace client
          </Link>
          <Link href="/contact" className="btn btn-primary">
            Prendre rendez-vous
          </Link>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-ivory px-4 pb-5 lg:hidden" aria-label="Navigation mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line/60 py-3.5 text-navy">
              {n.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary">
              Prendre rendez-vous
            </Link>
            <Link href="/connexion" onClick={() => setOpen(false)} className="btn btn-ghost">
              Espace client
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
