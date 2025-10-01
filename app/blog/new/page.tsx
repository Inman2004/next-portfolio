'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BlogPostForm from '@/components/blog/BlogPostForm';
import { MarkdownEditorProvider } from '@/components/blog/MarkdownEditorContext';
import { createBlogPost } from '@/lib/blog';
import { BlogPostFormInput } from '@/lib/schemas/blog';

export default function NewBlogPostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (formData: BlogPostFormInput) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      router.push('/signin?callbackUrl=/blog/new');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data for the API
      const postData = {
        ...formData,
        // Ensure we're not sending null for optional fields
        coverImage: formData.coverImage || null,
        tags: formData.tags || [],
        published: formData.published ?? true,
        viewCount: 0, // Initialize view count
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorPhotoURL: user.photoURL || null,
      };

      // The createBlogPost function will handle the API call
      await createBlogPost(postData);
      toast.success('Post created successfully');

      // Navigate to the blog index as the new post will appear at the top.
      router.push(`/blog`);
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      toast.error(errorMessage);
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container bg-white dark:bg-zinc-950 mx-auto px-4 py-8 max-w-4xl">
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