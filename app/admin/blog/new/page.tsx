'use client';

import { BlogEditor } from '@/components/admin/BlogEditor';

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <BlogEditor />
    </div>
  );
}
