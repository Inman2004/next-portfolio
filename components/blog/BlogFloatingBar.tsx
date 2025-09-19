'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
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
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <BlogPostActions postId={postId} authorId={authorId} initialPublished={initialPublished} />
    </div>
  );
}


