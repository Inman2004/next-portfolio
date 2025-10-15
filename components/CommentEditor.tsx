import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { mentionSuggestion } from '@/lib/mention-suggestion';
import { useEffect, useRef, useState } from 'react';
import { Smile, X } from 'lucide-react';
import dynamic from 'next/dynamic';
// Define theme type for emoji picker
type EmojiTheme = 'light' | 'dark' | 'auto';

const DynamicEmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

interface CommentEditorProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentEditor({
  initialContent = '',
  onSubmit,
  onCancel,
  isEditing = false,
  placeholder = 'Write a comment...',
  autoFocus = false,
}: CommentEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          ...mentionSuggestion,
          items: async ({ query }) => {
            // This would fetch users from your database
            // For now, returning a mock list
            const users = [
              { id: '1', label: 'John Doe', email: 'john@example.com' },
              { id: '2', label: 'Jane Smith', email: 'jane@example.com' },
            ];
            
            return users.filter(user => 
              user.label.toLowerCase().includes(query.toLowerCase()) ||
              user.email.toLowerCase().includes(query.toLowerCase())
            );
          },
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Handle content updates if needed
    },
  });

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus('end');
    }
  }, [editor, autoFocus]);

  const handleSubmit = () => {
    if (!editor) return;
    const content = editor.getHTML();
    if (content.trim() === '<p></p>') return;
    onSubmit(content);
    if (!isEditing) {
      editor.commands.clearContent();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const addEmoji = (emoji: string) => {
    if (!editor) return;
    editor.commands.insertContent(emoji);
    setShowEmojiPicker(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      <div 
        ref={editorRef}
        className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden"
      >
        <EditorContent 
          editor={editor} 
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${
                  editor.isActive('bold') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
                }`}
                title="Bold"
              >
                <span className="text-sm font-bold">B</span>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded mx-1 ${
                  editor.isActive('italic') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
                }`}
                title="Italic"
              >
                <span className="text-sm italic">I</span>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${
                  editor.isActive('bulletList') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
                }`}
                title="Bullet List"
              >
                <span className="text-sm">• List</span>
              </button>
            </div>
          </BubbleMenu>
        )}
        
        <div className="flex justify-between items-center p-2 border-t border-zinc-700 bg-zinc-800/50">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-yellow-400 hover:bg-zinc-700"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-10">
                <DynamicEmojiPicker
                  onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)}
                  autoFocusSearch={false}
                  width={300}
                  height={350}
                  previewConfig={{
                    showPreview: false,
                  }}
                  theme={'dark' as any} // Using any to bypass type checking
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
              disabled={!editor.getText().trim()}
            >
              {isEditing ? 'Update' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
