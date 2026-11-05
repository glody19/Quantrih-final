"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitLead, type LeadState } from "@/actions/public";
import { PROFILES, SERVICES, WEALTH_RANGES } from "@/lib/content";
import { keepFormSubmit } from "@/components/useKeepForm";

export function LeadForm() {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, {});
  if (state.ok) {
    return (
      <div className="card p-8" role="status">
        <div className="eyebrow">Demande reçue</div>
        <h2 className="mt-3 text-3xl">Merci. Nous revenons vers vous sous 48 heures ouvrables.</h2>
        <p className="mt-4 text-slate">Nous vous proposerons un créneau pour un rendez-vous découverte, à Louvain-la-Neuve ou en visioconférence.</p>
      </div>
    );
  }
  return (
    <form onSubmit={keepFormSubmit(action)} className="card space-y-7 p-6 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <fieldset>
        <legend className="eyebrow">Vous êtes</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {PROFILES.map((p) => (
            <label key={p.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2.5 text-sm has-[:checked]:border-navy has-[:checked]:bg-ivory">
              <input type="radio" name="profile" value={p.key} required className="accent-[#0F1E2E]" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow">Patrimoine net approximatif</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEALTH_RANGES.map((w) => (
            <label key={w.key} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-ivory">
              <input type="radio" name="wealthRange" value={w.key} required className="sr-only" />
              {w.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow">Vos besoins (facultatif)</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <label key={s.key} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" name="needs" value={s.key} className="h-4 w-4 accent-[#B08D57]" />
              {s.title}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom et prénom" name="name" autoComplete="name" required />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field label="Téléphone (facultatif)" name="phone" type="tel" autoComplete="tel" />
        <Field label="Comment nous avez-vous connus ? (facultatif)" name="source" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm text-slate">
          Quelques mots sur votre situation (facultatif)
        </label>
        <textarea id="message" name="message" rows={4} maxLength={2000} className="field" placeholder="Évitez les informations sensibles : nous en parlerons de vive voix." />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#0F1E2E]" />
        <span>
          J&apos;accepte que Quantrih Office utilise ces informations pour me recontacter au sujet de ma demande. Voir la{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-[#FBEDED] px-4 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending ? "Envoi…" : "Demander un rendez-vous découverte"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required, autoComplete }: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm text-slate">
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} autoComplete={autoComplete} className="field" />
    </div>
  );
}
