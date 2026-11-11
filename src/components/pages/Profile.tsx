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
    if (!user) {
      setFetching(false);
      return;
    }
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

  // Saved analyses (all tools) shown in the client area
  const [savedItems, setSavedItems] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, `users/${user.uid}/backtests`));
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSavedItems(list);
      } catch (e) {
        console.error("Failed to load saved analyses:", e);
      }
    })();
  }, [user]);

  const TOOL_ROUTES: Record<string, { path: string; label: string }> = {
    backtest: { path: '/portfolio-backtest', label: 'Portfolio Backtesting' },
    'asset-allocation': { path: '/asset-allocation', label: 'Asset Allocation' },
    allocations: { path: '/asset-allocation', label: 'Asset Allocation' },
    tactical: { path: '/tactical-allocation', label: 'Tactical Allocation' },
    'tactical-allocation': { path: '/tactical-allocation', label: 'Tactical Allocation' },
    montecarlo: { path: '/montecarlo', label: 'Monte Carlo' },
  };
  const toolOf = (pageId?: string) => TOOL_ROUTES[pageId || 'backtest'] || { path: '/portfolio-backtest', label: pageId || 'Backtest' };

  const [section, setSection] = useState<'account' | 'security' | 'saved'>('account');
  const fieldCls = "w-full h-11 bg-white border border-border rounded-lg px-3.5 text-[15px] text-text outline-none focus:border-pv-blue focus:ring-4 focus:ring-pv-blue/10 transition-all placeholder:text-text-4";
  const labelCls = "block text-sm font-medium text-text-2 mb-1.5";
  const L2 = isEn || language !== 'fr'
    ? { title: "Client area", subtitle: "Your account, security settings and saved analyses.", account: "Account", security: "Security", saved: "Saved analyses", investor: "Investor profile", investorDesc: "Experience, financial situation and risk tolerance.", open: "Open", none: "No saved analysis yet. Run a tool and use “Save this analysis” at the bottom of the page.", tool: "Tool", name: "Name", date: "Saved on", metrics: "Key results", photo: "Profile photo", change: "Change", remove: "Remove", danger: "Delete account", memberSince: "Signed in as", signInTitle: "Sign in to your client area", signInDesc: "Your account settings and saved analyses are available to signed-in members.", signIn: "Sign in or create an account", back: "Back" }
    : { title: "Espace client", subtitle: "Votre compte, votre sécurité et vos analyses enregistrées.", account: "Compte", security: "Sécurité", saved: "Analyses enregistrées", investor: "Profil investisseur", investorDesc: "Expérience, situation financière et tolérance au risque.", open: "Ouvrir", none: "Aucune analyse enregistrée. Lancez un outil puis utilisez « Enregistrer cette analyse » en bas de page.", tool: "Outil", name: "Nom", date: "Enregistrée le", metrics: "Résultats clés", photo: "Photo de profil", change: "Modifier", remove: "Retirer", danger: "Supprimer le compte", memberSince: "Connecté en tant que", signInTitle: "Connectez-vous à votre espace client", signInDesc: "Les paramètres du compte et les analyses enregistrées sont réservés aux membres connectés.", signIn: "Se connecter ou créer un compte", back: "Retour" };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-9 h-9 border-[3px] border-pv-blue/20 border-t-pv-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border border-border rounded-2xl p-8 text-center">
          <h1 className="font-serif text-3xl font-semibold text-text">{L2.signInTitle}</h1>
          <p className="text-text-3 mt-3 leading-relaxed">{L2.signInDesc}</p>
          <button onClick={() => navigate('/auth')} className="mt-6 w-full h-11 bg-pv-blue hover:bg-pv-blue-d text-white font-semibold rounded-lg inline-flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> {L2.signIn}
          </button>
          <button onClick={onBack} className="mt-3 w-full h-11 text-text-3 hover:text-text font-medium rounded-lg inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {L2.back}
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: 'account' | 'security' | 'saved'; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: L2.account, icon: <User className="w-4 h-4" /> },
    { id: 'security', label: L2.security, icon: <Shield className="w-4 h-4" /> },
    { id: 'saved', label: L2.saved, icon: <Save className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-white min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="font-serif text-3xl md:text-[2.6rem] leading-tight font-semibold tracking-tight text-text">{L2.title}</h1>
            <p className="text-base md:text-lg text-text-3 mt-2">{L2.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-3">
            <span>{L2.memberSince} <b className="text-text font-medium">{user.email}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-8 mt-8">
          {/* Sidebar */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`flex items-center gap-2.5 px-3 h-10 rounded-lg text-[15px] whitespace-nowrap transition-colors ${section === n.id ? 'bg-surface-2 text-text font-semibold' : 'text-text-3 hover:text-text hover:bg-surface-2/60'}`}
              >
                {n.icon} {n.label}
                {n.id === 'saved' && savedItems.length > 0 && <span className="ml-auto text-xs font-mono text-text-4">{savedItems.length}</span>}
              </button>
            ))}
            <button onClick={() => navigate('/investor-profile')} className="flex items-center gap-2.5 px-3 h-10 rounded-lg text-[15px] whitespace-nowrap text-text-3 hover:text-text hover:bg-surface-2/60">
              <Briefcase className="w-4 h-4" /> {L2.investor} <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
            <div className="hidden md:block h-px bg-border my-3" />
            <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 h-10 rounded-lg text-[15px] whitespace-nowrap text-text-3 hover:text-rose-600 hover:bg-rose-50">
              <LogOut className="w-4 h-4" /> {t.signOut}
            </button>
          </nav>

          {/* Content */}
          <div className="min-w-0">
            {message && (
              <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            {section !== 'saved' && (
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                {section === 'account' && (
                  <>
                    <section className="border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-text">{L2.photo}</h2>
                      <div className="flex items-center gap-5 mt-5">
                        <div className="w-20 h-20 rounded-full bg-surface-2 border border-border overflow-hidden flex items-center justify-center text-2xl font-semibold text-text-3 uppercase shrink-0">
                          {photoURLState ? <img src={photoURLState} alt="" className="w-full h-full object-cover" /> : (firstName.charAt(0) || email.charAt(0) || "?")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="h-9 px-3.5 rounded-lg border border-border text-sm font-medium text-text hover:border-pv-blue inline-flex items-center gap-1.5"><Camera className="w-4 h-4" /> {L2.change}</button>
                          {photoURLState && <button type="button" onClick={downloadProfileImage} className="h-9 px-3.5 rounded-lg border border-border text-sm font-medium text-text-2 hover:border-pv-blue inline-flex items-center gap-1.5"><Download className="w-4 h-4" /></button>}
                          {photoURLState && <button type="button" onClick={() => setPhotoURLState("")} className="h-9 px-3.5 rounded-lg text-sm font-medium text-text-3 hover:text-rose-600">{L2.remove}</button>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      </div>
                    </section>

                    <section className="border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-text">{t.accountSettings}</h2>
                      <p className="text-sm text-text-3 mt-1">{t.manageSubtitle}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                        <div>
                          <label className={labelCls}>{t.firstName}</label>
                          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldCls} />
                        </div>
                        <div>
                          <label className={labelCls}>{t.lastName}</label>
                          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldCls} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>{t.emailAddress}</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-text-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls + " pl-10"} />
                          </div>
                        </div>
                        <div ref={dropdownRef} className="relative">
                          <label className={labelCls}>{t.countryResidence}</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">{selectedFlag}</span>
                            <input
                              value={showCountryDropdown ? searchQuery : residenceCountry}
                              onFocus={() => { setSearchQuery(''); setShowCountryDropdown(true); }}
                              onChange={(e) => { setSearchQuery(e.target.value); setShowCountryDropdown(true); }}
                              placeholder={t.searchCountryPlaceholder}
                              className={fieldCls + " pl-10"}
                            />
                          </div>
                          {showCountryDropdown && (
                            <div className="absolute z-30 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              {filteredCountries.length > 0 ? filteredCountries.map((c: Country) => (
                                <button type="button" key={c.code || c.name} onClick={() => { setResidenceCountry(c.name); setShowCountryDropdown(false); }} className="w-full text-left px-3.5 py-2 text-sm text-text hover:bg-surface-2 flex items-center gap-2">
                                  <span>{c.flag}</span> {c.name}
                                </button>
                              )) : <div className="px-3.5 py-3 text-sm text-text-3">{t.noCountryFound}</div>}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>{t.accountType}</label>
                          <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className={fieldCls}>
                            <option value="Individual">{t.individualInvestor}</option>
                            <option value="Joint">{t.jointAccount}</option>
                            <option value="Corporate">{t.corporateInstitution}</option>
                            <option value="Professional">{t.professionalInvestor}</option>
                            <option value="Institutional">{t.institutionalClient}</option>
                          </select>
                        </div>
                        {(accountType === 'Corporate' || accountType === 'Institutional' || accountType === 'Professional') && (
                          <div className="sm:col-span-2">
                            <label className={labelCls}>{t.companyName}</label>
                            <input value={company} onChange={(e) => setCompany(e.target.value)} className={fieldCls} />
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-text">{L2.investor}</h2>
                        <p className="text-sm text-text-3 mt-1">{L2.investorDesc}</p>
                      </div>
                      <button type="button" onClick={() => navigate('/investor-profile')} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-text hover:border-pv-blue inline-flex items-center gap-1.5 shrink-0">{L2.open} <ChevronRight className="w-4 h-4" /></button>
                    </section>
                  </>
                )}

                {section === 'security' && (
                  <>
                    <section className="border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-text">{t.securityCredentials}</h2>
                      <p className="text-sm text-text-3 mt-1">{t.passwordLeaveBlank}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                        <div>
                          <label className={labelCls}>{t.newPassword}</label>
                          <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={fieldCls} />
                        </div>
                        <div>
                          <label className={labelCls}>{t.confirmNewPassword}</label>
                          <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldCls} />
                        </div>
                      </div>
                    </section>

                    <section className="border border-rose-200 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-rose-700">{L2.danger}</h2>
                      <p className="text-sm text-text-3 mt-1">{t.deleteWarning}</p>
                      <button type="button" onClick={handleDeleteAccountClick} className="mt-4 h-10 px-4 rounded-lg border border-rose-300 text-sm font-semibold text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> {t.deleteMyAccount}</button>
                    </section>
                  </>
                )}

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="h-11 px-6 bg-pv-blue hover:bg-pv-blue-d text-white font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50">
                    {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {t.saveChanges}
                  </button>
                </div>
              </form>
            )}

            {section === 'saved' && (
              <section className="border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-xl font-semibold text-text">{L2.saved}</h2>
                </div>
                {savedItems.length === 0 ? (
                  <p className="px-6 py-10 text-center text-text-3">{L2.none}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-3">
                        <tr>
                          <th className="px-6 py-3 font-semibold">{L2.name}</th>
                          <th className="px-6 py-3 font-semibold">{L2.tool}</th>
                          <th className="px-6 py-3 font-semibold">{L2.metrics}</th>
                          <th className="px-6 py-3 font-semibold">{L2.date}</th>
                          <th className="px-6 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {savedItems.map((it) => {
                          const tool = toolOf(it.pageId);
                          const r = Array.isArray(it.resultsSummary) ? it.resultsSummary[0] : null;
                          return (
                            <tr key={it.id} className="hover:bg-surface-2/50">
                              <td className="px-6 py-3.5 font-semibold text-text">{it.name || '-'}</td>
                              <td className="px-6 py-3.5 text-text-2">{tool.label}</td>
                              <td className="px-6 py-3.5 font-mono text-text-2">
                                {r ? `CAGR ${Number(r.cagr ?? 0).toFixed(2)}% · Max DD ${(-Math.abs(Number(r.maxDrawdown ?? 0))).toFixed(2)}% · Sharpe ${Number(r.sharpe ?? 0).toFixed(2)}` : '-'}
                              </td>
                              <td className="px-6 py-3.5 text-text-3">{it.updatedAt ? new Date(it.updatedAt).toLocaleDateString(isEn ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                              <td className="px-6 py-3.5 text-right"><button onClick={() => navigate(tool.path)} className="text-pv-blue font-medium hover:underline">{L2.open}</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-text">{t.areYouSure}</h3>
            <p className="text-sm text-text-3 mt-2 leading-relaxed">{t.deleteIrreversible}</p>
            <label className="block text-sm font-medium text-text-2 mt-5 mb-1.5">{t.typeDeleteToConfirm}</label>
            <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className={fieldCls} />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={handleCancelDelete} className="h-10 px-4 rounded-lg text-sm font-medium text-text-2 hover:bg-surface-2">{t.cancel}</button>
              <button onClick={handleConfirmDelete} disabled={deleteConfirmText !== 'DELETE'} className="h-10 px-4 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40">{t.confirmDeleteBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* Re-authentication */}
      {showReauthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={handleReauthenticate} className="w-full max-w-md bg-white rounded-2xl border border-border shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-text flex items-center gap-2"><Lock className="w-5 h-5 text-pv-blue" /> {t.confirmPasswordTitle}</h3>
            <p className="text-sm text-text-3 mt-2 leading-relaxed">{t.reauthSubtitle}</p>
            {reauthError && <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800">{reauthError}</div>}
            <input type="password" autoFocus value={reauthPassword} onChange={(e) => setReauthPassword(e.target.value)} placeholder={t.enterCurrentPassword} className={fieldCls + " mt-5"} />
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => { setShowReauthModal(false); setReauthPassword(''); setReauthError(null); setLoading(false); }} className="h-10 px-4 rounded-lg text-sm font-medium text-text-2 hover:bg-surface-2">{t.cancel}</button>
              <button type="submit" disabled={loading || !reauthPassword} className="h-10 px-4 rounded-lg text-sm font-semibold text-white bg-pv-blue hover:bg-pv-blue-d disabled:opacity-40">{t.confirmProceed}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
