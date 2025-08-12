import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { createHeadingIdGenerator } from '@/lib/markdownUtils';

interface MarkdownServerProps {
  content: string;
  className?: string;
}

// Server-rendered Markdown for SEO (no client hooks, no heavy libs)
export default function MarkdownServer({ content, className = '' }: MarkdownServerProps) {
  const makeId = createHeadingIdGenerator();

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
        if ((n as any).children) {
          walk((n as any).children);
        }
      }
    };
    walk(children);
    if (parts.length === 0 && node) {
      walk(node);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h1 id={id} {...props} />;
          },
          h2: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h2 id={id} {...props} />;
          },
          h3: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h3 id={id} {...props} />;
          },
          h4: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h4 id={id} {...props} />;
          },
          h5: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h5 id={id} {...props} />;
          },
          h6: ({node, ...props}) => {
            const id = makeId(getPlainText(node, props.children));
            return <h6 id={id} {...props} />;
          },
          code: ({inline, className, children, ...props}) => {
            if (inline) return <code className={className} {...props}>{children}</code>;
            // Render pre/code without client-side highlighter for SSR
            return (
              <pre>
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
          img: ({alt, ...imgProps}) => (
            <img alt={alt || 'Image'} loading="lazy" {...imgProps} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


