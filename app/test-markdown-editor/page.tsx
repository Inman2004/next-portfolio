'use client';

import React, { useState } from 'react';
import MarkdownEditor from '@/components/blog/MarkdownEditor';

export default function TestMarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(`# Welcome to the Markdown Editor!

This is a **contentEditable-based** editor where you can type directly into the rendered Markdown preview.

## Features

- **Direct editing** in final form
- **Real-time preview** with TailwindCSS prose styling
- **Comprehensive toolbar** with all common formatting options
- **Keyboard shortcuts** (Ctrl+B, Ctrl+I, Ctrl+Z, Ctrl+Y)
- **Undo/Redo** with history management
- **Fullscreen mode** for distraction-free writing
- **Download** your content as a .md file

### Try it out!

1. **Bold text** by selecting and clicking the Bold button or pressing Ctrl+B
2. **Italic text** by selecting and clicking the Italic button or pressing Ctrl+I
3. **Create headings** using the H1, H2, H3 buttons
4. **Add lists** with the bullet and numbered list buttons
5. **Insert links** and images using the respective buttons
6. **Create tables** with customizable dimensions

> This is a blockquote. You can create one by selecting text and clicking the Quote button.

\`This is inline code\`

\`\`\`
// This is a code block
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

---

**Enjoy writing with this powerful editor!**`);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Markdown Editor Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the new contentEditable-based Markdown Editor with all its features.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Editor</h2>
          <MarkdownEditor
            initialMarkdown={markdown}
            onChange={setMarkdown}
            height={600}
            className="w-full"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Raw Markdown Output</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {markdown}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Toolbar Features</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Text Formatting:</strong> Bold, Italic, Strikethrough</li>
                <li>• <strong>Headings:</strong> H1, H2, H3</li>
                <li>• <strong>Lists:</strong> Bullet and numbered lists</li>
                <li>• <strong>Blocks:</strong> Blockquotes, inline code</li>
                <li>• <strong>Media:</strong> Links, images, tables</li>
                <li>• <strong>History:</strong> Undo/Redo with cursor position</li>
                <li>• <strong>Actions:</strong> Download, fullscreen toggle</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
              <ul className="space-y-2 text-sm">
                <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+B</kbd> Bold</li>
                <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+I</kbd> Italic</li>
                <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Z</kbd> Undo</li>
                <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Y</kbd> Redo</li>
                <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Shift+Z</kbd> Redo (alternative)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
          <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
            <p>
              <strong>Editing Sync:</strong> The editor uses a contentEditable div where users type directly into the rendered Markdown preview. 
              It maintains sync between Markdown and HTML using <code>marked</code> (Markdown → HTML) and <code>turndown</code> (HTML → Markdown).
            </p>
            <p>
              <strong>Toolbar Actions:</strong> The toolbar modifies the current selection using <code>document.execCommand</code> for formatting 
              and custom dialogs for complex insertions like links, images, and tables.
            </p>
            <p>
              <strong>History Management:</strong> Undo/Redo is implemented with a history stack that stores both the markdown content and cursor position, 
              allowing for precise restoration of the editing state.
            </p>
            <p>
              <strong>Styling:</strong> Uses TailwindCSS prose classes for beautiful Markdown output with custom styling for code blocks, tables, 
              and other elements to ensure consistency with your design system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
