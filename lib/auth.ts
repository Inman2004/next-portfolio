// Client-side auth utilities
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  User as FirebaseUser,
  Auth,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';

// Server-side imports (dynamically imported when needed)
let serverAuth: {
  getServerSession: () => Promise<{ user: User | null }>;
  requireAdmin: () => Promise<{ user: User | null; isAdmin: boolean }>;
} | null = null;

// Helper to load server auth only when needed
async function getServerAuth() {
  if (typeof window === 'undefined' && !serverAuth) {
    serverAuth = await import('./server-auth');
  }
  return serverAuth!;
}

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// User type that matches our application's user model
export interface User {
  uid: string;
  id: string; // Alias for uid for backward compatibility
  displayName: string;
  name: string; // Alias for displayName for backward compatibility
  email: string;
  photoURL: string;
  emailVerified: boolean;
  role: UserRole;
  isAdmin: boolean;
  [key: string]: unknown; // Allow additional properties from Firestore
}

// Main admin email from Firestore rules
const MAIN_ADMIN_EMAIL = 'rvimman@gmail.com';

// Convert Firebase User to our User type
const mapFirebaseUser = async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
  if (!firebaseUser) return null;

  const db = getFirestore(getFirebase().app);
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();

  // Check if user is admin based on Firestore rules
  const isAdmin = firebaseUser.email === MAIN_ADMIN_EMAIL || userData?.role === UserRole.ADMIN;

  const user: User = {
    uid: firebaseUser.uid,
    id: firebaseUser.uid, // Alias for backward compatibility
    displayName: firebaseUser.displayName || userData?.displayName || '',
    name: firebaseUser.displayName || userData?.displayName || '', // Alias for backward compatibility
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || userData?.photoURL || '',
    emailVerified: firebaseUser.emailVerified || false,
    role: isAdmin ? UserRole.ADMIN : UserRole.USER,
    isAdmin,
    // Add any additional fields from Firestore
    ...userData
  };
  
  return user;
};

// Client-side auth state management
let currentUser: User | null = null;

export async function auth() {
  // On server, use server auth
  if (typeof window === 'undefined') {
    const serverAuth = await getServerAuth();
    return serverAuth.getServerSession();
  }
  
  // On client, return current user if available
  if (currentUser) {
    return { user: currentUser };
  }
  
  // Otherwise, wait for auth state to be initialized
  return new Promise<{ user: User | null }>((resolve) => {
    const { auth } = getFirebase();
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        currentUser = await mapFirebaseUser(firebaseUser);
        resolve({ user: currentUser });
      } else {
        currentUser = null;
        resolve({ user: null });
      }
      unsubscribe();
    });
  });
}

export async function signIn(email: string, password: string) {
  const { auth } = getFirebase();
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await mapFirebaseUser(userCredential.user);
    
    if (!user) {
      return { user: null, error: 'Failed to load user data' };
    }
    
    // Only allow admin access
    if (user.email !== MAIN_ADMIN_EMAIL) {
      await firebaseSignOut(auth);
      return { user: null, error: 'Access denied. Only admin users can sign in.' };
    }
    
    return { user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in';
    
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    return { user: null, error: errorMessage };
  }
}

export async function signOut() {
  const { auth } = getFirebase();
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

/**
 * Check if the current user is an admin
 * Follows the same logic as Firestore rules isAdmin() function
 */
export async function requireAdmin() {
  try {
    if (typeof window === 'undefined') {
      const serverAuth = await getServerAuth();
      return serverAuth.requireAdmin();
    }
    
    const { user } = await auth();
    const isAdmin = user?.email === MAIN_ADMIN_EMAIL;
    
    if (!user || !isAdmin) {
      return { user: null, isAdmin: false };
    }
    
    return { user, isAdmin: true };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { user: null, isAdmin: false };
  }
}

// Helper function to check if the current user is the main admin
export function isMainAdmin(email: string | null | undefined): boolean {
  return email === MAIN_ADMIN_EMAIL;
}

// Listen for auth state changes on the client
export function onAuthStateChanged(callback: (user: User | null) => void) {
  const { auth } = getFirebase();
  
  return firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    const user = await mapFirebaseUser(firebaseUser);
    callback(user);
  });
}
