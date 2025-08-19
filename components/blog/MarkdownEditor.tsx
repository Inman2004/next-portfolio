'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Heading5, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image, 
  Table, 
  Undo, 
  Redo, 
  Maximize2, 
  Minimize2, 
  Download,
  Type,
  Minus,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import TurndownService from 'turndown';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
  strongDelimiter: '**',
  hr: '---',
  listIndentation: 'one',
  fence: '```',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full'
});

// Configure marked for MD -> HTML formatting
marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true
});

// Convert task list items (checkboxes) to Markdown
// - <li class="task-list-item"><input type="checkbox" checked/> Label</li>
// -> "- [x] Label" (or "- [ ] Label")
turndownService.addRule('taskListItem', {
  filter: (node) => {
    try {
      const el = node as any;
      if (!el || el.nodeName !== 'LI') return false;
      if (el.classList && el.classList.contains('task-list-item')) return true;
      return !!(el.querySelector && el.querySelector('input[type="checkbox"]'));
    } catch {
      return false;
    }
  },
  replacement: (content, node) => {
    try {
      const el = node as any;
      const checkbox: HTMLInputElement | null = el.querySelector?.('input[type="checkbox"]') ?? null;
      const checked = checkbox?.checked ?? false;
      const text = String(content || '')
        .replace(/\n+/g, ' ')
        .replace(/^\s+|\s+$/g, '');
      return `${checked ? '- [x] ' : '- [ ] '}${text}\n`;
    } catch {
      return `- [ ] ${content}\n`;
    }
  }
});

interface MarkdownEditorProps {
  initialMarkdown?: string;
  height?: number | string;
  onChange?: (markdown: string) => void;
  className?: string;
}

interface HistoryState {
  html: string;
  selection: { start: number; end: number } | null;
}

/**
 * Markdown Editor Component
 * 
 * This component provides a contentEditable-based editor that directly maintains
 * HTML content and converts to Markdown only when needed for output.
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialMarkdown = '',
  height = 600,
  onChange,
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  
  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ html: '', selection: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Convert markdown to HTML for display
  const convertMarkdownToHtml = useCallback((markdown: string): string => {
    try {
      const rawHtml = marked.parse(markdown);
      const cleanHtml = DOMPurify.sanitize(String(rawHtml), {
        ALLOWED_TAGS: [
          'h1','h2','h3','h4','h5','h6',
          'p','br','strong','b','em','i','s','del',
          'ul','ol','li','blockquote','code','pre',
          'a','img','table','thead','tbody','tr','th','td',
          'hr','div','span','input'
        ],
        ALLOWED_ATTR: ['href','src','alt','title','class','type','checked','disabled']
      });
      return cleanHtml;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      return markdown;
    }
  }, []);

  // Initialize editor with initial content
  useEffect(() => {
    if (editorRef.current && initialMarkdown) {
      // Convert initial markdown to HTML and set it
      try {
        const html = convertMarkdownToHtml(initialMarkdown);
        editorRef.current.innerHTML = html;
        
                // Set initial history
        setHistory([{ html, selection: null }]);
        setHistoryIndex(0);
        
        // Move cursor to end
        setTimeout(() => {
          if (editorRef.current) {
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              editorRef.current.focus();
            }
          }
        }, 0);
      } catch (error) {
        console.error('Error initializing editor:', error);
        // Fallback to plain text
        editorRef.current.textContent = initialMarkdown;
      }
    }
  }, [initialMarkdown, convertMarkdownToHtml]);

  // Convert current HTML content to markdown
  const convertHtmlToMarkdown = useCallback((): string => {
    if (!editorRef.current) return '';
    
    try {
      const html = editorRef.current.innerHTML;
      const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'b', 'em', 'i', 's', 'del',
          'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
          'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'hr', 'div', 'span', 'input'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'type', 'checked', 'disabled']
      });
      
      return turndownService.turndown(cleanHtml);
    } catch (error) {
      console.error('Error converting HTML to markdown:', error);
      return editorRef.current.textContent || '';
    }
  }, []);
  
  // Save current selection
  const saveSelection = useCallback((): { start: number; end: number } | null => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length
    };
  }, []);

  // Restore selection
  const restoreSelection = useCallback((selection: { start: number; end: number }) => {
    if (!editorRef.current) return;
    
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;
    
    let charIndex = 0;
    let foundStart = false;
    let foundEnd = false;
    
    function traverse(node: Node) {
      if (foundStart && foundEnd) return;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + node.textContent!.length;
        
        if (!foundStart && selection.start >= charIndex && selection.start <= nextCharIndex) {
          range.setStart(node, Math.min(selection.start - charIndex, node.textContent!.length));
          foundStart = true;
        }
        
        if (!foundEnd && selection.end >= charIndex && selection.end <= nextCharIndex) {
          range.setEnd(node, Math.min(selection.end - charIndex, node.textContent!.length));
          foundEnd = true;
        }
        
        charIndex = nextCharIndex;
        } else {
        for (const child of Array.from(node.childNodes)) {
          traverse(child);
        }
      }
    }
    
    traverse(editorRef.current);
    
    if (foundStart && foundEnd) {
      sel.removeAllRanges();
      sel.addRange(range);
      editorRef.current.focus();
    }
  }, []);

  // Add to history
  const addToHistory = useCallback((html: string, selection: { start: number; end: number } | null) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ html, selection });
    
    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Notify parent component
    if (onChange) {
      const markdown = convertHtmlToMarkdown();
      onChange(markdown);
    }
  }, [history, historyIndex, onChange, convertHtmlToMarkdown]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isUndoRedo) return;
    
    const html = editorRef.current.innerHTML;
    const selection = saveSelection();
    
    // Add to history
    addToHistory(html, selection);
  }, [isUndoRedo, saveSelection, addToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      
      if (editorRef.current && prevState) {
        editorRef.current.innerHTML = prevState.html;
        setHistoryIndex(newIndex);
        
        if (prevState.selection) {
          setTimeout(() => {
            restoreSelection(prevState.selection!);
            setIsUndoRedo(false);
          }, 0);
        } else {
          setIsUndoRedo(false);
        }
      }
    }
  }, [history, historyIndex, restoreSelection]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      if (editorRef.current && nextState) {
        editorRef.current.innerHTML = nextState.html;
        setHistoryIndex(newIndex);
        
        if (nextState.selection) {
          setTimeout(() => {
            restoreSelection(nextState.selection!);
            setIsUndoRedo(false);
          }, 0);
      } else {
          setIsUndoRedo(false);
        }
      }
    }
  }, [history, historyIndex, restoreSelection]);

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');
    
    if (html) {
      // Clean HTML and insert (preserve checkboxes)
      const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1','h2','h3','h4','h5','h6',
          'p','br','strong','b','em','i','s','del',
          'ul','ol','li','blockquote','code','pre',
          'a','img','table','thead','tbody','tr','th','td',
          'hr','div','span','input'
        ],
        ALLOWED_ATTR: ['href','src','alt','title','class','type','checked','disabled']
      });
      document.execCommand('insertHTML', false, cleanHtml);
    } else if (text) {
      // Check if it's markdown and format it
      if (text.includes('**') || text.includes('*') || text.includes('#') || 
          text.includes('- ') || text.includes('1. ') || text.includes('> ') ||
          text.includes('`') || text.includes('[') || text.includes('![') ||
          text.includes('|') || text.includes('---') || text.includes('~~')) {
        
        // Convert markdown to HTML and insert
        const formattedHtml = convertMarkdownToHtml(text);
        document.execCommand('insertHTML', false, formattedHtml);
      } else {
        // Plain text
        document.execCommand('insertText', false, text);
      }
    }
    
    // Trigger content change
    setTimeout(handleContentChange, 0);
  }, [convertMarkdownToHtml, handleContentChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent Backspace navigating away when editor is empty
    if (e.key === 'Backspace') {
      const editor = editorRef.current;
      if (editor) {
        const text = editor.textContent || '';
        if (text.length === 0) {
          e.preventDefault();
          return;
        }
      }
    }

    // Prevent browser history navigation via Alt+Arrow while editing
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      return;
    }

    // Undo/Redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }
    
    // Bold/Italic shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false);
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false);
      return;
    }
    
    // Auto-formatting on space/enter (reduced)
    if (e.key === ' ' || e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent || '';
          const cursorPos = range.startOffset;
          
          if (e.key === ' ' && cursorPos > 0) {
            const beforeCursor = text.substring(0, cursorPos);
            // Only trigger at plain markers at start-of-line
            if (!/^\s*([#]{1,5}|[-*>])$/.test(beforeCursor)) {
              return;
            }
            
            // Headings (#..##### + space)
            if (beforeCursor.match(/^#{1,6}$/)) {
              e.preventDefault();
              const level = beforeCursor.length;
              if (level <= 5) {
                document.execCommand('formatBlock', false, `<h${level}>`);
                document.execCommand('insertText', false, ' ');
                return;
              }
            }
          }
          
          if (e.key === 'Enter') {
            const beforeCursor = text.substring(0, cursorPos);
            // Lists only if line is just the marker
            if (beforeCursor.match(/^[-*]\s*$/)) {
              e.preventDefault();
              document.execCommand('insertUnorderedList', false);
              return;
            }
            
            if (beforeCursor.match(/^\d+\.\s*$/)) {
              e.preventDefault();
              document.execCommand('insertOrderedList', false);
              return;
            }
            
            // Checkbox
            if (beforeCursor.match(/^- \[ \]\s*$/)) {
              e.preventDefault();
              const checkboxHtml = '<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" /> ';
              document.execCommand('insertHTML', false, checkboxHtml);
              return;
            }
            
            // Blockquote
            if (beforeCursor.match(/^>\s*$/)) {
              e.preventDefault();
              document.execCommand('formatBlock', false, '<blockquote>');
              document.execCommand('insertText', false, ' ');
              return;
            }
          }
        }
      }
    }
  }, [undo, redo]);

  // Download markdown file
  const downloadMarkdown = useCallback(() => {
    const markdown = convertHtmlToMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [convertHtmlToMarkdown]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Toolbar action handlers
  const handleToolbarAction = useCallback((action: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();

    const getCurrentBlockTag = (): string | null => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      let node: Node | null = sel.getRangeAt(0).startContainer;
      if (!node) return null;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      while (node && node instanceof HTMLElement && node !== editorRef.current) {
        const tag = (node as HTMLElement).tagName;
        if (/^(H1|H2|H3|H4|H5|H6|P|BLOCKQUOTE|LI|DIV)$/.test(tag)) return tag;
        node = (node as HTMLElement).parentElement;
      }
      return null;
    };

    switch (action) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'strikethrough':
        document.execCommand('strikethrough', false);
        break;
      case 'heading1': {
        const current = getCurrentBlockTag();
        document.execCommand('formatBlock', false, current === 'H1' ? 'P' : 'H1');
        break;
      }
      case 'heading2': {
        const current = getCurrentBlockTag();
        document.execCommand('formatBlock', false, current === 'H2' ? 'P' : 'H2');
        break;
      }
      case 'heading3': {
        const current = getCurrentBlockTag();
        document.execCommand('formatBlock', false, current === 'H3' ? 'P' : 'H3');
        break;
      }
      case 'heading4': {
        const current = getCurrentBlockTag();
        document.execCommand('formatBlock', false, current === 'H4' ? 'P' : 'H4');
        break;
      }
      case 'heading5': {
        const current = getCurrentBlockTag();
        document.execCommand('formatBlock', false, current === 'H5' ? 'P' : 'H5');
        break;
      }
      case 'unorderedList':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList', false);
        break;
      case 'checkbox': {
        const checkboxHtml = '<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" /> ';
        document.execCommand('insertHTML', false, checkboxHtml);
        break;
      }
      case 'quote':
        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
        break;
      case 'code':
        document.execCommand('insertText', false, '`code`');
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, 'P');
        break;
      case 'hr': {
        const hrElement = document.createElement('hr');
        hrElement.className = 'border-t border-border my-6';
        
        const hrSelection = window.getSelection();
        if (hrSelection && hrSelection.rangeCount > 0) {
          const hrRange = hrSelection.getRangeAt(0);
          hrRange.deleteContents();
          hrRange.insertNode(hrElement);
          const br = document.createElement('br');
          hrRange.setStartAfter(hrElement);
          hrRange.insertNode(br);
          hrRange.setStartAfter(br);
          hrRange.collapse(true);
          hrSelection.removeAllRanges();
          hrSelection.addRange(hrRange);
        }
        break;
      }
      case 'link':
        setShowLinkDialog(true);
        return;
      case 'image':
        setShowImageDialog(true);
        return;
      case 'table':
        setShowTableDialog(true);
        return;
      case 'undo':
        undo();
        return;
      case 'redo':
        redo();
        return;
      case 'download':
        downloadMarkdown();
        return;
      case 'fullscreen':
        toggleFullscreen();
        return;
    }

    // Push change into history after action
    setTimeout(() => {
      try { handleContentChange(); } catch {}
    }, 0);
  }, [undo, redo, downloadMarkdown, toggleFullscreen, handleContentChange]);

  // Insert link
  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    
    const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
    const linkHtml = convertMarkdownToHtml(linkMarkdown);
    document.execCommand('insertHTML', false, linkHtml);
    
    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
    
    setTimeout(handleContentChange, 0);
  }, [linkUrl, linkText, convertMarkdownToHtml, handleContentChange]);

  // Insert image
  const insertImage = useCallback(() => {
    if (!imageUrl) return;
    
    const imageMarkdown = `![${imageAlt || 'image'}](${imageUrl})`;
    const imageHtml = convertMarkdownToHtml(imageMarkdown);
    document.execCommand('insertHTML', false, imageHtml);
    
    setImageUrl('');
    setImageAlt('');
    setShowImageDialog(false);
    
    setTimeout(handleContentChange, 0);
  }, [imageUrl, imageAlt, convertMarkdownToHtml, handleContentChange]);

  // Insert table
  const insertTable = useCallback(() => {
    let table = '\n';
    
    // Header row
    table += '| ' + Array(tableColumns).fill('Header').join(' | ') + ' |\n';
    
    // Divider row
    table += '|' + Array(tableColumns).fill('---').join('|') + '|\n';
    
    // Data rows
    for (let i = 0; i < tableRows; i++) {
      table += '| ' + Array(tableColumns).fill('Data').join(' | ') + ' |\n';
    }
    
    const tableHtml = convertMarkdownToHtml(table);
    document.execCommand('insertHTML', false, tableHtml);
    
    setShowTableDialog(false);
    setTimeout(handleContentChange, 0);
  }, [tableRows, tableColumns, convertMarkdownToHtml, handleContentChange]);

  // Handle content changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const handleInput = () => {
      setTimeout(handleContentChange, 100);
    };
    
    const handleBlur = () => handleContentChange();
    
    // Handle checkbox clicks
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('task-list-item-checkbox')) {
        e.preventDefault();
        const checkbox = target as HTMLInputElement;
        checkbox.checked = !checkbox.checked;
        // Trigger content change after checkbox toggle
        setTimeout(handleContentChange, 0);
      }
    };
    
    editor.addEventListener('input', handleInput);
    editor.addEventListener('blur', handleBlur);
    editor.addEventListener('click', handleClick);
    
    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('blur', handleBlur);
      editor.removeEventListener('click', handleClick);
    };
  }, [handleContentChange]);

  // Toolbar button component
  const ToolbarButton = ({ 
    action, 
    icon: Icon, 
    title, 
    shortcut = '',
    disabled = false 
  }: { 
    action: string; 
    icon: React.ComponentType<{ size?: number }>; 
    title: string; 
    shortcut?: string;
    disabled?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => handleToolbarAction(action)}
      disabled={disabled}
      className="h-8 w-8 p-0 hover:bg-accent"
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon size={16} />
    </Button>
  );

  return (
    <>
      {/* Custom CSS for MarkdownViewer-style formatting */}
      <style jsx>{`
        .prose h1 {
          background: linear-gradient(to right, #0369a1, #0ea5e9, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose h1::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, #14b8a6, #84cc16);
          transition: width 0.3s ease;
        }
        .prose h1:hover::after {
          width: 100%;
        }
        .prose h2::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #0ea5e9;
          border-radius: 9999px;
        }
        .prose h2 {
          background: linear-gradient(to right, #0369a1, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose h3::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-33%);
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          background: rgba(56, 189, 248, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .prose h3::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 50%;
          transform: translateY(-33%);
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #2563eb;
        }
        .prose h3 {
          background: linear-gradient(to right, #0369a1, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose h4::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #6b7280;
        }
        .prose h4 {
          background: linear-gradient(to right, #374151, #4b5563);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose h5 {
          background: linear-gradient(to right, #0369a1, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose .task-list-item-checkbox {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E") no-repeat center;
        }
        .prose .task-list-item-checkbox:checked {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }
        .prose .task-list-item-checkbox:not(:checked) {
          background-color: #ffffff;
          border-color: #d1d5db;
        }
        .dark .prose .task-list-item-checkbox:not(:checked) {
          background-color: #1f2937;
          border-color: #4b5563;
        }
      `}</style>
      <div className={cn(
        'border rounded-lg shadow-sm bg-background',
        isFullscreen ? 'fixed inset-0 z-50 m-4' : '',
        className
      )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center space-x-1">
      {/* Text Formatting */}
          <ToolbarButton action="bold" icon={Bold} title="Bold" shortcut="Ctrl+B" />
          <ToolbarButton action="italic" icon={Italic} title="Italic" shortcut="Ctrl+I" />
          <ToolbarButton action="strikethrough" icon={Strikethrough} title="Strikethrough" />
      
          <div className="w-px h-6 bg-border mx-2" />
      
      {/* Headings */}
          <ToolbarButton action="heading1" icon={Heading1} title="Heading 1" />
          <ToolbarButton action="heading2" icon={Heading2} title="Heading 2" />
          <ToolbarButton action="heading3" icon={Heading3} title="Heading 3" />
          <ToolbarButton action="heading4" icon={Heading4} title="Heading 4" />
          <ToolbarButton action="heading5" icon={Heading5} title="Heading 5" />
          
          <div className="w-px h-6 bg-border mx-2" />
      
      {/* Lists */}
          <ToolbarButton action="unorderedList" icon={List} title="Bullet List" />
          <ToolbarButton action="orderedList" icon={ListOrdered} title="Numbered List" />
          <ToolbarButton action="checkbox" icon={CheckSquare} title="Checkbox" />
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Blocks */}
          <ToolbarButton action="quote" icon={Quote} title="Blockquote" />
          <ToolbarButton action="code" icon={Code} title="Inline Code" />
          <ToolbarButton action="paragraph" icon={Type} title="Paragraph" />
          <ToolbarButton action="hr" icon={Minus} title="Horizontal Rule" />
          
          <div className="w-px h-6 bg-border mx-2" />
      
      {/* Media & Tables */}
          <ToolbarButton action="link" icon={Link} title="Insert Link" />
          <ToolbarButton action="image" icon={Image} title="Insert Image" />
          <ToolbarButton action="table" icon={Table} title="Insert Table" />
    </div>
        
        <div className="flex items-center space-x-1">
          {/* History */}
          <ToolbarButton 
            action="undo" 
            icon={Undo} 
            title="Undo" 
            shortcut="Ctrl+Z"
            disabled={historyIndex <= 0}
          />
          <ToolbarButton 
            action="redo" 
            icon={Redo} 
            title="Redo" 
            shortcut="Ctrl+Y"
            disabled={historyIndex >= history.length - 1}
          />
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Actions */}
          <ToolbarButton action="download" icon={Download} title="Download Markdown" />
          <ToolbarButton action="fullscreen" icon={isFullscreen ? Minimize2 : Maximize2} title="Toggle Fullscreen" />
            </div>
          </div>

      {/* Editor */}
      <div 
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing your content here... Use the toolbar above to format your text."
        className={cn(
          'prose dark:prose-invert max-w-none p-4 outline-none min-h-[200px] relative',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'prose-headings:mt-6 prose-headings:mb-4',
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:my-1',
          'prose-blockquote:my-4 prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-primary',
          'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
          'prose-table:my-4 prose-table:w-full prose-table:border-collapse',
          'prose-th:border prose-th:border-border prose-th:p-2 prose-th:text-left',
          'prose-td:border prose-td:border-border prose-td:p-2',
          'prose-img:my-4 prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto',
          'prose-a:text-primary prose-a:underline prose-a:decoration-primary/50 hover:prose-a:decoration-primary',
          // Additional styles for better editing experience
          'prose-strong:font-bold prose-strong:text-foreground',
          'prose-em:italic prose-em:text-foreground',
          'prose-del:line-through prose-del:text-muted-foreground',
          'prose-code:font-mono prose-code:text-sm prose-code:bg-muted/50',
          'prose-pre:font-mono prose-code:text-sm prose-pre:bg-muted/50',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/20 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r',
          // Enhanced editing styles with MarkdownViewer formatting
          'prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mt-12 prose-h1:mb-8 prose-h1:relative prose-h1:group prose-h1:scroll-mt-24',
          'prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:relative prose-h2:pl-6 prose-h2:border-b prose-h2:border-teal-300 prose-h2:dark:border-teal-700/50 prose-h2:scroll-mt-16',
          'prose-h3:text-3xl prose-h3:md:text-2xl prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6 prose-h3:pt-2 prose-h3:relative prose-h3:pl-8 prose-h3:scroll-mt-20',
          'prose-h4:text-xl prose-h4:md:text-xl prose-h4:font-semibold prose-h4:mt-8 prose-h4:mb-3 prose-h4:pl-4 prose-h4:relative prose-h4:scroll-mt-16',
          'prose-h5:text-lg prose-h5:md:text-xl prose-h5:font-medium prose-h5:mt-6 prose-h5:mb-2 prose-h5:pl-2 prose-h5:relative prose-h5:text-sky-600 prose-h5:dark:text-gray-300 prose-h5:scroll-mt-16',
          'prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2',
          'prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2 prose-ol:[&>li]:relative prose-ol:[&>li]:pl-2 prose-ol:[&>li]:marker:font-semibold prose-ol:[&>li]:marker:text-sky-400 prose-ol:[&>li]:marker:dark:text-teal-300',
          'prose-li:relative prose-li:pl-2 prose-li:my-1 prose-li:text-gray-700 prose-li:dark:text-gray-300',
          'prose-hr:border-t prose-hr:border-border prose-hr:my-6',
          // Task list styling
          'prose-li.task-list-item:flex prose-li.task-list-item:items-start',
          'prose-input.task-list-item-checkbox:h-4 prose-input.task-list-item-checkbox:w-4 prose-input.task-list-item-checkbox:rounded prose-input.task-list-item-checkbox:border prose-input.task-list-item-checkbox:mr-2 prose-input.task-list-item-checkbox:mt-0.5 prose-input.task-list-item-checkbox:cursor-pointer prose-input.task-list-item-checkbox:transition-colors',
          // Custom HR styling
          'hr:border-t hr:border-border hr:my-6 hr:border-2'
        )}
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
          overflowY: 'auto'
        }}
      />

      {/* Placeholder */}
      {!editorRef.current?.textContent && (
        <div className="absolute top-16 left-4 text-muted-foreground pointer-events-none">
          Start typing your content here... Use the toolbar above to format your text.
        </div>
      )}
      
      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL and optional text for your link.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
              <div>
              <Label htmlFor="linkUrl">URL</Label>
                <Input
                id="linkUrl"
                  value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
              <div>
              <Label htmlFor="linkText">Text (optional)</Label>
                <Input
                id="linkText"
                  value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
              <Button onClick={insertLink}>
                  Insert Link
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Enter the URL and alt text for your image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              />
          </div>
            <div>
              <Label htmlFor="imageAlt">Alt Text (optional)</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              />
        </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={insertImage}>
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
            <DialogDescription>
              Choose the size of your table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tableRows">Rows</Label>
              <Input
                  id="tableRows"
                type="number"
                min="1"
                  max="10"
                value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
              />
            </div>
              <div>
                <Label htmlFor="tableColumns">Columns</Label>
              <Input
                  id="tableColumns"
                type="number"
                min="1"
                max="10"
                value={tableColumns}
                  onChange={(e) => setTableColumns(parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Cancel
            </Button>
              <Button onClick={insertTable}>
              Insert Table
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default MarkdownEditor;
