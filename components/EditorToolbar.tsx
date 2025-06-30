'use client';

import { useCallback, useMemo } from 'react';
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
import { useMarkdownEditor, MarkdownEditorContextType } from './MarkdownEditorContext';
import { Popover } from './ui/popover';
import toast from 'react-hot-toast';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    onImageUpload: () => void;
    onAddLink: () => void;
}

export default function EditorToolbar({ onImageUpload, onAddLink }: EditorToolbarProps) {
    const { insertText } = useMarkdownEditor();
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'

    // Create a proxy object that provides the required methods
    const editorProxy = useMemo(() => ({
        insertText: (text: string) => {
            if (insertText) {
                insertText(text);
            }
        },
        focus: () => {
            // The focus is handled by the MarkdownEditorContext
        }
    }), [insertText]);

    const handleAction = useCallback((action: MarkdownAction) => {
        if (!insertText) return;

        if (action.action) {    
            action.action(editorProxy);
        }

        if (action.onClick) {
            action.onClick();
        }
    }, [insertText, editorProxy]);

    const handleImageUpload = useCallback(async (file?: File) => {
        if (!file) return;
    
        try {
            const imageUrl = await handleFileUpload(file);
            if (imageUrl) {
                const markdown = `![${altText || 'image'}](${imageUrl})`;
                insertText?.(markdown);
                toast.success('Image uploaded successfully');
                setIsImageDialogOpen(false);
                setAltText('');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        }
    }, [altText, insertText]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };
    
    const handleUrlInsert = () => {
        if (!imageUrl) return;
        const markdown = `![${altText || 'image'}](${imageUrl})`;
        insertText?.(markdown);
        setImageUrl('');
        setAltText('');
        setIsImageDialogOpen(false);
    };

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
            action: (editor) => editor.insertText('- [ ] '),
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
            action: () => { },
            variant: 'button' as const,
            onClick: onAddLink
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
            action: (editor) => {
                const getInput = (message: string, defaultValue: string): Promise<string> => {
                    return new Promise((resolve) => {
                        const input = window.prompt(message, defaultValue);
                        resolve(input || defaultValue);
                    });
                };

                const createTable = async () => {
                    try {
                        const rowsInput = await getInput('Enter number of rows (2-10):', '3');
                        const colsInput = await getInput('Enter number of columns (1-6):', '3');

                        const rows = parseInt(rowsInput) || 3;
                        const cols = parseInt(colsInput) || 3;

                        // Validate input
                        const validRows = Math.max(2, Math.min(10, rows));
                        const validCols = Math.max(1, Math.min(6, cols));

                        // Generate table
                        let table = '\n\n';
                        table += '|' + ' Header   |'.repeat(validCols) + '\n';
                        table += '|' + '----------|'.repeat(validCols) + '\n';

                        for (let i = 0; i < validRows; i++) {
                            table += '|' + ' Cell     |'.repeat(validCols) + '\n';
                        }
                        table += '\n';

                        editor.insertText(table);

                    } catch (error) {
                        toast.error('Error creating table');
                        console.error('Error creating table:', error);
                    }
                };

                createTable();
            },
            variant: 'button' as const
        },
        {
            id: 'quote',
            label: 'Quote',
            shortcut: '> + Space',
            icon: <Quote className="h-4 w-4" />,
            action: (editor) => editor.insertText('> '),
            variant: 'toggle' as const
        },
        {
            id: 'divider',
            label: 'Divider',
            shortcut: '--- + Enter',
            icon: <Minus className="h-4 w-4" />,
            action: (editor) => editor.insertText('\n---\n'),
            variant: 'toggle' as const
        }
    ], [onAddLink, onImageUpload]);

    if (!insertText) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50 relative">
            <Toaster position="top-center" />
            <TooltipProvider>
                <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50">
                    {actions.map((action) => {
                        if (action.separator) {
                            return <div key={action.id} className="h-6 w-px bg-border mx-0.5" />;
                        }

                        const commonProps = {
                            key: action.id,
                            'aria-label': action.label,
                            'data-tooltip-id': `tooltip-${action.id}`,
                            className: 'h-8 w-8 p-0 flex items-center justify-center',
                            onClick: () => handleAction(action)
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
                    })}
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
        </div>
    );
}
