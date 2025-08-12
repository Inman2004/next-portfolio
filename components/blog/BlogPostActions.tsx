'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
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
  isAdmin?: boolean; // backward compat
  onDelete?: () => void;
}

export default function BlogPostActions({ postId, authorId, initialPublished, isAdmin, onDelete }: BlogPostActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canManage, setCanManage] = useState<boolean>(!!isAdmin);
  const [published, setPublished] = useState<boolean>(initialPublished ?? true);

  useEffect(() => {
    setIsClient(true);
    const unsub = onAuthStateChanged(auth!, (user) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'rvimman@gmail.com';
      const userIsAdmin = !!user?.email && user.email === adminEmail;
      const isOwner = !!user?.uid && !!authorId && user.uid === authorId;
      setCanManage(userIsAdmin || isOwner || !!isAdmin);
    });
    return () => unsub();
  }, []);

  const handleDelete = async () => {
    if (!canManage) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
      toast.success('Post deleted successfully');
      onDelete?.();
      router.push('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const togglePublished = async () => {
    if (!canManage) return;
    try {
      const next = !published;
      await updateDoc(doc(db, 'blogPosts', postId), { published: next });
      setPublished(next);
      toast.success(next ? 'Post is now public' : 'Post is now private');
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
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
              {published ? 'Make Private' : 'Make Public'}
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
