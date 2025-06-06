
'use server';

import { deleteDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { revalidatePath } from 'next/cache';
import { deleteImageFromCloudinary } from '@/utils/cloudinary';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export async function deleteBlogPost(postId: string, currentUserId?: string) {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  try {
    // Ensure Firestore is properly initialized
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Verify user is authenticated
    if (!currentUserId) {
      throw new Error('You must be logged in to delete posts');
    }

    // Get the post data first to verify ownership
    const postRef = doc(db, 'blogPosts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = postSnap.data();
    
    // Verify the user is the author or an admin
    const isAuthor = postData.authorId === currentUserId;
    const isUserAdmin = postData.isAdmin === true;
    
    if (!isAuthor && !isUserAdmin) {
      throw new Error('You are not authorized to delete this post');
    }
    
    // Only delete the image if the current user is the author or an admin
    if (postData.coverImage && (isAuthor || isUserAdmin)) {
      try {
        await deleteImageFromCloudinary(postData.coverImage);
      } catch (error) {
        console.warn('Failed to delete image from Cloudinary:', error);
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete the post from Firestore
    await deleteDoc(postRef);
    
    // Delete the post's view count
    try {
      const viewRef = doc(getgetgetDb, 'post_views', postId);
      await deleteDoc(viewRef);
    } catch (error) {
      console.warn('Failed to delete view count:', error);
      // Continue even if view count deletion fails
    }
    
    revalidatePath('/blog');
    revalidatePath(`/blog/${postId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete post' 
    };
  }
}
