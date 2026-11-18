import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

/** The client area asks a tool page to open a saved analysis when it mounts. */
const KEY = "quantrih_pending_load";

export function requestLoad(pageId: string, id: string) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ pageId, id })); } catch { /* storage unavailable */ }
}

export function usePendingLoad(pageIds: string[], onLoad: (data: any) => void) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    let req: { pageId: string; id: string } | null = null;
    try { req = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { req = null; }
    if (!req || !pageIds.includes(req.pageId)) return;
    try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    getDoc(doc(db, `users/${user.uid}/backtests`, req.id))
      .then((d) => { if (d.exists()) onLoad(d.data()); })
      .catch((e) => console.error("Failed to open saved analysis:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
}
