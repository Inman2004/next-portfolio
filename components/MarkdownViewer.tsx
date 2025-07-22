'use client';

import { useMemo, useState, useRef, memo, ReactNode, AnchorHTMLAttributes, HTMLAttributes, CSSProperties, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Copy, Check, ArrowUpRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import Mermaid from './Mermaid';
// Import the Prism component type from react-syntax-highlighter
import type { PrismLight } from 'react-syntax-highlighter';

// Lazy load heavy components
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: true });

// Import the Prism component and styles
import { Prism as PrismHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Define the props type for the syntax highlighter
type SyntaxHighlighterProps = {
  children: string;
  language: string;
  style?: any;
  [key: string]: any;
};

// Create a wrapper component that handles theming
const ThemedSyntaxHighlighter = ({ children, ...props }: SyntaxHighlighterProps) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className="relative">
      <PrismHighlighter 
        style={resolvedTheme === 'dark' ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent'
        }}
        codeTagProps={{
          className: 'font-mono text-sm',
          style: {
            fontFamily: 'inherit',
            color: 'inherit',
          },
        }}
        showLineNumbers={true}
        wrapLines={false}
        wrapLongLines={false}
        lineNumberStyle={{
          color: '#6b7280',
          paddingRight: '1em',
          userSelect: 'none',
          minWidth: '2.5em',
          textAlign: 'right',
          opacity: 0.7,
          position: 'sticky',
          left: 0,
          backgroundColor: 'inherit',
        }}
        lineProps={{
          style: {
            whiteSpace: 'pre',
            wordBreak: 'normal',
            wordWrap: 'normal',
          },
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </PrismHighlighter>
    </div>
  );
};

// Lazy load the syntax highlighter with code splitting
const LazySyntaxHighlighter = dynamic<SyntaxHighlighterProps>(
  () => Promise.resolve(ThemedSyntaxHighlighter),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }
);

// Export the lazy-loaded syntax highlighter
const SyntaxHighlighter = LazySyntaxHighlighter;

// Import remark and rehype plugins
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

// Custom light theme with better contrast
// Note: Theme is now loaded dynamically based on the current theme

// Custom components for better styling
interface CustomLinkProps {
  node?: unknown;
  children?: React.ReactNode;
  [key: string]: any;
}

const CustomLink = memo(({ node, children, ...props }: CustomLinkProps) => {
  const isExternal = props.href?.startsWith('http');
  
  return (
    <a 
      {...props} 
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {children}
      {isExternal && <ArrowUpRight className="w-3 h-3" />}
    </a>
  );
});

CustomLink.displayName = 'CustomLink';

interface CustomCodeProps extends HTMLAttributes<HTMLElement> {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode | ReactNode[];
  [key: string]: any;
}

// Map of common file extensions to language names
const languageMap: Record<string, string> = {
  // Programming Languages
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
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
    'jsx': 'jsx',
    'typescript': 'ts',
    'tsx': 'tsx',
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
              
// This component now only handles block code (with language specified)
// Inline code is handled directly in the ReactMarkdown components prop
const CustomCode: React.FC<CustomCodeProps> = ({ 
  node, 
  className = '', 
  children, 
  ...props 
}: CustomCodeProps) => {
  // Check if this is a mermaid diagram
  if (className === 'language-mermaid' || className === 'mermaid') {
    const code = String(children).trim();
    return <Mermaid chart={code} />;
  }
  // Determine the language and filename from the className
  const match = /language-(\w+)(?::(.+))?/.exec(className || '');
  const languageFromMatch = match ? match[1] : '';
  const filename = match?.[2] || '';
  // Map the language to a known one if needed
  const language = languageMap[languageFromMatch] || languageFromMatch;

  // For code blocks without a specified language
  if (!match) {
    return (
      <div className=" rounded-lg overflow-hidden ">
        <pre className="overflow-x-auto m-0 bg-white dark:bg-transparent">
          <code className="text-sm font-mono text-teal-600 dark:text-gray-200" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden bg-gray-400/40 dark:bg-gray-700 border border-gray-400/40 dark:border-gray-700 shadow-lg group">
      <div className="bg-gradient-to-r from-gray-50 to-gray-300 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-300 text-xs px-3 sm:px-4 py-2 font-mono border-b border-gray-400/50 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center overflow-hidden">
          <div className="flex space-x-1.5 sm:space-x-2 mr-2 sm:mr-3 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-200 truncate text-ellipsis max-w-[120px] sm:max-w-none">
            {filename || (() => {
              const ext = extensionMap[language] || 'txt';
              return `${language}.${ext}`;
            })()}
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <span className="text-xs text-gray-800 dark:text-gray-300 hidden sm:inline">
            {match[1]} • {codeString.split('\n').length} lines
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 sm:p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            title="Copy to clipboard"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" />
            )}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
        <div className="relative">
          <ScrollArea className="w-full" type="always">
            <div className="min-w-max p-2 sm:p-3 md:p-4">
              <div className="relative">
                <div className="relative text-xs sm:text-sm">
                  <SyntaxHighlighter
                    language={language}
                    showLineNumbers={true}
                    wrapLines={false}
                    wrapLongLines={false}
                    lineNumberStyle={{
                      color: '#6b7280',
                      paddingRight: '0.75em',
                      userSelect: 'none',
                      minWidth: '2em',
                      textAlign: 'right',
                      opacity: 0.7,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'inherit',
                      fontSize: '0.9em',
                      lineHeight: '1.5',
                    }}
                    lineProps={{
                      style: {
                        whiteSpace: 'pre',
                        wordBreak: 'normal',
                        wordWrap: 'normal',
                        lineHeight: '1.5',
                      },
                    }}
                    codeTagProps={{
                      className: 'font-mono',
                      style: {
                        fontFamily: 'inherit',
                        color: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                      },
                    }}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      backgroundColor: 'transparent',
                      fontSize: 'inherit',
                      lineHeight: '1.5',
                    }}
                    PreTag={({ children, ...preProps }: { children: ReactNode; [key: string]: any }) => (
                      <pre 
                        className="!m-0 !p-0 bg-white dark:bg-gray-800 !text-gray-900 dark:!text-gray-200" 
                        {...preProps}
                        style={{ background: 'transparent' }}
                      >
                        {children}
                      </pre>
                    )}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  // Process content to handle mermaid code blocks
  const processedContent = useMemo(() => {
    // Convert mermaid code blocks to a format we can handle
    return content.replace(/```mermaid\n([\s\S]*?)\n```/g, (_, code) => {
      return `\`\`\`mermaid\n${code}\n\`\`\``;
    });
  }, [content]);

  // Initialize mermaid on component mount
  useEffect(() => {
    // @ts-ignore - Mermaid types might not be available
    if (typeof window !== 'undefined' && window.mermaid) {
      // @ts-ignore
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
    }
  }, []);

  return (
    <div className={`prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // Handle code blocks and inline code
          code: (props) => {
            // If it's an inline code block (no className means it's inline)
            if (!props.className) {
              return (
                <code 
                  className="inline-code font-mono text-sm px-1.5 py-0.5 rounded hover:bg-opacity-70 transition-all duration-150"
                  style={{
                    // @ts-ignore - CSS custom properties
                    '--bg-color': 'rgba(243, 244, 246, 0.5)',
                    // @ts-ignore - CSS custom properties
                    '--text-color': 'rgba(13, 148, 136, 0.9)',
                    // @ts-ignore - CSS custom properties
                    '--border-color': 'rgba(209, 213, 219, 0.5)',
                    // @ts-ignore - CSS custom properties
                    '--dark-bg-color': 'rgba(31, 41, 55, 0.5)',
                    // @ts-ignore - CSS custom properties
                    '--dark-text-color': 'rgba(94, 234, 212, 0.9)',
                    // @ts-ignore - CSS custom properties
                    '--dark-border-color': 'rgba(55, 65, 81, 0.5)',
                    
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    lineHeight: '1.25',
                    verticalAlign: 'baseline',
                    transition: 'all 150ms ease',
                  } as React.CSSProperties}
                  {...props}
                />
              );
            }
            // For code blocks, use our CustomCode component
            return <CustomCode {...props} />;
          },
          text: ({ children }) => {
            // Just return children for text nodes
            return children;
          },
          a: CustomLink,
          h1: ({node, ...props}) => (
            <h1 
              className="text-4xl md:text-5xl font-extrabold tracking-tight mt-12 mb-8 relative group"
              {...props}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-teal-400 dark:to-blue-400">
                {props.children}
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-teal-500 dark:to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </h1>
          ),
          h2: ({node, ...props}) => (
            <h2 
              className="text-3xl md:text-4xl font-bold mt-12 mb-6 pt-2 relative pl-8 text-indigo-700 dark:text-gray-100"
              {...props}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-100 dark:bg-teal-900/50 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-teal-400"></span>
              </span>
              {props.children}
            </h2>
          ),
          h3: ({node, ...props}) => (
            <h3 
              className="text-2xl md:text-3xl font-semibold mt-10 mb-4 pb-2 relative pl-6 border-b border-indigo-300 dark:border-teal-700/50 text-indigo-700 dark:text-teal-300"
              {...props}
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 dark:bg-gradient-to-b dark:from-teal-400 dark:to-blue-400 rounded-full"></span>
              {props.children}
            </h3>
          ),
          h4: ({node, ...props}) => (
            <h4 
              className="text-xl md:text-2xl font-semibold mt-8 mb-3 pl-4 relative text-indigo-600 dark:text-blue-300"
              {...props}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 dark:bg-blue-400"></span>
              {props.children}
            </h4>
          ),
          h5: ({node, ...props}) => (
            <h5 
              className="text-lg md:text-xl font-medium mt-6 mb-2 pl-2 relative text-indigo-600 dark:text-gray-300"
              {...props}
            >
              {props.children}
            </h5>
          ),
          h6: ({node, ...props}) => (
            <h6 
              className="text-base font-medium mt-4 mb-2 pl-2 text-indigo-500 dark:text-gray-400"
              {...props}
            />
          ),
          p: (props: any) => {
            const { node, children, ...restProps } = props;
            
            // Check if this paragraph only contains a single code element without a language class
            const isOnlyInlineCode = node?.children?.length === 1 && 
                                 node.children[0].type === 'element' && 
                                 node.children[0].tagName === 'code' && 
                                 !node.children[0].properties?.className?.includes('language-');
            
            if (isOnlyInlineCode) {
              return <span style={{ display: 'inline' }}>{children}</span>;
            }
            
            return (
              <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...restProps}>
                {children}
              </p>
            );
          },
          // Custom checkbox input for task lists
          input: (inputProps: React.InputHTMLAttributes<HTMLInputElement> & { node?: any }) => {
            const { node, ...props } = inputProps;
            if (props.type === 'checkbox') {
              const isChecked = props.checked || false;
              const checkmarkSvg = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3E%3C/svg%3E") no-repeat center';
              
              return (
                <input 
                  type="checkbox" 
                  disabled={true} 
                  checked={isChecked}
                  className={`h-4 w-4 rounded border mr-2 mt-0.5 cursor-pointer transition-colors ${
                    isChecked 
                      ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                  style={{
                    backgroundImage: isChecked ? checkmarkSvg : 'none',
                  }}
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
          // Custom list components
          ul: (ulProps: React.HTMLAttributes<HTMLUListElement>) => {
            const { className, ...props } = ulProps;
            const isTaskList = className?.includes('contains-task-list');
            return (
              <ul 
                className={`${isTaskList ? 'space-y-2' : 'list-disc space-y-2'} pl-6 my-4`}
                {...props} 
              />
            );
          },
          ol: (olProps: React.OlHTMLAttributes<HTMLOListElement>) => (
            <ol 
              className="list-decimal pl-6 my-4 space-y-2 [&>li]:relative [&>li]:pl-2 [&>li]:marker:font-semibold [&>li]:marker:text-indigo-400 [&>li]:marker:dark:text-indigo-300" 
              {...olProps} 
            />
          ),
          li: (liProps: React.LiHTMLAttributes<HTMLLIElement>) => {
            const { className, ...props } = liProps;
            const isTaskItem = className?.includes('task-list-item');
            return (
              <li 
                className={`relative pl-2 my-1 text-gray-700 dark:text-gray-300 ${
                  isTaskItem ? 'flex items-start' : ''
                }`}
                {...props} 
              />
            );
          },

          blockquote: (props) => (
            <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-r" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-indigo-300 dark:border-teal-700/50 shadow-sm">
              <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-700" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-gray-400/50 dark:divide-gray-700/50" {...props} />
          ),
          th: (props) => (
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-teal-300  border-b border-indigo-300 dark:border-teal-700 uppercase tracking-wider"
              style={{ whiteSpace: 'nowrap' }}
              {...props}
            />
          ),
          td: (props) => (
            <td 
              className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              {...props}
            />
          ),
          tr: (props) => (
            <tr 
              className="hover:bg-indigo-400/40 dark:hover:bg-gray-800/30 transition-colors duration-150"
              {...props}
            />
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
          // Horizontal rule with gradient styling
          hr: () => (
            <hr className="my-8 border-0 h-px bg-gray-400/50 dark:bg-gray-600/50" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
