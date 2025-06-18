'use client';

import React, { ReactNode, AnchorHTMLAttributes, HTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ScrollArea } from '@/components/ui/scroll-area';

// Custom light theme with better contrast
const customLightTheme = {
  ...vs,
  'pre[class*="language-"]': {
    ...vs['pre[class*="language-"]'],
    background: '#ffffff',
    color: '#1f2937',
  },
  'code[class*="language-"]': {
    ...vs['code[class*="language-"]'],
    color: '#1f2937',
    textShadow: 'none',
  },
  'code[class*="language-"] .token.comment': {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  'code[class*="language-"] .token.keyword': {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  'code[class*="language-"] .token.string': {
    color: '#0d9488',
  },
  'code[class*="language-"] .token.number': {
    color: '#b45309',
  },
  'code[class*="language-"] .token.function': {
    color: '#2563eb',
  },
  'code[class*="language-"] .token.operator': {
    color: '#4f46e5',
  },
  'code[class*="language-"] .token.punctuation': {
    color: '#4b5563',
  },
  'code[class*="language-"] .token.selector': {
    color: '#7c3aed',
  },
  'code[class*="language-"] .token.tag': {
    color: '#2563eb',
  },
  'code[class*="language-"] .token.attr-name': {
    color: '#0d9488',
  },
  'code[class*="language-"] .token.attr-value': {
    color: '#0d9488',
  },
};


import { ScrollBar } from './ui/scroll-area';

// Custom components for better styling
interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  node?: unknown;
  children?: ReactNode;
}

const CustomLink = ({ node, children, ...props }: CustomLinkProps) => (
  <a 
    {...props} 
    target="_blank" 
    rel="noopener noreferrer"
    className="relative text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:scale-105 group transition-all duration-300 font-medium"
  >
    {children}
    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
  </a>
);

interface CustomCodeProps extends HTMLAttributes<HTMLElement> {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;  // Made children optional to match ReactMarkdown's expected type
}

// Map of common file extensions to language names
const languageMap: Record<string, string> = {
  // Programming Languages
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  
  // Web Technologies
  html: 'htmlbars',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  graphql: 'graphql',
  
  // Shell & Config
  sh: 'bash',
  zsh: 'bash',
  bash: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  env: 'ini',
  ini: 'ini',
  dockerfile: 'dockerfile',
  gitignore: 'gitignore',
  
  // Markup & Data
  md: 'markdown',
  mdx: 'markdown',
  xml: 'xml',
  sql: 'sql',
  
  // Other
  diff: 'diff',
  txt: 'text',
};

// Map of languages to their common file extensions
const extensionMap: Record<string, string> = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'ruby': 'rb',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'csharp': 'cs',
    'go': 'go',
    'rust': 'rs',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kt',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'markdown': 'md',
    'yaml': 'yaml',
    'bash': 'sh',
    'shell': 'sh',
    'dockerfile': 'Dockerfile',
    'gitignore': '.gitignore'
  };
              
// Custom component to render code blocks with proper structure
const CustomCode = ({ 
  node, 
  inline = false, 
  className = '', 
  children, 
  ...props 
}: CustomCodeProps) => {
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(darkModeMediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // Don't render anything during SSR to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  // For inline code
  if (inline) {
    return (
      <code 
        className="bg-gray-200 dark:bg-gray-800/50 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Extract language from className if present (e.g., "language-js")
  const match = /language-(\w+)/.exec(className || '');
  let language = match ? match[1].toLowerCase() : 'text';
  
  // Map the language to a known one if needed
  if (language in languageMap) {
    language = languageMap[language];
  }

  // For code blocks without a specified language
  if (!match) {
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow">
        <div className="p-4 overflow-x-auto bg-white dark:bg-gray-800">
          <pre className="m-0">
            <code className="text-sm font-mono text-gray-900 dark:text-gray-200 block" {...props}>
              {String(children).replace(/\n$/, '')}
            </code>
          </pre>
        </div>
      </div>
    );
  }

  // For block code, use SyntaxHighlighter with ScrollArea
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow">
      <div className="relative">
        <ScrollArea className="w-full max-h-[500px]">
          <div className="min-w-max">
            <SyntaxHighlighter
              style={isDark ? vscDarkPlus : customLightTheme}
              language={language}
              className="m-0 text-sm"
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                minWidth: '100%',
                display: 'inline-block',
              }}
              lineNumberStyle={{
                color: isDark ? '#6b7280' : '#9ca3af',
                paddingRight: '1rem',
                userSelect: 'none',
                minWidth: '2.5em',
                textAlign: 'right',
                position: 'sticky',
                left: 0,
                backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                zIndex: 1,
              }}
              PreTag={({ children, ...preProps }: { children: ReactNode; [key: string]: any }) => (
                <pre className="!m-0 !p-0 !bg-transparent dark:!bg-gray-800 !text-gray-900 dark:!text-gray-200" {...preProps}>
                  {children}
                </pre>
              )}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>
    </div>
  );
};

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

// Component to safely render paragraphs with proper nesting
const SafeParagraph = ({ children, className = '', ...props }: { children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) => {
  // Always check children for block elements, even if there's only one child
  const hasBlockElements = React.Children.toArray(children).some((child: any) => {
    // Handle React elements
    if (React.isValidElement(child)) {
      const elementType = child.type;
      
      // Check for HTML elements
      if (typeof elementType === 'string') {
        return [
          'div', 'pre', 'figure', 'ul', 'ol', 'li', 'table', 
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
          'hr', 'p', 'header', 'footer', 'section', 'article',
          'aside', 'nav', 'main', 'div', 'pre', 'code'
        ].includes(elementType);
      }
      
      // Check for custom components that might render block elements
      if (elementType === CustomCode) {
        return true;
      }
      
      // Check for any component that might render block elements
      const displayName = (elementType as any).displayName || (elementType as any).name || '';
      if (typeof displayName === 'string' && [
        'CustomCode', 'CodeBlock', 'pre', 'div', 'table', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr'
      ].some(name => displayName.toLowerCase().includes(name.toLowerCase()))) {
        return true;
      }
    }
    
    // Check for text nodes that might contain block-level markdown
    if (typeof child === 'string' && (
      child.trim().startsWith('```') || // Code block
      child.trim().startsWith('#') ||   // Heading
      child.trim().startsWith('> ') ||  // Blockquote
      child.trim().match(/^[-*+]\s/)   // List
    )) {
      return true;
    }
    
    return false;
  });

  // Don't wrap block elements in a paragraph
  if (hasBlockElements) {
    return <>{children}</>;
  }

  // Only render a paragraph if there's actual content
  const hasContent = React.Children.toArray(children).some(child => {
    if (typeof child === 'string') return child.trim().length > 0;
    return true; // Assume non-string children have content
  });

  if (!hasContent) {
    return null;
  }

  return (
    <p 
      className={`my-4 text-gray-700 dark:text-gray-300 leading-relaxed ${className}`} 
      {...props}
    >
      {children}
    </p>
  );
};

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // Handle code blocks with proper structure
          code: ({ node, inline, className, children, ...props }: any) => {
            // For inline code
            if (inline) {
              return <code className="bg-gray-200 dark:bg-gray-800/50 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700" {...props}>{children}</code>;
            }
            
            // For block code, use our CustomCode component
            return <CustomCode className={className} {...props}>{children}</CustomCode>;
          },
          a: CustomLink,
          h1: (props) => (
            <h1 
              className="text-4xl font-bold mt-8 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-300 dark:via-indigo-200 dark:to-white"
              {...props} 
            />
          ),
          h2: (props) => (
            <h2 
              className="text-3xl font-bold mt-8 mb-4 text-indigo-700 dark:text-indigo-300 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-b dark:from-indigo-300 dark:via-indigo-200 dark:to-white"
              {...props} 
            />
          ),
          h3: (props) => (
            <h3 
              className="text-2xl font-bold mt-6 mb-3 text-indigo-700 dark:text-indigo-300 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-b dark:from-indigo-300 dark:via-indigo-200 dark:to-white"
              {...props} 
            />
          ),
          ul: (props) => (
            <ul className="list-disc pl-6 my-4 space-y-2 [&>li]:relative [&>li]:pl-2 [&>li]:marker:text-indigo-400 [&>li]:marker:dark:text-indigo-300" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 [&>li]:relative [&>li]:pl-2 [&>li]:marker:font-semibold [&>li]:marker:text-indigo-400 [&>li]:marker:dark:text-indigo-300" {...props} />
          ),
          li: (props) => (
            <li className="my-1 pl-1 text-gray-700 dark:text-gray-300" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-r" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-gray-300 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-indigo-100 dark:bg-indigo-800/30" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          th: (props) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200" {...props} />
          ),
          td: (props) => (
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
          ),
          tr: (props) => (
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors" {...props} />
          ),
          img: (props) => {
            const { alt, className = '', ...imgProps } = props;
            
            // Create the image with proper styling
            const image = (
              <img 
                {...imgProps}
                className={`rounded-lg shadow-lg w-full max-w-full h-auto border border-gray-200 dark:border-gray-700 ${className}`}
                alt={alt || 'Image'}
                loading="lazy"
              />
            );
            
            // If there's an alt text, treat it as a caption using a figure
            if (alt) {
              return (
                <figure className="my-6">
                  {image}
                  <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {alt}
                  </figcaption>
                </figure>
              );
            }
            
            // For images without alt text, return the image wrapped in a div
            return <div className="my-6">{image}</div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
