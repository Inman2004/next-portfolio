import 'server-only';
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
import { db } from './firebase-server';
import { batchQueryAsMap } from './firebase-utils';

// Use server-side Firestore instance
const VIEWS_COLLECTION = 'post_views';

// Increment view count for a post
export async function incrementViewCount(postId: string): Promise<number> {
  try {
    console.log(`Attempting to increment view count for post: ${postId}`);
    const viewRef = doc(db, VIEWS_COLLECTION, postId);
    const viewSnap = await getDoc(viewRef);
    
    if (viewSnap.exists()) {
      console.log(`Updating existing view count for post: ${postId}`);
      await updateDoc(viewRef, {
        count: increment(1),
        lastViewed: new Date().toISOString()
      });
    } else {
      console.log(`Creating new view count document for post: ${postId}`);
      await setDoc(viewRef, {
        count: 1,
        postId,
        lastViewed: new Date().toISOString()
      });
    }
    
    const updatedSnap = await getDoc(viewRef);
    const newCount = updatedSnap.data()?.count || 0;
    console.log(`View count updated for post ${postId}: ${newCount}`);
    return newCount;
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
    
    // Filter out any invalid IDs
    const validIds = postIds.filter(id => id && typeof id === 'string' && id.trim() !== '');
    
    if (!validIds.length) {
      console.warn('No valid post IDs provided to getViewCounts');
      return {};
    }
    
    console.log(`Fetching view counts for ${validIds.length} posts`);
    
    const counts: Record<string, number> = {};
    
    // Initialize all counts to 0 first
    validIds.forEach(id => counts[id] = 0);
    
    // Since view count documents use post ID as document ID, we need to query differently
    // We'll use the batch query utility but query by document ID instead of postId field
    console.log(`Querying view counts using document IDs: ${validIds.slice(0, 5).join(', ')}${validIds.length > 5 ? '...' : ''}`);
    
    const viewData = await batchQueryAsMap<{ count: number }>(
      VIEWS_COLLECTION,
      '__name__', // Query by document ID
      validIds
    );
    
    console.log(`Retrieved view data for ${viewData.size} posts from batch query`);
    
    // Update counts for documents that exist
    viewData.forEach((data, docId) => {
      // The document ID is the post ID, and the data contains the count
      if (typeof data.count === 'number') {
        counts[docId] = data.count;
        console.log(`Post ${docId}: ${data.count} views`);
      } else {
        console.warn(`Post ${docId}: Invalid count data:`, data);
      }
    });
    
    console.log(`Successfully retrieved view counts for ${Object.keys(counts).length} posts`);
    return counts;
    
  } catch (error) {
    console.error('Error getting view counts:', error);
    // Return an object with all counts as 0 if there's an error
    const fallbackCounts: Record<string, number> = {};
    postIds.forEach(id => fallbackCounts[id] = 0);
    return fallbackCounts;
  }
}
