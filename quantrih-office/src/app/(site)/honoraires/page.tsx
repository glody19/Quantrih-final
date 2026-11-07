import type { Metadata } from "next";
import { FeeSimulator } from "@/components/site/FeeSimulator";
import { CallToAction, PageHero, Section } from "@/components/site/ui";
import { DEFAULT_FEE_GRID } from "@/lib/fees";
import { percent } from "@/lib/format";

export const metadata: Metadata = { title: "Honoraires", description: "Des honoraires publiés, dégressifs et sans commission cachée. 100 % des rétrocessions reversées." };

const labels = ["Jusqu'à 5 M€", "De 5 à 10 M€", "Au-delà de 10 M€"];

export default function Honoraires() {
  return (
    <>
      <PageHero
        eyebrow="Honoraires"
        title="Des honoraires publiés. Rien de caché."
        lead="Notre rémunération est simple : un honoraire annuel de coordination, dégressif selon la taille du patrimoine coordonné. Nous ne touchons aucune commission sur des produits."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="eyebrow">Grille de coordination</div>
            <h2 className="mt-4 text-[2.2rem] leading-tight">Un taux par tranche, comme un barème.</h2>
            <p className="mt-5 leading-relaxed text-slate">
              Chaque taux s&apos;applique uniquement à la part du patrimoine comprise dans sa tranche. Plus le patrimoine coordonné est important, plus le taux effectif diminue.
            </p>
            <table className="num mt-8 w-full border-t border-navy text-left">
              <tbody>
                {DEFAULT_FEE_GRID.brackets.map((b, i) => (
                  <tr key={i} className="border-b border-line">
                    <th scope="row" className="py-4 font-normal">
                      {labels[i]}
                    </th>
                    <td className="serif py-4 text-right text-2xl">{percent(b.rate)} / an</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-slate">Montants hors TVA (21 %). Les prestations des partenaires (notaire, avocat, expert-comptable…) sont facturées par eux, sur devis préalable validé par vous.</p>

            <div className="mt-12 rounded-2xl bg-navy p-8 text-ivory">
              <div className="eyebrow !text-gold">Notre engagement</div>
              <h3 className="mt-3 text-2xl">100 % des rétrocessions vous sont reversées.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/70">
                Si un partenaire exécutant nous verse une rétrocession, elle est intégralement divulguée et reversée. Vous la retrouvez, ligne par ligne, dans votre espace client.
              </p>
            </div>
          </div>
          <FeeSimulator />
        </div>
      </Section>
      <Section tone="paper">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ["Diagnostic patrimonial", "Le premier inventaire et le diagnostic font l'objet d'un forfait annoncé avant le démarrage."],
            ["Missions ponctuelles", "Cession d'entreprise, financement, création de holding : un honoraire fixé à l'avance, par écrit."],
            ["Sans surprise", "Aucun frais d'entrée, aucun frais de sortie. Vous pouvez mettre fin à la mission selon les termes de la lettre de mission."],
          ].map(([t, d]) => (
            <div key={t} className="border-t border-navy pt-6">
              <h3 className="text-2xl">{t}</h3>
              <p className="mt-3 leading-relaxed text-slate">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
