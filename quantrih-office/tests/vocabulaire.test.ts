import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Garde-fou réglementaire (plan v2, §2) : tant que le statut FSMA n'est pas tranché, certains termes
 * sont proscrits dans tout le code source (site, portail, e-mails, lettre de mission).
 * La loi du 25 avril 2014 protège le titre de planificateur financier ; la FSMA a sanctionné en 2022
 * la dénomination « Family Office Indépendant ».
 */
const FORBIDDEN = [
  /family office ind[ée]pendant/i,
  /planificat(eur|rice)/i,
  /financial planner/i,
  /nous optimisons/i,
  /optimisation (fiscale|patrimoniale)/i,
  /planification (financi[eè]re|successorale|patrimoniale)/i,
  /audit patrimonial/i,
  /strat[ée]gie patrimoniale/i,
];
// Seules ces mentions sont permises : elles décrivent ce que nous NE faisons PAS.
const ALLOWED = [/ni consultation en planification financi[eè]re au sens de la loi du 25 avril 2014/i, /planification financi[eè]re \(sauf agr[ée]ment\)/i];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|md)$/.test(f) ? [p] : [];
  });
}

describe("vocabulaire réglementaire", () => {
  it("aucun terme proscrit dans src/", () => {
    const hits: string[] = [];
    for (const f of files(path.resolve(__dirname, "../src"))) {
      readFileSync(f, "utf8")
        .split("\n")
        .forEach((line, i) => {
          const cleaned = ALLOWED.reduce((l, a) => l.replace(a, ""), line);
          for (const re of FORBIDDEN) if (re.test(cleaned)) hits.push(`${path.relative(process.cwd(), f)}:${i + 1} → ${re}`);
        });
    }
    expect(hits).toEqual([]);
  });
});
