'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

interface MarkdownEditorContextType {
  editor: HTMLTextAreaElement | null;
  setEditor: (editor: HTMLTextAreaElement | null) => void;
  insertText: (text: string) => void;
}

const MarkdownEditorContext = createContext<MarkdownEditorContextType | undefined>(undefined);

export function MarkdownEditorProvider({ children }: { children: ReactNode }) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const setEditor = (editor: HTMLTextAreaElement | null) => {
    editorRef.current = editor;
  };

  const insertText = (text: string) => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const textBefore = editorRef.current.value.substring(0, start);
    const textAfter = editorRef.current.value.substring(end);
    
    // Update the value
    editorRef.current.value = textBefore + text + textAfter;
    
    // Update cursor position
    const newCursorPos = start + text.length;
    editorRef.current.selectionStart = newCursorPos;
    editorRef.current.selectionEnd = newCursorPos;
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  return (
    <MarkdownEditorContext.Provider 
      value={{ 
        editor: editorRef.current, 
        setEditor, 
        insertText 
      }}
    >
      {children}
    </MarkdownEditorContext.Provider>
  );
}

export function useMarkdownEditor() {
  const context = useContext(MarkdownEditorContext);
  if (context === undefined) {
    throw new Error('useMarkdownEditor must be used within a MarkdownEditorProvider');
  }
  return context;
}
