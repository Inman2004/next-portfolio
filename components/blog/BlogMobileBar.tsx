'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MoreHorizontal } from 'lucide-react';
import SocialShare from '@/components/SocialShare';
import BlogPostActions from '@/components/blog/BlogPostActions';

interface BlogMobileBarProps {
  postId: string;
  authorId?: string;
  initialPublished?: boolean;
  shareUrl: string;
  shareTitle: string;
  shareDescription?: string;
}

export default function BlogMobileBar({
  postId,
  authorId,
  initialPublished,
  shareUrl,
  shareTitle,
  shareDescription = ''
}: BlogMobileBarProps) {
  const [openShare, setOpenShare] = useState(false);

  // Simple portal-less share popover for mobile
  useEffect(() => {
    if (!openShare) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenShare(false); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [openShare]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="mx-auto max-w-6xl px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-3 rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
          <div className="flex items-center justify-between p-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setOpenShare((v) => !v)}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <BlogPostActions postId={postId} authorId={authorId} initialPublished={initialPublished} />
          </div>
          {openShare && (
            <div className="px-2 pb-3">
              <SocialShare url={shareUrl} title={shareTitle} description={shareDescription} isCompact />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


