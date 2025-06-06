import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

// Initialize Firebase only on the client-side
const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    return; // Don't initialize on server-side
  }

  if (firebaseApp) {
    return; // Already initialized
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing Firebase with config:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
    });
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    
    // Configure Google Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

// Initialize Firebase when this module is imported
initializeFirebase();

// Export initialized services
export { auth, db, storage, googleProvider, firebaseApp as app };

// Test Firestore connection
async function testConnection() {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return false;
    }
    
    const querySnapshot = await getDocs(collection(db, 'comments'));
    console.log('Successfully connected to Firestore. Found', querySnapshot.size, 'comments');
    
    if (process.env.NODE_ENV === 'development') {
      querySnapshot.forEach((doc) => {
        console.log('Comment:', doc.id, doc.data());
      });
    }
    return true;
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    return false;
  }
}

// Run test connection in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Small delay to ensure Firebase is initialized
  setTimeout(() => {
    testConnection().then(success => {
      if (!success) {
        console.log('Retrying Firestore connection...');
        setTimeout(() => testConnection(), 1000);
      }
    });
  }, 1000);
}

// Export a function to ensure Firebase is initialized when needed
export function getFirebase() {
  if (!firebaseApp) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase cannot be initialized on the server side');
    }
    firebaseApp = initializeApp(firebaseConfig);
  }
  return {
    app: firebaseApp,
    auth: auth || getAuth(firebaseApp),
    db: db || getFirestore(firebaseApp),
    storage: storage || getStorage(firebaseApp),
    googleProvider: googleProvider || (() => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return provider;
    })()
  };
}