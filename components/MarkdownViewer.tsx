'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { ReactNode, AnchorHTMLAttributes, HTMLAttributes } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Custom components for better styling
interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  node?: unknown;
  children: ReactNode;
}

const CustomLink = ({ node, children, ...props }: CustomLinkProps) => (
  <a 
    {...props} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-400 hover:text-blue-300 underline"
  >
    {children}
  </a>
);

interface CustomCodeProps extends HTMLAttributes<HTMLElement> {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

const CustomCode = ({ 
  node, 
  inline = false, 
  className = '', 
  children, 
  ...props 
}: CustomCodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (inline) {
    return (
      <code className={`bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono ${className}`} {...props}>
        {children}
      </code>
    );
  }

  if (!match) {
    return (
      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4">
        <code className="text-sm font-mono" {...props}>
          {children}
        </code>
      </pre>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-gray-300 text-xs px-4 py-2 font-mono">
        {match[1]}
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        className="!m-0 rounded-b-lg"
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: '#1e1e1e',
          fontSize: '0.9em',
          lineHeight: 1.5,
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          code: CustomCode,
          a: CustomLink,
          h1: (props) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
          ),
          p: (props) => (
            <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
          ),
          ul: (props) => (
            <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
          ),
          li: (props) => (
            <li className="my-1" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-gray-800/50" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-gray-700" {...props} />
          ),
          th: (props) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200" {...props} />
          ),
          td: (props) => (
            <td className="px-4 py-3 text-sm text-gray-300" {...props} />
          ),
          tr: (props) => (
            <tr className="hover:bg-gray-800/30 transition-colors" {...props} />
          ),
          img: (props) => (
            <div className="my-6">
              <img 
                {...props} 
                className="rounded-lg shadow-lg w-full max-w-full h-auto"
                alt={props.alt || 'Image'}
                loading="lazy"
              />
              {props.alt && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {props.alt}
                </p>
              )}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
