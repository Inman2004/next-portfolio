// Extend the global namespace to include our custom properties
declare global {
  // eslint-disable-next-line no-var
  var _emulatorConnected: boolean | undefined;
  
  interface Window {
    cloudinary: any; // You can replace 'any' with more specific types if available
  }
}

// Comment type for the Comments component
type Comment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorImage?: string;
  createdAt: any; // You might want to use firestore.Timestamp or Date
  likes: number;
  dislikes: number;
  userVote?: 'up' | 'down' | null;
  isPinned?: boolean;
  isAdmin?: boolean;
  replies?: Comment[];
};

type CommentListProps = {
  comments: Comment[];
  onVote: (id: string, type: 'up' | 'down') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPin: (id: string, isPinned: boolean) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  currentUser: {
    uid: string;
    isAdmin?: boolean;
  } | null;
  isLoadingMore: boolean;
};
