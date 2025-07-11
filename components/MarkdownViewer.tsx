'use client';

import { useMemo, useState, useRef, memo, ReactNode, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Copy, Check, ArrowUpRight, Download } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import Mermaid from './Mermaid';
import type { PrismLight } from 'react-syntax-highlighter';

// Lazy load heavy components
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: true });

// Import the Prism component and styles
import { Prism as PrismHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Import remark and rehype plugins
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

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
          backgroundColor: 'transparent',
          background: 'transparent',
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

// Copy to clipboard hook
const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);
  
  return { isCopied, copyToClipboard };
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
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 decoration-2 hover:decoration-blue-500 transition-all duration-200 inline-flex items-center gap-1"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {children}
      {isExternal && <ArrowUpRight className="w-3 h-3 flex-shrink-0" />}
    </a>
  );
});

CustomLink.displayName = 'CustomLink';

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
  'c++': 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  
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
  fish: 'bash',
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
  patch: 'diff',
  txt: 'text',
  log: 'text',
};

// Map of languages to their display names and extensions
const languageDisplayMap: Record<string, { name: string; ext: string }> = {
  javascript: { name: 'JavaScript', ext: 'js' },
  jsx: { name: 'JSX', ext: 'jsx' },
  typescript: { name: 'TypeScript', ext: 'ts' },
  tsx: { name: 'TSX', ext: 'tsx' },
  python: { name: 'Python', ext: 'py' },
  ruby: { name: 'Ruby', ext: 'rb' },
  java: { name: 'Java', ext: 'java' },
  c: { name: 'C', ext: 'c' },
  cpp: { name: 'C++', ext: 'cpp' },
  csharp: { name: 'C#', ext: 'cs' },
  go: { name: 'Go', ext: 'go' },
  rust: { name: 'Rust', ext: 'rs' },
  php: { name: 'PHP', ext: 'php' },
  swift: { name: 'Swift', ext: 'swift' },
  kotlin: { name: 'Kotlin', ext: 'kt' },
  html: { name: 'HTML', ext: 'html' },
  css: { name: 'CSS', ext: 'css' },
  scss: { name: 'SCSS', ext: 'scss' },
  sass: { name: 'Sass', ext: 'sass' },
  json: { name: 'JSON', ext: 'json' },
  markdown: { name: 'Markdown', ext: 'md' },
  yaml: { name: 'YAML', ext: 'yaml' },
  bash: { name: 'Bash', ext: 'sh' },
  shell: { name: 'Shell', ext: 'sh' },
  dockerfile: { name: 'Dockerfile', ext: 'Dockerfile' },
  sql: { name: 'SQL', ext: 'sql' },
  diff: { name: 'Diff', ext: 'diff' },
  text: { name: 'Text', ext: 'txt' },
};

// Code block header component
const CodeBlockHeader = ({ language, children }: { language: string; children: string }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const displayInfo = languageDisplayMap[language] || { name: language, ext: 'txt' };
  const lineCount = String(children).split('\n').length;
  
  const handleCopy = () => {
    copyToClipboard(String(children));
  };
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-300 text-xs px-4 py-2 font-mono border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex space-x-2 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="font-medium text-gray-900 dark:text-gray-200">
          {displayInfo.name}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {lineCount} lines
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface CustomCodeProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode | ReactNode[];
  [key: string]: any;
}

// Enhanced CustomCode component
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
  
  const match = /language-(\w+)/.exec(className || '');
  let language = match ? match[1].toLowerCase() : '';
  
  // Map the language to a known one if needed
  if (language in languageMap) {
    language = languageMap[language];
  }

  // For code blocks without a specified language
  if (!match) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <pre className="overflow-x-auto m-0 p-4">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CodeBlockHeader language={language} children={String(children)} />
      <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
        <ScrollArea className="w-full" type="always">
          <div className="min-w-max">
            <SyntaxHighlighter
              language={language}
              showLineNumbers={true}
              wrapLines={false}
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'transparent',
                background: 'transparent',
              }}
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
              codeTagProps={{
                className: 'font-mono text-sm',
                style: {
                  fontFamily: 'inherit',
                  color: 'inherit',
                },
              }}
              PreTag={({ children, ...preProps }: { children: ReactNode; [key: string]: any }) => (
                <pre 
                  className="!m-0 !p-0 !bg-transparent" 
                  {...preProps}
                >
                  {children}
                </pre>
              )}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

// Enhanced inline code component
const InlineCode = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => {
  return (
    <code 
      className="inline-code font-mono text-sm px-1.5 py-0.5 rounded border transition-all duration-150 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
      {...props}
    >
      {children}
    </code>
  );
};

// Enhanced table components
const Table = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <thead className="bg-gray-50 dark:bg-gray-800/50" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150" {...props}>
    {children}
  </tr>
);

const TableCell = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300" {...props}>
    {children}
  </td>
);

const TableHeaderCell = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" {...props}>
    {children}
  </th>
);

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
    if (typeof window !== 'undefined' && window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
    }
  }, []);

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // Handle code blocks and inline code
          code: (props) => {
            // If it's an inline code block (no className means it's inline)
            if (!props.className) {
              return <InlineCode {...props} />;
            }
            // For code blocks, use our CustomCode component
            return <CustomCode {...props} />;
          },
          
          // Links
          a: CustomLink,
          
          // Headings with improved styling
          h1: ({ node, ...props }) => (
            <h1 
              className="text-4xl md:text-5xl font-extrabold tracking-tight mt-12 mb-8 relative group"
              {...props}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-teal-400">
                {props.children}
              </span>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </h1>
          ),
          
          h2: ({ node, ...props }) => (
            <h2 
              className="text-3xl md:text-4xl font-bold mt-12 mb-6 pt-2 relative pl-8 text-gray-900 dark:text-gray-100"
              {...props}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </span>
              {props.children}
            </h2>
          ),
          
          h3: ({ node, ...props }) => (
            <h3 
              className="text-2xl md:text-3xl font-semibold mt-10 mb-4 pb-2 relative pl-6 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              {...props}
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              {props.children}
            </h3>
          ),
          
          // Paragraphs
          p: ({ node, children, ...props }) => {
            // Check if this paragraph only contains a single code element
            const isOnlyInlineCode = node?.children?.length === 1 && 
                                   node.children[0].type === 'element' && 
                                   node.children[0].tagName === 'code' && 
                                   !node.children[0].properties?.className?.includes('language-');
            
            if (isOnlyInlineCode) {
              return <span className="inline">{children}</span>;
            }
            
            return (
              <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
          
          // Lists
          ul: ({ className, ...props }) => {
            const isTaskList = className?.includes('contains-task-list');
            return (
              <ul 
                className={`${isTaskList ? 'space-y-2' : 'list-disc space-y-2'} pl-6 my-4 marker:text-indigo-500 dark:marker:text-indigo-400`}
                {...props} 
              />
            );
          },
          
          ol: (props) => (
            <ol 
              className="list-decimal pl-6 my-4 space-y-2 marker:text-indigo-500 dark:marker:text-indigo-400 marker:font-semibold" 
              {...props} 
            />
          ),
          
          li: ({ className, ...props }) => {
            const isTaskItem = className?.includes('task-list-item');
            return (
              <li 
                className={`text-gray-700 dark:text-gray-300 ${
                  isTaskItem ? 'flex items-start list-none' : 'my-1'
                }`}
                {...props} 
              />
            );
          },
          
          // Enhanced checkbox for task lists
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input 
                  type="checkbox" 
                  disabled={true} 
                  checked={checked}
                  className={`h-4 w-4 rounded border mr-3 mt-1 cursor-pointer transition-colors ${
                    checked 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
          
          // Blockquotes
          blockquote: (props) => (
            <blockquote 
              className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-6 my-6 italic text-gray-700 dark:text-gray-300 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent py-4 rounded-r-lg" 
              {...props} 
            />
          ),
          
          // Enhanced table components
          table: Table,
          thead: TableHeader,
          tbody: TableBody,
          tr: TableRow,
          td: TableCell,
          th: TableHeaderCell,
          
          // Enhanced image handling
          img: ({ alt, className = '', ...props }) => {
            const image = (
              <img 
                {...props}
                className={`rounded-lg shadow-lg w-full max-w-full h-auto border border-gray-200 dark:border-gray-700 ${className}`}
                alt={alt || 'Image'}
                loading="lazy"
              />
            );
            
            if (alt) {
              return (
                <figure className="my-8">
                  {image}
                  <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
                    {alt}
                  </figcaption>
                </figure>
              );
            }
            
            return <div className="my-8">{image}</div>;
          },
          
          // Horizontal rules
          hr: (props) => (
            <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
