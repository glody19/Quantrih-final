"use client";

import { useActionState, useState } from "react";
import { addHolding, createClient, resendInvitation, type BureauState } from "@/actions/bureau";
import { CATEGORY_LABEL } from "@/lib/content";

function Feedback({ state }: { state: BureauState }) {
  const [copied, setCopied] = useState(false);
  if (state.error)
    return (
      <p role="alert" className="rounded-lg bg-[#FBEDED] px-4 py-2.5 text-sm text-danger">
        {state.error}
      </p>
    );
  if (!state.ok) return null;
  return (
    <div role="status" className="rounded-lg bg-[#E6EFE9] px-4 py-3 text-sm text-sage">
      {state.message}
      {state.inviteUrl && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all rounded bg-white px-2 py-1 text-xs text-navy">{state.inviteUrl}</code>
          <button
            type="button"
            className="text-xs font-semibold underline"
            onClick={() => {
              navigator.clipboard?.writeText(state.inviteUrl!);
              setCopied(true);
            }}
          >
            {copied ? "Copié" : "Copier le lien"}
          </button>
        </div>
      )}
    </div>
  );
}

export function NewClientForm({ lead }: { lead?: { id: string; name: string; email: string; profile: string } }) {
  const [state, action, pending] = useActionState<BureauState, FormData>(createClient, {});
  const defaultKind = lead?.profile === "famille" ? "famille" : "personne";
  return (
    <form action={action} className="space-y-5">
      {lead && <input type="hidden" name="leadId" value={lead.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="relationshipName" className="mb-1.5 block text-sm text-slate">
            Nom de la relation
          </label>
          <input id="relationshipName" name="relationshipName" required className="field" placeholder="Famille Dupont" defaultValue={lead ? lead.name : ""} />
        </div>
        <div>
          <label htmlFor="kind" className="mb-1.5 block text-sm text-slate">
            Type
          </label>
          <select id="kind" name="kind" className="field" defaultValue={defaultKind}>
            <option value="personne">Personne seule</option>
            <option value="foyer">Foyer</option>
            <option value="famille">Famille élargie</option>
          </select>
        </div>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-slate">
            Titulaire (nom et prénom)
          </label>
          <input id="name" name="name" required className="field" defaultValue={lead?.name} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-slate">
            E-mail du titulaire
          </label>
          <input id="email" name="email" type="email" required className="field" defaultValue={lead?.email} />
        </div>
      </div>
      <Feedback state={state} />
      {!state.ok && (
        <button disabled={pending} className="btn btn-primary">
          {pending ? "Création…" : "Créer et inviter"}
        </button>
      )}
    </form>
  );
}

export function ResendInvitation({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<BureauState, FormData>(resendInvitation, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <button disabled={pending} className="text-xs font-semibold text-gold-dark underline">
        {pending ? "…" : "Nouveau lien d'invitation"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function AddHoldingForm({ relationshipId }: { relationshipId: string }) {
  const [state, action, pending] = useActionState<BureauState, FormData>(addHolding, {});
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="relationshipId" value={relationshipId} />
      <input name="label" required placeholder="Libellé (ex. : Compte-titres BNP)" className="field lg:col-span-2" aria-label="Libellé" />
      <select name="category" className="field" aria-label="Catégorie">
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <input name="value" required inputMode="decimal" placeholder="Valeur en € (négatif = dette)" className="field" aria-label="Valeur" />
      <input name="institution" placeholder="Établissement" className="field" aria-label="Établissement" />
      <input name="owner" placeholder="Titulaire (personne ou société)" className="field" aria-label="Titulaire" />
      <input name="valuedAt" type="date" required defaultValue={today} className="field" aria-label="Date de valorisation" />
      <select name="source" className="field" aria-label="Source">
        <option value="releve">Relevé</option>
        <option value="agregation">Connexion bancaire</option>
        <option value="declaratif">Déclaratif</option>
        <option value="expertise">Expertise</option>
      </select>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button disabled={pending} className="btn btn-primary">
          {pending ? "Ajout…" : "Ajouter"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
