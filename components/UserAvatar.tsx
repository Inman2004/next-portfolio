'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  photoURL: string | null | undefined;
  displayName?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ 
  photoURL, 
  displayName, 
  size = 128,
  className = '' 
}: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!photoURL) {
      setHasError(true);
      return;
    }
    
    // Reset error state when photoURL changes
    setHasError(false);
    
    // Create a test image to check if the URL is valid
    const testImg = new window.Image();
    
    const handleLoad = () => {
      // If image loads successfully, use the high-res version
      const highResUrl = photoURL.replace(/=s\d+-c$/, '=s400-c');
      setImgSrc(highResUrl);
    };
    
    const handleError = () => {
      // If high-res fails, try the original URL
      console.log('High-res image failed, trying original URL');
      setImgSrc(photoURL);
    };
    
    testImg.onload = handleLoad;
    testImg.onerror = handleError;
    
    // Start loading the test image
    testImg.src = photoURL;
    
    return () => {
      // Cleanup
      testImg.onload = null;
      testImg.onerror = null;
    };
  }, [photoURL]);

  // If no photoURL or there was an error, show initial
  if (!photoURL || hasError) {
    return (
      <div 
        className={`rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-3xl font-bold text-gray-500 dark:text-gray-300">
          {(displayName || 'U')[0].toUpperCase()}
        </span>
      </div>
    );
  }

  // If we have a valid image URL, use Next.js Image component
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={imgSrc || photoURL}
        alt={displayName || 'User avatar'}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => {
          console.log('Image component error, falling back to img element');
          setHasError(true);
        }}
      />
    </div>
  );
}
