import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { type UserProfile } from '../types';
import { COLLECTIONS } from '../lib/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          console.log('[AuthContext] Firebase user authenticated:', firebaseUser.uid);

          // Fetch user profile from Firestore
          const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // User profile exists - use it
            console.log('[AuthContext] User profile found in Firestore');
            const profileData = userDocSnap.data();
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: profileData.role || 'customer', // Default to customer if role missing
              displayName: profileData.displayName || firebaseUser.displayName || firebaseUser.email || 'User',
              createdAt: profileData.createdAt || Timestamp.now(),
            };

            // Only add photoUrl if it exists
            if (profileData.photoUrl || firebaseUser.photoURL) {
              profile.photoUrl = profileData.photoUrl || firebaseUser.photoURL;
            }

            // Only add authMethod if it exists
            if (profileData.authMethod) {
              profile.authMethod = profileData.authMethod;
            }

            console.log('[AuthContext] User profile loaded:', { email: profile.email, role: profile.role });
            setUserProfile(profile);
          } else {
            // User profile doesn't exist - create customer profile for tracking
            console.log('[AuthContext] No user profile found, creating new customer profile');

            // Detect authentication method
            let authMethod: 'email' | 'oauth' = 'email';
            if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
              const providerId = firebaseUser.providerData[0].providerId;
              authMethod = providerId === 'google.com' ? 'oauth' : 'email';
            }

            const newProfile: any = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'customer', // New users are customers by default
              displayName: firebaseUser.displayName || firebaseUser.email || 'User',
              authMethod,
              createdAt: Timestamp.now(),
            };

            // Only add photoUrl if it exists
            if (firebaseUser.photoURL) {
              newProfile.photoUrl = firebaseUser.photoURL;
            }

            await setDoc(userDocRef, newProfile);
            console.log('[AuthContext] Created new user profile with customer role and auth method:', authMethod);
            setUserProfile(newProfile as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);

          // Detect authentication method
          let authMethod: 'email' | 'oauth' = 'email';
          if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
            const providerId = firebaseUser.providerData[0].providerId;
            authMethod = providerId === 'google.com' ? 'oauth' : 'email';
          }

          // Fallback to basic profile if Firestore fetch fails
          const fallbackProfile: any = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'customer',
            displayName: firebaseUser.displayName || firebaseUser.email || 'User',
            authMethod,
            createdAt: Timestamp.now(),
          };

          // Only add photoUrl if it exists
          if (firebaseUser.photoURL) {
            fallbackProfile.photoUrl = firebaseUser.photoURL;
          }

          setUserProfile(fallbackProfile as UserProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
