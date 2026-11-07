import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-navy text-ivory/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/60">
            Coordination patrimoniale pour les familles et les entrepreneurs de toute la Belgique. Aucun produit vendu, aucune commission conservée.
          </p>
        </div>
        <FooterCol title="Découvrir" links={[["/approche", "Notre approche"], ["/services", "Services"], ["/pour-qui", "Pour qui"], ["/honoraires", "Honoraires"]]} />
        <FooterCol title="Quantrih Office" links={[["/a-propos", "À propos"], ["/contact", "Rendez-vous découverte"], ["/connexion", "Espace client"]]} />
        <div>
          <div className="eyebrow !text-gold">Contact</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{CONTACT.city}, {CONTACT.country}</li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-ivory">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-ivory/50 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Quantrih Office. Quantrih Office coordonne des professionnels agréés et ne fournit pas de conseil en investissement.
          </p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-ivory">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ivory">Confidentialité</Link>
            <Link href="/plaintes" className="hover:text-ivory">Réclamations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow !text-gold">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-ivory">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
