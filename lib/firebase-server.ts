import 'server-only';
import admin from 'firebase-admin';
import { getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Use a symbol to ensure the global variable is unique and won't conflict.
const FIREBASE_ADMIN_INSTANCE = Symbol.for('firebaseAdminInstance');

interface FirebaseAdminServices {
  app: admin.app.App;
  db: Firestore;
  auth: Auth;
  storage: Storage;
}

// Extend the NodeJS.Global interface to include our custom symbol.
interface GlobalWithFirebase extends NodeJS.Global {
  [FIREBASE_ADMIN_INSTANCE]?: FirebaseAdminServices;
}

/**
 * Initializes and returns the Firebase Admin services, using a global cache
 * to ensure that the app is initialized only once per process.
 */
function getFirebaseAdmin(): FirebaseAdminServices {
  const globalWithFirebase = global as GlobalWithFirebase;

  if (globalWithFirebase[FIREBASE_ADMIN_INSTANCE]) {
    return globalWithFirebase[FIREBASE_ADMIN_INSTANCE];
  }

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Missing Firebase Admin SDK credentials in environment variables.');
  }

  const app = !getApps().length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.projectId}.appspot.com`,
      })
    : getApp();

  const services: FirebaseAdminServices = {
    app,
    db: getFirestore(app),
    auth: getAuth(app),
    storage: getStorage(app),
  };

  globalWithFirebase[FIREBASE_ADMIN_INSTANCE] = services;

  console.log('Firebase Admin SDK initialized successfully.');

  return services;
}

const { db, auth, storage } = getFirebaseAdmin();

export { db, auth, storage };