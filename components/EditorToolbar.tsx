'use client';

import { useCallback, useRef, useState } from 'react';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Quote,
    Minus,
    Code2,
    ListTodo,
    Table as TableIcon,
    Minus as HorizontalRuleIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMarkdownEditor } from './MarkdownEditorContext';
import toast from 'react-hot-toast';
import { Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tutorial } from '@/app/blog/tutorial/Tutorial';



type MarkdownAction = {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    variant?: 'toggle' | 'button';
    separator?: boolean;
};

interface EditorToolbarProps {
    onFormatAction: (action: string) => void;
    onImageUpload: (file: File) => Promise<string>;
    onAddLink: () => void;
}

export default function EditorToolbar({ onFormatAction, onImageUpload, onAddLink }: EditorToolbarProps) {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [activeTab, setActiveTab] = useState('upload');
    const [rows, setRows] = useState(3);
    const [columns, setColumns] = useState(3);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const getCurrentLine = useCallback((): string => {
        if (!editorRef?.current) return '';
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const value = textarea.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        return value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    }, [editorRef]);

    const handleAction = useCallback((action: MarkdownAction) => {
        // Handle list actions with smart continuation
        if (['ul', 'ol', 'task'].includes(action.id)) {
            const currentLine = getCurrentLine();
            const isListLine = /^\s*[-*+]\s|^\s*\d+\.\s|^\s*-\s*\[\s*[xX]?\s*\]\s/.test(currentLine);
            
            if (isListLine) {
                // If we're already in a list, add a new line with the same indentation
                const match = currentLine.match(/^(\s*)/);
                const indent = match ? match[0] : '';
                const newLine = action.id === 'ul' ? `${indent}- ` : 
                              action.id === 'ol' ? `${indent}1. ` : 
                              `${indent}- [ ] `;
                onFormatAction(`insertText:${JSON.stringify({
                    text: `\n${newLine}`,
                    position: 'cursor'
                })}`);
                return;
            }
        }

        // Handle special cases
        if (action.id === 'image') {
            setIsImageDialogOpen(true);
            return;
        }

        if (action.id === 'table') {
            setIsTableDialogOpen(true);
            return;
        }

        if (action.id === 'link') {
            onAddLink();
            return;
        }

        // Handle other actions
        onFormatAction(action.id);
    }, [getCurrentLine, onFormatAction]);

    // Handle keyboard events for smart list continuation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const currentLine = getCurrentLine();
            const isListLine = /^\s*[-*+]\s|^\s*\d+\.\s|^\s*-\s*\[\s*[xX]?\s*\]\s/.test(currentLine);
            
            if (isListLine) {
                e.preventDefault();
                const match = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
                if (match) {
                    const [_, indent, marker] = match;
                    const newLineText = currentLine.includes('- [ ]') || currentLine.includes('- [x]') || currentLine.includes('- [X]')
                        ? `\n${indent}- [ ] `
                        : `\n${indent}${marker} `;
                    
                    onFormatAction(`insertText:${JSON.stringify({
                        text: newLineText,
                        position: 'cursor'
                    })}`);
                }
            }
        }
    }, [getCurrentLine, onFormatAction]);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!file) return;
        
        setIsUploading(true);
        setUploadError(null);
        
        try {
            const url = await onImageUpload(file);
            onFormatAction(`insertText:${JSON.stringify({
                text: `![${altText || 'image'}](${url})`,
                position: 'cursor'
            })}`);
            setIsImageDialogOpen(false);
            setAltText('');
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Failed to upload image. Please try again.');
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    }, [onImageUpload, onFormatAction, altText]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    // Clean up file input after selection
    const handleFileInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        target.value = '';
    }, []);

    const handleInsertTable = () => {
        let table = '\n';
        
        // Header row
        table += '| ' + Array(columns).fill('Header').join(' | ') + ' |\n';
        
        // Divider row
        table += '|' + Array(columns).fill('---').join('|') + '|\n';
        
        // Data rows
        for (let i = 0; i < rows; i++) {
            table += '| ' + Array(columns).fill('Data').join(' | ') + ' |\n';
        }
        
        onFormatAction(`insertText:${JSON.stringify({
            text: table,
            position: 'cursor'
        })}`);
        
        // Reset form
        setRows(3);
        setColumns(3);
        setIsTableDialogOpen(false);
    };

    const actions: MarkdownAction[] = [
        // Text formatting
        {
            id: 'bold',
            label: 'Bold',
            icon: <Bold className="h-4 w-4" />,
            shortcut: 'Ctrl+B',
            variant: 'toggle',
        },
        {
            id: 'italic',
            label: 'Italic',
            icon: <Italic className="h-4 w-4" />,
            shortcut: 'Ctrl+I',
            variant: 'toggle',
        },
        {
            id: 'heading1',
            label: 'Heading 1',
            icon: <Heading1 className="h-4 w-4" />,
        },
        {
            id: 'heading2',
            label: 'Heading 2',
            icon: <Heading2 className="h-4 w-4" />,
        },
        {
            id: 'heading3',
            label: 'Heading 3',
            icon: <Heading3 className="h-4 w-4" />,
        },
        {
            id: 'heading4',
            label: 'Heading 4',
            icon: <Heading4 className="h-4 w-4" />,
        },
        
        // First separator
        { id: 'separator-1', label: '', icon: null, separator: true },
        
        // Lists
        {
            id: 'ul',
            label: 'Bullet List',
            icon: <List className="h-4 w-4" />,
        },
        {
            id: 'ol',
            label: 'Numbered List',
            icon: <ListOrdered className="h-4 w-4" />,
        },
        {
            id: 'task',
            label: 'Task List',
            icon: <ListTodo className="h-4 w-4" />,
        },
        
        // Second separator
        { id: 'separator-2', label: '', icon: null, separator: true },
        
        // Code and quotes
        {
            id: 'code',
            label: 'Inline Code',
            icon: <Code className="h-4 w-4" />,
        },
        {
            id: 'codeBlock',
            label: 'Code Block',
            icon: <Code2 className="h-4 w-4" />,
        },
        {
            id: 'quote',
            label: 'Quote',
            icon: <Quote className="h-4 w-4" />,
        },
        
        // Third separator
        { id: 'separator-3', label: '', icon: null, separator: true },
        
        // Media and tables
        {
            id: 'link',
            label: 'Link',
            icon: <LinkIcon className="h-4 w-4" />,
        },
        {
            id: 'image',
            label: 'Image',
            icon: <ImageIcon className="h-4 w-4" />,
        },
        {
            id: 'table',
            label: 'Table',
            icon: <TableIcon className="h-4 w-4" />,
        },
        
        // Fourth separator
        { id: 'separator-4', label: '', icon: null, separator: true },
        
        // Horizontal rule
        {
            id: 'hr',
            label: 'Horizontal Rule',
            icon: <HorizontalRuleIcon className="h-4 w-4" />,
        }
    ];

    return (
        <>
            <TooltipProvider>
                <div className="flex flex-wrap items-center rounded mx-3 gap-1 p-1 border-b bg-muted/50">
                    {actions.map((action) => {
                        if (action.separator) {
                            return <div key={action.id} className="h-6 w-px bg-border mx-0.5" />;
                        }

                        return (
                            <Tooltip key={action.id}>
                                <TooltipTrigger asChild>
                                    {action.variant === 'toggle' ? (
                                        <Toggle
                                            size="sm"
                                            aria-label={action.label}
                                            onPressedChange={() => handleAction(action)}
                                        >
                                            {action.icon}
                                        </Toggle>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(action)}
                                            aria-label={action.label}
                                        >
                                            {action.icon}
                                        </Button>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="flex items-center gap-1">
                                    <span>{action.label}</span>
                                    {action.shortcut && (
                                        <span className="text-xs text-muted-foreground">
                                            {action.shortcut}
                                        </span>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
                <Tutorial />
            </TooltipProvider>

            {/* Image Insertion Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    <Tabs 
                        value={activeTab}
                        onValueChange={(value) => {
                            setActiveTab(value);
                            setImageUrl('');
                            setAltText('');
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload Image</TabsTrigger>
                            <TabsTrigger value="url">From URL</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-4 pt-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="file-upload">Choose an image</Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    onClick={handleFileInputClick}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="alt-text-upload">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text-upload"
                                    placeholder="Describe the image for accessibility"
                                    value={altText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4 pt-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="alt-text-url">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text-url"
                                    placeholder="Describe the image for accessibility"
                                    value={altText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={() => {
                                        if (!imageUrl) return;
                                        onFormatAction(`insertText:${JSON.stringify({
                                            text: `![${altText || 'image'}](${imageUrl})`,
                                            position: 'cursor'
                                        })}`);
                                        setImageUrl('');
                                        setAltText('');
                                        setIsImageDialogOpen(false);
                                    }}
                                >
                                    Insert Image
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Table Insertion Dialog */}
            <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rows">Rows</Label>
                                <Input
                                    id="rows"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={rows}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRows(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="columns">Columns</Label>
                                <Input
                                    id="columns"
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={columns}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColumns(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleInsertTable}
                            >
                                Insert Table
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
