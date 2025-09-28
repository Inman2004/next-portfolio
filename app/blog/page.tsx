import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import BlogListClient from '@/components/blog/BlogListClient';
import { getBlogPosts } from '@/lib/blogUtils';
import { getViewCounts } from '@/lib/views';
import FeaturedPosts from '@/components/blog/FeaturedPosts';
 

// Revalidate the page every 60 seconds
export const revalidate = 60;

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface AuthorAvatarProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
  lazy?: boolean;
  className?: string;
}

const AuthorAvatar = ({
  src,
  alt,
  priority = false,
  lazy = true,
  className = ''
}: AuthorAvatarProps) => (
  <div className={cn("w-10 h-10 rounded-full mx-right my-auto flex items-center justify-center text-zinc-400 dark:text-zinc-500", className)}>
    <Image
      src={src || '/placeholder.png'}
      alt={alt}
      width={40}
      height={40}
      sizes="(max-width: 768px) 40px, 40px"
      className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-full"
      priority={priority}
      loading={lazy ? 'lazy' : undefined}
    />
  </div>
);

interface PostTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PostTitle = ({
  children,
  className = ''
}: PostTitleProps) => (
  <div className="p-6 flex-1 flex flex-col">
    <p className={cn(
      "text-xl font-thin bg-clip-text text-transparent bg-gradient-to-r from-zinc-900/50 to-zinc-700/50 dark:from-indigo-400/50 dark:to-violet-400/50 mb-3 line-clamp-2",
      "group-hover:text-white dark:group-hover:text-zinc-400 transition-colors",
      className
    )}>
      {children}
    </p>
  </div>
);

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; perPage?: string };
}) {
  // Get posts without network calls during prerender
  let posts = await getBlogPosts({ publishedOnly: true });
  // Attach view counts, but don't fail build if unavailable
  try {
    const ids = posts.map((p: any) => p.id).filter(Boolean);
    const counts = await getViewCounts(ids);
    posts = posts.map((p: any) => ({ ...p, views: counts[p.id] || 0 }));
  } catch {
    // ignore view count errors at build time
  }
  
  // Parse pagination parameters from URL
  const currentPage = parseInt(searchParams?.page ?? '1', 10);
  const postsPerPage = parseInt(searchParams?.perPage ?? '9', 10);
  
  // Normalize dates safely for client list
  const toIsoStringSafe = (value: any): string => {
    try {
      if (!value) return new Date().toISOString();
      if (typeof value?.toDate === 'function') {
        const d = value.toDate();
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
      }
      if (typeof value === 'string') {
        const t = Date.parse(value);
        return isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
      }
      if (typeof value === 'number') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const normalizedPosts = posts.map((p: any) => ({
    ...p,
    createdAt: toIsoStringSafe(p.createdAt),
    updatedAt: toIsoStringSafe(p.updatedAt ?? p.createdAt),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[url('/images/ui/blog-hero.png')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700 py-4 mb-6">
              Blog & Insights
              </h1>
            <p className="text-xl text-zinc-900 max-w-3xl mx-auto">
              Explore my thoughts on technology, development, and the latest trends in the digital world.
            </p>
          </div>
        </div>
            </div>

      {/* Blog Posts controls and grid (client) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="mb-6">
        <FeaturedPosts posts={normalizedPosts} />
        </div>
        <BlogListClient 
          posts={normalizedPosts} 
          initialPage={currentPage}
          initialPostsPerPage={postsPerPage}
        />
        </div>
    </div>
  );
}
