import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Réclamations et médiation" };

export default function Plaintes() {
  return (
    <LegalPage title="Réclamations et médiation">
      <h2>1. Nous écrire</h2>
      <p>
        Une insatisfaction ? Écrivez-nous à <a className="underline" href={`mailto:${CONTACT.email}?subject=R%C3%A9clamation`}>{CONTACT.email}</a> ou par courrier à notre siège, en décrivant la situation et ce que vous attendez. Nous accusons réception sous deux jours ouvrables et répondons sur le fond dans un délai de quinze jours ouvrables.
      </p>
      <h2>2. Médiation</h2>
      <p>
        Si notre réponse ne vous satisfait pas et que vous agissez en tant que consommateur, vous pouvez vous adresser gratuitement au <strong>Service de médiation pour le consommateur</strong> (mediationconsommateur.be), compétent pour notre activité.
      </p>
      <h2>3. Juridictions</h2>
      <p>La médiation ne vous prive pas du droit de saisir le juge. Si vous agissez en tant que consommateur, vous pouvez notamment saisir le juge de votre domicile.</p>
    </LegalPage>
  );
}
