import React, { createContext, useContext, useState } from 'react';
import { College } from '../types';

interface ComparisonContextType {
  comparedColleges: College[];
  addCollege: (college: College) => boolean;
  removeCollege: (collegeId: string) => void;
  clearComparison: () => void;
  isComparing: (collegeId: string) => boolean;
  canAddMore: boolean;
  limitMessage: string | null;
  clearLimitMessage: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedColleges, setComparedColleges] = useState<College[]>([]);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const addCollege = (college: College): boolean => {
    if (comparedColleges.some((c) => c.id === college.id)) {
      return false;
    }
    if (comparedColleges.length >= 4) {
      setLimitMessage('You can compare a maximum of 4 colleges at a time. Remove one to add another.');
      setTimeout(() => setLimitMessage(null), 4000);
      return false;
    }
    setLimitMessage(null);
    setComparedColleges((prev) => [...prev, college]);
    return true;
  };

  const removeCollege = (collegeId: string) => {
    setComparedColleges((prev) => prev.filter((c) => c.id !== collegeId));
    setLimitMessage(null);
  };

  const clearComparison = () => {
    setComparedColleges([]);
    setLimitMessage(null);
  };

  const isComparing = (collegeId: string) => {
    return comparedColleges.some((c) => c.id === collegeId);
  };

  const canAddMore = comparedColleges.length < 4;

  const clearLimitMessage = () => setLimitMessage(null);

  return (
    <ComparisonContext.Provider
      value={{
        comparedColleges,
        addCollege,
        removeCollege,
        clearComparison,
        isComparing,
        canAddMore,
        limitMessage,
        clearLimitMessage,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
