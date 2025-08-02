'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from markdown content, excluding code blocks and inline code
  useEffect(() => {
    // First, remove all code blocks (```code```) from the content
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    // Then remove all inline code (`code`) from the content
    const contentWithoutCode = contentWithoutCodeBlocks.replace(/`[^`]+`/g, '');
    
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const matches = Array.from(contentWithoutCode.matchAll(regex));
    
    const extractedHeadings = matches
      .map((match) => {
        const level = match[1].length; // Number of # characters
        let text = match[2].trim();
        
        // Remove any remaining code-like patterns that might have been missed
        text = text.replace(/`/g, '');
        
        // Skip if the text is empty after cleaning
        if (!text) return null;
        
        // Create URL-friendly ID by converting to lowercase, replacing spaces with hyphens, and removing special chars
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
          
        return { id, text, level };
      })
      .filter(Boolean) as Heading[]; // Filter out any null entries
    
    setHeadings(extractedHeadings);
  }, [content]);

  // Set active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%', threshold: 0.1 }
    );

    // Observe all headings
    const elements = headings.map(({ id }) => document.getElementById(id));
    elements.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className={cn('sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4', className)}>
      <div className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">
        Table of Contents
      </div>
      <nav className="space-y-2 border-l-2 border-primary/20 pl-4">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              'group flex items-center py-2 text-sm transition-all duration-200 hover:text-foreground hover:pl-2',
              heading.level === 1 ? 'pl-3' : 'pl-5',
              activeId === heading.id
                ? 'text-foreground font-semibold scale-[1.02]'
                : 'text-muted-foreground',
              'relative rounded-lg hover:bg-accent/50 px-2 -ml-2'
            )}
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 mr-2 flex-shrink-0 transition-transform',
                activeId === heading.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                activeId === heading.id ? 'scale-100' : 'scale-0 group-hover:scale-100'
              )}
            />
            <span className="truncate">{heading.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
