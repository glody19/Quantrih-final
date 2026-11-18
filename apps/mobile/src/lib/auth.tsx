import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { PLAN_LIMITS, type PlanId, type PlanLimits } from "@shared/lib/planLimits";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  plan: PlanId;
  limits: PlanLimits;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

/** Reads the plan the server wrote to users/{uid}/profiles/subscription (empty means Freemium). */
async function readPlan(uid: string): Promise<{ plan: PlanId; isAdmin: boolean }> {
  let isAdmin = false;
  let plan: PlanId = "free";
  try {
    isAdmin = (await getDoc(doc(db, "admins", uid))).exists();
  } catch { /* not an admin or offline */ }
  try {
    const d = await getDoc(doc(db, `users/${uid}/profiles/subscription`));
    const p = d.exists() ? (d.data() as any).plan : null;
    if (p === "premium" || p === "pro") plan = p;
  } catch { /* offline: stay on Freemium */ }
  return { plan: isAdmin ? "pro" : plan, isAdmin };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanId>("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const r = await readPlan(u.uid);
          setPlan(r.plan);
          setIsAdmin(r.isAdmin);
        } else {
          setPlan("free");
          setIsAdmin(false);
        }
        setLoading(false);
      }),
    [],
  );

  const value: AuthState = {
    user,
    loading,
    isAdmin,
    plan,
    limits: PLAN_LIMITS[plan],
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    signUp: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email.trim());
    },
    signOut: async () => {
      await signOut(auth);
    },
    refreshPlan: async () => {
      if (!auth.currentUser) return;
      const r = await readPlan(auth.currentUser.uid);
      setPlan(r.plan);
      setIsAdmin(r.isAdmin);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

/** Firebase error codes in plain French. */
export function authErrorMessage(e: any): string {
  const code = String(e?.code || "");
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "E-mail ou mot de passe incorrect.";
  if (code.includes("email-already-in-use")) return "Un compte existe déjà avec cet e-mail.";
  if (code.includes("weak-password")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (code.includes("invalid-email")) return "Adresse e-mail invalide.";
  if (code.includes("network")) return "Pas de connexion internet.";
  if (code.includes("too-many-requests")) return "Trop de tentatives, réessayez dans quelques minutes.";
  return "Une erreur est survenue, réessayez.";
}
