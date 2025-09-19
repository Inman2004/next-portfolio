'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

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

const FeaturedPosts = ({ posts, className }: FeaturedPostsProps) => {
  // Only take the first 3 posts for featured section
  const featuredPosts = posts.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  if (!featuredPosts?.length) return null;

  return (
    <section className={cn('w-full mb-12', className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-whited mb-6 text-foreground/90">
          Featured Posts
          <span className="block w-12 h-1 bg-gradient-to-r from-foreground to-bg/60 mt-2 rounded-full" />
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-card/50 hover:bg-card/70 transition-all duration-300",
                "border border-border/30 hover:border-primary/30 shadow-sm hover:shadow-md",
                "flex flex-col h-full"
              )}
            >
              <Link href={`/blog/${post.slug || post.id}`} className="flex flex-col h-full">
                {post.coverImage ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3} // Only load first 3 images eagerly
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
                  
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
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
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
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
                              onError={(e) => {
                                // Fallback to default avatar if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = (
                                  '<span class="text-xs">👤</span>'
                                );
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
                          <span className="text-xs">👤</span>
                        </div>
                      )}
                      <span>{post.authorName || 'Anonymous'}</span>
                    </div>
                    <div className="text-xs">
                      {formatDate(post.createdAt)}
                      {post.readingTime && ` • ${post.readingTime}`}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;