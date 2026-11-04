/** Aperçu illustratif de la vision consolidée (données fictives). */
const ROWS = [
  { label: "Portefeuilles titres", share: 38, color: "#0F1E2E" },
  { label: "Immobilier", share: 27, color: "#B08D57" },
  { label: "Participations", share: 18, color: "#5E7D6A" },
  { label: "Assurance-vie", share: 10, color: "#5B6672" },
  { label: "Liquidités", share: 7, color: "#DDD5C6" },
];

export function ConsolidatedPreview() {
  return (
    <div className="card relative overflow-hidden p-6 shadow-[0_30px_80px_-40px_rgba(15,30,46,0.45)] sm:p-7">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Vision consolidée</div>
        <span className="rounded-full bg-sand px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate">Illustration</span>
      </div>
      <div className="mt-5 text-sm text-slate">Patrimoine net</div>
      <div className="num serif text-[2.6rem] leading-none">7 480 000 €</div>
      <div className="mt-1 text-xs text-slate">4 établissements · 2 sociétés · 3 personnes</div>
      <div className="mt-6 flex h-2.5 overflow-hidden rounded-full">
        {ROWS.map((r) => (
          <div key={r.label} style={{ width: `${r.share}%`, background: r.color }} />
        ))}
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {ROWS.map((r) => (
          <li key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="num text-slate">{r.share} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
