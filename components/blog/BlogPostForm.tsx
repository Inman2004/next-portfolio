'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { BlogPostFormValues, blogPostSchema } from '@/lib/schemas/blog';
import { useMarkdownEditor } from './MarkdownEditorContext';
import MarkdownEditor from './MarkdownEditor';
import TagInput from '@/components/ui/TagInput';

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormValues>;
  onSubmit: (data: BlogPostFormValues) => Promise<void>;
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

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      coverImage: null,
      published: true,
      tags: [],
      ...initialData,
      // Ensure tags are always an array, even if initialData.tags is undefined
      tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
    },
  });

  const { 
    control,
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = form;

  const { setEditor } = useMarkdownEditor();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const content = watch('content');
  const coverImage = watch('coverImage');

  useEffect(() => {
    if (textareaRef.current) {
      setEditor(textareaRef.current);
    }
  }, [content, setEditor]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Ensure you have this preset configured in your Cloudinary account
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_BLOG || 'blog-covers');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Image upload failed');

      const data = await response.json();
      setValue('coverImage', data.secure_url, { shouldDirty: true, shouldValidate: true });
      toast.success('Image uploaded successfully');
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const removeCoverImage = () => {
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
  };

  const handleFormSubmit = async (formData: BlogPostFormValues) => {
    try {
      await onSubmit(formData);
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
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
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
        <Label>Content</Label>
        <div className="rounded-md overflow-hidden">
          <MarkdownEditor
            value={content || ''}
            onChange={(value) => setValue('content', value, { shouldValidate: true })}
            placeholder="Write your post content here..."
            className={errors.content ? 'border-red-500' : ''}
            label=""
          />
        </div>
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="cover-image-upload"
              className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30 ${isUploading ? 'opacity-70 cursor-wait' : ''} ${uploadError ? 'border-destructive/50' : 'border-muted-foreground/25'}`}
            >
              <input id="cover-image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {isUploading ? (
                  <><Loader2 className="h-8 w-8 animate-spin text-primary mb-2" /><p className="text-sm text-muted-foreground">Uploading...</p></>
                ) : (
                  <><ImageIcon className="h-8 w-8 text-muted-foreground mb-2" /><p className="text-sm font-medium text-foreground">{coverImage ? 'Change cover image' : 'Upload a cover image'}</p><p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP (max 5MB)</p></>
                )}
              </div>
            </label>
            {uploadError && <p className="mt-2 text-sm text-destructive flex items-center gap-1.5"><X className="h-4 w-4" />{uploadError}</p>}
          </div>

          {coverImage && (
            <div className="relative group w-full sm:w-auto">
              <div className="relative h-40 w-full sm:w-60 overflow-hidden rounded-lg border bg-card shadow-sm">
                <img src={coverImage} alt="Cover preview" className="h-full w-full object-cover transition-all group-hover:opacity-90"/>
                <button type="button" onClick={removeCoverImage} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground" disabled={isUploading} aria-label="Remove cover image"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput
              {...field}
              placeholder="Add a tag and press Enter..."
            />
          )}
        />
        {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="published"
          control={control}
          render={({ field }) => (
            <Switch
              id="published"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label="Publish status"
            />
          )}
        />
        <Label htmlFor="published">Publish this post</Label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Creating...'}</>
          ) : (
            isEditing ? 'Update Post' : 'Create Post'
          )}
        </Button>
      </div>
    </form>
  );
}