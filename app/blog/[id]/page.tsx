'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { PostData } from '@/types';
import { doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Crown, Edit, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { incrementViewCount, getViewCount } from '@/lib/views';
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

        const postRef = doc(db, 'blogPosts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        const postData: PostData = {
          id: postDoc.id,
          title: postDoc.data().title || '',
          content: postDoc.data().content || '',
          author: {
            id: postDoc.data().authorId || postDoc.data().author?.id || '',
            name: postDoc.data().author || postDoc.data().author?.name || '',
            photoURL: postDoc.data().authorPhotoURL || postDoc.data().author?.photoURL || '',
          },
          createdAt: postDoc.data().createdAt,
          coverImage: postDoc.data().coverImage || postDoc.data().image
        };

        setPost(postData);
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full">
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={post.author.photoURL || '/default-avatar.png'}
                  alt={`${post.author.name}'s avatar`}
                  fill
                  className="object-cover"
                  sizes="48px"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span>By {post.author.name}</span>
                  <span>•</span>
                  <span>{formatCreatedAt(post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
                  </span>
                </div>
              </div>
            </div>
            {user?.uid === post.author.id && (
              <div className="flex gap-4">
                <Link
                  href={`/blog/edit/${post.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4 inline-block" />
                  <span className="ml-2">Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 inline-block" />
                      Delete
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {post.coverImage && (
            <div className="relative mb-8 -mx-6 md:-mx-8 -mt-6 md:-mt-8">
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
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          )}

          <div className="mt-8">
            <MarkdownViewer content={post.content || ''} className="max-w-4xl mx-auto" />
          </div>
        </motion.article>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
      <motion.div
        className="mt-16 pt-8 pb-12 px-4 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto"
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
  );
}