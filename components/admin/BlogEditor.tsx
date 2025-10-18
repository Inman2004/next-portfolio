'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, Copy, Mic } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Dynamically import the MD editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

const CodeBlock = ({ children = [], className, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const language = className?.replace(/language-/, '') || 'text';

  const handleCopy = () => {
    if (children && typeof children === 'string') {
      navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
      <Button
        size="sm"
        className="absolute top-2 right-2"
        onClick={handleCopy}
      >
        {isCopied ? 'Copied!' : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
};

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
      const { tags, ...rest } = formData;
      const payload = {
        ...rest,
        published: publish,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const response = await fetch(`/api/blog/${initialData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }
      
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
            <div className="flex justify-between">
              <Label>Content</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const recognition = new (window as any).webkitSpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.onresult = (event: any) => {
                      let transcript = '';
                      for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                          transcript += event.results[i][0].transcript;
                        }
                      }
                      setFormData((prev) => ({
                        ...prev,
                        content: prev.content + transcript,
                      }));
                    };
                    recognition.start();
                  }}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById('markdown-importer')?.click()
                  }
                >
                  Import Markdown
                </Button>
                <input
                  type="file"
                  id="markdown-importer"
                  className="hidden"
                  accept=".md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        setFormData((prev) => ({ ...prev, content }));
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>
            </div>
            <div className="rounded-md border">
              <div data-color-mode="light">
                <MDEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  height={500}
                  className="min-h-[500px] rounded-md border"
                  components={{
                    code: CodeBlock,
                  }}
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
