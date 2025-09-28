'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { getBlogPostClient } from '@/lib/client/blog';
import { BlogPost } from '@/types/blog';
import { Loader2 } from 'lucide-react';

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      getBlogPostClient(postId)
        .then((data) => {
          setPost(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch blog post', error);
          setLoading(false);
        });
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <div>Blog post not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogEditor initialData={post} />
    </div>
  );
}
