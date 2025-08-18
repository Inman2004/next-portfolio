'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoadingState } from '@/hooks/useLoadingState';

export default function BlogLoadingHandler() {
  const { startLoading, stopLoading } = useLoadingState();
  const pathname = usePathname();

  useEffect(() => {
    // Show loading for blog pages
    if (pathname.startsWith('/blog/') && pathname !== '/blog/new' && pathname !== '/blog/edit') {
      startLoading();
      
      // Stop loading after content should be loaded
      const timer = setTimeout(() => {
        stopLoading();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, startLoading, stopLoading]);

  return null;
}
