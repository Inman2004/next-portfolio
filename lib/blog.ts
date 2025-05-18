import { db } from './firebase';
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
import { BlogPost } from '@/types/blog';

const BLOG_POSTS_COLLECTION = 'blog-posts';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
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
        published: data.published ?? true
      } as BlogPost;
    });
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
      published: data.published ?? true
    } as BlogPost;
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

export async function updateBlogPost(id: string, postData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'authorId'>>) {
  const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
  
  await updateDoc(docRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogPost(id: string) {
  const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
  await deleteDoc(docRef);
}
