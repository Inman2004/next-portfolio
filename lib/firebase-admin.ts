import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

// Function to initialize Firebase Admin with error handling
const initializeFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    // Try parsing as direct JSON first
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      // If direct parse fails, try base64 decode
      try {
        const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
      } catch (innerError) {
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. It should be a valid JSON or base64-encoded JSON string.');
      }
    }

    return initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin. Please check your service account key.');
  }
};

try {
  adminApp = initializeFirebaseAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  // Re-throw to prevent the app from starting with a broken Firebase setup
  throw error;
}

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);

export default adminApp;
