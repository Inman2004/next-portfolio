'use client';

import { useEffect, useState, use } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Fragment } from 'react';
import { User } from 'firebase/auth';
import { PostData } from '@/types';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Crown, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { auth } from '@/lib/firebase';

interface Author {
  id: string;
  name: string;
  photoURL?: string;
}

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

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setParamsResolved(true);
        return resolvedParams.id;
      } catch (error) {
        setError('Failed to load post parameters');
        return null;
      }
    };
    resolveParams();
  }, [params]);

  const id = paramsResolved ? use(params).id : null;

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
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) {
      setError('Invalid post ID');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postRef = doc(db, 'blogPosts', id);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        const postData: PostData = {
          id: id,
          title: postDoc.data().title || '',
          content: postDoc.data().content || '',
          author: {
            id: postDoc.data().author?.id || '',
            name: postDoc.data().author?.name || '',
            photoURL: postDoc.data().author?.photoURL || '',
          },
          createdAt: postDoc.data().createdAt,
          image: postDoc.data().image
        };

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

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

  // Format date for display
  const formatCreatedAt = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'MMMM d, yyyy');
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) {
      setError('Invalid post ID');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postRef = doc(db, 'blogPosts', id);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        const postData: PostData = {
          id: id,
          title: postDoc.data().title || '',
          content: postDoc.data().content || '',
          author: {
            id: postDoc.data().author?.id || '',
            name: postDoc.data().author?.name || '',
            photoURL: postDoc.data().author?.photoURL || '',
          },
          createdAt: postDoc.data().createdAt,
          image: postDoc.data().image
        };

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) {
      setError('Invalid post ID');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postRef = doc(db, 'blogPosts', id);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        const postData: PostData = {
          id: id,
          title: postDoc.data().title || '',
          content: postDoc.data().content || '',
          author: {
            id: postDoc.data().author?.id || '',
            name: postDoc.data().author?.name || '',
            photoURL: postDoc.data().author?.photoURL || '',
          },
          createdAt: postDoc.data().createdAt,
          image: postDoc.data().image
        };
        
        setPost(postData);
        setIsAdmin(user?.email === 'your-admin-email@example.com');

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <img
                src={post.author.photoURL || '/default-avatar.png'}
                alt={`${post.author.name}'s avatar`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{post.title}</h1>
                <p className="text-gray-400">
                  By {post.author.name} • {formatCreatedAt(post.createdAt)}
                </p>
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

          {post.image && (
            <div className="relative mb-6">
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-lg shadow-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
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
  );
}