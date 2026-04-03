import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Company } from '../types';

interface AuthContextType {
  currentUser: User | null;
  company: Company | null;
  isCompany: boolean;
  loading: boolean;
  registerCompany: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  userLogin: () => void;
  isUserLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  async function registerCompany(name: string, email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const companyData: Omit<Company, 'id'> = {
      name,
      email,
      createdAt: new Date()
    };
    await setDoc(doc(db, 'companies', userCredential.user.uid), companyData);
  }

  async function login(email: string, password: string, rememberMe = false) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is a company
    const companyDoc = await getDoc(doc(db, 'companies', userCredential.user.uid));
    
    if (companyDoc.exists()) {
      setIsCompany(true);
      setCompany({ id: userCredential.user.uid, ...companyDoc.data() } as Company);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      return true;
    }
    return false;
  }

  async function logout() {
    await signOut(auth);
    setCompany(null);
    setIsCompany(false);
    localStorage.removeItem('rememberMe');
  }

  function userLogin() {
    localStorage.setItem('userLoggedIn', 'true');
  }

  function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const companyDoc = await getDoc(doc(db, 'companies', user.uid));
          if (companyDoc.exists()) {
            setIsCompany(true);
            setCompany({ id: user.uid, ...companyDoc.data() } as Company);
          }
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    company,
    isCompany,
    loading,
    registerCompany,
    login,
    logout,
    userLogin,
    isUserLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
