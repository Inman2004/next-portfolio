'use client';

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownViewer from './MarkdownViewer';
import EditorToolbar from './EditorToolbar';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  label?: string;
  error?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className = '',
  minHeight = 500,
  label,
  error,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const insertText = useCallback((text: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentValue = textareaRef.current.value;
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    // Update the value
    onChange(newValue);
    
    // Move cursor to the end of the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + text.length;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  }, [onChange]);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', 'blog-images');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const markdown = `![${file.name}](${data.secure_url})`;
      insertText(markdown);
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [insertText]);

  const handleAddLink = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setShowLinkDialog(true);
  }, []);

  const handleInsertLink = useCallback((url: string, text?: string) => {
    const markdownLink = `[${text || 'link'}](${url})`;
    insertText(markdownLink);
    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  }, [insertText]);

  // Handle formatting actions from the toolbar
  const handleFormatAction = useCallback((action: string) => {
    if (!textareaRef.current) return;
    
    // Handle special insertText format for more complex operations
    if (action.startsWith('insertText:')) {
      try {
        const { text, position } = JSON.parse(action.replace('insertText:', ''));
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const currentValue = textareaRef.current.value;
        
        let newValue = '';
        let newCursorPos = 0;
        
        if (position === 'cursor') {
          // Insert at cursor position
          newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
          newCursorPos = start + text.length;
        } else {
          // Append to the end
          newValue = currentValue + text;
          newCursorPos = newValue.length;
        }
        
        onChange(newValue);
        
        // Update cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;
            textareaRef.current.focus();
          }
        }, 0);
      } catch (error) {
        console.error('Error processing insertText action:', error);
      }
      return;
    }
    
    // Handle regular formatting actions
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let cursorOffset = 0;
    let newCursorPos = 0;

    switch (action) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'heading1':
        newText = `# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'heading2':
        newText = `## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'heading3':
        newText = `### ${selectedText}`;
        cursorOffset = 4;
        break;
      case 'heading4':
        newText = `#### ${selectedText}`;
        cursorOffset = 5;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'codeBlock':
        newText = `\`\`\`\n${selectedText}\n\`\`\``;
        cursorOffset = 4;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'ul':
        newText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'ol':
        newText = `1. ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'task':
        newText = `- [ ] ${selectedText}`;
        cursorOffset = 6;
        break;
      case 'hr':
        // Insert a horizontal rule with newlines before and after
        newText = `\n\n---\n\n`;
        cursorOffset = 0;
        // Insert at current cursor position without selecting text
        if (start === end) {
          newText = `\n\n---\n\n`;
          cursorOffset = 0;
        }
        break;
      case 'link':
        handleAddLink();
        return;
      default:
        return;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Update cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        newCursorPos = selectedText ? start + newText.length : start + cursorOffset;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  }, [value, onChange, handleAddLink]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        
        // Move cursor position after the inserted spaces
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2;
            textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Auto-indent new lines
      e.preventDefault();
      
      if (!textareaRef.current) return;
      
      const start = textareaRef.current.selectionStart;
      const beforeText = value.substring(0, start);
      const afterText = value.substring(textareaRef.current.selectionEnd);
      
      // Get the current line's indentation
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const lineContent = beforeText.substring(lineStart);
      const leadingSpaces = lineContent.match(/^ */)?.[0] || '';
      
      // Insert newline with the same indentation
      const newText = `${beforeText}\n${leadingSpaces}${afterText}`;
      const newCursorPos = start + 1 + leadingSpaces.length;
      
      onChange(newText);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
        }
      }, 0);
    }
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      
      {/* Editor Toolbar */}
      <div className="border rounded-t-lg bg-background/50 backdrop-blur-sm p-1">
        <EditorToolbar 
          onFormatAction={handleFormatAction}
          onImageUpload={handleImageUpload}
        />
      </div>
      
      <Tabs 
        defaultValue="edit" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm border-x border-b rounded-none">
          <TabsTrigger value="edit" className="py-1.5 rounded-none">Edit</TabsTrigger>
          <TabsTrigger value="preview" className="py-1.5 rounded-none">Preview</TabsTrigger>
          <TabsTrigger value="both" className="py-1.5 rounded-none">Split View</TabsTrigger>
        </TabsList>
        
        <div className="relative rounded-b-lg border border-t-0 bg-background/50 backdrop-blur-sm">
          {/* Edit View */}
          <div className={cn(
            'transition-all duration-200 ease-in-out',
            activeTab === 'edit' ? 'block' : 'hidden',
            activeTab === 'both' && 'md:block md:w-1/2 md:border-r md:border-gray-200 dark:md:border-gray-800 md:float-left',
            'h-[500px]',
            error && 'border-red-500/50'
          )}>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'w-full h-full font-mono text-sm bg-transparent border-0 rounded-none',
                'text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0',
                'resize-none',
              )}
              style={{ minHeight: `${minHeight}px` }}
            />
          </div>
          
          {/* Preview View */}
          <div className={cn(
            'transition-all duration-200 ease-in-out bg-background/50',
            activeTab === 'preview' ? 'block' : 'hidden',
            activeTab === 'both' && 'md:block md:w-1/2 md:float-right',
            'h-[500px] overflow-auto',
            error && 'border-red-500/50'
          )}>
            <ScrollArea className="h-full w-full p-4">
              {value ? (
                <MarkdownViewer content={value} />
              ) : (
                <div className="text-muted-foreground text-sm h-full flex items-center justify-center">
                  Preview will appear here
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="clear-both"></div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t bg-background/50 rounded-b-lg">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Markdown supported:</span>{' '}
              <span className="opacity-80">
                **bold**, *italic*, `code`, ```code blocks```, [links](url), and more
              </span>
            </div>
          </div>
          
          {/* Link Dialog */}
          <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${showLinkDialog ? 'block' : 'hidden'}`}>
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Insert Link</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="link-url" className="block text-sm font-medium mb-1">
                    URL
                  </label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="link-text" className="block text-sm font-medium mb-1">
                    Link Text (optional)
                  </label>
                  <Input
                    id="link-text"
                    placeholder="Click here"
                    value={linkText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkText(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      setShowLinkDialog(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      handleInsertLink(linkUrl, linkText || undefined);
                    }}
                    disabled={!linkUrl}
                  >
                    Insert Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
