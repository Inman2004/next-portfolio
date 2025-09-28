import 'server-only';
import { db } from './firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { batchQueryAsMap } from './firebase-utils';

const VIEWS_COLLECTION = 'post_views';

/**
 * Increments the view count for a specific post.
 * @param postId The ID of the post to increment the view count for.
 * @returns The new view count, or 0 on error.
 */
export async function incrementViewCount(postId: string): Promise<number> {
  try {
    const viewRef = db.collection(VIEWS_COLLECTION).doc(postId);
    const viewSnap = await viewRef.get();

    if (viewSnap.exists) {
      await viewRef.update({
        count: FieldValue.increment(1),
        lastViewed: FieldValue.serverTimestamp(),
      });
    } else {
      await viewRef.set({
        count: 1,
        postId,
        lastViewed: FieldValue.serverTimestamp(),
      });
    }

    const updatedSnap = await viewRef.get();
    return updatedSnap.data()?.count || 0;
  } catch (error) {
    console.error(`Error incrementing view count for post ${postId}:`, error);
    return 0;
  }
}

/**
 * Retrieves the view count for a single post.
 * @param postId The ID of the post.
 * @returns The view count, or 0 if not found or on error.
 */
export async function getViewCount(postId: string): Promise<number> {
  try {
    const viewRef = db.collection(VIEWS_COLLECTION).doc(postId);
    const viewSnap = await viewRef.get();

    return viewSnap.exists ? viewSnap.data()?.count || 0 : 0;
  } catch (error) {
    console.error(`Error getting view count for post ${postId}:`, error);
    return 0;
  }
}

/**
 * Retrieves view counts for multiple posts in a single batch operation.
 * @param postIds An array of post IDs.
 * @returns A record mapping post IDs to their view counts.
 */
export async function getViewCounts(postIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (!postIds || postIds.length === 0) {
    return counts;
  }

  // Initialize all counts to 0
  postIds.forEach(id => (counts[id] = 0));

  try {
    const viewData = await batchQueryAsMap<{ count: number }>(
      VIEWS_COLLECTION,
      '__name__', // Special field to query by document ID
      postIds
    );

    viewData.forEach((data, docId) => {
      if (typeof data.count === 'number') {
        counts[docId] = data.count;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error getting batch view counts:', error);
    // Return the initialized counts (all 0) on error
    return counts;
  }
}