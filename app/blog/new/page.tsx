'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { BlogPost } from '@/types/blog';
import { db, app } from '@/lib/firebase';
import { toast } from 'sonner';
import BlogPostForm from '@/components/BlogPostForm';

const NewBlogPostPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle both NextAuth and Firebase auth
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if ((!session && !firebaseUser) && !isLoading) {
      router.push('/signin?callbackUrl=' + encodeURIComponent('/blog/new'));
    }
  }, [session, firebaseUser, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will be redirected by useEffect)
  if (!session && !firebaseUser) {
    return null;
  }

  // Get the current user (either from NextAuth or Firebase)
  const currentUser = session?.user || firebaseUser;
  
  if (!currentUser) {
    return null; // Should be handled by the redirect above, but just in case
  }

  const handleSubmit = async (postData: any) => {
    console.log('=== Starting post creation ===');
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('No user found');
      toast.error('You must be logged in to create a post');
      return;
    }

    try {
      console.log('Setting isSubmitting to true');
      setIsSubmitting(true);
      
      // Parse tags from string to array
      const tags = postData.tags 
        ? postData.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [];

      console.log('Parsed tags:', tags);

      // Create a clean post data object with all required fields
      const newPost: Omit<BlogPost, 'id'> = {
        title: postData.title || 'Untitled Post',
        content: postData.content || '',
        excerpt: postData.excerpt || '',
        coverImage: postData.coverImage || null,
        author: currentUser.displayName || currentUser.name || 'Anonymous',
        authorId: currentUser.uid || currentUser.id || 'anonymous',
        authorPhotoURL: currentUser.photoURL || currentUser.image || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        published: postData.published ?? true,
        tags: tags,
        slug: postData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      };

      console.log('Post data prepared:', newPost);
      
      console.log('Attempting to save to Firestore...');
      const blogPostsRef = collection(db, 'blogPosts');
      console.log('Collection reference created');
      
      const docRef = await addDoc(blogPostsRef, newPost);
      console.log('Post created with ID:', docRef.id);
      
      toast.success('Post created successfully!');
      console.log('Navigating to post page...');
      router.push(`/blog/${docRef.id}`);
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
      console.log('=== Post creation completed ===');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full">
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-gray-400">Share your thoughts and ideas with the world</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <BlogPostForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default NewBlogPostPage;
