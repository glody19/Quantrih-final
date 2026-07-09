import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db, handleFirestoreError, OperationType, serverTimestamp } from '../../firebase';
import { 
 updateProfile, 
 updateEmail, 
 updatePassword,
 signOut,
 sendEmailVerification
} from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { 
 User, 
 Mail, 
 Shield, 
 LogOut, 
 Save, 
 Key, 
 History,
 Settings,
 Bell,
 CreditCard,
 Globe,
 Zap,
 Lock as LockIcon,
 ShieldAlert,
 DollarSign,
 FileText,
 Plus,
 Trash2,
 Edit2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Profile({ onBack }: { onBack: () => void }) {
 const { user } = useAuth();
 const [displayName, setDisplayName] = useState(user?.displayName || '');
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [email, setEmail] = useState(user?.email || '');
 const [nationality, setNationality] = useState('');
 const [residenceCountry, setResidenceCountry] = useState('');
 const [phone, setPhone] = useState('');
 const [phoneCountryCode, setPhoneCountryCode] = useState('');
 const [phoneCountryFlag, setPhoneCountryFlag] = useState('');
 const [avatarUrl, setAvatarUrl] = useState('');
 const [username, setUsername] = useState('');
 const [canChangePassword, setCanChangePassword] = useState(true);
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
 const [twoFactorMethod, setTwoFactorMethod] = useState('app');
 const [passwordLastChangedAt, setPasswordLastChangedAt] = useState<any>(null);
 const [securityNotificationsEnabled, setSecurityNotificationsEnabled] = useState(true);
 const [createdAt, setCreatedAt] = useState<any>(null);
 const [status, setStatus] = useState('active');
 const [fetching, setFetching] = useState(true);

 React.useEffect(() => {
   if (!user) return;
   const fetchUserData = async () => {
     try {
       const userRef = doc(db, `users/${user.uid}`);
       const userSnap = await getDoc(userRef);
       if (userSnap.exists()) {
         const data = userSnap.data();
         if (data.displayName) setDisplayName(data.displayName);
         if (data.firstName) setFirstName(data.firstName);
         if (data.lastName) setLastName(data.lastName);
         if (data.nationality) setNationality(data.nationality);
         if (data.residenceCountry) setResidenceCountry(data.residenceCountry);
         if (data.phone) setPhone(data.phone);
         if (data.phoneCountryCode) setPhoneCountryCode(data.phoneCountryCode);
         if (data.phoneCountryFlag) setPhoneCountryFlag(data.phoneCountryFlag);
         if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
         if (data.username) setUsername(data.username);
         if (data.canChangePassword !== undefined) setCanChangePassword(data.canChangePassword);
         if (data.twoFactorEnabled !== undefined) setTwoFactorEnabled(data.twoFactorEnabled);
         if (data.twoFactorMethod) setTwoFactorMethod(data.twoFactorMethod);
         if (data.passwordLastChangedAt) setPasswordLastChangedAt(data.passwordLastChangedAt);
         if (data.securityNotificationsEnabled !== undefined) setSecurityNotificationsEnabled(data.securityNotificationsEnabled);
         if (data.createdAt) setCreatedAt(data.createdAt);
         if (data.status) setStatus(data.status);
       }
     } catch (err: any) {
       console.error("Error fetching user data:", err);
     } finally {
       setFetching(false);
     }
   };
   fetchUserData();
 }, [user]);

 const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'fees' | 'reports'>('profile');
 const [newPassword, setNewPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

 const handleVerifyEmail = async () => {
 if (!user) return;
 setLoading(true);
 try {
 await sendEmailVerification(user);
 setMessage({ text: 'Verification email sent. Please check your inbox.', type: 'success' });
 } catch (err: any) {
 console.warn(err);
 if (err.code === 'auth/too-many-requests') {
 setMessage({ text: 'Too many requests, please wait before resending.', type: 'error' });
 } else {
 setMessage({ text: 'Erreur lors de l\'envoi de la vérification.', type: 'error' });
 }
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateProfile = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user) return;
 setLoading(true);
 setMessage(null);

 try {
 if (displayName !== user.displayName) {
 await updateProfile(user, { displayName });
 }
 
 const userPath = `users/${user.uid}`;
 const userRef = doc(db, userPath);
 await setDoc(userRef, {
 displayName,
 firstName,
 lastName,
 email: user.email,
 nationality,
 residenceCountry,
 phone,
 phoneCountryCode,
 phoneCountryFlag,
 avatarUrl,
 username,
 canChangePassword,
 twoFactorEnabled,
 twoFactorMethod,
 securityNotificationsEnabled,
 status,
 updatedAt: serverTimestamp(),
 }, { merge: true });

 setMessage({ text: 'Profile updated successfully.', type: 'success' });
 } catch (err: any) {
 handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
 setMessage({ text: 'Error during update.', type: 'error' });
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteAccount = async () => {
 if (!user) return;
 const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
 if (!confirmDelete) return;

 setLoading(true);
 try {
 await user.delete();
 onBack();
 } catch (err: any) {
 console.warn(err);
 if (err.code === 'auth/requires-recent-login') {
 setMessage({ text: 'Please sign in again before deleting your account.', type: 'error' });
 } else {
 setMessage({ text: 'Error deleting account.', type: 'error' });
 }
 } finally {
 setLoading(false);
 }
 };

 const handleLogout = async () => {
 await signOut(auth);
 onBack();
 };

 if (!user) {
 return (
 <div className="min-h-screen bg-bg flex items-center justify-center">
 <div className="text-text">Redirecting...</div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-bg p-6 lg:p-12 relative overflow-x-hidden">
 <div className="max-w-6xl mx-auto w-full">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col lg:flex-row gap-8"
 >
 {/* Sidebar */}
 <div className="w-full lg:w-1/3 flex flex-col gap-4">
 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <div className="flex flex-col items-center text-center mb-6">
 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-text text-4xl font-bold mb-4 border-4 border-border shadow-2xl">
 {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
 </div>
 <h3 className="text-xl font-bold text-text tracking-tight italic">
 {user.displayName || 'Utilisateur Quantrih'}
 </h3>
 <div className="flex items-center gap-2 mt-2">
 <p className="text-text text-xs font-semibold ">
 Standard
 </p>
 {user.emailVerified && (
 <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-semibold">
 <Shield size={10} /> Vérifié
 </span>
 )}
 </div>
 </div>

 <div className="space-y-1">
 <button 
 onClick={() => setActiveTab('profile')}
 className={cn(
 "w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
 activeTab === 'profile' ? "bg-blue-600/10 text-blue-400" : "text-text hover:bg-text/5"
 )}
 >
 <User size={18} /> Profile & Identity
 </button>
 <button 
 onClick={() => setActiveTab('security')}
 className={cn(
 "w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
 activeTab === 'security' ? "bg-blue-600/10 text-blue-400" : "text-text hover:bg-text/5"
 )}
 >
 <Shield size={18} /> Sécurité & Edge
 </button>
 <button 
 onClick={() => setActiveTab('billing')}
 className={cn(
 "w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
 activeTab === 'billing' ? "bg-blue-600/10 text-blue-400" : "text-text hover:bg-text/5"
 )}
 >
 <CreditCard size={18} /> Plan & Facturation
 </button>
 <button 
 onClick={() => setActiveTab('fees')}
 className={cn(
 "w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
 activeTab === 'fees' ? "bg-blue-600/10 text-blue-400" : "text-text hover:bg-text/5"
 )}
 >
 <DollarSign size={18} /> Management Fees
 </button>
 <button 
 onClick={() => setActiveTab('reports')}
 className={cn(
 "w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
 activeTab === 'reports' ? "bg-blue-600/10 text-blue-400" : "text-text hover:bg-text/5"
 )}
 >
 <FileText size={18} /> Reports
 </button>
 </div>

 <div className="mt-8 pt-8 border-t border-border">
 <button 
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-[1.5rem] font-bold text-sm transition-all"
 >
 <LogOut size={18} /> Déconnexion
 </button>
 </div>
 </div>
 
 <button 
 onClick={onBack}
 className="w-full p-4 bg-surface-2/50 border border-border rounded-[2rem] text-text font-bold text-xs hover:text-text transition-all"
 >
 Retour au terminal
 </button>
 </div>

 {/* Main Content */}
 <div className="flex-1 space-y-6">
 {activeTab === 'profile' && (
 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <h2 className="text-2xl font-bold text-text mb-8 tracking-tight italic flex items-center gap-3">
 <Settings className="text-blue-500" /> Account Settings
 </h2>

 <form onSubmit={handleUpdateProfile} className="space-y-6">
 {message && (
 <div className={cn(
 "p-4 rounded-[1.5rem] text-sm font-medium",
 message.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"
 )}>
 {message.text}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Display Name</label>
 <div className="relative">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text" size={16} />
 <input 
 type="text" 
 value={displayName}
 onChange={(e) => setDisplayName(e.target.value)}
 className="w-full bg-surface-2/50 border border-border rounded-[1.5rem] py-3 pl-12 pr-4 text-text outline-none focus:border-blue-500/50 transition-all"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Email</label>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text" size={16} />
 <input 
 type="email" 
 disabled
 value={email}
 className="w-full bg-surface-2/20 border border-border/50 rounded-[1.5rem] py-3 pl-12 pr-4 text-text cursor-not-allowed"
 />
 </div>
 <div className="flex items-center justify-between mt-2">
 <p className="text-xs text-text">Email is managed natively via the account.</p>
 {user.emailVerified ? (
 <span className="text-xs font-bold text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-full">✓ Email Verified</span>
 ) : (
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-amber-500 px-2 py-1 bg-amber-500/10 rounded-full">⚠️ Unverified</span>
 <button 
 type="button"
 onClick={handleVerifyEmail}
 disabled={loading}
 className="text-xs bg-blue-600 hover:bg-blue-500 text-text font-bold px-2 py-1 rounded transition-colors disabled:opacity-50"
 >
 Resend
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="pt-6 border-t border-border">
 <button 
 disabled={loading}
 className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-[1.5rem] transition-all flex items-center gap-2 disabled:opacity-50"
 >
 <Save size={18} /> Save Changes
 </button>
 </div>
 </form>

 <div className="mt-8 pt-8 border-t border-border">
   <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2"><History size={18} /> Account Metadata</h3>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="p-4 bg-surface-2/50 border border-border rounded-2xl">
       <p className="text-xs text-text mb-1">Creation Date</p>
       <p className="text-sm font-bold text-text">{createdAt ? new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt).toLocaleDateString() : 'Not available'}</p>
     </div>
     <div className="p-4 bg-surface-2/50 border border-border rounded-2xl">
       <p className="text-xs text-text mb-1">Last Login</p>
       <p className="text-sm font-bold text-text">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Not available'}</p>
     </div>
     <div className="p-4 bg-surface-2/50 border border-border rounded-2xl">
       <p className="text-xs text-text mb-1">Last Updated</p>
       <p className="text-sm font-bold text-text">Automatic</p>
     </div>
     <div className="p-4 bg-surface-2/50 border border-border rounded-2xl">
       <p className="text-xs text-text mb-1">Account Status</p>
       <p className="text-sm font-bold text-emerald-500 capitalize">{status}</p>
     </div>
   </div>
 </div>
 
 </div>
 )}

 {activeTab === 'security' && (
 <div className="space-y-6">
 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <h2 className="text-2xl font-bold text-text mb-2 tracking-tight italic flex items-center gap-3">
 <Globe className="text-blue-500" /> Infrastructure Edge
 </h2>
 <p className="text-text text-sm mb-8">Protection en temps réel par Quantrih Shield & Cloudflare CDN.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
 <div className="p-4 bg-surface-2 border border-border rounded-[2rem]">
 <div className="flex items-center gap-2 mb-2">
 <Zap size={14} className="text-amber-500" />
 <span className="text-xs font-semibold text-text ">Latence Edge</span>
 </div>
 <p className="text-2xl font-bold text-text">12ms</p>
 <p className="text-xs text-emerald-500 font-bold mt-1">Excellent</p>
 </div>
 <div className="p-4 bg-surface-2 border border-border rounded-[2rem]">
 <div className="flex items-center gap-2 mb-2">
 <Globe size={14} className="text-blue-500" />
 <span className="text-xs font-semibold text-text ">Nearest Node</span>
 </div>
 <p className="text-2xl font-bold text-text">BRU-BEL</p>
 <p className="text-xs text-text font-bold mt-1">Brussels, Belgium</p>
 </div>
 <div className="p-4 bg-surface-2 border border-border rounded-[2rem]">
 <div className="flex items-center gap-2 mb-2">
 <ShieldAlert size={14} className="text-purple-500" />
 <span className="text-xs font-semibold text-text ">Bot Mitigation</span>
 </div>
 <p className="text-2xl font-bold text-text">Active</p>
 <p className="text-xs text-text font-bold mt-1">Active (Niveau Haute-Sécurité)</p>
 </div>
 </div>

 <div className="h-48 bg-surface-3 rounded-[2rem] border border-border overflow-hidden relative group">
 <div className="absolute inset-0 bg-[#001] opacity-50" />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="relative">
 <div className="w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
 </div>
 </div>
 </div>
 <div className="absolute bottom-4 left-6">
 <p className="text-xs font-semibold text-text mb-1">Global Status:</p>
 <div className="flex gap-2">
 {['LHR', 'FRA', 'CDG', 'JFK', 'SFO', 'NRT'].map(node => (
 <span key={node} className="text-[8px] px-1.5 py-0.5 rounded bg-surface-3 text-text font-bold border border-slate-700">{node}</span>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <h3 className="text-lg font-bold text-text mb-6 tracking-tight italic flex items-center gap-3">
 <LockIcon className="text-purple-500" /> Advanced Authentication
 </h3>
 
 <div className="space-y-4">
 <div className="p-4 bg-surface-2/50 border border-border rounded-[2rem] flex items-center justify-between">
 <div>
 <p className="text-sm font-bold text-text">Change password</p>
 <p className="text-xs text-text">Last changed: 3 months ago</p>
 </div>
 <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">Edit</button>
 </div>

 <div className="p-4 bg-surface-2/50 border border-border rounded-[2rem] flex items-center justify-between">
 <div>
 <p className="text-sm font-bold text-text">Double authentification (2FA)</p>
 <p className="text-xs text-text">Add an extra MFA layer</p>
 </div>
 <div 
   onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
   className={`w-12 h-6 rounded-full relative cursor-pointer p-1 transition-colors ${twoFactorEnabled ? 'bg-blue-600' : 'bg-surface-3'}`}
 >
   <div className={`w-4 h-4 bg-white rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-6' : ''}`}></div>
 </div>
 </div>
 
 <div className="p-4 bg-surface-2/50 border border-border rounded-[2rem] flex items-center justify-between">
 <div>
 <p className="text-sm font-bold text-text">Security Notifications</p>
 <p className="text-xs text-text">Suspicious login alerts</p>
 </div>
 <div 
   onClick={() => setSecurityNotificationsEnabled(!securityNotificationsEnabled)}
   className={`w-12 h-6 rounded-full relative cursor-pointer p-1 transition-colors ${securityNotificationsEnabled ? 'bg-blue-600' : 'bg-surface-3'}`}
 >
   <div className={`w-4 h-4 bg-white rounded-full transition-transform ${securityNotificationsEnabled ? 'translate-x-6' : ''}`}></div>
 </div>
 </div>
 
 <div className="pt-6">
  <button 
    onClick={handleUpdateProfile}
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-500 text-text font-bold px-8 py-3 rounded-[1.5rem] transition-all flex items-center gap-2 disabled:opacity-50"
  >
    <Save size={18} /> Save Security Settings
  </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'profile' && (
 <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl backdrop-blur-xl">
 <h3 className="text-lg font-bold text-red-500 mb-2 tracking-tight italic">Danger Zone</h3>
 <p className="text-text text-sm mb-6 font-light">Account deletion is irreversible. All your backtesting configurations will be lost.</p>
 <button onClick={handleDeleteAccount} className="text-red-500 font-bold text-xs py-2 px-4 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all">Delete Account</button>
 </div>
 )}

 {activeTab === 'fees' && (
 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-text tracking-tight italic flex items-center gap-3">
 <DollarSign className="text-blue-500" /> Management Fees
 </h2>
 <div className="flex gap-2">
 <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-text px-4 py-2 rounded-[1.5rem] text-xs font-bold transition-all">
 <Plus size={14} /> Add Fee Structure
 </button>
 <button className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-[1.5rem] text-xs font-bold hover:bg-red-500/20 transition-all">
 <Trash2 size={14} /> Delete All
 </button>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="py-4 px-2 text-text font-semibold text-xs ">#</th>
 <th className="py-4 px-2 text-text font-semibold text-xs ">Name</th>
 <th className="py-4 px-2 text-text font-semibold text-xs ">Type</th>
 <th className="py-4 px-2 text-text font-semibold text-xs ">Payment Schedule</th>
 <th className="py-4 px-2 text-text font-semibold text-xs text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/50">
 {[
 { id: 1, name: 'Fixed 1.0%', type: 'Annual percentage of 1.00%', schedule: 'Annual' },
 { id: 2, name: 'Fixed 1.50', type: 'Annual percentage of 1.50%', schedule: 'Annual' },
 { id: 3, name: 'Flat with Inflation', type: 'Annual fee of $1,500 adjusted for inflation', schedule: 'Annual' }
 ].map((fee) => (
 <tr key={fee.id} className="hover:bg-text/5 transition-colors">
 <td className="py-4 px-2 text-text">{fee.id}</td>
 <td className="py-4 px-2 font-bold text-text">{fee.name}</td>
 <td className="py-4 px-2 text-text">{fee.type}</td>
 <td className="py-4 px-2 text-text">{fee.schedule}</td>
 <td className="py-4 px-2 text-right">
 <div className="flex justify-end gap-2">
 <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-colors"><Edit2 size={14} /></button>
 <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors"><Trash2 size={14} /></button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'reports' && (
 <div className="p-8 bg-surface/80 border border-border rounded-3xl backdrop-blur-xl">
 <h2 className="text-2xl font-bold text-text mb-2 tracking-tight italic flex items-center gap-3">
 <FileText className="text-blue-500" /> Report Template
 </h2>
 <p className="text-text text-sm mb-8">Customize global report generation parameters and thematic styling.</p>

 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Company Name</label>
 <input type="text" defaultValue="Quantrih Analytics" className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-text outline-none focus:border-blue-500/50" />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Include Logo</label>
 <select className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-text outline-none">
 <option>Yes</option>
 <option>No</option>
 </select>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Logo Image</label>
 <div className="flex items-center gap-4">
 <input type="file" className="text-xs text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file: file:bg-blue-600 file:text-text hover:file:bg-blue-500" />
 <span className="text-xs text-text italic">No file chosen</span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Page Footer Text</label>
 <input type="text" defaultValue="analytics.quantrih.com" className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-text" />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Page Footer Link</label>
 <input type="text" defaultValue="https://analytics.quantrih.com" className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-2.5 text-text" />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-semibold text-text ">Disclosures</label>
 <textarea rows={4} placeholder="Leave blank to use defaults" className="w-full bg-surface-2 border border-border rounded-[1.5rem] px-4 py-3 text-text outline-none focus:border-blue-500/50 resize-none text-sm" />
 </div>

 <div className="pt-6">
 <button className="bg-blue-600 hover:bg-blue-500 text-text font-bold px-8 py-3 rounded-[1.5rem] transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
 Save Changes
 </button>
 <button className="ml-4 text-text font-bold text-xs hover:text-text transition-colors">Restore Defaults</button>
 </div>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </div>
 </div>
 );
}
