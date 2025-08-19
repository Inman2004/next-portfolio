'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X, Plus, FilePlus2, Library, ChevronDown } from 'lucide-react';
import { BlogPostFormValues } from '@/lib/schemas/blog';
import { blogPostSchema } from '@/lib/schemas/blog';
import { useMarkdownEditor } from './MarkdownEditorContext';
import MarkdownEditor from './MarkdownEditor';

interface BlogDraft extends BlogPostFormValues {
  id: string;
  updatedAt: string;
}

interface BlogPostFormProps {
  initialData?: BlogPostFormValues;
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
  const { startLoading, stopLoading } = useLoadingState();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showDraftsManager, setShowDraftsManager] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Initialize form
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      coverImage: null,
      published: true,
      tags: '',
      ...initialData
    },
  });

  // Draft auto-ID disabled

  // Draft restore disabled

  // Autosave disabled
  const saveDraft = useCallback(async (_data: BlogPostFormValues) => {}, []);

  // Autosave watcher disabled

  const { 
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

  // Minimal templates for quick start
  const templates = useMemo(() => ([
    {
      id: 'tutorial',
      name: 'Tutorial',
      content: `# Title\n\n> What the reader will learn.\n\n## Prerequisites\n- Item 1\n- Item 2\n\n## Steps\n1. Step one\n2. Step two\n\n## Conclusion\nKey takeaways.\n`
    },
    {
      id: 'release',
      name: 'Release Notes',
      content: `# vX.Y.Z Release Notes\n\n## Highlights\n- Feature A\n- Feature B\n\n## Changes\n- Change 1\n- Change 2\n`
    },
    {
      id: 'deepdive',
      name: 'Deep Dive',
      content: `# Deep Dive: Topic\n\n## Background\nContext...\n\n## Architecture\n\n## Trade-offs\n\n## Conclusion\n`
    }
  ]), []);

  const applyTemplate = useCallback((tpl: { content: string }, mode: 'replace' | 'append') => {
    const current = (form.getValues('content') || '') as string;
    const next = mode === 'replace' ? tpl.content : `${current}\n\n${tpl.content}`;
    setValue('content', next, { shouldValidate: true });
    setShowTemplates(false);
  }, [form, setValue]);

  const handleSaveAsDraft = useCallback(() => {
    try {
      const values = form.getValues();
      const draft: BlogDraft = {
        ...(values as any),
        id: draftId || `draft_${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      const drafts: Record<string, BlogDraft> = JSON.parse(localStorage.getItem('blogDrafts') || '{}');
      drafts[draft.id] = draft;
      localStorage.setItem('blogDrafts', JSON.stringify(drafts));
      setDraftId(draft.id);
      setLastSaved(new Date());
      toast.success('Draft saved');
    } catch (e) {
      toast.error('Failed to save draft');
    }
  }, [form, draftId]);

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
    startLoading();
  
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
      stopLoading();
    }
  };

  const removeCoverImage = () => {
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
  };

  const handleAddLink = useCallback(() => {
    // Focus the textarea first to ensure we have the correct cursor position
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setShowLinkDialog(true);
  }, []);

  const handleInsertLink = useCallback(() => {
    const markdownLink = `[${linkText || 'link'}](${linkUrl})`;
    
    // Insert at cursor position if editor is available
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const currentValue = textareaRef.current.value;
      const newValue = currentValue.substring(0, start) + markdownLink + currentValue.substring(end);
      
      // Update the form value
      setValue('content', newValue, { shouldValidate: true });
      
      // Move cursor to the end of the inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + markdownLink.length;
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, setValue]);

  const handleFormSubmit = async (formData: BlogPostFormValues) => {
    console.log('=== Form submission started ===');
    startLoading();

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
      // Prepare the form values for submission
      const formValues: BlogPostFormValues = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt?.trim() || '',
        coverImage: formData.coverImage || null,
        published: formData.published ?? true,
        tags: formData.tags && typeof formData.tags === 'string' 
          ? formData.tags 
          : Array.isArray(formData.tags) 
            ? formData.tags.join(', ') 
            : ''
      };

      // Call the parent's onSubmit handler with the form values
      await onSubmit(formValues);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Top actions for upcoming features */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplates(v => !v)}>
            <FilePlus2 className="w-4 h-4 mr-1" /> Templates
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {/* Drafts disabled */}
        </div>
        <div className="flex items-center gap-2">
          {/* Save as draft disabled */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Publishing...'}
              </>
            ) : isEditing ? (
              'Update Post'
            ) : (
              'Publish Post'
            )}
          </Button>
        </div>
      </div>

      {showTemplates && (
        <div className="rounded-lg border bg-card p-3 grid sm:grid-cols-3 gap-3">
          {templates.map(tpl => (
            <div key={tpl.id} className="rounded-md border p-3 space-y-2">
              <div className="font-medium">{tpl.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{tpl.content}</div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate(tpl, 'append')}>Append</Button>
                <Button type="button" size="sm" onClick={() => applyTemplate(tpl, 'replace')}>Use</Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
          <Label>Content</Label>
        </div>

        <div className="rounded-md overflow-hidden">
          <MarkdownEditor
            value={content || ''}
            onChange={(value) => setValue('content', value, { shouldValidate: true })}
            placeholder="Write your post content here..."
            className={errors.content ? 'border-red-500' : ''}
            label=""
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

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSaved && !isDraftSaving && (
            <span>Draft saved {new Date(lastSaved).toLocaleTimeString()}</span>
          )}
          {isDraftSaving && (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
        </div>
        <div className="space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/blog')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Drafts Manager Modal (UI only, uses localStorage) */}
      {showDraftsManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Drafts</h3>
              <Button variant="ghost" onClick={() => setShowDraftsManager(false)}>Close</Button>
            </div>
            <DraftsList onRestore={(draft) => {
              const { id, updatedAt, ...data } = draft;
              form.reset(data as any);
              setDraftId(id);
              setShowDraftsManager(false);
              toast.success('Draft restored');
            }} onDelete={(id) => {
              const drafts: Record<string, BlogDraft> = JSON.parse(localStorage.getItem('blogDrafts') || '{}');
              delete drafts[id];
              localStorage.setItem('blogDrafts', JSON.stringify(drafts));
              toast.success('Draft deleted');
            }} />
          </div>
        </div>
      )}
    </form>
  );
}

function DraftsList({ onRestore, onDelete }: { onRestore: (draft: BlogDraft) => void; onDelete: (id: string) => void }) {
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);

  useEffect(() => {
    const saved: Record<string, BlogDraft> = JSON.parse(localStorage.getItem('blogDrafts') || '{}');
    const list = Object.values(saved).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setDrafts(list);
  }, []);

  if (!drafts.length) return <div className="text-sm text-muted-foreground">No drafts found.</div>;

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {drafts.map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="font-medium truncate max-w-[40ch]">{d.title || '(Untitled draft)'}</div>
            <div className="text-xs text-muted-foreground">Last saved {new Date(d.updatedAt).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onRestore(d)}>Restore</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(d.id)}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
