"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type FormState } from "@/actions/auth";
import { CONTACT } from "@/lib/content";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);

  if (state.challenge) {
    return (
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="challenge" value={state.challenge} />
        <input type="hidden" name="email" value={state.email ?? ""} />
        <div>
          <h1 className="text-[2.2rem] leading-tight">Vérification en deux étapes</h1>
          <p className="mt-2 text-sm text-slate">Saisissez le code à 6 chiffres affiché dans votre application d&apos;authentification.</p>
        </div>
        <input
          name="code"
          required
          autoFocus
          autoComplete="one-time-code"
          maxLength={12}
          placeholder="123 456"
          aria-label="Code de vérification"
          className="field num text-center text-2xl tracking-[0.35em]"
        />
        <p className="text-xs text-slate">Téléphone indisponible ? Saisissez l&apos;un de vos codes de secours.</p>
        {state.error && <Alert>{state.error}</Alert>}
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Vérification…" : "Vérifier"}
        </button>
        <a href="/connexion" className="text-center text-sm text-slate hover:text-navy">
          Recommencer
        </a>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <div className="eyebrow">Espace client</div>
        <h1 className="mt-3 text-[2.4rem] leading-tight">Connexion</h1>
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-slate">
          E-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" defaultValue={state.email} key={state.email} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-slate">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            required
            autoComplete="current-password"
            className="field pr-24"
            onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
          />
          <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-slate hover:bg-sand">
            {visible ? "Masquer" : "Afficher"}
          </button>
        </div>
        {caps && <p className="mt-1.5 text-xs text-gold-dark">Majuscules activées</p>}
      </div>
      {state.error && <Alert>{state.error}</Alert>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <details className="text-sm text-slate">
        <summary className="cursor-pointer hover:text-navy">Mot de passe oublié ou compte bloqué ?</summary>
        <p className="mt-2 leading-relaxed">
          Écrivez-nous à{" "}
          <a className="underline" href={`mailto:${CONTACT.email}?subject=Acc%C3%A8s%20%C3%A0%20mon%20espace`}>
            {CONTACT.email}
          </a>{" "}
          depuis l&apos;adresse de votre compte : nous vous enverrons un nouveau lien d&apos;accès.
        </p>
      </details>
      <p className="border-t border-line pt-5 text-sm text-slate">
        Découvrir l&apos;espace client :{" "}
        <Link href="/demo" className="text-navy underline">
          voir la démonstration
        </Link>
        <br />
        Pas encore client ?{" "}
        <Link href="/contact" className="text-navy underline">
          Demander un rendez-vous découverte
        </Link>
      </p>
    </form>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-[#FBEDED] px-4 py-2.5 text-sm text-danger">
      {children}
    </p>
  );
}
