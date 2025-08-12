'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadingState } from '@/hooks/useLoadingState';

export function NavigationLoading() {
  const { startLoading, stopLoading } = useLoadingState();
  
  useEffect(() => {
    // Listen for navigation events
    const handleStart = () => {
      console.log('Navigation started');
      startLoading();
    };
    
    const handleComplete = () => {
      console.log('Navigation completed');
      stopLoading();
    };
    
    // Listen for browser navigation events
    const handleBeforeUnload = () => {
      startLoading();
    };
    
    const handlePageShow = () => {
      stopLoading();
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);
    
    // Override Link clicks to show loading
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
          console.log('Internal link clicked:', href);
          startLoading();
          
          // Stop loading after a reasonable time if navigation doesn't complete
          setTimeout(() => {
            stopLoading();
          }, 2000);
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [startLoading, stopLoading]);
  
  return null;
}
