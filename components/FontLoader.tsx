'use client';

import { useEffect } from 'react';

export function FontLoader() {
  useEffect(() => {
    // Load fonts after component mounts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      // Cleanup
      document.head.removeChild(link);
    };
  }, []);

  return null;
}
