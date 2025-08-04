"use client";

import { useState, useRef, useCallback, useEffect, ChangeEvent, DragEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, Loader2, X, Crop } from 'lucide-react';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface ProfileImageUploadProps {
  onImageUpdate?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  aspect?: number; // Optional aspect ratio for cropping (width/height)
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
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  const imgRef = useRef<HTMLImageElement>(null);
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
  const handleFileSelect = useCallback((file: File) => {
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

      // Create preview URL for cropping
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
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
  // Helper function to compress image to under 200KB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set maximum dimensions
          const MAX_WIDTH = 300;  // Reduced from 400
          const MAX_HEIGHT = 300; // Reduced from 400
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas with higher quality settings
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try multiple quality levels to get under 200KB
          const tryCompress = (quality: number): string | null => {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            // Check if the base64 string is under 200KB (200 * 1024 * 0.75 for base64 overhead)
            if (dataUrl.length < 150000) { // ~200KB in base64
              return dataUrl;
            }
            return null;
          };
          
          // Try different quality levels
          const qualities = [0.85, 0.7, 0.6, 0.5, 0.4, 0.3];
          for (const quality of qualities) {
            const result = tryCompress(quality);
            if (result) {
              resolve(result);
              return;
            }
          }
          
          // If still too large, try further reducing dimensions
          const reducedCanvas = document.createElement('canvas');
          const reducedCtx = reducedCanvas.getContext('2d');
          if (!reducedCtx) {
            reject(new Error('Could not create reduced canvas'));
            return;
          }
          
          reducedCanvas.width = Math.floor(width * 0.8);
          reducedCanvas.height = Math.floor(height * 0.8);
          reducedCtx.imageSmoothingQuality = 'high';
          reducedCtx.drawImage(canvas, 0, 0, reducedCanvas.width, reducedCanvas.height);
          
          const finalQuality = 0.5; // Start with medium quality for final attempt
          const finalResult = reducedCanvas.toDataURL('image/jpeg', finalQuality);
          
          if (finalResult.length > 200000) {
            reject(new Error('Image is too large after compression. Please try a smaller image.'));
          } else {
            resolve(finalResult);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleUpload = useCallback(async (file: File, objectUrl: string) => {
    if (!user || !user.uid) {
      toast.error('You must be logged in to upload an image');
      return { success: false, error: 'Not authenticated' };
    }
    
    setIsUploading(true);
    
    try {
      // Compress the image first
      const compressedImage = await compressImage(file);
      
      // Check if the compressed image is still too large
      if (compressedImage.length > 900000) { // Leave some buffer under 1MB
        throw new Error('Image is too large after compression. Please try a smaller image.');
      }

      // Store the compressed base64 image in Firestore
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        photoBase64: compressedImage,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Store a reference in the auth profile using a non-URL format
      const updateResult = await updateUserProfile({
        photoURL: `user_${user.uid}`, // Using underscore instead of :// to avoid being treated as URL
        displayName: user.displayName || ''
      });
      
      if (updateResult.success) {
        setPreviewUrl(compressedImage);
        toast.success('Profile image updated successfully');
        
        if (onImageUpdate) {
          onImageUpdate();
        }
        
        return { success: true, url: compressedImage };
      } else {
        throw new Error(updateResult.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      return { success: false, error };
    } finally {
      setIsUploading(false);
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

  // Function to create a center crop
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }

  // Handle image load for cropping
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for profile images
  }

  // Get cropped image as blob
  const getCroppedImg = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !completedCrop) {
        reject(new Error('No image or crop data'));
        return;
      }

      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = completedCrop.width * pixelRatio;
      canvas.height = completedCrop.height * pixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  // Handle crop and upload
  const handleCropAndUpload = async () => {
    if (!imgSrc || !completedCrop) return;
    
    try {
      setIsUploading(true);
      const blob = await getCroppedImg();
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      
      // Upload the file
      await handleUpload(file, objectUrl);
      
      // Clean up
      setShowCropModal(false);
      setImgSrc('');
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div 
        className={`relative w-full h-full rounded-full overflow-hidden border-2 border-dashed ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-500 dark:border-gray-700'
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

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop your profile picture</DialogTitle>
          </DialogHeader>
          <div className="relative w-full max-h-[60vh] overflow-auto flex justify-center">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c as PixelCrop)}
                aspect={1} // Force 1:1 aspect ratio for profile images
                circularCrop={true}
                className="max-w-full max-h-[50vh]"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropModal(false);
                setImgSrc('');
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropAndUpload}
              disabled={isUploading || !completedCrop}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileImageUpload;