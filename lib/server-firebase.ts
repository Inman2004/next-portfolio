import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, DocumentData } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for server-side usage
let firebaseApp: FirebaseApp;
let db: Firestore;

const initializeServerFirebase = () => {
  if (firebaseApp) {
    return { firebaseApp, db };
  }

  // Initialize Firebase
  firebaseApp = initializeApp(firebaseConfig, 'server');
  db = getFirestore(firebaseApp);

  return { firebaseApp, db };
};

// Export initialized services
const { firebaseApp: serverFirebaseApp, db: serverDb } = initializeServerFirebase();

export { serverFirebaseApp as firebaseApp, serverDb as db };

// Helper function to get a document from Firestore
export const getServerDocument = async <T extends DocumentData>(
  collection: string,
  id: string
): Promise<(T & { id: string }) | null> => {
  try {
    const docRef = doc(serverDb, collection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};
