import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signInAsGuest,
  signOut, 
  subscribeToAuth, 
  getUserProfile, 
  updateUserProfile 
} from '../firebase/services';
import { ExamStream } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  examStream: ExamStream;
  setExamStream: (stream: ExamStream) => Promise<void>;
  showExamModal: boolean;
  setShowExamModal: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalInitialMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Stored exam stream preference (default to eamcet or saved)
  const [examStream, setExamStreamState] = useState<ExamStream>(() => {
    const saved = localStorage.getItem('campusfind_exam_stream');
    if (saved === 'jee-main' || saved === 'jee-advanced' || saved === 'eamcet') {
      return saved;
    }
    return 'eamcet';
  });

  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalInitialMode(mode);
    setShowAuthModal(true);
  };

  const handlePostLoginProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile?.examStream) {
        setExamStreamState(profile.examStream);
        localStorage.setItem('campusfind_exam_stream', profile.examStream);
      } else {
        setShowExamModal(true);
      }
    } catch (e) {
      console.warn('Could not fetch user exam stream:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await handlePostLoginProfile(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        await handlePostLoginProfile(loggedUser.uid);
      }
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const loggedUser = await signInWithEmail(email, pass);
      if (loggedUser) {
        await handlePostLoginProfile(loggedUser.uid);
      }
    } catch (error) {
      console.error('Failed to sign in with email:', error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      const loggedUser = await signUpWithEmail(email, pass, name);
      if (loggedUser) {
        await handlePostLoginProfile(loggedUser.uid);
      }
    } catch (error) {
      console.error('Failed to register with email:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Failed to send password reset:', error);
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      const loggedUser = await signInAsGuest();
      if (loggedUser) {
        await handlePostLoginProfile(loggedUser.uid);
      }
    } catch (error) {
      console.error('Failed to log in as guest:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  const setExamStream = async (stream: ExamStream) => {
    setExamStreamState(stream);
    localStorage.setItem('campusfind_exam_stream', stream);
    
    if (user) {
      try {
        await updateUserProfile(user.uid, { examStream: stream });
      } catch (err) {
        console.error('Failed to save exam stream to Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        loginWithGoogle, 
        loginWithEmail,
        signupWithEmail,
        sendPasswordReset,
        loginAsGuest,
        logout,
        examStream,
        setExamStream,
        showExamModal,
        setShowExamModal,
        showAuthModal,
        setShowAuthModal,
        authModalInitialMode,
        openAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
