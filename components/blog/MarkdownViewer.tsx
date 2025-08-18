'use client';

import { useMemo, useState, useRef, memo, ReactNode, AnchorHTMLAttributes, HTMLAttributes, CSSProperties, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { createHeadingIdGenerator } from '@/lib/markdownUtils';
import { Copy, Check, ArrowUpRight, ZoomIn, ZoomOut, Maximize2, RefreshCcw } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import Mermaid from '../Mermaid';
// Import the Prism component type from react-syntax-highlighter
import type { PrismLight } from 'react-syntax-highlighter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
      className="text-teal-600 hover:text-teal-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
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
    const [zoom, setZoom] = useState(1);
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const dialogScrollRef = useRef<HTMLDivElement | null>(null);
    const initialZoomRef = useRef<number>(1);
    const hasInitialRef = useRef<boolean>(false);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      }, { rootMargin: '200px 0px' });
      io.observe(el);
      return () => io.disconnect();
    }, []);

    const fitToWidth = () => {
      try {
        const container = containerRef.current;
        const svg = innerRef.current?.querySelector('svg');
        if (!container || !svg) return setZoom(1);
        const containerWidth = container.clientWidth - 24; // padding
        const svgWidth = (svg as SVGGraphicsElement).getBBox?.().width || (svg as any).clientWidth || 0;
        if (svgWidth > 0) {
          const next = Math.max(0.4, Math.min(2.5, containerWidth / svgWidth));
          setZoom(next);
          if (!hasInitialRef.current) {
            initialZoomRef.current = next;
            hasInitialRef.current = true;
          }
        } else {
          setZoom(1);
          if (!hasInitialRef.current) {
            initialZoomRef.current = 1;
            hasInitialRef.current = true;
          }
        }
      } catch {
        setZoom(1);
        if (!hasInitialRef.current) {
          initialZoomRef.current = 1;
          hasInitialRef.current = true;
        }
      }
    };

    useEffect(() => {
      // Try to fit after first render
      const t = setTimeout(fitToWidth, 50);
      return () => clearTimeout(t);
    }, [visible, open]);

    // Pan/Zoom interactions (wheel zoom + drag pan + touch pinch)
    useEffect(() => {
      const attach = (scrollEl: HTMLDivElement | null) => {
        if (!scrollEl) return () => {};
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let touchMode: 'none' | 'drag' | 'pinch' = 'none';
        let lastDist = 0;
        let startZoom = 1;

        const onWheel = (e: WheelEvent) => {
          // Zoom when ctrl/cmd key held to avoid hijacking normal scroll
          if (!(e.ctrlKey || e.metaKey)) return;
          e.preventDefault();
          const rect = scrollEl.getBoundingClientRect();
          const inner = innerRef.current;
          if (!inner) return;
          const mouseX = e.clientX - rect.left + scrollEl.scrollLeft;
          const mouseY = e.clientY - rect.top + scrollEl.scrollTop;
          const contentX = mouseX / zoom;
          const contentY = mouseY / zoom;
          const delta = -e.deltaY; // up zooms in
          const factor = delta > 0 ? 1.1 : 0.9;
          const next = Math.min(3, Math.max(0.3, +(zoom * factor).toFixed(3)));
          setZoom(next);
          // keep cursor point stable
          const newScrollLeft = contentX * next - (e.clientX - rect.left);
          const newScrollTop = contentY * next - (e.clientY - rect.top);
          scrollEl.scrollLeft = Math.max(0, newScrollLeft);
          scrollEl.scrollTop = Math.max(0, newScrollTop);
        };

        const onMouseDown = (e: MouseEvent) => {
          if (e.button !== 0) return; // left only
          isDragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          scrollEl.style.cursor = 'grabbing';
        };
        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          scrollEl.scrollLeft -= dx;
          scrollEl.scrollTop -= dy;
        };
        const onMouseUp = () => {
          isDragging = false;
          scrollEl.style.cursor = '';
        };

        const dist = (t1: Touch, t2: Touch) => {
          const dx = t1.clientX - t2.clientX;
          const dy = t1.clientY - t2.clientY;
          return Math.hypot(dx, dy);
        };

        const center = (t1: Touch, t2: Touch) => ({
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        });

        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 1) {
            touchMode = 'drag';
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
          } else if (e.touches.length >= 2) {
            touchMode = 'pinch';
            lastDist = dist(e.touches[0], e.touches[1]);
            startZoom = zoom;
          }
        };

        const onTouchMove = (e: TouchEvent) => {
          if (touchMode === 'drag' && e.touches.length === 1) {
            e.preventDefault();
            const tx = e.touches[0].clientX;
            const ty = e.touches[0].clientY;
            scrollEl.scrollLeft -= (tx - lastX);
            scrollEl.scrollTop -= (ty - lastY);
            lastX = tx;
            lastY = ty;
          } else if (touchMode === 'pinch' && e.touches.length >= 2) {
            e.preventDefault();
            const d = dist(e.touches[0], e.touches[1]);
            if (lastDist === 0) return;
            const factor = d / lastDist;
            const rect = scrollEl.getBoundingClientRect();
            const c = center(e.touches[0], e.touches[1]);
            const focusX = c.x - rect.left + scrollEl.scrollLeft;
            const focusY = c.y - rect.top + scrollEl.scrollTop;
            const contentX = focusX / zoom;
            const contentY = focusY / zoom;
            const next = Math.min(3, Math.max(0.3, +(startZoom * factor).toFixed(3)));
            setZoom(next);
            scrollEl.scrollLeft = contentX * next - (c.x - rect.left);
            scrollEl.scrollTop = contentY * next - (c.y - rect.top);
          }
        };
        const onTouchEnd = () => {
          touchMode = 'none';
          lastDist = 0;
        };

        scrollEl.addEventListener('wheel', onWheel, { passive: false });
        scrollEl.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        scrollEl.addEventListener('touchstart', onTouchStart, { passive: false });
        scrollEl.addEventListener('touchmove', onTouchMove, { passive: false });
        scrollEl.addEventListener('touchend', onTouchEnd);
        scrollEl.addEventListener('touchcancel', onTouchEnd);

        return () => {
          scrollEl.removeEventListener('wheel', onWheel);
          scrollEl.removeEventListener('mousedown', onMouseDown);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          scrollEl.removeEventListener('touchstart', onTouchStart);
          scrollEl.removeEventListener('touchmove', onTouchMove);
          scrollEl.removeEventListener('touchend', onTouchEnd);
          scrollEl.removeEventListener('touchcancel', onTouchEnd);
        };
      };

      const detachMain = attach(scrollRef.current);
      const detachDialog = attach(dialogScrollRef.current);
      return () => {
        detachMain?.();
        detachDialog?.();
      };
    }, [zoom, visible, open]);

    const Toolbar = (
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-700 p-1 shadow">
        <button className="p-1 hover:text-blue-600" onClick={() => setZoom(z => Math.min(2.5, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="p-1 hover:text-blue-600" onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="p-1 hover:text-blue-600" onClick={() => setZoom(initialZoomRef.current)} aria-label="Reset zoom">
          <RefreshCcw className="w-4 h-4" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="p-1 hover:text-blue-600" aria-label="Full screen">
              <Maximize2 className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[min(1000px,95vw)] p-3 md:p-4">
            <DialogHeader>
              <DialogTitle>Diagram</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-700 p-1 shadow">
                <button className="p-1 hover:text-blue-600" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-blue-600" onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-blue-600" onClick={() => setZoom(1)} aria-label="Reset zoom">
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
              <div ref={dialogScrollRef} className="overflow-auto max-h-[80vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-w-max p-3">
                  {visible || open ? <Mermaid chart={code} /> : null}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );

    return (
      <div ref={containerRef} className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {Toolbar}
        <div ref={scrollRef} className="overflow-auto max-h-80 md:max-h-96 touch-pan-y touch-pan-x">
          <div ref={innerRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-w-max p-3">
            {visible ? <Mermaid chart={code} /> : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Loading diagram…</div>
            )}
          </div>
        </div>
      </div>
    );
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
  // Generate unique IDs per render (reset when content changes)
  const makeId = useMemo(() => createHeadingIdGenerator(), [content]);

  // Extract plain text from ReactMarkdown node/children for stable heading IDs
  const getPlainText = (node: any, children: any): string => {
    const parts: string[] = [];
    const walk = (n: any): void => {
      if (n == null) return;
      if (typeof n === 'string' || typeof n === 'number') {
        parts.push(String(n));
        return;
      }
      if (Array.isArray(n)) {
        n.forEach(walk);
        return;
      }
      if (typeof n === 'object') {
        if (typeof n.value === 'string' || typeof n.value === 'number') {
          parts.push(String(n.value));
        }
        if (n.children) {
          walk(n.children);
        }
      }
    };
    walk(children);
    if (parts.length === 0 && node) {
      walk(node);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };
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
          h1: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
              
            return (
              <h1 
                id={id}
                className="text-4xl md:text-5xl font-extrabold tracking-tight mt-12 mb-8 relative group scroll-mt-24"
                {...props}
              >
                <a href={`#${id}`} className="no-underline group-hover:underline">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-lime-500 to-sky-700 dark:from-teal-400 dark:to-blue-400">
                    {props.children}
                  </span>
                </a>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-lime-600 dark:from-teal-500 dark:to-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </h1>
            );
          },
          h2: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
              
            return (
              <h2 
                id={id}
                className="text-2xl md:text-3xl font-semibold mt-10 mb-4 pb-2 relative pl-6 border-b border-teal-300 dark:border-teal-700/50 scroll-mt-16"
                {...props}
              >
                <a href={`#${id}`} className="no-underline hover:underline">
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 dark:bg-gradient-to-b dark:from-teal-400 dark:to-blue-400 rounded-full"></span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-lime-500 dark:from-teal-300 dark:to-blue-300">
                    {props.children}
                  </span>
                </a>
              </h2>
            );
          },
          h3: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
              
            return (
              <h3 
              id={id}
              className="text-3xl md:text-2xl font-bold mt-12 mb-6 pt-2 relative pl-8 scroll-mt-20"
              {...props}
            >
              <a href={`#${id}`} className="no-underline hover:underline">
                <span className="absolute left-0 top-1/2 -translate-y-1/3 w-6 h-6 rounded-full bg-teal-400/50 dark:bg-teal-900/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-lime-500 dark:from-teal-400 dark:to-blue-400/80">
                  {props.children}
                </span>
              </a>
              </h3>
            );
          },
          h4: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
            
            return (
              <h4 
                id={id}
                className="text-xl md:text-xl font-semibold mt-8 mb-3 pl-4 relative scroll-mt-16"
                {...props}
              >
                <a href={`#${id}`} className="no-underline hover:underline">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                    {props.children}
                  </span>
                </a>
              </h4>
            );
          },
          h5: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
            
            return (
              <h5 
                id={id}
                className="text-lg md:text-xl font-medium mt-6 mb-2 pl-2 relative text-teal-600 dark:text-gray-300 scroll-mt-16"
                {...props}
              >
                <a href={`#${id}`} className="no-underline hover:underline">
                  {props.children}
                </a>
              </h5>
            );
          },
          h6: ({node, ...props}) => {
            const text = getPlainText(node, props.children);
            const id = makeId(text);
            
            return (
              <h6 
                id={id}
                className="text-base font-medium mt-4 mb-2 pl-2 text-teal-500 dark:text-gray-400 scroll-mt-16"
                {...props}
              >
                <a href={`#${id}`} className="no-underline hover:underline">
                  {props.children}
                </a>
              </h6>
            );
          },
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
              className="list-decimal pl-6 my-4 space-y-2 [&>li]:relative [&>li]:pl-2 [&>li]:marker:font-semibold [&>li]:marker:text-teal-400 [&>li]:marker:dark:text-teal-300" 
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
            <blockquote className="border-l-4 border-lime-400 dark:border-teal-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300 bg-teal-50 dark:bg-teal-700/10 px-4 py-2 rounded-r" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-teal-300 dark:border-teal-700/50 shadow-sm">
              <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-700" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-teal-50 dark:bg-teal-900/20 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-gray-400/50 dark:divide-gray-700/50" {...props} />
          ),
          th: (props) => (
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-lime-700 dark:text-teal-300  border-b border-teal-300 dark:border-teal-700 uppercase tracking-wider"
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
              className="hover:bg-teal-400/10 dark:hover:bg-gray-800/30 transition-colors duration-150"
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
