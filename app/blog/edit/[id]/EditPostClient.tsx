'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BlogPostFormValues } from '@/lib/schemas/blog';
import { updateBlogPost } from '@/lib/blog';
import BlogPostForm from '@/components/blog/BlogPostForm';
import { MarkdownEditorProvider } from '@/components/blog/MarkdownEditorContext';
import { BlogPost } from '@/types/blog';

interface EditPostClientProps {
  post: BlogPost;
}

export default function EditPostClient({ post }: EditPostClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BlogPostFormValues) => {
    setIsSubmitting(true);
    try {
      await updateBlogPost(post.id, data);
      toast.success('Post updated successfully');
      router.push(`/blog/${post.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare initial data for the form, ensuring tags are always an array.
  const initialData = {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-emerald-500 dark:to-emerald-400 font-bold mb-6">
        Edit Post
      </h1>
      <MarkdownEditorProvider>
        <BlogPostForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      </MarkdownEditorProvider>
    </div>
  );
}