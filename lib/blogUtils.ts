import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  DocumentData,
  Timestamp
} from 'firebase/firestore';
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
  
  // Get unique user IDs
  const userIds = [...new Set(posts.map(post => post.authorId))];
  
  // Use enrichWithUserData which now supports real-time subscriptions
  // We need to map the authorId to userId which is what enrichWithUserData expects
  const postsWithUserId = posts.map(post => ({
    ...post,
    userId: post.authorId
  })) as Array<T & { userId: string }>;
  
  const enrichedPosts = await enrichWithUserData(postsWithUserId, ['displayName', 'photoURL'], subscribe);
  
  // Map back to the original structure with proper typing
  return enrichedPosts.map(post => {
    const { userId, _userUnsubscribe, ...rest } = post as any;
    
    // Create a new user object with the data from the enriched post
    const userData: BlogPostUserData = {
      displayName: post.user?.displayName || post.author,
      photoURL: post.user?.photoURL || post.authorPhotoURL
    };
    
    // Get the photo URL from either the user data or the post data
    const photoURL = post.user?.photoURL || post.authorPhotoURL || '';
    
    // Return the enriched post with the user data
    const enrichedPost: T & EnrichedBlogPost = {
      ...rest,
      // Ensure author and authorPhotoURL are set from user data if available
      author: userData.displayName || post.author || 'Anonymous',
      // Make sure to use the photoURL from user data if available
      authorPhotoURL: photoURL,
      // Include the full user data
      user: userData,
      // Keep the unsubscribe function
      _userUnsubscribe
    };
    
    return enrichedPost as T & EnrichedBlogPost;
  });
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
    
    // Process each post to check if the author is admin
    let posts: Array<BlogPost & { user?: any }> = [];
    
    for (const postDoc of querySnapshot.docs) {
      const data = postDoc.data();
      let isAdminPost = false;
      
      // Check if this is the admin's post by user ID or email
      if (data.authorId) {
        try {
          // Direct check for known admin user ID
          if (data.authorId === 'ksHyBhNWEdUUIizl2qs42KwoR3D2') {
            isAdminPost = true;
          } else {
            // Fallback to email check
            const authorDoc = await getDoc(doc(db, 'users', data.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data() as { email?: string };
              isAdminPost = authorData?.email === adminEmail;
            }
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
