import { WITHDRAWAL_DAYS } from "@/lib/belgium";
import { DEFAULT_FEE_GRID } from "@/lib/fees";
import { percent } from "@/lib/format";

/** Version en vigueur de la lettre de mission. Toute modification du texte doit changer ce numéro. */
export const ENGAGEMENT_VERSION = "LM-2026-11-2";

/** Texte de la lettre de mission (modèle à faire valider par un avocat avant la mise en production). */
export function engagementClauses() {
  const [b1, b2, b3] = DEFAULT_FEE_GRID.brackets;
  return [
    {
      title: "1. Objet de la mission",
      text: "Quantrih Office est chargé d'une mission de coordination patrimoniale : consolider la vision de votre patrimoine, établir un diagnostic factuel (inventaire, cartographie, points d'attention), identifier et coordonner, avec votre accord, les professionnels habilités à vous conseiller, et vous rendre compte régulièrement. Toute recommandation juridique, fiscale, successorale ou d'investissement est émise et signée par le professionnel habilité qui en est l'auteur.",
    },
    {
      title: "2. Ce que la mission ne comprend pas",
      text: "Quantrih Office ne fournit ni conseil en investissement ni gestion de portefeuille au sens de la loi du 25 octobre 2016, ni consultation en planification financière au sens de la loi du 25 avril 2014, n'exerce aucune intermédiation bancaire, d'assurance ou de crédit, ne détient ni fonds ni titres, ne dispose d'aucune procuration sur vos comptes et ne fournit pas de conseil juridique, notarial ou comptable. Ces prestations sont réalisées par des professionnels agréés (FSMA, ITAA, barreau, notariat), mandatés avec votre accord, qui en restent seuls responsables. Les décisions vous appartiennent.",
    },
    {
      title: "3. Honoraires",
      text: `Honoraire annuel de coordination calculé par tranches sur le patrimoine coordonné : ${percent(b1!.rate)} jusqu'à 5 M€, ${percent(b2!.rate)} de 5 à 10 M€, ${percent(b3!.rate)} au-delà, majoré de la TVA (${Math.round(DEFAULT_FEE_GRID.vatRate * 100)} %). Facturation trimestrielle à terme échu, sur la base de la dernière valorisation consolidée. Les prestations des partenaires sont facturées directement par eux, sur devis préalablement accepté par vous.`,
    },
    {
      title: "4. Rétrocessions",
      text: "Quantrih Office ne conserve aucune rétrocession ni commission. Nous demandons que toute rétrocession vous soit versée directement, ou que vous soyez placé dans des catégories de parts qui n'en comportent pas ; si un montant nous parvenait malgré tout, il vous serait intégralement divulgué et reversé, et inscrit au registre consultable dans votre espace client. Nous ne payons ni ne recevons aucune commission d'apport.",
    },
    {
      title: "5. Confidentialité et données personnelles",
      text: "Vos informations sont traitées conformément au RGPD et à la loi belge du 30 juillet 2018, hébergées dans l'Union européenne et chiffrées. Elles ne sont communiquées à un professionnel qu'avec votre autorisation explicite, révocable à tout moment.",
    },
    {
      title: "6. Lutte contre le blanchiment",
      text: "Vos partenaires bancaires, notariaux et fiscaux sont tenus, en vertu de la loi du 18 septembre 2017, de vérifier votre identité, celle des bénéficiaires effectifs et l'origine des fonds. Quantrih Office réunit ces informations avec vous, à titre volontaire, et peut refuser ou suspendre la mission si elles ne peuvent être obtenues. Votre numéro de registre national n'est jamais demandé.",
    },
    {
      title: "7. Durée, résiliation et rétractation",
      text: `La mission est conclue pour une durée indéterminée et peut être résiliée par chaque partie moyennant un préavis de trois mois. Si vous agissez en tant que consommateur, vous disposez d'un délai de rétractation de ${WITHDRAWAL_DAYS} jours à compter de la signature (Code de droit économique, livre VI), sans frais ni motif. Si vous demandez que la mission commence pendant ce délai, seules les prestations déjà réalisées vous seront facturées en cas de rétractation.`,
    },
    {
      title: "8. Réclamations et médiation",
      text: "Toute réclamation peut être adressée par écrit à Quantrih Office, qui y répond dans un délai de quinze jours ouvrables. À défaut de solution, si vous agissez en tant que consommateur, vous pouvez vous adresser gratuitement au Service de médiation pour le consommateur (mediationconsommateur.be), sans préjudice de votre droit de saisir le juge.",
    },
    {
      title: "9. Droit applicable et juridiction",
      text: "La mission est régie par le droit belge. Si vous agissez en tant que consommateur, les litiges relèvent des juridictions désignées par la loi, notamment celles de votre domicile. Si vous agissez pour les besoins d'une société ou d'une activité professionnelle, les juridictions de l'arrondissement judiciaire du Brabant wallon sont seules compétentes.",
    },
  ];
}
