import { 
  doc, 
  getFirestore, 
  increment, 
  updateDoc, 
  getDoc, 
  setDoc, 
  query, 
  collection, 
  where, 
  getDocs, 
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
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

// Get view counts for multiple posts in a single batch
export async function getViewCounts(postIds: string[]): Promise<Record<string, number>> {
  try {
    if (!postIds.length) return {};
    
    const counts: Record<string, number> = {};
    
    // Fetch all view counts in a single query
    const q = query<DocumentData, DocumentData>(
      collection(db, VIEWS_COLLECTION),
      where('postId', 'in', postIds)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize all counts to 0 first
    postIds.forEach(id => counts[id] = 0);
    
    // Update counts for documents that exist
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      if (data.postId && typeof data.count === 'number') {
        counts[data.postId] = data.count;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting view counts:', error);
    // Return an object with all counts as 0 if there's an error
    return postIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }
}
