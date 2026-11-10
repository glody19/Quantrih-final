import React, { useEffect, useState } from "react";
import { Check, ChevronDown, Cloud } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";

interface CloudSaveLoadProps {
  pageId: string;
  currentData: any;
  onLoad?: (data: any) => void;
  onListUpdate?: () => void;
  /** Whether the saved-analyses table is currently shown below the bar. */
  savedOpen?: boolean;
  /** Shows / hides the saved-analyses table. */
  onToggleSaved?: () => void;
}

const L: Record<string, Record<string, string>> = {
  en: { save: "Save this analysis", name: "Name", btn: "Save", saved: "Saved", list: "My saved analyses", signin: "Sign in to save and compare your analyses", error: "Saving failed. Please try again." },
  fr: { save: "Enregistrer cette analyse", name: "Nom", btn: "Enregistrer", saved: "Enregistré", list: "Mes analyses enregistrées", signin: "Connectez-vous pour enregistrer et comparer vos analyses", error: "L'enregistrement a échoué. Réessayez." },
};

/**
 * Discreet save bar, always placed at the bottom of a tool page.
 * Saves the current configuration (and its results summary) to the user's account.
 */
export function CloudSaveLoad({ pageId, currentData, onListUpdate, savedOpen, onToggleSaved }: CloudSaveLoadProps) {
  const { user } = useAuth();
  const { language } = useTranslation();
  const l = L[language] || L.en;
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const refreshCount = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, `users/${user.uid}/backtests`)));
      let n = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.pageId === pageId || (!data.pageId && pageId === "backtest")) n++;
      });
      setCount(n);
    } catch {
      setCount(null);
    }
  };

  useEffect(() => {
    refreshCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pageId]);

  const handleSave = async () => {
    if (!user || !saveName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, `users/${user.uid}/backtests`, id), {
        ...currentData,
        name: saveName.trim(),
        userId: user.uid,
        pageId,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      });
      setSaveName("");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      await refreshCount();
      onListUpdate?.();
    } catch (e) {
      console.error("Save failed:", e);
      setError(l.error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-3 border-t border-border pt-5">
        <Cloud size={15} className="text-text-4" />
        <a href="/auth" className="hover:text-pv-blue underline-offset-4 hover:underline">{l.signin}</a>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm">
        <form
          className="flex items-center gap-2 flex-1 min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Cloud size={15} className="text-text-4 shrink-0" />
          <span className="text-text-3 shrink-0 hidden sm:inline">{l.save}</span>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={l.name}
            aria-label={l.name}
            className="min-w-0 w-48 max-w-full h-8 px-2.5 bg-transparent border border-border rounded-lg text-sm text-text outline-none focus:border-pv-blue"
          />
          <button
            type="submit"
            disabled={isSaving || !saveName.trim()}
            className="h-8 px-3 rounded-lg text-sm font-medium text-text-2 border border-border hover:border-pv-blue hover:text-pv-blue transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {isSaving ? <span className="w-3.5 h-3.5 border-2 border-text-4 border-t-transparent rounded-full animate-spin" /> : justSaved ? <Check size={14} /> : null}
            {justSaved ? l.saved : l.btn}
          </button>
          {error && <span className="text-rose-600 text-xs">{error}</span>}
        </form>
        {onToggleSaved && (
          <button
            type="button"
            onClick={onToggleSaved}
            className="inline-flex items-center gap-1.5 text-text-3 hover:text-text transition-colors shrink-0"
          >
            {l.list}
            {count !== null && <span className="text-text-4 font-mono">({count})</span>}
            <ChevronDown size={15} className={cn("transition-transform", savedOpen && "rotate-180")} />
          </button>
        )}
      </div>
    </div>
  );
}
