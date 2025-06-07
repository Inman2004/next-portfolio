import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  uid: string;
  username?: string;
  // These fields are kept for backward compatibility
  displayName?: string;
  photoURL?: string | null;
  email?: string | null;
  // User object that will be populated from the users collection
  user?: {
    displayName?: string;
    photoURL?: string | null;
    email?: string | null;
  };
  content: string;
  timestamp: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
  upvotes: number;
  downvotes: number;
  isPinned?: boolean;
  upvoters: string[];
  downvoters: string[];
  parentId?: string;
  replies?: Comment[];
  edited?: boolean;
  editHistory?: {
    content: string;
    timestamp: Timestamp | string | Date;
  }[];
  mentions?: string[];
}

export interface User {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL?: string | null;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[];
}

export const ADMIN_EMAIL = "rvimman@gmail.com";

export interface CommentItemProps {
  comment: Comment;
  onVote: (id: string, type: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  currentUser: User | null;
  isAdmin: boolean;
}

export interface CommentListProps {
  comments: Comment[];
  onVote: (id: string, type: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  currentUser: User | null;
  isAdmin: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  currentUser: User | null;
}
