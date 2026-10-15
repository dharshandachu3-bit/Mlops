import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, testFirestoreConnection } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { saveUserProfile, getUserProfile } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
  firestoreOnline: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  role: 'Researcher',
  setRole: () => {},
  isLoading: true,
  firestoreOnline: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('Researcher');
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreOnline, setFirestoreOnline] = useState(true);

  useEffect(() => {
    // Validate connection to Firestore on boot as mandated by skill
    testFirestoreConnection().then(isOnline => {
      setFirestoreOnline(isOnline);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Try fetching existing profile or create a default one
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            setRole(profile.role);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'researcher@hospital.org',
              displayName: user.displayName || 'Clinical Researcher',
              photoURL: user.photoURL || undefined,
              role: 'Researcher',
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
        } catch {
          // Fallback profile
          setUserProfile({
            uid: user.uid,
            email: user.email || 'researcher@hospital.org',
            displayName: user.displayName || 'Clinical Researcher',
            role: 'Researcher',
          });
        }
      } else {
        // Default local persona (Dharshan / Student / Researcher as shown in reference UI)
        setUserProfile({
          uid: 'demo-dharshan-user',
          email: 'dharshandachu3@gmail.com',
          displayName: 'Dharshan',
          role: 'Researcher',
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUserProfile({
        uid: 'demo-guest',
        email: 'guest@hospital.org',
        displayName: 'Guest Researcher',
        role: 'Viewer',
      });
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      if (currentUser) {
        saveUserProfile(updated).catch(() => {});
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        setRole: handleRoleChange,
        isLoading,
        firestoreOnline,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
