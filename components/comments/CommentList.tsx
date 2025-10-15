import { memo, useRef, useEffect, useCallback, useState, useContext } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Loader2, Pin } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Comment, User } from './types';
import { CommentItem } from './CommentItem';
import { enrichWithUserData } from '@/lib/userUtils';
import { AuthContext } from '@/contexts/AuthContext';

// Constants
const ESTIMATED_ROW_HEIGHT = 200; // Increased from 180 to account for larger spacing
const ROW_GAP = 16; // 16px gap between rows
const OVERSCAN = 5; // Number of items to render outside the viewport


import type { VirtualItem as TanstackVirtualItem } from '@tanstack/react-virtual';

// Use the VirtualItem type from @tanstack/react-virtual
type VirtualItem = TanstackVirtualItem;

interface CommentListProps {
  comments: Comment[];
  onVote: (id: string, type: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  isAdmin: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  className?: string;
}

const CommentListComponent = ({
  comments: initialComments,
  onVote,
  onDelete,
  onPin,
  isAdmin,
  onLoadMore,
  hasMore,
  isLoadingMore,
  className = ''
}: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isEnriching, setIsEnriching] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Get the current user from AuthContext and convert to our User type
  const auth = useContext(AuthContext);
  const currentUser: User | null = auth?.user ? {
    uid: auth.user.uid,
    displayName: auth.user.displayName || '',
    email: auth.user.email || null,
    photoURL: auth.user.photoURL || null
  } : null;
  
  // Helper to ensure we have a valid Date object
  const toDate = (timestamp: Timestamp | string | Date | undefined): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string') return new Date(timestamp);
    return timestamp.toDate();
  };
  
  // Enrich comments with user data
  useEffect(() => {
    const enrichComments = async () => {
      try {
        setIsEnriching(true);
        // Convert comments to the format expected by enrichWithUserData
        const commentsWithUserId = initialComments.map((comment: Comment) => ({
          ...comment,
          userId: comment.uid
        }));
        
        const enriched = await enrichWithUserData(commentsWithUserId);
        
        // Merge the enriched user data back into the comments
        const mergedComments = initialComments.map((comment: Comment) => {
          // Check if the current user is the author of a comment
          const isAuthor = (comment: Comment) => {
            return currentUser && comment.uid === currentUser.uid;
          };
  
          // Convert any user object to our User type
          const toCommentUser = (user: any): User => {
            if (!user) return {} as User; // Return empty user if user is null/undefined
            return {
              uid: user.uid || '',
              displayName: user.displayName || '',
              email: user.email || null,
              photoURL: user.photoURL || null
            };
          };

          // If this is the current user's comment, use their latest profile data
          if (currentUser && comment.uid === currentUser.uid) {
            return {
              ...comment,
              user: toCommentUser(currentUser)
            };
          }
          return {
            ...comment,
            user: toCommentUser(enriched.find((e: any) => e.userId === comment.uid)?.user)
          };
        });
        
        setComments(prev => {
          // Only update if the enriched data is different
          if (JSON.stringify(prev) !== JSON.stringify(mergedComments)) {
            return mergedComments;
          }
          return prev;
        });
      } catch (error) {
        console.error('Error enriching comments:', error);
      } finally {
        setIsEnriching(false);
      }
    };

    if (initialComments.length > 0) {
      enrichComments();
    } else {
      setIsEnriching(false);
    }
  }, [initialComments, currentUser?.uid, currentUser?.displayName, currentUser?.photoURL]);

  // Set up intersection observer for infinite loading
  useEffect(() => {
    if (isEnriching || !loadingRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Set up virtualizer for regular comments
  const regularComments = comments.filter(comment => !comment.isPinned);
  console.log('Regular comments count:', regularComments.length);
  
  const rowVirtualizer = useVirtualizer({
    count: hasMore ? regularComments.length + 1 : regularComments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT + ROW_GAP, // Add gap to row height
    overscan: OVERSCAN,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  
  // Debug logs
  useEffect(() => {
    console.log('Virtual items count:', virtualItems.length);
    console.log('Total size:', totalSize);
    console.log('Virtual items:', virtualItems.map(item => ({
      index: item.index,
      start: item.start,
      end: item.end,
      size: item.size,
      key: item.key,
    })));
  }, [virtualItems, totalSize]);

  // Memoize the row renderer
  const renderRow = useCallback((virtualRow: VirtualItem) => {
    const isLoaderRow = virtualRow.index > regularComments.length - 1;
    const comment = regularComments[virtualRow.index];
    
    // Skip if this is a gap element
    if (virtualRow.index > 0 && !comment) return null;

    if (isLoaderRow) {
      return hasMore ? (
        <div 
          key="loading" 
          className="flex justify-center p-6 mt-4"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      ) : null;
    }

    // Ensure we have a properly typed user object
    const commentUser = comment.user || {
      uid: comment.uid,
      displayName: comment.displayName || '',
      email: comment.email,
      photoURL: comment.photoURL
    };

    return (
      <div
        key={comment.id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size - ROW_GAP}px`,
          transform: `translateY(${virtualRow.start}px)`,
          marginBottom: `${ROW_GAP}px`,
          paddingBottom: `${ROW_GAP}px`
        }}
      >
        <div className="h-full">
          <CommentItem
            key={comment.id}
            comment={{
              ...comment,
              user: commentUser,
              // Ensure required fields are present with proper types
              id: comment.id,
              content: comment.content,
              timestamp: toDate(comment.timestamp),
              updatedAt: comment.updatedAt ? toDate(comment.updatedAt) : undefined,
              uid: comment.uid,
              parentId: comment.parentId,
              isPinned: comment.isPinned || false,
              upvotes: comment.upvotes || 0,
              downvotes: comment.downvotes || 0,
              upvoters: comment.upvoters || [],
              downvoters: comment.downvoters || [],
              mentions: comment.mentions || [],
              replies: comment.replies || [],
              edited: comment.edited || false,
              editHistory: comment.editHistory || []
            }}
            currentUser={currentUser}
            onVote={onVote}
            onDelete={onDelete}
            onPin={onPin}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    );
  }, [regularComments, hasMore, onVote, onDelete, onPin, isAdmin, currentUser]);

  // Separate pinned comments
  const pinnedComments = comments.filter(comment => comment.isPinned);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pinned comments section */}
      {pinnedComments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" />
            Pinned Comments
          </h3>
          <div className="space-y-4">
            {pinnedComments.map((comment) => (
              <CommentItem
                key={`pinned-${comment.id}`}
                comment={comment}
                onVote={onVote}
                onDelete={onDelete}
                onPin={onPin}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Virtualized regular comments */}
      {regularComments.length > 0 && (
        <div className="space-y-4">
          {pinnedComments.length > 0 && (
            <h3 className="text-sm font-medium text-zinc-400 mb-3">
              All Comments
            </h3>
          )}
          
          <div 
            ref={parentRef}
            className={`
              border border-zinc-900 dark:border-zinc-800/30 rounded-lg overflow-auto 
              bg-white/80 dark:bg-zinc-900/30 backdrop-blur-sm
              scrollbar-thin scrollbar-thumb-zinc-400/50 dark:scrollbar-thumb-zinc-700/50 
              scrollbar-track-transparent hover:scrollbar-thumb-zinc-500/50 
              dark:hover:scrollbar-thumb-zinc-600/50 scrollbar-thumb-rounded-full
              transition-colors duration-200 scroll-smooth
              p-4
            `}
            style={{ 
              minHeight: '300px',
              maxHeight: '70vh',
              scrollBehavior: 'smooth',
              // Custom scrollbar for Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            }}
          >
            <div
              style={{
                height: `${totalSize}px`,
                width: '100%',
                position: 'relative',
                padding: '8px 0',
              }}
            >
              {virtualItems.map(renderRow)}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={loadingRef} className="h-1 w-full" />
    </div>
  );
};

export const CommentList = memo(CommentListComponent);
CommentList.displayName = 'CommentList';
