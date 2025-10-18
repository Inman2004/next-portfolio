'use client';

import { useParams } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/types/blog';

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/blog/${postId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch blog post');
          }
          const data = await response.json();
          setPost(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogEditor initialData={post} />
    </div>
  );
}