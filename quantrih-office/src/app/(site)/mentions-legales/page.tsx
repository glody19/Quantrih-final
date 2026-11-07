import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>Quantrih Office — [forme juridique], siège social à {CONTACT.city}, {CONTACT.country}. Numéro d&apos;entreprise (BCE) : [à compléter]. Contact : {CONTACT.email}.</p>
      <h2>Nature de l&apos;activité</h2>
      <p>
        Quantrih Office exerce une activité de coordination patrimoniale. Quantrih Office ne fournit ni conseil en investissement ni gestion de portefeuille au sens de la loi du 25 octobre 2016, ni consultation en planification financière au sens de la loi du 25 avril 2014. Il n&apos;est pas un établissement de crédit, n&apos;exerce aucune intermédiation bancaire, d&apos;assurance ou de crédit, et ne fournit pas de conseil juridique ou fiscal. Ces services sont fournis, le cas échéant, par des professionnels dûment habilités (FSMA, ITAA, barreau, notariat), qui en restent seuls responsables. Quantrih Office ne conserve aucune rétrocession et ne paie ni ne reçoit de commission d&apos;apport.
      </p>
      <h2>Réclamations</h2>
      <p>Voir la page <a href="/plaintes" className="underline">Réclamations et médiation</a>.</p>
      <h2>Hébergement</h2>
      <p>Le site et l&apos;espace client sont hébergés dans l&apos;Union européenne. [Nom et adresse de l&apos;hébergeur à compléter.]</p>
      <h2>Propriété intellectuelle</h2>
      <p>L&apos;ensemble des contenus de ce site est la propriété de Quantrih Office, sauf mention contraire.</p>
    </LegalPage>
  );
}
