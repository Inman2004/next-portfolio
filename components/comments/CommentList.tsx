import { memo, useRef, useEffect, useCallback } from 'react';
import { Loader2, Pin } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Comment } from './types';
import { CommentItem } from './CommentItem';

// Constants
const ESTIMATED_ROW_HEIGHT = 200; // Increased from 180 to account for larger spacing
const ROW_GAP = 16; // 16px gap between rows
const OVERSCAN = 5; // Number of items to render outside the viewport

interface CommentListProps {
  comments: Comment[];
  onVote: (id: string, type: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  currentUser: any;
  isAdmin: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  className?: string;
}

import type { VirtualItem as TanstackVirtualItem } from '@tanstack/react-virtual';

// Use the VirtualItem type from @tanstack/react-virtual
type VirtualItem = TanstackVirtualItem;

const CommentListComponent = ({
  comments,
  onVote,
  onDelete,
  onPin,
  currentUser,
  isAdmin,
  onLoadMore,
  hasMore,
  isLoadingMore,
  className = ''
}: CommentListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for infinite loading
  useEffect(() => {
    if (!loadingRef.current || !hasMore || isLoadingMore) return;

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
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : null;
    }


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
            comment={comment}
            onVote={onVote}
            onDelete={onDelete}
            onPin={onPin}
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    );
  }, [regularComments, hasMore, onVote, onDelete, onPin, currentUser, isAdmin]);

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
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              All Comments
            </h3>
          )}
          
          <div 
            ref={parentRef}
            className={`
              border border-blue-500/30 dark:border-blue-500/30 rounded-lg overflow-auto 
              bg-white/80 dark:bg-gray-900/30 backdrop-blur-sm
              scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-700/50 
              scrollbar-track-transparent hover:scrollbar-thumb-gray-500/50 
              dark:hover:scrollbar-thumb-gray-600/50 scrollbar-thumb-rounded-full
              transition-colors duration-200 scroll-smooth
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
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={loadingRef} className="h-1 w-full" />
    </div>
  );
};

export const CommentList = memo(CommentListComponent);
CommentList.displayName = 'CommentList';
