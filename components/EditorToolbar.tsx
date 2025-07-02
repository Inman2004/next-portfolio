'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Quote,
    Minus,
    Code2,
    ListTodo,
    Table as TableIcon
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

type EditorProxy = {
    insertText: (text: string) => void;
    focus: () => void;
};

type MarkdownAction = {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    action: (editor: EditorProxy) => void;
    separator?: boolean;
    variant?: 'toggle' | 'button';
    onClick?: () => void;
};

interface EditorToolbarProps {
    onImageUpload: (file: File) => Promise<string>;
    onAddLink: () => void;
}

export default function EditorToolbar({ onImageUpload, onAddLink }: EditorToolbarProps) {
    const { insertText, editorRef } = useMarkdownEditor();
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [activeTab, setActiveTab] = useState('upload');
    const [rows, setRows] = useState(3);
    const [columns, setColumns] = useState(3);
    
    if (!insertText) return null;

    // Create a proxy object that provides the required methods
    const editorProxy = useMemo(() => ({
        insertText: (text: string) => insertText?.(text),
        focus: () => editorRef.current?.focus()
    }), [insertText, editorRef]);

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
        if (!insertText) return;

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
                insertText(`\n${newLine}`);
                return;
            }
        }

        if (action.action) {
            action.action(editorProxy);
        }

        if (action.onClick) {
            action.onClick();
        }
    }, [insertText, editorProxy, getCurrentLine]);

    // Handle keyboard events for smart list continuation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const currentLine = getCurrentLine();
            const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
            const taskMatch = currentLine.match(/^(\s*)- \[(\s*[xX]?\s*)\]\s/);
            
            if (listMatch || taskMatch) {
                e.preventDefault();
                const indent = listMatch ? listMatch[1] : taskMatch?.[1] || '';
                let newLine = '\n' + indent;
                
                if (taskMatch) {
                    // Continue task list with proper spacing
                    const isChecked = taskMatch[2].trim().toLowerCase() === 'x';
                    newLine += `- [${isChecked ? 'x' : ' '}] `;
                } else if (listMatch) {
                    // Continue regular list
                    const isNumbered = /\d+\./.test(listMatch[2]);
                    if (isNumbered) {
                        const num = parseInt(listMatch[2]) + 1;
                        newLine += `${num}. `;
                    } else {
                        newLine += `${listMatch[2]} `;
                    }
                }
                
                insertText?.(newLine);
            }
        }
    }, [insertText]);

    const handleImageUpload = useCallback(async (file?: File) => {
        if (!file || !onImageUpload) return;

        try {
            const uploadedImageUrl = await onImageUpload(file);
            if (uploadedImageUrl) {
                const markdown = `![${altText || 'image'}](${uploadedImageUrl})`;
                insertText?.(markdown);
                toast.success('Image uploaded successfully');
                setIsImageDialogOpen(false);
                setAltText('');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        }
    }, [altText, insertText, onImageUpload]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    const handleUrlInsert = useCallback(() => {
        if (!imageUrl) return;
        const markdown = `![${altText || 'image'}](${imageUrl})`;
        insertText?.(markdown);
        setImageUrl('');
        setAltText('');
        setIsImageDialogOpen(false);
    }, [imageUrl, altText, insertText]);

    const actions = useMemo<MarkdownAction[]>(() => [
        {
            id: 'h1',
            label: 'Heading 1',
            shortcut: '# + Space',
            icon: <Heading1 className="h-4 w-4" />,
            action: (editor) => editor.insertText('# '),
            variant: 'toggle' as const
        },
        {
            id: 'h2',
            label: 'Heading 2',
            shortcut: '## + Space',
            icon: <Heading2 className="h-4 w-4" />,
            action: (editor) => editor.insertText('## '),
            variant: 'toggle' as const
        },
        {
            id: 'divider-1',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'bold',
            label: 'Bold',
            shortcut: 'Ctrl+B',
            icon: <Bold className="h-4 w-4" />,
            action: (editor) => editor.insertText('**bold text**'),
            variant: 'toggle' as const
        },
        {
            id: 'italic',
            label: 'Italic',
            shortcut: 'Ctrl+I',
            icon: <Italic className="h-4 w-4" />,
            action: (editor) => editor.insertText('*italic text*'),
            variant: 'toggle' as const
        },
        {
            id: 'divider-2',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'ul',
            label: 'Bullet List',
            shortcut: '- + Space',
            icon: <List className="h-4 w-4" />,
            action: (editor) => editor.insertText('- '),
            variant: 'toggle' as const
        },
        {
            id: 'ol',
            label: 'Numbered List',
            shortcut: '1. + Space',
            icon: <ListOrdered className="h-4 w-4" />,
            action: (editor) => editor.insertText('1. '),
            variant: 'toggle' as const
        },
        {
            id: 'task',
            label: 'Task List',
            icon: <ListTodo className="h-4 w-4" />,
            action: (editor) => {
                const currentLine = getCurrentLine();
                if (/^\s*$/.test(currentLine)) {
                    // If line is empty, insert task list item with proper spacing
                    editor.insertText('- [ ] ');
                } else {
                    // If there's text, convert it to a task list item with proper spacing
                    const match = currentLine.match(/^(\s*)(.*)/);
                    if (match) {
                        const [_, indent, text] = match;
                        // Ensure there's a space after the brackets
                        const taskText = text.trim().startsWith('- [') 
                            ? text.replace(/^\s*-\s*\[\s*([xX\s]?)\s*\]\s*/, '- [ $1 ] ') 
                            : `- [ ] ${text}`;
                        editor.insertText(`\n${indent}${taskText}`);
                    }
                }
            },
            variant: 'toggle' as const
        },
        {
            id: 'divider-3',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'link',
            label: 'Insert Link',
            shortcut: 'Ctrl+K',
            icon: <LinkIcon className="h-4 w-4" />,
            action: () => onAddLink(),
            variant: 'button' as const
        },
        {
            id: 'image',
            label: 'Insert Image',
            icon: <ImageIcon className="h-4 w-4" />,
            action: () => setIsImageDialogOpen(true),
            variant: 'button' as const
        },
        {
            id: 'divider-4',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'code',
            label: 'Code Block',
            shortcut: '``` + Enter',
            icon: <Code2 className="h-4 w-4" />,
            action: (editor) => editor.insertText('```\n\n```'),
            variant: 'toggle' as const
        },
        {
            id: 'inline-code',
            label: 'Inline Code',
            shortcut: '` + Ctrl',
            icon: <Code className="h-4 w-4" />,
            action: (editor) => editor.insertText('`code`'),
            variant: 'toggle' as const
        },
        {
            id: 'divider-5',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'table',
            label: 'Insert Table',
            icon: <TableIcon className="h-4 w-4" />,
            action: () => setIsTableDialogOpen(true),
            variant: 'button' as const
        },
        {
            id: 'divider-6',
            label: 'Divider',
            icon: null,
            action: () => { },
            separator: true
        },
        {
            id: 'quote',
            label: 'Quote',
            shortcut: '> + Space',
            icon: <Quote className="h-4 w-4" />,
            action: (editor) => editor.insertText('> '),
            variant: 'toggle' as const
        }
    ], [getCurrentLine, onAddLink, setIsImageDialogOpen, setIsTableDialogOpen]);

    return (
        <>
            <TooltipProvider>
                <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50">
                    {actions.map((action) => {
                        if (action.separator) {
                            return <div key={action.id} className="h-6 w-px bg-border mx-0.5" />;
                        }

                        const commonProps = {
                            'aria-label': action.label,
                            'data-tooltip-id': `tooltip-${action.id}`,
                            className: 'h-8 w-8 p-0 flex items-center justify-center',
                            onClick: (e: React.MouseEvent) => {
                                e.preventDefault();
                                handleAction(action);
                            },
                            type: 'button' as const
                        };

                        return (
                            <Tooltip key={action.id}>
                                <TooltipTrigger asChild>
                                    {action.variant === 'button' ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            {...commonProps}
                                        >
                                            {action.icon}
                                        </Button>
                                    ) : (
                                        <Toggle
                                            size="sm"
                                            {...commonProps}
                                        >
                                            {action.icon}
                                        </Toggle>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="flex flex-col items-center">
                                    <span>{action.label}</span>
                                    {action.shortcut && (
                                        <span className="text-xs text-muted-foreground">{action.shortcut}</span>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}<Tutorial />
                </div>
                
            </TooltipProvider>
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
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="alt-text-upload">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text-upload"
                                    placeholder="Describe the image for accessibility"
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
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
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="alt-text-url">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text-url"
                                    placeholder="Describe the image for accessibility"
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleUrlInsert}
                                    disabled={!imageUrl}
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
                                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
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
                                    onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={() => {
                                    const validRows = Math.max(1, Math.min(10, rows));
                                    const validCols = Math.max(1, Math.min(6, columns));

                                    // Generate table markdown
                                    let table = '\n\n';
                                    table += '|' + ' Header   |'.repeat(validCols) + '\n';
                                    table += '|' + '----------|'.repeat(validCols) + '\n';
                                    
                                    for (let i = 0; i < validRows; i++) {
                                        table += '|' + ' Cell     |'.repeat(validCols) + '\n';
                                    }
                                    
                                    insertText?.(table);
                                    setIsTableDialogOpen(false);
                                }}
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
