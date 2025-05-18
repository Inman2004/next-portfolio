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
  Timestamp 
} from 'firebase/firestore';
import { BlogPost } from '@/types/blog';

const BLOG_POSTS_COLLECTION = 'blog-posts';

export async function getBlogPosts() {
  const q = query(
    collection(db, BLOG_POSTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore Timestamp to Date
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as BlogPost[];
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const docRef = doc(db, BLOG_POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    // Convert Firestore Timestamp to Date
    createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate()
  } as BlogPost;
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
