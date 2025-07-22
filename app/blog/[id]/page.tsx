'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { PostData } from '@/types';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBlogPost } from '@/lib/blogUtils';
import { Crown, Edit, Eye, ArrowLeft, Trash2, Share2, MoreHorizontal, Calendar, User as UserIcon, ChevronUp } from 'lucide-react';
import SocialShare from '@/components/SocialShare';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { auth } from '@/lib/firebase';
import { incrementViewCount, getViewCount } from '@/lib/views';
import { formatNumber } from '@/lib/formatNumber';
import MarkdownViewer from '@/components/MarkdownViewer';
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useBlogCache } from '@/contexts/BlogCacheContext';

// Define types for author data
interface AuthorData {
  id?: string;
  name?: string;
  username?: string;
  photoURL?: string;
  [key: string]: any; // For any additional properties
}

// Ensure this matches the Author interface from types.ts
type PostAuthorData = {
  id: string;
  name: string;
  username?: string;
  photoURL?: string; // Changed from string | null to string | undefined to match Author interface
};

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCachedPost, cachePost } = useBlogCache();
  
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [views, setViews] = useState<number>(0);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use refs to track if operations have been performed
  const viewTrackedRef = useRef(false);
  const unsubscribeViewRef = useRef<(() => void) | null>(null);
  const fetchedPostRef = useRef<string | null>(null);

  // Resolve the async params - FIXED: Remove dependency on params in useEffect
  useEffect(() => {
    let isMounted = true;
    
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        if (isMounted) {
          setPostId(resolvedParams.id);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load post parameters');
          setLoading(false);
        }
      }
    };
    
    resolveParams();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - params is stable

  // Scroll detection for floating action bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDelete = useCallback(() => {
    if (!post) {
      setError('Post not found');
      return;
    }
    setIsConfirmOpen(true);
  }, [post]);

  const handleConfirm = useCallback(async () => {
    if (!post) {
      setError('Post not found');
      return;
    }
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'blogPosts', post.id));
      toast.success('Post deleted successfully');
      router.push('/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  }, [post, router]);

  const handleCancel = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // FIXED: Simplified auth state management
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Set admin status based on user email
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
        setIsAdmin(currentUser.email === adminEmail);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // FIXED: Optimized fetchPost to avoid unnecessary re-creations
  const fetchPost = useCallback(async (id: string) => {
    // Avoid refetching the same post
    if (fetchedPostRef.current === id) {
      return;
    }
    
    // Check cache first
    const cachedPost = getCachedPost(id);
    if (cachedPost) {
      setPost(cachedPost);
      setLoading(false);
      fetchedPostRef.current = id;
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Use the new getBlogPost utility function
      const postData = await getBlogPost(id);

      if (!postData) {
        setError('Post not found');
        return;
      }

      // FIXED: Simplified author data processing
      const getAuthorData = (): PostAuthorData => {
        const getStringValue = (value: any, defaultValue: string = ''): string => {
          if (value === null || value === undefined) return defaultValue;
          if (typeof value === 'string') return value;
          if (typeof value === 'object' && value !== null) {
            if ('name' in value) return String(value.name);
            if ('displayName' in value) return String(value.displayName);
            return JSON.stringify(value);
          }
          return String(value);
        };

        const defaultAuthor: PostAuthorData = {
          id: postData.authorId ? String(postData.authorId) : 'unknown',
          name: 'Anonymous',
          username: undefined,
          photoURL: undefined
        };

        const userDisplayName = postData.user?.displayName || 
                              (typeof postData.user === 'object' && postData.user !== null 
                                ? (postData.user as any).name 
                                : null);
        
        const userPhotoURL = postData.user?.photoURL || 
                           (typeof postData.user === 'object' && postData.user !== null 
                             ? (postData.user as any).photoURL 
                             : null);
        
        const userUsername = postData.user?.username || 
                           (typeof postData.user === 'object' && postData.user !== null 
                             ? (postData.user as any).username 
                             : null);

        if (typeof postData.author === 'string') {
          return {
            ...defaultAuthor,
            name: postData.author,
            username: userUsername,
            photoURL: userPhotoURL || postData.authorPhotoURL
          };
        }
        
        if (postData.author && typeof postData.author === 'object') {
          const authorObj = postData.author as Record<string, unknown>;
          const authorId = postData.authorId || 
                         (authorObj.id ? String(authorObj.id) : 'unknown');
          
          return {
            ...defaultAuthor,
            id: authorId,
            name: getStringValue(userDisplayName || authorObj.name || 'Anonymous'),
            username: getStringValue(authorObj.username || userUsername || ''),
            photoURL: getStringValue(userPhotoURL || authorObj.photoURL || postData.authorPhotoURL || '')
          };
        }
        
        if (postData.user) {
          let userId: string;
          if (postData.authorId) {
            userId = String(postData.authorId);
          } else if (postData.user.uid) {
            userId = String(postData.user.uid);
          } else if (typeof postData.user === 'object' && postData.user !== null && 'id' in postData.user) {
            userId = String((postData.user as any).id);
          } else {
            userId = 'unknown';
          }
          
          return {
            ...defaultAuthor,
            id: userId,
            name: getStringValue(userDisplayName, 'Anonymous'),
            username: getStringValue(userUsername),
            photoURL: getStringValue(userPhotoURL)
          };
        }
        
        return defaultAuthor;
      };

      const authorData = getAuthorData();
      const authorSocials = postData.author && typeof postData.author === 'object' && 'socials' in postData.author
        ? (postData.author as any).socials || {}
        : {};

      const formattedPost: PostData = {
        id: typeof postData.id === 'string' ? postData.id : 'unknown',
        title: postData.title,
        content: postData.content,
        author: {
          id: authorData.id || 'unknown',
          name: authorData.name || 'Unknown Author',
          username: authorData.username,
          photoURL: authorData.photoURL,
          socials: authorSocials
        },
        authorId: authorData.id || 'unknown',
        authorName: authorData.name || 'Unknown Author',
        authorPhotoURL: authorData.photoURL,
        authorUsername: authorData.username,
        authorSocials: authorSocials,
        createdAt: postData.createdAt,
        coverImage: postData.coverImage,
        excerpt: postData.excerpt,
        published: postData.published,
        isAdmin: postData.isAdmin,
        tags: Array.isArray(postData.tags) ? postData.tags : []
      };

      cachePost(formattedPost);
      setPost(formattedPost);
      fetchedPostRef.current = id;
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [getCachedPost, cachePost]);

  // FIXED: Separate effect for fetching post when postId changes
  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId, fetchPost]);

  // FIXED: Optimized view tracking with proper cleanup
  useEffect(() => {
    if (!postId || viewTrackedRef.current) return;
    
    const trackView = async () => {
      try {
        // Track view only once
        await incrementViewCount(postId);
        viewTrackedRef.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };
    
    // Get initial view count
    const fetchInitialViews = async () => {
      try {
        const initialViews = await getViewCount(postId);
        setViews(initialViews);
      } catch (error) {
        console.error('Error fetching initial view count:', error);
      }
    };
    
    // Set up real-time updates for view count
    const viewRef = doc(db, 'post_views', postId);
    const unsubscribeView = onSnapshot(viewRef, (doc) => {
      if (doc.exists()) {
        setViews(doc.data().count || 0);
      }
    }, (error) => {
      console.error('Error in view snapshot:', error);
    });
    
    unsubscribeViewRef.current = unsubscribeView;
    
    // Track view and fetch initial count
    trackView();
    fetchInitialViews();
    
    return () => {
      if (unsubscribeViewRef.current) {
        unsubscribeViewRef.current();
        unsubscribeViewRef.current = null;
      }
    };
  }, [postId]); // Only depend on postId

  // FIXED: Memoized date formatting to avoid recalculation
  const formatCreatedAt = useMemo(() => {
    return (date: Date | { toDate: () => Date } | undefined) => {
      if (!date) return '';
      const dateObj = date instanceof Date ? date : date.toDate();
      return format(dateObj, 'MMMM d, yyyy');
    };
  }, []);

  const getPostDateTime = useMemo(() => {
    return (date: Date | { toDate: () => Date } | undefined) => {
      if (!date) return '';
      const dateObj = date instanceof Date ? date : date.toDate();
      return dateObj.toISOString();
    };
  }, []);

  // FIXED: Memoized formatted date and datetime
  const formattedCreatedAt = useMemo(() => {
    return formatCreatedAt(post?.createdAt);
  }, [post?.createdAt, formatCreatedAt]);

  const postDateTime = useMemo(() => {
    return getPostDateTime(post?.createdAt);
  }, [post?.createdAt, getPostDateTime]);

  // Memoized author actions with proper null checks
  const AuthorActions = useMemo(() => {
    // Return null if post or author data isn't loaded yet
    if (!post || !post.author) return null;
    
    // Only show actions if the current user is the author
    if (user?.uid !== post.author.id) return null;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <Link
          href={`/blog/edit/${post.id}`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
          aria-label="Edit post"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Edit</span>
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={isDeleting}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Delete post"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current flex-shrink-0"></div>
          ) : (
            <Trash2 className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          )}
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    );
  }, [user?.uid, post?.author?.id, post?.id, handleDelete, isDeleting, post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin mb-4">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-black text-gray-900 dark:text-white transition-all duration-300">
      {/* Floating Action Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: isScrolled ? 0 : 100, opacity: isScrolled ? 1 : 0 }}
        className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 transform -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md sm:backdrop-blur-lg rounded-lg sm:rounded-2xl shadow sm:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-1.5 sm:px-3 sm:py-2 flex flex-col items-center gap-1 sm:gap-2 min-w-[32px] sm:min-w-[36px] max-w-[14vw]"
      >
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1 transition-transform" />
          <span className="hidden sm:inline text-xs">Top</span>
        </button>
        
        <div className="flex-1 min-w-0">
          <SocialShare 
            url={`/blog/${post.id}`}
            title={post.title}
            description={post.content?.substring(0, 200) + '...'}
          />
        </div>
        
        {AuthorActions}
      </motion.div>

      <div className="pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Blog</span>
            </Link>
          </motion.div>

          {/* Main Article */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-all duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute opacity-0 hover:opacity-100 bottom-6 left-6 right-6 transition-all duration-200">
                  <h1 className="text-2xl uppercase sm:text-lg lg:text-xl font-bold text-white mb-2 leading-tight">
                    {post.title}
                  </h1>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Title (if no cover image) */}
              {!post.coverImage && (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                  {post.title}
                </h1>
              )}

              {/* Author Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 p-4 sm:p-6 bg-gradient-to-l from-blue-100 shadow-sm to-blue-50 dark:from-teal-900/10 dark:to-blue-900/5 rounded-2xl">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <UserAvatar
                    photoURL={typeof post.author.photoURL === 'string' ? post.author.photoURL : undefined}
                    displayName={typeof post.author.name === 'string' ? post.author.name : 
                               (post.author as any)?.displayName || '?'}
                    size={56}
                    className="hover:ring-4 hover:ring-blue-500/30 transition-all duration-200 flex-shrink-0"
                    asLink={!!post.author.username}
                    linkHref={post.author.username ? `/users/${post.author.username}` : undefined}
                    title={typeof post.author.name === 'string' ? post.author.name : 
                          (post.author as any)?.name || 'Author'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      {post.author.username ? (
                        <Link 
                          href={`/users/${post.author.username}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors truncate"
                        >
                          {typeof post.author.name === 'string' ? post.author.name : 
                           (post.author as any)?.displayName || 'Anonymous'}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {typeof post.author.name === 'string' ? post.author.name : 
                           (post.author as any)?.displayName || 'Anonymous'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formattedCreatedAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 flex-shrink-0" />
                        <span>{formatNumber(views)} view{views === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {post.author.socials && typeof post.author.socials === 'object' && (
                  <div className="flex justify-center sm:justify-end">
                    <SocialLinks 
                      socials={post.author.socials} 
                      authorName={typeof post.author.name === 'string' ? post.author.name : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Action Bar */}
              <div className="hidden sm:flex items-center justify-between gap-4 mb-8 p-4 bg-gradient-to-r from-blue-100 shadow-sm to-blue-50 dark:from-teal-900/10 dark:to-blue-900/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <SocialShare 
                    url={`/blog/${post.id}`}
                    title={post.title}
                    description={post.content?.substring(0, 200) + '...'}
                    isCompact={true}
                  />
                </div>
                {AuthorActions}
              </div>

              {/* Mobile Action Bar */}
              <div className="sm:hidden mb-8">
                <div className="flex items-center justify-between gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex-1 min-w-0">
                    <SocialShare 
                      url={`/blog/${post.id}`}
                      title={post.title}
                      description={post.content?.substring(0, 200) + '...'}
                      isCompact={true}
                    />
                  </div>
                  {user?.uid === post.author.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowMobileActions(!showMobileActions)}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                        aria-label="Show actions"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Mobile Actions Dropdown */}
                {showMobileActions && user?.uid === post.author.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/blog/edit/${post.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 flex-1 justify-center"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Post
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete Post
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  <MarkdownViewer content={post.content || ''} className="w-full" />
                </div>
              </div>
            </div>
          </motion.article>
          
          {/* Bottom Navigation */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors group font-medium"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Enjoyed this post?
              </div>
              <div className="flex items-center gap-2">
                <SocialShare 
                  url={`/blog/${post.id}`}
                  title={post.title}
                  description={post.content?.substring(0, 200) + '...'}
                  isCompact={true}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}