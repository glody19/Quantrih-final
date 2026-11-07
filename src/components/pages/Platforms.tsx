import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Search, Star, ExternalLink, Check, X, Scale, ShieldCheck, Globe2, Wallet, LineChart, Lock, Building2, Bitcoin, Landmark, Smartphone, BarChart3, Layers,
} from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { MobileZoomWrapper } from "../ui/MobileZoomWrapper";
import { PLATFORMS } from "./platformsData";
import { cn } from "../../lib/utils";

type Platform = (typeof PLATFORMS)[number];
type Category = "all" | "broker" | "crypto" | "neobank" | "bank" | "screener";
type FeeBucket = "zero" | "low" | "medium" | "high" | "premium";

/** Official websites (used for the "Visit" link and the favicon logo). */
const WEBSITES: Record<string, string> = {
  interactive_brokers: "https://www.interactivebrokers.com",
  degiro: "https://www.degiro.com",
  trade_republic: "https://traderepublic.com",
  scalable_capital: "https://scalable.capital",
  bloomberg: "https://www.bloomberg.com/professional/products/bloomberg-terminal/",
  trading212: "https://www.trading212.com",
  etoro: "https://www.etoro.com",
  charles_schwab: "https://www.schwab.com",
  fidelity: "https://www.fidelity.com",
  vanguard: "https://investor.vanguard.com",
  robinhood: "https://robinhood.com",
  webull: "https://www.webull.com",
  xtb: "https://www.xtb.com",
  saxo_bank: "https://www.home.saxo",
  boursorama: "https://www.boursobank.com",
  fortuneo: "https://www.fortuneo.fr",
  tastytrade: "https://tastytrade.com",
  wealthsimple: "https://www.wealthsimple.com",
  questrade: "https://www.questrade.com",
  binance: "https://www.binance.com",
  coinbase: "https://www.coinbase.com",
  kraken: "https://www.kraken.com",
  kucoin: "https://www.kucoin.com",
  bitstamp: "https://www.bitstamp.net",
  gemini: "https://www.gemini.com",
  crypto_com: "https://crypto.com",
  bybit: "https://www.bybit.com",
  okx: "https://www.okx.com",
  htx: "https://www.htx.com",
  plus500: "https://www.plus500.com",
  ig: "https://www.ig.com",
  revolut: "https://www.revolut.com",
  n26: "https://n26.com",
  credit_agricole: "https://www.credit-agricole.fr",
  bnp_paribas: "https://mabanque.bnpparibas",
};

const feeBucket = (fees: string): FeeBucket => {
  const f = fees.toLowerCase();
  if (f.includes("premium")) return "premium";
  if (f.includes("zero")) return "zero";
  if (f.includes("high")) return "high";
  if (f.includes("low")) return "low";
  return "medium";
};
const FEE_ORDER: Record<FeeBucket, number> = { zero: 0, low: 1, medium: 2, high: 3, premium: 4 };

const T: Record<string, Record<string, string>> = {
  en: {
    badge: "Independent comparison", title: "Investment platforms", subtitle: "Compare brokers, crypto exchanges, neobanks, banks and research terminals side by side: fees, features, strengths and weaknesses.",
    search: "Search a platform or a feature (e.g. PEA, ETF savings plan, options)…", all: "All", broker: "Brokers", crypto: "Crypto exchanges", neobank: "Neobanks", bank: "Traditional banks", screener: "Data & research",
    fees: "Fees", anyFee: "Any fee level", zero: "Zero commission", low: "Low", medium: "Medium", high: "High", premium: "Premium",
    sortRating: "Sort: rating", sortName: "Sort: name", sortFees: "Sort: lowest fees", results: "platforms", pros: "Strengths", cons: "Weaknesses", bestFor: "Best for",
    visit: "Visit website", compare: "Compare", comparing: "Comparison", clear: "Clear", max: "Select up to 3 platforms to compare them.", rating: "Quantrih rating",
    features: "Features", category: "Category", overview: "Overview table", platform: "Platform", noResult: "No platform matches your filters.",
    guideTitle: "How to choose your platform", disclaimerTitle: "Important",
    disclaimer: "Ratings are Quantrih's editorial assessment. Fees and conditions change frequently: always check the latest pricing and the regulatory status on the provider's official website before opening an account. This page is not investment advice and contains no sponsored ranking.",
    g1t: "Total cost", g1d: "Look beyond the commission: FX fees, custody fees, inactivity fees, spreads and withdrawal fees add up over time.",
    g2t: "Regulation & protection", g2d: "Check the regulator (AMF, BaFin, FCA, SEC…) and the investor compensation scheme that covers your cash and securities.",
    g3t: "Markets & products", g3d: "Make sure the exchanges, ETFs, bonds or options you need are available, with fractional shares if you invest small amounts.",
    g4t: "Tax-advantaged accounts", g4d: "PEA, assurance-vie, ISA, IRA, TFSA… a local wrapper can matter more than a lower commission.",
    g5t: "Tools & research", g5d: "Charting, screeners, fundamentals and APIs are essential for active investors, less so for a monthly ETF plan.",
    g6t: "Crypto custody", g6d: "For crypto, favour regulated exchanges, proof of reserves, and consider a hardware wallet for long-term holdings.",
    countLabel: "platforms compared",
  },
  fr: {
    badge: "Comparatif indépendant", title: "Plateformes d'investissement", subtitle: "Comparez courtiers, plateformes crypto, néobanques, banques et terminaux de recherche : frais, fonctionnalités, points forts et points faibles.",
    search: "Rechercher une plateforme ou une fonctionnalité (ex. PEA, plan d'épargne ETF, options)…", all: "Toutes", broker: "Courtiers", crypto: "Plateformes crypto", neobank: "Néobanques", bank: "Banques traditionnelles", screener: "Données & recherche",
    fees: "Frais", anyFee: "Tous niveaux de frais", zero: "Zéro commission", low: "Faibles", medium: "Moyens", high: "Élevés", premium: "Premium",
    sortRating: "Tri : note", sortName: "Tri : nom", sortFees: "Tri : frais les plus bas", results: "plateformes", pros: "Points forts", cons: "Points faibles", bestFor: "Idéal pour",
    visit: "Visiter le site", compare: "Comparer", comparing: "Comparaison", clear: "Effacer", max: "Sélectionnez jusqu'à 3 plateformes pour les comparer.", rating: "Note Quantrih",
    features: "Fonctionnalités", category: "Catégorie", overview: "Tableau récapitulatif", platform: "Plateforme", noResult: "Aucune plateforme ne correspond à vos filtres.",
    guideTitle: "Comment choisir sa plateforme", disclaimerTitle: "Important",
    disclaimer: "Les notes sont l'évaluation éditoriale de Quantrih. Les frais et conditions changent souvent : vérifiez toujours la grille tarifaire et le statut réglementaire sur le site officiel avant d'ouvrir un compte. Cette page n'est pas un conseil en investissement et ne contient aucun classement sponsorisé.",
    g1t: "Coût total", g1d: "Regardez au-delà du courtage : frais de change, de garde, d'inactivité, spreads et frais de retrait s'additionnent avec le temps.",
    g2t: "Régulation & protection", g2d: "Vérifiez le régulateur (AMF, BaFin, FCA, SEC…) et le mécanisme de garantie qui couvre vos espèces et vos titres.",
    g3t: "Marchés & produits", g3d: "Assurez-vous que les places, ETF, obligations ou options dont vous avez besoin sont disponibles, avec fractions d'actions pour les petits montants.",
    g4t: "Enveloppes fiscales", g4d: "PEA, assurance-vie, ISA, IRA, TFSA… une enveloppe locale peut compter davantage qu'un courtage plus bas.",
    g5t: "Outils & recherche", g5d: "Graphiques, screeners, données fondamentales et API sont essentiels pour un investisseur actif, moins pour un plan ETF mensuel.",
    g6t: "Conservation des cryptos", g6d: "Privilégiez les plateformes régulées avec preuve de réserves, et envisagez un portefeuille matériel pour le long terme.",
    countLabel: "plateformes comparées",
  },
};

const CAT_ICON: Record<string, React.ReactNode> = {
  all: <Layers size={16} />, broker: <LineChart size={16} />, crypto: <Bitcoin size={16} />, neobank: <Smartphone size={16} />, bank: <Landmark size={16} />, screener: <BarChart3 size={16} />,
};

function domainOf(id: string) {
  try {
    return new URL(WEBSITES[id]).hostname;
  } catch {
    return "";
  }
}

function PlatformLogo({ p, size = 48 }: { p: Platform; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = domainOf(p.id);
  if (!domain || failed) {
    return (
      <div className="rounded-xl bg-pv-blue/10 text-pv-blue font-bold flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        {p.name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={p.name}
      onError={() => setFailed(true)}
      className="rounded-xl bg-white border border-border p-1.5 object-contain shrink-0"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={15} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-border-2"} />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-text">{value.toFixed(1)}</span>
    </span>
  );
}

export function Platforms({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language } = useTranslation() as any;
  const t = T[language] || T.en;

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [fee, setFee] = useState<FeeBucket | "any">("any");
  const [sort, setSort] = useState<"rating" | "name" | "fees">("rating");
  const [selected, setSelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PLATFORMS.length };
    PLATFORMS.forEach((p) => (c[p.type] = (c[p.type] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PLATFORMS.filter((p) => {
      if (cat !== "all" && p.type !== cat) return false;
      if (fee !== "any" && feeBucket(p.fees) !== fee) return false;
      if (!q) return true;
      const hay = [p.name, p.fees, p.bestFor, ...p.features, ...p.pros, ...p.cons].join(" ").toLowerCase();
      return hay.includes(q);
    });
    return [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "fees" ? FEE_ORDER[feeBucket(a.fees)] - FEE_ORDER[feeBucket(b.fees)] || b.rating - a.rating : b.rating - a.rating
    );
  }, [query, cat, fee, sort]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id]));

  const compared = selected.map((id) => PLATFORMS.find((p) => p.id === id)!).filter(Boolean);

  const guide = [
    { icon: <Wallet size={20} />, t: t.g1t, d: t.g1d },
    { icon: <ShieldCheck size={20} />, t: t.g2t, d: t.g2d },
    { icon: <Globe2 size={20} />, t: t.g3t, d: t.g3d },
    { icon: <Building2 size={20} />, t: t.g4t, d: t.g4d },
    { icon: <LineChart size={20} />, t: t.g5t, d: t.g5d },
    { icon: <Lock size={20} />, t: t.g6t, d: t.g6d },
  ];

  return (
    <MobileZoomWrapper scaleMobile={0.85}>
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 pb-24 font-sans">
        {/* HERO */}
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pt-10 md:pt-14 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-pv-blue/10 border border-pv-blue/20 rounded-full text-sm font-semibold text-pv-blue mb-5">
            <Scale size={15} /> {t.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text tracking-tight">{t.title}</h1>
          <p className="text-lg text-text-2 mt-4 max-w-3xl leading-relaxed">{t.subtitle}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {(["broker", "crypto", "neobank", "bank", "screener"] as const).map((c) => (
              <div key={c} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm">
                <span className="text-pv-blue">{CAT_ICON[c]}</span>
                <b className="text-text">{counts[c] || 0}</b>
                <span className="text-text-3">{t[c]}</span>
              </div>
            ))}
          </div>
        </motion.header>

        {/* TOOLBAR */}
        <div className="sticky top-20 z-30 bg-bg/90 backdrop-blur-md py-3 -mx-1 px-1 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 h-12 px-4 bg-surface border border-border rounded-xl focus-within:border-pv-blue focus-within:ring-4 focus-within:ring-pv-blue/10">
              <Search size={18} className="text-text-3 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                className="flex-1 min-w-0 bg-transparent outline-none border-none text-base text-text placeholder:text-text-4 focus:ring-0"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-text-3 hover:text-text" aria-label={t.clear}>
                  <X size={18} />
                </button>
              )}
            </div>
            <select value={fee} onChange={(e) => setFee(e.target.value as any)} className="h-12 px-3 bg-surface border border-border rounded-xl text-sm font-medium text-text">
              <option value="any">{t.anyFee}</option>
              {(["zero", "low", "medium", "high", "premium"] as const).map((f) => (
                <option key={f} value={f}>{t.fees}: {t[f]}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-12 px-3 bg-surface border border-border rounded-xl text-sm font-medium text-text">
              <option value="rating">{t.sortRating}</option>
              <option value="fees">{t.sortFees}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "broker", "crypto", "neobank", "bank", "screener"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border whitespace-nowrap transition-colors",
                  cat === c ? "bg-text text-bg border-text" : "bg-surface text-text border-border hover:border-border-2"
                )}
              >
                {CAT_ICON[c]} {t[c]} <span className="opacity-60">{counts[c] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* COMPARISON */}
        <section className="mt-6 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text"><Scale size={18} className="text-pv-blue" /> {t.comparing} ({compared.length}/3)</h2>
            {compared.length > 0 && (
              <button onClick={() => setSelected([])} className="text-sm font-semibold text-text-3 hover:text-text">{t.clear}</button>
            )}
          </div>
          {compared.length < 2 ? (
            <p className="text-sm text-text-3">{t.max}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr>
                    <th className="w-40" />
                    {compared.map((p) => (
                      <th key={p.id} className="text-left p-3 align-bottom">
                        <div className="flex items-center gap-3">
                          <PlatformLogo p={p} size={36} />
                          <span className="font-semibold text-text text-base">{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { k: t.category, f: (p: Platform) => t[p.type] || p.type },
                    { k: t.rating, f: (p: Platform) => <Stars value={p.rating} /> },
                    { k: t.fees, f: (p: Platform) => p.fees },
                    { k: t.features, f: (p: Platform) => p.features.join(" · ") },
                    { k: t.pros, f: (p: Platform) => <ul className="space-y-1">{p.pros.map((x) => <li key={x} className="flex gap-1.5"><Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />{x}</li>)}</ul> },
                    { k: t.cons, f: (p: Platform) => <ul className="space-y-1">{p.cons.map((x) => <li key={x} className="flex gap-1.5"><X size={15} className="text-rose-500 shrink-0 mt-0.5" />{x}</li>)}</ul> },
                    { k: t.bestFor, f: (p: Platform) => p.bestFor },
                  ].map((row) => (
                    <tr key={row.k}>
                      <td className="p-3 font-semibold text-text-3 align-top">{row.k}</td>
                      {compared.map((p) => (
                        <td key={p.id} className="p-3 text-text align-top">{row.f(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CARDS */}
        <div className="mt-6 mb-3 text-sm text-text-3">
          <b className="text-text">{filtered.length}</b> {t.results}
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-text-3 bg-surface border border-border rounded-2xl">{t.noResult}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const isSel = selected.includes(p.id);
              return (
                <article key={p.id} className={cn("flex flex-col bg-surface border rounded-2xl p-5 shadow-sm transition-all", isSel ? "border-pv-blue ring-4 ring-pv-blue/10" : "border-border hover:shadow-md")}>
                  <div className="flex items-start gap-4">
                    <PlatformLogo p={p} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-text leading-tight">{p.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-pv-blue bg-pv-blue/10 px-2 py-0.5 rounded-md">{t[p.type] || p.type}</span>
                        <Stars value={p.rating} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Wallet size={15} className="text-text-3" />
                    <span className="text-text-3">{t.fees}:</span>
                    <span className="font-semibold text-text">{p.fees}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.features.map((f) => (
                      <span key={f} className="text-xs font-medium text-text-2 bg-surface-2 border border-border px-2 py-1 rounded-md">{f}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-4 text-sm">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">{t.pros}</div>
                      <ul className="space-y-1">
                        {p.pros.map((x) => (
                          <li key={x} className="flex gap-1.5 text-text"><Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">{t.cons}</div>
                      <ul className="space-y-1">
                        {p.cons.map((x) => (
                          <li key={x} className="flex gap-1.5 text-text"><X size={15} className="text-rose-500 shrink-0 mt-0.5" />{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-text-2 bg-surface-2/70 rounded-xl p-3">
                    <b className="text-text">{t.bestFor}:</b> {p.bestFor}
                  </p>

                  <div className="flex gap-2 mt-auto pt-4">
                    <button
                      onClick={() => toggle(p.id)}
                      disabled={!isSel && selected.length >= 3}
                      className={cn(
                        "flex-1 h-10 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-40",
                        isSel ? "bg-pv-blue text-white border-pv-blue" : "bg-surface text-text border-border hover:border-pv-blue"
                      )}
                    >
                      {isSel ? <span className="inline-flex items-center gap-1.5"><Check size={15} /> {t.compare}</span> : t.compare}
                    </button>
                    {WEBSITES[p.id] && (
                      <a
                        href={WEBSITES[p.id]}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex-1 h-10 rounded-xl text-sm font-semibold bg-text text-bg inline-flex items-center justify-center gap-1.5 hover:opacity-90"
                      >
                        {t.visit} <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* OVERVIEW TABLE */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-text mb-4">{t.overview}</h2>
          <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-3">
                <tr>
                  <th className="p-3">{t.platform}</th>
                  <th className="p-3">{t.category}</th>
                  <th className="p-3">{t.rating}</th>
                  <th className="p-3">{t.fees}</th>
                  <th className="p-3">{t.bestFor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2/60">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <PlatformLogo p={p} size={28} />
                        <span className="font-semibold text-text">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-text-2">{t[p.type] || p.type}</td>
                    <td className="p-3"><Stars value={p.rating} /></td>
                    <td className="p-3 text-text">{p.fees}</td>
                    <td className="p-3 text-text-2">{p.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* GUIDE */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-text mb-4">{t.guideTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guide.map((g) => (
              <div key={g.t} className="bg-surface border border-border rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-pv-blue/10 text-pv-blue flex items-center justify-center mb-3">{g.icon}</div>
                <h3 className="font-semibold text-text text-base">{g.t}</h3>
                <p className="text-sm text-text-2 mt-1.5 leading-relaxed">{g.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
          <b>{t.disclaimerTitle}.</b> {t.disclaimer}
        </section>
      </div>
    </MobileZoomWrapper>
  );
}
