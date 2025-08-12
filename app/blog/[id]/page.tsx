import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { formatNumber } from '@/lib/formatNumber';
import dynamic from 'next/dynamic';
import MarkdownServer from '@/components/blog/MarkdownServer';
import { Button } from "@/components/ui/button";
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Eye, Calendar, User as UserIcon, Clock } from 'lucide-react';
import BlogPostActions from '@/components/blog/BlogPostActions';
import BlogFloatingBar from '@/components/blog/BlogFloatingBar';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { getBlogPost } from '@/lib/blogUtils';
import { getViewCount } from '@/lib/views';
import { SocialLinks } from '@/components/blog/SocialLinks';
import BlogMobileBar from '@/components/blog/BlogMobileBar';

// Revalidate the page every 60 seconds
export const revalidate = 60;

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  // Fetch blog post directly server-side to avoid network in production SSR
  const post = await getBlogPost(id);
  if (!post) {
    notFound();
  }
  // Get view count; do not increment on SSR
  let views = 0;
  try {
    views = await getViewCount(id);
  } catch {
    views = 0;
  }
  
  // Format dates (post.createdAt is now an ISO string from the API)
  const createdAtDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
  const formattedDate = createdAtDate instanceof Date && !isNaN(createdAtDate.getTime())
    ? format(createdAtDate, 'MMMM d, yyyy')
    : 'Unknown date';
    
  const readTime = post.readingTime || '5 min read';
  
  // Ensure author is properly typed
  const author = typeof post.author === 'object' ? post.author : { 
    name: 'Anonymous',
    photoURL: undefined,
    bio: undefined,
    email: undefined
  };

  // Render the blog post content
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* JSON-LD Article schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            datePublished: post.createdAt || formattedDate,
            dateModified: post.updatedAt || post.createdAt || formattedDate,
            author: post.author?.name ? { '@type': 'Person', name: post.author.name } : undefined,
            image: post.coverImage ? [post.coverImage] : undefined,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${id}`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Immanuvel',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/icon.png`,
              },
            },
            description: post.excerpt || undefined,
            articleSection: Array.isArray(post.tags) && post.tags.length ? post.tags[0] : undefined,
            keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
          }),
        }}
      />
      {/* Mobile bottom bar */}
      <BlogMobileBar
        postId={id}
        authorId={post.authorId}
        initialPublished={post.published !== false}
        shareUrl={`/blog/${id}`}
        shareTitle={post.title}
        shareDescription={post.excerpt || ''}
      />
      {/* Floating bar (desktop) */}
      <div className="hidden lg:block fixed top-4 right-4 z-40">
        <BlogFloatingBar
          postId={id}
          shareUrl={`/blog/${id}`}
          shareTitle={post.title}
          shareDescription={post.excerpt || ''}
          authorId={post.authorId}
          initialPublished={post.published !== false}
        />
      </div>
      <div className="mb-6 sm:mb-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <span className="mr-2">←</span> Back to Blog
        </Link>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-5 sm:mb-6">
          <div className="flex items-center mr-4">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>{author.name}</span>
          </div>
          <div className="flex items-center mr-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readTime}</span>
          </div>
          <div className="flex items-center ml-auto">
            <Eye className="h-4 w-4 mr-1" />
            <span>{formatNumber(views)} views</span>
          </div>
        </div>
        
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
          <div className="prose max-w-none min-w-0 prose-img:rounded-xl prose-headings:scroll-mt-28">
            {/* Server-rendered markdown for SEO-first content */}
            <MarkdownServer content={post.content} />
          </div>
          <div className="hidden lg:block w-[320px] min-w-0">
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              {/* Social links (if available on author) */}
              {/* @ts-ignore */}
              {author?.socials ? (
                // @ts-ignore
                <div className="flex flex-wrap gap-3 justify-start items-center">
                  <UserAvatar photoURL={author.photoURL} displayName={author.name} size={40} className="h-10 w-10" /> 
                  {/* We reuse the SocialLinks component if you prefer: */}
                  <SocialLinks socials={author.socials} authorName={author.name} className="justify-start" />
                </div>
                
              ) : null}
            </div>
            <TableOfContents content={post.content} />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {author.photoURL && (
                <div className="mr-3">
                  <UserAvatar
                    photoURL={author.photoURL}
                    displayName={author.name}
                    size={40}
                    className="h-10 w-10"
                  />
                </div>
              )}
              <div>
                <p className="font-medium">{author.name}</p>
                {author.bio && (
                  <p className="text-sm text-gray-600">{author.bio}</p>
                )}
              </div>
            </div>
            
            <BlogPostActions 
              postId={id}
              authorId={post.authorId}
              initialPublished={post.published !== false}
              isAdmin={author.email === 'rvimman@gmail.com'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
