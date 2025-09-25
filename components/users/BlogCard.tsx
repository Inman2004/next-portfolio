import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import MarkdownViewer from '../blog/MarkdownViewer';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogCard({ post, className = '' }: BlogCardProps) {
  // Get excerpt or first 200 characters of content
  const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) : '');

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden ${className}`}>
      {post.coverImage && (
        <div className="h-48 overflow-hidden">
          <Image 
            src={post.coverImage} 
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
          {post.title}
        </h3>
        <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 mb-4 line-clamp-3">
          <MarkdownViewer content={excerpt + (excerpt.length === 200 ? '...' : '')} />
        </div>
        <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
          <span>{format(new Date(post.createdAt || new Date()), 'MMM d, yyyy')}</span>
          <Link href={`/blog/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}
