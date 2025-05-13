import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User } from 'lucide-react';
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

  const handleUpload = useCallback(() => {
    if (typeof window === 'undefined') return;

    const uploadWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        croppingValidateDimensions: true,
        croppingShowBackButton: true,
        maxImageWidth: 800,
        maxImageHeight: 800,
        minImageWidth: 200,
        minImageHeight: 200,
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
          const imageUrl = result.info.secure_url;
          try {
            await updateUserProfile({
              photoURL: imageUrl
            });
            onImageUpdate?.();
          } catch (err) {
            console.error('Error updating profile image:', err);
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
      className="relative group"
      aria-label="Change profile picture"
    >
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        {user?.photoURL ? (
          <img 
            src={user.photoURL}
            alt={user.displayName || 'Profile'}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-16 h-16 text-white" />
        )}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Camera className="w-8 h-8 text-white" />
      </div>
    </motion.button>
  );
};

export default ProfileImageUpload; 