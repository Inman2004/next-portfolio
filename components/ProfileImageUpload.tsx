"use client";

import { useState, useRef, useCallback, useEffect, ChangeEvent, DragEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  url: string;
  signature: string;
  original_filename: string;
}

interface ProfileImageUploadProps {
  onImageUpdate?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

const ProfileImageUpload = ({
  onImageUpdate,
  className = '',
  size = 'md',
}: ProfileImageUploadProps) => {
  const { user, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when user's photoURL changes
  useEffect(() => {
    console.log('User photoURL changed:', user?.photoURL);
    if (user?.photoURL) {
      // Add a timestamp to the URL to prevent caching issues
      const timestamp = new Date().getTime();
      const url = user.photoURL.includes('?') 
        ? `${user.photoURL}&v=${timestamp}` 
        : `${user.photoURL}?v=${timestamp}`;
      console.log('Setting preview URL:', url);
      setPreviewUrl(url);
    } else {
      console.log('No photoURL found for user');
      setPreviewUrl('');
    }
  }, [user?.photoURL]);

  // Handle file selection via input
  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // Handle file selection with validation
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      console.log('Created preview URL:', objectUrl);
      setPreviewUrl(objectUrl);

      // Upload the file
      await handleUpload(file, objectUrl);
      
      // Clean up the object URL after upload is complete
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error('Failed to process image. Please try again.');
    }
  }, []);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle the actual file upload to Cloudinary
  // Function to delete old profile image
  const deleteOldProfileImage = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.log('No user ID provided for image deletion');
        return { success: false, error: 'No user ID provided' };
      }
      
      console.log('Attempting to delete old profile image for user:', userId);
      const publicId = userId; // Just the user ID, folder is handled by the preset
      console.log('Using publicId for deletion:', publicId);
      
      const response = await fetch('/api/cloudinary/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId,
          resourceType: 'image'
        })
      });
      
      const result = await response.json();
      console.log('Delete API response:', result);
      
      if (!response.ok) {
        console.warn('Failed to delete old profile image:', result);
        // Don't throw error, we can still try to upload new image
      }
      return result;
    } catch (error) {
      console.error('Error in deleteOldProfileImage:', error);
      return { success: false, error };
    }
  }, []);

  const handleUpload = useCallback(async (file: File, objectUrl: string) => {
    if (!user) {
      toast.error('You must be logged in to upload an image');
      return;
    }
    
    if (!user.uid) {
      toast.error('User information is incomplete');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // First, delete the old profile image
      await deleteOldProfileImage(user.uid);
      
      // Use a deterministic public_id based on user ID and place in profile-images folder
      const publicId = `profile-images/${user.uid}`;
      const tags = ['profile', 'user-avatar'];
      const context = `user_id=${user.uid}|username=${user.displayName || 'user'}`;
      
      console.log('Uploading new profile image for user:', user.uid);
      console.log('Using Cloudinary preset: profile_pictures_unsigned');
      
      // Create FormData with all required fields
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profile_pictures_unsigned');
      formData.append('public_id', publicId);
      formData.append('context', context);
      formData.append('tags', tags.join(','));
      // Removed 'invalidate' parameter as it's not allowed in unsigned uploads
      
      // Note: Transformation parameters are not allowed in unsigned uploads.
      // They should be configured in the Cloudinary upload preset instead.
      // Add folder to ensure consistent organization
      formData.append('folder', 'profile-images');
      
      console.log('Uploading to Cloudinary with settings:', {
        publicId,
        tags,
        context,
        timestamp: Date.now()
      });
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      console.log('Sending upload request to Cloudinary...');
      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });
      
      let result;
      try {
        result = await uploadResponse.json();
      } catch (jsonError) {
        console.error('Failed to parse Cloudinary response as JSON:', jsonError);
        const errorText = await uploadResponse.text();
        console.error('Raw Cloudinary response:', errorText);
        throw new Error(`Failed to parse Cloudinary response: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      console.log('Cloudinary response:', result);
      
      if (!uploadResponse.ok) {
        console.error('Upload failed with status:', uploadResponse.status, uploadResponse.statusText);
        console.error('Error details:', result);
        throw new Error(`Upload failed: ${result?.error?.message || 'Unknown error'}`);
      }
      
      // Make sure we have a valid secure_url or url
      if (!result.secure_url && !result.url) {
        console.error('No secure_url or url in Cloudinary response:', result);
        throw new Error('No image URL returned from Cloudinary');
      }
      
      // Use secure_url if available, otherwise fall back to url
      const imageUrl = result.secure_url || result.url;
      
      console.log('Final image URL:', imageUrl);

      // Update user profile with new image URL
      console.log('Updating user profile with new image URL...');
      const updateResult = await updateUserProfile({
        photoURL: imageUrl,
        displayName: user.displayName || '' // Include displayName to ensure it's preserved
      });
      
      console.log('Profile update result:', updateResult);
      
      if (updateResult?.success) {
        // Update the preview URL with the new image URL and cache-busting parameter
        const timestamp = new Date().getTime();
        const updatedUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${timestamp}`;
        setPreviewUrl(updatedUrl);
        
        toast.success('Profile image updated successfully');
        
        // Call the onImageUpdate callback if provided
        if (onImageUpdate) {
          console.log('Calling onImageUpdate callback');
          onImageUpdate();
        } else {
          console.log('No onImageUpdate callback provided');
        }
        
        // Force a small delay to ensure the UI updates
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error(updateResult?.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    }
  }, [user, updateUserProfile, onImageUpdate]);

  // Handle remove image
  const handleRemoveImage = useCallback(async () => {
    if (!user?.photoURL) return;
    
    try {
      await updateUserProfile({
        photoURL: null
      });
      
      toast.success('Profile image removed');
      onImageUpdate?.();
    } catch (error) {
      console.error('Failed to remove image:', error);
      toast.error('Failed to remove image');
    }
  }, [user, updateUserProfile, onImageUpdate]);

  const displayImage = previewUrl || user?.photoURL || '';
  const showRemoveButton = !isUploading && (previewUrl || user?.photoURL);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div 
        className={`relative w-full h-full rounded-full overflow-hidden border-2 border-dashed ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-gray-700'
        } transition-colors duration-200 flex items-center justify-center cursor-pointer`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="mt-2 text-sm text-gray-500">Uploading...</span>
          </div>
        ) : displayImage ? (
          <>
            <img 
              src={displayImage} 
              alt={user?.displayName || 'Profile'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.user-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
            <User className="w-12 h-12 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500 text-center px-2">
              {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
            </span>
          </div>
        )}
      </div>

      {showRemoveButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          disabled={isUploading}
          aria-label="Remove profile image"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
        disabled={isUploading}
      />
    </div>
  );
};

export default ProfileImageUpload;