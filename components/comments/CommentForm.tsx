import { useState, useRef, useEffect, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { Smile, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { User } from './types';

// Dynamically import the emoji picker to avoid SSR issues
const DynamicEmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  currentUser: User | null;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  initialValue?: string;
}

export const CommentForm = ({
  onSubmit,
  isSubmitting,
  currentUser,
  className = '',
  placeholder = 'Add a comment...',
  autoFocus = false,
  onCancel,
  initialValue = ''
}: CommentFormProps) => {
  const [content, setContent] = useState(initialValue);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    try {
      await onSubmit(content.trim());
      setContent('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleEmojiClick = useCallback((emojiData: any) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + emoji + content.substring(end);
    
    setContent(newText);
    
    // Move cursor to after the inserted emoji
    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }
    }, 0);
  }, [content]);

  const formClasses = [
    'w-full min-h-[100px] p-4 pr-12 rounded-lg border',
    'bg-white/90 dark:bg-zinc-900/50 border-zinc-700/80 dark:border-emerald-300/50 backdrop-blur-sm',
    'text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400',
    'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent',
    'resize-none transition-all duration-200',
    'border-zinc-400/80 dark:border-zinc-700/50',
    'dark:focus:ring-emerald-500/50',
    'shadow-sm hover:shadow-md transition-shadow',
    'text-base leading-relaxed',
    'font-normal tracking-normal',
    'focus:bg-white dark:focus:bg-zinc-900/60'
  ].join(' ');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={formClasses}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            rows={3}
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="p-1.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
              aria-label="Add emoji"
              disabled={isSubmitting}
            >
              <Smile className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
              aria-label="Add image"
              disabled
            >
              <ImageIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <m.button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !content.trim() || isSubmitting
                ? 'bg-emerald-300 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </m.button>
        </div>
      </form>
      
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-10">
          <DynamicEmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            width={300}
            height={350}
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled
            searchDisabled={false}
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  );
};
