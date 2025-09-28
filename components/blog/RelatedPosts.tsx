"use client";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
  currentPostId: string;
  className?: string;
}

function PostCard({ post, fromId }: { post: BlogPost; fromId: string }) {
  const createdAt = (post as any).createdAt?.toDate
    ? (post as any).createdAt.toDate()
    : new Date((post as any).createdAt || 0);

  return (
    <Link
      href={`/blog/${post.id}`}
      onClick={() => {
        try {
          const url = '/api/analytics/related-click';
          const payload = JSON.stringify({ fromPostId: fromId, toPostId: post.id, ts: Date.now() });
          if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
          } else {
            // Fire and forget
            fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
          }
        } catch {}
      }}
      className={cn(
        'group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40',
        'hover:shadow-md transition-shadow overflow-hidden'
      )}
    >
      {post.coverImage ? (
        <div className="relative h-36 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}
      <div className="p-4">
        <h4 className="text-sm font-semibold line-clamp-2 text-zinc-900 dark:text-zinc-100">
          {post.title}
        </h4>
        {post.excerpt ? (
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {post.excerpt}
          </p>
        ) : null}
        <p className="mt-2 text-[11px] text-zinc-500">
          {isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

export default function RelatedPosts({ posts, currentPostId, className }: RelatedPostsProps) {
  if (!posts?.length) return null;
  return (
    <section className={cn('mt-12', className)}>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        You might also like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} fromId={currentPostId} />
        ))}
      </div>
    </section>
  );
}
