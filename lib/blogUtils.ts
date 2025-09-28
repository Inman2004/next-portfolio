import 'server-only';
import { db } from './firebase-server';
import type { BlogPost } from '@/types/blog';

// Get multiple blog posts (optionally only published), newest first
export async function getBlogPosts(options: { limit?: number; publishedOnly?: boolean } = {}): Promise<BlogPost[]> {
  const { limit: take, publishedOnly } = options;
  try {
    let ref = db.collection('blogPosts').orderBy('createdAt', 'desc');
    if (typeof take === 'number') ref = ref.limit(take);
    const snap = await ref.get();
    const posts: BlogPost[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      if (publishedOnly && data?.published === false) return;
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
          .where('tags', 'array-contains-any', tags.slice(0, 10))
          .get();
        tagSnap.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== currentPostId && data?.published !== false) {
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
        // Avoid requiring a composite index by not ordering here; we'll score/sort in memory
        const authorSnap = await db
          .collection('blogPosts')
          .where('authorId', '==', authorId)
          .limit(20)
          .get();
        authorSnap.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== currentPostId && data?.published !== false) {
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
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get();
        recentSnap.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== currentPostId && data?.published !== false) {
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