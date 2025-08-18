'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ViewCountHandlerProps {
  postId: string;
}

export default function ViewCountHandler({ postId }: ViewCountHandlerProps) {
  const pathname = usePathname();
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Only increment view count once per page visit
    if (hasIncremented.current) return;
    
    // Check if this is a blog post page
    if (pathname.startsWith('/blog/') && pathname !== '/blog/new' && pathname !== '/blog/edit') {
      // Increment view count after a short delay to ensure it's a real visit
      const timer = setTimeout(async () => {
        try {
          // Call the API to increment view count
          const response = await fetch(`/api/blog/${postId}/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            console.log(`View count incremented for post: ${postId}`);
            hasIncremented.current = true;
          } else {
            console.error('Failed to increment view count');
          }
        } catch (error) {
          console.error('Error incrementing view count:', error);
        }
      }, 2000); // Wait 2 seconds to ensure it's a real visit
      
      return () => clearTimeout(timer);
    }
  }, [pathname, postId]);

  return null; // This component doesn't render anything
}
