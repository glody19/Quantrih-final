import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, loginWithGoogle, loginWithApple, db, serverTimestamp } from '../../firebase';
import { useTranslation } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';
import { QuantrihLogo } from '../ui/Logo';

export function Auth({ onBack }: { onBack: () => void }) {
  const { language } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  
  // Basic Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  
  // Registration Profile States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [firmType, setFirmType] = useState('Individual Investor');
  
  const [honeypot, setHoneypot] = useState(''); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const t = {
    loginTitle: 'Sign In',
    signupTitle: 'Sign Up',
    email: 'Email Address',
    pass: 'Password',
    passVerify: 'Verify Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    submitLogin: 'Sign In',
    submitSignup: 'Create Account',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    forgotPassword: 'Forgot password?',
    bypass: 'Bypass to Terminal',
  };

  const handleResetPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent.');
    } catch (err: any) {
      console.warn(err);
      setError('Error sending password reset email.');
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
        await updateProfile(userCredential.user, { displayName: fullDisplayName });
        
        await sendEmailVerification(userCredential.user);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName,
          lastName,
          displayName: fullDisplayName,
          company,
          firmType,
          email,
          updatedAt: serverTimestamp(),
        });
      }
      onBack();
    } catch (err: any) {
      console.warn(err);
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
    <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Business background image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-bg/40 via-bg/20 to-bg/60"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden flex flex-col items-center justify-center opacity-40">
         <div className="w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-blue-500/10 rounded-full blur-[140px] mix-blend-screen" />
         <div className="w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-pv-blue/10 rounded-full blur-[120px] mix-blend-screen absolute bottom-0 right-0" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[340px] flex flex-col items-center"
      >
        <div className="mb-10 cursor-pointer flex flex-col items-center transition-transform hover:scale-105" onClick={onBack}>
           <QuantrihLogo variant="sigma" size="md" className="text-pv-blue" />
        </div>

        <div className="w-full bg-surface border border-pv-blue/20 rounded-3xl shadow-xl overflow-hidden">
           <div className="flex border-b border-border p-1 bg-surface-2">
             <button 
                onClick={() => setIsLogin(true)} 
                className={cn("flex-1 py-3 text-[10px] uppercase tracking-widest font-semibold transition-all rounded-[1.5rem]", isLogin ? "text-pv-blue bg-surface shadow-sm ring-1 ring-border" : "text-text-2 hover:text-text")}
             >
               {t.loginTitle}
             </button>
             <button 
                onClick={() => setIsLogin(false)} 
                className={cn("flex-1 py-3 text-[10px] uppercase tracking-widest font-semibold transition-all rounded-[1.5rem]", !isLogin ? "text-pv-blue bg-surface shadow-sm ring-1 ring-border" : "text-text-2 hover:text-text")}
             >
               {t.signupTitle}
             </button>
           </div>

           <div className="p-6">
             <AnimatePresence mode="popLayout" initial={false}>
               <motion.form 
                 key={isLogin ? 'login' : 'signup'}
                 initial={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                 animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                 exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 onSubmit={handleSubmit} 
                 className="space-y-3"
               >
                 {!isLogin && (
                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                       <input 
                         type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t.firstName}
                         className="w-full bg-surface-2 border border-border rounded-[1.5rem] py-2.5 px-3 text-xs outline-none focus:border-pv-blue transition-all text-text shadow-sm" 
                       />
                     </div>
                     <div className="space-y-1.5">
                       <input 
                         type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t.lastName}
                         className="w-full bg-surface-2 border border-border rounded-[1.5rem] py-2.5 px-3 text-xs outline-none focus:border-pv-blue transition-all text-text shadow-sm" 
                       />
                     </div>
                   </div>
                 )}

                 <div className="space-y-1.5">
                   <input 
                     type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t.email}
                     className="w-full bg-surface-2 border border-border rounded-[1.5rem] py-2.5 px-3 text-xs outline-none focus:border-pv-blue transition-all text-text shadow-sm" 
                   />
                 </div>

                 <div className="space-y-1.5">
                   <input 
                     type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t.pass}
                     className="w-full bg-surface-2 border border-border rounded-[1.5rem] py-2.5 px-3 text-xs outline-none focus:border-pv-blue transition-all text-text shadow-sm" 
                   />
                 </div>

                 {isLogin && (
                   <div className="flex justify-end">
                     <button
                       type="button"
                       onClick={handleResetPassword}
                       className="text-[10px] text-pv-blue hover:underline"
                     >
                       {t.forgotPassword}
                     </button>
                   </div>
                 )}

                 {!isLogin && (
                   <div className="space-y-1.5">
                     <input 
                       type="password" required value={verifyPassword} onChange={e => setVerifyPassword(e.target.value)} placeholder={t.passVerify}
                       className="w-full bg-surface-2 border border-border rounded-[1.5rem] py-2.5 px-3 text-xs outline-none focus:border-pv-blue transition-all text-text shadow-sm" 
                     />
                   </div>
                 )}

                 {error && (
                   <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-2xl text-red-400 text-[10px] font-medium text-center mt-2">
                     {error}
                   </div>
                 )}
                 {resetMessage && (
                   <div className="p-3 bg-green-950/40 border border-green-900/50 rounded-2xl text-green-400 text-[10px] font-medium text-center mt-2">
                     {resetMessage}
                   </div>
                 )}

                 <button 
                   type="submit" disabled={loading}
                   className="w-full mt-4 bg-gradient-to-r from-pv-blue to-blue-600 text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] font-medium py-3 rounded-[1.5rem] text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                 >
                   {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                   {isLogin ? t.submitLogin : t.submitSignup}
                 </button>
               </motion.form>
             </AnimatePresence>

             <div className="my-6 flex items-center gap-3">
               <div className="h-px bg-border flex-1" />
               <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium">Or</span>
               <div className="h-px bg-border flex-1" />
             </div>

             <button 
               type="button" onClick={() => { loginWithGoogle(); onBack(); }}
               className="w-full bg-surface border border-border text-text font-medium py-2.5 rounded-[1.5rem] text-[11px] flex items-center justify-center gap-3 hover:bg-surface-2 transition-colors shadow-sm"
             >
               <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="currentColor">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
               </svg>
               {t.google}
             </button>

             <button 
               type="button" onClick={() => { loginWithApple(); onBack(); }}
               className="w-full mt-3 bg-surface border border-border text-text font-medium py-2.5 rounded-[1.5rem] text-[11px] flex items-center justify-center gap-3 hover:bg-surface-2 transition-colors shadow-sm"
             >
               <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="currentColor">
                 <path d="M16.8 9.8c-.1-2.4 2-3.6 2.1-3.7-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-1-3.1-1-1.6 0-3.1.9-3.9 2.4-1.7 3-1.2 7.7.8 10.6 1 1.4 2.1 2.9 3.6 2.8 1.5-.1 2-1 3.7-1 1.7 0 2.2 1 3.8 1 1.6 0 2.5-1.4 3.5-2.8.5-.7 1.2-2.5 1.2-2.6-1.5-.7-2.4-2.2-2.4-4M13.2 4.4c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.7.7-3.6 1.7-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.8-.6 3.6-1.6"/>
               </svg>
               {t.apple}
             </button>
           </div>
        </div>

        <button onClick={onBack} className="mt-8 text-[9px] uppercase tracking-widest font-medium text-text-2 hover:text-text transition-colors">
          {t.bypass}
        </button>
      </motion.div>
    </div>
  );
}
