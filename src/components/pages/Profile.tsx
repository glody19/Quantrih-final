import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db, serverTimestamp } from '../../firebase';
import { 
  signOut, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Globe, 
  Briefcase, 
  Save, 
  LogOut, 
  Lock, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Search,
  Download,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { countries, Country } from '../../data/countries';

export function Profile({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  
  // Basic states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [accountType, setAccountType] = useState('Individual'); // 'Individual' | 'Corporate'
  const [company, setCompany] = useState('');
  const [photoURLState, setPhotoURLState] = useState(user?.photoURL || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Security credentials change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Re-auth modal states for sensitive operations
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthAction, setReauthAction] = useState<'update' | 'delete' | null>(null);
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Country search dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Page state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial profile values from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, `users/${user.uid}`);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.firstName) setFirstName(data.firstName);
          if (data.lastName) setLastName(data.lastName);
          if (data.residenceCountry) setResidenceCountry(data.residenceCountry);
          if (data.accountType) setAccountType(data.accountType);
          if (data.company) setCompany(data.company);
          if (data.photoURL) setPhotoURLState(data.photoURL);
        } else {
          // If Firestore document doesn't exist yet, try parsing the auth displayName
          if (user.displayName) {
            const parts = user.displayName.split(' ');
            if (parts.length > 1) {
              setFirstName(parts[0]);
              setLastName(parts.slice(1).join(' '));
            } else {
              setFirstName(user.displayName);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchUserData();
  }, [user]);

  // Find the selected country flag
  const selectedCountryObj = countries.find(
    c => c.name.toLowerCase() === residenceCountry.toLowerCase()
  );
  const selectedFlag = selectedCountryObj ? selectedCountryObj.flag : '🏳️';

  // Filter countries list based on typing
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reauthentication flow before executing sensitive actions
  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setReauthError(null);
    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      
      // If re-auth was successful, proceed to requested action
      setShowReauthModal(false);
      setReauthPassword('');
      
      if (reauthAction === 'update') {
        await executeProfileUpdate();
      } else if (reauthAction === 'delete') {
        await executeAccountDeletion();
      }
    } catch (err: any) {
      console.error("Re-authentication failed:", err);
      setReauthError(err.message || "Invalid current password. Please try again.");
      setLoading(false);
    }
  };

  // Profile Update trigger
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setMessage(null);
    
    // Check if email or password is being changed, which requires re-authentication
    const isEmailChanged = email.toLowerCase() !== (user.email || '').toLowerCase();
    const isPasswordChanged = newPassword.length > 0;

    if (isEmailChanged || isPasswordChanged) {
      setReauthAction('update');
      setShowReauthModal(true);
    } else {
      setLoading(true);
      await executeProfileUpdate();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept up to 50MB images and accept all image types
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ text: 'Image is too large. Please select an image under 50MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Let's use 512 for beautiful resolution
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoURLState(dataUrl);
        }
      };
      img.onerror = () => {
        // Fallback to just using raw dataUrl if canvas draw fails or for other formats
        setPhotoURLState(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setMessage({ text: 'Failed to read image file.', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  // Perform Firestore write and safe Auth field updates
  const executeProfileUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update Auth Email if changed
      if (email.toLowerCase() !== (user.email || '').toLowerCase()) {
        await updateEmail(user, email);
      }

      // 2. Update Auth Password if changed
      if (newPassword) {
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      const fullDisplayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];

      // 3. Update Auth Profile (Display Name & Photo)
      // Firebase Auth photoURL limit is 2048 characters.
      // If photoURLState is longer, we store it in Firestore instead of Auth (where there's no limit)
      const authPhoto = photoURLState && photoURLState.length <= 2048 ? photoURLState : '';

      await updateProfile(user, {
        displayName: fullDisplayName,
        photoURL: authPhoto
      });

      // 4. Update Firestore Document
      const userRef = doc(db, `users/${user.uid}`);
      
      await setDoc(userRef, {
        firstName,
        lastName,
        displayName: fullDisplayName,
        residenceCountry,
        accountType,
        company,
        email: email,
        photoURL: photoURLState,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setMessage({ text: 'Your account settings have been updated successfully.', type: 'success' });
    } catch (err: any) {
      console.error("Profile update error:", err);
      if (err.code === 'auth/requires-recent-login') {
        setReauthAction('update');
        setShowReauthModal(true);
      } else {
        setMessage({ text: err.message || 'An error occurred during update.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Download profile image helper
  const downloadProfileImage = async () => {
    if (!photoURLState) return;
    try {
      let url = photoURLState;
      if (!url.startsWith('data:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = `${firstName || 'profile'}_avatar.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (!photoURLState.startsWith('data:')) {
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download image:", err);
      window.open(photoURLState, '_blank');
    }
  };

  // Delete account confirmation
  const handleDeleteAccountClick = () => {
    setDeleteConfirmText('');
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmText('');
    setShowDeleteConfirm(false);
  };

  // Initiate Account Deletion (triggers re-auth first)
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setReauthAction('delete');
    setShowReauthModal(true);
  };

  // Permanently delete user data & auth entry
  const executeAccountDeletion = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Delete Firestore Subcollections (backtests)
      const backtestsRef = collection(db, `users/${user.uid}/backtests`);
      const backtestsSnap = await getDocs(backtestsRef);
      const deletePromises = backtestsSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      // 2. Delete Firestore User Document
      await deleteDoc(doc(db, `users/${user.uid}`));
      
      // 3. Force Sign Out before deleting user to ensure session is cleared
      // and avoid "on reste connecté" issue
      const currentUser = auth.currentUser;
      
      // 4. Delete Auth User
      if (currentUser) {
        await deleteUser(currentUser);
      }
      
      // 5. Final sign out just in case
      await signOut(auth);

      // 6. Navigate back to home
      onBack();
    } catch (err: any) {
      console.error("Account deletion error:", err);
      if (err.code === 'auth/requires-recent-login') {
        setReauthAction('delete');
        setShowReauthModal(true);
      } else {
        setMessage({ text: err.message || 'Failed to delete account. Please try again.', type: 'error' });
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onBack();
  };

  if (!user || fetching) {
    return (
      <div className="min-h-screen bg-[#F6F9FC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#635BFF]/30 border-t-[#635BFF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-900 selection:bg-[#635BFF] selection:text-white relative overflow-hidden">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-all hover:scale-105 hover:shadow-md z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl relative z-10 flex flex-col items-center mt-12 md:mt-6 mb-12"
      >
        {/* Avatar badge with floating action buttons */}
        <div className="relative mb-6 z-20 group">
          <div 
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white overflow-hidden relative"
          >
            {photoURLState ? (
              <img src={photoURLState} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] font-bold text-3xl uppercase">
                {firstName.charAt(0) || email.charAt(0) || "?"}
              </div>
            )}
          </div>

          {/* Floating Edit/Upload Camera Badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#635BFF] hover:bg-[#4B45D6] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all hover:scale-110 cursor-pointer animate-fade-in"
            title="Upload profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Floating Delete Badge (only shown if a photo exists) */}
          {photoURLState && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Do you want to delete your profile picture?")) {
                  setPhotoURLState("");
                }
              }}
              className="absolute -top-1 -right-1 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all hover:scale-110 cursor-pointer animate-fade-in"
              title="Delete profile picture"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Floating Download Badge (only shown if a photo exists) */}
          {photoURLState && (
            <button
              type="button"
              onClick={downloadProfileImage}
              className="absolute -bottom-1 -left-1 w-8 h-8 bg-white hover:bg-slate-50 text-slate-500 rounded-full flex items-center justify-center shadow-md border-2 border-white border-slate-100 transition-all hover:scale-110 cursor-pointer animate-fade-in"
              title="Download profile picture"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Settings Container */}
        <div className="w-full bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.08),0_30px_60px_-30px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative -mt-16 pt-16">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
              <p className="text-slate-500 mt-2">Manage your identity, country, and credentials</p>
            </div>

            {message && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-semibold text-center border flex items-center justify-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {message.type !== 'success' && <AlertTriangle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* Separate Name Fields as Requested: "nom enssuite prenom" */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Last Name (Nom)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">First Name (Prénom)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Editable Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                  />
                </div>
              </div>

              {/* Searchable Country Field: "quand il tape le nom du pays il trouve et tu mets le drapeau à gauche" */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Country of Residence</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xl">
                    <span>{selectedFlag}</span>
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={residenceCountry} 
                    onFocus={() => {
                      setShowCountryDropdown(true);
                      setSearchQuery(residenceCountry);
                    }}
                    onChange={e => {
                      setResidenceCountry(e.target.value);
                      setSearchQuery(e.target.value);
                      setShowCountryDropdown(true);
                    }} 
                    placeholder="Search and select country..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-10 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Country List Dropdown */}
                <AnimatePresence>
                  {showCountryDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto"
                    >
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c: Country) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setResidenceCountry(c.name);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium">{c.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">
                          No country found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account Type Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Account Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>
                  <select 
                    value={accountType} 
                    onChange={e => setAccountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm appearance-none"
                  >
                    <option value="Individual">Individual Investor</option>
                    <option value="Corporate">Corporate / Institution</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {accountType === 'Corporate' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Company Name</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                    placeholder="Acme Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                  />
                </div>
              )}

              {/* Separator / Credentials Modification heading */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Security Credentials</h3>
                <p className="text-xs text-slate-500 mb-4">Leave fields blank if you do not want to change your password</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Save and Sign Out Buttons */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#635BFF] hover:bg-[#4B45D6] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* Saved Backtests Section */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Saved Backtests</h3>
                <div className="space-y-2">
                  {/* Saved backtests list would be populated here */}
                  <p className="text-[11px] text-slate-400">No saved backtests yet.</p>
                </div>
              </div>

              {/* Danger Zone: "proposer aussi de supprimé son compte" */}
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 mb-3">Deleting your account is permanent and will completely erase all of your profile data.</p>
                
                <button
                  type="button"
                  onClick={handleDeleteAccountClick}
                  className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-900 hover:text-black border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 px-2 py-1 rounded-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Trash2 className="w-3 h-3 text-slate-500" />
                  Delete My Account
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Drawer/Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-red-50"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Are you absolutely sure?</h3>
              <p className="text-slate-500 text-center text-xs leading-relaxed mb-6">
                This action is irreversible. All of your saved portfolios, configuration settings, and profile details will be permanently deleted from our servers.
              </p>

              <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[11px] text-slate-600 font-semibold mb-2.5 text-center uppercase tracking-wider">
                  Please type <span className="font-bold text-red-600 select-none">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-center outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold tracking-wider"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-1.5 rounded-lg transition-all text-[11px] uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  Yes, Delete My Account
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-bold py-1.5 rounded-lg transition-all text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Re-authentication Modal */}
      <AnimatePresence>
        {showReauthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 bg-[#635BFF]/10 rounded-full flex items-center justify-center text-[#635BFF] mx-auto mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Confirm Your Password</h3>
              <p className="text-slate-500 text-center text-sm mb-6">
                For security reasons, please enter your current account password to authorize these changes.
              </p>
              
              <form onSubmit={handleReauthenticate} className="space-y-6">
                <div>
                  <input
                    type="password"
                    required
                    value={reauthPassword}
                    onChange={e => setReauthPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-base outline-none focus:bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm text-center"
                  />
                  {reauthError && (
                    <p className="text-xs font-semibold text-red-600 text-center mt-2">
                      {reauthError}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full bg-[#635BFF] hover:bg-[#4B45D6] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex justify-center items-center"
                  >
                    Confirm & Proceed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReauthModal(false);
                      setReauthPassword('');
                      setReauthError(null);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
