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
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { getUserData } from './userUtils';

export interface UserUpdates {
  displayName?: string;
  photoURL?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string | null;
  createdAt: any;
  updatedAt?: any;
  slug?: string;
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  isAdmin?: boolean;
  tags?: string[];
  user?: {
    displayName?: string;
    photoURL?: string | null;
  };
}

interface UserBasicInfo {
  displayName?: string;
  photoURL?: string | null;
}

/**
 * Enrich blog posts with user data
 * @param posts - Array of blog posts to enrich
 * @returns Array of blog posts with user data
 */
export const enrichBlogPosts = async <T extends { authorId: string }>(
  posts: T[]
): Promise<Array<T & { user?: UserBasicInfo | null }>> => {
  if (!posts.length) return [];
  
  try {
    // Get unique user IDs
    const userIds = [...new Set(posts.map(post => post.authorId))];
    
    // Fetch all user data in parallel
    const userPromises = userIds.map(userId => 
      getUserData(userId).catch(error => {
        console.error(`Error fetching user data for ${userId}:`, error);
        return null;
      })
    );
    
    const userDataArray = await Promise.all(userPromises);
    
    // Create a map of user data
    const userDataMap = userIds.reduce<Record<string, UserBasicInfo>>((acc, userId, index) => {
      const userData = userDataArray[index];
      if (userData) {
        acc[userId] = {
          displayName: userData.displayName || undefined,
          photoURL: userData.photoURL || null
        };
      }
      return acc;
    }, {});
    
    // Enrich posts with user data
    return posts.map(post => ({
      ...post,
      user: userDataMap[post.authorId] || null
    }));
  } catch (error) {
    console.error('Error in enrichBlogPosts:', error);
    return posts.map(post => ({
      ...post,
      user: null
    }));
  }
};

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
/**
 * Subscribe to real-time updates for blog posts
 * @param callback - Function to call when posts are updated
 * @param options - Options for filtering
 * @returns Unsubscribe function
 */
export const subscribeToBlogPosts = (
  callback: (posts: Array<BlogPost & { user?: any }>) => void,
  options: { publishedOnly?: boolean } = { publishedOnly: true }
) => {
  try {
    // Create base query
    let q = query(collection(db, 'blogPosts'));
    
    // Add published filter if needed
    if (options.publishedOnly) {
      q = query(q, where('published', '==', true));
    }
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, 
      async (snapshot: QuerySnapshot) => {
        const postsPromises = snapshot.docs.map(async (doc: DocumentSnapshot) => {
          const data = doc.data() as Omit<BlogPost, 'id'> | undefined;
          if (!data) return null;
          
          let user = null;
          
          try {
            user = await getUserData(data.authorId);
          } catch (error) {
            console.error(`Error fetching user data for author ${data.authorId}:`, error);
          }
          
          return {
            ...data,
            id: doc.id,
            user: user ? {
              displayName: user.displayName,
              photoURL: user.photoURL
            } : undefined
          } as BlogPost;
        });
        
        const posts = (await Promise.all(postsPromises)).filter(Boolean) as BlogPost[];
        callback(posts);
      }, 
      (error: Error) => {
        console.error('Error subscribing to blog posts:', error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up blog posts subscription:', error);
    // Return a no-op function if there's an error
    return () => {};
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
    const enrichedPosts = await enrichBlogPosts(posts);
    return enrichedPosts.map(post => ({
      ...post,
      author: post.user?.displayName || post.author || 'Anonymous',
      authorPhotoURL: post.user?.photoURL || post.authorPhotoURL || ''
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};
