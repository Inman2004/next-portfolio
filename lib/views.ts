import { doc, getFirestore, increment, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';

// Initialize Firebase and get Firestore instance
const { db } = getFirebase();
const VIEWS_COLLECTION = 'post_views';

// Increment view count for a post
export async function incrementViewCount(postId: string): Promise<number> {
  try {
    const viewRef = doc(db, VIEWS_COLLECTION, postId);
    const viewSnap = await getDoc(viewRef);
    
    if (viewSnap.exists()) {
      await updateDoc(viewRef, {
        count: increment(1),
        lastViewed: new Date().toISOString()
      });
    } else {
      await setDoc(viewRef, {
        count: 1,
        postId,
        lastViewed: new Date().toISOString()
      });
    }
    
    const updatedSnap = await getDoc(viewRef);
    return updatedSnap.data()?.count || 0;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return 0;
  }
}

// Get view count for a post
export async function getViewCount(postId: string): Promise<number> {
  try {
    const viewRef = doc(db, VIEWS_COLLECTION, postId);
    const viewSnap = await getDoc(viewRef);
    
    if (viewSnap.exists()) {
      return viewSnap.data()?.count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}
