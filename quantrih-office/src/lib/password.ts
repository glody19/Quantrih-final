/** Règles de mot de passe, partagées par les formulaires (indicateur de robustesse) et le serveur (contrôle). */

export const MIN_PASSWORD = 12;

/** Mots de passe parmi les plus utilisés, refusés même s'ils sont assez longs. */
const COMMON = [
  "123456789012", "azertyuiop12", "motdepasse123", "password1234", "qwertyuiop12", "bonjour12345",
  "quantrihoffice", "quantrih1234", "welkom123456", "wachtwoord12", "000000000000", "111111111111",
  "azertyuiopqs", "password123!", "motdepasse12", "abcdefghijkl", "iloveyou1234", "soleil123456",
];

export function passwordProblem(pw: string, email?: string | null): string | null {
  if (pw.length < MIN_PASSWORD) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;
  const low = pw.toLowerCase();
  if (COMMON.includes(low)) return "Ce mot de passe est trop courant. Choisissez-en un autre.";
  if (/^(.)\1+$/.test(pw)) return "Le mot de passe ne peut pas répéter un seul caractère.";
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && low.includes(local)) return "Le mot de passe ne doit pas contenir votre adresse email.";
  return null;
}

/** Score de 0 à 4 pour l'indicateur : longueur et variété des caractères. */
export function passwordScore(pw: string) {
  if (!pw) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  let s = 0;
  if (pw.length >= MIN_PASSWORD) s++;
  if (pw.length >= 16) s++;
  if (kinds >= 3) s++;
  if (kinds === 4 || pw.length >= 20) s++;
  if (pw.length < MIN_PASSWORD) s = Math.min(s, 1);
  return s;
}
