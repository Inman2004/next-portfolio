import 'server-only';
import admin from 'firebase-admin';
import { App, getApp, getApps } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Storage, getStorage } from 'firebase-admin/storage';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const FIREBASE_ADMIN_INSTANCES_KEY = Symbol.for('firebaseAdminInstances');

interface FirebaseAdminInstances {
    app: App;
    db: Firestore;
    auth: Auth;
    storage: Storage;
}

interface GlobalWithFirebase {
  [FIREBASE_ADMIN_INSTANCES_KEY]?: FirebaseAdminInstances;
}

function initializeAdmin(): FirebaseAdminInstances {
  const globalWithFirebase = global as GlobalWithFirebase;

  if (globalWithFirebase[FIREBASE_ADMIN_INSTANCES_KEY]) {
    return globalWithFirebase[FIREBASE_ADMIN_INSTANCES_KEY];
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

  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  const instances = { app, db, auth, storage };
  globalWithFirebase[FIREBASE_ADMIN_INSTANCES_KEY] = instances;

  return instances;
}

const db = new Proxy({}, { get: (_, prop) => Reflect.get(initializeAdmin().db, prop) }) as Firestore;
const auth = new Proxy({}, { get: (_, prop) => Reflect.get(initializeAdmin().auth, prop) }) as Auth;
const storage = new Proxy({}, { get: (_, prop) => Reflect.get(initializeAdmin().storage, prop) }) as Storage;

export { db, auth, storage };