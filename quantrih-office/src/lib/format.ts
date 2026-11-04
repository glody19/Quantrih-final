const eur0 = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("fr-BE", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const eur = (n: number) => eur0.format(n);
export const percent = (n: number) => pct.format(n);
export const longDate = (d: Date | string) => dateFmt.format(new Date(d));
export const dateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));
/** Montant compact pour les grands nombres : 4,2 M€. */
export function compactEur(n: number) {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toLocaleString("fr-BE", { maximumFractionDigits: 1 })} M€`;
  if (a >= 1_000) return `${Math.round(n / 1_000).toLocaleString("fr-BE")} k€`;
  return eur(n);
}
