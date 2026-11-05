"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/actions/onboarding";
import { keepFormSubmit } from "@/components/useKeepForm";

/** Formulaire relié à une action serveur : message de réussite ou d'erreur, remise à zéro après succès. */
export function ActionForm({
  action,
  relationshipId,
  children,
  submit,
  className = "",
  resetOnSuccess = true,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  relationshipId: string;
  children: React.ReactNode;
  submit: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, run, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} onSubmit={keepFormSubmit(run)} className={className}>
      <input type="hidden" name="relationshipId" value={relationshipId} />
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn btn-primary">
          {pending ? "Enregistrement…" : submit}
        </button>
        {state.error && (
          <p role="alert" className="rounded-lg bg-[#FBEDED] px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.ok && state.message && (
          <p role="status" className="rounded-lg bg-[#E6EFE9] px-3 py-2 text-sm text-sage">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-slate">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate/80">{hint}</span>}
    </label>
  );
}

export function Select({ name, options, defaultValue, required }: { name: string; options: readonly { key: string; label: string }[] | readonly (readonly [string, string])[]; defaultValue?: string; required?: boolean }) {
  return (
    <select name={name} className="field" defaultValue={defaultValue} required={required}>
      {options.map((o) => {
        const [k, l] = Array.isArray(o) ? o : [(o as { key: string }).key, (o as { label: string }).label];
        return (
          <option key={k} value={k}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

export function Checks({ name, options, defaultValues = [], columns = 2 }: { name: string; options: readonly { key: string; label: string }[]; defaultValues?: string[]; columns?: 1 | 2 }) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {options.map((o) => (
        <label key={o.key} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-white px-3 py-2.5 text-sm has-[:checked]:border-navy">
          <input type="checkbox" name={name} value={o.key} defaultChecked={defaultValues.includes(o.key)} className="mt-0.5 h-4 w-4 accent-[#0F1E2E]" />
          {o.label}
        </label>
      ))}
    </div>
  );
}
