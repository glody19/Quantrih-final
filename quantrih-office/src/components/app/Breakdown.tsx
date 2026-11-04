import { compactEur } from "@/lib/format";

const COLORS = ["#0F1E2E", "#B08D57", "#5E7D6A", "#5B6672", "#8A6C3F", "#1C3046", "#A9B4BE", "#DDD5C6"];

/** Barre de répartition empilée + légende chiffrée. */
export function Breakdown({ items, label }: { items: { key: string; value: number; share: number }[]; label: (k: string) => string }) {
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={items.map((i) => `${label(i.key)} ${Math.round(i.share * 100)} %`).join(", ")}>
        {items.map((i, n) => (
          <div key={i.key} style={{ width: `${i.share * 100}%`, background: COLORS[n % COLORS.length] }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i, n) => (
          <li key={i.key} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[n % COLORS.length] }} />
              <span className="truncate">{label(i.key)}</span>
            </span>
            <span className="num shrink-0 text-slate">
              {compactEur(i.value)} · {Math.round(i.share * 100)} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
