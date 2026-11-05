import { WITHDRAWAL_DAYS } from "@/lib/belgium";
import { DEFAULT_FEE_GRID } from "@/lib/fees";
import { percent } from "@/lib/format";

/** Version en vigueur de la lettre de mission. Toute modification du texte doit changer ce numéro. */
export const ENGAGEMENT_VERSION = "LM-2026-11";

/** Texte de la lettre de mission (modèle à faire valider par un avocat avant la mise en production). */
export function engagementClauses() {
  const [b1, b2, b3] = DEFAULT_FEE_GRID.brackets;
  return [
    {
      title: "1. Objet de la mission",
      text: "Quantrih Office est chargé d'une mission de coordination patrimoniale : consolider la vision de votre patrimoine, réaliser un audit patrimonial, identifier et coordonner les professionnels nécessaires à vos objectifs, et vous rendre compte régulièrement.",
    },
    {
      title: "2. Ce que la mission ne comprend pas",
      text: "Quantrih Office ne fournit ni conseil en investissement ni gestion de portefeuille au sens de la loi du 25 octobre 2016, n'exerce pas d'intermédiation en assurance ou en crédit, et ne fournit pas de conseil juridique, notarial ou comptable. Ces prestations sont réalisées par des professionnels agréés (FSMA, ITAA, barreau, notariat), mandatés avec votre accord, qui en restent seuls responsables. Les décisions vous appartiennent.",
    },
    {
      title: "3. Honoraires",
      text: `Honoraire annuel de coordination calculé par tranches sur le patrimoine coordonné : ${percent(b1!.rate)} jusqu'à 5 M€, ${percent(b2!.rate)} de 5 à 10 M€, ${percent(b3!.rate)} au-delà, majoré de la TVA (${Math.round(DEFAULT_FEE_GRID.vatRate * 100)} %). Facturation trimestrielle à terme échu, sur la base de la dernière valorisation consolidée. Les prestations des partenaires sont facturées directement par eux, sur devis préalablement accepté par vous.`,
    },
    {
      title: "4. Rétrocessions",
      text: "Toute rétrocession, commission ou avantage versé à Quantrih Office par un partenaire exécutant vous est intégralement divulgué et reversé. Le registre des rétrocessions est consultable dans votre espace client.",
    },
    {
      title: "5. Confidentialité et données personnelles",
      text: "Vos informations sont traitées conformément au RGPD et à la loi belge du 30 juillet 2018, hébergées dans l'Union européenne et chiffrées. Elles ne sont communiquées à un professionnel qu'avec votre autorisation explicite, révocable à tout moment.",
    },
    {
      title: "6. Lutte contre le blanchiment",
      text: "Conformément à la loi du 18 septembre 2017, Quantrih Office et ses partenaires peuvent être tenus de vérifier votre identité, celle des bénéficiaires effectifs et l'origine des fonds, et de conserver ces informations pendant dix ans.",
    },
    {
      title: "7. Durée, résiliation et rétractation",
      text: `La mission est conclue pour une durée indéterminée et peut être résiliée par chaque partie moyennant un préavis de trois mois. Si vous agissez en tant que consommateur, vous disposez d'un délai de rétractation de ${WITHDRAWAL_DAYS} jours à compter de la signature (Code de droit économique, livre VI), sans frais ni motif. Si vous demandez que la mission commence pendant ce délai, seules les prestations déjà réalisées vous seront facturées en cas de rétractation.`,
    },
    {
      title: "8. Droit applicable et litiges",
      text: "La mission est régie par le droit belge. Tout litige relève des juridictions de l'arrondissement du Brabant wallon, sans préjudice des règles protectrices des consommateurs. Vous pouvez également vous adresser au Service de médiation pour le consommateur.",
    },
  ];
}
