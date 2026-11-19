import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  ADMIN_BOOTSTRAP_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { SavedAddress, UserProfile, WhatsAppSession } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  whatsappSession: WhatsAppSession | null;
  setWhatsappSession: (session: WhatsAppSession | null) => void;
  signInWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  changeUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'whatsappNumber' | 'addresses' | 'recentlyViewed' | 'wishlistIds'>>) => Promise<void>;
  saveAddress: (address: SavedAddress) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const WA_STORAGE_KEY = 'makh_whatsapp_checkout_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [whatsappSession, setWhatsappSessionState] = useState<WhatsAppSession | null>(() => {
    try {
      const raw = localStorage.getItem(WA_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as WhatsAppSession;
      if (parsed?.verified && Date.now() - parsed.verifiedAt < 24 * 60 * 60 * 1000) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const setWhatsappSession = (session: WhatsAppSession | null) => {
    setWhatsappSessionState(session);
    try {
      if (session) {
        localStorage.setItem(WA_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(WA_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin privileges (verified bootstrap email or admins/{uid} document)
      let adminFlag =
        firebaseUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() &&
        firebaseUser.emailVerified === true;

      if (!adminFlag) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminSnap.exists()) {
            adminFlag = true;
          }
        } catch {
          // Non-admins receive permission-denied on /admins lookup; safely ignored
        }
      }
      setIsAdmin(adminFlag);

      // Load or create private user profile document
      const userPath = `users/${firebaseUser.uid}`;
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer').slice(0, 120),
            email: (firebaseUser.email || '').slice(0, 180),
            phone: '',
            whatsappNumber: '',
            addresses: [],
            recentlyViewed: [],
            wishlistIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          setProfile({ ...newProfile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userPath, false);
        setProfile({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
          email: firebaseUser.email || '',
          addresses: [],
          recentlyViewed: [],
          wishlistIds: [],
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  };

  const registerWithEmail = async (name: string, email: string, password: string, phone?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(result.user, { displayName: name.trim().slice(0, 120) });
    try {
      await sendEmailVerification(result.user);
    } catch {
      // non-fatal if email verification dispatch fails
    }
    const userRef = doc(db, 'users', result.user.uid);
    const payload = {
      uid: result.user.uid,
      displayName: name.trim().slice(0, 120),
      email: email.trim().slice(0, 180),
      phone: (phone || '').trim().slice(0, 24),
      whatsappNumber: (phone || '').trim().slice(0, 24),
      addresses: [],
      recentlyViewed: [],
      wishlistIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, payload);
      setProfile({ ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${result.user.uid}`, false);
    }
    return result.user;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const changeUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('Please sign in first.');
    await updatePassword(auth.currentUser, newPassword);
  };

  const logout = async () => {
    setWhatsappSession(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const updateUserProfile = async (
    updates: Partial<
      Pick<
        UserProfile,
        'displayName' | 'phone' | 'whatsappNumber' | 'addresses' | 'recentlyViewed' | 'wishlistIds'
      >
    >
  ) => {
    if (!user) return;
    const sanitized: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (updates.displayName !== undefined) sanitized.displayName = updates.displayName.trim().slice(0, 120);
    if (updates.phone !== undefined) sanitized.phone = updates.phone.trim().slice(0, 24);
    if (updates.whatsappNumber !== undefined) sanitized.whatsappNumber = updates.whatsappNumber.trim().slice(0, 24);
    if (updates.addresses !== undefined) sanitized.addresses = updates.addresses.slice(0, 10);
    if (updates.recentlyViewed !== undefined) sanitized.recentlyViewed = updates.recentlyViewed.slice(0, 20);
    if (updates.wishlistIds !== undefined) sanitized.wishlistIds = updates.wishlistIds.slice(0, 50);

    try {
      await updateDoc(doc(db, 'users', user.uid), sanitized);
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`, true);
    }
  };

  const saveAddress = async (address: SavedAddress) => {
    if (!user) return;
    const existing = profile?.addresses || [];
    const filtered = existing.filter((a) => a.id !== address.id);
    const updated = address.isDefault
      ? [address, ...filtered.map((a) => ({ ...a, isDefault: false }))]
      : [...filtered, address];
    await updateUserProfile({ addresses: updated.slice(0, 10) });
  };

  const removeAddress = async (addressId: string) => {
    if (!user) return;
    const updated = (profile?.addresses || []).filter((a) => a.id !== addressId);
    await updateUserProfile({ addresses: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        whatsappSession,
        setWhatsappSession,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        changeUserPassword,
        logout,
        updateUserProfile,
        saveAddress,
        removeAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
