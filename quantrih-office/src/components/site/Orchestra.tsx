/** Schéma du chef d'orchestre : la famille au centre, Quantrih Office qui coordonne, les professionnels autour. */
const PARTNERS = ["Banques dépositaires", "Avocats", "Notaires", "Experts-comptables", "Conseillers fiscaux", "Courtiers en assurance", "Gérants agréés", "Conseils M&A"];

export function Orchestra() {
  const cx = 260;
  const cy = 260;
  const r = 200;
  return (
    <svg viewBox="0 0 520 520" className="h-auto w-full max-w-[520px]" role="img" aria-label="Quantrih Office au centre, coordonnant banques, avocats, notaires, experts-comptables, conseillers fiscaux, courtiers, gérants et conseils M&A, au service de la famille.">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#DDD5C6" strokeDasharray="3 6" />
      <circle cx={cx} cy={cy} r={118} fill="none" stroke="#DDD5C6" />
      {PARTNERS.map((p, i) => {
        const a = (i / PARTNERS.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const ix = cx + 118 * Math.cos(a);
        const iy = cy + 118 * Math.sin(a);
        return (
          <g key={p}>
            <line x1={ix} y1={iy} x2={x} y2={y} stroke="#B08D57" strokeOpacity="0.45" />
            <circle cx={x} cy={y} r={6} fill="#B08D57" />
            <text x={x} y={y + (Math.sin(a) > 0.3 ? 26 : -16)} textAnchor="middle" fontSize="14" fill="#0F1E2E" fontFamily="var(--font-inter)">
              {p}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={86} fill="#0F1E2E" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" letterSpacing="3" fill="#B08D57" fontFamily="var(--font-inter)">
        QUANTRIH OFFICE
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="24" fill="#F7F4EE" fontFamily="var(--font-cormorant)">
        Vous
      </text>
    </svg>
  );
}
