/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cloudinaryPresets, getFolderByPreset } from '@/lib/cloudinary';

interface CloudinaryUploadResult {
  event: string;
  info: {
    public_id: string;
    secure_url: string;
    [key: string]: any;
  };
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  update: (options: any) => void;
  on: (event: string, callback: (error?: any, result?: any) => void) => void;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (options: any, callback: (error: any, result: any) => void) => CloudinaryWidget;
    };
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

  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    if (typeof window === 'undefined' || !window.cloudinary) {
      console.error('Cloudinary not available');
      toast.error('Cloudinary uploader is not available');
      setIsUploading(false);
      return;
    }

    // Generate a unique signature for the upload
    const timestamp = Math.round((new Date).getTime()/1000);
    const preset = cloudinaryPresets.profile;
    const folder = getFolderByPreset(preset);
    
    console.log('Starting upload with:', {
      preset,
      folder,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      useSignedUploads: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_SIGNED
    });
    
    // Get the upload signature from your API
    const getSignature = async () => {
      try {
        const requestBody = {
          timestamp,
          preset,
          folder,
          transformation: 'c_fill,g_face,w_800,h_800',
          tags: ['profile', 'user-avatar']
        };
        
        console.log('Sending signature request:', requestBody);
        
        const response = await fetch('/api/cloudinary/sign-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const responseData = await response.json();
        console.log('Received signature response:', {
          status: response.status,
          ok: response.ok,
          data: responseData
        });
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to get upload signature');
        }
        
        // Ensure we have all required fields
        if (!responseData.signature || !responseData.timestamp || !responseData.api_key) {
          throw new Error('Invalid signature response from server');
        }
        
        return responseData;
        
      } catch (error) {
        console.error('Error getting upload signature:', error);
        toast.error('Failed to prepare upload: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return null;
      }
    };

    try {
      // Always use signed uploads for security
      const signatureData = await getSignature();
      if (!signatureData) {
        setIsUploading(false);
        return;
      }

      // Prepare upload options with signature
      const uploadOptions: any = {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: preset,
        sources: ['local', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        croppingValidateDimensions: true,
        croppingShowBackButton: true,
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        minImageWidth: 100,
        minImageHeight: 100,
        resourceType: 'image',
        maxFiles: 1,
        folder: folder,
        // Add signature parameters - these must match exactly what was signed
        api_key: signatureData.api_key,
        timestamp: signatureData.timestamp.toString(),
        signature: signatureData.signature,
        // Additional parameters
        context: `alt=Profile image`,
        tags: 'profile,user-avatar',
        // Transformation - must match what was signed
        transformation: 'c_fill,g_face,w_800,h_800',
        // Important: Set the upload signature explicitly
        uploadSignature: signatureData.signature,
        uploadSignatureTimestamp: signatureData.timestamp.toString(),
        // Ensure we're using the correct API key
        apiKey: signatureData.api_key,
        // Add the exact parameters that were used to generate the signature
        public_id: `profile-${Date.now()}`,
        // Disable any automatic transformations that might affect the signature
        invalidate: true,
        eager: [],
        eager_async: false,
        eager_notification_url: null,
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F4F5",
            windowBorder: "#90A0B3",
            tabIcon: "#000000",
            inactiveTabIcon: "#555A5F",
            menuIcons: "#555A5F",
            link: "#000000",
            action: "#000000",
            inProgress: "#000000",
            complete: "#000000",
            error: "#000000",
            textDark: "#000000",
            textLight: "#FFFFFF"
          },
          fonts: {
            default: null,
            "sans-serif": {
              url: null,
              active: true
            }
          }
        }
      };

      // Log the final upload options (without sensitive data)
      const { api_key, signature: sig, uploadSignature, ...safeOptions } = uploadOptions;
      console.log('Upload options:', {
        ...safeOptions,
        api_key: '***',
        signature: '***',
        uploadSignature: '***'
      });

      try {
        // Create the widget
        const widget = window.cloudinary.createUploadWidget(
          uploadOptions,
          (error: any, result: any) => {
            console.log('Cloudinary widget callback:', { error, result });
            
            // Handle error case
            if (error) {
              console.error('Upload widget error:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                status: error.status,
                response: error.response,
                ...error
              });
              toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
              setIsUploading(false);
              return;
            }
            
            // Handle result events
            if (result) {
              console.log(`Upload event [${result.event}]:`, result);
              
              switch (result.event) {
                case 'success':
                  handleUploadResult(null, result);
                  break;
                case 'close':
                  console.log('Upload widget closed by user');
                  setIsUploading(false);
                  break;
                case 'upload_added':
                  console.log('File added to upload queue:', result.info);
                  break;
                case 'queues_start':
                  console.log('Upload started');
                  break;
                case 'progress':
                  console.log('Upload progress:', result.info);
                  break;
                case 'failure':
                  console.error('Upload failed with result:', {
                    info: result.info,
                    error: result.error,
                    status: result.status,
                    statusText: result.statusText,
                    response: result.response
                  });
                  handleUploadResult(result.error || new Error('Upload failed'), result);
                  break;
                case 'abort':
                  console.log('Upload aborted by user');
                  setIsUploading(false);
                  break;
                case 'retry':
                  console.log('Retrying upload...');
                  break;
                default:
                  console.log('Unhandled upload event:', result.event, result);
              }
            } else {
              console.error('No result object in callback');
              handleUploadResult(new Error('No result from upload'), null);
            }
          }
        );
        
        // Add error event listener
        widget.on('error', (error: any) => {
          console.error('Widget error event:', error);
          toast.error(`Upload error: ${error?.message || 'Unknown error'}`);
          setIsUploading(false);
        });
        
        // Open the widget
        widget.open();
        
      } catch (error) {
        console.error('Error initializing upload widget:', error);
        toast.error('Failed to initialize upload dialog');
        setIsUploading(false);
      }

      const handleUploadResult = async (error: any, result: any) => {
        console.log('handleUploadResult called with:', { error, result });
        
        // If there's an error or the result indicates an error
        if (error || (result?.event === 'failure' || result?.error)) {
          const errorObj = error || result?.error || result?.info?.error || {};
          
          console.error('Upload error details:', {
            error: errorObj,
            errorString: String(errorObj),
            errorType: typeof errorObj,
            errorKeys: errorObj ? Object.keys(errorObj) : 'no error object',
            result: result,
            rawError: JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj)),
            rawResult: JSON.stringify(result, Object.getOwnPropertyNames(result || {})),
            timestamp: new Date().toISOString()
          });
          
          let errorMessage = 'Failed to upload image';
          
          // Try to extract meaningful error message from various possible locations
          const possibleErrorMessages = [
            errorObj?.message,
            errorObj?.error?.message,
            errorObj?.response?.data?.message,
            result?.info?.error?.message,
            result?.message,
            result?.error?.message,
            errorObj?.toString()
          ].filter(Boolean);
          
          if (possibleErrorMessages.length > 0) {
            errorMessage = possibleErrorMessages[0];
          }
          
          console.error('Upload failed:', errorMessage);
          toast.error(errorMessage);
          setIsUploading(false);
          return;
        }

        if (result.event === 'success') {
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
                    console.error('Failed to delete old image:', error);
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
            const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_thumb,g_face,h_400,w_400/${folder ? folder + '/' : ''}${publicId}`;
            
            // Update user profile with new image URL
            await updateUserProfile({
              photoURL: imageUrl
            });
            
            setCurrentImage(imageUrl);
            onImageUpdate?.();
          } catch (err) {
            console.error('Error updating profile image:', err);
            toast.error('Failed to update profile');
          } finally {
            setIsUploading(false);
          }
        }
      };

      // Create and open the upload widget
      const uploadWidget = window.cloudinary.createUploadWidget(uploadOptions, handleUploadResult);
      uploadWidget.open();
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error('An error occurred during upload');
      setIsUploading(false);
    }
  }, [currentImage, onImageUpdate, updateUserProfile]);

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