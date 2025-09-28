'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Code } from 'lucide-react';
import { useCallback } from 'react';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import UniqueId from '@tiptap/extension-unique-id';
import { SlashCommand } from './suggestion';
import { uploadToCloudinary } from '@/lib/cloudinary';
import toast from 'react-hot-toast';

const TiptapEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      SlashCommand,
      UniqueId.configure({
        types: ['heading'],
        generateID: () => `heading-${Math.random().toString(36).substr(2, 9)}`,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;

        event.preventDefault();
        const { files } = event.dataTransfer ?? {};
        if (!files) return false;

        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            const promise = uploadToCloudinary(file).then((url) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            });
            toast.promise(promise, {
              loading: 'Uploading image...',
              success: 'Image uploaded!',
              error: 'Failed to upload image.',
            });
          }
        }
        return true;
      },
      handlePaste: (view, event) => {
        const { files } = event.clipboardData ?? {};
        if (!files) return false;

        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const promise = uploadToCloudinary(file).then((url) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            });
            toast.promise(promise, {
              loading: 'Uploading image...',
              success: 'Image uploaded!',
              error: 'Failed to upload image.',
            });
          }
        }
        return false;
      },
    },
  });

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg flex items-center p-1"
        >
          <button
            onClick={toggleBold}
            className={`p-2 rounded ${
              editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={toggleItalic}
            className={`p-2 rounded ${
              editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={toggleStrike}
            className={`p-2 rounded ${
              editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCode}
            className={`p-2 rounded ${
              editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
          >
            <Code className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;