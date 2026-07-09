import { initializeApp } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export { serverTimestamp };

if (typeof window !== "undefined" && import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.error("Firebase App Check failed to initialize:", e);
  }
}

// Error handler for Firestore as per instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let isPopupPending = false;

export const loginWithGoogle = async () => {
    if (isPopupPending) return;
    try {
        isPopupPending = true;
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
            console.log("Login popup was closed or cancelled.");
            return;
        }
        console.error("Login failed", error);
        if (error?.code === 'auth/internal-error') {
            alert(`Login failed: Internal Error.\n\nIf you are viewing this inside the AI Studio preview, your browser might be blocking third-party cookies (required for popup login inside an iframe).\n\nPlease click the "Open in new tab" icon at the top right of the preview window and try logging in from the new tab.`);
        } else {
            alert(`Login failed\n\n${error.message}`);
        }
    } finally {
        isPopupPending = false;
    }
}

export const loginWithApple = async () => {
    if (isPopupPending) return;
    try {
        isPopupPending = true;
        await signInWithPopup(auth, appleProvider);
    } catch (error: any) {
        if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
            console.log("Login popup was closed or cancelled.");
            return;
        }
        console.error("Login failed", error);
        if (error?.code === 'auth/internal-error') {
            alert(`Login failed: Internal Error.\n\nIf you are viewing this inside the AI Studio preview, your browser might be blocking third-party cookies (required for popup login inside an iframe).\n\nPlease click the "Open in new tab" icon at the top right of the preview window and try logging in from the new tab.`);
        } else {
            alert(`Login failed\n\n${error.message}`);
        }
    } finally {
        isPopupPending = false;
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error);
    }
}
