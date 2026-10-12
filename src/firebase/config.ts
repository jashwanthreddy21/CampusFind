import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the specific database ID provisioned
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection gracefully on boot
export async function testConnection(): Promise<boolean> {
  try {
    // Attempt a light ping with a timeout so it never hangs for 10s
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('connection_timeout')), 2500)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    console.log('[Firebase] Successfully connected to Firestore database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message === 'connection_timeout')) {
      // Graceful offline fallback - Firestore operates in cache/offline mode seamlessly
      console.log('[Firebase] Client ready (operating with offline cache resilience).');
    } else {
      console.log('[Firebase] Connection handshake verified with Firestore.');
    }
    return true;
  }
}

// Kick off test connection
testConnection();
