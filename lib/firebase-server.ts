import 'server-only';
import admin from 'firebase-admin';
import { App, getApp, getApps } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Storage, getStorage } from 'firebase-admin/storage';

// Define the service account credentials directly from environment variables.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

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

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK credentials are not set in environment variables. Please check your .env.local file.');
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
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage: Storage = getStorage(app);

export { db, auth, storage };