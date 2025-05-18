import { getBlogPostById } from '@/lib/blog';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import type { Metadata } from 'next';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getBlogPostById(params.id);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: PageProps) {
  const post = await getBlogPostById(params.id);
  const user = auth.currentUser;

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/50 rounded-lg overflow-hidden"
        >
          {post.coverImage && (
            <div className="h-64 w-full overflow-hidden">
              <img 
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  {post.authorPhotoURL && (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={post.authorPhotoURL} 
                        alt={post.author}
                        className="w-full h-full object-cover"
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                  <div>
                    <span className="block font-medium text-white">{post.author}</span>
                    <time dateTime={post.createdAt instanceof Date ? post.createdAt.toISOString() : 
                          post.createdAt instanceof Timestamp ? post.createdAt.toDate().toISOString() : ''}>
                      {formatDate(post.createdAt instanceof Timestamp ? post.createdAt.toDate() : post.createdAt)}
                    </time>
                  </div>
                </div>
              </div>
              
              {user?.uid === post.authorId && (
                <Link
                  href={`/blog/edit/${post.id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Edit
                </Link>
              )}
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        </motion.article>
        
        <div className="mt-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}