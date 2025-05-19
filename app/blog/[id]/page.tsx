'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getBlogPostById } from '@/lib/blog';
import { auth } from '@/lib/firebase';
import { Edit } from 'lucide-react';
import type { BlogPost } from '@/types/blog';

// This is a client component that fetches the blog post data
export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) {
        setError('Post ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const postId = Array.isArray(params.id) ? params.id[0] : params.id;
        const postData = await getBlogPostById(postId);
        
        if (!postData) {
          notFound();
          return;
        }
        
        setPost(postData);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return null; // This will be handled by the notFound() call in the effect
  }

  // Format date for display
  const formatCreatedAt = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return formatDate(dateObj);
  };

  // Get ISO date string for time element
  const getISODate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toISOString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 -z-10" />
          
          {/* Cover Image */}
          <div className="w-full relative group">
            {post.coverImage ? (
              <motion.div 
                className="aspect-video w-full overflow-hidden relative"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <img 
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              </motion.div>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <motion.div 
                  className="text-center p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <svg 
                    className="w-16 h-16 mx-auto text-gray-500 mb-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">No cover image</p>
                </motion.div>
              </div>
            )}
            
            {/* Back to blog link */}
            <motion.div 
              className="absolute top-4 left-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-black/70 transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                <svg className="w-4 h-4 mr-1 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blog
              </Link>
            </motion.div>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <motion.h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 leading-tight"
                >
                  {post.title}
                </motion.h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-4">
                    {post.authorPhotoURL ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                        <img 
                          src={post.authorPhotoURL} 
                          alt={post.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {post.author?.charAt(0) || 'A'}
                      </div>
                    )}
                    <span className="text-gray-300">
                      {post.author}
                    </span>
                  </div>
                  
                  {user?.uid === post.authorId && (
                    <Link
                      href={`/blog/edit/${post.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Post
                    </Link>
                  )}
                  
                  <div>
                    <p className="font-medium text-white">{post.author || 'Unknown Author'}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <time 
                        dateTime={getISODate(post.createdAt)}
                        className="flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatCreatedAt(post.createdAt)}
                      </time>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {Math.ceil((post.content?.length || 0) / 1000 * 5)} min read
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {user?.uid === post.authorId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href={`/blog/edit/${post.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-blue-400/50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Post
                  </Link>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              className="prose prose-invert max-w-none mt-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div 
                className="text-gray-300 leading-relaxed text-lg"
                style={{ lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/\n/g, '<br />')
                    .replace(/<h1/g, '<h1 class="text-3xl font-bold text-white mt-12 mb-6"')
                    .replace(/<h2/g, '<h2 class="text-2xl font-bold text-white mt-10 mb-4"')
                    .replace(/<h3/g, '<h3 class="text-xl font-bold text-white mt-8 mb-3"')
                    .replace(/<p/g, '<p class="mb-6"')
                    .replace(/<a/g, '<a class="text-blue-400 hover:text-blue-300 underline"')
                }}
              />
            </motion.div>
            
            <motion.div 
              className="mt-16 pt-8 border-t border-gray-700/50 flex justify-between items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                href="/blog" 
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all posts
              </Link>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                  aria-label="Back to top"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}