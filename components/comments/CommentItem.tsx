import { memo, useMemo, useState, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Trash2, Pin, Crown } from 'lucide-react';
import { formatNumber } from '@/lib/formatNumber';
import { UserAvatar } from '@/components/ui/UserAvatar';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommentItemProps, ADMIN_EMAIL } from './types';
import { isValidUrl } from '@/lib/urlUtils';

export const CommentItem = memo(({ 
  comment, 
  onVote, 
  onDelete, 
  onPin, 
  currentUser,
  isAdmin 
}: CommentItemProps) => {
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(comment.username || null);
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);

  // Fetch username if not available
  useEffect(() => {
    if (!comment.username && comment.uid && !resolvedUsername) {
      const fetchUsername = async () => {
        setIsLoadingUsername(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', comment.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.username) {
              setResolvedUsername(userData.username);
            }
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        } finally {
          setIsLoadingUsername(false);
        }
      };
      
      fetchUsername();
    }
  }, [comment.uid, comment.username, resolvedUsername]);

  // Use resolved username or fallback to uid for navigation
  const profileLink = resolvedUsername ? `/users/${resolvedUsername}` : comment.uid ? `/users/${comment.uid}` : null;
  const isClickable = !!profileLink;

  const isAdminComment = comment.email === ADMIN_EMAIL;
  const isCurrentUserAdmin = currentUser?.email === ADMIN_EMAIL;
  const isCommentAuthor = currentUser?.uid === comment.uid;
  const canModify = isCurrentUserAdmin || isCommentAuthor;
  
  // Comment interface includes username field

  // Styling classes
  const metaClasses = 'text-sm text-zinc-600 dark:text-zinc-400';
  const contentClasses = 'mt-3 text-zinc-800 dark:text-zinc-200 leading-relaxed break-words text-base';
  const actionClasses = 'flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50';
  const buttonClasses = 'flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50';
  const iconClasses = (isActive: boolean) => `w-4 h-4 flex-shrink-0 ${isActive ? 'fill-blue-600 dark:fill-blue-400' : ''} ${isActive && userVote === 'down' ? 'fill-red-500 dark:fill-red-400' : ''}`;
  const voteButtonClasses = (isActive: boolean) => `flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md transition-colors ${
    isActive 
      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
      : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50'
  }`;
  
  const userVote = useMemo(() => {
    if (!currentUser?.uid) return null;
    
    if (comment.upvoters?.includes(currentUser.uid) || 
        (currentUser?.email === ADMIN_EMAIL && comment.upvoters?.includes(ADMIN_EMAIL))) {
      return 'up';
    }
    
    if (comment.downvoters?.includes(currentUser.uid) || 
        (currentUser?.email === ADMIN_EMAIL && comment.downvoters?.includes(ADMIN_EMAIL))) {
      return 'down';
    }
    
    return null;
  }, [currentUser?.uid, currentUser?.email, comment.upvoters, comment.downvoters]);

  const commentClasses = [
    'bg-white/90 dark:bg-zinc-800/40',
    'rounded-xl p-6 mb-6 border',
    'transition-all duration-200',
    'hover:shadow-md hover:-tranzinc-y-0.5',
    'backdrop-blur-sm',
    isAdminComment 
      ? 'border-amber-300 dark:border-amber-500 shadow-[0_0_25px_rgba(234,179,8,0.25)] dark:shadow-[0_0_25px_rgba(234,179,8,0.5)]' 
      : 'border-zinc-500/80 dark:border-zinc-700/50 hover:border-zinc-900/70 dark:hover:border-zinc-600/50'
  ].join(' ');

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={commentClasses}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 relative">
            {isAdminComment && (
              <m.div 
                className="absolute -top-4 left-1/2 -tranzinc-x-1/2 bg-yellow-500/20 rounded-full p-1 z-10"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Crown className="w-5 h-5 text-yellow-500" />
              </m.div>
            )}
            <div className="relative">
              <UserAvatar
                photoURL={comment.user?.photoURL || comment.photoURL}
                displayName={comment.user?.displayName || comment.displayName || 'User'}
                size={40}
                asLink={isClickable}
                linkHref={profileLink || undefined}
                onClick={(e) => {
                  console.log('Avatar clicked for user:', resolvedUsername || comment.uid);
                  console.log('Comment data:', {
                    username: resolvedUsername,
                    uid: comment.uid,
                    displayName: comment.user?.displayName || comment.displayName,
                    profileLink
                  });
                  e?.stopPropagation();
                }}
                className={`group ${isClickable ? 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 cursor-pointer hover:scale-105 transition-all duration-200' : 'cursor-default opacity-75'}`}
                title={isClickable ? `View ${comment.user?.displayName || comment.displayName || 'user'}'s profile` : 'User profile not available'}
              />
              {!isClickable && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-400 rounded-full border border-white dark:border-zinc-800" 
                     title="No profile available">
                </div>
              )}
              {isLoadingUsername && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border border-white dark:border-zinc-800 animate-pulse" 
                     title="Loading profile...">
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {isClickable ? (
                  <Link 
                    href={profileLink!}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {comment.user?.displayName || comment.displayName || 'Anonymous'}
                  </Link>
                ) : (
                  <span>{comment.user?.displayName || comment.displayName || 'Anonymous'}</span>
                )}
                {comment.email === ADMIN_EMAIL && (
                  <span className="ml-1 text-yellow-500" title="Admin">
                    <Crown className="inline-block w-3 h-3" />
                  </span>
                )}
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {(() => {
                  try {
                    if (!comment.timestamp) return '';
                    const date = typeof comment.timestamp === 'string' 
                      ? new Date(comment.timestamp)
                      : 'toDate' in comment.timestamp 
                        ? comment.timestamp.toDate() 
                        : comment.timestamp;
                    return date.toLocaleDateString();
                  } catch (e) {
                    console.error('Error formatting date:', e);
                    return '';
                  }
                })()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentUserAdmin && (
            <m.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPin(comment.id, !comment.isPinned)}
              className={`text-zinc-400 hover:text-yellow-500 transition-colors ${
                comment.isPinned ? 'text-yellow-500' : ''
              }`}
              aria-label={comment.isPinned ? 'Unpin comment' : 'Pin comment'}
            >
              <Pin className="w-4 h-4" />
            </m.button>
          )}
          {canModify && (
            <m.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(comment.id)}
              className="text-zinc-600 dark:text-zinc-300 text-sm mt-1"
              aria-label="Delete comment"
            >
              <Trash2 className={iconClasses(false)} />
            </m.button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <p className={contentClasses}>{comment.content}</p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 relative group">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onVote(comment.id, 'up')}
              className={voteButtonClasses(userVote === 'up')}
              disabled={!currentUser}
            >
              <ThumbsUp className={iconClasses(userVote === 'up')} />
              <span>{formatNumber(comment.upvotes || 0)}</span>
            </m.button>
            {comment.upvoters?.includes(ADMIN_EMAIL) && (
              <m.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
                title="Liked by Admin"
              >
                <Crown className="w-4 h-4 text-yellow-500 fill-current" />
              </m.div>
            )}
          </div>
          
          <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVote(comment.id, 'down')}
            className={`flex items-center gap-2 transition-colors ${
              userVote === 'down' ? 'text-red-400 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500 hover:text-red-400 dark:hover:text-red-500'
            }`}
            disabled={!currentUser}
          >
            <ThumbsDown className={iconClasses(userVote === 'down')} />
            <span>{formatNumber(comment.downvotes || 0)}</span>
          </m.button>
        </div>
      </div>
    </m.div>
  );
});

CommentItem.displayName = 'CommentItem';
