import { db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '@/contexts/AuthContext';

export interface UpdateUserProfileParams {
  displayName?: string;
  photoURL?: string;
  username?: string;
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
  };
}

export const updateUserProfile = async (userId: string, data: UpdateUserProfileParams) => {
  console.log('updateUserProfile called with:', { userId, data });
  
  if (!userId) {
    console.error('No user ID provided');
    return { success: false, error: 'No user ID provided' };
  }

  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return { success: false, error: 'Database not available' };
    }

    const userRef = doc(db, 'users', userId);
    console.log('User reference created:', userRef.path);
    
    // Verify we can access the document
    console.log('Fetching user document...');
    const userDoc = await getDoc(userRef);
    console.log('User document exists:', userDoc.exists());
    
    // Prepare update data
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Update data prepared:', JSON.stringify(updateData, null, 2));
    
    try {
      if (userDoc.exists()) {
        // Update existing user document
        console.log('Updating existing user document...');
        await updateDoc(userRef, updateData);
        console.log('User document updated successfully');
      } else {
        // Create new user document if it doesn't exist
        console.log('Creating new user document...');
        await setDoc(userRef, {
          ...updateData,
          uid: userId, // Ensure UID is set for new documents
          createdAt: new Date().toISOString(),
        });
        console.log('New user document created');
      }
      
      // Verify the update
      const updatedDoc = await getDoc(userRef);
      console.log('Document after update:', updatedDoc.data());
      
      return { success: true };
    } catch (firestoreError) {
      console.error('Firestore operation failed:', firestoreError);
      throw firestoreError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
};

export const getUserProfile = async (userId: string): Promise<AppUser | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
