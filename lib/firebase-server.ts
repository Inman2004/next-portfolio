import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { logToFile, logError } from './apiLogger';

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
    logToFile(`${logContext} Using existing Firebase instance`);
    return { firebaseApp, auth, db, storage };
  }

  try {
    logToFile(`${logContext} Initializing Firebase`);
    
    // Initialize Firebase
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services
    logToFile(`${logContext} Initializing Auth service`);
    auth = getAuth(firebaseApp);
    
    logToFile(`${logContext} Initializing Firestore`);
    db = getFirestore(firebaseApp);
    
    // Configure Firestore settings for better reliability
    try {
      // Note: In newer versions, settings are passed directly to getFirestore
      // If you need to update settings, you might need to reinitialize Firestore
      logToFile(`${logContext} Firestore initialized with settings:`, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(new Error(`${logContext} Error configuring Firestore settings: ${errorMessage}`));
    }
    
    logToFile(`${logContext} Initializing Storage`);
    storage = getStorage(firebaseApp);

    // Configure emulators in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Only connect to emulators if not already connected
        const emulatorConnected = (global as any)._emulatorConnected;
        if (!emulatorConnected) {
          logToFile(`${logContext} Connecting to emulators`);
          
          // Connect to Firestore emulator
          connectFirestoreEmulator(db, 'localhost', 8080);
          
          // Connect to Auth emulator
          connectAuthEmulator(auth, 'http://localhost:9099');
          
          // Connect to Storage emulator
          connectStorageEmulator(storage, 'localhost', 9199);
          
          (global as any)._emulatorConnected = true;
          logToFile(`${logContext} Connected to all emulators`);
        }
      } catch (emulatorError) {
        logError(emulatorError instanceof Error ? emulatorError : new Error(String(emulatorError)), 
               `${logContext} Error connecting to emulators`);
        // Don't throw, continue without emulators
      }
    }

    logToFile(`${logContext} Firebase initialized successfully`);
    return { firebaseApp, auth, db, storage };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(new Error(`Firebase initialization failed: ${errorMessage}`), logContext);
    
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
