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
import { getBlogPostById as getBlogPost } from '@/lib/blog'; // Now using the client-side API wrapper
import { SocialLinks } from '@/components/blog/SocialLinks';
import BlogMobileBar from '@/components/blog/BlogMobileBar';
import ViewCountHandler from '@/components/blog/ViewCountHandler';
import { canAccessMemberContent, getCreatorProfile } from '@/lib/membership';
import MemberOnlyContent from '@/components/membership/MemberOnlyContent';
import BlogSubscription from '@/components/membership/BlogSubscription';
import { auth } from '@/lib/auth';

export const revalidate = 60;

interface PostPageProps {
  params: {
    id: string;
  };
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
  const { id } = params;
  const { post, creatorProfile, canAccess } = await getPageData(id);

  if (!post) {
    notFound();
  }

  // The `views` property is now directly on the post object from the API
  const views = post.views || 0;
  const createdAtDate = new Date(post.createdAt);
  const formattedDate = !isNaN(createdAtDate.getTime())
    ? format(createdAtDate, 'MMMM d, yyyy')
    : 'Unknown date';

  const readTime = post.readingTime || '5 min read';

  // The `author` object is now consistently enriched by the backend.
  const author = post.author || { name: 'Anonymous' };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
      </div>
    </div>
  );
}