import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Rendez-vous découverte", description: "Demandez un premier rendez-vous, sans engagement, à Louvain-la-Neuve ou en visioconférence." };

export default function Contact() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <div className="eyebrow">Rendez-vous découverte</div>
        <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-[3.4rem]">Faisons connaissance.</h1>
        <p className="mt-6 leading-relaxed text-slate">
          Un premier échange de 45 minutes, sans engagement, pour comprendre votre situation, vos objectifs et la manière dont nous pourrions vous accompagner.
        </p>
        <dl className="mt-10 space-y-5 border-t border-line pt-6 text-sm">
          <div>
            <dt className="eyebrow !text-slate">Où</dt>
            <dd className="mt-1">{CONTACT.city} ou visioconférence</dd>
          </div>
          <div>
            <dt className="eyebrow !text-slate">Écrire</dt>
            <dd className="mt-1">
              <a href={`mailto:${CONTACT.email}`} className="underline">
                {CONTACT.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="eyebrow !text-slate">Confidentialité</dt>
            <dd className="mt-1 text-slate">Vos informations restent strictement confidentielles et hébergées dans l&apos;Union européenne.</dd>
          </div>
        </dl>
      </div>
      <LeadForm />
    </section>
  );
}
