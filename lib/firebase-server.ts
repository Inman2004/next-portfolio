import 'server-only';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

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
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

const initializeFirebase = () => {
  const requestId = Math.random().toString(36).substring(2, 10);
  const logContext = `[${requestId}]`;
  
  // Return existing instances if already initialized
  if (firebaseApp) {
    console.log(`${logContext} Using existing Firebase instance`);
    return { firebaseApp, auth, db, storage };
  }

  try {
    console.log(`${logContext} Initializing Firebase`);
    
    // Initialize Firebase
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services
    console.log(`${logContext} Initializing Auth service`);
    auth = getAuth(firebaseApp);
    
    console.log(`${logContext} Initializing Firestore`);
    db = getFirestore(firebaseApp);
    
    console.log(`${logContext} Initializing Storage`);
    storage = getStorage(firebaseApp);

    // Configure emulators in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        // Only connect to emulators if not already connected
        const emulatorConnected = (global as any)._emulatorConnected;
        if (!emulatorConnected) {
          console.log(`${logContext} Connecting to emulators`);
          
          // Connect to Firestore emulator
          connectFirestoreEmulator(db, 'localhost', 8080);
          
          // Connect to Auth emulator
          connectAuthEmulator(auth, 'http://localhost:9099');
          
          // Connect to Storage emulator
          connectStorageEmulator(storage, 'localhost', 9199);
          
          (global as any)._emulatorConnected = true;
          console.log(`${logContext} Connected to all emulators`);
        }
      } catch (emulatorError) {
        console.error(`${logContext} Error connecting to emulators:`, emulatorError);
        // Don't throw, continue without emulators
      }
    }

    console.log(`${logContext} Firebase initialized successfully`);
    return { firebaseApp, auth, db, storage };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${logContext} Firebase initialization failed:`, error);
    
    // Log the full error for debugging
    console.error('Firebase initialization error details:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
      }
    });
    
    throw new Error(`Failed to initialize Firebase: ${errorMessage}`);
  }
};

// Export initialized services
export { auth, db, storage, firebaseApp as app, initializeFirebase };

// Initialize Firebase automatically when this module is imported
initializeFirebase();
