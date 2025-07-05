'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import EditorToolbar from './EditorToolbar';
import debounce from 'lodash/debounce';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

// Lazy load the Monaco Editor
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  { ssr: false, loading: () => <div className="p-4">Loading editor...</div> }
);

// Lazy load the MarkdownViewer to reduce initial bundle size
const LazyMarkdownViewer = dynamic(() => import('./MarkdownViewer'), {
  ssr: false,
  loading: () => <div className="p-4">Loading preview...</div>
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  label?: string;
  error?: string;
}

// Memoize the editor to prevent unnecessary re-renders
function MarkdownEditorComponent({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className = '',
  minHeight = 500,
  label,
  error,
}: MarkdownEditorProps) {
  const editorRef = useRef<any>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  
  // Optimized reducer to prevent unnecessary state updates
  const [state, dispatch] = useReducer((prev: any, action: any) => {
    switch (action.type) {
      case 'SET_VALUES':
        if (prev.localValue === action.value && !prev.isDirty) return prev;
        return { localValue: action.value, previewValue: action.value, isDirty: false };
      case 'UPDATE_LOCAL':
        if (prev.localValue === action.value) return prev;
        return { ...prev, localValue: action.value, isDirty: action.value !== value };
      case 'UPDATE_PREVIEW':
        if (!prev.isDirty) return prev;
        return { ...prev, previewValue: prev.localValue, isDirty: false };
      default:
        return prev;
    }
  }, { localValue: value, previewValue: value, isDirty: false });

  const { localValue, previewValue, isDirty } = state;
  
  // Update local value when the prop changes (e.g., when resetting the form)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      dispatch({ type: 'SET_VALUES', value });
      prevValueRef.current = value;
    }
  }, [value]);
  
  // Debounced update to parent
  const debouncedOnChange = useMemo(
    () => debounce((val: string) => {
      onChange(val);
    }, 500), // 500ms debounce delay
    [onChange]
  );

  // Handle editor changes with debounce
  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    
    // Update local state immediately for responsive UI
    dispatch({ type: 'UPDATE_LOCAL', value: newValue });
    
    // Debounce the parent update
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);
  
  // Update preview and notify parent
  const handleUpdatePreview = useCallback(() => {
    if (isDirty) {
      dispatch({ type: 'UPDATE_PREVIEW' });
      onChange(localValue);
    }
  }, [isDirty, localValue, onChange]);
  
  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);
  
  // Handle editor mount
  const handleEditorKeyDown = useCallback((e: any, editor: any = editorRef.current) => {
    if (e.keyCode === 9) { // Tab key
      e.preventDefault();
      
      if (editor) {
        const selection = editor.getSelection();
        if (!selection) return;
        
        // Handle multi-line selection
        if (selection.startLineNumber !== selection.endLineNumber) {
          const model = editor.getModel();
          if (!model) return;
          
          const startLine = selection.startLineNumber;
          const endLine = selection.endLineNumber;
          const edits: any[] = [];
          
          // Add two spaces at the start of each selected line
          for (let i = startLine; i <= endLine; i++) {
            edits.push({
              range: {
                startLineNumber: i,
                startColumn: 1,
                endLineNumber: i,
                endColumn: 1
              },
              text: '  ',
              forceMoveMarkers: false
            });
          }
          
          editor.executeEdits('indent-lines', edits);
          
          // Update local value
          const newValue = editor.getValue();
          dispatch({ type: 'UPDATE_LOCAL', value: newValue });
        } else {
          // Insert two spaces at cursor position
          editor.executeEdits('insert-tab', [{
            range: selection,
            text: '  ',
            forceMoveMarkers: true
          }]);
          
          // Update local value
          const newValue = editor.getValue();
          dispatch({ type: 'UPDATE_LOCAL', value: newValue });
        }
      }
    } else if (e.keyCode === 13 && !e.shiftKey) { // Enter key without shift
      e.preventDefault();
      
      if (editor) {
        const selection = editor.getSelection();
        if (!selection) return;
        
        const model = editor.getModel();
        if (!model) return;
        
        // Get current line's leading whitespace
        const lineContent = model.getLineContent(selection.startLineNumber);
        const leadingSpaces = lineContent.match(/^\s*/)?.[0] || '';
        
        // Insert new line with the same indentation
        editor.executeEdits('new-line', [{
          range: selection,
          text: `\n${leadingSpaces}`,
          forceMoveMarkers: true
        }]);
        
        // Update local value
        const newValue = editor.getValue();
        dispatch({ type: 'UPDATE_LOCAL', value: newValue });
      }
    }
  }, []);

  // Update toolbar position based on selection
  const updateToolbarPosition = useCallback((editor: any) => {
    if (!editor || !toolbarRef.current) return;
    
    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) {
      setShowFloatingToolbar(false);
      return;
    }
    
    // Get the editor's DOM node and its position
    const editorElement = editor.getDomNode();
    const editorRect = editorElement.getBoundingClientRect();
    
    // Get the pixel position of the end of the selection
    const position = {
      lineNumber: selection.endLineNumber,
      column: selection.endColumn
    };
    
    // Get the top position of the line in the editor's coordinate system
    const topInEditor = editor.getTopForPosition(position.lineNumber, position.column);
    const leftInEditor = editor.getOffsetForColumn(position.lineNumber, position.column);
    
    // Convert to viewport coordinates
    const viewportPosition = {
      top: editorRect.top + topInEditor - 60, // Position 50px above the line (increased from 40px)
      left: editorRect.left + leftInEditor
    };
    
    // Ensure the toolbar stays within the viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const toolbarHeight = 40; // Approximate height of the toolbar
    const toolbarWidth = 280; // Approximate width of the toolbar
    
    // Calculate final position with boundary checks
    setToolbarPosition({
      top: Math.max(10, viewportPosition.top), // Don't go above the viewport
      left: Math.max(
        10, // Minimum left margin
        Math.min(
          viewportPosition.left - (toolbarWidth / 2), // Center the toolbar on cursor
          viewportWidth - toolbarWidth - 10 // Don't go off the right edge
        )
      )
    });
    
    setShowFloatingToolbar(true);
  }, []);
  
  // Debounce the toolbar position updates
  const debouncedUpdateToolbar = useMemo(
    () => debounce(updateToolbarPosition, 100),
    [updateToolbarPosition]
  );

    const { theme, resolvedTheme } = useTheme();
  
  // Update Monaco theme when system/theme changes
  useEffect(() => {
    if (editorRef.current) {
      const currentTheme = resolvedTheme || 'light';
      editorRef.current.updateOptions({
        theme: currentTheme === 'dark' ? 'custom-dark' : 'custom-light'
      });
    }
  }, [resolvedTheme]);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition(() => {
      debouncedUpdateToolbar(editor);
    });
    
    // Listen for selection changes
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        debouncedUpdateToolbar(editor);
      } else {
        setShowFloatingToolbar(false);
      }
    });
    
      // Define a custom dark theme that matches the application
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'D4D4D4', background: '0F172A' },
        { token: 'comment', foreground: '6B7280' },
        { token: 'string', foreground: 'A5D6A7' },
        { token: 'keyword', foreground: 'C792EA' },
        { token: 'number', foreground: 'F78C6C' },
        { token: 'delimiter.bracket', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'identifier', foreground: 'D4D4D4' },
        { token: 'type', foreground: '82AAFF' },
        { token: 'tag', foreground: 'F78C6C' },
        { token: 'attribute.name', foreground: 'C792EA' },
        { token: 'attribute.value', foreground: 'A5D6A7' },
      ],
      colors: {
        'editor.background': '#0F172A',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#042f2e',
        'editor.lineHighlightBorder': '#134e5c',
        'editor.selectionBackground': '#134e4a',
        'editor.inactiveSelectionBackground': '#1E293B',
        'editorCursor.foreground': '#14b8a6',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#9CA3AF',
        'editor.selectionHighlightBorder': '#334155',
      },
    });

    // Define a custom light theme
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', foreground: '1F2937', background: 'F9FAFB' },
        { token: 'comment', foreground: '6B7280' },
        { token: 'string', foreground: '059669' }, // green-600
        { token: 'keyword', foreground: '7C3AED' }, // violet-600
        { token: 'number', foreground: 'D97706' }, // amber-600
        { token: 'delimiter.bracket', foreground: '1F2937' },
        { token: 'delimiter', foreground: '1F2937' },
        { token: 'identifier', foreground: '1F2937' },
        { token: 'type', foreground: '2563EB' }, // blue-600
        { token: 'tag', foreground: 'D97706' }, // amber-600
        { token: 'attribute.name', foreground: '7C3AED' }, // violet-600
        { token: 'attribute.value', foreground: '059669' }, // green-600
      ],
      colors: {
        'editor.background': '#F9FAFB',
        'editor.foreground': '#1F2937',
        'editor.lineHighlightBackground': '#F168F6',
        'editor.lineHighlightBorder': '#E5E7EB',
        'editor.selectionBackground': '#DBEAFE',
        'editor.inactiveSelectionBackground': '#EFF6FF',
        'editorCursor.foreground': '#3B82F6',
        'editorLineNumber.foreground': '#9CA3AF',
        'editorLineNumber.activeForeground': '#4B5563',
        'editor.selectionHighlightBorder': '#BFDBFE',
      },
    });
    
    // Get the current theme
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    // Apply the appropriate theme
    monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
    
    // Add keydown listener to the editor
    const keydownListener = editor.onKeyDown((e: any) => {
      handleEditorKeyDown(e, editor);
    });
    
    // Hide toolbar when clicking outside the editor
    const handleClickOutside = (event: MouseEvent) => {
      const editorElement = editor.getDomNode();
      if (editorElement && !editorElement.contains(event.target as Node) && 
          toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowFloatingToolbar(false);
      }
    };
    
    // Add click outside listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function to remove the listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      keydownListener?.dispose();
      debouncedUpdateToolbar.cancel();
    };
  }, [handleEditorKeyDown]);
  

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);

  const insertText = useCallback((text: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (selection) {
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      
      // Get the current line content
      const currentLine = editor.getModel().getLineContent(selection.startLineNumber);
      const beforeCursor = currentLine.substring(0, selection.startColumn - 1);
      const afterCursor = currentLine.substring(selection.endColumn - 1);
      
      // Insert the text at the cursor position
      editor.executeEdits('insert-text', [
        {
          range,
          text,
          forceMoveMarkers: true
        }
      ]);
      
      // Focus the editor
      editor.focus();
      
      // Update local value
      const newValue = editor.getValue();
      dispatch({ type: 'UPDATE_LOCAL', value: newValue });
    }
  }, [editorRef]);

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
    if (editorRef.current) {
      editorRef.current.focus();
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

  const handleFormatAction = useCallback((action: string) => {
    if (action === 'table') {
      setIsTableDialogOpen(true);
      return;
    }
    
    if (action === 'link') {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        const text = selection ? editorRef.current.getModel()?.getValueInRange(selection) : '';
        setLinkText(text || '');
        setLinkUrl('');
      }
      setShowLinkDialog(true);
      return;
    }

    if (!editorRef.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (!selection) return;

    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn,
    };

    const text = editor.getModel()?.getValueInRange(range) || '';

    switch (action) {
      case 'bold':
        editor.executeEdits('format-bold', [{
          range,
          text: text ? `**${text}**` : '****',
          forceMoveMarkers: true
        }]);
        break;
      case 'italic':
        editor.executeEdits('format-italic', [{
          range,
          text: text ? `*${text}*` : '**',
          forceMoveMarkers: true
        }]);
        break;
      case 'heading1':
        editor.executeEdits('format-heading1', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          },
          text: '# ',
          forceMoveMarkers: true
        }]);
        break;
      case 'heading2':
        editor.executeEdits('format-heading2', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          },
          text: '## ',
          forceMoveMarkers: true
        }]);
        break;
      case 'code':
        editor.executeEdits('format-code', [{
          range,
          text: text ? `\`${text}\`` : '``',
          forceMoveMarkers: true
        }]);
        break;
      case 'codeBlock':
        editor.executeEdits('format-code-block', [{
          range,
          text: text ? `\`\`\`\n${text}\n\`\`\`` : '```\n\n```',
          forceMoveMarkers: true
        }]);
        break;
      case 'quote':
        editor.executeEdits('format-quote', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          },
          text: '> ',
          forceMoveMarkers: true
        }]);
        break;
      case 'hr':
        editor.executeEdits('format-hr', [{
          range,
          text: '\n---\n',
          forceMoveMarkers: true
        }]);
        break;
      case 'ul':
      case 'ol':
      case 'task':
        const prefix = action === 'ul' ? '- ' : action === 'ol' ? '1. ' : '- [ ] ';
        editor.executeEdits('format-list', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          },
          text: prefix,
          forceMoveMarkers: true
        }]);
        break;
    }
  }, []);

  // Floating toolbar component
  // Format button component for consistency
  const FormatButton = ({ 
    action, 
    icon, 
    title, 
    shortcut = '',
    type = 'button' 
  }: { 
    action: string; 
    icon: React.ReactNode; 
    title: string; 
    shortcut?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFormatAction(action);
      }}
      onMouseDown={(e) => {
        // Prevent focus from being taken away from the editor
        e.preventDefault();
      }}
      className="p-1.5 rounded hover:bg-accent text-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
    >
      {icon}
    </button>
  );

  // SVG Icons for better consistency
  const Icons = {
    Bold: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      </svg>
    ),
    Italic: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="4" x2="10" y2="4"></line>
        <line x1="14" y1="20" x2="5" y2="20"></line>
        <line x1="15" y1="4" x2="9" y2="20"></line>
      </svg>
    ),
    Heading1: () => <span className="font-bold text-sm">H1</span>,
    Heading2: () => <span className="font-bold text-xs">H2</span>,
    Heading3: () => <span className="font-bold text-xs opacity-80">H3</span>,
    Heading4: () => <span className="font-bold text-xs opacity-60">H4</span>,
    Code: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    Link: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    ),
    Image: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    ),
    List: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    ),
    ListOrdered: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="6" x2="21" y2="6"></line>
        <line x1="10" y1="12" x2="21" y2="12"></line>
        <line x1="10" y1="18" x2="21" y2="18"></line>
        <path d="M4 6h1v4"></path>
        <path d="M4 10h2"></path>
        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
      </svg>
    ),
    Quote: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    HorizontalRule: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    Task: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    ),
    Table: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="12" y1="3" x2="12" y2="21"></line>
      </svg>
    )
  };

  const FloatingToolbar = useMemo(() => (
    <div 
      ref={toolbarRef}
      className={`fixed z-[9999] bg-background/95 border border-border/50 rounded-md shadow-lg p-1.5 flex items-center space-x-1.5 transition-all duration-200 ${
        showFloatingToolbar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      style={{
        top: `${toolbarPosition.top}px`,
        left: `${toolbarPosition.left}px`,
        transform: 'translateZ(0) translateY(0)',
        willChange: 'transform, opacity',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Prevent focus from being taken away from the editor
        e.preventDefault();
      }}
    >
      {/* Text Formatting */}
      <FormatButton type="button" action="bold" icon={<Icons.Bold />} title="Bold" shortcut="Ctrl+B" />
      <FormatButton type="button" action="italic" icon={<Icons.Italic />} title="Italic" shortcut="Ctrl+I" />
      
      <div className="h-5 w-px bg-border/50 mx-0.5"></div>
      
      {/* Headings */}
      <FormatButton type="button" action="heading1" icon={<Icons.Heading1 />} title="Heading 1" />
      <FormatButton type="button" action="heading2" icon={<Icons.Heading2 />} title="Heading 2" />
      <FormatButton type="button" action="heading3" icon={<Icons.Heading3 />} title="Heading 3" />
      <FormatButton type="button" action="heading4" icon={<Icons.Heading4 />} title="Heading 4" />
      
      <div className="h-5 w-px bg-border/50 mx-0.5"></div>
      
      {/* Lists */}
      <FormatButton type="button" action="ul" icon={<Icons.List />} title="Bullet List" />
      <FormatButton type="button" action="ol" icon={<Icons.ListOrdered />} title="Numbered List" />
      <FormatButton type="button" action="task" icon={<Icons.Task />} title="Task List" />
      
      <div className="h-5 w-px bg-border/50 mx-0.5"></div>
      
      {/* Code & Blocks */}
      <FormatButton type="button" action="code" icon={<Icons.Code />} title="Inline Code" shortcut="`" />
      <FormatButton type="button" action="codeBlock" icon={<Icons.Code />} title="Code Block" shortcut="```" />
      <FormatButton type="button" action="quote" icon={<Icons.Quote />} title="Blockquote" shortcut=">" />
      <FormatButton type="button" action="hr" icon={<Icons.HorizontalRule />} title="Horizontal Rule" />
      
      <div className="h-5 w-px bg-border/50 mx-0.5"></div>
      
      {/* Media & Tables */}
      <FormatButton type="button" action="link" icon={<Icons.Link />} title="Insert Link" shortcut="Ctrl+K" />
      <FormatButton type="button" action="image" icon={<Icons.Image />} title="Insert Image" />
      <FormatButton type="button" action="table" icon={<Icons.Table />} title="Insert Table" />
    </div>
  ), [showFloatingToolbar, toolbarPosition, handleFormatAction]);

  return (
    <div className={cn('w-full space-y-2 relative isolate', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      
      <Tabs 
        defaultValue="edit" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {activeTab === 'edit' && isEditorReady && (
            <EditorToolbar 
              onFormatAction={handleFormatAction} 
              onImageUpload={handleImageUpload}
              onAddLink={handleAddLink}
            />
          )}
          
          {activeTab === 'preview' && isDirty && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleUpdatePreview}
              disabled={!isDirty}
            >
              Update Preview
            </Button>
          )}
        </div>
        
        <TabsContent value="edit" className="mt-0">
          <div 
            className="border rounded-md overflow-hidden"
            style={{ minHeight: `${minHeight}px` }}
          >
            <div className="relative">
              <MonacoEditor
                height={`${minHeight}px`}
                language="markdown"
                theme="custom-dark"
                value={localValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'off',
                  glyphMargin: false,
                  folding: false,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 0,
                  renderLineHighlight: 'none',
                  scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden',
                  },
                }}
              />
              {FloatingToolbar}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div 
            className="prose dark:prose-invert max-w-none p-4 border rounded-md min-h-[200px]"
            style={{ minHeight: `${minHeight}px` }}
          >
            <LazyMarkdownViewer content={previewValue} />
          </div>
        </TabsContent>
      </Tabs>
      
      {isUploading && (
        <div className="text-sm text-muted-foreground">Uploading image...</div>
      )}
      
      {uploadError && (
        <div className="text-sm text-destructive">{uploadError}</div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
      )}
      
      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
            <DialogDescription>
              Configure your table dimensions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rows" className="text-right">
                Rows
              </Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="columns" className="text-right">
                Columns
              </Label>
              <Input
                id="columns"
                type="number"
                min="1"
                max="10"
                value={tableColumns}
                onChange={(e) => setTableColumns(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="col-span-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsTableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!editorRef.current) return;
                
                let table = '\n';
                
                // Header row
                table += '| ' + Array(tableColumns).fill('Header').join(' | ') + ' |\n';
                
                // Divider row
                table += '|' + Array(tableColumns).fill('---').join('|') + '|\n';
                
                // Data rows
                for (let i = 0; i < tableRows; i++) {
                  table += '| ' + Array(tableColumns).fill('Data').join(' | ') + ' |\n';
                }
                
                const editor = editorRef.current;
                const selection = editor.getSelection();
                const range = {
                  startLineNumber: selection?.startLineNumber || 1,
                  startColumn: selection?.startColumn || 1,
                  endLineNumber: selection?.endLineNumber || selection?.startLineNumber || 1,
                  endColumn: selection?.endColumn || selection?.startColumn || 1
                };
                
                editor.executeEdits('insert-table', [{
                  range,
                  text: table,
                  forceMoveMarkers: true
                }]);
                
                setIsTableDialogOpen(false);
              }}
            >
              Insert Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const MarkdownEditor = React.memo(MarkdownEditorComponent);
MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
