import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>Quantrih Office, {CONTACT.city}. Contact : {CONTACT.email}.</p>
      <h2>Données collectées</h2>
      <p>Formulaire de contact : identité, coordonnées, situation et fourchette de patrimoine déclarées. Espace client : données d&apos;identification, informations patrimoniales et documents que vous nous confiez dans le cadre de la mission.</p>
      <h2>Finalités et bases légales</h2>
      <p>Répondre à votre demande (consentement), exécuter la lettre de mission (contrat), respecter nos obligations légales (obligation légale).</p>
      <h2>Destinataires</h2>
      <p>Vos données ne sont partagées avec des professionnels partenaires qu&apos;avec votre accord explicite, partenaire par partenaire, révocable à tout moment depuis votre espace.</p>
      <h2>Hébergement et sécurité</h2>
      <p>Données hébergées dans l&apos;Union européenne, chiffrées en transit et au repos ; accès protégé par double authentification ; journal de toutes les consultations.</p>
      <h2>Durées de conservation</h2>
      <p>Demandes de contact sans suite : 12 mois. Dossiers clients : durée de la relation, puis durée légale de conservation. [À préciser.]</p>
      <h2>Vos droits</h2>
      <p>Accès, rectification, effacement, limitation, portabilité et opposition : écrivez à {CONTACT.email}. Vous pouvez introduire une réclamation auprès de l&apos;Autorité de protection des données (Belgique).</p>
      <h2>Cookies</h2>
      <p>Ce site n&apos;utilise que des cookies strictement nécessaires (session de l&apos;espace client). Aucun cookie publicitaire ni de suivi.</p>
    </LegalPage>
  );
}
