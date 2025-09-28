'use client';

import { useEffect, useRef } from 'react';

/**
 * Tracks reading progress for a blog post and stores it in localStorage.
 * Key: readingProgress:<postId> => { percent: number; updatedAt: number }
 */
export default function ReadingProgressTracker({ postId, contentSelector = '.prose' }: { postId: string; contentSelector?: string }) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!postId) return;

    const getDocHeight = (el: HTMLElement | null) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      // Use scrollHeight to account for overflow content
      return Math.max(el.scrollHeight, rect.height);
    };

    const target = document.querySelector(contentSelector) as HTMLElement | null;
    const handler = () => {
      if (!target) return;
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const rect = target.getBoundingClientRect();
      const total = getDocHeight(target);
      const scrolled = Math.min(total, Math.max(0, -rect.top + viewportH * 0.1));
      const percent = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      const record = { percent, updatedAt: Date.now() };
      try {
        localStorage.setItem(`readingProgress:${postId}`, JSON.stringify(record));
      } catch {}
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handler);
    };

    // Initial compute after content paints
    rafRef.current = requestAnimationFrame(handler);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [postId, contentSelector]);

  return null;
}
