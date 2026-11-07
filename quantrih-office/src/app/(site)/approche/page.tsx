import type { Metadata } from "next";
import { CallToAction, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "Notre approche", description: "Le rôle de coordinateur patrimonial : ce que fait Quantrih Office, et ce qu'il ne fait pas." };

const DO = [
  "Réunir l'ensemble de votre patrimoine dans une vision consolidée et tenue à jour.",
  "Établir un diagnostic patrimonial factuel : inventaire, cartographie, points d'attention.",
  "Réunir les avis des professionnels habilités (notaire, avocat, conseiller fiscal) et en faciliter la lecture.",
  "Identifier, mandater et coordonner les professionnels adaptés à chaque besoin.",
  "Organiser vos décisions : calendrier, coûts annoncés, documents à réunir.",
  "Suivre l'exécution et vous rendre compte de manière régulière.",
];
const DONT = [
  "Prendre des décisions d'investissement à votre place.",
  "Vendre des produits financiers ou percevoir des commissions pour notre compte.",
  "Intervenir dans la gouvernance ou l'éducation de votre famille.",
  "Nous substituer à vos avocats, notaires, banquiers ou experts-comptables, ni vous adresser nous-mêmes des recommandations juridiques, fiscales ou d'investissement.",
];

export default function Approche() {
  return (
    <>
      <PageHero
        eyebrow="Notre approche"
        title="Le chef d'orchestre de votre patrimoine."
        lead="Nous offrons une vision globale de votre situation et coordonnons les professionnels nécessaires à la réalisation de vos objectifs. Ils restent responsables de leurs prestations ; vous gardez la décision finale."
      />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="card p-8">
            <div className="eyebrow">Ce que nous faisons</div>
            <ul className="mt-6 space-y-4">
              {DO.map((d) => (
                <li key={d} className="flex gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line p-8">
            <div className="eyebrow !text-slate">Ce que nous ne faisons pas</div>
            <ul className="mt-6 space-y-4 text-slate">
              {DONT.map((d) => (
                <li key={d} className="flex gap-3 leading-relaxed">
                  <span className="mt-2 h-px w-3 shrink-0 bg-slate" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section tone="paper">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="eyebrow">Indépendance</div>
            <h2 className="mt-4 text-[2.3rem] leading-tight">Aucun conflit d&apos;intérêts, par construction.</h2>
          </div>
          <div className="space-y-5 leading-relaxed text-slate">
            <p>Notre seule rémunération est celle que vous nous versez. Nous ne fabriquons aucun produit et ne sommes liés à aucune banque.</p>
            <p>Lorsqu&apos;un partenaire exécutant nous verse une rétrocession, elle vous est intégralement reversée et apparaît, ligne par ligne, dans votre espace client.</p>
            <p>Nous choisissons les professionnels pour leur compétence et leur adéquation à votre situation, et vous pouvez à tout moment travailler avec vos propres conseils.</p>
          </div>
        </div>
      </Section>
      <Section>
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="eyebrow">Confidentialité</div>
            <h2 className="mt-4 text-[2.3rem] leading-tight">Vos informations ne circulent qu&apos;avec votre accord.</h2>
          </div>
          <div className="space-y-5 leading-relaxed text-slate">
            <p>Vous décidez, partenaire par partenaire, quelles informations peuvent être partagées. Chaque consentement est révocable à tout moment depuis votre espace.</p>
            <p>Vos données sont hébergées dans l&apos;Union européenne, chiffrées, et chaque consultation est tracée.</p>
          </div>
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
