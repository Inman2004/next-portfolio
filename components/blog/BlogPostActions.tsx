'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { deleteBlogPost, updateBlogPost } from '@/lib/blog';
import { Trash2, Edit, Share2, MoreHorizontal, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogPostActionsProps {
  postId: string;
  authorId?: string;
  initialPublished?: boolean;
}

export default function BlogPostActions({ postId, authorId, initialPublished }: BlogPostActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [published, setPublished] = useState<boolean>(initialPublished ?? true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const canManage = user && (user.uid === authorId || (user as any).role === 'admin');

  const handleDelete = async () => {
    if (!canManage) return;
    
    setIsDeleting(true);
    try {
      await deleteBlogPost(postId);
      toast.success('Post deleted successfully');
      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const togglePublished = async () => {
    if (!canManage) return;
    try {
      const next = !published;
      await updateBlogPost(postId, { published: next });
      setPublished(next);
      toast.success(next ? 'Post published successfully' : 'Post moved to drafts');
      router.refresh();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update visibility');
    }
  };

  const handleShare = () => {
    if (isClient && navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error);
    } else if (isClient) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share post">
        <Share2 className="h-4 w-4" />
      </Button>
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => router.push(`/blog/edit/${postId}`)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={togglePublished}>
              {published ? (
                <Lock className="h-4 w-4 mr-2" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              {published ? 'Unpublish (Draft)' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsConfirmOpen(true)} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        variant="destructive"
      />
    </div>
  );
}