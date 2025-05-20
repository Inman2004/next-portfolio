import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Trash2, Loader2, Pin, User, Crown, Heart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  Timestamp,
  serverTimestamp,
  FirestoreError,
  where,
  getDocs,
  arrayRemove,
  arrayUnion,
  limit
} from 'firebase/firestore';
import Image from 'next/image';

interface Comment {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  content: string;
  timestamp: Timestamp;
  upvotes: number;
  downvotes: number;
  isPinned?: boolean;
  email: string;
  upvoters: string[];
  downvoters: string[];
}

const ADMIN_EMAIL = "rvimman@gmail.com";

  const Comments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    content: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexBuilding, setIsIndexBuilding] = useState(false);

  // Function to update all comments by a user
  const updateUserComments = async (userId: string, updates: { displayName?: string; photoURL?: string | null | undefined }) => {
    try {
      const commentsRef = collection(db, 'comments');
      const userCommentsQuery = query(commentsRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(userCommentsQuery);

      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const commentRef = doc(db, 'comments', docSnapshot.id);
        await updateDoc(commentRef, updates);
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating user comments:', error);
    }
  };

  // Watch for user profile changes
  useEffect(() => {
    if (user) {
      updateUserComments(user.uid, {
        displayName: user.displayName ?? '',
        photoURL: user.photoURL
      });
    }
  }, [user?.displayName, user?.photoURL]);

  // Initialize comments collection if needed and subscribe
  useEffect(() => {
    const initializeComments = async () => {
      try {
        // Check if comments collection exists
        const commentsRef = collection(db, 'comments');
        const q = query(commentsRef, limit(1));
        const snapshot = await getDocs(q);
        
        // If no documents exist, create a dummy document to initialize the collection
        if (snapshot.empty) {
          await addDoc(commentsRef, {
            uid: 'system',
            displayName: 'System',
            photoURL: '',
            content: 'Comments collection initialized',
            timestamp: serverTimestamp(),
            upvotes: 0,
            downvotes: 0,
            isPinned: false,
            email: 'system@comments.com',
            upvoters: [],
            downvoters: []
          });
        }
      } catch (error) {
        console.error('Error initializing comments:', error);
      }
    };

    initializeComments();
  }, []);

  // Subscribe to comments collection
  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, 'comments'),
      orderBy('isPinned', 'desc'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          commentsData.push({
            id: doc.id,
            uid: data.uid || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL || '',
            content: data.content || '',
            timestamp: data.timestamp,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            isPinned: data.isPinned || false,
            email: data.email || '',
            upvoters: data.upvoters || [],
            downvoters: data.downvoters || []
          });
        });
        setComments(commentsData);
        setIsLoading(false);
        setIsIndexBuilding(false);
      },
      (error: FirestoreError) => {
        console.error('Error fetching comments:', error);
        if (error.code === 'failed-precondition' || error.code === 'resource-exhausted') {
          setIsIndexBuilding(true);
        } else {
          setError('Failed to load comments. Please refresh the page.');
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to comment');
      return;
    }

    if (!user.displayName) {
      setError('Please set up your profile with a display name before commenting');
      return;
    }

    if (!newComment.content.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'comments'), {
        uid: user.uid,
        displayName: user.displayName ? user.displayName : 'Anonymous',
        photoURL: user.photoURL || '',
        email: user.email ? user.email : 'anonymous@example.com',
        content: newComment.content.trim(),
        timestamp: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        upvoters: [],
        downvoters: [],
        isPinned: user.email === ADMIN_EMAIL
      });

      setNewComment({ content: '' });
      setIsSubmitting(false);
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      console.error('Error adding comment:', err);
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (!user) {
      setError('Please sign in to vote');
      return;
    }

    try {
      const commentRef = doc(db, 'comments', id);
      const comment = comments.find(c => c.id === id);
      if (!comment) return;

      // Check if user has already voted
      const hasUpvoted = comment.upvoters?.includes(user.uid);
      const hasDownvoted = comment.downvoters?.includes(user.uid);

      if (type === 'up' && hasUpvoted || type === 'down' && hasDownvoted) {
        // Remove vote
        await updateDoc(commentRef, {
          [type === 'up' ? 'upvotes' : 'downvotes']: (comment[type === 'up' ? 'upvotes' : 'downvotes'] || 0) - 1,
          [type === 'up' ? 'upvoters' : 'downvoters']: arrayRemove(user.uid)
        });
      } else if (type === 'up' && hasDownvoted || type === 'down' && hasUpvoted) {
        // Switch vote
        await updateDoc(commentRef, {
          [type === 'up' ? 'upvotes' : 'downvotes']: (comment[type === 'up' ? 'upvotes' : 'downvotes'] || 0) + 1,
          [(type === 'up' ? 'downvotes' : 'upvotes')]: (comment[type === 'up' ? 'downvotes' : 'upvotes'] || 0) - 1,
          [type === 'up' ? 'upvoters' : 'downvoters']: arrayUnion(user.uid),
          [type === 'up' ? 'downvoters' : 'upvoters']: arrayRemove(user.uid)
        });
      } else {
        // New vote
        await updateDoc(commentRef, {
          [type === 'up' ? 'upvotes' : 'downvotes']: (comment[type === 'up' ? 'upvotes' : 'downvotes'] || 0) + 1,
          [type === 'up' ? 'upvoters' : 'downvoters']: arrayUnion(user.uid)
        });
      }
    } catch (err) {
      console.error('Error updating vote:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    // Only allow deletion if user is admin or comment author
    if (user.email !== ADMIN_EMAIL && user.uid !== comment.uid) return;

    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    try {
      const commentRef = doc(db, 'comments', id);
      await updateDoc(commentRef, {
        isPinned: !isPinned
      });
    } catch (err) {
      console.error('Error pinning comment:', err);
    }
  };

  // Simplified admin check function
  const isAdminComment = (email: string) => email === ADMIN_EMAIL;

  return (
    <>
    <div className="flex flex-col items-center justify-center mb-10">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        Comments
      </h2>
      <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
        {user ? 'Share your thoughts' : 'Sign in to join the conversation'}
      </p>
    </div>
    <div className="w-full max-w-4xl mx-auto">
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-gray-800/50 rounded-xl p-6 mb-8 ${
            user.email === ADMIN_EMAIL ? 'border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : ''
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 relative">
                {user.email === ADMIN_EMAIL && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500/20 rounded-full p-1 z-10"
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                )}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User avatar'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <textarea
                  id="comment"
                  value={newComment.content}
                  onChange={(e) => setNewComment({ content: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    user.email === ADMIN_EMAIL 
                      ? 'border-yellow-500/30 focus:border-yellow-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  placeholder="Share your thoughts..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
                  user.email === ADMIN_EMAIL
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : isIndexBuilding ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-400 text-center">
              Building comment index... This may take a few moments.
            </p>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const isAdmin = isAdminComment(comment.email);
            const canModify = user && (user.email === ADMIN_EMAIL || user.uid === comment.uid);
            
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800/30 rounded-xl p-6 border ${
                  comment.email === ADMIN_EMAIL
                    ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                    : 'border-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      {comment.email === ADMIN_EMAIL && (
                        <motion.div 
                          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500/20 rounded-full p-1 z-10"
                          initial={{ y: -5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      )}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        {comment.photoURL ? (
                          <Image
                            src={comment.photoURL}
                            alt={comment.displayName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-lg font-semibold ${
                        comment.email === ADMIN_EMAIL
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent'
                          : 'text-white'
                      }`}>
                        {comment.displayName}
                        {comment.email === ADMIN_EMAIL && (<>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                            Author
                          </span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                          Admin
                        </span></>
                        )}
                      </h4>
                      {comment.isPinned && (
                        <motion.div
                          initial={{ rotate: -45 }}
                          animate={{ rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Pin className={`w-4 h-4 ${isAdmin ? 'text-yellow-500' : 'text-gray-400'}`} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.email === ADMIN_EMAIL && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePin(comment.id, comment.isPinned || false)}
                        className={`text-gray-400 hover:text-yellow-500 transition-colors ${
                          comment.isPinned ? 'text-yellow-500' : ''
                        }`}
                        aria-label={comment.isPinned ? 'Unpin comment' : 'Pin comment'}
                      >
                        <Pin className="w-4 h-4" />
                      </motion.button>
                    )}
                    {canModify && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote(comment.id, 'up')}
                      className={`flex items-center gap-2 transition-colors relative ${
                        comment.upvoters?.includes(user?.uid || '')
                          ? 'text-blue-400'
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                      disabled={!user}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.upvotes}</span>
                      {comment.upvoters?.some(uid => {
                        const voter = comments.find(c => c.uid === uid);
                        return voter?.email === ADMIN_EMAIL;
                      }) && (
                        <div className="absolute -top-4 -right-4 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-500 bg-white">
                            <Image
                              src={comments.find(c => c.email === ADMIN_EMAIL)?.photoURL || '/default-avatar.png'}
                              alt="Admin vote"
                              className="w-full h-full object-cover "
                              width={24}
                              height={24}
                            />
                          </div>
                          <Heart className="w-3 h-3 text-red-500 absolute -bottom-1 -right-1" fill="currentColor" />
                        </div>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote(comment.id, 'down')}
                      className={`flex items-center gap-2 transition-colors relative ${
                        comment.downvoters?.includes(user?.uid || '')
                          ? 'text-red-400'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      disabled={!user}
                    >
                      <ThumbsDown className="w-4 h-4 ml-6" />
                      <span>{comment.downvotes}</span>
                      {comment.downvoters?.some(uid => {
                        const voter = comments.find(c => c.uid === uid);
                        return voter?.email === ADMIN_EMAIL;
                      }) && (
                        <div className="absolute -top-4 -right-4 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-500">
                            <Image
                              src={comments.find(c => c.email === ADMIN_EMAIL)?.photoURL || '/default-avatar.png'}
                              alt="Admin vote"
                              className="w-full h-full object-cover"
                              width={24}
                              height={24}
                            />
                          </div>
                          <Heart className="w-3 h-3 text-amber-500 absolute -bottom-1 -right-1" fill="currentColor" />
                        </div>
                      )}
                    </motion.button>
                    <span className="text-sm text-gray-400">
                      {comment.timestamp?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}

export default Comments; 