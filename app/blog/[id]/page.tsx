'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { PostData } from '@/types';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBlogPost } from '@/lib/blogUtils';
import { Crown, Edit, Eye, ArrowLeft, Trash2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-x-hidden w-full transition-colors duration-200">
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-2xl border border-gray-200/70 dark:border-gray-700/50"
        >
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-shrink-0">
              <UserAvatar
                photoURL={typeof post.author.photoURL === 'string' ? post.author.photoURL : undefined}
                displayName={typeof post.author.name === 'string' ? post.author.name : 
                           (post.author as any)?.displayName || '?'}
                size={48}
                className={post.author.username ? 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 transition-all' : ''}
                asLink={!!post.author.username}
                linkHref={post.author.username ? `/users/${post.author.username}` : undefined}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                title={typeof post.author.name === 'string' ? post.author.name : 
                      (post.author as any)?.name || 'Author'}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  By{' '}
                  {post.author.username ? (
                    <Link 
                      href={`/users/${post.author.username}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {typeof post.author.name === 'string' ? post.author.name : 
                       (post.author as any)?.displayName || 'Anonymous'}
                    </Link>
                  ) : (
                    <span>
                      {typeof post.author.name === 'string' ? post.author.name : 
                       (post.author as any)?.displayName || 'Anonymous'}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{formattedCreatedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>{formatNumber(views)} {views === 1 ? 'view' : 'views'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-gray-50/80 dark:bg-gray-900/30 p-3 sm:p-4 rounded-xl border border-gray-200/70 dark:border-gray-800">
            <div className="w-full flex justify-center items-center sm:w-auto">
              <SocialShare 
                url={`/blog/${post.id}`}
                title={post.title}
                description={post.content?.substring(0, 200) + '...'}
                isCompact={true}
              />
              {post.author.socials && typeof post.author.socials === 'object' && (
                <div className="mx-2">
                  <SocialLinks 
                    socials={post.author.socials} 
                    authorName={typeof post.author.name === 'string' ? post.author.name : undefined}
                  />
                </div>
              )}
            </div>
            {user?.uid === post.author.id && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-normal border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-0 sm:border-t-0 sm:pl-3 sm:border-l">
                <Link
                  href={`/blog/edit/${post.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Edit Post</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current flex-shrink-0"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {post.coverImage && (
            <div className="relative mb-8 -mx-6 md:-mx-8 lg:-mt-6 md:-mt-8 border-b-2 border-indigo-500">
              <div className="relative w-full h-64 md:h-96">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover opacity-40 hover:opacity-90 transition-opacity rounded-t-lg md:rounded-t-2xl shadow-xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900/80 dark:from-black/80 to-transparent" />
              </div>
            </div>
          )}

          <div className="mt-8">
            <MarkdownViewer content={post.content || ''} className="max-w-4xl mx-auto" />
          </div>
        </motion.article>
        
        <motion.div
          className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-2xl border border-gray-200/70 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all posts
          </Link>

          <div className="flex justify-end">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 rounded-full bg-gray-200/70 hover:bg-gray-300/70 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 transition-colors"
              aria-label="Back to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </motion.div>

        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
        />
      </div>
    </div>
  );
                        }
