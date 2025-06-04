'use client';

import { useParams } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';

// Mock function to fetch blog post by ID
async function getBlogPost(id: string) {
  // In a real app, you would fetch this from your API
  return {
    id,
    title: 'Getting Started with Next.js',
    slug: 'getting-started-with-nextjs',
    excerpt: 'Learn how to get started with Next.js and build amazing web applications.',
    content: '# Getting Started with Next.js\n\nNext.js is a React framework that enables server-side rendering and generating static websites.\n\n## Why Next.js?\n\n- **Performance**: Automatic code splitting and optimized production builds.\n- **SEO Friendly**: Server-side rendering out of the box.\n- **Developer Experience**: Hot code reloading and a great development experience.\n\n## Installation\n\n```bash\nnpx create-next-app@latest my-app\ncd my-app\nnpm run dev\n```',
    published: true,
    featuredImage: 'https://example.com/nextjs-cover.jpg',
    tags: ['nextjs', 'react', 'javascript']
  };
}

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // In a real app, you would fetch the blog post data here
  const post = getBlogPost(postId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogEditor initialData={post} />
    </div>
  );
}
