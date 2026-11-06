// Paying partners shown on the site with a "Partner" badge. Nothing is displayed while this list is empty.
// To add a partner: append an entry, set `markets` (BE, FR) for platforms or `kind: "education"` for courses,
// and use a tracked link (for example with utm_source=quantrih) in `url`.

export type PartnerKind = "broker" | "bank" | "neobank" | "education";

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  /** Countries where the partner is featured on the investment platforms page. */
  markets: ("BE" | "FR")[];
  /** Website domain, used to load the logo. */
  domain: string;
  color: string;
  url: string;
  tagline: { fr: string; en: string };
  /** Optional welcome offer or highlight, written and approved by the partner. */
  highlight?: { fr: string; en: string };
}

export const PARTNERS: Partner[] = [];
