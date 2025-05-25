"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  isGoogleUser: boolean;
  updateUserProfile: (profile: { displayName?: string | null; photoURL?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

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
    await updateProfile(auth.currentUser, profile);
    // Force a user state update
    setUser(auth.currentUser);
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