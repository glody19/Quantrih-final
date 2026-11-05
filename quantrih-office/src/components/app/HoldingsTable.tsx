import { CATEGORY_LABEL } from "@/lib/content";
import { eur, longDate } from "@/lib/format";
import type { HoldingRow } from "@/lib/portfolio";

const SOURCE = { releve: "Relevé", agregation: "Connexion bancaire", declaratif: "Déclaratif", expertise: "Expertise" } as Record<string, string>;

export function HoldingsTable({ rows, action }: { rows: HoldingRow[]; action?: (r: HoldingRow) => React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:mx-0">
      <table className="num w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate">
            <th className="px-5 py-2 font-medium sm:px-0">Élément</th>
            <th className="py-2 pr-4 font-medium">Catégorie</th>
            <th className="py-2 pr-4 font-medium">Établissement</th>
            <th className="py-2 pr-4 font-medium">Titulaire</th>
            <th className="py-2 pr-4 font-medium">Source · date</th>
            <th className="py-2 text-right font-medium">Valeur</th>
            {action && <th className="py-2" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/60">
              <td className="px-5 py-3 font-medium sm:px-0">{r.label}</td>
              <td className="py-3 pr-4 text-slate">{CATEGORY_LABEL[r.category]}</td>
              <td className="py-3 pr-4 text-slate">{r.institution ?? "—"}</td>
              <td className="py-3 pr-4 text-slate">{r.owner ?? "—"}</td>
              <td className="py-3 pr-4 text-slate">
                {SOURCE[r.source] ?? r.source} · {longDate(r.valuedAt)}
              </td>
              <td className={`py-3 text-right font-medium ${r.value < 0 ? "text-danger" : ""}`}>{eur(r.value)}</td>
              {action && <td className="py-3 pl-3 text-right">{action(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
