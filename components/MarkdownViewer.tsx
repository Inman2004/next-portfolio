'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

import type { ReactNode, AnchorHTMLAttributes, HTMLAttributes } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ScrollArea } from '@/components/ui/scroll-area';
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
              
const CustomCode = ({ 
  node, 
  inline = false, 
  className = '', 
  children, 
  ...props 
}: CustomCodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  let language = match ? match[1].toLowerCase() : '';
  
  // Map the language to a known one if needed
  if (language in languageMap) {
    language = languageMap[language];
  }

  if (inline) {
    return (
      <code className={`bg-gray-200 dark:bg-gray-800/50 ${className}`} {...props}>
        {children}
      </code>
    );
  }

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

  return (
    <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="bg-gradient-to-r from-gray-50 to-gray-300 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-300 text-xs px-4 py-2 font-mono border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex space-x-2 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-200">
            {(() => {
              const ext = extensionMap[language] || 'txt';
              return `${language}.${ext}`;
            })()}
          </span>
        </div>
        <div className="text-xs text-gray-800 dark:text-gray-300">
          {match[1]} • {String(children).split('\n').length} lines
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
        <div className="relative">
          <ScrollArea className="w-full" type="always">
            <div className="min-w-max p-4">
              <SyntaxHighlighter
                style={typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? vscDarkPlus : vs}
                language={language}
                className="!m-0 !bg-transparent !text-gray-900 dark:!text-gray-200"
                customStyle={{
                  margin: 0,
                  padding: 0,
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  backgroundColor: 'transparent',
                  background: 'transparent',
                  color: 'inherit',
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
                codeTagProps={{
                  style: {
                    fontFamily: 'inherit',
                    display: 'block',
                    color: 'inherit',
                  },
                }}
                PreTag={({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
                  <pre className="!m-0 !p-0 !bg-transparent dark:!bg-gray-800 !text-gray-900 dark:!text-gray-200" {...props}>
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
    </div>
  );
};

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          code: CustomCode,
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
          p: (props: any) => {
            const { node, children, ...restProps } = props;
            
            // Check if this paragraph contains any block-level elements that shouldn't be in a <p>
            const hasBlockLevelElements = node?.children?.some(
              (child: any) => {
                if (!child) return false;
                
                // Common block-level elements
                const blockElements = [
                  'div', 'pre', 'figure', 'ul', 'ol', 'table', 'h1', 'h2', 'h3', 
                  'h4', 'h5', 'h6', 'blockquote', 'hr', 'dl', 'dd', 'dt', 'form', 
                  'fieldset', 'legend', 'article', 'aside', 'details', 'figcaption',
                  'footer', 'header', 'main', 'nav', 'section', 'summary', 'img'
                ];
                
                return blockElements.includes(child.tagName);
              }
            );
            
            // Don't render paragraph wrapper if it contains block-level elements
            if (hasBlockLevelElements) {
              return <>{children}</>;
            }
            
            // Check if this paragraph has any meaningful content
            const hasContent = node?.children?.some(
              (child: any) => 
                (child.type === 'text' && child.value.trim() !== '') ||
                (child.type === 'element' && child.tagName !== 'br')
            );
            
            if (!hasContent) {
              return null;
            }
            
            return (
              <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...restProps}>
                {children}
              </p>
            );
          },
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
            <div className="overflow-x-auto my-1 rounded-lg border border-gray-300 dark:border-gray-700">
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
