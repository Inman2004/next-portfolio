'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

// Dynamically import the MD editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    published: boolean;
    featuredImage?: string;
    tags?: string[];
  };
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    published: initialData?.published || false,
    featuredImage: initialData?.featuredImage || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = useCallback((value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      content: value || ''
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    
    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSaving(true);
    }

    try {
      // Here you would typically make an API call to save the post
      console.log('Saving post:', { ...formData, published: publish });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to blog posts list after successful save
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving || isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {initialData?.published ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-6 md:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              className="text-2xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="rounded-md border">
              <div data-color-mode="light">
                <MDEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  height={500}
                  className="min-h-[500px] rounded-md border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Status: {formData.published ? 'Published' : 'Draft'}</Label>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="post-slug"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Generate slug from title
                  const slug = formData.title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-');
                  setFormData({ ...formData, slug });
                }}
              >
                Generate Slug
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="excerpt">A short excerpt for preview</Label>
                <Input
                  id="excerpt"
                  name="excerpt"
                  as="textarea"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Enter a short excerpt"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Image URL</Label>
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Upload Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="tags">Add tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="nextjs, react, javascript"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
