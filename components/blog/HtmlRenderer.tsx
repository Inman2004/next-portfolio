'use client';

import React, { useEffect, useRef } from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import mermaid from 'mermaid';

interface HtmlRendererProps {
  content: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Syntax highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });

      // Mermaid diagrams
      const mermaidElements = contentRef.current.querySelectorAll('pre > code.language-mermaid');
      mermaidElements.forEach((element, index) => {
        const id = `mermaid-diagram-${index}`;
        const code = element.textContent || '';
        const preElement = element.parentElement;
        if (preElement) {
          try {
            const svg = mermaid.render(id, code);
            preElement.innerHTML = svg;
          } catch (error) {
            console.error('Error rendering Mermaid diagram:', error);
          }
        }
      });
    }
  }, [content]);

  return <div ref={contentRef} dangerouslySetInnerHTML={{ __html: content }} />;
};

export default HtmlRenderer;