'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  photoURL: string | null | undefined;
  displayName?: string | null;
  size?: number;
  className?: string;
  compact?: boolean;
}

export function UserAvatar({ 
  photoURL, 
  displayName, 
  size = 128,
  className = '',
  compact = false
}: UserAvatarProps) {
  // Adjust size for compact mode
  const effectiveSize = compact ? 24 : size;
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when photoURL changes
    setHasError(false);
    
    // If no photoURL or it's an empty string, use fallback
    if (!photoURL) {
      console.log('No photoURL provided, using fallback');
      setHasError(true);
      return;
    }
    
    // If photoURL is explicitly set to 'undefined' as a string, treat as no photo
    if (photoURL === 'undefined') {
      console.log('photoURL is string "undefined", using fallback');
      setHasError(true);
      return;
    }
    
    let processedUrl = photoURL;
    
    try {
      // If it's a Cloudinary URL, ensure it has the proper format
      if (typeof photoURL === 'string' && photoURL.includes('cloudinary.com')) {
        // Skip processing if it already has transformations or is a data URL
        if (!photoURL.includes('upload/') && !photoURL.startsWith('data:')) {
          const parts = photoURL.split('/upload/');
          if (parts.length === 2) {
            processedUrl = `${parts[0]}/upload/c_fill,g_face,w_400,h_400/${parts[1]}`;
            console.log('Processed Cloudinary URL:', processedUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error processing photoURL:', error);
      setHasError(true);
      return;
    }
    
    // Create a test image to check if the URL is valid
    const testImg = new window.Image();
    
    const handleLoad = () => {
      // If image loads successfully, use it
      setImgSrc(processedUrl);
    };
    
    const handleError = () => {
      console.log('Image failed to load:', processedUrl);
      setHasError(true);
    };
    
    testImg.onload = handleLoad;
    testImg.onerror = handleError;
    
    try {
      // Check if the URL is valid before creating a URL object
      if (!processedUrl || typeof processedUrl !== 'string' || !processedUrl.match(/^https?:\/\//)) {
        throw new Error('Invalid URL format');
      }
      
      // Add cache-busting parameter
      const url = new URL(processedUrl);
      url.searchParams.set('v', Date.now().toString());
      
      // Start loading the test image
      testImg.src = url.toString();
    } catch (error) {
      console.error('Invalid image URL:', processedUrl, error);
      setHasError(true);
      return;
    }
    
    return () => {
      // Cleanup
      testImg.onload = null;
      testImg.onerror = null;
    };
  }, [photoURL]);

  // If there was an error or no valid photoURL, show initials
  if (hasError || !photoURL || photoURL === 'undefined') {
    const initials = (displayName || 'U').match(/\b\w/g)?.join('').toUpperCase() || 'U';
    const fontSize = compact ? 10 : Math.min(size / 2, 48); // Scale font size based on avatar size
    
    return (
      <div 
        className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white ${className} ${
          compact ? 'text-xs' : ''
        }`}
        style={{ 
          width: `${effectiveSize}px`, 
          height: `${effectiveSize}px`,
          fontSize: `${fontSize}px`,
          fontWeight: compact ? 'normal' : 'bold',
          minWidth: `${effectiveSize}px`
        }}
      >
        {initials.slice(0, compact ? 1 : 2)}
      </div>
    );
  }

  // If we have a valid image URL, use Next.js Image component
  if (imgSrc) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden ${className} ${
          compact ? 'ring-1 ring-white dark:ring-gray-800' : ''
        }`}
        style={{
          width: `${effectiveSize}px`,
          height: `${effectiveSize}px`,
          minWidth: `${effectiveSize}px`,
          minHeight: `${effectiveSize}px`
        }}
      >
        <Image
          src={imgSrc}
          alt={displayName || 'User avatar'}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={() => setHasError(true)}
          unoptimized={imgSrc.startsWith('blob:')}
        />
      </div>
    );
  }
  
  // Fallback to initials if imgSrc is not available yet
  const initials = (displayName || 'U').match(/\b\w/g)?.join('').toUpperCase() || 'U';
  const fontSize = Math.min(size / 2, 48);
  
  return (
    <div 
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${fontSize}px`,
        fontWeight: 'bold'
      }}
    >
      {initials.slice(0, 2)}
    </div>
  );
}
