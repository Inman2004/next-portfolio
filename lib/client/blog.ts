import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/types/blog';

export const getBlogPostClient = async (id: string): Promise<BlogPost | null> => {
  if (!id) return null;
  try {
    const postDoc = await getDoc(doc(db, 'blogPosts', id));
    if (postDoc.exists()) {
      return { id: postDoc.id, ...postDoc.data() } as BlogPost;
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog post on client:', error);
    return null;
  }
};

export const saveBlogPost = async (post: Partial<BlogPost>) => {
  try {
    if (post.id) {
      // Update existing post
      const postRef = doc(db, 'blogPosts', post.id);
      await updateDoc(postRef, { ...post, updatedAt: serverTimestamp() });
      return post.id;
    } else {
      // Create new post
      const postCollection = collection(db, 'blogPosts');
      const newPost = {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(postCollection, newPost);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving blog post:', error);
    throw error;
  }
};