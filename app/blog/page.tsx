import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import BlogListClient from '@/components/blog/BlogListClient';
import { getBlogPosts } from '@/lib/blogUtils';
import { getViewCounts } from '@/lib/views';
 

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
  <div className={cn("w-10 h-10 rounded-full mx-right my-auto flex items-center justify-center text-gray-400 dark:text-gray-500", className)}>
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
      "text-xl font-thin bg-clip-text text-transparent bg-gradient-to-r from-gray-900/50 to-gray-700/50 dark:from-indigo-400/50 dark:to-violet-400/50 mb-3 line-clamp-2",
      "group-hover:text-white dark:group-hover:text-gray-400 transition-colors",
      className
    )}>
      {children}
    </p>
  </div>
);

export default async function BlogPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Blog & Insights
              </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore my thoughts on technology, development, and the latest trends in the digital world.
            </p>
          </div>
        </div>
            </div>

      {/* Blog Posts controls and grid (client) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <BlogListClient posts={normalizedPosts} />
        </div>
    </div>
  );
}
