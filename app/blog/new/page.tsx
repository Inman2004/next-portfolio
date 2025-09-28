'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BlogPostForm from '@/components/blog/BlogPostForm';
import { MarkdownEditorProvider } from '@/components/blog/MarkdownEditorContext';
import { createBlogPost } from '@/lib/blog';
import { BlogPostFormValues } from '@/lib/schemas/blog';

export default function NewBlogPostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (data: BlogPostFormValues) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      router.push('/signin?callbackUrl=/blog/new');
      return;
    }

    setIsSubmitting(true);
    try {
      // The new createBlogPost function now correctly calls our secure API
      const newPost = await createBlogPost(data);
      toast.success('Post created successfully');

      // Navigate to the blog index as the new post will appear at the top.
      router.push(`/blog`);
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-blue-500 dark:to-blue-400 font-bold mb-6">
        Create New Post
      </h1>
      <MarkdownEditorProvider>
        <BlogPostForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={false}
        />
      </MarkdownEditorProvider>
    </div>
  );
}