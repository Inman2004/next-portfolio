'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BlogPostForm from '@/components/blog/BlogPostForm';

export default function NewBlogPostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      router.push('/signin?callbackUrl=/blog/new');
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement create post logic
      // await createBlogPost({
      //   ...data,
      //   authorId: user.uid,
      //   authorName: user.displayName || 'Anonymous',
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // });
      
      toast.success('Post created successfully');
      router.push('/blog');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <BlogPostForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </div>
  );
}
