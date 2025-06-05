import { db } from './firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function updateUserReferences(userId: string, updates: { displayName?: string; photoURL?: string }) {
  try {
    const { displayName, photoURL } = updates;
    const batch = writeBatch(db);
    let hasUpdates = false;

    // Update comments in all collections
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );

    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.forEach((commentDoc) => {
      const updateData: any = {};
      
      if (displayName !== undefined) {
        updateData.userDisplayName = displayName;
      }
      if (photoURL !== undefined) {
        updateData.userPhotoURL = photoURL;
      }
      
      if (Object.keys(updateData).length > 0) {
        batch.update(doc(db, 'comments', commentDoc.id), updateData);
        hasUpdates = true;
      }
    });

    // Update posts if needed
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    );

    const postsSnapshot = await getDocs(postsQuery);
    
    postsSnapshot.forEach((postDoc) => {
      const updateData: any = {};
      
      if (displayName !== undefined) {
        updateData['author.name'] = displayName;
      }
      if (photoURL !== undefined) {
        updateData['author.photoURL'] = photoURL;
      }
      
      if (Object.keys(updateData).length > 0) {
        batch.update(doc(db, 'posts', postDoc.id), updateData);
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }
    
    return { success: true, updated: hasUpdates };
  } catch (error) {
    console.error('Error updating user references:', error);
    throw error;
  }
}
