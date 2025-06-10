
'use server';

import { deleteDoc, doc, getDoc, getFirestore, runTransaction } from 'firebase/firestore';
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
    
    try {
      // Start a transaction to ensure atomic deletion of post and its view count
      await runTransaction(db, async (transaction) => {
        // Verify the post still exists and user is still authorized
        const freshPost = await transaction.get(postRef);
        if (!freshPost.exists()) {
          throw new Error('Post not found');
        }
        
        // Delete the post document
        transaction.delete(postRef);
        
        // Delete the view count document
        const viewRef = doc(db, 'post_views', postId);
        transaction.delete(viewRef);
      });
      
      // Only delete the image if the current user is the author or an admin
      // Do this outside the transaction since it's an external service
      if (postData.coverImage && (isAuthor || isUserAdmin)) {
        try {
          await deleteImageFromCloudinary(postData.coverImage);
        } catch (error) {
          console.warn('Failed to delete image from Cloudinary:', error);
          // Continue even if image deletion fails
        }
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
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}
