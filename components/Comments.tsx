'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion as m } from 'framer-motion';
import { Loader2, ChevronDown, Clock, Flame, Check, Pin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { formatNumber } from '@/lib/formatNumber';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  startAfter,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
  Query
} from 'firebase/firestore';

// Import our modular components
import { CommentList } from './comments/CommentList';
import { CommentForm } from './comments/CommentForm';
import { CommentItem } from './comments/CommentItem';
import { CommentSkeleton } from './comments/CommentSkeleton';
import { ADMIN_EMAIL, type Comment, type User } from './comments/types';

const COMMENTS_PER_PAGE = 10;

const Comments = () => {
  console.log('Comments component mounted');
  const { user: authUser } = useAuth();
  // Cast auth user to our User type
  const user = useMemo(() => ({
    uid: authUser?.uid || '',
    displayName: authUser?.displayName || 'Anonymous',
    email: authUser?.email || null,
    photoURL: authUser?.photoURL || null
  }), [authUser]);
  
  // Admin status
  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user?.email]);
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const totalComments = comments.length;
  
  // Refs
  const lastVisibleRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  
  // Load comments on mount and when sort changes
  useEffect(() => {
    loadInitialComments();
    
    // Set up real-time listener
    const commentsRef = collection(db, 'comments');
    let q = query(
      commentsRef,
      orderBy(sortBy === 'newest' ? 'timestamp' : 'upvotes', 'desc'),
      limit(COMMENTS_PER_PAGE)
    ) as Query<DocumentData>;
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp || Timestamp.now(),
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          upvoters: data.upvoters || [],
          downvoters: data.downvoters || [],
          isPinned: data.isPinned || false,
        } as Comment;
      });
      
      setComments(updatedComments);
      
      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setError('Failed to load real-time updates. Please refresh the page.');
    });
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [sortBy]);
  
  // Handle comment submission
  const handleSubmit = async (content: string) => {
    if (!user) {
      setError('You must be logged in to post a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get user data from Firestore to get the username
      let username = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          username = userData.username || null;
        }
      } catch (error) {
        console.error('Error fetching user data for username:', error);
      }
      
      const commentData = {
        uid: user.uid,
        username: username,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        content: content.trim(),
        timestamp: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        isPinned: false,
        email: user.email || '',
        upvoters: [],
        downvoters: []
      };
      
      await addDoc(collection(db, 'comments'), commentData);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to post comment. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Convert Firebase User to our User type
  const currentUser: User | null = user ? {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    email: user.email || '',
    photoURL: user.photoURL || undefined
  } : null;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }
  
  // Define common classes
  const containerClasses = 'max-w-5xl mx-auto px-4 py-8';
  const sectionTitleClasses = 'text-2xl font-bold text-zinc-900 dark:text-white';
  const sortButtonClasses = 'flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 border border-zinc-400 dark:border-zinc-700/50 rounded-lg transition-colors';
  const sortOptionClasses = (isActive: boolean) => `w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
    isActive 
      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50'
  }`;
  const pinnedLabelClasses = 'flex items-center gap-2 mb-3';
  const pinnedTextClasses = 'text-sm font-medium text-yellow-600 dark:text-yellow-400';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-10 w-full">
        {/* Comment Form */}
        <div className="space-y-6 w-full">
          <h2 className={sectionTitleClasses}>Leave a Comment</h2>
          <CommentForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            currentUser={currentUser}
            placeholder="Share your thoughts..."
            className="bg-white/50 dark:bg-zinc-800/50 border border-zinc-900 dark:border-zinc-700/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          />
        </div>

        {/* Comments List */}
        <div className="space-y-8 w-full">
          <div className="flex justify-between items-center">
            <h2 className={sectionTitleClasses}>
              {sortBy === 'newest' ? 'Latest Comments' : 'Top Comments'}
            </h2>
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={sortButtonClasses}
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                {sortBy === 'newest' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Flame className="w-4 h-4" />
                )}
                <span>{sortBy === 'newest' ? 'Newest' : 'Top'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-lg z-10 overflow-hidden border border-zinc-400 dark:border-zinc-700/50">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={sortOptionClasses(sortBy === 'newest')}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Newest</span>
                    {sortBy === 'newest' && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    onClick={() => handleSortChange('top')}
                    className={sortOptionClasses(sortBy === 'top')}
                  >
                    <Flame className="w-4 h-4" />
                    <span>Top</span>
                    {sortBy === 'top' && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6">
            {isLoading && !comments.length ? (
              // Show skeleton loaders for initial load
              Array.from({ length: 3 }).map((_, i) => (
                <CommentSkeleton key={`skeleton-${i}`} />
              ))
            ) : (
              <CommentList 
                comments={comments} 
                onVote={handleVote}
                onDelete={handleDelete}
                onPin={handlePin}
                isAdmin={isAdmin}
                onLoadMore={loadMoreComments}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Handle sort change
  function handleSortChange(newSort: 'newest' | 'top') {
    setSortBy(newSort);
    setIsSortOpen(false);
    // Reset pagination and reload comments
    lastVisibleRef.current = null;
    setHasMore(true);
    loadInitialComments();
  }
  
  // Handle comment deletion
  async function handleDelete(id: string) {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'comments', id));
      setComments(prev => prev.filter(comment => comment.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  }
  
  // Handle comment pinning
  async function handlePin(id: string, isPinned: boolean) {
    if (!isAdmin) return;
    
    try {
      await updateDoc(doc(db, 'comments', id), { isPinned });
      setComments(prev => 
        prev.map(comment => 
          comment.id === id ? { ...comment, isPinned } : comment
        )
      );
    } catch (error) {
      console.error('Error pinning comment:', error);
      setError('Failed to pin comment. Please try again.');
    }
  }
  
  // Handle comment voting
  async function handleVote(id: string, type: 'up' | 'down') {
    if (!user) {
      setError('Please sign in to vote');
      return;
    }

    try {
      const commentRef = doc(db, 'comments', id);
      const comment = comments.find(c => c.id === id);
      
      if (!comment) {
        console.log('Comment not found in local state');
        return;
      }

      // Check if user has already voted
      const hasUpvoted = comment.upvoters?.includes(user.uid) || 
                       (user.email === ADMIN_EMAIL && comment.upvoters?.includes(ADMIN_EMAIL));
      const hasDownvoted = comment.downvoters?.includes(user.uid) || 
                          (user.email === ADMIN_EMAIL && comment.downvoters?.includes(ADMIN_EMAIL));

      // First, check if the document exists
      const docSnap = await getDoc(commentRef);
      if (!docSnap.exists()) {
        console.log('Comment no longer exists in Firestore');
        setComments(prev => prev.filter(c => c.id !== id));
        return;
      }

      // Update local state optimistically
      if ((type === 'up' && hasUpvoted) || (type === 'down' && hasDownvoted)) {
        // Remove vote
        updateLocalVote(id, type, 'remove');
        
        const voteField = type === 'up' ? 'upvotes' : 'downvotes';
        const votersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        const updates: any = {
          [voteField]: Math.max(0, (comment[voteField] || 0) - 1),
          [votersField]: arrayRemove(user.uid)
        };
        
        // If this is the admin, also remove their email
        if (user.email === ADMIN_EMAIL) {
          updates[votersField] = arrayRemove(ADMIN_EMAIL);
        }
        
        await updateDoc(commentRef, updates);
      } else if ((type === 'up' && hasDownvoted) || (type === 'down' && hasUpvoted)) {
        // Switch vote
        updateLocalVote(id, type, 'switch');
        
        const oldVoteField = type === 'up' ? 'downvotes' : 'upvotes';
        const newVoteField = type === 'up' ? 'upvotes' : 'downvotes';
        const oldVotersField = type === 'up' ? 'downvoters' : 'upvoters';
        const newVotersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        const updates: any = {
          [oldVoteField]: Math.max(0, (comment[oldVoteField] || 0) - 1),
          [newVoteField]: (comment[newVoteField] || 0) + 1,
          [oldVotersField]: arrayRemove(user.uid),
          [newVotersField]: arrayUnion(user.uid)
        };
        
        // Handle admin email in voters
        if (user.email === ADMIN_EMAIL) {
          updates[oldVotersField] = arrayRemove(ADMIN_EMAIL);
          updates[newVotersField] = arrayUnion(ADMIN_EMAIL);
        }
        
        await updateDoc(commentRef, updates);
      } else {
        // New vote
        updateLocalVote(id, type, 'add');
        
        const voteField = type === 'up' ? 'upvotes' : 'downvotes';
        const votersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        const updates: any = {
          [voteField]: (comment[voteField] || 0) + 1,
          [votersField]: arrayUnion(user.uid)
        };
        
        // Handle admin email in voters
        if (user.email === ADMIN_EMAIL) {
          updates[votersField] = arrayUnion(ADMIN_EMAIL);
        }
        
        await updateDoc(commentRef, updates);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      setError('Failed to update vote. Please try again.');
      // Revert optimistic update on error
      loadInitialComments();
    }
  }
  
  // Update local state after a vote
  function updateLocalVote(id: string, type: 'up' | 'down', action: 'add' | 'remove' | 'switch') {
    setComments(prev => prev.map(comment => {
      if (comment.id !== id) return comment;
      
      const updatedComment = { ...comment };
      
      if (action === 'add') {
        // Add new vote
        const voteField = type === 'up' ? 'upvotes' : 'downvotes';
        const votersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        updatedComment[voteField] = (updatedComment[voteField] || 0) + 1;
        updatedComment[votersField] = [...(updatedComment[votersField] || []), user.uid];
        
        // Add admin email if needed
        if (user.email === ADMIN_EMAIL && !updatedComment[votersField].includes(ADMIN_EMAIL)) {
          updatedComment[votersField].push(ADMIN_EMAIL);
        }
      } else if (action === 'remove') {
        // Remove vote
        const voteField = type === 'up' ? 'upvotes' : 'downvotes';
        const votersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        updatedComment[voteField] = Math.max(0, (updatedComment[voteField] || 0) - 1);
        updatedComment[votersField] = (updatedComment[votersField] || []).filter(
          (voter: string) => voter !== user.uid && (user.email !== ADMIN_EMAIL || voter !== ADMIN_EMAIL)
        );
      } else if (action === 'switch') {
        // Switch vote
        const oldVoteField = type === 'up' ? 'downvotes' : 'upvotes';
        const newVoteField = type === 'up' ? 'upvotes' : 'downvotes';
        const oldVotersField = type === 'up' ? 'downvoters' : 'upvoters';
        const newVotersField = type === 'up' ? 'upvoters' : 'downvoters';
        
        // Remove old vote
        updatedComment[oldVoteField] = Math.max(0, (updatedComment[oldVoteField] || 0) - 1);
        updatedComment[oldVotersField] = (updatedComment[oldVotersField] || []).filter(
          (voter: string) => voter !== user.uid && (user.email !== ADMIN_EMAIL || voter !== ADMIN_EMAIL)
        );
        
        // Add new vote
        updatedComment[newVoteField] = (updatedComment[newVoteField] || 0) + 1;
        updatedComment[newVotersField] = [...(updatedComment[newVotersField] || []), user.uid];
        
        // Add admin email if needed
        if (user.email === ADMIN_EMAIL && !updatedComment[newVotersField].includes(ADMIN_EMAIL)) {
          updatedComment[newVotersField].push(ADMIN_EMAIL);
        }
      }
      
      return updatedComment;
    }));
  }
  
  // Load initial comments
  async function loadInitialComments() {
    setIsLoading(true);
    setError('');
    
    try {
      const commentsRef = collection(db, 'comments');
      let q = query(
        commentsRef,
        orderBy(sortBy === 'newest' ? 'timestamp' : 'upvotes', 'desc'),
        limit(COMMENTS_PER_PAGE)
      ) as Query<DocumentData>;
      
      const snapshot = await getDocs(q);
      const loadedComments: Comment[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedComments.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || Timestamp.now(),
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          upvoters: data.upvoters || [],
          downvoters: data.downvoters || [],
          isPinned: data.isPinned || false,
        } as Comment);
      });
      
      setComments(loadedComments);
      
      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Load more comments for infinite scroll
  async function loadMoreComments() {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const commentsRef = collection(db, 'comments');
      let q = query(
        commentsRef,
        orderBy(sortBy === 'newest' ? 'timestamp' : 'upvotes', 'desc'),
        startAfter(lastVisibleRef.current),
        limit(COMMENTS_PER_PAGE)
      ) as Query<DocumentData>;
      
      const snapshot = await getDocs(q);
      const newComments: Comment[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        newComments.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || Timestamp.now(),
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          upvoters: data.upvoters || [],
          downvoters: data.downvoters || [],
          isPinned: data.isPinned || false,
        } as Comment);
      });
      
      setComments(prev => [...prev, ...newComments]);
      
      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
      setError('Failed to load more comments. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }
  
  // Set up real-time listener for comments
  useEffect(() => {
    if (!user) return;
    
    const commentsRef = collection(db, 'comments');
    let q = query(
      commentsRef,
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || Timestamp.now(),
        upvotes: doc.data().upvotes || 0,
        downvotes: doc.data().downvotes || 0,
        upvoters: doc.data().upvoters || [],
        downvoters: doc.data().downvoters || [],
        isPinned: doc.data().isPinned || false,
      } as Comment));
      
      setComments(updatedComments);
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setError('Failed to sync comments. Please refresh the page.');
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [user]);
  
  // Load initial comments when component mounts or sort changes
  useEffect(() => {
    loadInitialComments();
  }, [sortBy]);
  
  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortOpen && !(event.target as Element).closest('.sort-container')) {
        setIsSortOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);
  
  // Add sort-container class to the sort dropdown container
  const sortContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Leave a Comment</h2>
        <CommentForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          currentUser={currentUser}
          placeholder="Share your thoughts..."
        />
      </div>
      
      {/* Comments Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>
        
        {/* Sort Dropdown */}
        <div className="relative sort-container" ref={sortContainerRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors"
          >
            {sortBy === 'newest' ? (
              <>
                <Clock size={16} />
                <span>Newest</span>
              </>
            ) : (
              <>
                <Flame size={16} />
                <span>Top</span>
              </>
            )}
            <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortOpen && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10 overflow-hidden"
            >
              <button
                onClick={() => handleSortChange('newest')}
                className={`w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 ${sortBy === 'newest' ? 'text-emerald-400' : ''}`}
              >
                <Clock size={16} />
                <span>Newest</span>
                {sortBy === 'newest' && <Check size={16} className="ml-auto" />}
              </button>
              <button
                onClick={() => handleSortChange('top')}
                className={`w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 ${sortBy === 'top' ? 'text-emerald-400' : ''}`}
              >
                <Flame size={16} />
                <span>Top</span>
                {sortBy === 'top' && <Check size={16} className="ml-auto" />}
              </button>
            </m.div>
          )}
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <CommentList
            comments={comments}
            onVote={handleVote}
            onDelete={handleDelete}
            onPin={handlePin}
            isAdmin={isAdmin}
            onLoadMore={loadMoreComments}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>
    </div>
  );
};

export default Comments;