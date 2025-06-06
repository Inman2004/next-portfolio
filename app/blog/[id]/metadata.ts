import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const postRef = doc(db, 'blogPosts', params.id);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const postData = postDoc.data();
  
  return {
    title: postData.title || 'Blog Post',
    description: postData.content?.substring(0, 150) || 'Read the full blog post',
  };
}
