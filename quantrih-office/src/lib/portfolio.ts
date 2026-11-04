import type { AssetCategory } from "@/lib/db/schema";

export type HoldingRow = { id: string; label: string; category: AssetCategory; institution: string | null; owner: string | null; value: number; valuedAt: string; source: string };

/** Synthèse consolidée : actifs, dettes, patrimoine net, répartitions. Fonction pure (testée). */
export function summarize(rows: HoldingRow[]) {
  const assets = rows.filter((r) => r.value > 0).reduce((s, r) => s + r.value, 0);
  const debts = rows.filter((r) => r.value < 0).reduce((s, r) => s + r.value, 0);
  const group = (key: (r: HoldingRow) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) if (r.value > 0) m.set(key(r), (m.get(key(r)) ?? 0) + r.value);
    return [...m.entries()].map(([k, v]) => ({ key: k, value: v, share: assets ? v / assets : 0 })).sort((a, b) => b.value - a.value);
  };
  const oldest = rows.reduce<string | null>((o, r) => (!o || r.valuedAt < o ? r.valuedAt : o), null);
  const illiquid = new Set<AssetCategory>(["immobilier", "participations", "private_equity", "actifs_passion"]);
  const liquid = rows.filter((r) => r.value > 0 && !illiquid.has(r.category)).reduce((s, r) => s + r.value, 0);
  return {
    assets,
    debts,
    net: assets + debts,
    liquidShare: assets ? liquid / assets : 0,
    byCategory: group((r) => r.category),
    byInstitution: group((r) => r.institution ?? "Détention directe"),
    byOwner: group((r) => r.owner ?? "Non attribué"),
    oldestValuation: oldest,
    count: rows.length,
  };
}
