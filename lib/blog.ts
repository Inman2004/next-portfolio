import { BlogPost } from '@/types/blog';
import { BlogPostFormValues } from './schemas/blog';

// Note: All functions in this file now act as API wrappers.
// This centralizes data fetching and mutations through our secure API routes.

async function fetcher(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(errorData.message);
  }
  return response.json();
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const data = await fetcher('/api/blog');
  return data.posts;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!id) return null;
  try {
    return await fetcher(`/api/blog/${id}`);
  } catch (error) {
    console.error(`Error fetching blog post by ID ${id}:`, error);
    return null;
  }
}

export async function createBlogPost(postData: BlogPostFormValues): Promise<BlogPost> {
  return fetcher('/api/blog', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function updateBlogPost(id: string, postData: Partial<BlogPostFormValues>): Promise<void> {
  await fetcher(`/api/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(postData),
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await fetcher(`/api/blog/${id}`, {
    method: 'DELETE',
  });
}