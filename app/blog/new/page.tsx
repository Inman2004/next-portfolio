'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { app, db } from '@/lib/firebase';
import { toast } from 'sonner';
import Link from 'next/link';

import { Tutorial } from '../tutorial/Tutorial';
// Utility function to extract public ID from Cloudinary URL

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

const NewBlogPostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to delete image from Cloudinary
  const deleteImage = useCallback(async (imageUrl: string | null) => {
    if (!imageUrl) return;
    
    const publicId = extractPublicId(imageUrl);
    if (!publicId) return;
    
    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });
    } catch (error) {
      console.error('Error deleting old image:', error);
      // Continue with upload even if deletion fails
    }
  }, []);

  // Handle Firebase auth state
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
      
      // Redirect to sign-in if not authenticated
      if (!user) {
        router.push('/signin?callbackUrl=' + encodeURIComponent('/blog/new'));
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Initialize Cloudinary widget
  const [isCloudinaryReady, setIsCloudinaryReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCloudinary = () => {
      if (window.cloudinary) {
        setIsCloudinaryReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => {
        setIsCloudinaryReady(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Cloudinary widget:', error);
        setError('Failed to load image uploader. Please refresh the page and try again.');
      };
      document.body.appendChild(script);
    };

    loadCloudinary();

    // Cleanup function to prevent memory leaks
    return () => {
      const cloudinaryScript = document.querySelector('script[src*="cloudinary.com"]');
      if (cloudinaryScript) {
        document.body.removeChild(cloudinaryScript);
      }
    };
  }, []);

  const handleImageUpload = useCallback(() => {
    if (typeof window === 'undefined' || !isCloudinaryReady) {
      setError('Image uploader is still loading. Please wait...');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      if (!window.cloudinary) {
        throw new Error('Cloudinary widget not loaded');
      }

      const uploadWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'url'],
          cropping: true,
          croppingAspectRatio: 16/9,
          croppingShowDimensions: true,
          multiple: false,
          maxFiles: 1,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxFileSize: 5000000, // 5MB
          folder: 'blog-covers',
          publicId: coverImage ? extractPublicId(coverImage) : undefined,
          overwrite: true,
          styles: {
            palette: {
              window: "#1E1E2D",
              sourceBg: "#2D2B42",
              windowBorder: "#8E9CFF",
              tabIcon: "#8E9CFF",
              inactiveTabIcon: "#8E9CFF",
              menuIcons: "#8E9CFF",
              link: "#8E9CFF",
              action: "#8E9CFF",
              inProgress: "#8E9CFF",
              complete: "#33ff00",
              error: "#EA2727",
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
        },
        async (error: any, result: any) => {
          if (error) {
            console.error('Upload error details:', error);
            setError('Failed to upload image. ' + (error.message || 'Please try again.'));
            setIsUploading(false);
            return;
          }

          if (result.event === 'success') {
            try {
              // Delete old image if it exists and is different from the new one
              if (coverImage && coverImage !== result.info.secure_url) {
                await deleteImage(coverImage);
              }
              
              setCoverImage(result.info.secure_url);
            } catch (err) {
              console.error('Error handling image upload:', err);
              // Don't fail the upload if cleanup fails
            } finally {
              setIsUploading(false);
            }
          } else if (result.event === 'display-changed') {
            console.log('Widget display changed:', result);
          } else if (result.event === 'close') {
            console.log('Widget closed');
            setIsUploading(false);
          }
        }
      );
      
      uploadWidget.open();
    } catch (err) {
      console.error('Error initializing upload widget:', err);
      setError('Failed to initialize image uploader. ' + (err instanceof Error ? err.message : 'Please try again.'));
      setIsUploading(false);
    }
  }, [isCloudinaryReady, coverImage, deleteImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a blog post');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get the username from the user's profile if available
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const username = userDoc?.data()?.username || null;
      
      const newPost = {
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().substring(0, 160) + (content.length > 160 ? '...' : ''),
        coverImage,
        author: currentUser.displayName || currentUser.name || 'Anonymous',
        authorId: currentUser.uid || 'anonymous',
        authorPhotoURL: currentUser.photoURL || null,
        username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        published: true,
        tags: [],
        slug: title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      };
      
      console.log('Creating post with data:', newPost);
      
      const docRef = await addDoc(collection(db, 'blogPosts'), newPost);
      
      toast.success('Post created successfully!');
      router.push(`/blog/${docRef.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(
        err instanceof Error 
          ? `Failed to create post: ${err.message}`
          : 'Failed to create post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will be redirected by useEffect)
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-x-hidden w-full transition-colors duration-200">
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/80 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-200/70 dark:border-gray-700/50 p-6 md:p-8 shadow-xl dark:shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-purple-50/70 dark:from-blue-900/10 dark:to-purple-900/10 -z-10 rounded-2xl" />
          
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-2"
            >
              Create New Post
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Share your thoughts and ideas with the world
            </motion.p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-lg flex items-start"
            >
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-700/30 border border-gray-300/70 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                placeholder="Enter a compelling title..."
                disabled={isSubmitting}
                required
              />
            </motion.div>
            
            {/* Cover Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Cover Image
                <span className="text-gray-500 text-xs ml-2">(Optional)</span>
              </label>
              <div className="flex items-center space-x-4">
                <motion.button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploading || !isCloudinaryReady}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative group flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed ${
                    coverImage 
                      ? 'border-transparent' 
                      : isCloudinaryReady 
                        ? 'border-gray-300 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-500' 
                        : 'border-gray-200 dark:border-gray-700 cursor-not-allowed'
                  } bg-gray-100/50 dark:bg-gray-700/30 flex items-center justify-center overflow-hidden transition-colors duration-200 group`}
                >
                  {coverImage ? (
                    <>
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400 mb-1 animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-1" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </div>
                  )}
                </motion.button>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recommended size: 1200x630px (16:9 aspect ratio)
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                Content
                <span className="text-red-400 ml-1">*</span>
              </label>
              <Tutorial />
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[300px] px-4 py-3 bg-white/80 dark:bg-gray-700/30 border border-gray-300/70 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                placeholder="Write your post content here..."
                disabled={isSubmitting}
                required
              />
            </motion.div>
            
            <motion.div 
              className="flex justify-end pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 -ml-1" />
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-blue-500/20 dark:shadow-blue-500/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewBlogPostPage;
