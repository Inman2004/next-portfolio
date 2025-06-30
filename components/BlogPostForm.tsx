'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X, Plus } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import EditorToolbar from './EditorToolbar';
import { useMarkdownEditor } from './MarkdownEditorContext';

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
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const { setEditor, insertText } = useMarkdownEditor();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      coverImage: initialData?.coverImage || null,
      published: initialData?.published ?? true,
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  const content = watch('content');
  const coverImage = watch('coverImage');

  // Update the editor ref when content changes
  useEffect(() => {
    if (textareaRef.current) {
      setEditor(textareaRef.current);
    }
  }, [content, setEditor]);

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

  const handleCoverImageUpload = async (file: File) => {
    if (!file) return;
  
    setIsUploading(true);
    setUploadError(null);
  
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', 'blog-covers'); // Add to blog-covers folder
  
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload image: ${error}`);
      }
  
      const data = await response.json();
      setValue('coverImage', data.secure_url, { shouldDirty: true, shouldValidate: true });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = () => {
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
  };

  const handleAddLink = useCallback(() => {
    setShowLinkDialog(true);
  }, []);

  const handleInsertLink = useCallback(() => {
    const markdownLink = `[${linkText || 'link'}](${linkUrl})`;
    insertText(markdownLink);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, insertText]);

  const handleFormSubmit = async (formData: BlogPostFormValues) => {
    console.log('=== Form submission started ===');

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        toast.error('Title is required');
        return;
      }

      if (!formData.content?.trim()) {
        toast.error('Content is required');
        return;
      }

      // Create a complete blog post object with required fields
      const blogPost: BlogPost = {
        ...(initialData || {}),
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt?.trim() || '',
        coverImage: formData.coverImage || null,
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

      // Call the parent's onSubmit handler
      await onSubmit(blogPost);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter post title"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          {...register('excerpt')}
          placeholder="A short description of your post"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">Content</Label>
          <div className="text-sm text-muted-foreground">
            Markdown supported
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <EditorToolbar
            onImageUpload={() => document.getElementById('cover-image-upload')?.click()}
            onAddLink={handleAddLink}
          />
          <Textarea
            id="content"
            {...register('content')}
            ref={(e) => {
              // Register the ref with react-hook-form
              const { ref } = register('content');
              if (ref) {
                ref(e);
              }

              // Store the ref for cleanup and updates
              textareaRef.current = e;
            }}
            placeholder="Write your post content here..."
            className={`min-h-[300px] rounded-t-none border-t-0 focus-visible:ring-0 ${errors.content ? 'border-red-500' : ''}`}
          />
        </div>

        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="cover-image-upload"
              className={`
          relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg 
          cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30
          ${isUploading ? 'opacity-70 cursor-wait' : ''}
          ${uploadError ? 'border-destructive/50' : 'border-muted-foreground/25'}
        `}
            >
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {coverImage ? 'Change cover image' : 'Upload a cover image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </label>
            {uploadError && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                <X className="h-4 w-4" />
                {uploadError}
              </p>
            )}
          </div>

          {coverImage && (
            <div className="relative group w-full sm:w-auto">
              <div className="relative h-40 w-full sm:w-60 overflow-hidden rounded-lg border bg-card shadow-sm">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-full w-full object-cover transition-all group-hover:opacity-90"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isUploading}
                  aria-label="Remove cover image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="comma, separated, tags"
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground">
          Add tags separated by commas
        </p>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-text">Text (optional)</Label>
                <Input
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleInsertLink}
                  disabled={!linkUrl}
                >
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </Button>
      </div>
    </form>
  );
}
