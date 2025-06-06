'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { incrementViewCount, getViewCount } from '@/lib/views';
import { formatNumber } from '@/lib/formatNumber';
import MarkdownViewer from '@/components/MarkdownViewer';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paramsResolved, setParamsResolved] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [views, setViews] = useState<number>(0);

  // Resolve the async params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPostId(resolvedParams.id);
        setParamsResolved(true);
      } catch (err) {
        setError('Failed to load post parameters');
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  const handleDelete = () => {
    if (!post) {
      setError('Post not found');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
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
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
  };

  // Track views
  useEffect(() => {
    if (!postId) return;
    
    const trackView = async () => {
      try {
        const newViewCount = await incrementViewCount(postId);
        setViews(prev => prev || newViewCount);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };
    
    // Track view when component mounts
    trackView();
    
    // Set up real-time updates for view count
    const viewRef = doc(db, 'post_views', postId);
    const unsubscribeView = onSnapshot(viewRef, (doc) => {
      if (doc.exists()) {
        setViews(doc.data().count || 0);
      }
    });
    
    // Initial view count fetch
    const fetchInitialViews = async () => {
      try {
        const initialViews = await getViewCount(postId);
        setViews(initialViews);
      } catch (error) {
        console.error('Error fetching initial view count:', error);
      }
    };
    
    fetchInitialViews();
    
    return () => {
      unsubscribeView();
    };
  }, [postId]);
  
  // Single effect for auth state and post fetching
  useEffect(() => {
    if (!postId) return;
    
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Set admin status based on user email
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
        if (currentUser.email === adminEmail) {
          setIsAdmin(true);
        }
      }

      try {
        setLoading(true);
        setError(null);

        // Use the new getBlogPost utility function
        const postData = await getBlogPost(postId);

        if (!postData) {
          setError('Post not found');
          return;
        }

        // Map to the expected PostData type
        const formattedPost: PostData = {
          id: postData.id,
          title: postData.title,
          content: postData.content,
          author: {
            id: postData.authorId,
            name: postData.user?.displayName || postData.author || 'Anonymous',
            photoURL: postData.user?.photoURL || postData.authorPhotoURL || null,
          },
          createdAt: postData.createdAt,
          coverImage: postData.coverImage,
          excerpt: postData.excerpt,
          published: postData.published,
          isAdmin: postData.isAdmin,
          tags: postData.tags
        };

        setPost(formattedPost);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  // Format date for display
  const formatCreatedAt = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'MMMM d, yyyy');
  };

  const getPostDateTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toISOString();
  };

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
      <div className="pt-24 px-6 max-w-4xl mx-auto">
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
              <Image
                src={post.author.photoURL || '/default-avatar.png'}
                alt={post.author.name}
                width={48}
                height={48}
                className="object-cover rounded-full"
                sizes="48px"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                <span>By {post.author.name}</span>
                <span className="hidden sm:inline">•</span>
                <span>{formatCreatedAt(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>{formatNumber(views)} {views === 1 ? 'view' : 'views'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 bg-gray-50/80 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-200/70 dark:border-gray-800">
            <SocialShare 
              url={`/blog/${post.id}`}
              title={post.title}
              description={post.content?.substring(0, 200) + '...'}
              isCompact={true}
            />
            {user?.uid === post.author.id && (
              <div className="flex items-center gap-2">
                <span className="h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
                <Link
                  href={`/blog/edit/${post.id}`}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                  title="Edit post"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-gray-700/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete post"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
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
                  className="object-cover rounded-t-lg md:rounded-t-2xl shadow-xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900/80 dark:from-black/80 to-transparent" />
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