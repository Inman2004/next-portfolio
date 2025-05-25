import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { BlogPost } from '@/types/blog';
import { auth } from './firebase';

const BLOG_POSTS_COLLECTION = 'blogPosts';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'rvimman@gmail.com';
    const posts: BlogPost[] = [];
    
    // Process each post to check if the author is admin
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
        title: data.title || '',
        content: data.content || '',
        author: data.author || '',
        authorId: data.authorId || '',
        authorPhotoURL: data.authorPhotoURL || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        published: data.published ?? true,
        isAdmin: isAdminPost
      };
      
      posts.push(post);
    }
    
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
    const post: BlogPost = {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      author: data.author,
      authorId: data.authorId,
      authorPhotoURL: data.authorPhotoURL,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      slug: data.slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      published: data.published ?? true,
      isAdmin: false // Default to false
    };

    // If authorId exists, check if it's an admin
    if (post.authorId) {
      const userDoc = await getDoc(doc(db, 'users', post.authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        post.isAdmin = userData?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      }
    }

    return post;
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  console.log('createBlogPost called with data:', { 
    ...postData, 
    content: postData.content ? `${postData.content.substring(0, 30)}...` : 'empty' 
  });
  
  try {
    console.log('Initializing Firestore collection...');
    const postsCollection = collection(db, BLOG_POSTS_COLLECTION);
    console.log('Collection initialized:', postsCollection);
    
    const postWithTimestamps = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    console.log('Attempting to add document with data:', {
      ...postWithTimestamps,
      content: postWithTimestamps.content ? `${postWithTimestamps.content.substring(0, 30)}...` : 'empty'
    });
    
    const docRef = await addDoc(postsCollection, postWithTimestamps);
    console.log('Document created with ID:', docRef.id);
    
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error in createBlogPost:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code,
      status: (error as any)?.status
    });
    throw new Error(`Failed to create blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBlogPost(
  id: string, 
  postData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
): Promise<void> {
  if (!id) {
    throw new Error('Post ID is required for update');
  }

  const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
  
  // Only include fields that are defined in the update
  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  // Add only the fields that are defined in postData
  Object.entries(postData).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value;
    }
  });

  await updateDoc(docRef, updateData);
}

export async function deleteBlogPost(id: string) {
  try {
    if (!id) {
      throw new Error('Post ID is required for deletion');
    }

    // Get the post document to get the cover image URL
    const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const data = docSnap.data();
    const coverImage = data?.coverImage;

    // Delete the cover image from Cloud Storage if it exists
    if (coverImage) {
      const storageRef = ref(storage, coverImage);
      try {
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting cover image:', error);
        // Don't throw error if image deletion fails - continue with post deletion
      }
    }

    // Delete the blog post document
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw new Error(`Failed to delete blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
