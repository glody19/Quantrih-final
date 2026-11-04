import type { Metadata } from "next";
import { CallToAction, PageHero, Section } from "@/components/site/ui";
import { SERVICES } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "Les douze domaines que Quantrih Office coordonne pour vous, avec des professionnels agréés." };

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Douze domaines, un seul point de contact."
        lead="Nous coordonnons chaque sujet avec des professionnels agréés et indépendants. Pour chaque service, vous savez qui fait quoi, et qui en est responsable."
      />
      <Section>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <article key={s.key} className="flex flex-col bg-paper p-8">
              <div className="num serif text-gold-dark">{String(i + 1).padStart(2, "0")}</div>
              <h2 className="mt-3 text-2xl">{s.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-slate">{s.text}</p>
              <p className="mt-6 border-t border-line pt-4 text-xs uppercase tracking-wider text-slate">
                {s.key === "consolidation" || s.key === "audit" || s.key === "coordination" ? "Réalisé par Quantrih Office" : "Coordonné par Quantrih Office · réalisé par un partenaire agréé"}
              </p>
            </article>
          ))}
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
