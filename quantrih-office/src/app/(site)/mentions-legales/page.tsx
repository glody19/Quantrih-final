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
        Quantrih Office exerce une activité de coordination patrimoniale. Quantrih Office ne fournit pas de conseil en investissement ni de service de gestion de portefeuille au sens de la loi du 25 octobre 2016, n&apos;est pas un établissement de crédit et n&apos;exerce pas d&apos;intermédiation en assurance ou en crédit. Ces services sont fournis, le cas échéant, par des professionnels dûment agréés, qui en restent seuls responsables.
      </p>
      <h2>Hébergement</h2>
      <p>Le site et l&apos;espace client sont hébergés dans l&apos;Union européenne. [Nom et adresse de l&apos;hébergeur à compléter.]</p>
      <h2>Propriété intellectuelle</h2>
      <p>L&apos;ensemble des contenus de ce site est la propriété de Quantrih Office, sauf mention contraire.</p>
    </LegalPage>
  );
}
