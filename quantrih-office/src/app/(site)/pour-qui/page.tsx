import type { Metadata } from "next";
import { CallToAction, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "Pour qui", description: "Familles, entrepreneurs et particuliers disposant d'un patrimoine important." };

const PROFILES = [
  {
    title: "Les familles",
    lead: "Plusieurs générations, plusieurs structures, des objectifs qui doivent rester alignés.",
    situations: ["Préparer la transmission aux enfants et petits-enfants", "Réunir des avoirs dispersés entre plusieurs banques et pays", "Coordonner notaire, avocat et fiscaliste autour d'un même plan"],
  },
  {
    title: "Les entrepreneurs",
    lead: "Votre entreprise est souvent votre premier actif. Avant, pendant et après une cession.",
    situations: ["Préparer la cession ou la transmission de l'entreprise", "Structurer une holding et organiser la trésorerie", "Réinvestir le produit d'une cession avec méthode"],
  },
  {
    title: "Les particuliers",
    lead: "Un patrimoine important, mais pas le temps de le piloter soi-même.",
    situations: ["Obtenir enfin une vision claire et consolidée", "Comparer et challenger vos banques et gérants", "Déléguer la coordination, garder la décision"],
  },
];

export default function PourQui() {
  return (
    <>
      <PageHero
        eyebrow="Pour qui"
        title="Pour celles et ceux dont le patrimoine mérite un pilote."
        lead="Nous accompagnons des patrimoines nets à partir de 1 million d'euros : des familles, des entrepreneurs et des particuliers qui ont un réel besoin de coordination et souhaitent faire fructifier, préserver ou transmettre."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          {PROFILES.map((p) => (
            <article key={p.title} className="card flex flex-col p-8">
              <h2 className="text-3xl">{p.title}</h2>
              <p className="mt-3 leading-relaxed text-slate">{p.lead}</p>
              <div className="eyebrow mt-8">Situations fréquentes</div>
              <ul className="mt-4 space-y-3 text-[0.95rem]">
                {p.situations.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
