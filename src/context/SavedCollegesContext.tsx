import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { College } from '../types';
import { 
  saveCollegeToFirestore, 
  removeCollegeFromFirestore, 
  subscribeToSavedColleges, 
  SavedCollegeData 
} from '../firebase/services';

interface SavedCollegesContextType {
  savedIds: string[];
  savedColleges: SavedCollegeData[];
  isSaved: (collegeId: string) => boolean;
  toggleSave: (college: College) => Promise<void>;
  loading: boolean;
}

const LOCAL_STORAGE_KEY = 'campusfind_saved_colleges';

const SavedCollegesContext = createContext<SavedCollegesContextType | undefined>(undefined);

export const SavedCollegesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedColleges, setSavedColleges] = useState<SavedCollegeData[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToSavedColleges(
      user.uid,
      (remoteColleges) => {
        setSavedColleges(remoteColleges);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteColleges));
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore subscription fallback:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const savedIds = savedColleges.map((c) => c.collegeId);

  const isSaved = (collegeId: string) => savedIds.includes(collegeId);

  const toggleSave = async (college: College) => {
    const alreadySaved = isSaved(college.id);

    if (alreadySaved) {
      // Remove
      const updated = savedColleges.filter((c) => c.collegeId !== college.id);
      setSavedColleges(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      if (user) {
        try {
          await removeCollegeFromFirestore(user.uid, college.id);
        } catch (err) {
          console.error('Error removing from Firestore:', err);
        }
      }
    } else {
      // Add
      const newItem: SavedCollegeData = {
        collegeId: college.id,
        collegeCode: college.code,
        collegeName: college.name,
        state: college.state,
        city: college.city,
        annualFee: college.annualFee,
        rating: college.rating,
        savedAt: new Date().toISOString(),
        userId: user ? user.uid : 'guest',
      };

      const updated = [newItem, ...savedColleges];
      setSavedColleges(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      if (user) {
        try {
          await saveCollegeToFirestore(user.uid, newItem);
        } catch (err) {
          console.error('Error saving to Firestore:', err);
        }
      }
    }
  };

  return (
    <SavedCollegesContext.Provider
      value={{
        savedIds,
        savedColleges,
        isSaved,
        toggleSave,
        loading,
      }}
    >
      {children}
    </SavedCollegesContext.Provider>
  );
};

export const useSavedColleges = () => {
  const context = useContext(SavedCollegesContext);
  if (!context) {
    throw new Error('useSavedColleges must be used within a SavedCollegesProvider');
  }
  return context;
};
