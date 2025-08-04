'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogPostById, updateBlogPost } from '@/lib/blog';
import { BlogPost } from '@/types/blog';
import { blogPostSchema, BlogPostFormValues } from '@/lib/schemas/blog';
import { toast } from 'sonner';
import BlogPostForm from '@/components/blog/BlogPostForm';
import { MarkdownEditorProvider } from '@/components/blog/MarkdownEditorContext';

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

  const handleSubmit = async (formData: BlogPostFormValues) => {
    if (!user) {
      toast.error('You must be logged in to update a post');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format tags if they exist
      const tags = formData.tags && typeof formData.tags === 'string' 
        ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : Array.isArray(formData.tags) 
          ? formData.tags.filter(Boolean)
          : [];
      
      // Create update data with only the fields that can be updated
      const updateData: Partial<BlogPost> = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || '',
        coverImage: formData.coverImage || null,
        published: formData.published ?? true,
        tags: tags,
        updatedAt: new Date(),
        slug: formData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
        readingTime: Math.ceil((formData.content || '').split(/\s+/).length / 200) + ' min read'
      };

      // Call the update function with the typed data
      await updateBlogPost(postId, updateData);
      
      toast.success('Post updated successfully');
      router.push(`/blog/${postId}`);
      router.refresh(); // Refresh the page to show the updated post
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
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
  
  // Ensure initialData has all required fields with defaults
  // Prepare initial form data with proper types
  const formInitialData: BlogPostFormValues = {
    title: initialData.title || '',
    content: initialData.content || '',
    excerpt: initialData.excerpt || '',
    coverImage: initialData.coverImage || null,
    published: initialData.published ?? true,
    tags: Array.isArray(initialData.tags) 
      ? initialData.tags.join(', ')
      : typeof initialData.tags === 'string'
        ? initialData.tags
        : ''
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl  text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-blue-500 dark:to-teal-400 font-bold mb-6">Edit Post</h1>
      {initialData ? (
        <MarkdownEditorProvider>
          <BlogPostForm 
            initialData={formInitialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        </MarkdownEditorProvider>
      ) : (
        <div>Loading...</div>
      )}
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
