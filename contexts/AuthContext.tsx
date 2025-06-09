"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  User, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  onAuthStateChanged,
  getAuth,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Extend the Firebase User type with our custom fields
export interface AppUser extends FirebaseUser {
  username?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface UpdateProfileParams {
  displayName?: string | null;
  photoURL?: string | null;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isGoogleUser: boolean;
  updateUserProfile: (profile: UpdateProfileParams) => Promise<UpdateProfileResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

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



export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGoogleUser, setIsGoogleUser] = useState<boolean>(false);

  useEffect(() => {
    const processUser = async (authUser: User | null) => {
      if (!authUser) {
        setIsGoogleUser(false);
        setUser(null);
        return;
      }

      // Create a copy of the user object that we can modify
      let processedUser: User = { ...authUser };
      
      // Check if user is signed in with Google
      const isGoogle = authUser.providerData.some(
        (provider) => provider.providerId === 'google.com'
      );
      setIsGoogleUser(isGoogle);

      // Get the primary provider data (usually the first one)
      const primaryProvider = authUser.providerData[0];
      
      // Update photoURL from provider if available and not already set
      if (primaryProvider?.photoURL && !processedUser.photoURL) {
        processedUser = {
          ...processedUser,
          photoURL: primaryProvider.photoURL
        };
      }
      
      // Ensure user data is saved to Firestore
      try {
        if (!db) {
          console.error('Firestore database not initialized');
          setUser(processedUser);
          return;
        }
        
        const userRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userRef);
        const updateData: Record<string, any> = {
          updatedAt: serverTimestamp()
        };
        
        // Check if we need to create or update the user document
        if (userDoc.exists()) {
          const existingData = userDoc.data();
          const providerData = authUser.providerData[0];
          
          // Check if we need to update any fields
          const needsUpdate = 
            (!existingData.photoURL && providerData?.photoURL) ||
            (!existingData.displayName && providerData?.displayName) ||
            !existingData.username;
          
          if (needsUpdate) {
            // Update photoURL if missing and available from provider
            if (!existingData.photoURL && providerData?.photoURL) {
              updateData.photoURL = providerData.photoURL;
              processedUser = {
                ...processedUser,
                photoURL: providerData.photoURL
              };
            }
            
            // Update displayName if missing and available from provider
            if (!existingData.displayName && providerData?.displayName) {
              updateData.displayName = providerData.displayName;
              processedUser = {
                ...processedUser,
                displayName: providerData.displayName
              };
            }
            
            // Generate and set username if missing
            if (!existingData.username) {
              const emailUsername = authUser.email ? 
                authUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
              const displayNameUsername = authUser.displayName ? 
                authUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
              const username = emailUsername || displayNameUsername || `user${Date.now()}`;
              
              updateData.username = username;
            }
            
            try {
              await updateDoc(userRef, updateData);
              // Update the existing data with the new values
              if (updateData.photoURL) existingData.photoURL = updateData.photoURL;
              if (updateData.displayName) existingData.displayName = updateData.displayName;
              if (updateData.username) existingData.username = updateData.username;
            } catch (updateError) {
              console.error('Error updating user document:', updateError);
            }
          }
          
          // Create a new object with the combined user data
          const userWithData: User & { username?: string } = {
            ...processedUser,
            // Include any additional user data from Firestore
            displayName: processedUser.displayName || existingData.displayName || null,
            photoURL: processedUser.photoURL || existingData.photoURL || null,
            // Add the username from Firestore
            username: existingData.username
          };
          
          setUser(userWithData);
        } else {
          // Create new user document if it doesn't exist
          const emailUsername = authUser.email ? 
            authUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          const displayNameUsername = authUser.displayName ? 
            authUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          const username = emailUsername || displayNameUsername || `user${Date.now()}`;
          
          const newUserData = {
            uid: authUser.uid,
            email: authUser.email || null,
            emailVerified: authUser.emailVerified || false,
            displayName: authUser.displayName || null,
            photoURL: authUser.photoURL || null,
            username: username,
            providerData: authUser.providerData?.map(pd => ({
              providerId: pd.providerId,
              uid: pd.uid || '',
              displayName: pd.displayName || null,
              email: pd.email || null,
              photoURL: pd.photoURL || null,
              phoneNumber: pd.phoneNumber || null
            })) || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            role: 'user',
            isActive: true
          };
          
          try {
            await setDoc(userRef, newUserData);
            // Create a new user object with the username
            const userWithUsername: User & { username: string } = {
              ...processedUser,
              username: username
            };
            setUser(userWithUsername);
          } catch (createError) {
            console.error('Error creating user document:', createError);
            setUser(processedUser);
          }
        }
      } catch (error) {
        console.error('Error updating user data from provider:', error);
        setUser(processedUser);
      }  
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      processUser(user).finally(() => {
        setLoading(false);
      });
    });

return unsubscribe;
}, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('User creation failed');
      }
      
      const user = userCredential.user;
      
      // Generate a username from email
      const emailUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = emailUsername || `user${Date.now()}`;
      
      // Create user document in Firestore
      if (db) {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
          uid: user.uid,
          email: user.email || null,
          emailVerified: user.emailVerified || false,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL || null,
          username,
          providerData: user.providerData.map(pd => ({
            providerId: pd.providerId,
            uid: pd.uid || '',
            displayName: pd.displayName || null,
            email: pd.email || null,
            photoURL: pd.photoURL || null,
            phoneNumber: pd.phoneNumber || null
          })),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'user',
          isActive: true
        };
        
        try {
          await setDoc(userRef, userData);
          
          // Update local state with the new user data including username
          setUser({
            ...user,
            ...userData
          });
          
          // Send welcome email (don't await to prevent blocking the auth flow)
          if (user.email) {
            const displayName = user.displayName || email.split('@')[0];
            sendWelcomeEmail(user.email, displayName)
              .then(result => {
                if (result.error) {
                  console.warn('Welcome email not sent:', result.error);
                }
              });
          }
          
          return userCredential;
        } catch (error) {
          console.error('Error creating user document:', error);
          // If we fail to create the user document, delete the auth user to keep things clean
          try {
            await user.delete();
          } catch (deleteError) {
            console.error('Error cleaning up auth user after failed document creation:', deleteError);
          }
          throw new Error('Failed to create user profile');
        }
      } else {
        throw new Error('Database not initialized');
      }
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user) {
        throw new Error('Google sign in failed');
      }
      
      // Get the Google provider data which contains the high-quality avatar
      const googleProviderData = user.providerData?.find(
        (provider) => provider.providerId === 'google.com'
      );
      
      // Use the photoURL from Google provider data if available (higher resolution)
      const googlePhotoURL = googleProviderData?.photoURL?.replace(/=s96-c$/, '=s400-c') || user.photoURL;
      
      // Check if this is a new user
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      try {
        if (db) {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          // Generate a username from email or display name
          const emailUsername = user.email ? 
            user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          const displayNameUsername = user.displayName ? 
            user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          const username = emailUsername || displayNameUsername || `user${Date.now()}`;
          
          const updateData: Record<string, any> = {
            email: user.email || null,
            emailVerified: user.emailVerified || false,
            updatedAt: serverTimestamp(),
            // Always update displayName and photoURL from Google if available
            displayName: user.displayName || null,
            // Use the high-quality Google photo URL if available
            photoURL: googlePhotoURL || null,
            // Always set username for new users, or if it's missing
            ...(isNewUser || !userDoc.exists() ? { username } : {})
          };
          
          // Add provider data if available
          if (user.providerData) {
            updateData.providerData = user.providerData.map((pd) => ({
              providerId: pd.providerId,
              uid: pd.uid || '',
              displayName: pd.displayName || null,
              email: pd.email || null,
              photoURL: pd.photoURL || null
            }));
          }
          
          if (userDoc.exists()) {
            // Update existing document but don't overwrite existing fields with null
            const existingData = userDoc.data();
            const mergedData = { ...existingData };
            
            // Only update fields that have values in updateData
            Object.entries(updateData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                mergedData[key] = value;
              }
            });
            
            await updateDoc(userRef, mergedData);
          } else {
            // Create new document with additional fields
            await setDoc(userRef, {
              ...updateData,
              uid: user.uid,
              createdAt: serverTimestamp(),
              role: 'user',
              isActive: true
            });
          }
          
          // Send welcome email for new users (don't await to prevent blocking)
          if ((isNewUser || !userDoc.exists()) && user.email) {
            const displayName = user.displayName || user.email.split('@')[0] || 'User';
            sendWelcomeEmail(user.email, displayName)
              .then(emailResult => {
                if (emailResult.error) {
                  console.warn('Welcome email not sent:', emailResult.error);
                }
              });
          }
        }
      } catch (error) {
        console.error('Error updating user data after Google sign-in:', error);
        // Don't throw the error here to avoid breaking the sign-in flow
        // The user is still signed in, we just couldn't update their data
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

  // Function to update blog posts when user profile changes
  const updateUserBlogPosts = async (userId: string, updates: { displayName?: string | null; photoURL?: string | null }) => {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    
    console.log('Starting updateUserBlogPosts for user:', userId, 'with updates:', updates);
    
    try {
      // First, verify the user exists and has the expected fields
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('User document not found:', userId);
        return;
      }
      
      console.log('Found user document:', userDoc.data());
      
      // Find all blog posts by this user
      const postsQuery = query(
        collection(db, 'blogPosts'),
        where('authorId', '==', userId)
      );
      
      console.log('Querying for blog posts...');
      const querySnapshot = await getDocs(postsQuery);
      
      if (querySnapshot.empty) {
        console.log('No blog posts found for user:', userId);
        return;
      }
      
      console.log(`Found ${querySnapshot.size} blog posts to update`);
      
      const batch = writeBatch(db);
      let updateCount = 0;
      
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postRef = doc.ref;
        const postUpdates: Record<string, any> = {};
        let needsUpdate = false;
        
        console.log('Processing post:', postData.title || postData.id);
        
        if (updates.displayName !== undefined && postData.author !== updates.displayName) {
          console.log(`Updating author name from '${postData.author}' to '${updates.displayName}'`);
          postUpdates['author'] = updates.displayName;
          needsUpdate = true;
        }
        
        if (updates.photoURL !== undefined && postData.authorPhotoURL !== updates.photoURL) {
          console.log(`Updating author photo from '${postData.authorPhotoURL}' to '${updates.photoURL}'`);
          postUpdates['authorPhotoURL'] = updates.photoURL;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          postUpdates['updatedAt'] = serverTimestamp();
          batch.update(postRef, postUpdates);
          updateCount++;
          console.log('Queued update for post:', doc.id, 'with updates:', postUpdates);
        } else {
          console.log('No updates needed for post:', doc.id);
        }
      });
      
      if (updateCount > 0) {
        console.log(`Committing batch update for ${updateCount} posts...`);
        await batch.commit();
        console.log('Successfully updated blog posts');
      } else {
        console.log('No blog posts needed updating');
      }
    } catch (error) {
      console.error('Error in updateUserBlogPosts:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  const updateUserProfile = async (profile: UpdateProfileParams): Promise<UpdateProfileResult> => {
    if (!user || !db) return { success: false, error: 'User not authenticated or database not initialized' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      // Prepare updates object with proper Firestore types
      const updates: Record<string, any> = {
        updatedAt: serverTimestamp()
      };
      
      // Prepare auth profile updates
      const authUpdates: { displayName?: string | null; photoURL?: string | null } = {};
      
      // Track if we need to update blog posts
      const blogPostUpdates: { displayName?: string | null; photoURL?: string | null } = {};
      
      // Only add fields that are provided in the profile
      if (profile.displayName !== undefined) {
        updates.displayName = profile.displayName;
        authUpdates.displayName = profile.displayName;
        blogPostUpdates.displayName = profile.displayName;
      }
      
      if (profile.photoURL !== undefined) {
        updates.photoURL = profile.photoURL;
        authUpdates.photoURL = profile.photoURL;
        blogPostUpdates.photoURL = profile.photoURL;
      }
      
      if (profile.username !== undefined) {
        updates.username = profile.username.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      
      // Update Firebase Auth profile if there are auth updates
      if (Object.keys(authUpdates).length > 0 && auth.currentUser) {
        await updateProfile(auth.currentUser, authUpdates);
      }
      
      // If the document doesn't exist, create it with required fields
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          ...updates,
          uid: user.uid,
          email: user.email || null,
          emailVerified: user.emailVerified || false,
          role: 'user',
          isActive: true,
          createdAt: serverTimestamp(),
          providerData: user.providerData?.map(pd => ({
            providerId: pd.providerId,
            uid: pd.uid || '',
            displayName: pd.displayName || null,
            email: pd.email || null,
            photoURL: pd.photoURL || null
          })) || []
        });
      } else {
        // Update existing document
        await updateDoc(userRef, updates);
        
        // Update blog posts if displayName or photoURL changed
        if (Object.keys(blogPostUpdates).length > 0) {
          await updateUserBlogPosts(user.uid, blogPostUpdates);
        }
      }
      
      // Update local user state
      setUser(prev => ({
        ...prev!,
        ...updates
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in updateUserProfile:', errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const value: AuthContextType = {
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