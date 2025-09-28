'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { motion as m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface FeaturedPost {
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string | null;
  slug: string;
  createdAt: string | Date;
  authorName?: string;
  authorPhotoURL?: string | null;
  readingTime?: string;
  tags?: string[];
}
interface FeaturedPostsProps {
  posts: FeaturedPost[];
  className?: string;
}

type ProgressRecord = { percent: number; updatedAt: number };

const FeaturedPosts = ({ posts, className }: FeaturedPostsProps) => {
  const [progressMap, setProgressMap] = useState<Record<string, ProgressRecord>>({});

  // Load reading progress from localStorage for the provided posts
  useEffect(() => {
    try {
      const map: Record<string, ProgressRecord> = {};
      (posts || []).forEach((p) => {
        const raw = localStorage.getItem(`readingProgress:${p.id}`);
        if (!raw) return;
        try {
          const rec = JSON.parse(raw) as ProgressRecord;
          if (rec && typeof rec.percent === 'number') {
            map[p.id] = rec;
          }
        } catch {}
      });
      setProgressMap(map);
    } catch {}
  }, [posts]);

  // Build Continue Reading list: posts with 1-99% progress, sorted by last updated desc
  const continuePosts = useMemo(() => {
    const list = (posts || []).filter((p) => {
      const rec = progressMap[p.id];
      return rec && rec.percent > 0 && rec.percent < 100;
    });
    list.sort((a, b) => (progressMap[b.id]?.updatedAt || 0) - (progressMap[a.id]?.updatedAt || 0));
    return list.slice(0, 3);
  }, [posts, progressMap]);

  // Fallback: newest three if no continue candidates
  const fallbackPosts = useMemo(() => (posts || []).slice(0, 3), [posts]);
  const featuredPosts = continuePosts.length > 0 ? continuePosts : fallbackPosts;

  return (
    <section className={cn('w-full mt-8 mb-12 relative z-10', className)}>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-foreground/90">
          Continue Reading
          <span className="block w-12 h-1 bg-gradient-to-r from-foreground to-bg/60 mt-2 rounded-full" />
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.length === 0 && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">No posts to show yet.</div>
          )}
          {featuredPosts.map((post, index) => (
            <m.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                // Solid backgrounds and clear borders for visibility on complex backdrops
                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                "hover:shadow-md",
                "flex flex-col h-full"
              )}
              >
                <Link href={`/blog/${post.id}`} className="flex flex-col h-full">
                {post.coverImage ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  </div>
                ) : (
                  <div className="w-full pt-[56.25%] relative bg-gradient-to-br from-muted/20 to-muted/40">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <Image
                        src="https://opendoodles.s3-us-west-1.amazonaws.com/reading.svg"
                        alt="Reading"
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105 hue-rotate-90 dark:invert"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {post.tags?.length ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className={cn(
                      "text-muted-foreground text-sm mb-4",
                      post.coverImage ? "line-clamp-2" : "line-clamp-3"
                    )}>
                      {post.excerpt}
                    </p>
                  )}
                  {/* Continue progress indicator (if any) */}
                  {progressMap[post.id]?.percent ? (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Continue • {Math.round(progressMap[post.id]!.percent)}% read</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 dark:bg-indigo-400"
                          style={{ width: `${Math.min(100, Math.max(0, progressMap[post.id]!.percent))}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center space-x-2">
                      {post.authorPhotoURL ? (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {post.authorPhotoURL.startsWith('http') ? (
                            <Image
                              src={post.authorPhotoURL}
                              alt={post.authorName || 'Author'}
                              fill
                              className="object-cover"
                              sizes="24px"
                              onError={(e: any) => {
                                const target = e.target as HTMLImageElement;
                                if (target && target.parentElement) {
                                  target.style.display = 'none';
                                  target.parentElement.innerHTML = '<span class="text-xs">👤</span>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary/80 text-xs">
                              {post.authorName?.[0]?.toUpperCase() || '👤'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        </div>
                      )}
                      <span>{post.authorName || 'Anonymous'}</span>
                    </div>
                    <div className="text-xs">
                      {formatDate(typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt)}
                      {post.readingTime && ` • ${post.readingTime}`}
                    </div>
                  </div>
                </div>
              </Link>
            </m.article>
          ))}
        </div>
    </section>
  );
};

export default FeaturedPosts;