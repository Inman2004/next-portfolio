import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { formatNumber } from '@/lib/formatNumber';
import MarkdownViewer from '@/components/blog/MarkdownViewer';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Eye, Calendar, User as UserIcon, Clock } from 'lucide-react';
import BlogPostActions from '@/components/blog/BlogPostActions';
import BlogFloatingBar from '@/components/blog/BlogFloatingBar';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { getBlogPost } from '@/lib/blogUtils';
import { getViewCount } from '@/lib/views';
import { SocialLinks } from '@/components/blog/SocialLinks';
import BlogMobileBar from '@/components/blog/BlogMobileBar';
import ViewCountHandler from '@/components/blog/ViewCountHandler';
import ReadingProgressTracker from '@/components/blog/ReadingProgressTracker';
import { canAccessMemberContent, getCreatorProfile } from '@/lib/membership';
import MemberOnlyContent from '@/components/membership/MemberOnlyContent';
import BlogSubscription from '@/components/membership/BlogSubscription';
import { auth } from '@/lib/auth';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { getRelatedPosts } from '@/lib/blogUtils';

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

// This function will fetch all data needed for the page using our new API wrappers
async function getPageData(id: string) {
  // The new getBlogPost now fetches from our API, which includes the view count.
  const post = await getBlogPost(id);
  if (!post) return { post: null, creatorProfile: null, canAccess: false };

  let creatorProfile = null;
  let canAccess = false;

  if (post.isMembersOnly) {
    try {
      const session = await auth();
      if (session?.user) {
        canAccess = await canAccessMemberContent(session.user.id, post.authorId);
      }
      creatorProfile = await getCreatorProfile(post.authorId);
    } catch (error) {
      console.error('Error checking member access:', error);
    }
  }
  return { post, creatorProfile, canAccess };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const { post, creatorProfile, canAccess } = await getPageData(id);

  if (!post) {
    notFound();
  }

  // The `views` property is now directly on the post object from the API
  let views = 0;
  try {
    views = await getViewCount(id);
  } catch {
    views = 0;
  }
  // Robust date parsing for Firestore Timestamp | Date | string
  const asDate = (val: any): Date => {
    try {
      if (!val) return new Date(NaN);
      if (typeof val?.toDate === 'function') return val.toDate();
      if (val instanceof Date) return val;
      if (typeof val === 'string' || typeof val === 'number') return new Date(val);
      return new Date(NaN);
    } catch {
      return new Date(NaN);
    }
  };

  const createdAtDate = asDate((post as any).createdAt);
  const updatedAtDate = asDate((post as any).updatedAt ?? (post as any).createdAt);
  const formattedDate = !isNaN(createdAtDate.getTime()) ? format(createdAtDate, 'MMMM d, yyyy') : 'Unknown date';
  const formattedUpdated = !isNaN(updatedAtDate.getTime()) ? format(updatedAtDate, 'MMMM d, yyyy') : null;

  const readTime = post.readingTime || '5 min read';

  // Normalize author to an object (post.author can be string or object)
  const author = ((): { name: string; photoURL?: string; socials?: Record<string, string>; bio?: string } => {
    if (post && typeof (post as any).author === 'object' && (post as any).author) {
      const a = (post as any).author as { name?: string; photoURL?: string; socials?: Record<string, string>; bio?: string };
      return {
        name: a.name || 'Anonymous',
        photoURL: a.photoURL ?? (post as any).authorPhotoURL,
        socials: a.socials,
        bio: a.bio,
      };
    }
    if (typeof (post as any).author === 'string') {
      return {
        name: (post as any).author as string,
        photoURL: (post as any).authorPhotoURL,
      };
    }
    return { name: 'Anonymous', photoURL: (post as any).authorPhotoURL };
  })();

  // Compute related posts on the server
  const related = await getRelatedPosts(id, {
    tags: Array.isArray((post as any).tags) ? (post as any).tags : [],
    authorId: (post as any).authorId,
    limit: 6,
  });

  // Serialize dates for client component props (avoid Firestore Timestamp objects)
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

  const relatedForClient = related.map((p: any) => ({
    ...p,
    createdAt: toIsoStringSafe(p.createdAt),
    updatedAt: toIsoStringSafe(p.updatedAt ?? p.createdAt),
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Track reading progress client-side for Continue Reading */}
      <ReadingProgressTracker postId={id} contentSelector=".prose" />
      <ViewCountHandler postId={id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: { '@type': 'Person', name: author.name },
            image: post.coverImage ? [post.coverImage] : undefined,
            description: post.excerpt || undefined,
          }),
        }}
      />
      <BlogMobileBar
        postId={id}
        authorId={post.authorId}
        initialPublished={post.published}
        shareUrl={`/blog/${id}`}
        shareTitle={post.title}
        shareDescription={post.excerpt || ''}
      />
      <div className="hidden lg:block fixed top-4 right-4 z-40">
        <BlogFloatingBar
          postId={id}
          shareUrl={`/blog/${id}`}
          shareTitle={post.title}
          shareDescription={post.excerpt || ''}
          authorId={post.authorId}
          initialPublished={post.published}
        />
      </div>
      <div className="mb-6 sm:mb-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-4">
          <span className="mr-2">←</span> Back to Blog
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400 font-bold mb-3 sm:mb-4 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 mb-5 sm:mb-6">
          <div className="flex items-center text-zinc-900 dark:text-zinc-400 mr-4">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>{author.name}</span>
          </div>
          <div className="flex items-center mr-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {formattedDate}
              {formattedUpdated && formattedUpdated !== formattedDate && (
                <span className="text-zinc-500 dark:text-zinc-400"> • Updated {formattedUpdated}</span>
              )}
            </span>
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
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
          <div className="prose max-w-none min-w-0 prose-img:rounded-xl prose-headings:scroll-mt-28">
            <MemberOnlyContent
              isMembersOnly={post.isMembersOnly || false}
              membershipTier={post.membershipTier}
              previewContent={post.previewContent}
              fullContent={post.content}
              creatorId={post.authorId}
              creatorName={author.name}
              membershipTiers={creatorProfile?.membershipTiers || []}
              canAccess={canAccess}
            />
          </div>
          <div className="hidden lg:block w-[320px] min-w-0 space-y-4">
            <BlogSubscription blogId={id} creatorName={author.name} />
            {author.socials && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-wrap gap-3 justify-start items-center">
                  <UserAvatar photoURL={author.photoURL} displayName={author.name} size={40} className="h-10 w-10" /> 
                  <SocialLinks socials={author.socials} authorName={author.name} className="justify-start" />
                </div>
              </div>
            )}
            <TableOfContents content={post.content} />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {author.photoURL && (
                <div className="mr-3">
                  <UserAvatar photoURL={author.photoURL} displayName={author.name} size={40} className="h-10 w-10" />
                </div>
              )}
              <div>
                <p className="font-medium">{author.name}</p>
                {author.bio && <p className="text-sm text-zinc-600">{author.bio}</p>}
              </div>
            </div>
            <BlogPostActions postId={id} authorId={post.authorId} initialPublished={post.published} />
          </div>
        </div>

        {/* Related posts */}
        <RelatedPosts posts={relatedForClient} currentPostId={id} className="mt-12" />
      </div>
    </div>
  );
}