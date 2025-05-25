'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import MarkdownEditor from './MarkdownEditor';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

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
  // Remove coverImageFile state as we don't need it anymore
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

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

  const handleCoverImageUpload = (result: CloudinaryUploadWidgetResults) => {
    console.log('Cloudinary upload result:', result);
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      const errorMsg = 'Cloudinary configuration is missing.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (result.event === 'success' && result.info) {
      try {
        const info = result.info as any;
        const imageUrl = info.secure_url || info.url;
        
        if (!imageUrl) {
          throw new Error('No image URL returned from Cloudinary');
        }
        
        console.log('Setting cover image URL:', imageUrl);
        
        // Update the form field
        setValue('coverImage', imageUrl, { 
          shouldDirty: true, 
          shouldValidate: true 
        });
        
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error setting cover image:', error);
        toast.error('Failed to process the uploaded image');
      }
    } else if (result.event === 'error') {
      const errorMessage = typeof result.info === 'object' && result.info !== null 
        ? (result.info as any).message || 'Unknown error'
        : 'Upload failed';
      const errorMsg = `Upload failed: ${errorMessage}`;
      console.error('Upload error:', result);
      toast.error(errorMsg);
    } else if (result.event === 'close') {
      console.log('Upload widget was closed');
    }
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
                <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-700/50 hover:border-blue-500/50 transition-colors">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', coverImage);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.jpg';
                      // Clear the invalid image URL from the form
                      setValue('coverImage', '', { shouldDirty: true });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue('coverImage', '', { shouldDirty: true });
                    toast.success('Image removed');
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
          {!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET ? (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <p className="text-red-400 text-sm">
                Cloudinary is not properly configured. Please check your environment variables.
              </p>
              <p className="text-red-300 text-xs mt-1">
                Required: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
              </p>
            </div>
          ) : (
            <CldUploadWidget
              uploadPreset={CLOUDINARY_UPLOAD_PRESET}
              options={{
                cloudName: CLOUDINARY_CLOUD_NAME,
                maxFiles: 1,
                multiple: false,
                resourceType: 'image',
                clientAllowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
                maxFileSize: 5000000, // 5MB
                cropping: true,
                croppingAspectRatio: 16 / 9,
                showSkipCropButton: false,
                singleUploadAutoClose: true,
                folder: 'blog-covers', // Optional: Organize uploads in a folder
                theme: 'minimal',
                styles: {
                  palette: {
                    window: '#1e293b',
                    sourceBg: '#0f172a',
                    windowBorder: '#334155',
                    tabIcon: '#94a3b8',
                    inactiveTabIcon: '#64748b',
                    menuIcons: '#94a3b8',
                    link: '#60a5fa',
                    action: '#3b82f6',
                    inProgress: '#3b82f6',
                    complete: '#10b981',
                    error: '#ef4444',
                    textDark: '#1e293b',
                    textLight: '#f8fafc'
                  },
                  fonts: {
                    default: null,
                    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif': {
                      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
                      active: true
                    }
                  }
                }
              }}
              onUpload={handleCoverImageUpload}
            >
            {({ open }: { open: () => void }) => (
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700/70 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {watch('coverImage') ? 'Change Image' : 'Upload Image'}
                  </>
                )}
              </button>
            )}
            </CldUploadWidget>
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
