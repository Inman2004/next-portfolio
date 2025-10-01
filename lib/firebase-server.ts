import 'server-only';
import admin from 'firebase-admin';
import { App, getApp, getApps } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Storage, getStorage } from 'firebase-admin/storage';

let db: Firestore;
let auth: Auth;
let storage: Storage;

// Define the service account credentials directly from environment variables.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Check if credentials are provided
const hasCredentials = serviceAccount.projectId && serviceAccount.clientEmail && service.privateKey;

// In a test environment or if credentials are not provided (e.g., during build),
// use mock objects to avoid crashing the application.
if (process.env.NODE_ENV === 'test' || !hasCredentials) {
  if (!hasCredentials) {
    console.warn('Firebase Admin SDK credentials not set. Using mock Firestore instance for build process.');
  }

  const mockQuery = {
    where: () => mockQuery,
    orderBy: () => mockQuery,
    limit: () => mockQuery,
    get: async () => ({ forEach: () => {} }),
    // Add a mock 'add' method to handle post creation during build
    add: async (data: any) => ({ id: 'mock-build-id', ...data }),
  };

  const mockCollection = {
      ...mockQuery,
      doc: (path: string) => ({
          get: async () => ({ exists: false }),
          set: async (data: any) => {},
          update: async (data: any) => {},
          delete: async () => {},
      })
  }

  db = {
    collection: () => mockCollection,
  } as unknown as Firestore;

  auth = {} as Auth;
  storage = {} as Storage;
} else {
  // A global symbol is used to store the initialized Firebase app,
  // preventing re-initialization across hot-reloads and module re-imports in Next.js.
  const FIREBASE_ADMIN_APP_KEY = Symbol.for('firebaseAdminApp');

  interface GlobalWithFirebase {
    [FIREBASE_ADMIN_APP_KEY]?: App;
  }

  function getAdminApp(): App {
    const globalWithFirebase = global as GlobalWithFirebase;

    if (globalWithFirebase[FIREBASE_ADMIN_APP_KEY]) {
      return globalWithFirebase[FIREBASE_ADMIN_APP_KEY];
    }

    const app = getApps().length
      ? getApp()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.projectId}.appspot.com`,
        });

    globalWithFirebase[FIREBASE_ADMIN_APP_KEY] = app;
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  }

  const app: App = getAdminApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { db, auth, storage };