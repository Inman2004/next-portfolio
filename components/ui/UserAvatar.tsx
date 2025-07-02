'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: number;
  className?: string;
  compact?: boolean;
  asLink?: boolean;
  linkHref?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export function UserAvatar({ 
  photoURL, 
  displayName, 
  size = 40, 
  className = '',
  compact = false,
  asLink = false,
  linkHref,
  onClick,
  title = ''
}: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const effectiveSize = compact ? size - 8 : size;

  useEffect(() => {
    // Reset state when photoURL changes
    setHasError(false);
    
    if (!photoURL || photoURL === 'undefined') {
      setHasError(true);
      return;
    }
    
    // Check if this is a base64 data URL
    if (photoURL.startsWith('data:image/')) {
      setImgSrc(photoURL);
      return;
    }

    // Handle old format user reference (user://UID)
    if (photoURL.startsWith('user://')) {
      const userId = photoURL.replace('user://', '');
      const fetchUserImage = async () => {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.photoBase64) {
              setImgSrc(userData.photoBase64);
              return;
            }
          }
          setHasError(true);
        } catch (error) {
          console.error('Error fetching user image:', error);
          setHasError(true);
        }
      };
      fetchUserImage();
      return;
    }
    
    // Handle our custom user reference (user_UID)
    if (photoURL.startsWith('user_')) {
      const userId = photoURL.replace('user_', '');
      const fetchUserImage = async () => {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.photoBase64) {
              setImgSrc(userData.photoBase64);
              return;
            }
          }
          setHasError(true);
        } catch (error) {
          console.error('Error fetching user image:', error);
          setHasError(true);
        }
      };
      fetchUserImage();
      return;
    }
    
    // Handle regular URLs
    setImgSrc(photoURL);
  }, [photoURL]);
  
  // Get user initials for fallback
  const getInitials = () => {
    try {
      if (!displayName) return '?';
      
      // Handle case where displayName is an object with a name property
      const nameString = typeof displayName === 'object' && displayName !== null 
        ? (displayName as any).name || '?'
        : String(displayName);
      
      return nameString
        .split(' ')
        .filter(Boolean) // Filter out any empty strings
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '?';
    } catch (error) {
      console.error('Error getting initials:', error);
      return '?';
    }
  };

  // If we have an error or no image, show fallback with initials
  const avatarContent = hasError || !imgSrc ? (
    <div 
      className={`relative rounded-full bg-muted flex items-center justify-center ${
        compact ? 'ring-1 ring-muted-foreground/20' : ''
      } ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minWidth: '100%',
        minHeight: '100%'
      }}
    >
      <span 
        className="text-muted-foreground font-medium"
        style={{ fontSize: `${Math.max(12, effectiveSize * 0.4)}px` }}
      >
        {getInitials()}
      </span>
    </div>
  ) : (
    // Determine if we should use a regular img tag (for data URLs, blobs, or our custom scheme)
    imgSrc.startsWith('data:') || 
    imgSrc.startsWith('blob:') || 
    imgSrc.startsWith('user_') ? (
      <img
        src={imgSrc}
        alt={displayName || 'User avatar'}
        className="object-cover w-full h-full"
        onError={() => setHasError(true)}
      />
    ) : (
      <Image
        src={imgSrc}
        alt={displayName || 'User avatar'}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setHasError(true)}
      />
    )
  );

  const containerClass = `relative rounded-full overflow-hidden ${className} ${
    compact ? 'ring-1 ring-white dark:ring-gray-800' : ''
  }`;

  const containerStyle = {
    width: `${effectiveSize}px`,
    height: `${effectiveSize}px`,
    minWidth: `${effectiveSize}px`,
    minHeight: `${effectiveSize}px`
  };

  const avatarElement = (
    <div 
      className={containerClass}
      style={containerStyle}
      onClick={onClick}
      title={title}
    >
      {avatarContent}
    </div>
  );

  if (asLink && linkHref) {
    return (
      <Link href={linkHref} className="block" onClick={onClick}>
        {avatarElement}
      </Link>
    );
  }

  return avatarElement;


}
