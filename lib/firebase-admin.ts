import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Singleton instance holder
let adminApp: App | null = null;

// Function to initialize Firebase Admin, but only if not already initialized
const initializeFirebaseAdmin = (): App => {
  // Return existing app if already initialized
  const existingApp = getApps().find(app => app.name === '[DEFAULT]');
  if (existingApp) {
    return existingApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  let serviceAccount;
  try {
    // Vercel escapes JSON, so we need to parse it
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (e1) {
    try {
      // If parsing fails, it might be base64 encoded
      const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedKey);
    } catch (e2) {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. It must be valid JSON or base64-encoded JSON.');
    }
  }

  try {
    return initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    throw new Error('Failed to initialize Firebase Admin. Please check your service account key.');
  }
};

// A proxy-based lazy initializer for any object
const createLazyProxy = <T extends object>(initializer: () => T): T => {
  let instance: T | null = null;
  const handler: ProxyHandler<T> = {
    get: (target, prop, receiver) => {
      if (instance === null) {
        instance = initializer();
      }
      // BIND THE FUNCTION TO THE REAL INSTANCE
      const value = Reflect.get(instance, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
  };
  return new Proxy({} as T, handler);
};

// Lazy-initialized Firebase Admin App
const getAdminApp = (): App => {
    if (!adminApp) {
        adminApp = initializeFirebaseAdmin();
    }
    return adminApp;
};

// Export lazy-loaded services
export const adminAuth: Auth = createLazyProxy(() => getAuth(getAdminApp()));
export const adminFirestore: Firestore = createLazyProxy(() => getFirestore(getAdminApp()));
// The default export should also be lazy
const lazyAdminApp: App = createLazyProxy(getAdminApp);

export default lazyAdminApp;
