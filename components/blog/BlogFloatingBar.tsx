'use client';

import { useEffect, useState } from 'react';
import SocialShare from '@/components/SocialShare';
import BlogPostActions from '@/components/blog/BlogPostActions';

interface BlogFloatingBarProps {
  postId: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription?: string;
  authorId?: string;
  initialPublished?: boolean;
}

export default function BlogFloatingBar({
  postId,
  shareUrl,
  shareTitle,
  shareDescription = '',
  authorId,
  initialPublished,
}: BlogFloatingBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow border border-gray-200/60 dark:border-gray-700/60 p-2 flex items-center gap-2 ${
        isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="hidden md:block">
        <SocialShare url={shareUrl} title={shareTitle} description={shareDescription} isCompact />
      </div>
      <BlogPostActions postId={postId} authorId={authorId} initialPublished={initialPublished} />
    </div>
  );
}


