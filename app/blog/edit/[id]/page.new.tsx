'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogPostById } from '@/lib/blog';
import { toast } from 'sonner';
import BlogPostForm from '@/components/BlogPostForm';

function EditPostWithForm({ postId }: { postId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await getBlogPostById(postId);
        if (post) {
          // Check if current user is the author
          if (user?.uid !== post.authorId) {
            toast.error('You do not have permission to edit this post');
            router.push('/blog');
            return;
          }
          
          setInitialData({
            title: post.title,
            content: post.content,
            coverImage: post.coverImage,
            // Add other fields as needed
          });
        } else {
          toast.error('Post not found');
          router.push('/blog');
        }
      } catch (error) {
        console.error('Error loading post:', error);
        toast.error('Failed to load post');
        router.push('/blog');
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, user?.uid, router]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement update logic
      // await updateBlogPost(postId, data, user?.uid);
      toast.success('Post updated successfully');
      router.push(`/blog/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <BlogPostForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </div>
  );
}

export default function EditBlogPost() {
  const params = useParams<{ id: string }>();
  const postId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  if (!postId) {
    return <div>Error: Post ID is missing</div>;
  }
  
  return <EditPostWithForm postId={postId} />;
}
