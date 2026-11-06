import React, { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { resetDemoData, subscribeDemoData } from "../../lib/demoDataTracker";

export function DemoDataBadge() {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { pathname } = useLocation();

  useEffect(() => subscribeDemoData(setActive), []);
  useEffect(() => {
    resetDemoData();
    setDismissed(false);
  }, [pathname]);

  if (!active || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[120] max-w-sm flex items-start gap-2.5 bg-surface border border-amber-300 shadow-lg rounded-2xl px-4 py-3 text-xs text-text-2">
      <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-text">{t("demo.title")}</span>
        <span className="leading-snug text-text-3">{t("demo.desc")}</span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-text-4 hover:text-text shrink-0" aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}
