import React from "react";
import { paymentsPerYear } from "../../engine/cashflow";

type Lang = string;

const LABELS: Record<string, Record<string, string>> = {
  weekly: { en: "Weekly", fr: "Chaque semaine", de: "Wöchentlich", nl: "Wekelijks", es: "Semanal" },
  monthly: { en: "Monthly", fr: "Chaque mois", de: "Monatlich", nl: "Maandelijks", es: "Mensual" },
  quarterly: { en: "Quarterly", fr: "Chaque trimestre", de: "Vierteljährlich", nl: "Per kwartaal", es: "Trimestral" },
  quadrimester: { en: "Every 4 months", fr: "Chaque quadrimestre (4 mois)", de: "Alle 4 Monate", nl: "Elke 4 maanden", es: "Cuatrimestral" },
  semiannually: { en: "Twice a year", fr: "Chaque semestre", de: "Halbjährlich", nl: "Halfjaarlijks", es: "Semestral" },
  annually: { en: "Yearly", fr: "Chaque année", de: "Jährlich", nl: "Jaarlijks", es: "Anual" },
};

export const CASHFLOW_FREQUENCIES = ["weekly", "monthly", "quarterly", "quadrimester", "semiannually", "annually"] as const;

const pick = (m: Record<string, string>, lang: Lang) => m[lang] ?? m.en;

/** The label of one frequency, in lower case for use inside a sentence. */
export function cashflowFrequencyLabel(freq: string, lang: Lang): string {
  const key = freq === "annual" ? "annually" : freq;
  return LABELS[key] ? pick(LABELS[key], lang).toLowerCase() : freq;
}

/** The <option> list for every cashflow frequency, in the page language. `annualValue` lets a page keep its own value for yearly. */
export function CashflowFrequencyOptions({ lang, annualValue = "annually" }: { lang: Lang; annualValue?: string }) {
  return (
    <>
      {CASHFLOW_FREQUENCIES.map((f) => (
        <option key={f} value={f === "annually" ? annualValue : f}>
          {pick(LABELS[f], lang)}
        </option>
      ))}
    </>
  );
}

const DIRECTION: Record<string, Record<string, string>> = {
  contribute: { en: "added", fr: "ajoutés", de: "eingezahlt", nl: "gestort", es: "aportados" },
  withdraw: { en: "withdrawn", fr: "retirés", de: "entnommen", nl: "opgenomen", es: "retirados" },
  perYear: { en: "per year", fr: "par an", de: "pro Jahr", nl: "per jaar", es: "al año" },
  weeklyNote: {
    en: "Prices are monthly, so weekly amounts are booked once a month (52 ÷ 12 weeks).",
    fr: "Les prix sont mensuels : les montants hebdomadaires sont comptés une fois par mois (52 ÷ 12 semaines).",
    de: "Die Kurse sind monatlich: Wochenbeträge werden einmal im Monat gebucht (52 ÷ 12 Wochen).",
    nl: "De koersen zijn maandelijks: weekbedragen worden eens per maand geboekt (52 ÷ 12 weken).",
    es: "Los precios son mensuales: los importes semanales se registran una vez al mes (52 ÷ 12 semanas).",
  },
};

/** One line under the fields: what the choice adds up to over a year. */
export function CashflowSummary({ lang, amount, frequency, direction }: { lang: Lang; amount: number; frequency: string; direction: "contribute" | "withdraw" }) {
  const n = paymentsPerYear(frequency === "annual" ? "annually" : frequency);
  const a = Math.abs(Number(amount) || 0);
  if (!n || !a) return null;
  const total = Math.round(a * n).toLocaleString(lang === "en" ? "en-US" : "fr-FR");
  return (
    <p className="text-[12.5px] leading-snug text-text-3">
      ≈ {total} {pick(DIRECTION[direction], lang)} {pick(DIRECTION.perYear, lang)}
      {frequency === "weekly" ? ". " + pick(DIRECTION.weeklyNote, lang) : ""}
    </p>
  );
}
