"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; soon?: boolean };

export function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Navigation de l'espace">
      {items.map((i) => {
        const active = i.href === items[0]?.href ? path === i.href : path.startsWith(i.href);
        if (i.soon)
          return (
            <span key={i.href} className="flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate/60">
              {i.label}
              <span className="text-[0.6rem] uppercase tracking-wider">Bientôt</span>
            </span>
          );
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-navy text-ivory" : "text-navy/80 hover:bg-sand"}`}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
