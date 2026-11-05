"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DOCUMENT_CATEGORIES } from "@/lib/belgium";

const MAX = 4 * 1024 * 1024;

/** Dépôt de documents : le fichier est envoyé au serveur, qui le contrôle et le chiffre avant stockage. */
export function DocumentUpload({ relationshipId, defaultCategory }: { relationshipId: string; defaultCategory?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(defaultCategory ?? "identite");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    let sent = 0;
    for (const file of Array.from(files)) {
      if (file.size > MAX) {
        setMsg({ ok: false, text: `« ${file.name} » dépasse 4 Mo. Compressez-le ou scindez-le.` });
        continue;
      }
      const fd = new FormData();
      fd.set("relationshipId", relationshipId);
      fd.set("category", category);
      fd.set("file", file);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: `« ${file.name} » : ${json.error ?? "envoi impossible."}` });
        continue;
      }
      sent++;
    }
    if (sent) setMsg({ ok: true, text: sent > 1 ? `${sent} documents déposés et chiffrés.` : "Document déposé et chiffré." });
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm text-slate">Type de document</span>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          send(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${drag ? "border-gold bg-[#FBF7EF]" : "border-line bg-white"}`}
      >
        <p className="text-sm">{busy ? "Envoi et chiffrement…" : "Glissez vos fichiers ici"}</p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-ghost !py-2 text-sm">
          Choisir des fichiers
        </button>
        <p className="text-xs text-slate">PDF, JPG, PNG, HEIC, DOCX, XLSX ou CSV · 4 Mo maximum par fichier</p>
        <input ref={input} type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.docx,.xlsx,.csv" onChange={(e) => send(e.target.files)} />
      </div>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-[#E6EFE9] text-sage" : "bg-[#FBEDED] text-danger"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
