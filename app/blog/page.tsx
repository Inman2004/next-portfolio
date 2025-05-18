import { getBlogPosts } from '@/lib/blog';
import { auth } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const revalidate = 60; // Revalidate at most every minute

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const user = auth.currentUser;

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          {user && (
            <Link
              href="/blog/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="mr-2">+</span>
              Create Post
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <Link href={`/blog/${post.id}`}>
                <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
                <p className="text-gray-300 line-clamp-3 mb-4">{post.excerpt || post.content.substring(0, 200)}...</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {post.authorPhotoURL && (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={post.authorPhotoURL} 
                        alt={post.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-white">{post.author}</p>
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatDate(post.createdAt)}
                    </time>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-400 text-center py-12">No blog posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
