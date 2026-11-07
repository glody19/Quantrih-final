import type { Metadata } from "next";
import { CallToAction, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "À propos", description: "Quantrih Office, coordination patrimoniale à Louvain-la-Neuve, pour toute la Belgique." };

export default function APropos() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Un coordinateur patrimonial, pensé pour durer."
        lead="Quantrih Office est né d'un constat : les familles et les personnes disposant d'un patrimoine important ont besoin d'une vision d'ensemble et d'un coordinateur de confiance, sans devoir créer leur propre structure."
      />
      <Section>
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="eyebrow">Notre mission</div>
            <h2 className="mt-4 text-[2.3rem] leading-tight">Rendre accessible un accompagnement patrimonial structuré.</h2>
          </div>
          <div className="space-y-5 leading-relaxed text-slate">
            <p>
              Basés à Louvain-la-Neuve, nous accompagnons des patrimoines de 1 à plus de 20 millions d&apos;euros. Notre rôle est celui d&apos;un chef d&apos;orchestre : comprendre votre situation dans son ensemble, et faire travailler ensemble les meilleurs professionnels.
            </p>
            <p>
              Notre horizon se compte en décennies. C&apos;est pourquoi nous avons organisé la continuité de nos services dès le premier jour : dossiers documentés, procédures écrites, et relais contractuel en cas d&apos;indisponibilité.
            </p>
          </div>
        </div>
      </Section>
      <Section tone="paper">
        <div className="eyebrow">Fondateur</div>
        <div className="mt-6 grid gap-10 md:grid-cols-[240px_1fr]">
          <div className="aspect-[4/5] rounded-2xl bg-sand" role="img" aria-label="Photo du fondateur (à venir)" />
          <div>
            <h2 className="text-3xl">Le fondateur</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate">
              {/* À compléter : parcours, formation, convictions. */}
              Présentation du parcours, de la formation et des convictions du fondateur — à compléter.
            </p>
          </div>
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
