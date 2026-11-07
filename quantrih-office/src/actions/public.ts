"use server";

import { z } from "zod";
import { dbConfigured, getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { PROFILES, SERVICES, WEALTH_RANGES } from "@/lib/content";
import { sendMail } from "@/lib/mail";

export type LeadState = { ok?: boolean; error?: string };

const leadSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.email("Adresse e-mail invalide.").max(200),
  phone: z.string().trim().max(40).optional(),
  profile: z.enum(PROFILES.map((p) => p.key) as [string, ...string[]], "Choisissez votre situation."),
  wealthRange: z.enum(WEALTH_RANGES.map((w) => w.key) as [string, ...string[]], "Choisissez une fourchette de patrimoine."),
  needs: z.array(z.enum(SERVICES.map((s) => s.key) as [string, ...string[]])).max(SERVICES.length),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(120).optional(),
  consent: z.literal("on", "Votre accord est nécessaire pour que nous puissions vous recontacter."),
  // Champ invisible : rempli uniquement par les robots.
  website: z.string().max(0).optional(),
});

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const raw = Object.fromEntries(formData);
  const parsed = leadSchema.safeParse({ ...raw, needs: formData.getAll("needs") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire incomplet." };
  if (parsed.data.website) return { ok: true };
  if (!dbConfigured()) return { error: "Le formulaire est momentanément indisponible. Écrivez-nous directement à bonjour@quantrih-office.be, nous vous répondrons sous 48 heures ouvrables." };
  const d = parsed.data;
  await getDb()
    .insert(leads)
    .values({ name: d.name, email: d.email.toLowerCase(), phone: d.phone || null, profile: d.profile, wealthRange: d.wealthRange, needs: d.needs, message: d.message || null, source: d.source || null, consentAt: new Date() });
  const team = process.env.MAIL_TO_TEAM;
  if (team) await sendMail(team, "Nouvelle demande de rendez-vous découverte", `Une nouvelle demande est arrivée de ${d.name}. Consultez-la dans le bureau Quantrih Office.`);
  return { ok: true };
}
