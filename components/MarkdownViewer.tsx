'use client';

import { useMemo, useState, useRef, memo, ReactNode, useCallback, lazy, Suspense } from 'react';
import { useTheme } from 'next-themes';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

// Lazy load ALL heavy components
const ReactMarkdown = lazy(() => import('react-markdown'));
const PrismHighlighter = lazy(() => 
  import('react-syntax-highlighter').then(mod => ({ default: mod.Prism }))
);
const Mermaid = lazy(() => import('./Mermaid'));

// Lazy load styles only when needed
const loadPrismStyles = () => {
  return Promise.all([
    import('react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus'),
    import('react-syntax-highlighter/dist/cjs/styles/prism/vs')
  ]);
};

// Lightweight loading components
const CodeBlockSkeleton = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const MarkdownSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// Minimal language mapping (only common ones)
const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  html: 'markup',
  css: 'css',
  json: 'json',
  md: 'markdown',
  sh: 'bash',
  yml: 'yaml',
};

// Simple copy hook without heavy dependencies
const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);
  
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);
  
  return { copied, copy };
};

// Lightweight syntax highlighter component
const LightweightSyntaxHighlighter = memo(({ 
  children, 
  language, 
  showLineNumbers = false 
}: { 
  children: string; 
  language: string; 
  showLineNumbers?: boolean; 
}) => {
  const { resolvedTheme } = useTheme();
  const [styles, setStyles] = useState<any>(null);
  const [highlighter, setHighlighter] = useState<any>(null);
  
  // Load styles and highlighter only when needed
  const loadComponents = useCallback(async () => {
    try {
      const [stylesModule, highlighterModule] = await Promise.all([
        loadPrismStyles(),
        import('react-syntax-highlighter').then(mod => mod.Prism)
      ]);
      
      setStyles({
        dark: stylesModule[0].default,
        light: stylesModule[1].default
      });
      setHighlighter(() => highlighterModule);
    } catch (error) {
      console.warn('Failed to load syntax highlighter:', error);
    }
  }, []);
  
  // Load on mount
  React.useEffect(() => {
    loadComponents();
  }, [loadComponents]);
  
  // Fallback to simple pre/code if highlighter not loaded
  if (!highlighter || !styles) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded border overflow-x-auto">
        <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
          <code>{children}</code>
        </pre>
      </div>
    );
  }
  
  const HighlighterComponent = highlighter;
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded border overflow-hidden">
      <HighlighterComponent
        language={language}
        style={resolvedTheme === 'dark' ? styles.dark : styles.light}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          fontSize: '14px',
        }}
        codeTagProps={{
          style: { fontFamily: 'inherit' }
        }}
      >
        {children}
      </HighlighterComponent>
    </div>
  );
});

LightweightSyntaxHighlighter.displayName = 'LightweightSyntaxHighlighter';

// Simplified code block component
const SimpleCodeBlock = memo(({ 
  children, 
  language, 
  className = '' 
}: { 
  children: string; 
  language?: string; 
  className?: string; 
}) => {
  const { copied, copy } = useCopyToClipboard();
  
  // Check for mermaid
  if (language === 'mermaid' || className.includes('mermaid')) {
    return (
      <Suspense fallback={<CodeBlockSkeleton />}>
        <Mermaid chart={children.trim()} />
      </Suspense>
    );
  }
  
  // Simple code block without syntax highlighting for unknown languages
  if (!language || !languageMap[language]) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded border my-4">
        <div className="flex justify-between items-center p-2 border-b bg-gray-100 dark:bg-gray-800">
          <span className="text-xs text-gray-600 dark:text-gray-400">Code</span>
          <button
            onClick={() => copy(children)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
          <code>{children}</code>
        </pre>
      </div>
    );
  }
  
  const mappedLanguage = languageMap[language] || language;
  
  return (
    <div className="my-4">
      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-t border">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {language}
        </span>
        <button
          onClick={() => copy(children)}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <Suspense fallback={<CodeBlockSkeleton />}>
        <LightweightSyntaxHighlighter language={mappedLanguage} showLineNumbers={false}>
          {children}
        </LightweightSyntaxHighlighter>
      </Suspense>
    </div>
  );
});

SimpleCodeBlock.displayName = 'SimpleCodeBlock';

// Lightweight link component
const SimpleLink = memo(({ href, children, ...props }: any) => {
  const isExternal = href?.startsWith('http');
  
  return (
    <a 
      href={href}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {isExternal && <ArrowUpRight className="w-3 h-3 inline ml-1" />}
    </a>
  );
});

SimpleLink.displayName = 'SimpleLink';

// Main component with minimal plugins
interface OptimizedMarkdownViewerProps {
  content: string;
  className?: string;
}

const OptimizedMarkdownViewer = memo(({ content, className = '' }: OptimizedMarkdownViewerProps) => {
  // Process content with minimal operations
  const processedContent = useMemo(() => {
    return content.replace(/```mermaid\n([\s\S]*?)\n```/g, (_, code) => {
      return `\`\`\`mermaid\n${code}\n\`\`\``;
    });
  }, [content]);
  
  // Minimal markdown components
  const components = useMemo(() => ({
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code 
            className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }
      
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return (
        <SimpleCodeBlock 
          language={language} 
          className={className}
        >
          {String(children).replace(/\n$/, '')}
        </SimpleCodeBlock>
      );
    },
    
    a: SimpleLink,
    
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h1>
    ),
    
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h2>
    ),
    
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-medium mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h3>
    ),
    
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>
        {children}
      </ul>
    ),
    
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>
        {children}
      </ol>
    ),
    
    li: ({ children, ...props }: any) => (
      <li className="text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </li>
    ),
    
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props}>
        {children}
      </blockquote>
    ),
    
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded" {...props}>
          {children}
        </table>
      </div>
    ),
    
    th: ({ children, ...props }: any) => (
      <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b" {...props}>
        {children}
      </th>
    ),
    
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b" {...props}>
        {children}
      </td>
    ),
    
    img: ({ alt, ...props }: any) => (
      <img 
        className="max-w-full h-auto rounded border my-4"
        alt={alt || 'Image'}
        loading="lazy"
        {...props}
      />
    ),
    
    hr: ({ ...props }: any) => (
      <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
    ),
  }), []);
  
  return (
    <div className={`prose max-w-none text-gray-800 dark:text-gray-200 ${className}`}>
      <Suspense fallback={<MarkdownSkeleton />}>
        <ReactMarkdown
          components={components}
          // Minimal plugins only
          remarkPlugins={[]}
          rehypePlugins={[]}
        >
          {processedContent}
        </ReactMarkdown>
      </Suspense>
    </div>
  );
});

MarkdownViewer.displayName = 'MarkdownViewer';

export default MarkdownViewer;
