import Link from "next/link";
import { ConsolidatedPreview } from "@/components/site/ConsolidatedPreview";
import { Orchestra } from "@/components/site/Orchestra";
import { CallToAction, Section } from "@/components/site/ui";
import { SERVICES } from "@/lib/content";

const PILLARS = [
  { n: "01", title: "Vision consolidée", text: "Tous vos comptes, banques, sociétés et biens réunis en un seul endroit, à jour et documentés. Vous savez enfin ce que vous possédez, où, et comment cela évolue." },
  { n: "02", title: "Coordination", text: "Un interlocuteur unique qui mandate, briefe et suit vos banquiers, avocats, notaires et fiscalistes. Ils restent responsables de leurs prestations ; vous gardez la décision." },
  { n: "03", title: "Transparence", text: "Des honoraires clairs, publiés, sans commission cachée. Toute rétrocession versée par un partenaire vous est intégralement reversée, et vous le voyez dans votre espace." },
];

const STEPS = [
  ["Rendez-vous découverte", "Comprendre votre situation, vos objectifs et vos inquiétudes."],
  ["Diagnostic patrimonial", "Inventaire complet, cartographie de vos structures et points d'attention."],
  ["Mise en relation", "Les professionnels habilités à vous conseiller sur chaque point, choisis avec vous."],
  ["Coordination", "Nous orchestrons l'exécution et vous rendons compte à chaque étape."],
  ["Suivi dans la durée", "Reporting consolidé, revues régulières, et un horizon de plusieurs décennies."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="eyebrow">Coordination patrimoniale · Louvain-la-Neuve</div>
            <h1 className="mt-6 text-[2.9rem] leading-[1.02] md:text-[4.4rem]">
              Une vision complète de votre patrimoine. <em className="text-gold-dark">Un seul chef d&apos;orchestre.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate">
              Quantrih Office accompagne les familles, les entrepreneurs et les particuliers de toute la Belgique dont le patrimoine dépasse 1 million d&apos;euros. Nous réunissons l&apos;ensemble de vos avoirs dans une vision consolidée et coordonnons les professionnels qui vous conseillent : notaires, avocats, conseillers fiscaux, banques.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Prendre un rendez-vous découverte
              </Link>
              <Link href="/approche" className="btn btn-ghost">
                Découvrir notre approche
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6 text-sm">
              <div>
                <dt className="text-slate">Patrimoines accompagnés</dt>
                <dd className="serif mt-1 text-2xl">1 à 20 M€+</dd>
              </div>
              <div>
                <dt className="text-slate">Rétrocessions reversées</dt>
                <dd className="serif mt-1 text-2xl">100 %</dd>
              </div>
              <div>
                <dt className="text-slate">Horizon</dt>
                <dd className="serif mt-1 text-2xl">Générationnel</dd>
              </div>
            </dl>
          </div>
          <ConsolidatedPreview />
        </div>
      </section>

      <Section>
        <div className="eyebrow">Ce qui nous distingue</div>
        <h2 className="mt-4 max-w-2xl text-[2.3rem] leading-tight md:text-[3rem]">Entre la banque privée et le conseiller isolé, une troisième voie.</h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="border-t border-navy pt-6">
              <div className="serif text-gold-dark">{p.n}</div>
              <h3 className="mt-3 text-2xl">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-slate">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="eyebrow">Le chef d&apos;orchestre</div>
            <h2 className="mt-4 text-[2.3rem] leading-tight md:text-[3rem]">Vos professionnels jouent enfin la même partition.</h2>
            <p className="mt-6 leading-relaxed text-slate">
              Un patrimoine important mobilise souvent une dizaine d&apos;intervenants qui ne se parlent pas. Nous sommes le point de convergence : nous partageons l&apos;information utile, avec votre accord, fixons les échéances et veillons à la cohérence de l&apos;ensemble.
            </p>
            <ul className="mt-6 space-y-3 text-[0.95rem]">
              <li className="flex gap-3"><Check /> Les professionnels mandatés restent responsables de leurs prestations.</li>
              <li className="flex gap-3"><Check /> Vous conservez toujours la décision finale.</li>
              <li className="flex gap-3"><Check /> Nous ne vendons aucun produit financier.</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Orchestra />
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">Services coordonnés</div>
            <h2 className="mt-4 max-w-xl text-[2.3rem] leading-tight md:text-[3rem]">Tout votre patrimoine, sous un même regard.</h2>
          </div>
          <Link href="/services" className="btn btn-ghost self-start md:self-auto">
            Tous les services
          </Link>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.slice(0, 8).map((s) => (
            <div key={s.key} className="bg-paper p-6">
              <h3 className="text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <div className="eyebrow">Notre méthode</div>
        <h2 className="mt-4 max-w-2xl text-[2.3rem] leading-tight md:text-[3rem]">Cinq étapes, puis un accompagnement dans la durée.</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-5">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <div className="num serif text-4xl text-gold-dark">{i + 1}</div>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">Votre espace client</div>
            <h2 className="mt-4 text-[2.3rem] leading-tight md:text-[3rem]">Votre patrimoine, consultable à tout moment.</h2>
            <p className="mt-6 leading-relaxed text-slate">
              Un espace sécurisé, hébergé en Europe et protégé par double authentification : vision consolidée, documents, suivi des projets en cours et transparence complète sur nos honoraires.
            </p>
            <Link href="/connexion" className="btn btn-primary mt-8">
              Accéder à mon espace
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ["Patrimoine consolidé", "Par classe d'actifs, par titulaire, par établissement."],
              ["Coffre-fort documentaire", "Actes, contrats et relevés, classés et partagés sous contrôle."],
              ["Suivi des projets", "Succession, cession, financement : étapes et responsables."],
              ["Honoraires transparents", "Calcul détaillé et registre des rétrocessions reversées."],
            ].map(([t, d]) => (
              <li key={t} className="card p-5">
                <h3 className="text-lg">{t}</h3>
                <p className="mt-1.5 text-sm text-slate">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CallToAction />
    </>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="#B08D57" />
      <path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="#B08D57" strokeWidth="1.6" />
    </svg>
  );
}
