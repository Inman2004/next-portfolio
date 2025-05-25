'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '../ui/page-loading';

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prevPath, setPrevPath] = useState(pathname);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle route changes
  useEffect(() => {
    if (pathname !== prevPath) {
      setIsLoading(true);
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  // Handle page load completion
  useEffect(() => {
    if (!isClient) return;

    const handleLoad = () => {
      setIsLoading(false);
    };

    // If the page is already loaded when this component mounts
    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Also set a timeout as a fallback in case the load event doesn't fire
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [isClient, pathname, searchParams]);

  // Don't render anything on the server
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <PageLoading isLoading={isLoading} />
    </>
  );
}
