import { BlogPost } from '@/types/blog';
import { getServerDocument } from './server-firebase';

type ServerUserData = {
  id: string;
  name: string;
  photoURL?: string;
  twitter?: string;
  [key: string]: any;
};

/**
 * Get a single blog post by ID (server-side only)
 * @param postId - The ID of the blog post to fetch
 * @returns The blog post or null if not found
 */
export const getServerBlogPost = async (postId: string): Promise<BlogPost | null> => {
  try {
    const post = await getServerDocument<BlogPost>('blogPosts', postId);
    return post;
  } catch (error) {
    console.error('Error fetching blog post (server):', error);
    return null;
  }
};

/**
 * Get basic user data (server-side only)
 * @param userId - The ID of the user to fetch
 * @returns Basic user data or null if not found
 */
export const getServerUserData = async (userId: string): Promise<ServerUserData | null> => {
  try {
    const userData = await getServerDocument<Omit<ServerUserData, 'id'>>('users', userId);
    if (!userData) return null;
    return {
      id: userId,
      name: userData.name || 'Anonymous',
      photoURL: userData.photoURL,
      twitter: userData.twitter,
    };
  } catch (error) {
    console.error('Error fetching user data (server):', error);
    return null;
  }
};
