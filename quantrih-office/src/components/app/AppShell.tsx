import { logout } from "@/actions/auth";
import { Logo } from "@/components/Logo";
import { NavLinks, type NavItem } from "./NavLinks";

export function AppShell({ nav, user, area, children }: { nav: NavItem[]; user: { name: string; email: string }; area: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Logo href={nav[0]?.href ?? "/"} />
          <span className="rounded-full bg-sand px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate">{area}</span>
        </div>
        <NavLinks items={nav} />
        <div className="mt-auto hidden border-t border-line px-5 py-4 lg:block">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="truncate text-xs text-slate">{user.email}</div>
          <form action={logout} className="mt-3">
            <button className="text-xs font-semibold text-slate hover:text-navy">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex justify-end border-b border-line bg-paper px-4 py-2 lg:hidden">
          <form action={logout}>
            <button className="text-xs font-semibold text-slate">Se déconnecter</button>
          </form>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-2 text-[2.2rem] leading-tight md:text-[2.6rem]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Card({ title, children, className = "", action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-slate">{children}</p>;
}
