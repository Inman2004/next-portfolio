'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuthorAvatarProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
  lazy?: boolean;
  className?: string;
}

const AuthorAvatar = ({
  src,
  alt,
  priority = false,
  lazy = true,
  className = ''
}: AuthorAvatarProps) => (
  <div className={cn("w-10 h-10 rounded-full mx-right my-auto flex items-center justify-center text-gray-400 dark:text-gray-500", className)}>
    <Image
      src={src || '/placeholder.png'}
      alt={alt}
      width={40}
      height={40}
      sizes="(max-width: 768px) 40px, 40px"
      className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-full"
      priority={priority}
      loading={lazy ? 'lazy' : undefined}
    />
  </div>
);

interface PostTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PostTitle = ({
  children,
  className = ''
}: PostTitleProps) => (
  <div className="p-6 flex-1 flex flex-col">
    <p className={cn(
      "text-xl font-thin bg-clip-text text-transparent bg-gradient-to-r from-gray-900/50 to-gray-700/50 dark:from-indigo-400/50 dark:to-violet-400/50 mb-3 line-clamp-2",
      "group-hover:text-white dark:group-hover:text-gray-400 transition-colors",
      className
    )}>
      {children}
    </p>
  </div>
);

import { formatDate } from '@/lib/utils';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { getBlogPosts, enrichBlogPosts, cleanupBlogPostSubscriptions } from '@/lib/blogUtils';
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, Timestamp } from 'firebase/firestore';
import { Eye, Clock, Calendar, Search, Filter, X, Trash2, Crown, Plus, ChevronDown, Check, ArrowUpDown, Flame, ArrowRight, Loader } from 'lucide-react';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { BlogLoadingSkeleton } from '@/components/ui/blog-loading-skeleton';
import { formatNumber } from '@/lib/formatNumber';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { toast } from 'react-hot-toast';
import type { BlogPost, EnrichedBlogPost, BlogPostUserData } from '@/types/blog';
import { getViewCounts } from '@/lib/views';
import { deleteBlogPost } from '@/app/actions/blog';
import dynamic from 'next/dynamic';

// Dynamically import MarkdownViewer with no SSR to avoid hydration issues
const MarkdownViewer = dynamic(
  () => import('@/components/blog/MarkdownViewer'),
  { ssr: false }
);

type SortOption = 'newest' | 'oldest' | 'popular';

export default function BlogPage() {
  // State declarations at the top
  const [posts, setPosts] = useState<EnrichedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const postsPerPage = 9; // Number of posts to load per page

  // Track current posts for cleanup
  const currentPostsRef = useRef<EnrichedBlogPost[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Get all unique tags from posts with counts
  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };
  
  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags(new Set());
  };

  // Format date for display
  const formatCreatedAt = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return formatDate(dateObj);
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    // First filter by search query
    let filtered = [...posts];
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          post.title?.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Then filter by selected tags if any
    if (selectedTags.size > 0) {
      filtered = filtered.filter(post => 
        post.tags?.some(tag => selectedTags.has(tag))
      );
    }

    const postsToSort = [...filtered];

    return postsToSort.sort((a: BlogPost, b: BlogPost) => {
      switch (sortBy) {
        case 'newest':
          const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return dateB.getTime() - dateA.getTime();

        case 'oldest':
          const dateAO = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const dateBO = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return dateAO.getTime() - dateBO.getTime();

        case 'popular':
          const viewsA = viewCounts[a.id || ''] || 0;
          const viewsB = viewCounts[b.id || ''] || 0;
          return viewsB - viewsA;

        default:
          return 0;
      }
    });
  }, [posts, sortBy, searchQuery, selectedTags]);

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

  // Initial data load
  const loadPosts = useCallback(async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
        setPosts([]);
        setLastVisible(null);
        setHasMore(true);
      } else {
        if (!lastVisible || !hasMore) return;
        setLoadingMore(true);
      }

      setError(null);

      // Create a query for published posts with pagination
      let postsQuery = query(
        collection(db, 'blogPosts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(postsPerPage)
      );

      if (lastVisible && !initialLoad) {
        postsQuery = query(postsQuery, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(postsQuery);

      // Update last visible document for pagination
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // Check if there are more posts to load
      if (querySnapshot.docs.length < postsPerPage) {
        setHasMore(false);
      }

      const newPosts: BlogPost[] = [];
      const postIds: string[] = [];

      // Process each document
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postId = doc.id;
        postIds.push(postId);

        const { title, content, author, authorId, excerpt, coverImage, published, tags } =
          data as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

        newPosts.push({
          id: postId,
          title,
          content,
          author,
          authorId,
          excerpt,
          coverImage,
          published,
          tags,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null
        });
      });

      // Fetch view counts for the new posts
      let counts: Record<string, number> = {};
      try {
        const viewCounts = await getViewCounts(postIds);
        if (viewCounts) {
          counts = viewCounts;
        }
      } catch (err) {
        console.error('Error fetching view counts:', err);
        postIds.forEach(id => counts[id] = 0);
      }

      // Enrich posts with user data
      const enrichedPosts = await enrichBlogPosts(newPosts, false);

      // Update state
      setPosts(prevPosts => {
        // For initial load, replace all posts
        if (initialLoad) return enrichedPosts as EnrichedBlogPost[];
        // For pagination, append new posts
        return [...prevPosts, ...(enrichedPosts as EnrichedBlogPost[])];
      });

      setViewCounts(prev => ({
        ...prev,
        ...counts
      }));

      // Clean up old subscriptions if this is a refresh
      if (initialLoad && currentPostsRef.current.length > 0) {
        cleanupBlogPostSubscriptions(currentPostsRef.current);
      }

      // Update current posts ref
      currentPostsRef.current = initialLoad
        ? enrichedPosts as EnrichedBlogPost[]
        : [...currentPostsRef.current, ...(enrichedPosts as EnrichedBlogPost[])];

    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load blog posts. Please refresh the page to try again.');
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadPosts(false);
      }
    };

    if (loadMoreRef.current) {
      observer.current = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      });

      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, loadPosts]);

  // Initial load
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      // Only load posts after auth state is determined
      loadPosts(true);
    });

    return () => {
      authUnsubscribe();
      // Clean up subscriptions when component unmounts
      if (currentPostsRef.current.length > 0) {
        cleanupBlogPostSubscriptions(currentPostsRef.current);
      }
    };
  }, []);

  // Handle user data updates
  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent<{ userId: string; userData: BlogPostUserData }>) => {
      setPosts(currentPosts => {
        return currentPosts.map(post => {
          if (post.authorId === event.detail.userId) {
            return {
              ...post,
              author: event.detail.userData.displayName || post.author,
              authorPhotoURL: event.detail.userData.photoURL || post.authorPhotoURL,
              user: {
                displayName: event.detail.userData.displayName,
                photoURL: event.detail.userData.photoURL
              }
            };
          }
          return post;
        });
      });
    };

    // Add event listener for user data updates
    const eventListener = (e: Event) => handleUserDataUpdate(e as CustomEvent<{ userId: string; userData: BlogPostUserData }>);
    window.addEventListener('userDataUpdated', eventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener('userDataUpdated', eventListener);
    };
  }, []);

  const getPostDateTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toISOString();
  };


  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <BlogLoadingSkeleton count={6} />
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Create Post Button - Floating */}
        <div className="fixed md:hidden flex bottom-6 right-6 z-50">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 md:py-16">
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
              className="relative z-1 text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-tr to-purple-600 from-indigo-600 dark:to-purple-500 dark:from-indigo-500 p-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Blogs
            </motion.h1>
          </div>
          <motion.div
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-xl font-thin tracking-tight text-gray-600 dark:text-gray-400 sm:text-2xl">
              <span className="block">
                Harness the power of social proof to

                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-blue-400">
                  &nbsp;inspire one another as you create, share, and learn together.
                </span>
              </span>
            </h1>
          </motion.div>
        </div>
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
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Latest Posts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Discover the latest articles and tutorials</p>
            </div>

            {user && (
              <Link
                href="/blog/new"
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xl hover:shadow-blue-700/50 shadow-blue-500/10 hover:-translate-y-0.5 transform transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            )}
          </motion.div>

          {/* Sort, Search, and Tags Controls */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <motion.div
                className="flex flex-wrap gap-2 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-1.5 rounded-xl border border-gray-900/50 dark:border-gray-700/50 shadow-xl dark:shadow-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'newest'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-400/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-600/50 dark:hover:bg-blue-600/50 hover:text-white'
                  }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Newest
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'oldest'
                    ? 'bg-blue-600/90 dark:bg-blue-600/90 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-400/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-600/50 dark:hover:bg-blue-600/50 hover:text-white'
                  }`}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Oldest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'popular'
                    ? 'bg-blue-600/90 dark:bg-blue-600/90 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-400/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-600/50 dark:hover:bg-blue-600/50 hover:text-white'
                  }`}
              >
                <Flame className="w-4 h-4 mr-2" />
                Most Popular
              </button>
            </motion.div>
            
            <motion.div
              className="w-full md:w-auto md:flex-1 max-w-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
                <BlogSearch
                  searchQuery={searchQuery}
                  onSearchChange={(query) => setSearchQuery(query)}
                  placeholder="Search blog posts..."
                  className="w-full"
                />
              </motion.div>
            </div>
            
            {/* Tags Filter */}
            {allTags.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2 py-4 items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                  Filter by tags:
                </span>
                {allTags.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => toggleTag(name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedTags.has(name)
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-gray-200/70 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                    }`}
                  >
                    {name}
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                ))}
                {selectedTags.size > 0 && (
                  <button
                    onClick={clearTags}
                    className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
          {/* Loading State */}
          {loading ? <BlogLoadingSkeleton /> : null}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg max-w-3xl mx-auto text-center">
              <p className="font-medium">Error loading posts</p>
              <p className="text-sm mt-1 text-red-300">{error}</p>
            </div>
          )}

          {/* No Posts */}
          {!loading && filteredAndSortedPosts.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {searchQuery.trim() ? 'No matching posts found.' : 'No blog posts found.'}
              </p>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-sm text-blue-600 dark:text-violet-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {!loading && filteredAndSortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAndSortedPosts.map((post, index) => {
                  const postId = post.id || '';
                  const viewCount = viewCounts[postId] || 0;

                  return (
                    <motion.article
                      key={postId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border transition-all duration-300 h-full flex flex-col shadow-lg hover:shadow-gray-900/50 dark:hover:shadow-violet-500/30 ${post.isAdmin
                          ? 'border-amber-300/50 dark:border-amber-500/50 bg-gradient-to-br from-amber-50/50 to-white/80 dark:from-amber-900/10 dark:to-gray-900/50 hover:border-amber-400/70 dark:hover:border-amber-500/80 hover:!shadow-amber-500/30 dark:hover:!shadow-amber-500/30'
                          : 'border-gray-00/70 dark:border-gray-700/50 bg-card/80 dark:bg-gray-800/30 hover:border-gray-300/80 dark:hover:border-gray-600/80 hover:shadow-md'
                        }`}
                    >
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {post.isAdmin && (
                          <div className="bg-card/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 text-[11px] font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 flex items-center backdrop-blur-sm">
                            <Crown className="w-3 h-3 mr-1.5 text-gray-600 dark:text-gray-400" />
                            Admin
                          </div>
                        )}
                      </div>
                      <Link href={`/blog/${postId}`} className="flex flex-col h-full">
                        {/* Cover Image */}
                        <div className={`h-48 relative overflow-hidden ${post.isAdmin
                            ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30'
                            : 'bg-gradient-to-br from-gray-900/30 dark:from-violet-900/30 dark:to-gray-900/30 to-gray-500/30'
                          }`}>
                          {post.coverImage ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority={index < 3} // Only preload first 3 images
                                loading={index > 2 ? 'lazy' : undefined}
                              />
                            </div>
                          ) : (
                            <>
                              <AuthorAvatar
                                src={post.authorPhotoURL}
                                alt={post.author}
                                priority={index < 3}
                                lazy={index > 2}
                              />
                              <PostTitle>
                                {post.title}
                              </PostTitle>
                              {/* {post.excerpt ? (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {post.excerpt}
                                </p>
                              ) : post.content ? (
                                <p className="text-gray-500 dark:text-gray-500 text-sm line-clamp-2">
                                  {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                </p>
                              ) : (
                                <p className="text-gray-400 dark:text-gray-600 text-sm italic">
                                  No content preview available
                                </p>
                              )} */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 mx-2">
                                  {post.tags.slice(0, 3).map(tag => (
                                    <span 
                                      key={tag} 
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700/50 dark:bg-violet-900/30 text-white dark:text-violet-200 border border-gray-900/50 dark:border-violet-800/50 cursor-pointer hover:bg-blue-200/70 dark:hover:bg-violet-800/50 transition-colors"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleTag(tag);
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {post.tags.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                                      +{post.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          <div className={`absolute inset-0 bg-gradient-to-t ${post.isAdmin
                              ? 'from-amber-900/80 dark:from-amber-900/80'
                              : 'from-gray-900/50 dark:from-violet-900/70'
                            } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${post.isAdmin
                                ? 'bg-amber-400/90 hover:bg-amber-300 text-amber-900 dark:bg-yellow-500/90 dark:hover:bg-yellow-400/90 dark:text-yellow-900'
                                : 'bg-gray-600 hover:bg-gray-700 text-white dark:bg-violet-500/90 dark:hover:bg-violet-400/90'
                              }`}>
                              Read More
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5 -mr-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-violet-400 transition-colors">
                              {post.title}
                            </h2>
                            {/* {post.excerpt && (
                              <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 prose prose-sm dark:prose-invert max-w-none">
                                <MarkdownViewer content={post.excerpt} />
                              </div>
                            )} */}
                          </div>

                          {/* Post Meta */}
                          <div className="mt-4 pt-4 border-t border-gray-200/70 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 mr-2.5">
                                  <UserAvatar
                                    photoURL={(
                                      (post.author && typeof post.author === 'object' && 'photoURL' in post.author ? (post.author as any).photoURL : null) ||
                                      post.authorPhotoURL ||
                                      post.user?.photoURL
                                    ) as string | undefined}
                                    displayName={
                                      (post.author && typeof post.author === 'object' && 'name' in post.author ? (post.author as any).name : null) ||
                                      (typeof post.author === 'string' ? post.author : 'Author')
                                    }
                                    size={32}
                                    className="border border-gray-200/50 dark:border-gray-600/50"
                                  />
                                </div>
                                <div>
                                  {(post.author && typeof post.author === 'object' && 'username' in post.author ? (post.author as any).username : post.username) ? (
                                    <Link
                                      href={`/users/${(post.author && typeof post.author === 'object' && 'username' in post.author
                                          ? (post.author as any).username
                                          : post.username)
                                        }`}
                                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-violet-400 transition-colors"
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    >
                                      {post.author && typeof post.author === 'object' && 'name' in post.author
                                        ? (post.author as any).name
                                        : (typeof post.author === 'string' ? post.author : 'Anonymous')}
                                    </Link>
                                  ) : (
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {post.author && typeof post.author === 'object' && 'name' in post.author
                                        ? (post.author as any).name
                                        : (typeof post.author === 'string' ? post.author : 'Anonymous')}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCreatedAt(post.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <Eye className="w-4 h-4 mr-1.5 opacity-70" />
                                <span className="font-medium">{formatNumber(viewCount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : null}

          {/* Loading indicator for infinite scroll */}
          {loadingMore && (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-violet-500"></div>
            </div>
          )}

          {/* Intersection observer target */}
          <div ref={loadMoreRef} className="h-1 w-full col-span-full" />

          {!loadingMore && !hasMore && filteredAndSortedPosts.length > 0 && (
            <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400">
              <Image
                src="/images/ui/bad.png"
                alt="No posts found"
                width={150}
                height={150}
                className="mx-auto opacity-50"
              />
              <p>No more posts</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
