import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, serverTimestamp } from '../../firebase';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { QuantrihLogo } from '../ui/Logo';
import { ArrowLeft, Mail, Lock, User, Building2 } from 'lucide-react';

export function Auth({ onBack }: { onBack: () => void }) {
  const { language } = useTranslation();
  const { login: googleLogin, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  const [honeypot, setHoneypot] = useState(''); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      onBack();
    }
  }, [user, onBack]);

  const isFr = language === 'fr';
  const t = isFr ? {
    loginTitle: 'Connexion à Quantrih',
    signupTitle: 'Créer votre compte',
    email: 'Adresse e-mail',
    pass: 'Mot de passe',
    passVerify: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    company: 'Société (Optionnel)',
    submitLogin: 'Se connecter',
    submitSignup: 'Créer un compte',
    forgotPassword: 'Mot de passe oublié ?',
    googleBtnText: 'Continuer avec Google',
    dividerText: 'ou continuer avec e-mail'
  } : {
    loginTitle: 'Sign in to Quantrih',
    signupTitle: 'Create your account',
    email: 'Email Address',
    pass: 'Password',
    passVerify: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    company: 'Company (Optional)',
    submitLogin: 'Sign In',
    submitSignup: 'Create Account',
    forgotPassword: 'Forgot password?',
    googleBtnText: 'Continue with Google',
    dividerText: 'or continue with email'
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleLogin();
      onBack();
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(isFr ? "La connexion avec Google a échoué. Veuillez réessayer." : "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent.');
    } catch (err: any) {
      setError('Error sending password reset email.');
    }
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setError("Validation system error.");
      return;
    }

    if (!isLogin && password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    const fullDisplayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullDisplayName,
          photoURL: photoData });
        await sendEmailVerification(userCredential.user);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName,
          lastName,
          displayName: fullDisplayName,
          photoURL: photoData,
          company,
          email,
          updatedAt: serverTimestamp(),
        });
      }
      onBack();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-900 selection:bg-[#635BFF] selection:text-white relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-all hover:scale-105 hover:shadow-md z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="mb-8 cursor-pointer flex flex-col items-center transition-transform hover:scale-105" onClick={onBack}>
           <QuantrihLogo variant="sigma" size="md" className="text-[#635BFF]" />
        </div>

        <div className="w-full bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.08),0_30px_60px_-30px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          
          <div className="p-8 md:p-10">

            <h2 className="text-2xl font-bold text-center text-slate-900 mb-6 tracking-tight">
              {isLogin ? t.loginTitle : t.signupTitle}
            </h2>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                {/* Honeypot */}
                <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" tabIndex={-1} />

                {/* Google Sign-In button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 border border-slate-200 rounded-xl text-xs transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>{t.googleBtnText}</span>
                </button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium lowercase tracking-wide">{t.dividerText}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {!isLogin && (
                  <>
                  <div className="flex justify-center mb-4">
                    <div className="relative group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                        {photoData ? (
                          <img src={photoData} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Upload profile picture" />
                      <div className="absolute -bottom-2 bg-[#635BFF] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Upload
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.firstName}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <input 
                          type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane"
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.lastName}</label>
                      <input 
                        type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                      />
                    </div>
                  </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.email}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.company}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.pass}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                    />
                  </div>
                  {isLogin && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[11px] font-semibold text-[#635BFF] hover:text-[#4B45D6] transition-colors"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.passVerify}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" required value={verifyPassword} onChange={e => setVerifyPassword(e.target.value)} placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center mt-2">
                    {error}
                  </div>
                )}
                {resetMessage && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-medium text-center mt-2">
                    {resetMessage}
                  </div>
                )}

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-6 bg-[#635BFF] hover:bg-[#4B45D6] text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {isLogin ? t.submitLogin : t.submitSignup}
                </button>
              </motion.form>
            </AnimatePresence>
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="ml-2 text-[#635BFF] hover:text-[#4B45D6] font-semibold transition-colors"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>

          </div>
        </div>

        <p className="mt-8 text-xs text-slate-500 font-medium">
          Secure authentication powered by <span className="font-bold text-slate-700">Firebase</span>
        </p>
      </div>
    </div>
  );
}
