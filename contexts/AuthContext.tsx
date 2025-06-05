"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  updateEmail as updateAuthEmail,
  updatePassword as updateAuthPassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { updateUserReferences } from '@/lib/updateUserReferences';

// Function to send welcome email using EmailJS
const sendWelcomeEmail = async (email: string, name: string) => {
  console.log('Preparing to send welcome email to:', email);
  
  // Dynamically import emailjs to avoid SSR issues
  const emailjs = (await import('@emailjs/browser')).default;
  
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  
  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS environment variables are not set');
    return { error: 'Email service configuration is missing' };
  }
  
  try {
    const templateParams = {
      to_email: email,
      to_name: name,
      from_name: 'Portfolio',
      message: `Welcome to my portfolio, ${name}! We're excited to have you on board.`,
      reply_to: email,
      // Add any additional parameters that match your EmailJS template
      subject: 'Welcome to My Portfolio!',
      website_url: 'https://your-portfolio-url.com',
      year: new Date().getFullYear().toString()
    };
    
    console.log('Sending email with params:', templateParams);
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    
    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { 
      error: 'Failed to send welcome email',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isGoogleUser: boolean;
  updateUserProfile: (profile: { displayName?: string | null; photoURL?: string | null }) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Check if user is signed in with Google
      if (user) {
        const isGoogle = user.providerData.some(
          (provider) => provider.providerId === 'google.com'
        );
        setIsGoogleUser(isGoogle);
      } else {
        setIsGoogleUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send welcome email (don't await to prevent blocking the auth flow)
    sendWelcomeEmail(email, email.split('@')[0])
      .then(result => {
        if (result.error) {
          console.warn('Welcome email not sent:', result.error);
        }
      });
    return userCredential;
  };

  const signIn = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Send welcome email for new Google sign-ups (don't await to prevent blocking)
      if (result.user) {
        const user = result.user;
        sendWelcomeEmail(user.email || '', user.displayName || user.email?.split('@')[0] || 'User')
          .then(result => {
            if (result.error) {
              console.warn('Welcome email not sent:', result.error);
            }
          });
      }
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProfile = async (profile: { displayName?: string | null; photoURL?: string | null }) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      // Create updated user object
      const updatedUser = {
        ...auth.currentUser,
        displayName: profile.displayName !== undefined ? profile.displayName : auth.currentUser.displayName,
        photoURL: profile.photoURL !== undefined ? profile.photoURL : auth.currentUser.photoURL
      };

      // Update auth profile
      await updateProfile(auth.currentUser, profile);
      
      // Prepare update data
      const updateData: Record<string, any> = {
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        updatedAt: serverTimestamp()
      };
      
      if (profile.displayName !== undefined) {
        updateData.displayName = profile.displayName;
      }
      if (profile.photoURL !== undefined) {
        updateData.photoURL = profile.photoURL;
      }
      
      // Update or create user document in Firestore
      if (db) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Update existing document
          await updateDoc(userRef, updateData);
        } else {
          // Create new document with additional fields
          await setDoc(userRef, {
            ...updateData,
            createdAt: serverTimestamp(),
            role: 'user',
            isActive: true
          });
        }
      }
      
      // Update local state with the new user data
      setUser(updatedUser);
      
      // Update the user cache
      if (typeof window !== 'undefined') {
        const userData = {
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL,
          email: updatedUser.email
        };
        
        // Update the cache for this user
        const userCache = new Map(JSON.parse(localStorage.getItem('userCache') || '[]'));
        userCache.set(updatedUser.uid, userData);
        localStorage.setItem('userCache', JSON.stringify(Array.from(userCache.entries())));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    isGoogleUser,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 