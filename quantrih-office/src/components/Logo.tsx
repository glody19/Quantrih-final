import Link from "next/link";

/** Monogramme Q stylisé + nom. Variante claire pour les fonds sombres. */
export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  const ink = light ? "#F7F4EE" : "#0F1E2E";
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Quantrih Office, accueil">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="15" cy="15" r="11" fill="none" stroke={ink} strokeWidth="1.6" />
        <path d="M20 20 L27 27" stroke="#B08D57" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="15" r="3" fill="#B08D57" />
      </svg>
      <span className="leading-none">
        <span className="serif block text-[1.35rem] tracking-wide" style={{ color: ink }}>
          Quantrih
        </span>
        <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.32em]" style={{ color: "#B08D57" }}>
          Office
        </span>
      </span>
    </Link>
  );
}
