'use client';

import { useEffect } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { usePathname } from 'next/navigation';

export default function ProfileLoadingHandler() {
  const { startLoading, stopLoading } = useLoadingState();
  const pathname = usePathname();

  // Show loading state when navigating to profile page
  useEffect(() => {
    if (pathname === '/profile') {
      // Start loading when component mounts
      startLoading();
      
      // Stop loading after content is likely loaded
      const timer = setTimeout(() => {
        stopLoading();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, startLoading, stopLoading]);

  // This is just a wrapper component that manages loading state
  // It doesn't render anything itself
  return null;
}
