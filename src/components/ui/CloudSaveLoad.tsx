import React, { useState, useEffect } from "react";
import { Cloud, Save, Download, X, Trash2, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { collection, query, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";

interface CloudSaveLoadProps {
  pageId: string;
  currentData: any;
  onLoad: (data: any) => void;
  onListUpdate?: () => void;
}

export function CloudSaveLoad({ pageId, currentData, onLoad, onListUpdate }: CloudSaveLoadProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConfigs();
    }
  }, [isOpen, user]);

  const loadConfigs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, `users/${user.uid}/backtests`));
      const querySnapshot = await getDocs(q);
      const configs: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pageId === pageId || (!data.pageId && pageId === "backtest")) {
          configs.push({ id: doc.id, ...data });
        }
      });
      // Sort by updatedAt descending
      configs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setSavedConfigs(configs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !saveName.trim()) return;
    setIsSaving(true);
    try {
      const newId = Date.now().toString();
      const docRef = doc(db, `users/${user.uid}/backtests`, newId);
      await setDoc(docRef, {
        ...currentData,
        name: saveName.trim(),
        userId: user.uid,
        pageId: pageId,
        updatedAt: Date.now(),
        createdAt: Date.now()
      });
      setSaveName("");
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
      await loadConfigs();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save configuration to cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "backtests", id));
      await loadConfigs();
      if (onListUpdate) onListUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl transition-colors font-semibold text-[13px]"
      >
        <Save size={16} />
        Save
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Save size={20} className="text-sky-500" />
                Saved Scenarios
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-text-3 hover:text-text transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Save New */}
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-text-2 uppercase tracking-wider">
                  Save
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Scenario Name..."
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-2 text-sm text-text outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !saveName.trim()}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saveStatus ? <Check size={16} /> : <Save size={16} />}
                  </button>
                </div>
              </div>

              {/* Load Existing */}
              <div className="flex flex-col gap-3 flex-1 min-h-[200px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <label className="text-[13px] font-bold text-text-2 uppercase tracking-wider">
                  Saved Scenarios
                </label>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                  </div>
                ) : savedConfigs.length === 0 ? (
                  <div className="text-center py-8 text-text-3 text-sm">
                    No saved configurations found.
                  </div>
                ) : (
                  savedConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border group hover:border-sky-500/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-text text-sm">{config.name}</span>
                        <span className="text-[11px] text-text-3">
                          {new Date(config.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setLoadStatus(config.id);
                            onLoad(config);
                            setTimeout(() => setLoadStatus(null), 2000);
                          }}
                          className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-lg transition-colors"
                          title="Load"
                        >
                          {loadStatus === config.id ? <Check size={16} /> : <Download size={16} />}
                        </button>
                        {deleteConfirmId === config.id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(config.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                            title="Confirm deletion"
                          >
                            Confirm?
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(config.id);
                              setTimeout(() => setDeleteConfirmId(prev => prev === config.id ? null : prev), 3000);
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
