"use client";

import { useActionState, useState } from "react";
import { acceptInvitation, type FormState } from "@/actions/auth";
import { MIN_PASSWORD, passwordScore } from "@/lib/password";
import { Alert } from "./LoginForm";
import { keepFormSubmit } from "@/components/useKeepForm";

const LABELS = ["Trop court", "Faible", "Correct", "Solide", "Excellent"];

export function InvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(acceptInvitation, {});
  const [pw, setPw] = useState("");
  const score = passwordScore(pw);
  return (
    <form onSubmit={keepFormSubmit(action)} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-slate">
          Mot de passe ({MIN_PASSWORD} caractères minimum)
        </label>
        <input id="password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} />
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < score ? (score >= 3 ? "bg-sage" : "bg-gold") : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-1 text-xs text-slate" aria-live="polite">
          {pw ? LABELS[score] : "Astuce : une phrase de plusieurs mots est à la fois solide et facile à retenir."}
        </p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm text-slate">
          Confirmer le mot de passe
        </label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="field" />
      </div>
      {state.error && <Alert>{state.error}</Alert>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Enregistrement…" : "Créer mon mot de passe"}
      </button>
      <p className="text-xs text-slate">Étape suivante : activation de la double authentification (obligatoire).</p>
    </form>
  );
}
