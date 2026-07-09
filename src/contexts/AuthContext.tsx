import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  getIdTokenResult
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async () => {
    // This calls the Google login defined in firebase.ts
    const { loginWithGoogle } = await import('../firebase');
    await loginWithGoogle();
  };

  const logout = async () => {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('../firebase');
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // You could check for custom claims here if using them, 
        // but typically for this env we stick to simple auth check 
        // or a dedicated doc in Firestore for admins.
        setIsAdmin(false); 
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user: user!, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
