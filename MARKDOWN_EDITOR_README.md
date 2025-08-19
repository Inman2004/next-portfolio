# Markdown Editor Component

A powerful, contentEditable-based Markdown editor that allows users to type directly into the rendered Markdown preview. Built with React, TypeScript, and TailwindCSS.

## ✨ Features

### Core Features
- **Direct Edit in Final Form**: Users type directly into the rendered Markdown preview
- **Real-time Sync**: Automatic Markdown ↔ HTML conversion using `marked` and `turndown`
- **ContentEditable**: Native browser editing experience with rich text formatting

### Toolbar (Tool Ribbon)
- **Text Formatting**: Bold, Italic, Strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Ordered and unordered lists
- **Blocks**: Blockquotes, inline code
- **Media**: Insert links, images, and tables
- **History**: Undo/Redo with cursor position preservation
- **Actions**: Fullscreen toggle, download Markdown file

### Keyboard Shortcuts
- `Ctrl/Cmd + B` → Bold
- `Ctrl/Cmd + I` → Italic
- `Ctrl/Cmd + Z` → Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` → Redo

### Styling
- **TailwindCSS Prose**: Beautiful typography with `@tailwindcss/typography`
- **Custom Elements**: Enhanced styling for code blocks, tables, and images
- **Responsive Design**: Adapts to different screen sizes
- **Theme Support**: Works with light/dark themes

## 🚀 Installation

The component uses these dependencies (already included in your project):

```bash
npm install marked turndown dompurify @types/marked @types/turndown @types/dompurify
```

## 📖 Usage

### Basic Usage

```tsx
import MarkdownEditor from '@/components/blog/MarkdownEditor';

function MyComponent() {
  const [markdown, setMarkdown] = useState('');

  return (
    <MarkdownEditor
      initialMarkdown={markdown}
      onChange={setMarkdown}
      height={600}
    />
  );
}
```

### Advanced Usage

```tsx
<MarkdownEditor
  initialMarkdown="# Hello World"
  onChange={(markdown) => {
    console.log('Markdown changed:', markdown);
    // Save to database, update state, etc.
  }}
  height="75vh"
  className="my-custom-editor"
/>
```

## 🔧 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMarkdown` | `string` | `''` | Initial markdown content |
| `height` | `number \| string` | `600` | Editor height (px or CSS value) |
| `onChange` | `(markdown: string) => void` | `undefined` | Callback when content changes |
| `className` | `string` | `''` | Additional CSS classes |

## 🏗️ Architecture

### How Editing Sync Works

1. **ContentEditable Div**: Users type directly into a `contentEditable` div that displays rendered HTML
2. **Markdown → HTML**: Initial markdown is converted to HTML using `marked` library
3. **HTML → Markdown**: When users edit, HTML content is converted back to markdown using `turndown`
4. **Real-time Updates**: Changes are detected via `input` and `blur` events
5. **State Management**: Markdown state is maintained and synced with parent component

### How Toolbar Modifies Selection

1. **Selection Capture**: Current cursor position and selection are saved before applying formatting
2. **Command Execution**: Uses `document.execCommand` for standard formatting (bold, italic, etc.)
3. **Custom Dialogs**: Complex insertions (links, images, tables) use custom dialog components
4. **Selection Restoration**: Cursor position is restored after formatting operations
5. **History Integration**: All changes are added to the undo/redo history

### How History/Undo/Redo is Managed

1. **History Stack**: Maintains an array of `HistoryState` objects with markdown content and cursor positions
2. **State Tracking**: Each state change adds a new entry to the history
3. **Cursor Preservation**: Selection ranges are stored as character offsets for precise restoration
4. **Limited History**: History is capped at 50 states to prevent memory issues
5. **Position Restoration**: When undoing/redoing, both content and cursor position are restored

### How to Integrate in Next.js

1. **Import Component**: Import the MarkdownEditor in your page or component
2. **State Management**: Use React state to manage the markdown content
3. **Event Handling**: Handle the `onChange` callback to save content or update other components
4. **Styling**: The component automatically uses your TailwindCSS configuration
5. **Responsive Design**: Works seamlessly with Next.js responsive layouts

## 🎨 Customization

### Styling

The component uses TailwindCSS prose classes with custom overrides:

```css
/* Custom prose styles are applied via className prop */
.prose-headings:mt-6 prose-headings:mb-4
.prose-p:my-2 prose-p:leading-relaxed
.prose-code:bg-muted prose-code:px-1 prose-code:py-0.5
.prose-table:my-4 prose-table:w-full
```

### Theme Integration

The component automatically adapts to your theme:
- Uses CSS custom properties for colors
- Integrates with `next-themes` if available
- Responsive to system theme changes

## 🔒 Security

- **DOMPurify**: All HTML content is sanitized using DOMPurify
- **XSS Prevention**: Prevents script injection and malicious HTML
- **Safe Markdown**: Uses `marked` with security-focused configuration

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **ContentEditable**: Full support for rich text editing
- **ES6+ Features**: Uses modern JavaScript features
- **CSS Grid/Flexbox**: Modern CSS layout support

## 🧪 Testing

Visit `/test-markdown-editor` to see a live demo of all features:

- Interactive editor with sample content
- Toolbar functionality demonstration
- Keyboard shortcuts testing
- Responsive design showcase

## 🐛 Troubleshooting

### Common Issues

1. **Content Not Syncing**: Ensure `onChange` callback is properly implemented
2. **Styling Issues**: Check that `@tailwindcss/typography` is installed and configured
3. **Cursor Position**: Verify that selection restoration is working in your browser
4. **Performance**: Large documents may need optimization for smooth editing

### Debug Mode

Enable console logging by setting:

```tsx
// Add this to see detailed logging
console.log('Markdown Editor Debug:', { markdown, htmlContent });
```

## 🤝 Contributing

The component is designed to be extensible:

- Add new toolbar buttons in the `handleToolbarAction` function
- Extend the history system for more complex operations
- Customize the styling by modifying the TailwindCSS classes
- Add new keyboard shortcuts in the `handleKeyDown` function

## 📄 License

This component is part of your Next.js portfolio project and follows the same licensing terms.

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**
