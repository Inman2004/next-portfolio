'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BlogPostForm from '@/components/BlogPostForm';
import { MarkdownEditorProvider } from '@/components/MarkdownEditorContext';
import { createBlogPost } from '@/lib/blog';

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
      
      if (!data.title) {
        throw new Error('Title is required');
      }

      if (!data.content) {
        throw new Error('Content is required');
      }

      // Format tags if they exist
      const tags = data.tags && typeof data.tags === 'string' 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : Array.isArray(data.tags) 
          ? data.tags.filter(Boolean)
          : [];
      
      // Generate a slug from the title
      const slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      if (!slug) {
        throw new Error('Could not generate a valid slug from the title');
      }
      
      // Get user info with fallbacks
      const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      const userEmail = user.email || '';
      
      // Create the blog post
      await createBlogPost({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || null,
        published: true,
        author: userName, // Legacy field
        authorId: user.uid,
        authorName: userName,
        authorUsername: user.username || userEmail.split('@')[0] || 'user',
        authorPhotoURL: user.photoURL || null,
        tags: tags,
        slug: slug,
        readingTime: Math.ceil(data.content.split(/\s+/).length / 200) + ' min read',
        viewCount: 0,
        isAdmin: user.email === 'rvimman@gmail.com' // Set admin status based on email
      });
      
      toast.success('Post created successfully');
      router.push('/blog');
      router.refresh(); // Refresh the page to show the new post
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl  text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-blue-500 dark:to-teal-400 font-bold mb-6">Create New Post</h1>
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
