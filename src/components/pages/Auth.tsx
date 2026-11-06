import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, serverTimestamp } from "../../firebase";
import { useTranslation } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { QuantrihLogo } from "../ui/Logo";
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, Lock, Mail, MailCheck, User, Save, LineChart, ShieldCheck } from "lucide-react";

type Mode = "login" | "signup" | "reset" | "verify";

const LABELS = {
  en: {
    login: "Sign in", signup: "Create account",
    loginTitle: "Welcome back", loginSub: "Sign in to find your saved portfolios and analyses.",
    signupTitle: "Create your Quantrih account", signupSub: "Save your portfolios, simulations and investor profile.",
    resetTitle: "Reset your password", resetSub: "Enter your email and we will send you a reset link.",
    verifyTitle: "Check your inbox", verifySub: "We sent a confirmation link to {email}. Click it to activate your account.",
    email: "Email address", pass: "Password", passVerify: "Confirm password", firstName: "First name", lastName: "Last name", company: "Company (optional)",
    forgot: "Forgot password?", google: "Continue with Google", or: "or with your email",
    submitLogin: "Sign in", submitSignup: "Create my account", submitReset: "Send the link", backToLogin: "Back to sign in", continue: "Continue",
    show: "Show password", hide: "Hide password",
    strength: ["Too short", "Weak", "Fair", "Good", "Strong"],
    consent: "I accept the", privacy: "privacy policy",
    resetSent: "If an account exists for this address, a reset link has been sent.",
    errors: {
      mismatch: "The passwords do not match.", inUse: "An account already exists with this email. Sign in instead.",
      invalid: "Incorrect email or password.", weak: "Use at least 8 characters.", tooMany: "Too many attempts. Please wait a few minutes.",
      network: "Connection problem. Check your internet access.", google: "Google sign-in failed or was cancelled.", consent: "Please accept the privacy policy.",
      generic: "Something went wrong. Please try again.",
    },
    perks: [
      { t: "Save your portfolios", d: "Find your backtests and simulations on any device." },
      { t: "Investor profile", d: "Keep your objectives and risk tolerance in one place." },
      { t: "Private and secure", d: "Authentication by Google Firebase. We never sell your data." },
    ],
    secured: "Secure authentication by Google Firebase",
  },
  fr: {
    login: "Connexion", signup: "Inscription",
    loginTitle: "Bon retour", loginSub: "Connectez-vous pour retrouver vos portefeuilles et analyses sauvegardés.",
    signupTitle: "Créez votre compte Quantrih", signupSub: "Sauvegardez vos portefeuilles, vos simulations et votre profil d'investisseur.",
    resetTitle: "Réinitialiser le mot de passe", resetSub: "Saisissez votre e-mail, nous vous envoyons un lien de réinitialisation.",
    verifyTitle: "Vérifiez votre boîte mail", verifySub: "Nous avons envoyé un lien de confirmation à {email}. Cliquez dessus pour activer votre compte.",
    email: "Adresse e-mail", pass: "Mot de passe", passVerify: "Confirmer le mot de passe", firstName: "Prénom", lastName: "Nom", company: "Société (facultatif)",
    forgot: "Mot de passe oublié ?", google: "Continuer avec Google", or: "ou avec votre e-mail",
    submitLogin: "Se connecter", submitSignup: "Créer mon compte", submitReset: "Envoyer le lien", backToLogin: "Retour à la connexion", continue: "Continuer",
    show: "Afficher le mot de passe", hide: "Masquer le mot de passe",
    strength: ["Trop court", "Faible", "Moyen", "Bon", "Excellent"],
    consent: "J'accepte la", privacy: "politique de confidentialité",
    resetSent: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé.",
    errors: {
      mismatch: "Les mots de passe ne correspondent pas.", inUse: "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.",
      invalid: "E-mail ou mot de passe incorrect.", weak: "Utilisez au moins 8 caractères.", tooMany: "Trop de tentatives. Patientez quelques minutes.",
      network: "Problème de connexion. Vérifiez votre accès à internet.", google: "La connexion Google a échoué ou a été annulée.", consent: "Merci d'accepter la politique de confidentialité.",
      generic: "Une erreur est survenue. Veuillez réessayer.",
    },
    perks: [
      { t: "Vos portefeuilles sauvegardés", d: "Retrouvez vos backtests et simulations sur tous vos appareils." },
      { t: "Votre profil d'investisseur", d: "Vos objectifs et votre tolérance au risque, au même endroit." },
      { t: "Privé et sécurisé", d: "Authentification par Google Firebase. Nous ne revendons jamais vos données." },
    ],
    secured: "Authentification sécurisée par Google Firebase",
  },
  nl: {
    login: "Inloggen", signup: "Registreren",
    loginTitle: "Welkom terug", loginSub: "Log in om je opgeslagen portefeuilles en analyses terug te vinden.",
    signupTitle: "Maak je Quantrih-account", signupSub: "Bewaar je portefeuilles, simulaties en beleggersprofiel.",
    resetTitle: "Wachtwoord opnieuw instellen", resetSub: "Vul je e-mailadres in, we sturen je een link.",
    verifyTitle: "Controleer je mailbox", verifySub: "We stuurden een bevestigingslink naar {email}. Klik erop om je account te activeren.",
    email: "E-mailadres", pass: "Wachtwoord", passVerify: "Bevestig wachtwoord", firstName: "Voornaam", lastName: "Achternaam", company: "Bedrijf (optioneel)",
    forgot: "Wachtwoord vergeten?", google: "Doorgaan met Google", or: "of met je e-mailadres",
    submitLogin: "Inloggen", submitSignup: "Account aanmaken", submitReset: "Link versturen", backToLogin: "Terug naar inloggen", continue: "Doorgaan",
    show: "Wachtwoord tonen", hide: "Wachtwoord verbergen",
    strength: ["Te kort", "Zwak", "Redelijk", "Goed", "Sterk"],
    consent: "Ik aanvaard het", privacy: "privacybeleid",
    resetSent: "Als er een account bestaat voor dit adres, is er een link verstuurd.",
    errors: {
      mismatch: "De wachtwoorden komen niet overeen.", inUse: "Er bestaat al een account met dit e-mailadres. Log in.",
      invalid: "Onjuist e-mailadres of wachtwoord.", weak: "Gebruik minstens 8 tekens.", tooMany: "Te veel pogingen. Wacht enkele minuten.",
      network: "Verbindingsprobleem. Controleer je internet.", google: "Inloggen met Google is mislukt of geannuleerd.", consent: "Aanvaard het privacybeleid.",
      generic: "Er ging iets mis. Probeer opnieuw.",
    },
    perks: [
      { t: "Bewaar je portefeuilles", d: "Vind je backtests en simulaties terug op al je toestellen." },
      { t: "Beleggersprofiel", d: "Je doelen en risicotolerantie op één plek." },
      { t: "Privé en veilig", d: "Authenticatie via Google Firebase. We verkopen je gegevens nooit." },
    ],
    secured: "Veilige authenticatie via Google Firebase",
  },
  de: {
    login: "Anmelden", signup: "Registrieren",
    loginTitle: "Willkommen zurück", loginSub: "Melden Sie sich an, um Ihre gespeicherten Portfolios und Analysen zu finden.",
    signupTitle: "Erstellen Sie Ihr Quantrih-Konto", signupSub: "Speichern Sie Portfolios, Simulationen und Anlegerprofil.",
    resetTitle: "Passwort zurücksetzen", resetSub: "Geben Sie Ihre E-Mail ein, wir senden Ihnen einen Link.",
    verifyTitle: "Prüfen Sie Ihr Postfach", verifySub: "Wir haben einen Bestätigungslink an {email} gesendet. Klicken Sie darauf, um Ihr Konto zu aktivieren.",
    email: "E-Mail-Adresse", pass: "Passwort", passVerify: "Passwort bestätigen", firstName: "Vorname", lastName: "Nachname", company: "Firma (optional)",
    forgot: "Passwort vergessen?", google: "Weiter mit Google", or: "oder mit Ihrer E-Mail",
    submitLogin: "Anmelden", submitSignup: "Konto erstellen", submitReset: "Link senden", backToLogin: "Zurück zur Anmeldung", continue: "Weiter",
    show: "Passwort anzeigen", hide: "Passwort verbergen",
    strength: ["Zu kurz", "Schwach", "Mittel", "Gut", "Stark"],
    consent: "Ich akzeptiere die", privacy: "Datenschutzerklärung",
    resetSent: "Falls ein Konto für diese Adresse existiert, wurde ein Link gesendet.",
    errors: {
      mismatch: "Die Passwörter stimmen nicht überein.", inUse: "Es gibt bereits ein Konto mit dieser E-Mail. Melden Sie sich an.",
      invalid: "E-Mail oder Passwort falsch.", weak: "Mindestens 8 Zeichen verwenden.", tooMany: "Zu viele Versuche. Bitte einige Minuten warten.",
      network: "Verbindungsproblem. Prüfen Sie Ihre Internetverbindung.", google: "Google-Anmeldung fehlgeschlagen oder abgebrochen.", consent: "Bitte akzeptieren Sie die Datenschutzerklärung.",
      generic: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    },
    perks: [
      { t: "Portfolios speichern", d: "Backtests und Simulationen auf allen Geräten." },
      { t: "Anlegerprofil", d: "Ziele und Risikotoleranz an einem Ort." },
      { t: "Privat und sicher", d: "Authentifizierung über Google Firebase. Wir verkaufen keine Daten." },
    ],
    secured: "Sichere Authentifizierung über Google Firebase",
  },
  es: {
    login: "Iniciar sesión", signup: "Registrarse",
    loginTitle: "Bienvenido de nuevo", loginSub: "Inicie sesión para recuperar sus carteras y análisis guardados.",
    signupTitle: "Cree su cuenta Quantrih", signupSub: "Guarde sus carteras, simulaciones y perfil de inversor.",
    resetTitle: "Restablecer la contraseña", resetSub: "Introduzca su correo y le enviaremos un enlace.",
    verifyTitle: "Revise su correo", verifySub: "Hemos enviado un enlace de confirmación a {email}. Haga clic para activar su cuenta.",
    email: "Correo electrónico", pass: "Contraseña", passVerify: "Confirmar contraseña", firstName: "Nombre", lastName: "Apellido", company: "Empresa (opcional)",
    forgot: "¿Olvidó su contraseña?", google: "Continuar con Google", or: "o con su correo",
    submitLogin: "Iniciar sesión", submitSignup: "Crear mi cuenta", submitReset: "Enviar el enlace", backToLogin: "Volver al inicio de sesión", continue: "Continuar",
    show: "Mostrar contraseña", hide: "Ocultar contraseña",
    strength: ["Muy corta", "Débil", "Aceptable", "Buena", "Fuerte"],
    consent: "Acepto la", privacy: "política de privacidad",
    resetSent: "Si existe una cuenta con esta dirección, se ha enviado un enlace.",
    errors: {
      mismatch: "Las contraseñas no coinciden.", inUse: "Ya existe una cuenta con este correo. Inicie sesión.",
      invalid: "Correo o contraseña incorrectos.", weak: "Use al menos 8 caracteres.", tooMany: "Demasiados intentos. Espere unos minutos.",
      network: "Problema de conexión. Compruebe su acceso a internet.", google: "El inicio con Google falló o se canceló.", consent: "Acepte la política de privacidad.",
      generic: "Algo salió mal. Inténtelo de nuevo.",
    },
    perks: [
      { t: "Guarde sus carteras", d: "Sus backtests y simulaciones en todos sus dispositivos." },
      { t: "Perfil de inversor", d: "Sus objetivos y tolerancia al riesgo en un solo lugar." },
      { t: "Privado y seguro", d: "Autenticación con Google Firebase. Nunca vendemos sus datos." },
    ],
    secured: "Autenticación segura con Google Firebase",
  },
};

const PERK_ICONS = [Save, LineChart, ShieldCheck];

function passwordScore(pw: string) {
  if (pw.length < 8) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-text-2 mb-1.5">{label}</span>
      <span className="relative block">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />}
        {children}
      </span>
    </label>
  );
}

const inputCls = "w-full bg-white border border-border rounded-xl py-3 pr-4 text-sm outline-none focus:border-pv-blue focus:ring-4 focus:ring-pv-blue/10 transition-all text-text placeholder:text-text-4";

export function Auth({ onBack }: { onBack: () => void }) {
  const { language } = useTranslation();
  const { login: googleLogin, user } = useAuth();
  const L = (LABELS as Record<string, typeof LABELS.en>)[language] || LABELS.en;

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Firebase signs the user in as soon as the account is created; this keeps them here for the confirmation screen.
  const signingUp = useRef(false);

  // Already signed in (and not in the middle of the post-signup confirmation screen): leave.
  useEffect(() => {
    if (user && mode !== "verify" && !signingUp.current) onBack();
  }, [user, mode, onBack]);

  const score = useMemo(() => passwordScore(password), [password]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const errorFor = (code?: string) => {
    switch (code) {
      case "auth/email-already-in-use": return L.errors.inUse;
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/invalid-email": return L.errors.invalid;
      case "auth/weak-password": return L.errors.weak;
      case "auth/too-many-requests": return L.errors.tooMany;
      case "auth/network-request-failed": return L.errors.network;
      default: return L.errors.generic;
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleLogin();
      onBack();
    } catch {
      setError(L.errors.google);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (honeypot) return;

    if (mode === "reset") {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err: any) {
        // Do not reveal whether the account exists, except for transport errors.
        if (err?.code === "auth/network-request-failed" || err?.code === "auth/too-many-requests") {
          setError(errorFor(err.code));
          setLoading(false);
          return;
        }
      }
      setInfo(L.resetSent);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) return setError(L.errors.weak);
      if (password !== verifyPassword) return setError(L.errors.mismatch);
      if (!consent) return setError(L.errors.consent);
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        onBack();
      } else {
        signingUp.current = true;
        const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        await setDoc(doc(db, "users", cred.user.uid), {
          firstName, lastName, displayName, company, email,
          privacyAcceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await sendEmailVerification(cred.user).catch(() => undefined);
        setMode("verify");
      }
    } catch (err: any) {
      signingUp.current = false;
      setError(errorFor(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "login" ? L.loginTitle : mode === "signup" ? L.signupTitle : mode === "reset" ? L.resetTitle : L.verifyTitle;
  const sub = mode === "login" ? L.loginSub : mode === "signup" ? L.signupSub : mode === "reset" ? L.resetSub : L.verifySub.replace("{email}", email);
  const strengthColor = ["bg-red", "bg-red", "bg-amber-400", "bg-green", "bg-green"][score];

  return (
    <div className="min-h-[calc(100vh-80px)] -mt-6 grid lg:grid-cols-[0.95fr_1.05fr] bg-bg font-sans">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#1E1948] text-white p-12 xl:p-16">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[#7B6CF0]/40 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-[#C9A24A]/25 blur-[100px]" />
        <button onClick={onBack} className="relative self-start inline-flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center"><img src="/icon.svg" alt="" className="w-6 h-6" /></span>
          <span className="text-xl font-bold tracking-tight">Quantrih</span>
        </button>

        <div className="relative">
          <svg viewBox="0 0 420 160" className="w-full max-w-md mb-10" aria-hidden="true">
            <defs>
              <linearGradient id="authArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9283F2" stopOpacity="0.55" /><stop offset="100%" stopColor="#9283F2" stopOpacity="0" /></linearGradient>
            </defs>
            <path d="M0 130 L40 118 L80 122 L120 98 L160 104 L200 76 L240 84 L280 58 L320 62 L360 34 L420 22 L420 160 L0 160 Z" fill="url(#authArea)" />
            <path d="M0 130 L40 118 L80 122 L120 98 L160 104 L200 76 L240 84 L280 58 L320 62 L360 34 L420 22" fill="none" stroke="#B6ABF7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 132 L60 128 L120 122 L180 112 L240 108 L300 96 L360 90 L420 80" fill="none" stroke="#C9A24A" strokeWidth="2" strokeDasharray="3 8" strokeLinecap="round" />
          </svg>
          <ul className="grid gap-6">
            {L.perks.map((p, i) => {
              const Icon = PERK_ICONS[i];
              return (
                <li key={p.t} className="flex gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><Icon size={18} /></span>
                  <div>
                    <p className="font-semibold">{p.t}</p>
                    <p className="text-sm text-white/65 mt-0.5">{p.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">{L.secured}</p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col items-center justify-center px-5 py-12">
        <button onClick={onBack} className="absolute top-6 left-5 inline-flex items-center gap-1.5 text-sm text-text-3 hover:text-text">
          <ArrowLeft size={16} />
        </button>

        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8 flex justify-center"><QuantrihLogo variant="bars" size="md" className="text-pv-blue" /></div>

          {(mode === "login" || mode === "signup") && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-3 mb-8">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => switchMode(m)} className={cn("py-2.5 rounded-xl text-sm font-semibold transition-all", mode === m ? "bg-white text-text shadow-sm" : "text-text-3 hover:text-text")}>
                  {m === "login" ? L.login : L.signup}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
              <p className="text-sm text-text-3 mt-1.5 mb-7 leading-relaxed">{sub}</p>

              {mode === "verify" ? (
                <div className="flex flex-col items-center text-center gap-5 py-4">
                  <span className="w-16 h-16 rounded-full bg-green-bg text-green flex items-center justify-center"><MailCheck size={30} /></span>
                  <button onClick={onBack} className="w-full bg-text text-bg font-semibold py-3.5 rounded-xl text-sm hover:opacity-90">{L.continue}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

                  {mode !== "reset" && (
                    <>
                      <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-surface-3/40 text-text font-semibold py-3 border border-border rounded-xl text-sm transition-all shadow-sm disabled:opacity-50">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {L.google}
                      </button>
                      <div className="flex items-center gap-3 py-1">
                        <span className="flex-1 h-px bg-border" />
                        <span className="text-xs text-text-4">{L.or}</span>
                        <span className="flex-1 h-px bg-border" />
                      </div>
                    </>
                  )}

                  {mode === "signup" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={L.firstName} icon={User}>
                        <input required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(inputCls, "pl-10")} />
                      </Field>
                      <Field label={L.lastName}>
                        <input required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(inputCls, "pl-4")} />
                      </Field>
                    </div>
                  )}

                  <Field label={L.email} icon={Mail}>
                    <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className={cn(inputCls, "pl-10")} />
                  </Field>

                  {mode === "signup" && (
                    <Field label={L.company} icon={Building2}>
                      <input autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={cn(inputCls, "pl-10")} />
                    </Field>
                  )}

                  {mode !== "reset" && (
                    <div>
                      <Field label={L.pass} icon={Lock}>
                        <input
                          type={showPw ? "text" : "password"} required minLength={mode === "signup" ? 8 : undefined}
                          autoComplete={mode === "login" ? "current-password" : "new-password"}
                          value={password} onChange={(e) => setPassword(e.target.value)} className={cn(inputCls, "pl-10 pr-11")}
                        />
                        <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? L.hide : L.show} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 hover:text-text p-1">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </Field>
                      {mode === "login" && (
                        <div className="flex justify-end mt-1.5">
                          <button type="button" onClick={() => switchMode("reset")} className="text-xs font-semibold text-pv-blue hover:text-pv-blue-d">{L.forgot}</button>
                        </div>
                      )}
                      {mode === "signup" && password.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 grid grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((k) => <span key={k} className={cn("h-1 rounded-full", score >= k ? strengthColor : "bg-surface-3")} />)}
                          </div>
                          <span className="text-[11px] text-text-3 w-20 text-right">{L.strength[score]}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "signup" && (
                    <>
                      <Field label={L.passVerify} icon={Lock}>
                        <input type={showPw ? "text" : "password"} required autoComplete="new-password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} className={cn(inputCls, "pl-10")} />
                        {verifyPassword && verifyPassword === password && <CheckCircle2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green" />}
                      </Field>
                      <label className="flex items-start gap-2.5 text-xs text-text-2 cursor-pointer">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#5B4BDB]" />
                        <span>{L.consent} <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-pv-blue font-semibold hover:underline">{L.privacy}</a>.</span>
                      </label>
                    </>
                  )}

                  {error && <div role="alert" className="p-3 bg-red-bg border border-red/20 rounded-xl text-red text-sm">{error}</div>}
                  {info && <div role="status" className="p-3 bg-green-bg border border-green/20 rounded-xl text-green text-sm">{info}</div>}

                  <button type="submit" disabled={loading} className="w-full mt-2 bg-pv-blue hover:bg-pv-blue-d text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-[0_10px_24px_-10px_rgba(91,75,219,0.7)] disabled:opacity-60 flex justify-center items-center gap-2">
                    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {mode === "login" ? L.submitLogin : mode === "signup" ? L.submitSignup : L.submitReset}
                  </button>

                  {mode === "reset" && (
                    <button type="button" onClick={() => switchMode("login")} className="w-full text-sm font-semibold text-text-3 hover:text-text py-2">{L.backToLogin}</button>
                  )}
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="lg:hidden mt-10 text-center text-xs text-text-4">{L.secured}</p>
        </div>
      </main>
    </div>
  );
}
