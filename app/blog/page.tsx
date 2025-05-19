'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getBlogPosts } from '@/lib/blog';
import { auth } from '@/lib/firebase';
import type { BlogPost } from '@/types/blog';
import { Timestamp } from 'firebase/firestore';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user || null);
    });

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getBlogPosts();
        setPosts(postsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderPostDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return formatDate(dateObj);
  };

  const getPostDateTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toISOString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full">
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Blog Posts
            </h1>
            <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </motion.div>
          
          {user && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto"
            >
              <Link
                href="/blog/create"
                className="w-full inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
              >
                <span className="mr-2 text-xl">+</span>
                Create Post
              </Link>
            </motion.div>
          )}
        </div>

        {posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-200 mb-2">No Posts Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">Be the first to share your thoughts and start the conversation!</p>
            {!user && (
              <div className="mt-6">
                <Link 
                  href="/signin" 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in to create a post
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col"
              >
                <Link href={`/blog/${post.id}`} className="flex flex-col h-full">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-900/30 to-purple-900/30 relative overflow-hidden">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white">
                        Read More
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                        {post.excerpt || (post.content ? post.content.substring(0, 120) + (post.content.length > 120 ? '...' : '') : '')}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {post.authorPhotoURL ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/30">
                              <img 
                                src={post.authorPhotoURL} 
                                alt={post.author || 'Author'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {(post.author || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {post.author || 'Unknown Author'}
                            </p>
                            <time 
                              dateTime={getPostDateTime(post.createdAt)}
                              className="text-xs text-gray-400"
                            >
                              {renderPostDate(post.createdAt)}
                            </time>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {Math.ceil((post.content?.length || 0) / 1000 * 5)} min read
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
