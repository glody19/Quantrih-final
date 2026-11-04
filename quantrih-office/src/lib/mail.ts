import "server-only";
import { Resend } from "resend";

/** Envoie un e-mail si Resend est configuré ; sinon ne fait rien (développement local). Jamais de données patrimoniales. */
export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const };
  const resend = new Resend(key);
  const from = process.env.MAIL_FROM ?? "Quantrih Office <bonjour@quantrih-office.be>";
  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) console.error("Envoi d'e-mail impossible :", error.message);
  return { sent: !error };
}
