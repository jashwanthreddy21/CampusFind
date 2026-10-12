import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';

import { StateType, CollegeReview, CutoffAlert, InAppNotification, College } from '../types';

export interface SavedCollegeData {
  collegeId: string;
  collegeCode: string;
  collegeName: string;
  state: StateType;
  city: string;
  annualFee: number;
  rating?: number;
  savedAt?: string;
  userId: string;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  preferredState?: 'all' | 'TS' | 'AP';
  category?: 'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS';
  eamcetRank?: number;
  targetBranch?: string;
  examStream?: 'jee-main' | 'jee-advanced' | 'eamcet';
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedPredictionData {
  id: string;
  userId: string;
  exam: 'TS EAMCET' | 'AP EAMCET' | 'JEE Main' | 'JEE Advanced';
  rank: number;
  category: string;
  branch?: string;
  state?: string;
  createdAt: string;
}

// Google Sign In
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Sync profile document to Firestore
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Candidate',
          preferredState: 'all',
          category: 'OC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Initial profile sync warning:', e);
    }
    return user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

// Sign up with Email and Password
export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    if (displayName) {
      try {
        await firebaseUpdateProfile(user, { displayName });
      } catch (e) {
        console.warn('Could not update displayName:', e);
      }
    }

    // Provision user profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || user.displayName || 'Candidate',
        preferredState: 'all',
        category: 'OC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Profile sync warning on signup:', e);
    }

    return user;
  } catch (err) {
    console.error('Email Sign Up Error:', err);
    throw err;
  }
}

// Sign in with Email and Password
export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    try {
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || email,
          displayName: user.displayName || 'Candidate',
          preferredState: 'all',
          category: 'OC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Profile sync check warning on login:', e);
    }

    return user;
  } catch (err) {
    console.error('Email Sign In Error:', err);
    throw err;
  }
}

// Send Password Reset Email
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    console.error('Password reset error:', err);
    throw err;
  }
}

// Anonymous / Quick Guest Sign In
export async function signInAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    try {
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: 'guest@campusfind.org',
          displayName: 'Guest Candidate',
          preferredState: 'all',
          category: 'OC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Guest profile sync warning:', e);
    }
    return user;
  } catch (err) {
    console.error('Guest Sign In Error:', err);
    throw err;
  }
}

// Sign Out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Sign Out Error:', err);
    throw err;
  }
}

// Listen to auth state
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Save college to Firestore
export async function saveCollegeToFirestore(userId: string, data: Omit<SavedCollegeData, 'userId' | 'savedAt'>) {
  const path = `users/${userId}/saved_colleges/${data.collegeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'saved_colleges', data.collegeId);
    await setDoc(docRef, {
      ...data,
      userId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Remove college from Firestore
export async function removeCollegeFromFirestore(userId: string, collegeId: string) {
  const path = `users/${userId}/saved_colleges/${collegeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'saved_colleges', collegeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time listener for user's saved colleges
export function subscribeToSavedColleges(
  userId: string, 
  onUpdate: (colleges: SavedCollegeData[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/saved_colleges`;
  const collRef = collection(db, 'users', userId, 'saved_colleges');
  
  return onSnapshot(collRef, (snapshot) => {
    const items: SavedCollegeData[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as SavedCollegeData);
    });
    onUpdate(items);
  }, (error) => {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (wrapped) {
      if (onError) onError(wrapped as Error);
    }
  });
}

// Save rank prediction
export async function savePredictionToFirestore(userId: string, prediction: Omit<SavedPredictionData, 'userId' | 'createdAt'>) {
  const path = `users/${userId}/predictions/${prediction.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'predictions', prediction.id);
    await setDoc(docRef, {
      ...prediction,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update user preferences
export async function updateUserProfile(userId: string, updates: Partial<UserProfileData>) {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Save or Update a student review for a college
export async function addCollegeReview(collegeId: string, review: Omit<CollegeReview, 'collegeId'>) {
  const path = `colleges/${collegeId}/reviews/${review.id}`;
  try {
    const docRef = doc(db, 'colleges', collegeId, 'reviews', review.id);
    const cleanPayload: Record<string, unknown> = {
      id: review.id,
      collegeId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt || new Date().toISOString(),
    };
    if (review.collegeName) cleanPayload.collegeName = review.collegeName;
    if (review.userEmail) cleanPayload.userEmail = review.userEmail;
    if (review.title) cleanPayload.title = review.title;
    if (review.branch) cleanPayload.branch = review.branch;
    if (review.batch) cleanPayload.batch = review.batch;
    if (typeof review.recommended === 'boolean') cleanPayload.recommended = review.recommended;
    if (review.updatedAt) cleanPayload.updatedAt = review.updatedAt;

    await setDoc(docRef, cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete student review
export async function deleteCollegeReview(collegeId: string, reviewId: string) {
  const path = `colleges/${collegeId}/reviews/${reviewId}`;
  try {
    const docRef = doc(db, 'colleges', collegeId, 'reviews', reviewId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time listener for college reviews
export function subscribeToCollegeReviews(
  collegeId: string,
  onUpdate: (reviews: CollegeReview[]) => void,
  onError?: (err: Error) => void
) {
  const path = `colleges/${collegeId}/reviews`;
  const collRef = collection(db, 'colleges', collegeId, 'reviews');
  
  return onSnapshot(collRef, (snapshot) => {
    const items: CollegeReview[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as CollegeReview);
    });
    // Sort in memory by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(items);
  }, (error) => {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (wrapped) {
      if (onError) onError(wrapped as Error);
    }
  });
}

// -------------------------------------------------------------
// Cutoff Alerts for Upcoming Counseling Cycle
// -------------------------------------------------------------

export async function saveCutoffAlert(
  userId: string, 
  collegeId: string, 
  alertData: Partial<CutoffAlert> & { 
    collegeId: string; 
    collegeCode: string; 
    collegeName: string; 
    userEmail: string;
  }
): Promise<CutoffAlert> {
  const path = `users/${userId}/cutoff_alerts/${collegeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'cutoff_alerts', collegeId);
    const now = new Date().toISOString();
    
    const record: CutoffAlert = {
      id: collegeId,
      collegeId,
      collegeCode: alertData.collegeCode,
      collegeName: alertData.collegeName,
      state: alertData.state || 'TS',
      userId,
      userEmail: alertData.userEmail,
      notifyEmail: alertData.notifyEmail ?? true,
      notifyInApp: alertData.notifyInApp ?? true,
      counselingCycle: alertData.counselingCycle || '2026-2027 Upcoming Counseling Cycle',
      category: alertData.category || 'OC',
      branches: alertData.branches && alertData.branches.length > 0 ? alertData.branches : ['ALL'],
      triggerCondition: alertData.triggerCondition || 'any_change',
      targetRank: alertData.targetRank,
      isActive: alertData.isActive ?? true,
      createdAt: alertData.createdAt || now,
      updatedAt: now,
      lastNotifiedAt: alertData.lastNotifiedAt,
    };

    // Clean undefined fields before writing
    const payload: Record<string, unknown> = {};
    Object.entries(record).forEach(([k, v]) => {
      if (v !== undefined) {
        payload[k] = v;
      }
    });

    await setDoc(docRef, payload);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function removeCutoffAlert(userId: string, collegeId: string): Promise<void> {
  const path = `users/${userId}/cutoff_alerts/${collegeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'cutoff_alerts', collegeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function getCutoffAlert(userId: string, collegeId: string): Promise<CutoffAlert | null> {
  const path = `users/${userId}/cutoff_alerts/${collegeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'cutoff_alerts', collegeId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CutoffAlert;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export function subscribeToCutoffAlert(
  userId: string,
  collegeId: string,
  onUpdate: (alert: CutoffAlert | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/cutoff_alerts/${collegeId}`;
  const docRef = doc(db, 'users', userId, 'cutoff_alerts', collegeId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as CutoffAlert);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export function subscribeToUserCutoffAlerts(
  userId: string,
  onUpdate: (alerts: CutoffAlert[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/cutoff_alerts`;
  const collRef = collection(db, 'users', userId, 'cutoff_alerts');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: CutoffAlert[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CutoffAlert);
      });
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

// -------------------------------------------------------------
// In-App Notifications Service
// -------------------------------------------------------------

export async function addInAppNotification(
  userId: string,
  notification: Omit<InAppNotification, 'userId' | 'createdAt' | 'id'> & { id?: string }
): Promise<InAppNotification> {
  const id = notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/notifications/${id}`;
  try {
    const docRef = doc(db, 'users', userId, 'notifications', id);
    const record: InAppNotification = {
      id,
      userId,
      collegeId: notification.collegeId,
      collegeName: notification.collegeName,
      collegeCode: notification.collegeCode,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read ?? false,
      createdAt: new Date().toISOString(),
      ...(notification.cutoffDetails ? { cutoffDetails: notification.cutoffDetails } : {})
    };

    const payload: Record<string, unknown> = {};
    Object.entries(record).forEach(([k, v]) => {
      if (v !== undefined) payload[k] = v;
    });

    await setDoc(docRef, payload);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const path = `users/${userId}/notifications/${notificationId}`;
  try {
    const docRef = doc(db, 'users', userId, 'notifications', notificationId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInAppNotification(userId: string, notificationId: string): Promise<void> {
  const path = `users/${userId}/notifications/${notificationId}`;
  try {
    const docRef = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserNotifications(
  userId: string,
  onUpdate: (notifications: InAppNotification[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/notifications`;
  const collRef = collection(db, 'users', userId, 'notifications');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: InAppNotification[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as InAppNotification);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

// Generate realistic simulated counseling cutoff shift notification for testing
export async function sendSampleCutoffNotification(
  userId: string,
  college: College,
  category: string = 'OC'
): Promise<InAppNotification> {
  const primaryCutoff = college.cutoffs[0] || {
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    closingRanks: { OC: 2450 }
  };

  const branchCode = primaryCutoff.branchCode;
  const currentRank = (primaryCutoff.closingRanks as any)[category] || primaryCutoff.closingRanks.OC || 3500;
  // Shift cutoff by a realistic delta (+/- 120-350 ranks)
  const shift = Math.floor(Math.random() * 280) - 140 || 120;
  const newRank = Math.max(1, currentRank + shift);
  const direction = shift > 0 ? 'relaxed (easier)' : 'tightened (more competitive)';

  return addInAppNotification(userId, {
    collegeId: college.id,
    collegeCode: college.code,
    collegeName: college.name,
    title: `Cutoff Rank Shift: ${college.code} (${branchCode})`,
    message: `Phase 2 Allotment Cutoff updated for ${branchCode}: closing rank for ${category} category shifted from ${currentRank.toLocaleString('en-IN')} to ${newRank.toLocaleString('en-IN')} (${direction} by ${Math.abs(shift)} ranks).`,
    type: 'cutoff_change',
    read: false,
    cutoffDetails: {
      branchCode,
      category,
      oldRank: currentRank,
      newRank,
      difference: shift,
      round: 'Phase 2 Counseling Seat Allotment'
    }
  });
}

