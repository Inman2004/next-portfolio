/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface ProfileImageUploadProps {
  onImageUpdate?: () => void;
}

const ProfileImageUpload = ({ onImageUpdate }: ProfileImageUploadProps) => {
  const { user, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  // Get the photo URL from user data or provider data
  const getPhotoUrl = useCallback(() => {
    if (!user) return '';
    if (user.photoURL) return user.photoURL;
    if (user.providerData && user.providerData.length > 0) {
      return user.providerData[0]?.photoURL || '';
    }
    return '';
  }, [user]);
  
  useEffect(() => {
    setCurrentImage(getPhotoUrl());
  }, [user, getPhotoUrl]);

  // Function to extract public ID from Cloudinary URL
  const extractPublicId = (url: string): string | null => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the index of 'upload' in the path
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;
      
      // The public ID is everything after the version number (if present)
      const publicIdWithExtension = pathParts.slice(uploadIndex + 2).join('/');
      if (!publicIdWithExtension) return null;
      
      // Remove file extension if present
      return publicIdWithExtension.split('.')[0];
    } catch (e) {
      console.error('Error parsing URL:', e);
      return null;
    }
  };

  const handleUpload = useCallback(() => {
    setIsUploading(true);
    if (typeof window === 'undefined') return;

    const uploadWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        croppingValidateDimensions: true,
        croppingShowBackButton: true,
        croppingCoordinatesMode: 'custom',
        maxImageWidth: 800,
        maxImageHeight: 800,
        minImageWidth: 200,
        minImageHeight: 200,
        folder: 'profile-pictures',
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        theme: 'minimal',
        showAdvancedOptions: true,
        singleUploadAutoClose: true,
        // Ensure the cropped version is used
        transformation: [
          { width: 800, height: 800, crop: 'fill', gravity: 'face' },
          { quality: 'auto:best' }
        ],
        // Force the widget to use the cropped version
        eager: [
          { width: 400, height: 400, crop: 'thumb', gravity: 'face' },
          { width: 200, height: 200, crop: 'thumb', gravity: 'face' }
        ],
        eager_async: true,
        styles: {
          palette: {
            window: "#000000",
            sourceBg: "#000000",
            windowBorder: "#8E9FBF",
            tabIcon: "#FFFFFF",
            inactiveTabIcon: "#8E9FBF",
            menuIcons: "#2AD9FF",
            link: "#08C0FF",
            action: "#336BFF",
            inProgress: "#00BFFF",
            complete: "#33ff00",
            error: "#EA2727",
            textDark: "#000000",
            textLight: "#FFFFFF"
          }
        }
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          try {
            // Delete old profile image if it exists
            if (currentImage) {
              const oldPublicId = extractPublicId(currentImage);
              if (oldPublicId) {
                try {
                  // Call our API route to delete the old image
                  const response = await fetch('/api/delete-image', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ publicId: oldPublicId }),
                  });
                  
                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete old image');
                  }
                } catch (error) {
                  console.error('Error deleting old profile image:', error);
                  // Continue with the update even if deletion fails
                }
              }
            }

            // Get the public ID of the new uploaded image
            const publicId = result.info.public_id;
            // Construct the transformed URL with cropping parameters
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_thumb,g_face,h_400,w_400/${publicId}`;
            
            // Update user profile with new image URL
            await updateUserProfile({
              photoURL: imageUrl
            });
            
            setCurrentImage(imageUrl);
            onImageUpdate?.();
          } catch (err) {
            console.error('Error updating profile image:', err);
          } finally {
            setIsUploading(false);
          }
        }
      }
    );

    uploadWidget.open();
  }, [updateUserProfile, onImageUpdate]);

  useEffect(() => {
    // Load Cloudinary Upload Widget script
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleUpload}
      disabled={isUploading}
      className="relative group"
      aria-label={isUploading ? 'Uploading...' : 'Change profile picture'}
    >
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : currentImage ? (
          <img 
            src={currentImage}
            alt={user?.displayName || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to user icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.user-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : (
          <User className="w-16 h-16 text-white" />
        )}
        {!isUploading && !currentImage && (
          <div className="absolute inset-0 w-full h-full bg-blue-600 hidden items-center justify-center user-fallback">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      {!isUploading && (
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
      )}
    </motion.button>
  );
};

export default ProfileImageUpload; 