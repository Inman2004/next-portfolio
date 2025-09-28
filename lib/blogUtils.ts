import 'server-only';
import { db } from './firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  BlogPost, 
  EnrichedBlogPost, 
  BaseBlogPost, 
} from '@/types/blog';
import { batchQueryAsMap } from './firebase-utils';

/**
 * Converts Firestore Timestamps to ISO strings for serialization.
 * @param data - The data object to process.
 * @returns A new object with Timestamps converted to strings.
 */
function serializeTimestamps(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeTimestamps);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in data) {
    newObj[key] = serializeTimestamps(data[key]);
  }
  return newObj;
}

/**
 * Enrich blog posts with user data
 * @param posts - Array of blog posts to enrich
 * @returns Array of blog posts with user data
 */
export const enrichBlogPosts = async <T extends BaseBlogPost>(
  posts: T[],
): Promise<Array<T & EnrichedBlogPost>> => {
  if (!posts || posts.length === 0) return [];
  
  try {
    const userIds = [...new Set(posts.map(post => post.authorId).filter(Boolean))];
    if (!userIds.length) {
      return posts.map(post => ({
        ...post,
        author: { name: post.authorName || 'Anonymous', photoURL: post.authorPhotoURL || '' },
      })) as Array<T & EnrichedBlogPost>;
    }
    
    // Corrected call to batchQueryAsMap
    const userDataMap = await batchQueryAsMap<{
      displayName?: string;
      photoURL?: string;
      socials?: Record<string, string>;
    }>('users', '__name__', userIds);
    
    const enrichedPosts = posts.map(post => {
      const userData = userDataMap.get(post.authorId);
      const author = {
        id: post.authorId,
        name: userData?.displayName || post.authorName || 'Anonymous',
        photoURL: userData?.photoURL || post.authorPhotoURL || '',
        socials: userData?.socials || {},
      };
      
      return { ...post, author } as T & EnrichedBlogPost;
    });
    
    return enrichedPosts;
    
  } catch (error) {
    console.error('Error enriching blog posts:', error);
    return posts.map(post => ({
      ...post,
      author: { name: post.authorName || 'Anonymous', photoURL: post.authorPhotoURL || '' },
    })) as Array<T & EnrichedBlogPost>;
  }
};

/**
 * Get a single blog post by ID with enriched user data
 * @param postId - The ID of the blog post to fetch
 * @returns The blog post with user data or null if not found
 */
export const getBlogPost = async (postId: string): Promise<(BlogPost & { user?: any }) | null> => {
  try {
    const postDoc = await db.collection('blogPosts').doc(postId).get();
    
    if (!postDoc.exists) {
      return null;
    }
    
    const postData = { id: postDoc.id, ...postDoc.data() } as BlogPost;
    const [enrichedPost] = await enrichBlogPosts([postData]);
    
    return serializeTimestamps(enrichedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

/**
 * Get all blog posts with enriched user data
 * @param options - Options for filtering and pagination
 * @returns Array of blog posts with user data
 */
export const getBlogPosts = async (options: {
  limit?: number;
  publishedOnly?: boolean;
} = {}): Promise<Array<BlogPost & { user?: any }>> => {
  try {
    let query: admin.firestore.Query = db.collection('blogPosts');

    if (options.publishedOnly) {
      query = query.where('published', '==', true);
    }
    
    query = query.orderBy('createdAt', 'desc');

    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[];

    const enrichedPosts = await enrichBlogPosts(posts);

    return serializeTimestamps(enrichedPosts);

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};