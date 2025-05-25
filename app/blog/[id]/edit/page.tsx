'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, app } from '@/lib/firebase';
import { toast } from 'sonner';
import BlogPostForm from '@/components/BlogPostForm';
import { BlogPost } from '@/types/blog';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const EditBlogPostPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      
      // Redirect to sign-in if not authenticated
      if (!user) {
        router.push(`/signin?callbackUrl=${encodeURIComponent(`/blog/${id}/edit`)}`);
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  // Fetch the post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postRef = doc(db, 'blogPosts', id as string);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          const postData = postSnap.data() as BlogPost;
          
          // Check if the current user is the author
          if (currentUser && postData.authorId !== currentUser.uid) {
            toast.error('You are not authorized to edit this post');
            router.push(`/blog/${id}`);
            return;
          }
          
          setPost({
            id: postSnap.id,
            ...postData,
          });
        } else {
          toast.error('Post not found');
          router.push('/blog');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load post');
        router.push('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, router, currentUser]);

  const handleSubmit = async (postData: BlogPost) => {
    if (!currentUser || !id) {
      toast.error('You must be logged in to edit a post');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postRef = doc(db, 'blogPosts', id);
      await updateDoc(postRef, {
        ...postData,
        updatedAt: new Date(),
      });
      
      toast.success('Post updated successfully!');
      router.push(`/blog/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Post Not Found</h2>
          <p className="text-gray-400">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/blog')}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full">
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
          <p className="text-gray-400">Update your post content and details</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <BlogPostForm 
            initialData={post}
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditBlogPostPage;
