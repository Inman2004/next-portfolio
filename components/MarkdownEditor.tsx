'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

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
  minHeight = 400,
  label,
  error,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-lg border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full min-h-[400px] font-mono text-sm bg-transparent border-0',
            'text-gray-200 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500/50',
            'resize-none focus-visible:ring-offset-0',
            error ? 'ring-2 ring-red-500/50' : ''
          )}
          style={{ minHeight: `${minHeight}px` }}
        />
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/30 rounded-b-lg">
          <div className="text-xs text-gray-400">
            <span className="font-medium">Markdown supported:</span>{' '}
            <span className="opacity-80">**bold**, *italic*, `code`, ```code blocks```, [links](url), and more</span>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
