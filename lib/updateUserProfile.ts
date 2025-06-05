import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = getFirestore();

/**
 * Updates user profile across all collections in Firestore
 * @param userId - The ID of the user to update
 * @param updates - Object containing the fields to update (displayName, photoURL)
 */
export async function updateUserProfileInFirestore(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> {
  const { displayName, photoURL } = updates;
  
  if (!displayName && !photoURL) {
    return; // Nothing to update
  }

  const batch = db.batch();
  const userRef = db.collection('users').doc(userId);
  
  // Update user document
  const updateData: any = {
    updatedAt: FieldValue.serverTimestamp()
  };
  
  if (displayName) updateData.displayName = displayName;
  if (photoURL) updateData.photoURL = photoURL;
  
  batch.update(userRef, updateData);

  try {
    // Update all posts by this user
    const postsSnapshot = await db
      .collection('posts')
      .where('authorId', '==', userId)
      .get();

    postsSnapshot.forEach((doc) => {
      const postUpdate: any = {};
      if (displayName) postUpdate['author.name'] = displayName;
      if (photoURL) postUpdate['author.photoURL'] = photoURL;
      
      if (Object.keys(postUpdate).length > 0) {
        batch.update(doc.ref, postUpdate);
      }
    });

    // Update all comments by this user
    const commentsSnapshot = await db
      .collectionGroup('comments')
      .where('userId', '==', userId)
      .get();

    commentsSnapshot.forEach((doc) => {
      const commentUpdate: any = {};
      if (displayName) commentUpdate.userDisplayName = displayName;
      if (photoURL) commentUpdate.userPhotoURL = photoURL;
      
      if (Object.keys(commentUpdate).length > 0) {
        batch.update(doc.ref, commentUpdate);
      }
    });

    // Commit all updates
    await batch.commit();
    
  } catch (error) {
    console.error('Error updating user profile in Firestore:', error);
    throw error;
  }
}

/**
 * Updates the user's auth profile (displayName and photoURL)
 */
export async function updateAuthProfile(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> {
  const { displayName, photoURL } = updates;
  
  if (!displayName && !photoURL) {
    return; // Nothing to update
  }

  const updateData: any = {};
  if (displayName) updateData.displayName = displayName;
  if (photoURL) updateData.photoURL = photoURL;

  await admin.auth().updateUser(userId, updateData);
}

/**
 * Updates both auth profile and Firestore data
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> {
  // Update auth profile
  await updateAuthProfile(userId, updates);
  
  // Update Firestore data
  await updateUserProfileInFirestore(userId, updates);
}
