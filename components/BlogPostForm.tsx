'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import MarkdownEditor from './MarkdownEditor';

// Types for Cloudinary upload response
type CloudinaryUploadResult = {
  event?: string;
  info?: string | {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    [key: string]: any;
  };
  error?: {
    message: string;
    [key: string]: any;
  };
};

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().nullable().optional(),
  published: z.boolean().default(true),
  tags: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogPost) => Promise<void>;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export default function BlogPostForm({
  initialData,
  onSubmit,
  isSubmitting,
  isEditing = false,
}: BlogPostFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();
  
  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
  
  // Folder where blog cover images will be stored
  const CLOUDINARY_FOLDER = 'blog-covers';
  
  // Validate Cloudinary configuration
  const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET && CLOUDINARY_API_KEY;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      coverImage: initialData?.coverImage || '',
      published: initialData?.published ?? true,
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  // Register the coverImage field to ensure it's included in form values
  useEffect(() => {
    register('coverImage');
    // Initialize with null if no cover image exists
    if (!initialData?.coverImage) {
      setValue('coverImage', null, { shouldValidate: true });
    }
  }, [register]);

  // Set initial values when component mounts or initialData changes
  useEffect(() => {
    if (initialData?.coverImage) {
      setValue('coverImage', initialData.coverImage, { shouldValidate: true });
    } else {
      setValue('coverImage', null, { shouldValidate: true });
    }
  }, [initialData, setValue]);

  // Set initial HTML content
  useEffect(() => {
    if (initialData?.htmlContent) {
      // setHtmlContent(initialData.htmlContent);
    }
  }, [initialData]);

  const content = watch('content', initialData?.content || '');
  const coverImage = watch('coverImage');

  const handleCoverImageUpload = useCallback(async (file: File) => {
    if (!isCloudinaryConfigured) {
      const errorMsg = 'Cloudinary is not properly configured.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Get upload signature from our API
      const timestamp = Math.round(Date.now() / 1000);
      const transformation = 'c_fill,g_auto,w_1600,h_900';
      
      // Use the blog-specific upload preset
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_BLOG || CLOUDINARY_UPLOAD_PRESET;
      
      console.log('Requesting signature with preset:', uploadPreset);
      
      const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp,
          upload_preset: uploadPreset,
          folder: CLOUDINARY_FOLDER,
          transformation,
        }),
      });

      if (!signResponse.ok) {
        const errorText = await signResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        console.error('Signature API error:', errorData);
        throw new Error(`Failed to get upload signature: ${JSON.stringify(errorData)}`);
      }

      const signData = await signResponse.json();
      console.log('Received signature data:', signData);
      
      const { signature, api_key, cloud_name } = signData;

      if (!signature || !api_key || !cloud_name) {
        throw new Error('Incomplete signature data received from server');
      }

      // 2. Upload the file to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      // For signed uploads, we don't include the upload_preset
      // formData.append('upload_preset', uploadPreset);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', CLOUDINARY_FOLDER);
      formData.append('transformation', transformation);
      formData.append('tags', 'blog-cover');
      // Add the public_id if you want to control the filename
      // formData.append('public_id', `blog-covers/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`);

      console.log('Uploading to Cloudinary with params:', {
        cloud_name,
        upload_preset: uploadPreset,
        folder: CLOUDINARY_FOLDER,
        transformation,
        timestamp,
        file: { name: file.name, type: file.type, size: file.size }
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
      console.log('Uploading to:', uploadUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      let result;
      try {
        result = await uploadResponse.json();
        console.log('Cloudinary upload response:', result);
      } catch (e) {
        console.error('Failed to parse Cloudinary response:', e);
        throw new Error('Invalid response from Cloudinary');
      }

      if (!uploadResponse.ok) {
        console.error('Cloudinary upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          response: result
        });
        throw new Error(result?.error?.message || `Upload failed with status ${uploadResponse.status}`);
      }

      if (!result || !result.secure_url) {
        console.error('Invalid Cloudinary response:', result);
        throw new Error('Invalid response from Cloudinary - missing secure_url');
      }

      // 3. Update form with the new image URL
      const imageUrl = result.info.secure_url;
      setValue('coverImage', imageUrl, { 
        shouldDirty: true, 
        shouldValidate: true 
      });

      toast.success('Cover image uploaded successfully');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [isCloudinaryConfigured, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    // Clear any previous errors
    setUploadError(null);
    
    // Upload the file
    await handleCoverImageUpload(file);
    
    // Reset file input
    e.target.value = '';
  };

  const removeCoverImage = () => {
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    return coverImage || null;
  };

  const handleFormSubmit = async (formData: BlogPostFormValues) => {
    console.log('=== Form submission started ===');
    
    try {
      console.log('Form data from form:', formData);
      
      // Validate required fields
      if (!formData.title?.trim()) {
        console.log('Validation failed: Title is required');
        toast.error('Title is required');
        return;
      }
      
      if (!formData.content?.trim()) {
        console.log('Validation failed: Content is required');
        toast.error('Content is required');
        return;
      }
      
      // Get current form values for debugging
      const currentValues = getValues();
      console.log('Current form values from getValues():', currentValues);
      
      // Create a complete blog post object with required fields
      const blogPost: BlogPost = {
        ...(initialData || {}),
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt?.trim() || '',
        coverImage: currentValues.coverImage || null,
        author: initialData?.author || '',
        authorId: initialData?.authorId || '',
        authorPhotoURL: initialData?.authorPhotoURL || null,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        published: formData.published ?? true,
        tags: formData.tags 
          ? formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          : []
      };
      
      console.log('Prepared blog post data:', blogPost);
      
      // Call the parent's onSubmit handler
      console.log('Calling onSubmit handler...');
      await onSubmit(blogPost);
      console.log('onSubmit handler completed');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('=== Form submission completed ===');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Title *</Label>
        <Input
          id="title"
          placeholder="Enter post title"
          {...register('title')}
          className="bg-gray-900/50 border-gray-700 text-gray-200 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
        />
        {errors.title && (
          <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-gray-300">Excerpt</Label>
        <Input
          id="excerpt"
          placeholder="A short description of your post"
          {...register('excerpt')}
          className="bg-gray-900/50 border-gray-700 text-gray-200 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
        />
        <p className="text-xs text-gray-400">
          A brief summary of your post (optional)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Cover Image</Label>
        <div className="mt-1">
          {coverImage && coverImage !== 'undefined' ? (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Current cover image:</p>
              <div className="relative group inline-block">
                <div className="w-full max-w-2xl h-48 md:h-64 rounded-lg overflow-hidden border-2 border-gray-700/50 hover:border-blue-500/50 transition-colors">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', coverImage);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.jpg';
                      setValue('coverImage', '', { shouldDirty: true });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeCoverImage();
                    toast.success('Image removed');
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                  title="Remove image"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
          
          {!isCloudinaryConfigured ? (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <p className="text-red-400 text-sm">
                Cloudinary is not properly configured. Please check your environment variables.
              </p>
              <p className="text-red-300 text-xs mt-1">
                Required: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700/70 transition-colors cursor-pointer ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <span>{coverImage ? 'Change Cover Image' : 'Upload Cover Image'}</span>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-400">
                Recommended: 16:9 aspect ratio, at least 1600×900 pixels. Max 5MB.
              </p>
              {uploadError && (
                <p className="text-sm text-red-400 mt-1">{uploadError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-gray-300">Content *</Label>
        <MarkdownEditor
          value={content}
          onChange={(value) => setValue('content', value)}
          placeholder="Write your blog post content here..."
          minHeight={500}
          error={errors.content?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-gray-300">Tags</Label>
        <Input
          id="tags"
          placeholder="tag1, tag2, tag3"
          {...register('tags')}
          className="bg-gray-900/50 border-gray-700 text-gray-200 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
        />
        <p className="text-xs text-gray-400">
          Separate tags with commas (e.g., "javascript, react, nextjs")
        </p>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/blog')}
          disabled={isSubmitting || isUploading}
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {(isSubmitting || isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : isEditing ? 'Update Post' : 'Publish Post'}
        </Button>
      </div>
    </form>
  );
}
