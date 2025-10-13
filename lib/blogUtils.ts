import 'server-only';
import { db } from './firebase-server';
import type { BlogPost } from '@/types/blog';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Get multiple blog posts (optionally only published), newest first
export async function getBlogPosts(options: { limit?: number; publishedOnly?: boolean } = {}): Promise<BlogPost[]> {
  const { limit: take, publishedOnly } = options;
  try {
    // Note: This query requires a composite index on 'published' (boolean) and 'createdAt' (descending).
    // The Firestore error message will provide a link to create it.
    let query: any = db.collection('blogPosts');

    if (publishedOnly) {
      query = query.where('published', '==', true);
    }

    query = query.orderBy('createdAt', 'desc');

    if (typeof take === 'number') {
      query = query.limit(take);
    }

    const snap = await query.get();
    const posts: BlogPost[] = [];
    snap.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      posts.push({ id: doc.id, ...(data as Omit<BlogPost, 'id'>) } as BlogPost);
    });
    return posts;
  } catch (e) {
    console.error('Error fetching blog posts:', e);
    return [];
  }
}

// Get a single blog post by ID (Admin SDK)
export async function getBlogPost(postId: string): Promise<BlogPost | null> {
  try {
    const snap = await db.collection('blogPosts').doc(postId).get();
    if (!snap.exists) return null;
    const data = snap.data() || {};
    return { id: snap.id, ...(data as Omit<BlogPost, 'id'>) } as BlogPost;
  } catch (e) {
    console.error('Error fetching blog post:', e);
    return null;
  }
}

// Get related posts using Admin SDK queries
export async function getRelatedPosts(
  currentPostId: string,
  options: { tags?: string[]; authorId?: string; limit?: number } = {}
): Promise<BlogPost[]> {
  const { tags = [], authorId, limit = 6 } = options;

  try {
    const candidates: BlogPost[] = [];

    // By tags overlap
    if (tags.length) {
      try {
        const tagSnap = await db
          .collection('blogPosts')
          .where('published', '==', true)
          .where('tags', 'array-contains-any', tags.slice(0, 10))
          .get();
        tagSnap.forEach((doc: QueryDocumentSnapshot) => {
          const data = doc.data();
          if (doc.id !== currentPostId) {
            candidates.push({ id: doc.id, ...(data as Omit<BlogPost, 'id'>) } as BlogPost);
          }
        });
      } catch (e) {
        console.error('Related by tags error:', e);
      }
    }

    // By same author (recent)
    if (authorId) {
      try {
        // This query requires a composite index on authorId (asc), published (asc), and createdAt (desc)
        const authorSnap = await db
          .collection('blogPosts')
          .where('authorId', '==', authorId)
          .where('published', '==', true)
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get();
        authorSnap.forEach((doc: QueryDocumentSnapshot) => {
          const data = doc.data();
          if (doc.id !== currentPostId) {
            candidates.push({ id: doc.id, ...(data as Omit<BlogPost, 'id'>) } as BlogPost);
          }
        });
      } catch (e) {
        console.error('Related by author error:', e);
      }
    }

    // Fallback to recent
    if (candidates.length === 0) {
      try {
        const recentSnap = await db
          .collection('blogPosts')
          .where('published', '==', true)
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get();
        recentSnap.forEach((doc: QueryDocumentSnapshot) => {
          const data = doc.data();
          if (doc.id !== currentPostId) {
            candidates.push({ id: doc.id, ...(data as Omit<BlogPost, 'id'>) } as BlogPost);
          }
        });
      } catch (e) {
        console.error('Related recent fallback error:', e);
      }
    }

    // Dedupe
    const dedup = new Map<string, BlogPost>();
    for (const p of candidates) {
      const pid = (p as any).id as string | undefined;
      if (!pid) continue;
      if (!dedup.has(pid)) dedup.set(pid, p);
    }
    const items = Array.from(dedup.values());

    // Score
    const tagSet = new Set(tags.map((t) => (t || '').toLowerCase()));
    const now = Date.now();
    const scored = items.map((p) => {
      const pTags: string[] = Array.isArray((p as any).tags) ? (p as any).tags : [];
      const overlap = pTags.reduce((acc, t) => acc + (tagSet.has((t || '').toLowerCase()) ? 1 : 0), 0);
      const sameAuthor = authorId && p.authorId === authorId ? 1 : 0;
      const createdAtVal: any = (p as any).createdAt;
      const createdDate = createdAtVal?.toDate ? createdAtVal.toDate() : new Date(createdAtVal || 0);
      const ageDays = Math.max(1, (now - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const recency = Math.max(0, 10 - Math.log10(ageDays + 1));
      const score = overlap * 2 + sameAuthor * 3 + recency;
      return { p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.p);
  } catch (e) {
    console.error('Error computing related posts:', e);
    return [];
  }
}

// Get view counts for multiple blog posts
export async function getViewCounts(postIds: string[]): Promise<Record<string, number>> {
  try {
    if (postIds.length === 0) return {};

    // Fetch view counts for the specified post IDs
    const viewCountsPromises = postIds.map(async (postId) => {
      try {
        const doc = await db.collection('blogPosts').doc(postId).get();
        if (doc.exists) {
          const data = doc.data();
          return { postId, viewCount: data?.viewCount || 0 };
        }
        return { postId, viewCount: 0 };
      } catch (error) {
        console.error(`Error fetching view count for post ${postId}:`, error);
        return { postId, viewCount: 0 };
      }
    });

    const viewCountsResults = await Promise.all(viewCountsPromises);

    // Convert array of results to a record object
    const viewCounts: Record<string, number> = {};
    viewCountsResults.forEach(({ postId, viewCount }) => {
      viewCounts[postId] = viewCount;
    });

    return viewCounts;
  } catch (error) {
    console.error('Error fetching view counts:', error);
    return {};
  }
}