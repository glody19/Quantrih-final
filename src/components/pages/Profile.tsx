import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
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
  ChevronRight,
  Shield,
  Search,
  Download,
  Camera,
  LogIn,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { countries, Country } from '../../data/countries';
import { InvestorProfileForm } from '../profile/InvestorProfileForm';
import { CustomSelect } from '../ui/CustomSelect';

const profileLabels: Record<string, Record<string, string>> = {
  en: {
    accountSettings: "Account settings",
    investorProfileTab: "Profile & strategy",
    manageSubtitle: "Manage your identity, country, and credentials",
    lastName: "Last name",
    firstName: "First name",
    emailAddress: "Email address",
    countryResidence: "Country of residence",
    searchCountryPlaceholder: "Search and select country...",
    noCountryFound: "No country found",
    accountType: "Account type",
    individualInvestor: "Individual investor",
    jointAccount: "Joint account",
    corporateInstitution: "Corporate account",
    professionalInvestor: "Professional investor",
    institutionalClient: "Institutional client",
    companyName: "Company name",
    securityCredentials: "Security credentials",
    passwordLeaveBlank: "Leave fields blank if you do not want to change your password",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    saveChanges: "Save changes",
    signOut: "Sign out",
    savedBacktests: "Saved backtests",
    noSavedBacktests: "No saved backtests yet.",
    deleteWarning: "Deleting your account is permanent and will completely erase all of your profile data.",
    deleteMyAccount: "Delete my account",
    areYouSure: "Are you absolutely sure?",
    deleteIrreversible: "This action is irreversible. All of your saved portfolios, configuration settings, and profile details will be permanently deleted from our servers.",
    typeDeleteToConfirm: "Please type DELETE to confirm:",
    confirmDeleteBtn: "Yes, delete my account",
    cancel: "Cancel",
    confirmPasswordTitle: "Confirm your password",
    reauthSubtitle: "For security reasons, please enter your current account password to authorize these changes.",
    enterCurrentPassword: "Enter current password",
    confirmProceed: "Confirm & proceed",
    passwordsMismatch: "New passwords do not match.",
    updateSuccess: "Your account settings have been updated successfully.",
    imgTooLarge: "Image is too large. Please select an image under 50MB.",
    failedReadImg: "Failed to read image file.",
    invalidPass: "Invalid current password. Please try again.",
    failedDelete: "Failed to delete account. Please try again."
  },
  fr: {
    accountSettings: "Paramètres du compte",
    investorProfileTab: "Profil & stratégie",
    manageSubtitle: "Gérez votre identité, votre pays et vos identifiants",
    lastName: "Nom",
    firstName: "Prénom",
    emailAddress: "Adresse e-mail",
    countryResidence: "Pays de résidence",
    searchCountryPlaceholder: "Rechercher et sélectionner un pays...",
    noCountryFound: "Aucun pays trouvé",
    accountType: "Type de compte",
    individualInvestor: "Investisseur particulier",
    jointAccount: "Compte joint",
    corporateInstitution: "Compte entreprise",
    professionalInvestor: "Investisseur professionnel",
    institutionalClient: "Client institutionnel",
    companyName: "Nom de la société",
    securityCredentials: "Identifiants de sécurité",
    passwordLeaveBlank: "Laissez les champs vides si vous ne souhaitez pas modifier votre mot de passe",
    newPassword: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    saveChanges: "Enregistrer les modifications",
    signOut: "Se déconnecter",
    savedBacktests: "Backtests enregistrés",
    noSavedBacktests: "Aucun backtest enregistré pour le moment.",
    deleteWarning: "La suppression de votre compte est définitive et effacera l'ensemble de vos données.",
    deleteMyAccount: "Supprimer mon compte",
    areYouSure: "Êtes-vous absolument sûr ?",
    deleteIrreversible: "Cette action est irréversible. Tous vos portefeuilles enregistrés et vos données de profil seront définitivement supprimés.",
    typeDeleteToConfirm: "Veuillez taper DELETE pour confirmer :",
    confirmDeleteBtn: "Oui, supprimer mon compte",
    cancel: "Annuler",
    confirmPasswordTitle: "Confirmez votre mot de passe",
    reauthSubtitle: "Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel pour autoriser ces modifications.",
    enterCurrentPassword: "Saisissez votre mot de passe actuel",
    confirmProceed: "Confirmer & continuer",
    passwordsMismatch: "Les nouveaux mots de passe ne correspondent pas.",
    updateSuccess: "Les paramètres de votre compte ont été mis à jour avec succès.",
    imgTooLarge: "L'image est trop volumineuse. Veuillez choisir une image inférieure à 50 Mo.",
    failedReadImg: "Impossible de lire le fichier image.",
    invalidPass: "Mot de passe actuel invalide. Veuillez réessayer.",
    failedDelete: "Échec de la suppression du compte. Veuillez réessayer."
  },
  de: {
    accountSettings: "Kontoeinstellungen",
    manageSubtitle: "Verwalten Sie Ihre Identität, Ihr Land und Ihre Zugangsdaten",
    lastName: "Nachname",
    firstName: "Vorname",
    emailAddress: "E-Mail-Adresse",
    countryResidence: "Wohnsitzland",
    searchCountryPlaceholder: "Land suchen und auswählen...",
    noCountryFound: "Kein Land gefunden",
    accountType: "Kontotyp",
    individualInvestor: "Privatanleger",
    jointAccount: "Gemeinschaftskonto",
    corporateInstitution: "Unternehmenskonto",
    professionalInvestor: "Professioneller Anleger",
    institutionalClient: "Institutioneller Kunde",
    companyName: "Firmenname",
    securityCredentials: "Sicherheitsanmeldedaten",
    passwordLeaveBlank: "Lassen Sie die Felder leer, wenn Sie Ihr Passwort nicht ändern möchten",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    saveChanges: "Änderungen speichern",
    signOut: "Abmelden",
    savedBacktests: "Gespeicherte Backtests",
    noSavedBacktests: "Noch keine gespeicherten Backtests.",
    deleteWarning: "Die Löschung Ihres Kontos ist dauerhaft und löscht alle Ihre Profildaten vollständig.",
    deleteMyAccount: "Mein Konto löschen",
    areYouSure: "Sind Sie absolut sicher?",
    deleteIrreversible: "Diese Aktion ist unwiderruflich. Alle Ihre gespeicherten Portfolios und Profildaten werden dauerhaft gelöscht.",
    typeDeleteToConfirm: "Bitte geben Sie DELETE ein, um zu bestätigen:",
    confirmDeleteBtn: "Ja, mein Konto löschen",
    cancel: "Abbrechen",
    confirmPasswordTitle: "Passwort bestätigen",
    reauthSubtitle: "Geben Sie aus Sicherheitsgründen Ihr aktuelles Kontopasswort ein, um diese Änderungen zu autorisieren.",
    enterCurrentPassword: "Aktuelles Passwort eingeben",
    confirmProceed: "Bestätigen & Fortfahren",
    passwordsMismatch: "Neue Passwörter stimmen nicht überein.",
    updateSuccess: "Ihre Kontoeinstellungen wurden erfolgreich aktualisiert.",
    imgTooLarge: "Bild ist zu groß. Bitte wählen Sie ein Bild unter 50MB.",
    failedReadImg: "Bilddatei konnte nicht gelesen werden.",
    invalidPass: "Ungültiges aktuelles Passwort. Bitte erneut versuchen.",
    failedDelete: "Fehler beim Löschen des Kontos. Bitte erneut versuchen."
  },
  nl: {
    accountSettings: "Accountinstellingen",
    manageSubtitle: "Beheer uw identiteit, land en inloggegevens",
    lastName: "Achternaam",
    firstName: "Voornaam",
    emailAddress: "E-mailadres",
    countryResidence: "Woonland",
    searchCountryPlaceholder: "Zoek en selecteer land...",
    noCountryFound: "Geen land gevonden",
    accountType: "Accounttype",
    individualInvestor: "Particuliere belegger",
    jointAccount: "Gezamenlijke rekening",
    corporateInstitution: "Zakelijke rekening",
    professionalInvestor: "Professionele belegger",
    institutionalClient: "Institutionele klant",
    companyName: "Bedrijfsnaam",
    securityCredentials: "Beveiligingsgegevens",
    passwordLeaveBlank: "Laat velden leeg als u uw wachtwoord niet wilt wijzigen",
    newPassword: "Nieuw wachtwoord",
    confirmNewPassword: "Nieuw wachtwoord bevestigen",
    saveChanges: "Wijzigingen opslaan",
    signOut: "Uitloggen",
    savedBacktests: "Opgeslagen backtests",
    noSavedBacktests: "Nog geen opgeslagen backtests.",
    deleteWarning: "Het verwijderen van uw account is permanent en wist al uw profielgegevens.",
    deleteMyAccount: "Mijn account verwijderen",
    areYouSure: "Weet u het absoluut zeker?",
    deleteIrreversible: "Deze actie is onomkeerbaar. Al uw opgeslagen portfolio's en profielgegevens worden permanent verwijderd.",
    typeDeleteToConfirm: "Typ DELETE om te bevestigen:",
    confirmDeleteBtn: "Ja, mijn account verwijderen",
    cancel: "Annuleren",
    confirmPasswordTitle: "Bevestig uw wachtwoord",
    reauthSubtitle: "Voer om veiligheidsredenen uw huidige wachtwoord in om deze wijzigingen te autoriseren.",
    enterCurrentPassword: "Voer huidig wachtwoord in",
    confirmProceed: "Bevestigen & Doorgaan",
    passwordsMismatch: "Nieuwe wachtwoorden komen niet overeen.",
    updateSuccess: "Uw accountinstellingen zijn succesvol bijgewerkt.",
    imgTooLarge: "Afbeelding is te groot. Selecteer een afbeelding kleiner dan 50MB.",
    failedReadImg: "Kon afbeelding niet lezen.",
    invalidPass: "Ongeldig huidig wachtwoord. Probeer het opnieuw.",
    failedDelete: "Account verwijderen mislukt. Probeer het opnieuw."
  },
  es: {
    accountSettings: "Configuración de la cuenta",
    manageSubtitle: "Gestione su identidad, país y credenciales",
    lastName: "Apellido",
    firstName: "Nombre",
    emailAddress: "Correo electrónico",
    countryResidence: "País de residencia",
    searchCountryPlaceholder: "Buscar y seleccionar país...",
    noCountryFound: "No se encontró ningún país",
    accountType: "Tipo de cuenta",
    individualInvestor: "Inversor individual",
    jointAccount: "Cuenta conjunta",
    corporateInstitution: "Cuenta corporativa",
    professionalInvestor: "Inversor profesional",
    institutionalClient: "Cliente institucional",
    companyName: "Nombre de la empresa",
    securityCredentials: "Credenciales de seguridad",
    passwordLeaveBlank: "Deje los campos en blanco si no desea cambiar su contraseña",
    newPassword: "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    saveChanges: "Guardar cambios",
    signOut: "Cerrar sesión",
    savedBacktests: "Backtests guardados",
    noSavedBacktests: "Aún no hay backtests guardados.",
    deleteWarning: "La eliminación de su cuenta es permanente y borrará todos sus datos de perfil.",
    deleteMyAccount: "Eliminar mi cuenta",
    areYouSure: "¿Está absolutamente seguro?",
    deleteIrreversible: "Esta acción es irreversible. Se eliminarán permanentemente todas sus carteras guardadas y datos de perfil.",
    typeDeleteToConfirm: "Escriba DELETE para confirmar:",
    confirmDeleteBtn: "Sí, eliminar mi cuenta",
    cancel: "Cancelar",
    confirmPasswordTitle: "Confirme su contraseña",
    reauthSubtitle: "Por razones de seguridad, introduzca su contraseña actual para autorizar estos cambios.",
    enterCurrentPassword: "Introduzca la contraseña actual",
    confirmProceed: "Confirmar y Continuar",
    passwordsMismatch: "Las nuevas contraseñas no coinciden.",
    updateSuccess: "La configuración de su cuenta se ha actualizado correctamente.",
    imgTooLarge: "La imagen es demasiado grande. Seleccione una imagen de menos de 50 MB.",
    failedReadImg: "Error al leer el archivo de imagen.",
    invalidPass: "Contraseña actual no válida. Inténtelo de nuevo.",
    failedDelete: "Error al eliminar la cuenta. Inténtelo de nuevo."
  }
};

export function Profile({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useTranslation();
  const t = profileLabels[language] || profileLabels['en'];
  const isEn = language === 'en';
  
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
  const [activeTab, setActiveTab] = useState<'account' | 'investor'>('account');
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
      setReauthError(err.message || t.invalidPass);
      setLoading(false);
    }
  };

  // Profile Update trigger
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: t.passwordsMismatch, type: 'error' });
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
      setMessage({ text: t.imgTooLarge, type: 'error' });
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
        setPhotoURLState(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setMessage({ text: t.failedReadImg, type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  // Perform Firestore write and safe Auth field updates
  const executeProfileUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (email.toLowerCase() !== (user.email || '').toLowerCase()) {
        await updateEmail(user, email);
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      const fullDisplayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
      const authPhoto = photoURLState && photoURLState.length <= 2048 ? photoURLState : '';

      await updateProfile(user, {
        displayName: fullDisplayName,
        photoURL: authPhoto
      });

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

      setMessage({ text: t.updateSuccess, type: 'success' });
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

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setReauthAction('delete');
    setShowReauthModal(true);
  };

  const executeAccountDeletion = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const backtestsRef = collection(db, `users/${user.uid}/backtests`);
      const backtestsSnap = await getDocs(backtestsRef);
      const deletePromises = backtestsSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, `users/${user.uid}`));
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await deleteUser(currentUser);
      }
      await signOut(auth);
      onBack();
    } catch (err: any) {
      console.error("Account deletion error:", err);
      if (err.code === 'auth/requires-recent-login') {
        setReauthAction('delete');
        setShowReauthModal(true);
      } else {
        setMessage({ text: err.message || t.failedDelete, type: 'error' });
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onBack();
  };

  if (fetching) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 text-white bg-[#060913]"
      >
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="flex flex-col w-full min-h-[100dvh] relative overflow-hidden selection:bg-blue-500/30 pt-32 pb-16 px-4 sm:px-8 lg:px-12 font-sans text-white items-center justify-start bg-[#060913]"
      >
        <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-9 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col items-center space-y-6">
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400 drop-shadow-md tracking-tight">
              {isEn ? "Authentication Required" : "Connexion Requise"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              {isEn 
                ? "Your account settings and profile details are accessible exclusively to registered members. Log in to manage your account."
                : "Les paramètres de votre compte sont réservés aux membres connectés. Connectez-vous pour gérer votre compte."}
            </p>
          </div>

          <div className="w-full pt-1 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEn ? "Log In / Sign Up" : "Se connecter / S'inscrire"}</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 px-4 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? "Back to Dashboard" : "Retour au tableau de bord"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col w-full min-h-[100dvh] relative selection:bg-blue-500/30 pt-32 pb-96 px-4 sm:px-8 lg:px-12 font-sans text-white items-center justify-start bg-[#060913] overflow-x-hidden overflow-y-auto"
    >
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 w-12 h-12 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow-lg border border-slate-700/60 transition-all hover:scale-105 z-50 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl relative z-10 flex flex-col items-center my-6 transition-all duration-500"
      >
        {/* Avatar badge */}
        <div className="relative mb-6 z-20 group">
          <div 
            className="w-24 h-24 bg-slate-900/90 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-700/60 overflow-hidden relative"
          >
            {photoURLState ? (
              <img src={photoURLState} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-3xl uppercase">
                {firstName.charAt(0) || email.charAt(0) || "?"}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all hover:scale-110 cursor-pointer"
            title="Upload profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>

          {photoURLState && (
            <button
              type="button"
              onClick={() => setPhotoURLState("")}
              className="absolute -top-1 -right-1 w-8 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all hover:scale-110 cursor-pointer"
              title="Delete profile picture"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {photoURLState && (
            <button
              type="button"
              onClick={downloadProfileImage}
              className="absolute -bottom-1 -left-1 w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all hover:scale-110 cursor-pointer"
              title="Download profile picture"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Call to action for Investor Profile & Strategy Form */}
        <div className="w-full mb-8 p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {isEn ? "Complete your investor profile" : "Complétez votre profil investisseur"}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              {isEn 
                ? "Provide your experience, financial situation, risk tolerance, and suitability answers to establish your investor qualification."
                : "Renseignez votre expérience, votre situation financière, votre tolérance au risque et vos réponses d'adéquation pour établir votre profil investisseur."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/investor-profile')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {isEn ? "Go to investor profile →" : "Accéder au profil investisseur →"}
          </button>
        </div>

        {/* Account Settings Container - NO HEAVY WHITE FRAME */}
        <div className="w-full overflow-hidden relative">
          <div className="p-0 sm:p-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{t.accountSettings}</h2>
              <p className="text-slate-300 text-sm mt-2 font-medium">{t.manageSubtitle}</p>
            </div>

            {message && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-semibold text-center border flex items-center justify-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {message.type !== 'success' && <AlertTriangle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.lastName}</label>
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
                      className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.firstName}</label>
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
                      className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.emailAddress}</label>
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
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                  />
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.countryResidence}</label>
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
                    placeholder={t.searchCountryPlaceholder}
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-11 pr-10 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                <AnimatePresence>
                  {showCountryDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
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
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-200 transition-colors border-b border-slate-800/60 last:border-0"
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium">{c.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">
                          {t.noCountryFound}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.accountType}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>
                  <select 
                    value={accountType} 
                    onChange={e => setAccountType(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white shadow-sm appearance-none"
                  >
                    <option value="Individual" className="bg-slate-900 text-white">{t.individualInvestor}</option>
                    <option value="Joint" className="bg-slate-900 text-white">{t.jointAccount}</option>
                    <option value="Professional" className="bg-slate-900 text-white">{t.professionalInvestor}</option>
                    <option value="Corporate" className="bg-slate-900 text-white">{t.corporateInstitution}</option>
                    <option value="Institutional" className="bg-slate-900 text-white">{t.institutionalClient}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {(accountType === 'Corporate' || accountType === 'Institutional' || accountType === 'Professional') && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.companyName}</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                    placeholder="Acme Corp"
                    className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 px-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/80">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{t.securityCredentials}</h3>
                <p className="text-xs text-slate-400 mb-4">{t.passwordLeaveBlank}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.newPassword}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">{t.confirmNewPassword}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t.saveChanges}
                </button>
                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {t.signOut}
                </button>
              </div>



              <div className="pt-6 border-t border-slate-800/80">
                <p className="text-xs text-slate-400 mb-3">{t.deleteWarning}</p>
                
                <button
                  type="button"
                  onClick={handleDeleteAccountClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 bg-rose-950/20 hover:bg-rose-900/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  {t.deleteMyAccount}
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 text-white"
            >
              <div className="w-12 h-12 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{t.areYouSure}</h3>
              <p className="text-slate-300 text-center text-xs leading-relaxed mb-6">
                {t.deleteIrreversible}
              </p>

              <div className="mb-6 bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                <p className="text-xs text-slate-300 font-semibold mb-2.5 text-center uppercase tracking-wider">
                  {t.typeDeleteToConfirm}
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-center outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all font-bold tracking-wider text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.confirmDeleteBtn}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReauthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 text-white"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{t.confirmPasswordTitle}</h3>
              <p className="text-slate-300 text-center text-sm mb-6">
                {t.reauthSubtitle}
              </p>
              
              <form onSubmit={handleReauthenticate} className="space-y-6">
                <div>
                  <input
                    type="password"
                    required
                    value={reauthPassword}
                    onChange={e => setReauthPassword(e.target.value)}
                    placeholder={t.enterCurrentPassword}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-white placeholder-slate-400 shadow-sm text-center"
                  />
                  {reauthError && (
                    <p className="text-xs font-semibold text-rose-400 text-center mt-2">
                      {reauthError}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex justify-center items-center"
                  >
                    {t.confirmProceed}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReauthModal(false);
                      setReauthPassword('');
                      setReauthError(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    {t.cancel}
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
