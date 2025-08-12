'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { LoadingController } from '../ui/loading-controller';
import { useLoadingState } from '@/hooks/useLoadingState';

// Client-side only component that uses useSearchParams
function LoadingContent({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prevPath, setPrevPath] = useState(pathname);
  const [isClient, setIsClient] = useState(false);
  const { startLoading, stopLoading } = useLoadingState();

  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle route changes
  useEffect(() => {
    if (pathname && pathname !== prevPath) {
      console.log('Route change detected:', prevPath, '->', pathname);
      setIsPageLoading(true);
      startLoading();
      setPrevPath(pathname);
      
      // Stop loading after a delay to allow content to load
      const timer = setTimeout(() => {
        setIsPageLoading(false);
        stopLoading();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath, startLoading, stopLoading]);

  // Handle search param changes
  useEffect(() => {
    if (isClient && searchParams) {
      startLoading();
      const timer = setTimeout(() => {
        stopLoading();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, isClient, startLoading, stopLoading]);

  // Handle page load completion
  useEffect(() => {
    if (!isClient) return;

    const handleLoad = () => {
      setIsPageLoading(false);
      stopLoading();
    };

    // If the page is already loaded when this component mounts
    if (document.readyState === 'complete') {
      setIsPageLoading(false);
      stopLoading();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Also set a timeout as a fallback
    const timer = setTimeout(() => {
      setIsPageLoading(false);
      stopLoading();
    }, 1500);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [isClient, pathname, stopLoading]);

  return (
    <>
      <LoadingController isLoading={isPageLoading} />
      {children}
    </>
  );
}

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  // Check if we're on the 404 page
  const pathname = usePathname();
  const is404 = pathname === '/404';

  // Don't render anything on the server
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  if (is404) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<LoadingController isLoading={true} />}>
      <LoadingContent>
        {children}
      </LoadingContent>
    </Suspense>
  );
}