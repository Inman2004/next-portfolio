'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getBlogPosts } from '@/lib/blog';
import { Crown, Eye, Flame, Clock, ArrowUpDown, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { BlogPost } from '@/types/blog';
import { getViewCount } from '@/lib/views';
import { deleteBlogPost } from '@/app/actions/blog';
import dynamic from 'next/dynamic';

// Dynamically import MarkdownViewer with no SSR to avoid hydration issues
const MarkdownViewer = dynamic(
  () => import('@/components/MarkdownViewer'),
  { ssr: false }
);

type SortOption = 'newest' | 'oldest' | 'popular';

export default function BlogPage() {
  // State declarations at the top
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  
  // Handle authentication state changes and admin check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const currentPath = window.location.pathname;
      
      // Redirect to sign-in if not authenticated when trying to access /blog/new
      if (!user && currentPath === '/blog/new') {
        router.push(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
      }
      
      // Check if user is admin
      if (user) {
        // Replace with your admin check logic (e.g., check custom claims)
        const checkAdmin = async () => {
          try {
            const idTokenResult = await user.getIdTokenResult();
            setIsAdmin(!!idTokenResult.claims.admin);
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        };
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth, router]);

  // Format date for display
  const formatCreatedAt = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return formatDate(dateObj);
  };

  const renderPostDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return formatDate(dateObj);
  };

  // Sort posts based on selected option
  const sortedPosts = useMemo(() => {
    const postsToSort = [...posts];
    
    switch (sortBy) {
      case 'newest':
        return postsToSort.sort((a: BlogPost, b: BlogPost) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return dateB.getTime() - dateA.getTime();
        });
        
      case 'oldest':
        return postsToSort.sort((a: BlogPost, b: BlogPost) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return dateA.getTime() - dateB.getTime();
        });
        
      case 'popular':
        return postsToSort.sort((a: BlogPost, b: BlogPost) => {
          const viewsA = viewCounts[a.id || ''] || 0;
          const viewsB = viewCounts[b.id || ''] || 0;
          return viewsB - viewsA;
        });
        
      default:
        return postsToSort;
    }
  }, [posts, sortBy, viewCounts]);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (user) {
          // Check if user's email is in admin list
          const adminEmails = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''];
          const isUserAdmin = adminEmails.includes(user.email || '');
          
          // Also check custom claims if needed
          const token = await user.getIdTokenResult();
          setIsAdmin(isUserAdmin || !!token.claims.admin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    if (user) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch posts and set up auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getBlogPosts();
        setPosts(postsData);
        
        // Fetch view counts for all posts
        const counts: Record<string, number> = {};
        await Promise.all(
          postsData.map(async (post) => {
            if (post.id) {
              counts[post.id] = await getViewCount(post.id);
            }
          })
        );
        setViewCounts(counts);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        toast.error('Failed to fetch blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      unsubscribe();
    };
  }, []);

  const getPostDateTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toISOString();
  };

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const toastId = toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex flex-col border border-gray-700 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">Delete Post</p>
              <p className="mt-1 text-sm text-gray-400">Are you sure you want to delete this post? This action cannot be undone.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                toast.dismiss(toastId);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(toastId);
                try {
                  if (!user?.uid) {
                    throw new Error('You must be logged in to delete posts');
                  }
                  
                  setDeletingId(postId);
                  const result = await deleteBlogPost(postId, user.uid);
                  
                  if (result.success) {
                    toast.success('Post deleted successfully', { id: 'delete-success' });
                    // Remove the deleted post from the UI
                    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                  } else {
                    throw new Error(result.error || 'Failed to delete post');
                  }
                } catch (error) {
                  console.error('Error deleting post:', error);
                  toast.error(error instanceof Error ? error.message : 'Failed to delete post', { id: 'delete-error' });
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              {deletingId === postId ? (
                <span className="flex items-center">
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </span>
              ) : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    ), {
      id: 'delete-confirmation',
      duration: 10000, // 10 seconds
      position: 'bottom-center',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      {/* Create Post Button - Floating */}
      <div className="fixed bottom-6 right-6 z-50">
        {user ? (
          <Link
            href="/blog/new"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors hover:shadow-blue-500/30"
          >
            <Plus className="w-6 h-6" />
          </Link>
        ) : (
          <button
            onClick={() => router.push(`/signin?callbackUrl=${encodeURIComponent('/blog/new')}`)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors hover:shadow-blue-500/30"
            aria-label="Sign in to create a new post"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="relative">
            <motion.span 
              className="absolute inset-0 mx-auto py-4 flex items-center justify-center w-full blur-xl bg-gradient-to-r from-indigo-900 via-indigo-500 to-blue-500 bg-clip-text text-4xl md:text-6xl font-extrabold text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Blogs
            </motion.span>
            <motion.h1 
              className="relative z-10 text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-tr to-purple-500 from-indigo-600 p-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Blogs
            </motion.h1>
          </div>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          ><h1 className="text-xl font-thin tracking-tight text-gray-400 sm:text-2xl">
          <span className="block">
              Use the power of social proof
              <span className="text-transparent bg-clip-text bg-gradient-to-tr to-purple-500 from-teal-400">
                  &nbsp;thoughts, stories, and ideas about your development, design,
              </span>
              &nbsp;to inspire others
          </span>
      </h1>
          </motion.p>
        </div>
      

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-8 pb-20 max-w-7xl">
        {/* Header with Create Button */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Latest Posts
            </h2>
            <p className="text-gray-400 mt-1">Discover the latest articles and tutorials</p>
          </div>
          
          {user && (
            <Link
              href="/blog/new"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transform transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          )}
        </motion.div>

        {/* Sort Controls */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-10 bg-gray-800/30 backdrop-blur-sm p-1.5 rounded-xl border border-gray-700/50 max-w-max"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button
            onClick={() => setSortBy('newest')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'newest' 
                ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Newest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'oldest' 
                ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Oldest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'popular' 
                ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 mr-2" />
            Most Popular
          </button>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 overflow-hidden animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6"></div>
                  <div className="h-4 bg-white/5 rounded w-4/6"></div>
                  <div className="pt-4 flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 w-20 bg-white/5 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg max-w-3xl mx-auto text-center">
            <p className="font-medium">Error loading posts</p>
            <p className="text-sm mt-1 text-red-300">{error}</p>
          </div>
        )}

        {/* No Posts */}
        {!loading && sortedPosts.length === 0 && !error && (
          <motion.div 
            className="text-center py-16 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-200 mb-2">No Posts Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">Be the first to share your thoughts and start the conversation!</p>
            {user ? (
              <Link 
                href="/blog/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Post
              </Link>
            ) : (
              <Link 
                href="/signin" 
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in to create a post
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </motion.div>
        )}

        {/* Posts Grid */}
        {!loading && sortedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post, index) => {
              const postId = post.id || '';
              const viewCount = viewCounts[postId] || 0;
              
              return (
                <motion.article
                  key={postId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 h-full flex flex-col ${
                    post.isAdmin 
                      ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/10 to-gray-900/50 hover:border-yellow-500/80' 
                      : 'border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-blue-500/50'
                  }`}
                >
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {post.isAdmin && (
                      <div className="bg-yellow-500/90 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </div>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(postId, e)}
                        disabled={deletingId === postId}
                        className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete post"
                      >
                        {deletingId === postId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <Link href={`/blog/${postId}`} className="flex flex-col h-full">
                    {/* Cover Image */}
                    <div className={`h-48 relative overflow-hidden ${
                      post.isAdmin 
                        ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30' 
                        : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'
                    }`}>
                      {post.coverImage ? (
                        <Image 
                          src={post.coverImage} 
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        post.isAdmin ? 'from-amber-900/80' : 'from-black/70'
                      } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          post.isAdmin 
                            ? 'bg-yellow-500/90 text-yellow-900' 
                            : 'bg-blue-500/90 text-white'
                        }`}>
                          Read More
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h2>
                        {post.excerpt && (
                          <div className="text-gray-400 text-sm line-clamp-3 mb-4 prose prose-invert prose-sm max-w-none">
                            <MarkdownViewer content={post.excerpt} />
                          </div>
                        )}
                      </div>
                      
                      {/* Post Meta */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {post.authorPhotoURL ? (
                              <Image 
                                src={post.authorPhotoURL} 
                                alt={post.author || 'Author'} 
                                width={32} 
                                height={32} 
                                className="rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-2">
                                {post.author?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{post.author || 'Anonymous'}</p>
                              <p className="text-xs text-gray-400">
                                {formatCreatedAt(post.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{viewCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
