"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { beginTotp, confirmTotp, continueAfterMfa } from "@/actions/auth";
import { Alert } from "./LoginForm";

export function MfaSetup() {
  const [setup, setSetup] = useState<{ secret?: string; qr?: string; error?: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  // Une seule génération de clé, même si l'effet est rejoué (mode strict de React).
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    beginTotp().then(setSetup);
  }, []);

  if (codes) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <div className="eyebrow">Étape 2 sur 2</div>
          <h1 className="mt-3 text-[2.2rem] leading-tight">Vos codes de secours</h1>
          <p className="mt-2 text-sm text-slate">Si vous perdez votre téléphone, chacun de ces codes permet une connexion. Conservez-les en lieu sûr : ils ne seront plus affichés.</p>
        </div>
        <ul className="num grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-4 font-mono text-sm">
          {codes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(codes.join("\n"))}>
            Copier
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            Imprimer
          </button>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0F1E2E]" />
          J&apos;ai conservé mes codes de secours en lieu sûr.
        </label>
        <button type="button" disabled={!saved || pending} className="btn btn-primary" onClick={() => start(() => continueAfterMfa())}>
          Accéder à mon espace
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="eyebrow">Étape 1 sur 2</div>
        <h1 className="mt-3 text-[2.2rem] leading-tight">Activez la double authentification</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Elle est obligatoire pour protéger votre patrimoine. Scannez ce code avec une application d&apos;authentification (Google Authenticator, Microsoft Authenticator, 1Password…), puis saisissez le code à 6 chiffres affiché.
        </p>
      </div>
      {setup?.error && <Alert>{setup.error}</Alert>}
      {setup?.qr ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-white p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code à scanner avec votre application d'authentification" width={200} height={200} />
          <details className="w-full text-center text-xs text-slate">
            <summary className="cursor-pointer">Impossible de scanner ? Saisir la clé manuellement</summary>
            <code className="mt-2 block break-all font-mono text-navy">{setup.secret}</code>
          </details>
        </div>
      ) : (
        !setup?.error && <div className="h-[250px] animate-pulse rounded-xl bg-sand" aria-label="Chargement" />
      )}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const r = await confirmTotp(code);
            if (r.error) setError(r.error);
            else if (r.codes) setCodes(r.codes);
          });
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          placeholder="123 456"
          aria-label="Code à 6 chiffres"
          className="field num text-center text-2xl tracking-[0.35em]"
          required
        />
        {error && <Alert>{error}</Alert>}
        <button type="submit" disabled={pending || !setup?.qr} className="btn btn-primary">
          {pending ? "Vérification…" : "Activer"}
        </button>
      </form>
    </div>
  );
}
