import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogCard({ post, className = '' }: BlogCardProps) {
  const formattedDate = post.createdAt?.toDate 
    ? format(post.createdAt.toDate(), 'MMMM d, yyyy')
    : 'Unknown date';

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className={`block group ${className}`}
      aria-label={`Read ${post.title}`}
    >
      <article className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <time dateTime={post.createdAt?.toDate?.()?.toISOString()}>
                {formattedDate}
              </time>
              <span className="mx-2">•</span>
              <span>{post.readingTime || '5 min'} read</span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
              {post.excerpt || post.content?.substring(0, 160) + '...'}
            </p>
            {post.tags?.length ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {post.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 6 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{post.tags.length - 6} more</span>
                )}
              </div>
            ) : null}
          </div>
          
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0">
              {post.authorPhotoURL ? (
                <Image
                  src={post.authorPhotoURL}
                  alt={post.authorName || 'Author'}
                  width={40}
                  height={40}
                  className="rounded-full h-10 w-10 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {post.authorName?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.authorName || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.authorTitle || 'Author'}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
