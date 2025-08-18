import 'server-only';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-server';
import { batchQueryAsMap } from './firebase-utils';
import { 
  getUserData, 
  enrichWithUserData, 
  cleanupUserSubscriptions
} from './userUtils';
import { 
  BlogPost, 
  EnrichedBlogPost, 
  BaseBlogPost, 
  BlogPostUserData,
  ADMIN_EMAIL
} from '@/types/blog';

export type UserUpdates = Partial<BlogPostUserData>;

/**
 * Enrich blog posts with user data
 * @param posts - Array of blog posts to enrich
 * @param subscribe - Whether to subscribe to real-time updates for user data
 * @returns Array of blog posts with user data and optional unsubscribe functions
 */
export const enrichBlogPosts = async <T extends BaseBlogPost>(
  posts: T[],
  subscribe: boolean = false
): Promise<Array<T & EnrichedBlogPost>> => {
  if (!posts.length) return [];
  
  try {
    // Get unique user IDs and filter out invalid ones
    const userIds = [...new Set(
      posts
        .map(post => post.authorId)
        .filter(id => id && typeof id === 'string' && id.trim() !== '')
    )];
    
    if (!userIds.length) {
      console.warn('No valid user IDs found in posts, returning posts with fallback data');
      return posts.map(post => ({
        ...post,
        author: post.author || 'Anonymous',
        authorPhotoURL: post.authorPhotoURL || '',
        user: {
          displayName: post.author || 'Anonymous',
          photoURL: post.authorPhotoURL || ''
        }
      })) as Array<T & EnrichedBlogPost>;
    }
    
    console.log(`Enriching ${posts.length} posts with data for ${userIds.length} unique users`);
    
    // Use the batch query utility to handle arrays larger than 30
    const userDataMap = await batchQueryAsMap<{
      displayName?: string;
      photoURL?: string;
      socials?: Record<string, string>;
    }>('users', '__name__', userIds);
    
    console.log(`Retrieved user data for ${userDataMap.size} users`);
    
    // Enrich each post with the latest user data
    const enrichedPosts = posts.map(post => {
      const userData = userDataMap.get(post.authorId) || {};
      
      // Handle case where post.author might be a string or an object
      const existingAuthor = typeof post.author === 'object' ? post.author : 
                           { 
                             name: post.author as string, 
                             photoURL: post.authorPhotoURL,
                             socials: {}
                           } as const;
      
      // Always use the latest user data if available, otherwise fall back to post data
      const displayName = userData.displayName || existingAuthor.name || 'Anonymous';
      const photoURL = userData.photoURL || existingAuthor.photoURL || '';
      const socials = userData.socials || (existingAuthor as any).socials || {};
      
      // Create the author object with proper typing
      const author = {
        id: post.authorId,
        name: displayName,
        photoURL: photoURL,
        socials: socials
      };
      
      // Create the user object for the post
      const user = {
        displayName,
        photoURL,
        socials
      };
      
      // Create the enriched post
      const enrichedPost = {
        ...post,
        author,
        authorPhotoURL: photoURL,
        user,
        // Keep any existing unsubscribe function
        _userUnsubscribe: (post as any)._userUnsubscribe
      };
      
      return enrichedPost as unknown as T & EnrichedBlogPost;
    });
    
    console.log(`Successfully enriched ${enrichedPosts.length} posts`);
    return enrichedPosts;
    
  } catch (error) {
    console.error('Error enriching blog posts:', error);
    console.log('Falling back to original data with basic author information');
    
    // Fallback to original data if there's an error
    return posts.map(post => ({
      ...post,
      author: post.author || 'Anonymous',
      authorPhotoURL: post.authorPhotoURL || '',
      user: {
        displayName: post.author || 'Anonymous',
        photoURL: post.authorPhotoURL || ''
      }
    })) as Array<T & EnrichedBlogPost>;
  }
};

/**
 * Clean up user data subscriptions for blog posts
 * @param posts - Array of blog posts with optional _userUnsubscribe functions
 */
export function cleanupBlogPostSubscriptions<T extends { _userUnsubscribe?: () => void }>(posts: T[]) {
  cleanupUserSubscriptions(posts);
}

/**
 * Get a single blog post by ID with enriched user data
 * @param postId - The ID of the blog post to fetch
 * @returns The blog post with user data or null if not found
 */
export const getBlogPost = async (postId: string): Promise<(BlogPost & { user?: any }) | null> => {
  try {
    const postDoc = await getDoc(doc(db, 'blogPosts', postId));
    
    if (!postDoc.exists()) {
      return null;
    }
    
    const postData = { id: postDoc.id, ...postDoc.data() } as BlogPost;
    const [enrichedPost] = await enrichBlogPosts([postData]);
    
    return enrichedPost || null;
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
    // First, get all posts without any filters or ordering
    const q = collection(db, 'blogPosts');
    const querySnapshot = await getDocs(q);
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'rvimman@gmail.com';
    
    // Extract all unique author IDs for efficient batch querying
    const authorIds = [...new Set(
      querySnapshot.docs
        .map(doc => doc.data().authorId)
        .filter(id => id && typeof id === 'string' && id.trim() !== '')
    )];
    
    // Batch fetch all author data at once
    const authorDataMap = new Map<string, { email?: string }>();
    if (authorIds.length > 0) {
      try {
        console.log(`Fetching author data for ${authorIds.length} unique authors for admin check`);
        const authorData = await batchQueryAsMap<{ email?: string }>('users', '__name__', authorIds);
        authorData.forEach((data, id) => {
          authorDataMap.set(id, data);
        });
        console.log(`Retrieved author data for ${authorDataMap.size} authors`);
      } catch (error) {
        console.error('Error fetching author data for admin check:', error);
      }
    }
    
    // Process each post to check if the author is admin
    let posts: Array<BlogPost & { user?: any }> = [];
    let adminPostCount = 0;
    
    for (const postDoc of querySnapshot.docs) {
      const data = postDoc.data();
      let isAdminPost = false;
      
      // Check if this is the admin's post by user ID or email
      if (data.authorId) {
        try {
          // Direct check for known admin user ID
          if (data.authorId === 'ksHyBhNWEdUUIizl2qs42KwoR3D2') {
            isAdminPost = true;
            console.log(`Post ${postDoc.id} identified as admin post by user ID`);
          } else {
            // Use the batched author data
            const authorData = authorDataMap.get(data.authorId);
            if (authorData?.email === adminEmail) {
              isAdminPost = true;
              console.log(`Post ${postDoc.id} identified as admin post by email: ${authorData.email}`);
            }
          }
          
          if (isAdminPost) {
            adminPostCount++;
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      
      const post: BlogPost = {
        id: postDoc.id,
        ...data as Omit<BlogPost, 'id'>,
        isAdmin: isAdminPost
      };
      
      posts.push(post);
    }
    
    console.log(`Processed ${posts.length} posts, identified ${adminPostCount} as admin posts`);
    console.log(`Admin email being checked against: ${adminEmail}`);
    
    // Apply published filter in memory if needed
    if (options.publishedOnly) {
      posts = posts.filter(post => post.published !== false);
    }
    
    // Sort by createdAt in descending order (newest first)
    posts.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
    
    // Apply limit if specified
    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }
    
    // Enrich with user data
    return await enrichBlogPosts(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};
