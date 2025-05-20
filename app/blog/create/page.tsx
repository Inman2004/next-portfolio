'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost } from '@/lib/blog';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function CreateBlogPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Initialize Cloudinary widget
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleImageUpload = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    setIsUploading(true);
    setError('');
    
    const uploadWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        cropping: true,
        croppingAspectRatio: 16/9,
        croppingShowDimensions: true,
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000, // 5MB
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
      (error: any, result: any) => {
        if (error) {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          setIsUploading(false);
          return;
        }

        if (result.event === 'success') {
          setCoverImage(result.info.secure_url);
          setIsUploading(false);
        }
      }
    );
    
    uploadWidget.open();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        author: user.displayName?.trim() || 'Anonymous',
        authorId: user.uid,
        authorPhotoURL: user.photoURL || null,
        coverImage: coverImage || null,
        published: true,
        excerpt: content.trim().substring(0, 160) + (content.length > 160 ? '...' : ''),
      };
      
      await createBlogPost(postData);
      
      // Redirect to blog page after successful creation
      router.push('/blog');
      router.refresh(); // Ensure the latest posts are loaded
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full">
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-2xl -z-10" />
          
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2"
            >
              Create New Post
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400"
            >
              Share your thoughts and ideas with the community
            </motion.p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg flex items-start"
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
              <label className="block text-sm font-medium text-gray-300">
                Cover Image
                <span className="text-gray-500 text-xs ml-2">(Optional)</span>
              </label>
              <div className="flex items-center space-x-4">
                <motion.button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative group flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed ${
                    coverImage ? 'border-transparent' : 'border-gray-600 hover:border-blue-500'
                  } bg-gray-700/30 flex items-center justify-center overflow-hidden transition-colors duration-200`}
                >
                  {coverImage ? (
                    <>
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">Upload Image</span>
                    </div>
                  )}
                </motion.button>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Recommended size: 1200x630px (16:9 aspect ratio)
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content
                <span className="text-red-400 ml-1">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[300px] px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-500"
                placeholder="Write your post content here..."
                disabled={isSubmitting}
                required
              />
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Publish Post
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
