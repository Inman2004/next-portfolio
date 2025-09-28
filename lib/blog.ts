import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
} from 'firebase/firestore';
import { BlogPost } from '@/types/blog';
import { BlogPostFormValues } from './schemas/blog';

const BLOG_POSTS_COLLECTION = 'blogPosts';

// Keep client-side reads for now, though they could also be replaced by API calls
// for full data consistency.
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts: BlogPost[] = querySnapshot.docs.map(postDoc => {
      const data = postDoc.data();
      return {
        id: postDoc.id,
        ...data
      } as BlogPost;
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    if (!id) {
      throw new Error('Post ID is required');
    }

    const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data
    } as BlogPost;
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === REFACTORED WRITE OPERATIONS ===

export async function createBlogPost(postData: BlogPostFormValues): Promise<BlogPost> {
  try {
    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create post' }));
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createBlogPost:', error);
    throw error;
  }
}

export async function updateBlogPost(id: string, postData: Partial<BlogPostFormValues>): Promise<void> {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update post' }));
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.error(`Error updating blog post ${id}:`, error);
    throw error;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete post' }));
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}